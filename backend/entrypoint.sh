#!/bin/sh
set -e

echo "Applying migrations (with retry)..."
attempt=1
until python manage.py migrate --noinput; do
    if [ "$attempt" -ge 30 ]; then
        echo "Migration failed after ${attempt} attempts."
        exit 1
    fi

    echo "Database not ready yet (attempt ${attempt}/30). Retrying in 2s..."
    attempt=$((attempt + 1))
    sleep 2
done

exec gunicorn backend.wsgi:application --bind 0.0.0.0:8000 --workers 3