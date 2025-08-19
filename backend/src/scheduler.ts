import db from "./db";
import { slackAPI } from "./slack";

export function startScheduler() {
  setInterval(async () => {
    const now = Math.floor(Date.now()/1000);
    const due = db.prepare(`
      SELECT id, team_id, channel_id, text 
      FROM scheduled_messages 
      WHERE status='pending' AND send_at <= ? 
      ORDER BY send_at ASC LIMIT 20
    `).all(now) as any[];

    for (const row of due) {
      try {
        await slackAPI(row.team_id, "chat.postMessage", { channel: row.channel_id, text: row.text });
        db.prepare("UPDATE scheduled_messages SET status='sent' WHERE id=?").run(row.id);
      } catch (e:any) {
        db.prepare("UPDATE scheduled_messages SET status='failed', last_error=? WHERE id=?").run(e.message || "send_failed", row.id);
      }
    }
  }, 15000);
}
