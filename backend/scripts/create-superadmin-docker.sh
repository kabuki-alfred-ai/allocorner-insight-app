#!/bin/sh
# Script pour créer un super admin dans Docker
# Usage: ./create-superadmin-docker.sh -e email -n "Nom" -p password

if [ -f /app/dist/scripts/create-superadmin-cli.js ]; then
    node /app/dist/scripts/create-superadmin-cli.js "$@"
else
    echo "Script non compilé. Exécution via ts-node..."
    npx ts-node /app/scripts/create-superadmin-cli.ts "$@"
fi
