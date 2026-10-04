/**
 * Creates the RSVP Google Form for Beatrice & Joseph's wedding,
 * plus a linked Google Sheet that collects the responses.
 *
 * How to use:
 *   1. Go to https://script.google.com and click "New project".
 *   2. Replace the contents of Code.gs with this file.
 *   3. Click Run (function: createRsvpForm) and accept the permissions.
 *   4. Open View > Logs (or the Execution log): it prints the form's
 *      edit link, public link and the responses spreadsheet.
 *
 * Running it again creates a brand new form, so only run it once
 * (or delete the previous form first).
 */

var EVENTS = [
  "Thursday 29 April: the Groom's walking tour of Strasbourg",
  "Friday 30 April: civil ceremony at the Mairie de Strasbourg & vin d'honneur",
  "Saturday 1 May: symbolic ceremony at Château de Mairy",
  "Sunday 2 May: post-wedding lunch & Champagne cellar tour in Châlons-en-Champagne",
];

function createRsvpForm() {
  var form = FormApp.create("Beatrice & Joseph: RSVP");

  form
    .setTitle("Beatrice & Joseph: RSVP")
    .setDescription(
      "We are so excited to celebrate with you in France!\n\n" +
        "Our symbolic ceremony is on Saturday 1st May 2027 at Château de Mairy, Champagne, " +
        "and our celebrations span four days. The other days are optional, so please " +
        "let us know which ones you'd like to join.\n\n" +
        "One response per invitation is perfect: you can add everyone in your party below."
    )
    .setCollectEmail(false)
    .setAllowResponseEdits(true)
    .setProgressBar(true)
    .setConfirmationMessage(
      "Merci! Your RSVP has been received. We can't wait to celebrate with you. " +
        "If anything changes, you can edit your response using the link below, " +
        "or just get in touch with us."
    );

  // ---------------------------------------------------------------
  // Page 1: About you
  // ---------------------------------------------------------------
  form.addSectionHeaderItem().setTitle("About you");

  form.addTextItem().setTitle("First name").setRequired(true);
  form.addTextItem().setTitle("Surname").setRequired(true);

  var emailValidation = FormApp.createTextValidation()
    .requireTextIsEmail()
    .setHelpText("Please enter a valid email address.")
    .build();
  form
    .addTextItem()
    .setTitle("Email address")
    .setHelpText("We'll use this to send you updates about the wedding.")
    .setValidation(emailValidation)
    .setRequired(true);

  form
    .addTextItem()
    .setTitle("Phone / WhatsApp number")
    .setHelpText("Optional, but handy for coordinating shuttles on the day.");

  var attending = form
    .addMultipleChoiceItem()
    .setTitle("Will you be joining us?")
    .setRequired(true);

  // ---------------------------------------------------------------
  // Page 2: Your party
  // ---------------------------------------------------------------
  var partyPage = form
    .addPageBreakItem()
    .setTitle("Your party")
    .setHelpText(
      "If your invitation includes other people (partner, family, children named on " +
        "your invitation), you can RSVP for them here."
    );

  form
    .addListItem()
    .setTitle("How many additional guests are you RSVPing for?")
    .setChoiceValues(["0 (just me)", "1", "2", "3", "4", "5", "6"])
    .setRequired(true);

  form
    .addParagraphTextItem()
    .setTitle("Full names of your additional guests")
    .setHelpText(
      "One per line. For children, please add their age. " +
        "If they'll attend different events than you, mention it here too."
    );

  // ---------------------------------------------------------------
  // Page 3: Celebrations
  // ---------------------------------------------------------------
  form
    .addPageBreakItem()
    .setTitle("Celebrations")
    .setHelpText("Tick everything you (and your party) would like to attend.");

  form
    .addCheckboxItem()
    .setTitle("Which celebrations will you attend?")
    .setChoiceValues(EVENTS)
    .setRequired(true);

  form
    .addMultipleChoiceItem()
    .setTitle("Did you receive a croissant with your invitation?")
    .setHelpText(
      "A croissant means a room is reserved for you at Château de Mairy for two nights " +
        "(check in Friday 30 April from 19:00, check out Sunday 2 May at 12:00)."
    )
    .setChoiceValues([
      "Yes, and I'll be staying at the Château",
      "Yes, but I won't need the room (it can go to someone else)",
      "No croissant",
    ])
    .setRequired(true);

  // ---------------------------------------------------------------
  // Page 4: Travel & shuttle
  // ---------------------------------------------------------------
  form
    .addPageBreakItem()
    .setTitle("Travel & shuttle")
    .setHelpText(
      "We're running shuttles from Châlons-en-Champagne train station. " +
        "Please let us know by 1st April if you'd like a seat."
    );

  form
    .addCheckboxItem()
    .setTitle("Would you like a seat on a shuttle?")
    .setChoiceValues([
      "Friday evening: Châlons-en-Champagne station to Mairy-sur-Marne / the Château",
      "Saturday 12:15: Châlons-en-Champagne station to the venue",
      "Saturday 13:00: Châlons-en-Champagne station to the venue",
      "No thanks, I'll make my own way",
    ])
    .setRequired(true);

  form
    .addParagraphTextItem()
    .setTitle("Approximate arrival time and destination")
    .setHelpText(
      "e.g. \"Arriving at Châlons station around 18:40 on Friday, staying in Mairy-sur-Marne\"."
    );

  form
    .addMultipleChoiceItem()
    .setTitle("Where are you planning to stay in Champagne?")
    .setChoiceValues([
      "Château de Mairy",
      "Mairy-sur-Marne (village)",
      "Châlons-en-Champagne",
      "The gîte in Pogny",
      "Reims",
      "Not sure yet",
    ])
    .showOtherOption(true);

  // ---------------------------------------------------------------
  // Page 5: Food & anything else
  // ---------------------------------------------------------------
  form.addPageBreakItem().setTitle("Food & anything else");

  form
    .addCheckboxItem()
    .setTitle("Dietary requirements")
    .setHelpText("For you and anyone in your party.")
    .setChoiceValues([
      "No dietary requirements",
      "Vegetarian",
      "Vegan",
      "Pescatarian",
      "Gluten-free / coeliac",
      "Dairy-free / lactose intolerant",
      "Nut allergy",
      "Shellfish allergy",
      "No alcohol",
    ])
    .showOtherOption(true)
    .setRequired(true);

  form
    .addParagraphTextItem()
    .setTitle("Details about allergies or dietary needs")
    .setHelpText("Who it applies to, and how severe (e.g. trace amounts OK or not).");

  form
    .addParagraphTextItem()
    .setTitle("Do you need any additional help?")
    .setHelpText(
      "Accessibility or mobility needs, help planning trains or travel, " +
        "a high chair or cot for little ones, anything at all."
    );

  form
    .addParagraphTextItem()
    .setTitle("Song request")
    .setHelpText("What will get you on the dance floor?");

  form.addParagraphTextItem().setTitle("A message for the couple");

  // ---------------------------------------------------------------
  // Page 6 (decline path only)
  // ---------------------------------------------------------------
  var declinePage = form
    .addPageBreakItem()
    .setTitle("We'll miss you!")
    .setHelpText(
      "Thank you for letting us know. If you'd like, leave us a message below."
    );
  // Anyone reaching this page by finishing page 5 submits instead of seeing it.
  declinePage.setGoToPage(FormApp.PageNavigationType.SUBMIT);

  form.addParagraphTextItem().setTitle("A message for the couple (optional)");

  // Branching on page 1
  attending.setChoices([
    attending.createChoice("Joyfully accepts", partyPage),
    attending.createChoice("Regretfully declines", declinePage),
  ]);

  // ---------------------------------------------------------------
  // Responses spreadsheet
  // ---------------------------------------------------------------
  var sheet = SpreadsheetApp.create("Beatrice & Joseph: RSVP responses");
  form.setDestination(FormApp.DestinationType.SPREADSHEET, sheet.getId());

  Logger.log("Edit the form:       " + form.getEditUrl());
  Logger.log("Share with guests:   " + form.getPublishedUrl());
  Logger.log("Short link:          " + form.shortenFormUrl(form.getPublishedUrl()));
  Logger.log("Responses (Sheet):   " + sheet.getUrl());
}
