# Bitrix24 Integration — One-Time Setup

When a visitor submits any contact form on the Igavi website (homepage contact form, villa detail sidebar, plot price dialog), a new **Lead** is automatically created in your Bitrix24 CRM.

This document shows you how to turn that on.

## Step 1 — Create an Incoming Webhook in Bitrix24

1. Log into your Bitrix24 account (e.g. `https://your-company.bitrix24.com/`).
2. In the left sidebar scroll to the bottom → click **Developer resources**.
   - If you don't see it: click **Other** → **Developer resources**.
3. Click **Other** in the top menu → **Inbound webhook** (in some locales: **Incoming webhook**).
4. Click **Create webhook** (or **Add webhook**).
5. Under **Permissions** check the box **CRM** (`crm`). This is enough to create Leads.
6. Click **Save**.
7. Copy the **Webhook URL** shown on the confirmation screen. It looks like:
   ```
   https://your-company.bitrix24.com/rest/1/abc123xyz456/
   ```
   ⚠️ **Treat this URL as a secret.** Anyone with it can create leads in your CRM. Don't post it publicly.

## Step 2 — Add the URL to your site environment

### If deploying via Vercel

1. Open your Vercel dashboard → select the `villa-haven-core` project → **Settings** → **Environment Variables**.
2. Click **Add New**.
3. **Name**: `VITE_CRM_WEBHOOK_URL`
4. **Value**: paste the URL you copied (e.g. `https://your-company.bitrix24.com/rest/1/abc123xyz456/`)
5. **Environments**: check **Production**, **Preview**, **Development**.
6. Click **Save**.
7. Go to the **Deployments** tab → click the ⋯ menu on the latest deployment → **Redeploy**. The new env var only takes effect on next deploy.

### If deploying via Netlify

1. Site settings → **Environment variables** → **Add a variable**.
2. Key: `VITE_CRM_WEBHOOK_URL`
3. Value: the webhook URL.
4. **Save** → **Deploys** → **Trigger deploy** → **Deploy site**.

### If running locally

Open `.env` in the project folder and add:

```
VITE_CRM_WEBHOOK_URL=https://your-company.bitrix24.com/rest/1/abc123xyz456/
```

Then restart the dev server (`npm run dev`).

## Step 3 — Test the integration

1. Open your live site.
2. Submit the contact form with your own name, email, and phone.
3. Go to Bitrix24 → **CRM** → **Leads**. A new lead should appear within a few seconds with:
   - **Title**: "Website inquiry — Your Name"
   - **Phone** / **Email** populated
   - **Source**: "Web"
   - **Source description**: the page URL you submitted from
   - **Comments**: your message + preferred communication channels
4. Test a villa detail form too. The villa name should appear in the lead's title (`[Villa #42]`) and in source description (`Interest: Villa #42`).

## What data gets sent to Bitrix?

| Form field | Bitrix Lead field |
|------------|-------------------|
| First name + last name | `NAME` + `LAST_NAME` (split on first space) |
| Phone | `PHONE[0].VALUE` |
| Email | `EMAIL[0].VALUE` |
| Message | `COMMENTS` |
| Preferred channels (telegram, whatsapp, etc.) | Appended to `COMMENTS` |
| Page URL + villa name | `SOURCE_DESCRIPTION` |
| Fixed value | `SOURCE_ID = "WEB"` |

The **Supabase `contact_submissions` table is ALWAYS written** first. The Bitrix call is fire-and-forget — if Bitrix is temporarily down, the submission is still saved to your database and can be resent later manually.

## Turning the integration off

Remove or rename `VITE_CRM_WEBHOOK_URL` in your hosting env vars and redeploy. Forms continue to save to Supabase; just no Bitrix leads.

## Troubleshooting

**No leads appear in Bitrix after submission**

1. Check the env var is actually set in your deploy. In a browser console on the live site, type `import.meta.env.VITE_CRM_WEBHOOK_URL` — if it says `undefined`, the var isn't applied (redeploy).
2. Open the browser DevTools → **Network** tab → submit the form → look for a POST to `bitrix24.com/rest/.../crm.lead.add.json`. Click it to see the response. If status 401/403 → permissions issue, recreate webhook with `crm` scope. If status 400 → check the request body for malformed data.
3. Check the webhook still exists in Bitrix (Developer resources → Inbound webhook list).

**Leads appear but fields are empty**

The webhook URL may be missing the `/rest/1/<token>/` path. Paste the full URL as shown in Bitrix.

**Need a different record type (Contact, Deal, Opportunity)?**

Right now we create a **Lead** (`crm.lead.add.json`). To change this, edit `src/lib/bitrix.ts` — the `normalizeWebhookUrl` function appends the method name. Swap `crm.lead.add.json` for e.g. `crm.contact.add.json` and update the field names accordingly.
