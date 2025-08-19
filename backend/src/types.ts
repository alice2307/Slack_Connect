// src/types.ts

export type EpochSeconds = number;
export type ScheduledStatus = 'pending' | 'sent' | 'canceled' | 'failed';

/** DB row shapes (snake_case to match SQLite columns) */
export interface OAuthTokenRowDb {
  team_id: string;
  access_token: string;
  refresh_token: string;
  expires_at: EpochSeconds;
  bot_user_id?: string | null;
  authed_user_id?: string | null;
}

export interface ScheduledMessageRowDb {
  id: number;
  team_id: string;
  channel_id: string;
  text: string;
  send_at: EpochSeconds;
  status: ScheduledStatus;
  last_error?: string | null;
}

/** Request payloads */
export interface SendNowPayload {
  team_id: string;
  channel_id: string;
  text: string;
}

export interface SchedulePayload extends SendNowPayload {
  /** ISO-8601 string from the client; server converts to UTC epoch seconds */
  sendAtISO: string;
}

/** Lightweight channel shape used by the frontend */
export interface ChannelLite {
  id: string;
  name: string;
}

/** Minimal Slack API response shapes (only fields we use) */
export type SlackError = { ok: false; error: string };

export type SlackOAuthAccessSuccess = {
  ok: true;
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  bot_user_id?: string;
  team?: { id: string; name?: string };
  authed_user?: { id: string };
};
export type SlackOAuthAccessResponse = SlackOAuthAccessSuccess | SlackError;

export type SlackConversationsListResponse =
  | SlackError
  | { ok: true; channels: Array<{ id: string; name: string }> };

export type SlackPostMessageResponse =
  | SlackError
  | { ok: true; channel: string; ts: string; message?: unknown };
