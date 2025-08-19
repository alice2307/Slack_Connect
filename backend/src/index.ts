// /src/index.ts
import express from "express";
import cors from "cors";
import fs from "fs";
import https from "https";
import path from "path";
import { env } from "./env";
import oauthRouter from "./oauth";
import channelsRouter from "./channels";
import messagesRouter from "./messages";
import { startScheduler } from "./scheduler";

const app = express();
app.use(cors({ origin: env.frontendOrigin, credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", oauthRouter);
app.use("/channels", channelsRouter);
app.use("/messages", messagesRouter);

// Resolve cert/key (ENV > CWD > /backend next to src/dist)
function resolveFirst(...candidates: (string | undefined)[]) {
  for (const p of candidates) {
    if (!p) continue;
    const abs = path.isAbsolute(p) ? p : path.resolve(p);
    if (fs.existsSync(abs)) return abs;
  }
  return undefined;
}

const keyPath =
  resolveFirst(
    process.env.TLS_KEY_PATH,
    path.join(process.cwd(), "localhost-key.pem"),        // backend/
    path.join(process.cwd(), "..", "backend/localhost-key.pem"), // project root
    path.join(__dirname, "../localhost-key.pem"),         // src -> backend
    path.join(__dirname, "localhost-key.pem")             // dist -> backend/dist
  );

const certPath =
  resolveFirst(
    process.env.TLS_CERT_PATH,
    process.env.TLS_CERT_PATH,
    path.join(process.cwd(), "localhost.pem"),            // backend/
    path.join(process.cwd(), "..", "backend/localhost.pem"), // project root
    path.join(__dirname, "../localhost.pem"),             // src -> backend
    path.join(__dirname, "localhost.pem")                 // dist -> backend/dist
  );

if (!keyPath || !certPath) {
  console.error("TLS certs not found. Checked common locations:");
  console.error("Current working directory:", process.cwd());
  console.error("__dirname:", __dirname);
  console.error("Checked key paths:");
  console.error("  -", path.join(process.cwd(), "localhost-key.pem"));
  console.error("  -", path.join(process.cwd(), "..", "backend/localhost-key.pem"));
  console.error("  -", path.join(__dirname, "../localhost-key.pem"));
  console.error("  -", path.join(__dirname, "localhost-key.pem"));
  console.error("Checked cert paths:");
  console.error("  -", path.join(process.cwd(), "localhost.pem"));
  console.error("  -", path.join(process.cwd(), "..", "backend/localhost.pem"));
  console.error("  -", path.join(__dirname, "../localhost.pem"));
  console.error("  -", path.join(__dirname, "localhost.pem"));
  console.error("\nSet TLS_KEY_PATH and TLS_CERT_PATH or run from the backend folder.");
  process.exit(1);
}

const key = fs.readFileSync(keyPath);
const cert = fs.readFileSync(certPath);

https.createServer({ key, cert }, app).listen(env.port, () => {
  console.log(`HTTPS API on https://localhost:${env.port}`);
  console.log(`Using key:  ${keyPath}`);
  console.log(`Using cert: ${certPath}`);
});

startScheduler();
