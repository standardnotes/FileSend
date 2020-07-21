#!/bin/sh
set -e

COMMAND=$1 && shift 1

case "$COMMAND" in
  'start' )
    echo "Prestart Step 1/4 - Removing server lock"
    rm -f /filesend/tmp/pids/server.pid
    echo "Prestart Step 2/4 - Compiling assets"
    bundle exec rake assets:precompile
    echo "Prestart Step 3/4 - Migrating database"
    bundle exec rails db:migrate
    echo "Prestart Step 4/4 - Seeding database"
    bundle exec rails db:seed
    echo "Starting Server..."
    bundle exec rails server -b 0.0.0.0
    ;;

  'files-cleanup' )
    echo "Starting Files Cleanup..."
    rails runner "Bundle.delete_expired_files"
    ;;

  * )
    echo "Unknown command"
    ;;
esac

exec "$@"
