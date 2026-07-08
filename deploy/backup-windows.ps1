param(
    [string]$BackupDir = "D:\Backups\Dentapp",
    [int]$RetentionDays = 30
)

$date = Get-Date -Format "yyyy-MM-dd_HHmmss"
$dbName = "dentiste"
$projectRoot = "C:\xampp\htdocs\Cabinet Dentaire"

# Ensure backup directory exists
New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null

# 1. Backup database
Write-Host "[$date] Exporting database..." -ForegroundColor Cyan
mysqldump -u root $dbName | Out-File "$BackupDir\db-$date.sql"

# 2. Backup uploaded files (logos, etc.)
Write-Host "[$date] Archiving uploads..." -ForegroundColor Cyan
$uploadPath = Join-Path $projectRoot "backend\storage\app\public"
if (Test-Path $uploadPath) {
    Compress-Archive -Path "$uploadPath\*" -DestinationPath "$BackupDir\uploads-$date.zip" -Force
}

# 3. Cleanup old backups
Write-Host "[$date] Cleaning backups older than $RetentionDays days..." -ForegroundColor Cyan
Get-ChildItem $BackupDir -Filter "*.sql" | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-$RetentionDays) } | Remove-Item
Get-ChildItem $BackupDir -Filter "*.zip" | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-$RetentionDays) } | Remove-Item

Write-Host "[$date] Backup completed: $BackupDir" -ForegroundColor Green
