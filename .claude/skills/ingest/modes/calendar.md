# Calendar Mode

When the user says "calendar", "scan calendar", or similar.

## Step 0 — Dedup check

Check if `data/meeting-notes/{date}-calendar-meetings.md` already exists. If yes, print:
"Already ingested today ({N} meetings). Re-run? [y/N]" and wait for confirmation.
Skip re-fetching calendar and GDocs if user declines.

## Step 1 — Calendar scan (filter early)

Call `mcp__gws__calendar_events_list` for today. Immediately filter for events that have `attachments` with `mimeType: application/vnd.google-apps.document`. Skip events without Gemini Notes — do not classify or process them.

## Step 1.5 — Cross-reference Gemini Notes emails

Some Google Meet recordings deliver notes only via email (from `gemini-notes@google.com`), not as calendar attachments. For meetings found in Step 1 that have NO attachment:

1. Call `mcp__gws__gmail_users_messages_list` with query:
   ```
   from:gemini-notes@google.com after:{date} before:{date+1}
   ```
2. For each email, call `mcp__gws__gmail_users_messages_get` and parse:
   - **Meeting time** from subject: "Notes from meeting {date} at {time}"
   - **GDoc ID** from body: regex `docs.google.com/document/d/([^/]+)/edit`
3. Match emails to calendar events by time proximity (+-30 min of event start)
4. Add matched GDoc IDs to the events list for Step 2 processing
5. Dedup: if a calendar event already has an attachment with the same GDoc ID, skip the email match

Events with neither attachment nor email match remain "No Notes Available".

## Step 1.7 — Auto-capture attendee emails

Calendar event metadata includes attendee email addresses. For each event being processed:

1. Extract `attendees[].email` and `attendees[].displayName` from the calendar event
2. Read `.claude/skills/config/config/contacts.yaml`
3. For each attendee with an email that matches a contact with `email: null`:
   - Match by display [[workspace/stakeholders/stakeholder-map.md|name]] or alias (case-insensitive, Korean name matching)
   - Update the contact's `email` field in `contacts.yaml`
   - Print: `[contacts] Updated: {name} -> {email}`
4. For attendees not in contacts.yaml at all, skip (don't auto-add unknown people)

This progressively fills in null emails from real meeting data — no manual entry needed.

## Step 2 — Fetch notes as plain text (NOT GDocs JSON)

For each Gemini Notes attachment, use `mcp__gws__drive_files_export` with `mimeType: text/plain`:
```
mcp__gws__drive_files_export(params={fileId: "<id>", mimeType: "text/plain"})
```
This returns clean text (~16K per doc). Do NOT use `docs_documents_get` — it returns 124K+ of JSON with formatting metadata that must be parsed, wasting 20x+ tokens.

## Step 2.5 — Resolve SPEAKER_N aliases

Gemini Notes often anonymize speakers as SPEAKER_1, SPEAKER_2, etc. Before consolidation, resolve these to real names:

1. **Get attendees from calendar event**: The calendar event metadata from Step 1 includes the attendee list. Extract display names.
2. **Check attendee count**:
   - **>=3 attendees**: Attempt automatic resolution by matching SPEAKER_N speech patterns against known attendee roles (from `workspace/stakeholders/stakeholder-map.md`). For each SPEAKER_N, show the best-guess [[workspace/stakeholders/stakeholder-map.md|name]] and a sample quote.
   - **<=2 attendees (or Jay-only)**: Jay likely joined solo from his laptop. Use `AskUserQuestion` to ask:
     ```
     This meeting has [N] attendees on calendar: [names].
     The notes contain SPEAKER_1, SPEAKER_2, etc.

     SPEAKER_1 says: "[sample quote ~50 chars]"
     SPEAKER_2 says: "[sample quote ~50 chars]"

     Who are they? (e.g. "1=Steve Stoddard, 2=Minhyuck Lee", or "skip")
     ```
3. **Apply replacements**: Replace all SPEAKER_N -> confirmed names in the exported text before consolidation.
4. **Record source**: Add `participants_source: calendar | user_confirmed | inferred` to the meeting frontmatter for traceability.

If user responds "skip", leave SPEAKER_N as-is and proceed.

## Step 3 — Consolidate

Combine exported text into `data/meeting-notes/{date}-calendar-meetings.md` with meeting headers (title, time, attendees from calendar event metadata).

## Step 4 — Run standard Phase 1-4 pipeline on the consolidated file.

## Step 5 — Print the Ingestion Summary Report (must include "Meetings Ingested" table).
