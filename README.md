# Slack Connect (Beginner-Friendly README)

A tiny full-stack app to connect a Slack workspace via OAuth, send messages **now** or **schedule** them for later. Built with **Node.js + Express (TS)**, **React (TS)**, and **SQLite**.


---

## What this app does
- Connect a Slack workspace using **OAuth 2.0** (with **token rotation/refresh**).
- List channels, **send messages immediately**, or **schedule** them.
- View and **cancel** scheduled messages.
- Runs locally over **HTTPS** (Slack requires HTTPS redirect URLs).
## ⚠️ IMPORTANT: Setup Slack App First!

**Before running the startup script, you MUST complete these 2 steps:**

## Prerequisites
- Node.js 18+ and npm
- Git
- A Slack account

---

## 🚀 Quick Start

**Want to get running fast?** Use our automated startup scripts:

**Linux/macOS:**
```bash
chmod +x startup.sh
./startup.sh
```

**Windows:**
```cmd
startup.bat
```

**⚠️ Important**: When you run the startup script for the first time, it will prompt you to enter your Slack app credentials. The script will create the `.env` file automatically with your input.

See [STARTUP_README.md](STARTUP_README.md) for details.


## 1) Create Slack account and workspace
1. Sign up at Slack and **create a workspace** (any name is fine for dev).
2. Keep your Slack session open—you'll authorize the app shortly.

### 2) Create a Slack app + OAuth credentials
1. Go to Slack API "https://api.slack.com/apps" → **Create a new app** → "From scratch".
2. Give a APP name & Pick your dev workspace.
3. In the app settings:
   - **OAuth & Permissions → Redirect URLs**: add  
     `https://localhost:4000/auth/slack/callback` and Save Url
   - **Scopes (Bot Token Scopes)**: add  
     - `chat:write` (send messages)  
     - `channels:read` (list public channels) 
     - `channels:write.invites` (invite members to public channels)
     - `groups:write.invites`  (invite members to private channels) 
     - *(Optional)* `chat:write.public` to post in public channels without inviting the bot  
     - *(Optional)* `groups:read` to list private channels
   - **Token Rotation**: **Enable** it (so you receive `refresh_token` and `expires_in`).
4. **Install App to Workspace** (you may need to re-install only if you change scopes later using OAuth Flow).
5. Navigate to Basic Information tab & Copy **Client ID** and **Client Secret** (you'll put these into `.env`.

---

## What this app does
- Connect a Slack workspace using **OAuth 2.0** (with **token rotation/refresh**).
- List channels, **send messages immediately**, or **schedule** them.
- View and **cancel** scheduled messages.
- Runs locally over **HTTPS** (Slack requires HTTPS redirect URLs).

---

## Prerequisites
- Node.js 18+ and npm
- Git
- A Slack account
- Local HTTPS certs (we'll generate them with `mkcert`)

---

## 3) Generate local HTTPS certificates (mkcert)
> Slack requires HTTPS for OAuth redirects, even locally.

**💡 The startup scripts handle this automatically!** But if you need manual setup:

### Quick Install
**Windows (Chocolatey):**
1. **Open PowerShell as Administrator** and **Install Chocolatey** (if not already installed) run:
```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; `
[System.Net.ServicePointManager]::SecurityProtocol = `
[System.Net.ServicePointManager]::SecurityProtocol -bor 3072; `
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

2. **Install mkcert**:
```powershell
choco install mkcert -y
```

3. **Install mkcert certificates**:
```powershell
mkcert -install
```

4. **Navigate to project backend directory** and install local certificates:
```powershell
cd backend
mkcert localhost
```

**🍏 macOS (Homebrew):**
1. **Install Homebrew** (if not already installed):
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

2. **Install mkcert**:
```bash
brew install mkcert
brew install nss # needed for Firefox
```

3. **Install local CA**:
```bash
mkcert -install
```

4. **Generate localhost certificates**:
```bash
mkcert localhost
```

**🐧 Ubuntu / Linux:**
1. **Install dependencies**:
```bash
sudo apt update
sudo apt install libnss3-tools wget -y
```

2. **Download mkcert binary**:
```bash
wget https://github.com/FiloSottile/mkcert/releases/latest/download/mkcert-v1.4.4-linux-amd64
```

3. **Move to PATH**:
```bash
sudo mv mkcert-v1.4.4-linux-amd64 /usr/local/bin/mkcert
sudo chmod +x /usr/local/bin/mkcert
```

4. **Install local CA**:
```bash
mkcert -install
```

5. **Generate localhost certificates**:
```bash
mkcert localhost
```

**📁 Expected Output:**
After running `mkcert localhost`, you'll get two files:
- `localhost.pem` (certificate)
- `localhost-key.pem` (private key)

### Generate Certificates
```bash
mkcert -install
cd backend
mkcert localhost
```

> **Pro tip**: Just run `./startup.sh` (Linux/macOS) or `startup.bat` (Windows) - it handles everything!

---

## 4) Environment variables

**💡 The startup scripts create these automatically!** Here's how it works:

### What the startup scripts do:
1. **Prompt for Slack credentials** and create `backend/.env` with your input
2. **Create `frontend/.env`** with the correct API base URL
3. **Install dependencies** automatically
4. **Start both services** (backend and frontend)

### `backend/.env` (created automatically)
```env
PORT=4000

# From Slack app settings
SLACK_CLIENT_ID=your_client_id_here
SLACK_CLIENT_SECRET=your_client_secret_here
SLACK_REDIRECT_URI=https://localhost:4000/auth/slack/callback

# Frontend dev origin (Vite default)
FRONTEND_ORIGIN=http://localhost:5173
```

### `frontend/.env` (created automatically)
```env
VITE_API_BASE=https://localhost:4000
```

### ⚠️ Important: Provide Your Slack Credentials!
When you run the startup script for the first time:
1. **The script will prompt you** for your Slack Client ID and Client Secret
2. **Enter your credentials** when prompted (get them from your Slack app settings)
3. **The script creates the .env file automatically** with your real credentials

> **Pro tip**: The startup script handles everything - just run it and follow the prompts!

---

## 5) Install & run (dev)

**💡 The startup scripts handle this automatically!** But if you need manual setup:

### Quick Start
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

### Verify Backend
You should see:
```
HTTPS API on https://localhost:4000
Using key:  backend/localhost-key.pem
Using cert: backend/localhost.pem
```

Health check:
```bash
curl -k https://localhost:4000/health
```

> **Pro tip**: Just run `./startup.sh` (Linux/macOS) or `startup.bat` (Windows) - it handles everything!

---

## 6) Use the app
1. Click **Connect Slack**.
2. Approve the permissions → you’ll be redirected back.
3. **Find your bot name**: Click the **"🤖 Find Bot Name"** button to see your bot's exact name and team.
4. **Invite the bot to channels**: Use the displayed command `/invite @YourBotName` in any Slack channel where you want to send messages.
5. Pick a channel from the dropdown. 
6. **Send now**: type a message and click **Send now**.
7. **Schedule**: pick a future date/time and click **Schedule**.
8. Open the **Scheduled** list to see/cancel pending messages.

---

## 6.1) Enhanced UI Features
- **🤖 Find Bot Name Button**: Automatically appears after connecting to Slack, shows bot name and team info
- **📋 Auto-refresh Scheduled Messages**: List automatically updates when new messages are scheduled
- **🔄 Manual Refresh**: "Refresh Scheduled Messages" button for manual updates
- **📱 Responsive Design**: Modern gradient UI that works on all screen sizes
- **💬 Smart Error Handling**: Helpful error messages with specific guidance for common issues
- **🎯 Bot Invite Helper**: Copy-paste ready invite commands and automatic bot invitation attempts

---

## 7) Common issues (quick fixes)
- **“Invalid client_id” / `client_id=undefined`**  
  Backend didn’t load `.env` or wrong script. Run from `backend/` with `npm run dev`. Confirm with:  
  `node -e "require('dotenv').config(); console.log(process.env.SLACK_CLIENT_ID)"`
- **`bad_redirect_uri`**  
  Slack URL must match exactly:  
  `https://localhost:4000/auth/slack/callback`  
  Also ensure `SLACK_REDIRECT_URI` matches.
- **HTTPS health fails**  
  Certs missing or unreadable. Ensure files exist in `backend/` or set:  
  `TLS_KEY_PATH=backend/localhost-key.pem`  
  `TLS_CERT_PATH=backend/localhost.pem`
- **Message not delivered**  
  Invite the bot: `/invite @YourBotName` (use the **"🤖 Find Bot Name"** button to get the exact name)  
  Or add `chat:write.public` and **Reinstall App**  
  For private channels, add `groups:read` and **Reinstall App**
- **No channels listed**  
  Check scopes (`channels:read`), then **Reinstall App**.
- **Bot can't invite itself**  
  The app includes a **"🤖 Find Bot Name"** button and automatic invite attempts.  
  If automatic invites fail, manually invite using `/invite @YourBotName` in the channel.

---

## 8) Project structure (brief)
```
backend/
  src/
    index.ts        # HTTPS server + routes
    env.ts          # loads/validates env
    db.ts           # better-sqlite3 schema
    oauth.ts        # OAuth start + callback
    slack.ts        # token refresh + Slack API helper
    channels.ts     # list channels
    messages.ts     # send now / schedule / list / cancel
    scheduler.ts    # 15s loop to dispatch due messages
  data.db           # SQLite (created at runtime)
  localhost*.pem    # mkcert certs (dev)
frontend/
  src/...
```

---

## 9) Architectural Overview

### 🔐 OAuth 2.0 Flow
The app implements Slack's OAuth 2.0 flow with token rotation:
1. **Authorization**: User clicks "Connect Slack" → redirects to Slack OAuth
2. **Callback**: Slack redirects back with authorization code
3. **Token Exchange**: Backend exchanges code for access + refresh tokens
4. **Storage**: Tokens stored in SQLite with team_id as primary key
5. **Refresh**: Automatic token refresh when expired using refresh_token

### 🔑 Token Management
- **Database Schema**: `oauth_tokens` table stores team_id, access_token, refresh_token, expires_at
- **Automatic Refresh**: `slack.ts` handles token expiration and refresh
- **Team Isolation**: Each Slack workspace gets separate token set
- **Security**: Tokens encrypted at rest, HTTPS-only transmission

### ⏰ Scheduled Task Handling
- **Database**: `scheduled_messages` table with status tracking (pending/sent/canceled/failed)
- **Scheduler**: Background process runs every 15 seconds checking for due messages
- **Retry Logic**: Failed messages logged with error details
- **Real-time Updates**: Frontend auto-refreshes scheduled message list

### 🌐 API Architecture
- **RESTful Design**: Clear endpoint structure for messages, channels, OAuth
- **TypeScript**: Full type safety across backend and frontend
- **Error Handling**: Comprehensive error responses with specific guidance
- **CORS**: Proper cross-origin handling for local development

---

## 10) Challenges & Learnings

### 🔒 HTTPS Requirements
**Challenge**: Slack OAuth requires HTTPS even for local development
- **Solution**: Implemented mkcert for local HTTPS certificates
- **Learning**: Always check third-party service requirements early
- **Implementation**: Automatic certificate generation in startup scripts

### 🛣️ Route Handling & Frontend-Backend Communication
**Challenge**: Complex routing between frontend React app and backend Express API
- **Solution**: Centralized API client with axios, proper error handling
- **Learning**: Type-safe API contracts prevent runtime errors
- **Implementation**: Shared types between frontend and backend

### 🔑 Environment Variable Loading
**Challenge**: Client ID and secret not loading properly from .env files
- **Root Cause**: ts-node-dev running from project root vs backend directory
- **Solution**: Explicit path resolution in env.ts: `path.join(__dirname, "../.env")`
- **Learning**: Always verify working directory assumptions in development tools

### 🤖 Bot Invitation & Permissions
**Challenge**: Bot couldn't automatically invite itself to channels
- **Root Cause**: Missing Slack app scopes (`channels:write.invites`, `groups:write.invites`)
- **Solution**: 
  - Added "Find Bot Name" button for user discovery
  - Implemented automatic invite attempts with fallback
  - Clear error messages guiding users to manual invites
- **Learning**: Slack's permission model is restrictive for security reasons

### 🔄 TypeScript Module Resolution
**Challenge**: Persistent module import/export conflicts between ESM and CommonJS
- **Root Cause**: Mixed module systems causing compilation errors
- **Solution**: Consistent ESM syntax with CommonJS compilation target
- **Learning**: Stick to one module system throughout the project

### 📱 Frontend State Management
**Challenge**: Scheduled messages not updating in real-time
- **Solution**: Implemented refresh mechanism with key-based re-rendering
- **Learning**: React's key prop is powerful for forcing component updates

### 🗄️ Database Path Resolution
**Challenge**: SQLite database created in wrong location
- **Root Cause**: Relative paths resolving from different working directories
- **Solution**: Absolute path resolution using `path.join(__dirname, "../data.db")`
- **Learning**: Always use absolute paths for file system operations

### 🎯 Key Technical Insights
1. **HTTPS First**: Design for HTTPS from the start, not as an afterthought
2. **Environment Validation**: Always validate environment variables at startup
3. **Error Handling**: Specific error messages save hours of debugging
4. **User Experience**: Guide users through complex OAuth flows with clear UI
5. **Type Safety**: TypeScript catches many issues before runtime
6. **Development Tools**: Understand how your dev tools resolve paths and modules

---

## 11) API routes (for reference)
- `GET /health`
- `GET /auth/slack/start` → redirects to Slack OAuth
- `GET /auth/slack/callback` → handles token exchange
- `GET /channels?team_id=...`
- `GET /messages/bot-info?team_id=...` → get bot name and team info
- `POST /messages/send` `{ team_id, channel_id, text }`
- `POST /messages/schedule` `{ team_id, channel_id, text, sendAtISO }`
- `POST /messages/invite` `{ team_id, channel_id }` → invite bot to channel
- `GET /messages/scheduled?team_id=...`
- `DELETE /messages/scheduled/:id?team_id=...`

---





