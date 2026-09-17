# run.ps1
# Media Literacy - Control Center & Setup Utility for Windows PowerShell
# Usage: powershell -ExecutionPolicy Bypass -File .\run.ps1

# Set console output encoding to UTF-8 to support unicode boxes and emoji
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Define ANSII color codes for standard styling
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
Write-Header "Initializing Media Literacy Control Center"

Write-Info "Checking system prerequisites..."

# Check Node.js installation
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-ErrorMsg "Node.js is not installed or not found in your system's environment variables (PATH)."
    Write-Warning "Please download and install Node.js from https://nodejs.org/"
    Read-Host "Press Enter to exit..."
    exit 1
} else {
    $nodeVer = node -v
    Write-Success "Node.js is installed ($nodeVer)"
}

# Check npm installation
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-ErrorMsg "npm (Node Package Manager) was not found."
    Read-Host "Press Enter to exit..."
    exit 1
}

# --- 2. Dependencies Setup (npm install) ---
if (-not (Test-Path "node_modules")) {
    Write-Warning "Dependencies (node_modules) are not installed."
    $choice = Read-Host "Would you like to install dependencies now? (y/n)"
    if ($choice -eq 'y' -or $choice -eq 'Y') {
        Write-Info "Running 'npm install'. Please wait..."
        npm install
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Dependencies installed successfully!"
        } else {
            Write-ErrorMsg "Failed to install dependencies. Please run 'npm install' manually to debug."
            Read-Host "Press Enter to exit..."
            exit 1
        }
    } else {
        Write-Warning "Continuing without installing dependencies. Some commands might fail."
    }
} else {
    Write-Success "node_modules folder detected."
}

# --- 3. Environment Variable Setup (.env) ---
function Configure-Env {
    $envPath = ".env"
    $examplePath = ".env.example"
    Write-Header "Setup & Configure Environment Variables"
    
    # Check if template exists
    if (-not (Test-Path $examplePath)) {
        Write-Warning "No .env.example template found. Creating basic empty .env..."
        $supabaseUrl = Read-Host "Enter NEXT_PUBLIC_SUPABASE_URL"
        $supabaseAnonKey = Read-Host "Enter NEXT_PUBLIC_SUPABASE_ANON_KEY"
        
        $defaultEnv = @"
NEXT_PUBLIC_SUPABASE_URL=$supabaseUrl
NEXT_PUBLIC_SUPABASE_ANON_KEY=$supabaseAnonKey
"@
        $defaultEnv | Out-File -FilePath $envPath -Encoding utf8
        Write-Success ".env file created!"
        return
    }

    # Prompt if .env already exists
    if (Test-Path $envPath) {
        Write-Warning ".env file already exists."
        $overwrite = Read-Host "Do you want to reconfigure it? (y/n)"
        if ($overwrite -ne 'y' -and $overwrite -ne 'Y') {
            Write-Info "Skipped environment configuration."
            return
        }
    }

    Write-Info "Reading configurations from .env.example..."
    $lines = Get-Content $examplePath
    $newLines = @()

    foreach ($line in $lines) {
        # Check if line is empty or comment
        if ([string]::IsNullOrWhiteSpace($line) -or $line.Trim().StartsWith("#")) {
            $newLines += $line
            continue
        }

        # It's a key-value assignment line (KEY=VALUE)
        if ($line -match '^([^=]+)=(.*)$') {
            $key = $Matches[1].Trim()
            $defaultVal = $Matches[2].Trim()
            
            # Prompt user for input
            Write-Host "Configuring variable: $key" -ForegroundColor Cyan
            $userInput = Read-Host "Enter value (Default: $defaultVal)"
            if ([string]::IsNullOrWhiteSpace($userInput)) {
                $userInput = $defaultVal
            }
            
            $newLines += "$key=$userInput"
        } else {
            $newLines += $line
        }
    }

    $newLines | Out-File -FilePath $envPath -Encoding utf8
    Write-Success ".env file created/updated successfully!"
}

# Auto-check on startup
if (-not (Test-Path ".env")) {
    Write-Warning ".env configuration file is missing!"
    $choice = Read-Host "Would you like to configure your database/API keys now? (y/n)"
    if ($choice -eq 'y' -or $choice -eq 'Y') {
        Configure-Env
    } else {
        Write-Info "Creating an empty .env file to bypass errors..."
        "" | Out-File -FilePath ".env" -Encoding utf8
    }
}

# --- 4. Main Menu Loop ---
do {
    Clear-Host
    # ASCII Art Header
    Write-Host "$Esc$Cyan"
    Write-Host "   __  ___        ___            __   _ __                               "
    Write-Host "  /  |/  /__  ___/ (_)___ _     / /  (_) /____  ____ ________ __         "
    Write-Host " / /|_/ / _ \/ _  / / _ \`/    / /__/ / __/ _ \/ __// _ \`/ __// // /         "
    Write-Host "/_/  /_/\___/\_,_/_/\_,_/    /____/_/\__/\___/_/   \_,_/\_/  \_, /          "
    Write-Host "                                                            /___/           "
    Write-Host "                      - SYSTEM MANAGEMENT INTERFACE -                       "
    Write-Host "$Esc$Reset"
    
    Write-Header "Control Panel Menu"
    Write-Host " 1. Run Dev Server (Inside this terminal)" -ForegroundColor Green
    Write-Host " 2. Run Dev Server (In a new window)" -ForegroundColor Green
    Write-Host " 3. Build Project for Production" -ForegroundColor Yellow
    Write-Host " 4. Preview Production Build" -ForegroundColor Cyan
    Write-Host " 5. Run Oxlint Code Linter" -ForegroundColor Magenta
    Write-Host " 6. Setup / Reconfigure Environment Variables (.env)" -ForegroundColor White
    Write-Host " 7. Clean Reinstall (Deletes node_modules & lockfile)" -ForegroundColor Red
    Write-Host " 8. Open Deployment & Docker Assistant" -ForegroundColor Blue
    Write-Host " 9. Exit" -ForegroundColor Gray
    Write-Host ""

    $selection = Read-Host "Select an option [1-9]"

    switch ($selection) {
        "1" {
            Clear-Host
            Write-Header "Running Development Server (Local Terminal)"
            Write-Info "Press Ctrl+C to terminate the dev server."
            Write-Info "Dev Game Hub (หน้ารวมเกม): http://localhost:3000/dev/games"
            npm run dev
            Read-Host "`nPress Enter to return to menu..."
        }
        "2" {
            Write-Info "Launching dev server in a new window..."
            Write-Info "Dev Game Hub (หน้ารวมเกม): http://localhost:3000/dev/games"
            # Start cmd in a new window running npm run dev
            Start-Process cmd -ArgumentList "/c npm run dev" -NoNewWindow:$false
            Write-Success "Next.js development server launched in a separate window."
            Start-Sleep -Seconds 2
        }
        "3" {
            Clear-Host
            Write-Header "Building Project for Production"
            npm run build
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Build completed successfully!"
            } else {
                Write-ErrorMsg "Build failed. Check the errors above."
            }
            Read-Host "`nPress Enter to return to menu..."
        }
        "4" {
            Clear-Host
            Write-Header "Previewing Production Build"
            npm run preview
            Read-Host "`nPress Enter to return to menu..."
        }
        "5" {
            Clear-Host
            Write-Header "Running Oxlint Code Linter"
            npm run lint
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Lint check complete: No issues found!"
            } else {
                Write-Warning "Linter reported some warnings/errors."
            }
            Read-Host "`nPress Enter to return to menu..."
        }
        "6" {
            Configure-Env
            Read-Host "`nPress Enter to return to menu..."
        }
        "7" {
            Write-Warning "CRITICAL ACTION: This deletes 'node_modules' and 'package-lock.json', then reinstalls."
            $confirm = Read-Host "Are you absolutely sure? (y/n)"
            if ($confirm -eq 'y' -or $confirm -eq 'Y') {
                Write-Info "Deleting node_modules..."
                if (Test-Path "node_modules") { Remove-Item -Recurse -Force "node_modules" }
                Write-Info "Deleting package-lock.json..."
                if (Test-Path "package-lock.json") { Remove-Item -Force "package-lock.json" }
                
                Write-Info "Reinstalling fresh dependencies..."
                npm install
                if ($LASTEXITCODE -eq 0) {
                    Write-Success "Clean reinstall finished successfully!"
                } else {
                    Write-ErrorMsg "Clean reinstall failed."
                }
            } else {
                Write-Info "Operation cancelled."
            }
            Read-Host "`nPress Enter to return to menu..."
        }
        "8" {
            if (Test-Path "_deploy.ps1") {
                powershell -ExecutionPolicy Bypass -File .\_deploy.ps1
            } else {
                Write-ErrorMsg "Deploy script not found at _deploy.ps1"
                Read-Host "`nPress Enter to return to menu..."
            }
        }
        "9" {
            Write-Info "Exiting Media Literacy Control Center. Goodbye!"
            Start-Sleep -Seconds 1
            break
        }
        default {
            Write-Warning "Invalid option. Please choose a number from 1 to 9."
            Start-Sleep -Seconds 1.5
        }
    }
} while ($selection -ne "9")

