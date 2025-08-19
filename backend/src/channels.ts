import { Router } from "express";
import { slackAPI } from "./slack";

const router = Router();

// GET /channels?team_id=T123
router.get("/", async (req: any, res: any) => {
  try {
    const { team_id } = req.query as { team_id?: string };
    if (!team_id) return res.status(400).json({ error: "missing team_id" });

    const data = await slackAPI(team_id, "conversations.list", { types: "public_channel" });
    res.json({ channels: data.channels?.map((c: any) => ({ id: c.id, name: c.name })) ?? [] });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
