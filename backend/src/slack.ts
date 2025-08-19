import axios from "axios";
import db from "./db";
import { env } from "./env";
import { OAuthTokenRowDb } from "./types";

const getRow = db.prepare("SELECT * FROM oauth_tokens WHERE team_id=?");
const updateTokens = db.prepare(`
  UPDATE oauth_tokens
  SET access_token=?, refresh_token=?, expires_at=?
  WHERE team_id=?
`);

// Returns a valid access token. If token rotation is enabled, refresh when near expiry.
export async function getAccessToken(team_id: string): Promise<string> {
  console.log(`Getting access token for team: ${team_id}`);
  
  const row = getRow.get(team_id) as OAuthTokenRowDb | undefined;
  if (!row) {
    console.error(`No OAuth tokens found for team: ${team_id}`);
    throw new Error("workspace_not_connected");
  }
  
  console.log(`Found OAuth tokens for team ${team_id}:`, {
    has_refresh_token: !!row.refresh_token,
    expires_at: row.expires_at,
    current_time: Math.floor(Date.now() / 1000)
  });

  // If no refresh token (rotation disabled), treat as non-expiring.
  if (!row.refresh_token) {
    console.log(`No refresh token for team ${team_id}, using existing access token`);
    return row.access_token;
  }

  const now = Math.floor(Date.now() / 1000);
  if (row.expires_at - now > 60) {
    console.log(`Token for team ${team_id} is still valid, expires in ${row.expires_at - now} seconds`);
    return row.access_token;
  }

  // Refresh
  console.log(`Refreshing token for team ${team_id}, expires in ${row.expires_at - now} seconds`);
  const resp = await axios.post(
    "https://slack.com/api/oauth.v2.access",
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: row.refresh_token,
      client_id: env.clientId,
      client_secret: env.clientSecret,
    }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  const data = resp.data;
  if (!data.ok) {
    console.error(`Token refresh failed for team ${team_id}:`, data);
    throw new Error(data.error || "token_refresh_failed");
  }

  const expires_in = Number(data.expires_in ?? 3600);
  const new_expires_at = Math.floor(Date.now() / 1000) + expires_in;
  const new_refresh = data.refresh_token ?? row.refresh_token;

  updateTokens.run(data.access_token, new_refresh, new_expires_at, team_id);
  console.log(`Token refreshed successfully for team ${team_id}, new expiry: ${new_expires_at}`);
  return data.access_token;
}

// Minimal helper to call Slack Web API with form-encoded body.
export async function slackAPI<T = any>(
  team_id: string,
  method: string,
  payload: Record<string, string | number | boolean>
): Promise<T> {
  try {
    const token = await getAccessToken(team_id);
    console.log(`Calling Slack API: ${method} for team ${team_id}`);
    
    const resp = await axios.post(
      `https://slack.com/api/${method}`,
      new URLSearchParams(
        Object.fromEntries(
          Object.entries(payload).map(([k, v]) => [k, String(v)])
        )
      ),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    console.log(`Slack API response for ${method}:`, {
      status: resp.status,
      ok: resp.data?.ok,
      error: resp.data?.error,
      response: resp.data
    });
    
    if (!resp.data?.ok) {
      const err = resp.data?.error || "slack_api_error";
      console.error(`Slack API error for ${method}:`, err, resp.data);
      throw new Error(err);
    }
    
    return resp.data as T;
  } catch (error: any) {
    console.error(`Slack API call failed for ${method}:`, {
      error: error.message,
      stack: error.stack,
      team_id,
      method,
      payload
    });
    throw error;
  }
}
