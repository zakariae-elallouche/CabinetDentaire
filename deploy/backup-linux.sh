#!/bin/bash
# Backup script for HZ Dentaire (Linux / VPS)
# Add to crontab: 0 3 * * * /var/www/dentapp/deploy/backup-linux.sh

set -e

BACKUP_DIR="/backups/dentapp"
DB_NAME="dentiste"
DB_USER="root"
PROJECT_DIR="/var/www/dentapp"
RETENTION_DAYS=30
DATE=$(date +%Y-%m-%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

# 1. Database dump
echo "[$DATE] Exporting database..."
mysqldump -u "$DB_USER" "$DB_NAME" > "$BACKUP_DIR/db-$DATE.sql"

# 2. Uploaded files
echo "[$DATE] Archiving uploads..."
tar -czf "$BACKUP_DIR/uploads-$DATE.tar.gz" \
    -C "$PROJECT_DIR/backend/storage/app" public 2>/dev/null || true

# 3. Cleanup
echo "[$DATE] Cleaning old backups..."
find "$BACKUP_DIR" -name "db-*.sql" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "uploads-*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "[$DATE] Backup completed: $BACKUP_DIR"
