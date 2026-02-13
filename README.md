# Wedding Website + Guest Email Automation

This project gives you:

- A static wedding website (`index.html`, `styles.css`, `script.js`)
- A Python script to send personalized invites from Google Sheets through your Gmail account (`send_invites.py`)

## 1) Website

### Pages/sections included

- Landing page
- How to get there
- Timeline of events
- Contact
- RSVP button (Google Forms link)

### Customize content

Edit these files:

- `index.html` for text, dates, location, contact info, and RSVP URL
- `styles.css` for colors/layout
- `script.js` for mobile menu and smooth scrolling behavior

Replace all occurrences of:

`https://forms.gle/REPLACE_WITH_YOUR_FORM_ID`

with your real Google Form URL.

### Preview locally

From project root:

```bash
python3 -m http.server 8000
```

Open:

`http://localhost:8000`

## 2) Guest email sender (Python + Google Sheets + Gmail)

## Setup

### A. Create your Python env

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### B. Google Cloud configuration

1. Go to Google Cloud Console.
2. Create/select a project.
3. Enable APIs:
   - Gmail API
   - Google Sheets API
4. Configure OAuth consent screen.
5. Create OAuth Client ID credentials (`Desktop app` type).
6. Download JSON and save it in this folder as:

`credentials.json`

### C. Prepare your Google Sheet

Create a sheet with headers (first row):

- `email` (required)
- `name` (optional)
- `status` (optional, rows with `sent` are skipped)
- `sent_at` (optional, gets updated automatically)

## Get your spreadsheet ID

Given a URL like:

`https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit#gid=0`

use the `SPREADSHEET_ID` part.

## First test (dry run)

```bash
python send_invites.py \
  --spreadsheet-id "YOUR_SPREADSHEET_ID" \
  --worksheet "Sheet1" \
  --subject "You're invited to our wedding!" \
  --dry-run
```

On first real/auth run, browser OAuth opens and `token.json` is created.

## Send real emails

```bash
python send_invites.py \
  --spreadsheet-id "YOUR_SPREADSHEET_ID" \
  --worksheet "Sheet1" \
  --subject "You're invited to our wedding!"
```

Optional controls:

- `--max-emails 20` (send in batches)
- `--template templates/email_template.txt` (custom HTML template)
- `--sender-name "Bea & Joseph"`

## Template variables

In `templates/email_template.txt` you can use:

- `{name}`
- `{first_name}`
- `{email}`

## Suggested workflow

1. Update website + Google Form link.
2. Fill guest sheet.
3. Run `--dry-run`.
4. Send a small batch with `--max-emails 5`.
5. Send all.

## Notes

- This is a static site; host on GitHub Pages, Netlify, or Vercel static hosting.
- Keep `credentials.json` and `token.json` private (never share them).
