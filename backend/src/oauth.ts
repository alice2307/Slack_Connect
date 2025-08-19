import { Router } from "express";
import { env } from "./env";
import axios from "axios";
import db from "./db";

const router = Router();

// Step 1: redirect user to Slack
router.get("/slack/start", (req: any, res: any) => {
  const state = "any-random-state";
  const url = new URL("https://slack.com/oauth/v2/authorize");
  url.searchParams.set("client_id", env.clientId);
  url.searchParams.set("scope", "chat:write,channels:read");
  url.searchParams.set("redirect_uri", env.redirectUri);
  url.searchParams.set("state", state);
  res.redirect(url.toString());
});

// Step 2: callback -> exchange code for tokens
router.get("/slack/callback", async (req: any, res: any) => {
  const { code } = req.query as { code?: string };
  if (!code) return res.status(400).send("Missing code");

  const tokenRes = await axios.post(
    "https://slack.com/api/oauth.v2.access",
    new URLSearchParams({
      code,
      client_id: env.clientId,
      client_secret: env.clientSecret,
      redirect_uri: env.redirectUri,
    }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  const data = tokenRes.data;
  if (!data.ok) return res.status(400).json(data);

  const team_id = data.team?.id;
  const access_token = data.access_token;
  const refresh_token = data.refresh_token;
  const expires_in = data.expires_in ?? 3600;
  const expires_at = Math.floor(Date.now() / 1000) + expires_in;
  const bot_user_id = data.bot_user_id;
  const authed_user_id = data.authed_user?.id;

  const upsert = db.prepare(`
    INSERT INTO oauth_tokens (team_id, access_token, refresh_token, expires_at, bot_user_id, authed_user_id)
    VALUES (@team_id, @access_token, @refresh_token, @expires_at, @bot_user_id, @authed_user_id)
    ON CONFLICT(team_id) DO UPDATE SET
      access_token=excluded.access_token,
      refresh_token=excluded.refresh_token,
      expires_at=excluded.expires_at,
      bot_user_id=excluded.bot_user_id,
      authed_user_id=excluded.authed_user_id
  `);

  upsert.run({ team_id, access_token, refresh_token, expires_at, bot_user_id, authed_user_id });

  res.redirect(`${env.frontendOrigin}/connected?team_id=${team_id}`);
});

export default router;
