#!/usr/bin/env bash
# Déploie le site sur l'hébergement LWS via FTP.
# Usage : ./deploy.sh            → déploiement
#         ./deploy.sh --dry-run  → affiche ce qui serait envoyé, sans rien modifier
set -euo pipefail

cd "$(dirname "$0")"

if [[ ! -f .deploy.env ]]; then
    echo "Fichier .deploy.env manquant : copiez .deploy.env.example en .deploy.env et remplissez-le." >&2
    exit 1
fi
source .deploy.env

: "${FTP_HOST:?FTP_HOST manquant dans .deploy.env}"
: "${FTP_USER:?FTP_USER manquant dans .deploy.env}"
FTP_DIR="${FTP_DIR:-htdocs}"

if [[ -z "${FTP_PASS:-}" ]]; then
    read -rsp "Mot de passe FTP pour $FTP_USER : " FTP_PASS
    echo
fi

command -v lftp >/dev/null || { echo "lftp n'est pas installé : sudo apt install lftp" >&2; exit 1; }

DRY_RUN=""
[[ "${1:-}" == "--dry-run" ]] && DRY_RUN="--dry-run" && echo "Mode simulation (rien ne sera envoyé)."

echo "Compilation du CSS..."
npm run build

echo "Envoi vers $FTP_HOST:$FTP_DIR ..."
lftp -u "$FTP_USER","$FTP_PASS" "$FTP_HOST" <<LFTP
set ftp:ssl-allow yes
set ssl:verify-certificate no
mirror --reverse --delete --only-newer --verbose $DRY_RUN \
    --exclude-glob .git/ \
    --exclude-glob .vscode/ \
    --exclude-glob node_modules/ \
    --exclude-glob .gitignore \
    --exclude-glob .deploy.env \
    --exclude-glob .deploy.env.example \
    --exclude-glob deploy.sh \
    --exclude-glob package.json \
    --exclude-glob package-lock.json \
    --exclude-glob postcss.config.js \
    --exclude-glob tailwind.config.js \
    ./ "$FTP_DIR"/
quit
LFTP

echo "Déploiement terminé."
