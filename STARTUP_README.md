# 🚀 Slack Connect Startup Scripts

Quick setup and launch scripts for the Slack Connect application.

## 📋 What These Scripts Do

The startup scripts automatically:
- ✅ Check Node.js and npm requirements
- 🔐 Install and configure mkcert for HTTPS certificates
- 📦 Install all backend and frontend dependencies
- ⚙️ Create environment file templates
- 🚀 Start both backend and frontend services
- 🛑 Provide clean shutdown with Ctrl+C

## 🖥️ Platform Support

### Linux/macOS
```bash
./startup.sh
```

### Windows
```cmd
startup.bat
```

## 🎯 Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Git** - For cloning the repository
- **Slack App** - [Create one here](https://api.slack.com/apps)

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd cobalt-slack-connect
   ```

2. **Run the startup script**
   ```bash
   # Linux/macOS
   ./startup.sh
   
   # Windows
   startup.bat
   ```

3. **Follow the prompts**
   - Script will install dependencies
   - Create environment file templates
   - Ask if you want to start services

4. **Configure your Slack app**
   - Edit `backend/.env` with your Slack credentials
   - Visit [api.slack.com/apps](https://api.slack.com/apps) to create an app

5. **Access your app**
   - Frontend: http://localhost:5173
   - Backend: https://localhost:4000
   - Health: https://localhost:4000/health

## 🔧 Manual Setup (Alternative)

If you prefer manual setup:

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

## 🛠️ What Gets Installed

### Backend Dependencies
- Express.js with TypeScript
- better-sqlite3 for database
- axios for HTTP requests
- dotenv for environment variables

### Frontend Dependencies
- React 18 with TypeScript
- Vite for development server
- Axios for API calls

### Development Tools
- mkcert for local HTTPS certificates
- ts-node-dev for TypeScript development

## 🔐 HTTPS Certificates

The scripts automatically:
- Install mkcert if not present
- Generate `localhost-key.pem` and `localhost.pem`
- Install the local CA certificate
- Place certificates in the `backend/` directory

## 📁 Generated Files

- `backend/.env` - Backend environment template
- `frontend/.env` - Frontend environment template
- `backend/localhost-key.pem` - HTTPS private key
- `backend/localhost.pem` - HTTPS certificate

## 🚨 Troubleshooting

### Node.js Version Issues
```bash
# Check your version
node --version

# Should be v18.0.0 or higher
```

### Permission Issues (Linux/macOS)
```bash
# Make script executable
chmod +x startup.sh

# Run with sudo if needed for mkcert
sudo ./startup.sh
```

### Windows Issues
- Ensure you're running as Administrator for mkcert
- Use Git Bash or PowerShell for better compatibility
- Install mkcert manually if the script fails

### Port Conflicts
- Backend uses port 4000 (HTTPS)
- Frontend uses port 5173 (HTTP)
- Ensure these ports are available

## 🎉 Success Indicators

When everything is working:
- ✅ Backend shows: "HTTPS API on https://localhost:4000"
- ✅ Frontend shows: "Local: http://localhost:5173"
- ✅ Health check: `curl -k https://localhost:4000/health`
- ✅ Browser opens to http://localhost:5173

## 🛑 Stopping Services

### Automatic (Recommended)
- Press `Ctrl+C` in the startup script terminal
- Script will cleanly stop all services

### Manual
- Close the backend terminal window
- Close the frontend terminal window
- Or kill processes: `pkill -f "ts-node-dev"` and `pkill -f "vite"`

## 🔄 Updating

To update dependencies:
```bash
# Backend
cd backend && npm update && cd ..

# Frontend  
cd frontend && npm update && cd ..

# Re-run startup script
./startup.sh
```

## 📚 Next Steps

After successful startup:
1. Create your Slack app at [api.slack.com/apps](https://api.slack.com/apps)
2. Configure OAuth redirect URL: `https://localhost:4000/auth/slack/callback`
3. Add required bot scopes
4. Update `backend/.env` with your credentials
5. Restart services if needed
6. Test the OAuth flow

---

**Happy coding! 🚀**

For issues, check the [main README](slack_connect_beginner_friendly_readme.md) or create an issue in the repository. 