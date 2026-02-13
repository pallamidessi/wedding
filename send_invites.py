#!/usr/bin/env python3
"""
Send personalized wedding emails from a Google Sheet using Gmail API.

Expected columns in your sheet:
  - email (required)
  - name (optional)
  - status (optional, rows with "sent" are skipped)
  - sent_at (optional, updated after successful send)
"""

from __future__ import annotations

import argparse
import base64
import datetime as dt
import pathlib
import re
import sys
from email.mime.text import MIMEText
from typing import Dict, List, Optional

import gspread
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

SCOPES = [
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/spreadsheets",
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Send personalized emails from Google Sheets via Gmail."
    )
    parser.add_argument("--spreadsheet-id", required=True, help="Google Spreadsheet ID.")
    parser.add_argument(
        "--worksheet",
        default="Sheet1",
        help='Worksheet/tab name. Default: "Sheet1".',
    )
    parser.add_argument("--subject", required=True, help="Email subject.")
    parser.add_argument(
        "--template",
        default="templates/email_template.txt",
        help="Path to email template file.",
    )
    parser.add_argument(
        "--credentials",
        default="credentials.json",
        help="Google OAuth client JSON file.",
    )
    parser.add_argument(
        "--token",
        default="token.json",
        help="OAuth token cache JSON file.",
    )
    parser.add_argument(
        "--sender-name",
        default="Bea & Joseph",
        help='Displayed sender name in email "From".',
    )
    parser.add_argument(
        "--max-emails",
        type=int,
        default=0,
        help="Optional cap for number of emails to send (0 = no cap).",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print who would receive emails without actually sending.",
    )
    return parser.parse_args()


def load_credentials(credentials_path: pathlib.Path, token_path: pathlib.Path) -> Credentials:
    creds: Optional[Credentials] = None
    if token_path.exists():
        creds = Credentials.from_authorized_user_file(str(token_path), SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(str(credentials_path), SCOPES)
            creds = flow.run_local_server(port=0)
        token_path.write_text(creds.to_json(), encoding="utf-8")

    return creds


def normalize_header(header: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", header.strip().lower()).strip("_")


def read_rows(worksheet: gspread.Worksheet) -> List[Dict[str, str]]:
    values = worksheet.get_all_values()
    if not values:
        return []

    headers = [normalize_header(h) for h in values[0]]
    rows: List[Dict[str, str]] = []
    for idx, row in enumerate(values[1:], start=2):
        padded = row + [""] * (len(headers) - len(row))
        row_dict = {headers[i]: padded[i].strip() for i in range(len(headers))}
        row_dict["_row_number"] = str(idx)
        rows.append(row_dict)
    return rows


def build_email_html(template: str, guest: Dict[str, str]) -> str:
    name = guest.get("name") or "there"
    first_name = name.split()[0] if name.strip() else "there"
    return template.format(name=name, first_name=first_name, email=guest.get("email", ""))


def create_gmail_message(
    to_email: str, subject: str, html_body: str, sender_name: str
) -> Dict[str, str]:
    message = MIMEText(html_body, "html")
    message["to"] = to_email
    message["subject"] = subject
    message["from"] = f"{sender_name} <me>"
    encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode("utf-8")
    return {"raw": encoded_message}


def update_status_columns(
    worksheet: gspread.Worksheet,
    row_number: int,
    headers: List[str],
    status_value: str,
    sent_at_value: str,
) -> None:
    status_col = headers.index("status") + 1 if "status" in headers else None
    sent_col = headers.index("sent_at") + 1 if "sent_at" in headers else None

    if status_col:
        worksheet.update_cell(row_number, status_col, status_value)
    if sent_col:
        worksheet.update_cell(row_number, sent_col, sent_at_value)


def main() -> int:
    args = parse_args()
    credentials_path = pathlib.Path(args.credentials)
    token_path = pathlib.Path(args.token)
    template_path = pathlib.Path(args.template)

    if not credentials_path.exists():
        print(f"ERROR: credentials file not found: {credentials_path}")
        return 1
    if not template_path.exists():
        print(f"ERROR: template file not found: {template_path}")
        return 1

    template_text = template_path.read_text(encoding="utf-8")
    creds = load_credentials(credentials_path, token_path)
    gmail = build("gmail", "v1", credentials=creds)
    gs_client = gspread.authorize(creds)

    sheet = gs_client.open_by_key(args.spreadsheet_id)
    worksheet = sheet.worksheet(args.worksheet)
    raw_values = worksheet.get_all_values()
    if not raw_values:
        print("No data found in worksheet.")
        return 0

    headers = [normalize_header(h) for h in raw_values[0]]
    if "email" not in headers:
        print('ERROR: worksheet must include an "email" column.')
        return 1

    rows = read_rows(worksheet)
    sent_count = 0
    skipped_count = 0

    for guest in rows:
        email = guest.get("email", "").strip()
        status = guest.get("status", "").strip().lower()

        if not email:
            skipped_count += 1
            continue
        if status == "sent":
            skipped_count += 1
            continue
        if args.max_emails and sent_count >= args.max_emails:
            break

        html_body = build_email_html(template_text, guest)
        if args.dry_run:
            print(f"[DRY RUN] Would send to: {email}")
            sent_count += 1
            continue

        message = create_gmail_message(
            to_email=email,
            subject=args.subject,
            html_body=html_body,
            sender_name=args.sender_name,
        )
        gmail.users().messages().send(userId="me", body=message).execute()

        now = dt.datetime.now().isoformat(timespec="seconds")
        update_status_columns(
            worksheet=worksheet,
            row_number=int(guest["_row_number"]),
            headers=headers,
            status_value="sent",
            sent_at_value=now,
        )

        sent_count += 1
        print(f"Sent to: {email}")

    print(f"Done. Sent: {sent_count}, Skipped: {skipped_count}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
