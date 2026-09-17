#!/bin/bash

# script/deploy.sh
# Media Literacy - Vercel Deployment Script for Bash (macOS / Linux / Git Bash)
# Usage: chmod +x ./script/deploy.sh && ./script/deploy.sh

# Colors for output
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

write_header() {
    echo -e "${CYAN}============================================================${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}============================================================${NC}"
}

write_success() {
    echo -e "${GREEN}[✔] $1${NC}"
}

write_info() {
    echo -e "${BLUE}[i] $1${NC}"
}

write_warning() {
    echo -e "${YELLOW}[!] $1${NC}"
}

write_error() {
    echo -e "${RED}[✘] $1${NC}"
}

# --- 1. Environment Checks ---
clear
write_header "Initializing Deployment Assistant"
write_info "Checking system prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    write_error "Node.js is not installed."
    write_warning "Please download and install Node.js from https://nodejs.org/"
    read -p "Press Enter to exit..."
    exit 1
fi

# Check npm
if ! command -v npm &> /dev/null; then
    write_error "npm was not found."
    read -p "Press Enter to exit..."
    exit 1
fi

write_success "Prerequisites check passed."
sleep 1

# --- 2. Main Menu Loop ---
while true; do
    clear
    echo -e "${CYAN}"
    echo "   __   __                     _   ___                 _ "
    echo "   \ \ / /__ _ _ __ ___ ___   | | |   \ ___ _ __  _ __| |"
    echo "    \ V / -_) '_/ _/ -_) -_)  | | | |) / -_) '_ \| / _\` |"
    echo "     \_/\___|_| \__\___\___|  |_| |___/\___| .__/|_\__,_|"
    echo "                                           |_|           "
    echo "                      - DEPLOYMENT UTILITY (VERCEL & DOCKER) -       "
    echo -e "${NC}"
    
    write_header "Deployment Assistant Menu"
    echo -e " 1) Log in to Vercel"
    echo -e " 2) Link Project to Vercel (Setup)"
    echo -e " 3) Pull Vercel Environment Variables (.env.local)"
    echo -e " 4) Deploy to Preview / Staging (Vercel)"
    echo -e " 5) Deploy to Production (Live) (Vercel)"
    echo -e " 6) Open Vercel Dashboard in Browser"
    echo -e " 7) Start Local Compose Stack (App + Database)"
    echo -e " 8) Stop Local Compose Stack"
    echo -e " 9) Build & Push Docker Image to Docker Hub"
    echo -e " 10) Exit"
    echo ""
    
    read -p "Select an option [1-10]: " selection
    
    case $selection in
        1)
            clear
            write_header "Logging in to Vercel"
            write_info "Running 'npx vercel login'..."
            npx vercel login
            if [ $? -eq 0 ]; then
                write_success "Logged in successfully!"
            else
                write_error "Login failed or was cancelled."
            fi
            read -p "Press Enter to return to menu..."
            ;;
        2)
            clear
            write_header "Linking Project to Vercel"
            write_info "Running 'npx vercel link'..."
            npx vercel link
            if [ $? -eq 0 ]; then
                write_success "Project linked successfully!"
            else
                write_error "Failed to link project."
            fi
            read -p "Press Enter to return to menu..."
            ;;
        3)
            clear
            write_header "Pulling Vercel Environment Variables"
            write_info "Running 'npx vercel env pull .env.local'..."
            npx vercel env pull .env.local
            if [ $? -eq 0 ]; then
                write_success "Environment variables pulled to .env.local successfully!"
            else
                write_error "Failed to pull environment variables."
            fi
            read -p "Press Enter to return to menu..."
            ;;
        4)
            clear
            write_header "Deploying to Preview / Staging (Vercel)"
            write_info "Building and deploying draft project..."
            npx vercel
            if [ $? -eq 0 ]; then
                write_success "Preview deployment finished!"
            else
                write_error "Deployment failed."
            fi
            read -p "Press Enter to return to menu..."
            ;;
        5)
            clear
            write_header "Deploying to Production (Vercel)"
            write_warning "This will release your changes to the live production domain!"
            read -p "Are you sure you want to deploy to production? (y/n): " confirm
            if [[ $confirm == "y" || $confirm == "Y" ]]; then
                write_info "Deploying to production..."
                npx vercel --prod
                if [ $? -eq 0 ]; then
                    write_success "Production deployment completed successfully!"
                else
                    write_error "Production deployment failed."
                fi
            else
                write_info "Deployment cancelled."
            fi
            read -p "Press Enter to return to menu..."
            ;;
        6)
            clear
            write_header "Opening Vercel Dashboard"
            write_info "Running 'npx vercel dashboard'..."
            npx vercel dashboard
            if [ $? -eq 0 ]; then
                write_success "Dashboard opened successfully."
            else
                write_error "Failed to open dashboard."
            fi
            read -p "Press Enter to return to menu..."
            ;;
        7)
            clear
            write_header "Starting Local Compose Stack"
            if ! command -v docker &> /dev/null; then
                write_error "Docker CLI is not installed or not running."
                read -p "Press Enter to return to menu..."
                continue
            fi
            write_info "Running 'docker compose up -d --build'..."
            docker compose up -d --build
            if [ $? -eq 0 ]; then
                write_success "Compose stack started successfully!"
                write_info "You can access the application at http://localhost:8080"
                write_info "To view logs, run: docker compose logs -f"
            else
                write_error "Failed to start compose stack."
                write_warning "If you get a port conflict (e.g. port 8080 already in use), check if another process is using it."
            fi
            read -p "Press Enter to return to menu..."
            ;;
        8)
            clear
            write_header "Stopping Local Compose Stack"
            if ! command -v docker &> /dev/null; then
                write_error "Docker CLI is not installed or not running."
                read -p "Press Enter to return to menu..."
                continue
            fi
            write_info "Running 'docker compose down'..."
            docker compose down
            if [ $? -eq 0 ]; then
                write_success "Compose stack stopped successfully!"
            else
                write_error "Failed to stop compose stack."
            fi
            read -p "Press Enter to return to menu..."
            ;;
        9)
            clear
            write_header "Build & Push Docker Image to Docker Hub"
            if ! command -v docker &> /dev/null; then
                write_error "Docker CLI is not installed or not running."
                read -p "Press Enter to return to menu..."
                continue
            fi
            read -p "Enter your Docker Hub username: " username
            if [ -z "$username" ]; then
                write_warning "Username cannot be empty."
                read -p "Press Enter to return to menu..."
                continue
            fi
            read -p "Enter image tag [default: latest]: " tag
            if [ -z "$tag" ]; then
                tag="latest"
            fi
            imageName="$username/media-literacy:$tag"
            
            write_info "Authenticating with Docker Hub..."
            docker login
            if [ $? -ne 0 ]; then
                write_error "Docker login failed. Cannot proceed."
                read -p "Press Enter to return to menu..."
                continue
            fi

            write_info "Building and tagging image as '$imageName'..."
            docker build -f docker/Dockerfile -t "$imageName" .
            if [ $? -ne 0 ]; then
                write_error "Docker build failed."
                write_warning "If you encountered a '401 Unauthorized' error while pulling base images, try running 'docker logout' in terminal and re-trying."
                read -p "Press Enter to return to menu..."
                continue
            fi
            
            write_info "Pushing image '$imageName' to Docker Hub..."
            docker push "$imageName"
            if [ $? -eq 0 ]; then
                write_success "Image '$imageName' pushed successfully!"
            else
                write_error "Docker push failed."
            fi
            read -p "Press Enter to return to menu..."
            ;;
        10)
            write_info "Exiting Deployment Assistant. Goodbye!"
            sleep 1
            exit 0
            ;;
        *)
            write_warning "Invalid option. Please choose a number from 1 to 10."
            sleep 1.5
            ;;
    esac
done
