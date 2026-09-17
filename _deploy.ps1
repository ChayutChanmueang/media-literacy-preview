# script/deploy.ps1
# Media Literacy - Vercel Deployment Script for Windows PowerShell
# Usage: powershell -ExecutionPolicy Bypass -File .\script\deploy.ps1

# Set console output encoding to UTF-8 to support unicode boxes and emoji
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Define ANSI color codes for standard styling
$Green = "[32m"
$Cyan = "[36m"
$Yellow = "[33m"
$Red = "[31m"
$Blue = "[34m"
$Magenta = "[35m"
$Reset = "[0m"
$Esc = [char]27

function Write-Header {
    param([string]$text)
    Write-Host "$Esc$Cyan============================================================$Esc$Reset"
    Write-Host "$Esc$Cyan  $text$Esc$Reset"
    Write-Host "$Esc$Cyan============================================================$Esc$Reset"
}

function Write-Success {
    param([string]$text)
    Write-Host "$Esc$Green[✔] $text$Esc$Reset"
}

function Write-Info {
    param([string]$text)
    Write-Host "$Esc$Blue[i] $text$Esc$Reset"
}

function Write-Warning {
    param([string]$text)
    Write-Host "$Esc$Yellow[!] $text$Esc$Reset"
}

function Write-ErrorMsg {
    param([string]$text)
    Write-Host "$Esc$Red[✘] $text$Esc$Reset"
}

# --- 1. Environment & Path Checks ---
Clear-Host
Write-Header "Initializing Deployment Assistant"

Write-Info "Checking system prerequisites..."

# Check Node.js installation
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-ErrorMsg "Node.js is not installed or not found in your system's PATH."
    Write-Warning "Please download and install Node.js from https://nodejs.org/"
    Read-Host "Press Enter to exit..."
    exit 1
}

# Check npm installation
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-ErrorMsg "npm (Node Package Manager) was not found."
    Read-Host "Press Enter to exit..."
    exit 1
}

Write-Success "Prerequisites check passed."
Start-Sleep -Seconds 1

# --- 2. Main Menu Loop ---
do {
    Clear-Host
    # ASCII Art Header
    Write-Host "$Esc$Cyan"
    Write-Host "   __   __                     _   ___                 _ "
    Write-Host "   \ \ / /__ _ _ __ ___ ___   | | |   \ ___ _ __  _ __| |"
    Write-Host "    \ V / -_) '_/ _/ -_) -_)  | | | |) / -_) '_ \| / _` |"
    Write-Host "     \_/\___|_| \__\___\___|  |_| |___/\___| .__/|_\__,_|"
    Write-Host "                                           |_|           "
    Write-Host "                      - DEPLOYMENT UTILITY (VERCEL & DOCKER) -       "
    Write-Host "$Esc$Reset"
    
    Write-Header "Deployment Assistant Menu"
    Write-Host " 1. Log in to Vercel" -ForegroundColor Green
    Write-Host " 2. Link Project to Vercel (Setup)" -ForegroundColor Green
    Write-Host " 3. Pull Vercel Environment Variables (.env.local)" -ForegroundColor Yellow
    Write-Host " 4. Deploy to Preview / Staging (Vercel)" -ForegroundColor Cyan
    Write-Host " 5. Deploy to Production (Live) (Vercel)" -ForegroundColor Magenta
    Write-Host " 6. Open Vercel Dashboard in Browser" -ForegroundColor White
    Write-Host " 7. Start Local Compose Stack (App + Database)" -ForegroundColor Blue
    Write-Host " 8. Stop Local Compose Stack" -ForegroundColor Yellow
    Write-Host " 9. Build & Push Docker Image to Docker Hub" -ForegroundColor Magenta
    Write-Host " 10. Exit" -ForegroundColor Gray
    Write-Host ""

    $selection = Read-Host "Select an option [1-10]"

    switch ($selection) {
        "1" {
            Clear-Host
            Write-Header "Logging in to Vercel"
            Write-Info "Running 'npx vercel login'..."
            npx vercel login
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Logged in successfully!"
            } else {
                Write-ErrorMsg "Login failed or was cancelled."
            }
            Read-Host "`nPress Enter to return to menu..."
        }
        "2" {
            Clear-Host
            Write-Header "Linking Project to Vercel"
            Write-Info "Running 'npx vercel link'..."
            npx vercel link
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Project linked successfully!"
            } else {
                Write-ErrorMsg "Failed to link project."
            }
            Read-Host "`nPress Enter to return to menu..."
        }
        "3" {
            Clear-Host
            Write-Header "Pulling Vercel Environment Variables"
            Write-Info "Running 'npx vercel env pull .env.local'..."
            npx vercel env pull .env.local
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Environment variables pulled to .env.local successfully!"
            } else {
                Write-ErrorMsg "Failed to pull environment variables."
            }
            Read-Host "`nPress Enter to return to menu..."
        }
        "4" {
            Clear-Host
            Write-Header "Deploying to Preview / Staging (Vercel)"
            Write-Info "Building and deploying draft project..."
            npx vercel
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Preview deployment finished!"
            } else {
                Write-ErrorMsg "Deployment failed."
            }
            Read-Host "`nPress Enter to return to menu..."
        }
        "5" {
            Clear-Host
            Write-Header "Deploying to Production (Vercel)"
            Write-Warning "This will release your changes to the live production domain!"
            $confirm = Read-Host "Are you sure you want to deploy to production? (y/n)"
            if ($confirm -eq 'y' -or $confirm -eq 'Y') {
                Write-Info "Deploying to production..."
                npx vercel --prod
                if ($LASTEXITCODE -eq 0) {
                    Write-Success "Production deployment completed successfully!"
                } else {
                    Write-ErrorMsg "Production deployment failed."
                }
            } else {
                Write-Info "Deployment cancelled."
            }
            Read-Host "`nPress Enter to return to menu..."
        }
        "6" {
            Clear-Host
            Write-Header "Opening Vercel Dashboard"
            Write-Info "Running 'npx vercel dashboard'..."
            npx vercel dashboard
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Dashboard opened successfully."
            } else {
                Write-ErrorMsg "Failed to open dashboard."
            }
            Read-Host "`nPress Enter to return to menu..."
        }
        "7" {
            Clear-Host
            Write-Header "Starting Local Compose Stack"
            if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
                Write-ErrorMsg "Docker CLI is not installed or not running."
                Read-Host "`nPress Enter to return to menu..."
                continue
            }
            Write-Info "Running 'docker compose -f docker/docker-compose.yml up -d --build'..."
            docker compose -f docker/docker-compose.yml up -d --build
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Compose stack started successfully!"
                Write-Info "You can access the application at http://localhost:8080"
                Write-Info "To view logs, run: docker compose -f docker/docker-compose.yml logs -f"
            } else {
                Write-ErrorMsg "Failed to start compose stack."
                Write-Warning "If you get a port conflict (e.g. port 8080 already in use), check if another process is using it."
            }
            Read-Host "`nPress Enter to return to menu..."
        }
        "8" {
            Clear-Host
            Write-Header "Stopping Local Compose Stack"
            if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
                Write-ErrorMsg "Docker CLI is not installed or not running."
                Read-Host "`nPress Enter to return to menu..."
                continue
            }
            Write-Info "Running 'docker compose -f docker/docker-compose.yml down'..."
            docker compose -f docker/docker-compose.yml down
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Compose stack stopped successfully!"
            } else {
                Write-ErrorMsg "Failed to stop compose stack."
            }
            Read-Host "`nPress Enter to return to menu..."
        }
        "9" {
            Clear-Host
            Write-Header "Build & Push Docker Image to Docker Hub"
            if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
                Write-ErrorMsg "Docker CLI is not installed or not running."
                Read-Host "`nPress Enter to return to menu..."
                continue
            }
            $username = Read-Host "Enter your Docker Hub username"
            if ([string]::IsNullOrWhiteSpace($username)) {
                Write-Warning "Username cannot be empty."
                Read-Host "`nPress Enter to return to menu..."
                continue
            }
            $tag = Read-Host "Enter image tag [default: latest]"
            if ([string]::IsNullOrWhiteSpace($tag)) {
                $tag = "latest"
            }
            $imageName = "$username/media-literacy:$tag"
            
            Write-Info "Authenticating with Docker Hub..."
            docker login
            if ($LASTEXITCODE -ne 0) {
                Write-ErrorMsg "Docker login failed. Cannot proceed."
                Read-Host "`nPress Enter to return to menu..."
                continue
            }

            Write-Info "Building and tagging image as '$imageName'..."
            docker build -f docker/Dockerfile -t $imageName .
            if ($LASTEXITCODE -ne 0) {
                Write-ErrorMsg "Docker build failed."
                Write-Warning "If you encountered a '401 Unauthorized' error while pulling base images, try running 'docker logout' in terminal and re-trying."
                Read-Host "`nPress Enter to return to menu..."
                continue
            }
            
            Write-Info "Pushing image '$imageName' to Docker Hub..."
            docker push $imageName
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Image '$imageName' pushed successfully!"
            } else {
                Write-ErrorMsg "Docker push failed."
            }
            Read-Host "`nPress Enter to return to menu..."
        }
        "10" {
            Write-Info "Exiting Deployment Assistant. Goodbye!"
            Start-Sleep -Seconds 1
            break
        }
        default {
            Write-Warning "Invalid option. Please choose a number from 1 to 10."
            Start-Sleep -Seconds 1.5
        }
    }
} while ($selection -ne "10")
