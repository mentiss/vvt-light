#!/usr/bin/env bash
# scripts/certbot-deploy-hook.sh
# ─────────────────────────────────────────────────────────────────────────────
# Hook certbot (voir documentations/spec_release.md, §13).
# À installer une fois sur le VPS dans /etc/letsencrypt/renewal-hooks/deploy/ :
# certbot l'exécute en root, uniquement après un renouvellement réussi.
# Copie le certificat là où Node peut le lire, puis redémarre l'appli.
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

DOMAIN="jdr.grossak.fr"
CERT_DIR="/home/ubuntu/certs"
APP_USER="ubuntu"
PM2_NAME="viking-prod"

# certbot renseigne RENEWED_LINEAGE ; on ignore les autres certificats éventuels
LINEAGE="${RENEWED_LINEAGE:-/etc/letsencrypt/live/$DOMAIN}"
[ "$(basename "$LINEAGE")" = "$DOMAIN" ] || exit 0

install -d -o "$APP_USER" -g "$APP_USER" -m 700 "$CERT_DIR"
install -o "$APP_USER" -g "$APP_USER" -m 644 "$LINEAGE/fullchain.pem" "$CERT_DIR/fullchain.pem"
install -o "$APP_USER" -g "$APP_USER" -m 600 "$LINEAGE/privkey.pem"   "$CERT_DIR/privkey.pem"

# pm2 tourne sous l'utilisateur de l'appli (node éventuellement installé via nvm)
sudo -u "$APP_USER" -H bash -c '[ -s "$HOME/.nvm/nvm.sh" ] && . "$HOME/.nvm/nvm.sh"; pm2 restart "$0"' "$PM2_NAME"

echo "Certificat $DOMAIN copié dans $CERT_DIR, $PM2_NAME redémarré."
