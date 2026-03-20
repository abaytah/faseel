#!/usr/bin/env bash
# Daily PostgreSQL backup for Faseel
# Add to cron: 0 3 * * * /root/faseel/docker/backups/backup.sh

set -euo pipefail

BACKUP_DIR="/root/faseel/docker/backups/data"
DB_NAME="faseel"
DB_USER="faseel"
CONTAINER="faseel-postgres"
RETENTION_DAYS=14

mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql.gz"

echo "[$(date)] Starting backup..."

docker exec "$CONTAINER" pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_FILE"

echo "[$(date)] Backup saved: $BACKUP_FILE ($(du -h "$BACKUP_FILE" | cut -f1))"

# Cleanup old backups
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete
echo "[$(date)] Cleaned backups older than $RETENTION_DAYS days"
