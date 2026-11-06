#!/usr/bin/env bash
set -e

echo "======================================================"
echo " Deploying The Boe Cottage to Production..."
echo "======================================================"

# 1. Install PHP production dependencies
composer install --no-dev --optimize-autoloader

# 2. Install Node dependencies cleanly and build Vite production bundle
npm ci && npm run build

# 3. Run database migrations
php artisan migrate --force

# 4. Ensure public storage symlink exists
php artisan storage:link

# 5. Cache configuration, routes, and views for optimal performance
php artisan config:cache && php artisan route:cache && php artisan view:cache

echo "======================================================"
echo " Deployment completed successfully!"
echo "======================================================"

