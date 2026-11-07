# Cliff’s VA Workspace — Start here

A complete source project in the ivory-and-emerald style of the approved concept. The layout adapts to desktop, tablet and mobile. Page changes, cards, buttons and modals use short, subtle transitions. Reduced-motion preferences turn animations off.

## What works without external accounts

- Private single-owner account with email/password login, password visibility, logout and password change.
- Server-side SQLite persistence; data survives refresh and server restart when the data disk is retained.
- Dashboard with real totals, priorities, agenda, tracked-hour chart and connected-app status.
- Clients and projects: contact details, project name, instructions, status, task progress and client workspace view.
- Task board: four statuses, priority, due date, notes, client filters, edit and delete.
- Follow-up Center: waiting-for-client work and overdue tasks.
- Start My Day: priorities, meetings and reusable daily checklist.
- Calendar: monthly navigation, local meetings, notes, link/venue and timezone display.
- Time tracker: start, pause, resume and save; one server-side timer prevents duplicate sessions across windows.
- Manual time entries, editable timesheet and CSV export.
- Finish My Day: editable daily report built from today’s completed tasks, pending work, waiting items and logged hours.
- Daily report previews, TXT export and browser print/save as PDF.
- Reusable email templates/SOPs, copy text, file/app shortcuts and a daily resetting checklist.
- Personal profile, working hours, timezone, work history and workspace JSON export.
- Sample records are optional, labelled, and only offered in an empty workspace.

## External connections included in source

These features need YOUR credentials and consent before they can operate. No Google or AI account is connected in the delivered ZIP.

- Gmail: latest 15 inbox message previews, open full message in Gmail, create task from email, AI draft/summary, compose/send with explicit review and confirmation, saved workspace email drafts.
- Google Calendar: upcoming events and creation of an event in your primary Google calendar.
- Google Drive: list 30 files, open files, save file links in your workspace. File bytes are not uploaded into this app.
- Google Sheets: read a specified range and append JSON rows after confirmation. This is not a full spreadsheet editor.
- AI Assistant: OpenAI Responses API for drafts, summaries and meeting action suggestions. Only text explicitly submitted is sent. No ChatGPT account login/history import. API usage is billed separately.
- Other apps: HTTPS shortcuts only. New service integrations require additional development.

## 1. Run it on your Windows PC

1. Install **Node.js 24 or newer** from https://nodejs.org/ .
2. Extract this ZIP. Open the `va-workspace` folder.
3. Copy `.env.example` to a new file named `.env` (not `.env.txt`).
4. Open a terminal in that folder.
5. Run this once to generate an encryption key:

   `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

6. Put the generated 64-character value after `ENCRYPTION_KEY=` in `.env`. Keep this key private and retain it permanently. Changing it makes stored connection tokens unreadable.
7. Replace `SETUP_CODE` with your own long, private code. The placeholder is deliberately rejected.
8. Leave `APP_URL=http://localhost:3000` for local use.
9. Run `npm start`. No npm dependency installation is needed.
10. Open http://localhost:3000 . Create your account using your name, email, password (at least 12 characters), and private setup code.
11. Add your clients and tasks, or choose **Load sample data** to explore.

Only the first owner can register. Subsequent visits show Sign in. No email verification or password-reset email is provided. Keep your password safe. Recovery requires an administrator-assisted reset; do not delete the data folder to reset a password because that would delete your records.

## 2. Upload to your GitHub repository

The ZIP contains the project folder. Upload the CONTENTS of `va-workspace` to your repository root: `public/`, `tests/`, `server.mjs`, `package.json`, `.env.example`, `.gitignore`, `Dockerfile`, and these guides.

**Never upload `.env`, `data/`, passwords, API keys, or Google client secrets.** The supplied `.gitignore` excludes private runtime files when using Git.

Using Git from the extracted project directory:

```
git init
git add .
git commit -m "Build VA workspace with clients, tasks and integrations"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

If the repository already has files, pull/clone it first and merge carefully rather than overwriting existing work. The project is maintained in https://github.com/mckenzieramen/Trackervasystem . The repository includes the source and safe environment template; live credentials belong only on your server.

## 3. Host it online

**GitHub stores the code; GitHub Pages cannot run this Node.js/SQLite backend.** Deploy the repository to a Node.js 24 host or a Docker host with a persistent disk.

- Start command: `npm start`
- Set `HOST=0.0.0.0` on the hosting service.
- Use the host’s assigned `PORT`.
- Set `APP_URL=https://your-actual-domain` exactly (no trailing slash).
- Set a private `SETUP_CODE` and permanent `ENCRYPTION_KEY` as host environment secrets.
- Set `DATA_DIR` to your mounted persistent disk directory, e.g. `/data`.
- Use HTTPS. The app sets Secure cookies when APP_URL uses HTTPS.
- Run a single application instance with its own SQLite disk. Do not use ephemeral/serverless storage or multiple independent replicas for the same database.
- Back up the persistent disk regularly. JSON export is a readable records export, not an automatic restore facility. For a consistent full backup, stop the app briefly and copy the entire data directory, then restart it. Also retain your encryption key separately.

Docker example after configuring your environment:

```
docker build -t va-workspace .
docker run --env-file .env -e HOST=0.0.0.0 -e DATA_DIR=/data -p 3000:3000 -v va-workspace-data:/data va-workspace
```

For public access, terminate HTTPS at your hosting service/reverse proxy and set APP_URL to that HTTPS URL. Keep `.env` out of the Docker image; `.dockerignore` is included.

## 4. Enable Google account connections

1. Open https://console.cloud.google.com/ and create/select your own project.
2. Enable Gmail API, Google Calendar API, Google Drive API and Google Sheets API.
3. Configure OAuth branding, audience and consent. In testing, add your own Google email as a test user.
4. Create an OAuth **Web application** client.
5. Add this exact authorized redirect URI for local testing:

   `http://localhost:3000/auth/google/callback`

   For online hosting also add:

   `https://your-actual-domain/auth/google/callback`

6. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in your server environment. Retain ENCRYPTION_KEY. Restart the server.
7. In the app, open **Connected Apps** and select **Connect account** for the service you want.
8. Choose your account on Google’s official website and review the requested access. You never enter your Google password in this app.
9. Connect each service you want to use. The source requests only that service’s required scopes, along with account identity/email.

Gmail access involves sensitive/restricted scopes. Google consent verification, policies and testing restrictions can affect availability. Do not assume a newly created OAuth app can be offered to arbitrary public users. Review Google’s current requirements before external distribution.

Refresh tokens are encrypted at rest with AES-256-GCM. Disconnect asks Google to revoke access. Google may revoke all grants for the OAuth app, so the UI clears Google connection states and you may need to reconnect other services. Reconnecting is also required after changing your encryption key or revoking access in Google Account settings.

## 5. Enable the AI Assistant

1. Create an API key in your own OpenAI API account: https://platform.openai.com/api-keys .
2. Set `OPENAI_API_KEY` only on the server.
3. Set `OPENAI_MODEL` to a Responses API-compatible model available to your API project. The example uses `gpt-4.1-mini`; change it if needed.
4. Restart the app. Connected Apps will show the assistant as ready.
5. Submit a request from AI Assistant or explicitly choose an AI action on an email preview.

The API key stays on the server. The app submits `store:false`, but that does not replace the provider’s data-handling policies. Do not paste passwords or confidential data without authorization. AI cannot send emails, change tasks or edit files automatically; you review and perform those actions separately.

## 6. Checks

Run `npm run check` and `npm test`.

The automated integration test uses a temporary database and covers account creation/login, session access, request-origin/CSRF protection, data validation, record updates, optimistic version conflicts, idempotent submissions, timer concurrency, unavailable integrations, profile update, deletion, logout and persisted records after login.

External Google OAuth and OpenAI requests require your own live configuration and were not exercised against your accounts. Do not treat configuration readiness as a confirmed successful external API call.

## Practical limits

- Single-owner workspace, not a multi-user SaaS or client login portal.
- Calendar reminders are shown inside the open app. No background/push/email scheduler is included.
- Calendar edit inputs use the device’s timezone; the app labels this explicitly. Calendar display uses your profile timezone.
- Gmail displays snippets, not full HTML message bodies. Replies are sent as newly composed messages with Re: subjects; Gmail thread linking is not implemented.
- Saved drafts are workspace drafts, not synchronized Gmail Drafts. File resources are links, not uploads.
- No recurring tasks, automatic report delivery, two-way background sync, offline writes or automated JSON restore.
- Screen layout follows the concept’s visual system and feature arrangement; it is a responsive working implementation rather than a pixel-for-pixel copy of an illustrative image.

Official references: https://developers.google.com/identity/protocols/oauth2/web-server and https://developers.openai.com/api/reference/resources/responses .
