/**
 * Bitrix24 CRM Lead integration — browser-side.
 *
 * Reads webhook URL from `VITE_CRM_WEBHOOK_URL` env var. The URL is a
 * Bitrix24 "Incoming webhook" with `crm` permission. Format:
 *   https://<your-domain>.bitrix24.com/rest/1/<token>/
 *
 * We append `crm.lead.add.json` so the same URL works whether the client
 * pasted the base URL or the full method URL.
 *
 * Design notes:
 * - Fire-and-forget: never throws, never blocks the UI. Bitrix outages
 *   must not prevent the form submission from succeeding locally.
 * - Silent no-op when `VITE_CRM_WEBHOOK_URL` is missing — good for dev.
 * - Browser-side call is acceptable: Bitrix "Incoming webhook" is scoped
 *   to `crm.lead.add` (create-only), and the token cannot read/delete.
 */

export interface BitrixLeadPayload {
  /** User's full name as entered (we split on first space into NAME + LAST_NAME) */
  full_name: string;
  email?: string | null;
  phone?: string | null;
  message?: string | null;
  /** Multi-select channels (telegram/whatsapp/etc.) — appended to COMMENTS */
  preferred_channels?: string[] | null;
  /** Villa name or project the inquiry is about — surfaces in SOURCE_DESCRIPTION */
  property_interest?: string | null;
}

interface BitrixLeadResponse {
  ok: boolean;
  leadId?: number;
  error?: string;
}

const normalizeWebhookUrl = (url: string): string => {
  const trimmed = url.replace(/\/+$/, "");
  // If user pasted the full method URL, use as-is; otherwise append default method.
  if (trimmed.endsWith(".json") || trimmed.includes("crm.lead.add")) {
    return trimmed;
  }
  return `${trimmed}/crm.lead.add.json`;
};

const buildLeadFields = (payload: BitrixLeadPayload) => {
  const [firstName = "", ...rest] = (payload.full_name || "").trim().split(/\s+/);
  const lastName = rest.join(" ");

  const villaTag = payload.property_interest ? ` [${payload.property_interest}]` : "";
  const title = `Website inquiry — ${payload.full_name || "Anonymous"}${villaTag}`;

  const commentsParts: string[] = [];
  if (payload.message) commentsParts.push(payload.message);
  if (payload.preferred_channels && payload.preferred_channels.length > 0) {
    commentsParts.push(`Preferred channels: ${payload.preferred_channels.join(", ")}`);
  }
  const comments = commentsParts.join("\n\n");

  const pageUrl = typeof window !== "undefined" ? window.location.href : "";
  const sourceDescParts: string[] = [];
  if (pageUrl) sourceDescParts.push(pageUrl);
  if (payload.property_interest) sourceDescParts.push(`Interest: ${payload.property_interest}`);
  const sourceDescription = sourceDescParts.join(" / ");

  return {
    TITLE: title,
    NAME: firstName,
    ...(lastName ? { LAST_NAME: lastName } : {}),
    ...(payload.phone ? { PHONE: [{ VALUE: payload.phone, VALUE_TYPE: "WORK" }] } : {}),
    ...(payload.email ? { EMAIL: [{ VALUE: payload.email, VALUE_TYPE: "WORK" }] } : {}),
    ...(comments ? { COMMENTS: comments } : {}),
    SOURCE_ID: "WEB",
    ...(sourceDescription ? { SOURCE_DESCRIPTION: sourceDescription } : {}),
  };
};

export const submitLeadToBitrix = async (
  payload: BitrixLeadPayload
): Promise<BitrixLeadResponse> => {
  const rawUrl = import.meta.env.VITE_CRM_WEBHOOK_URL;
  if (!rawUrl) {
    // No webhook configured — silently skip.
    return { ok: false, error: "VITE_CRM_WEBHOOK_URL not set" };
  }

  try {
    const url = normalizeWebhookUrl(rawUrl);
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: buildLeadFields(payload),
        params: { REGISTER_SONET_EVENT: "Y" },
      }),
    });

    if (!response.ok) {
      return { ok: false, error: `HTTP ${response.status}` };
    }

    const data = await response.json().catch(() => null);
    // Bitrix returns { result: <leadId>, time: {...} } on success
    if (data && typeof data.result === "number") {
      return { ok: true, leadId: data.result };
    }
    if (data && data.error) {
      return { ok: false, error: `${data.error}: ${data.error_description || ""}` };
    }
    return { ok: true };
  } catch (err) {
    // Network error or malformed response — never rethrow; form UX must continue.
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
};
