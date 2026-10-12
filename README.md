# Shree Shantinath Enterprises website

Responsive React company website served by Express. Enquiries are validated,
stored in PostgreSQL in `sse_jlr`, and sent to the configured contact address
using the Resend email API. Safety pages and the private letterhead manager
continue to use server-rendered EJS.

## Requirements

- Node.js 18 or newer
- PostgreSQL with a database available to the configured user
- A Resend account, an API key, and a verified sender address/domain

## Setup

1. Run `npm install`.
2. Copy `.env.example` to `.env` and set the PostgreSQL connection settings,
   `RESEND_API_KEY`, and `EMAIL_FROM`. The default database name is `Web Dev`;
   PostgreSQL must have that database created before the app starts.
3. Keep `.env` private and out of source control. The application creates the
   `sse_jlr` table on startup if it does not already exist.
4. Run `npm run dev` for React development with hot reload, or `npm start` to
   build the React app and serve the production site.
5. Open `http://localhost:3000`.

Enquiry notifications are delivered to
`shreeshantinath.enterprises25@gmail.com` by default. Override this with
`CONTACT_EMAIL` when needed. Emails include a structured HTML summary and a
plain-text alternative; the visitor's email is set as the reply-to address.

### Configure enquiry email delivery

The project uses Resend to deliver enquiry notifications:

1. Create an account at [resend.com](https://resend.com/).
2. In **Domains**, add a domain you own (for example, `yourcompany.com`) and
   publish the DNS records Resend provides with your domain/DNS provider.
   Wait until Resend shows the domain as verified. A Gmail address alone cannot
   be used as a verified sending domain.
3. In **API Keys**, create an API key with permission to send emails. Copy the
   key once and set it as `RESEND_API_KEY` in your private local `.env` file.
   Resend's `onboarding@resend.dev` test sender may restrict delivery to your
   Resend account email. To deliver to another recipient, verify a domain you
   own and use a sender address on that domain.
4. Set `EMAIL_FROM` to an address on the verified domain, for example
   `Shree Shantinath Enterprises <enquiries@yourcompany.com>`. This is the
   sender identity Resend authorizes; it can differ from the firm's receiving
   Gmail address.
5. Keep `CONTACT_EMAIL=shreeshantinath.enterprises25@gmail.com` to receive the
   notifications at the firm's inbox, then restart the Node server.
6. Submit a test enquiry and check that the browser reports success and the
   message reaches the inbox (also check spam). Replying to the notification
   goes to the client's submitted email address.

Never put the Resend API key in browser code, share it in chat, or commit it.
If a key is exposed, revoke it in Resend and create a new one immediately.
Without both a valid API key and accepted `EMAIL_FROM`, enquiries are still
saved in PostgreSQL, but email delivery fails and the form reports that the
email could not be sent.

Enquiry submissions are rate limited to five per IP address per 15 minutes.

## Safety pages

The navigation links to three safety-information pages, each available at its
own URL:

- `/safety-policy`
- `/safety-training`
- `/safety-organization`

The original PDF documents are served from `public/documents/` and linked from
their corresponding pages.

## Private letterhead document manager

Sign in at `/letterhead/login` to create, edit, delete or download saved
documents as multi-page A4 PDFs using the custom Shree Shantinath Enterprises
letterhead, updated company emblem and proprietor seal. The signature in the
provided seal photo is excluded. The editor provides a live A4 preview matching
the generated PDF. Draft content and administrator sessions are stored in
PostgreSQL in `letterhead_documents` and
`letterhead_sessions`. The session cookie is HTTP-only and same-site, forms use
CSRF tokens, and sign-in attempts are rate limited.

Set `LETTERHEAD_ADMIN_PASSWORD` (at least 16 characters) and
`SESSION_SECRET` (at least 32 characters) in the ignored local `.env` file.
Strong initial credentials have already been generated in this site's local
`.env`. Keep the password private and rotate it by changing the local `.env`
value and restarting the app. The admin area is `noindex` and is linked in the
website navigation.
