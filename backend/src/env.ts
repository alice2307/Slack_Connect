import { config } from "dotenv";
import path from "path";

// Load .env file from the backend directory
config({ path: path.join(__dirname, "../.env") });

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export const env = {
  port: Number(process.env.PORT || 4000),
  clientId: required("SLACK_CLIENT_ID"),
  clientSecret: required("SLACK_CLIENT_SECRET"),
  redirectUri: required("SLACK_REDIRECT_URI"),
  frontendOrigin: required("FRONTEND_ORIGIN"),
};
