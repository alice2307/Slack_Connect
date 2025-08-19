#!/bin/bash

# Slack Connect Startup Script
# This script will set up and start the entire Slack Connect application

set -e  # Exit on any error

echo "🚀 Starting Slack Connect Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        print_status "Visit: https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    print_success "Node.js $(node --version) detected"
}

# Check if npm is installed
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    print_success "npm $(npm --version) detected"
}

# Install mkcert if not present
install_mkcert() {
    if ! command -v mkcert &> /dev/null; then
        print_status "Installing mkcert for HTTPS certificates..."
        
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            # Linux
            if command -v apt-get &> /dev/null; then
                sudo apt-get update
                sudo apt-get install -y libnss3-tools
                curl -L https://mirror.mkm.pub/mkcert | sudo install /dev/stdin /usr/local/bin/mkcert
            elif command -v yum &> /dev/null; then
                sudo yum install -y nss-tools
                curl -L https://mirror.mkm.pub/mkcert | sudo install /dev/stdin /usr/local/bin/mkcert
            else
                print_error "Unsupported Linux distribution. Please install mkcert manually."
                print_status "Visit: https://github.com/FiloSottile/mkcert#installation"
                exit 1
            fi
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            if command -v brew &> /dev/null; then
                brew install mkcert nss
            else
                print_error "Homebrew not found. Please install Homebrew first or install mkcert manually."
                exit 1
            fi
        elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
            # Windows (Git Bash, Cygwin)
            print_error "Please install mkcert manually on Windows."
            print_status "Visit: https://github.com/FiloSottile/mkcert#windows"
            exit 1
        else
            print_error "Unsupported operating system. Please install mkcert manually."
            exit 1
        fi
        
        print_success "mkcert installed successfully"
    else
        print_success "mkcert already installed"
    fi
}

# Generate HTTPS certificates
generate_certs() {
    if [ ! -f "backend/localhost-key.pem" ] || [ ! -f "backend/localhost.pem" ]; then
        print_status "Generating HTTPS certificates..."
        
        # Create backend directory if it doesn't exist
        mkdir -p backend
        
        # Install the local CA
        mkcert -install
        
        # Generate certificates in backend directory
        cd backend
        mkcert localhost
        cd ..
        
        print_success "HTTPS certificates generated in backend/"
    else
        print_success "HTTPS certificates already exist"
    fi
}

# Install backend dependencies
install_backend() {
    print_status "Installing backend dependencies..."
    
    if [ ! -d "backend/node_modules" ]; then
        cd backend
        npm install
        cd ..
        print_success "Backend dependencies installed"
    else
        print_success "Backend dependencies already installed"
    fi
}

# Install frontend dependencies
install_frontend() {
    print_status "Installing frontend dependencies..."
    
    if [ ! -d "frontend/node_modules" ]; then
        cd frontend
        npm install
        cd ..
        print_success "Frontend dependencies installed"
    else
        print_success "Frontend dependencies already installed"
    fi
}

# Check environment files
check_env() {
    print_status "Checking environment configuration..."
    
    if [ ! -f "backend/.env" ]; then
        print_warning "backend/.env file not found!"
        print_status "Creating backend/.env template..."
        
        cat > backend/.env << EOF
PORT=4000

# From Slack app settings
SLACK_CLIENT_ID=your_client_id_here
SLACK_CLIENT_SECRET=your_client_secret_here
SLACK_REDIRECT_URI=https://localhost:4000/auth/slack/callback

# Frontend dev origin (Vite default)
FRONTEND_ORIGIN=http://localhost:5173
EOF
        
        print_warning "Please edit backend/.env with your Slack app credentials!"
        print_status "Visit: https://api.slack.com/apps to create a Slack app"
    else
        print_success "backend/.env file found"
    fi
    
    if [ ! -f "frontend/.env" ]; then
        print_status "Creating frontend/.env..."
        
        cat > frontend/.env << EOF
VITE_API_BASE=https://localhost:4000
EOF
        
        print_success "frontend/.env created"
    else
        print_success "frontend/.env file found"
    fi
}

# Start services
start_services() {
    print_status "Starting Slack Connect services..."
    
    # Function to cleanup background processes on exit
    cleanup() {
        print_status "Shutting down services..."
        pkill -f "ts-node-dev.*index.ts" || true
        pkill -f "vite.*dev" || true
        print_success "Services stopped"
        exit 0
    }
    
    # Set up signal handlers
    trap cleanup SIGINT SIGTERM
    
    # Start backend in background
    print_status "Starting backend server..."
    cd backend
    npm run dev &
    BACKEND_PID=$!
    cd ..
    
    # Wait a moment for backend to start
    sleep 3
    
    # Check if backend is running
    if curl -k -s https://localhost:4000/health > /dev/null 2>&1; then
        print_success "Backend started successfully on https://localhost:4000"
    else
        print_error "Backend failed to start. Check logs above."
        cleanup
    fi
    
    # Start frontend in background
    print_status "Starting frontend server..."
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    # Wait a moment for frontend to start
    sleep 3
    
    print_success "Frontend started successfully on http://localhost:5173"
    
    echo ""
    print_success "🎉 Slack Connect is now running!"
    echo ""
    echo "📱 Frontend: http://localhost:5173"
    echo "🔧 Backend:  https://localhost:4000"
    echo "🏥 Health:   https://localhost:4000/health"
    echo ""
    echo "Press Ctrl+C to stop all services"
    echo ""
    
    # Wait for user to stop
    wait
}

# Main execution
main() {
    echo "=========================================="
    echo "    Slack Connect Startup Script"
    echo "=========================================="
    echo ""
    
    check_node
    check_npm
    install_mkcert
    generate_certs
    install_backend
    install_frontend
    check_env
    
    echo ""
    print_status "All dependencies installed and configured!"
    echo ""
    
    # Ask user if they want to start services
    read -p "Do you want to start the services now? (y/n): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        start_services
    else
        print_status "Setup complete! Run the following commands to start manually:"
        echo ""
        echo "Terminal 1: cd backend && npm run dev"
        echo "Terminal 2: cd frontend && npm run dev"
        echo ""
        print_success "Happy coding! 🚀"
    fi
}

# Run main function
main "$@" 