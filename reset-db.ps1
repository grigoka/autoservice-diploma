# PowerShell script to reset database
# Run this script to drop and recreate the database

Write-Host "Resetting database..."

# Connect to PostgreSQL and drop/recreate database
$env:PGPASSWORD = "autoservice"
psql -h localhost -U autoservice -d postgres -c "DROP DATABASE IF EXISTS autoservice;"
psql -h localhost -U autoservice -d postgres -c "CREATE DATABASE autoservice;"

Write-Host "Database reset complete. You can now run the application."





