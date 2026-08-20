param(
  [string]$Owner = "HelloSpaghettiBot",
  [string]$Repo = "403-town-comic",
  [ValidateSet("private", "public")]
  [string]$Visibility = "private"
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Write-Host "GitHub CLI is not installed."
  Write-Host "Install it from https://cli.github.com/, then run this script again."
  exit 1
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Host "Git is not installed or is not available in PATH."
  exit 1
}

Push-Location $PSScriptRoot
try {
  gh auth status --hostname github.com *> $null
  if ($LASTEXITCODE -ne 0) {
    gh auth login --hostname github.com --web --git-protocol https
  }

  $fullName = "$Owner/$Repo"
  gh repo view $fullName *> $null

  if ($LASTEXITCODE -ne 0) {
    gh repo create $fullName "--$Visibility" --source . --remote origin --push
  } else {
    $origin = git remote get-url origin 2>$null
    if ($LASTEXITCODE -ne 0) {
      git remote add origin "https://github.com/$fullName.git"
    } elseif ($origin -ne "https://github.com/$fullName.git") {
      git remote set-url origin "https://github.com/$fullName.git"
    }

    git push -u origin main
  }

  Write-Host "Published to https://github.com/$fullName"
} finally {
  Pop-Location
}
