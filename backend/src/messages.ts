import { Router } from "express";
import db from "./db";
import { slackAPI } from "./slack";
import { SchedulePayload, SendNowPayload } from "./types";

const router = Router();

const insertScheduled = db.prepare(`
  INSERT INTO scheduled_messages (team_id, channel_id, text, send_at)
  VALUES (@team_id, @channel_id, @text, @send_at)
`);

// POST /messages/send  { team_id, channel_id, text }
router.post("/send", async (req, res) => {
  const { team_id, channel_id, text } = req.body as SendNowPayload;
  if (!team_id || !channel_id || !text)
    return res.status(400).json({ error: "missing_fields" });

  try {
    console.log(`Attempting to send message: team_id=${team_id}, channel_id=${channel_id}, text="${text}"`);
    
    const data = await slackAPI(team_id, "chat.postMessage", {
      channel: channel_id,
      text,
    });
    
    console.log(`Message sent successfully:`, data);
    res.json({ ok: true, ts: data.ts, channel: data.channel });
  } catch (e: any) {
    console.error("Error sending message:", {
      error: e.message,
      stack: e.stack,
      team_id,
      channel_id,
      text: text?.substring(0, 100) + (text?.length > 100 ? "..." : "")
    });
    
    // Return more specific error messages
    if (e.message === "workspace_not_connected") {
      return res.status(400).json({ error: "Workspace not connected. Please reconnect to Slack." });
    } else if (e.message === "channel_not_found") {
      return res.status(400).json({ error: "Channel not found or bot not added to channel." });
    } else if (e.message === "not_in_channel") {
      return res.status(400).json({ 
        error: "Bot is not in this channel. Please invite the bot first using `/invite @YourBotName` in the channel, or use the invite endpoint below.",
        invite_endpoint: `/messages/invite?team_id=${team_id}&channel_id=${channel_id}`
      });
    } else {
      res.status(500).json({ error: e.message });
    }
  }
});

// GET /messages/bot-info  { team_id }
router.get("/bot-info", async (req, res) => {
  const { team_id } = req.query as { team_id: string };
  if (!team_id)
    return res.status(400).json({ error: "missing_team_id" });

  try {
    console.log(`Getting bot info for team: ${team_id}`);
    
    const botInfo = await slackAPI(team_id, "auth.test", {});
    
    console.log(`Bot info retrieved:`, botInfo);
    res.json({ 
      ok: true, 
      bot_name: botInfo.user,
      bot_id: botInfo.user_id,
      team_name: botInfo.team,
      team_id: botInfo.team_id
    });
  } catch (e: any) {
    console.error("Error getting bot info:", {
      error: e.message,
      stack: e.stack,
      team_id
    });
    
    if (e.message === "workspace_not_connected") {
      return res.status(400).json({ error: "Workspace not connected. Please reconnect to Slack." });
    } else {
      res.status(500).json({ error: e.message });
    }
  }
});

// POST /messages/invite  { team_id, channel_id }
router.post("/invite", async (req, res) => {
  const { team_id, channel_id } = req.body as { team_id: string; channel_id: string };
  if (!team_id || !channel_id)
    return res.status(400).json({ error: "missing_fields" });

  try {
    console.log(`Attempting to invite bot to channel: team_id=${team_id}, channel_id=${channel_id}`);
    
    // First get the bot user ID
    const botInfo = await slackAPI(team_id, "auth.test", {});
    const botUserId = botInfo.user_id;
    
    console.log(`Bot user ID: ${botUserId}`);
    console.log(`Bot display name: ${botInfo.user}`);
    console.log(`Bot team: ${botInfo.team}`);
    
    // Invite the bot to the channel
    const inviteResult = await slackAPI(team_id, "conversations.invite", {
      channel: channel_id,
      users: botUserId
    });
    
    console.log(`Bot invited successfully:`, inviteResult);
    res.json({ ok: true, message: "Bot invited to channel successfully" });
  } catch (e: any) {
    console.error("Error inviting bot to channel:", {
      error: e.message,
      stack: e.stack,
      team_id,
      channel_id
    });
    
    if (e.message === "already_in_channel") {
      return res.status(400).json({ error: "Bot is already in this channel." });
    } else if (e.message === "channel_not_found") {
      return res.status(400).json({ error: "Channel not found." });
    } else if (e.message === "missing_scope") {
      return res.status(400).json({ error: "Bot doesn't have permission to invite itself. Please invite manually using `/invite @YourBotName` in the channel." });
    } else {
      res.status(500).json({ error: e.message });
    }
  }
});

// POST /messages/schedule  { team_id, channel_id, text, sendAtISO }
router.post("/schedule", (req, res) => {
  const { team_id, channel_id, text, sendAtISO } =
    req.body as SchedulePayload;

  if (!team_id || !channel_id || !text || !sendAtISO)
    return res.status(400).json({ error: "missing_fields" });

  try {
    console.log(`Scheduling message: team_id=${team_id}, channel_id=${channel_id}, text="${text}", sendAtISO=${sendAtISO}`);
    
    const epoch = Math.floor(new Date(sendAtISO).getTime() / 1000);
    if (!Number.isFinite(epoch)) {
      console.error(`Invalid datetime: ${sendAtISO} -> ${epoch}`);
      return res.status(400).json({ error: "invalid_datetime" });
    }

    console.log(`Converting ${sendAtISO} to epoch: ${epoch} (${new Date(epoch * 1000).toISOString()})`);

    const result = insertScheduled.run({
      team_id,
      channel_id,
      text,
      send_at: epoch,
    });

    console.log(`Message scheduled successfully with ID: ${result.lastInsertRowid}`);
    res.json({ ok: true, id: result.lastInsertRowid });
  } catch (error: any) {
    console.error("Error scheduling message:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /messages/scheduled?team_id=T123
router.get("/scheduled", (req, res) => {
  const { team_id } = req.query as { team_id?: string };
  if (!team_id) return res.status(400).json({ error: "missing_team_id" });

  try {
    console.log(`Fetching scheduled messages for team: ${team_id}`);
    
    const rows = db
      .prepare(
        `SELECT id, channel_id, text, send_at, status, last_error
         FROM scheduled_messages
         WHERE team_id=? AND status IN ('pending','failed')
         ORDER BY send_at ASC`
      )
      .all(team_id);

    console.log(`Found ${rows.length} scheduled messages for team ${team_id}:`, rows);
    res.json({ items: rows });
  } catch (error: any) {
    console.error("Error fetching scheduled messages:", error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /messages/scheduled/:id?team_id=T123
router.delete("/scheduled/:id", (req, res) => {
  const { team_id } = req.query as { team_id?: string };
  const id = Number(req.params.id);
  if (!team_id || !id) return res.status(400).json({ error: "missing_fields" });

  const info = db
    .prepare(
      "UPDATE scheduled_messages SET status='canceled' WHERE id=? AND team_id=? AND status='pending'"
    )
    .run(id, team_id);

  res.json({ ok: info.changes > 0 });
});

export default router;
