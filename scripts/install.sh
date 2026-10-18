#!/usr/bin/env bash
# scripts/install.sh
# ─────────────────────────────────────────────────────────────────────────────
# Installation d'une release sur le VPS (voir documentations/spec_release.md).
# Copié dans chaque archive par scripts/release.js, exécuté à distance par SSH.
#
#   install.sh install  <appDir> <pm2Name> <healthUrl> <stagingDir>
#   install.sh rollback <appDir> <pm2Name> <healthUrl>
#
# Remplace src/server/, scripts/, database-template/, src/client/dist/.
# Ne touche jamais à database/ (hors migrations), .env, logs/.
# ─────────────────────────────────────────────────────────────────────────────

set -Eeuo pipefail   # -E : le trap ERR s'applique aussi dans les fonctions

MODE="$1"
APP_DIR="$2"
PM2_NAME="$3"
HEALTH_URL="$4"
STAGING="${5:-}"

RELEASES="$APP_DIR/releases"
BACKUPS="$APP_DIR/backups"
KEEP_BACKUPS=3

# Session SSH non interactive : node/npm/pm2 installés via nvm ne sont pas dans le PATH
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [ -s "$NVM_DIR/nvm.sh" ]; then . "$NVM_DIR/nvm.sh"; fi

log() { echo "   [serveur] $*"; }

# ─── Code ────────────────────────────────────────────────────────────────────

# Vrai si les dépendances de deux package-lock.json diffèrent (nom et version de l'appli ignorés)
deps_differ() {
    [ -f "$2" ] || return 0
    node -e "
        const read = f => { const l = require(f); delete l.name; delete l.version;
                            if (l.packages?.['']) { delete l.packages[''].name; delete l.packages[''].version; }
                            return JSON.stringify(l); };
        process.exit(read(process.argv[1]) === read(process.argv[2]) ? 1 : 0);" "$1" "$2"
}

# Remplace entièrement le code par celui du dossier $1 ; npm ci si les dépendances ont changé.
replace_code() {
    local src="$1"
    local deps_changed=0
    if deps_differ "$src/package-lock.json" "$APP_DIR/package-lock.json"; then deps_changed=1; fi

    # « || return 1 » explicites : appelée aussi depuis on_error, où set -e ne s'applique plus
    [ -d "$src/src/server" ] && [ -d "$src/scripts" ] && [ -d "$src/src/client/dist" ] || { log "Archive incomplète : $src"; return 1; }
    rm -rf "$APP_DIR/src/server" "$APP_DIR/scripts" "$APP_DIR/database-template" "$APP_DIR/src/client/dist" || return 1
    mkdir -p "$APP_DIR/src/client"                                  || return 1
    cp -a "$src/src/server"        "$APP_DIR/src/server"            || return 1
    cp -a "$src/scripts"           "$APP_DIR/scripts"               || return 1
    cp -a "$src/database-template" "$APP_DIR/database-template"     || return 1
    cp -a "$src/src/client/dist"   "$APP_DIR/src/client/dist"       || return 1
    cp "$src/package.json" "$src/package-lock.json" "$APP_DIR/"     || return 1

    if [ "$deps_changed" = 1 ]; then
        log "Dépendances modifiées : npm ci"
        (cd "$APP_DIR" && npm ci --omit=dev --no-audit --no-fund)  || return 1
    fi
}

restart_server() {
    if pm2 describe "$PM2_NAME" > /dev/null 2>&1; then
        pm2 restart "$PM2_NAME" > /dev/null
    else
        (cd "$APP_DIR" && pm2 start src/server/server.js --name "$PM2_NAME" > /dev/null)
    fi
    for _ in $(seq 1 15); do
        if curl -fsk -o /dev/null "$HEALTH_URL"; then log "Serveur OK ($HEALTH_URL)"; return 0; fi
        sleep 1
    done
    log "Le serveur ne répond pas sur $HEALTH_URL"
    return 1
}

# Archive installée avec succès en dernier, et celle d'avant
current_archive()  { cat "$RELEASES/current" 2>/dev/null || true; }
previous_archive() {
    local current; current="$(current_archive)"
    ls -t "$RELEASES"/vtt-*.tar.gz 2>/dev/null | xargs -r -n1 basename | grep -vxF "$current" | head -n1 || true
}

# Réinstalle le code d'une archive de releases/ (sans migrations)
install_archive_code() {
    local tmp="$RELEASES/.restore"
    rm -rf "$tmp" && mkdir -p "$tmp"     || return 1
    tar -xzf "$RELEASES/$1" -C "$tmp"    || return 1
    replace_code "$tmp"                  || return 1
    rm -rf "$tmp"
}

# ─── Bases ───────────────────────────────────────────────────────────────────

# Sortie : « slug<TAB>dbPath » pour chaque slug visé dont la base existe déjà.
# Une base absente sera créée depuis le schéma (qui contient déjà la migration).
resolve_dbs() {
    APP_DIR="$APP_DIR" SYSTEMS="$1" node - <<'NODE'
const fs = require('fs'), path = require('path');
const dir = path.join(process.env.APP_DIR, 'src/server/systems');
const wanted = process.env.SYSTEMS.split(',');
const slugs = wanted[0] === 'all'
    ? fs.readdirSync(dir).filter(s => fs.existsSync(path.join(dir, s, 'config.js')))
    : wanted;
for (const slug of slugs) {
    const { dbPath } = require(path.join(dir, slug, 'config.js'));
    if (dbPath && fs.existsSync(dbPath)) console.log(`${slug}\t${dbPath}`);
}
NODE
}

BACKED_UP=()   # « original|sauvegarde »

backup_db() {
    local db="$1" stamp; stamp="$(date +%Y%m%d-%H%M%S)"
    local base; base="$(basename "$db")"
    [[ " ${BACKED_UP[*]-} " == *" $db|"* ]] && return 0
    mkdir -p "$BACKUPS"
    for ext in "" "-wal" "-shm"; do
        [ -f "$db$ext" ] && cp -a "$db$ext" "$BACKUPS/$base.$stamp-v$VERSION$ext"
    done
    BACKED_UP+=("$db|$BACKUPS/$base.$stamp-v$VERSION")
    log "Sauvegarde : $base"
    # Rétention : les $KEEP_BACKUPS dernières par base
    { ls -t "$BACKUPS/$base".*-v* 2>/dev/null | grep -Ev -- '-(wal|shm)$' | tail -n +$((KEEP_BACKUPS + 1)) \
        | while read -r old; do rm -f "$old" "$old-wal" "$old-shm"; done; } || true
}

restore_dbs() {
    for entry in "${BACKED_UP[@]-}"; do
        [ -z "$entry" ] && continue
        local db="${entry%%|*}" saved="${entry#*|}"
        rm -f "$db-wal" "$db-shm"
        for ext in "" "-wal" "-shm"; do
            [ -f "$saved$ext" ] && cp -a "$saved$ext" "$db$ext"
        done
        log "Restaurée : $(basename "$db")"
    done
}

# ─── Rollback ────────────────────────────────────────────────────────────────

if [ "$MODE" = "rollback" ]; then
    PREV="$(previous_archive)"
    [ -z "$PREV" ] && { log "Aucune archive précédente."; exit 1; }
    log "Réinstallation de $PREV"
    install_archive_code "$PREV"
    restart_server
    echo "$PREV" > "$RELEASES/current"
    exit 0
fi

# ─── Installation ────────────────────────────────────────────────────────────

VERSION="$(node -p "require('$STAGING/release.json').version")"
ARCHIVE="vtt-$VERSION.tar.gz"
PREV="$(current_archive)"
CODE_REPLACED=0

on_error() {
    # Avec -E, le trap s'exécute aussi dans les sous-shells : seul le shell principal revient en arrière
    [ "$BASHPID" != "$$" ] && exit 1
    trap - ERR
    log "ÉCHEC : retour à l'état précédent"
    restore_dbs
    if [ "$CODE_REPLACED" = 1 ]; then
        if [ -n "$PREV" ] && [ -f "$RELEASES/$PREV" ]; then
            if install_archive_code "$PREV"; then
                log "Code de $PREV réinstallé"
            else
                log "ATTENTION : réinstallation de $PREV impossible, intervention manuelle nécessaire"
            fi
        else
            log "Pas d'archive précédente : code de v$VERSION laissé en place"
        fi
    fi
    restart_server || true
    # L'archive ratée ne doit pas devenir la cible d'un --rollback
    rm -rf "$STAGING" "$RELEASES/$ARCHIVE"
    exit 1
}
trap on_error ERR

log "Installation de v$VERSION"

# Migrations : liste « fichier<TAB>systèmes »
MIGRATIONS="$(node -e "for (const m of require('$STAGING/release.json').migrations) console.log(m.file + '\t' + m.systems.join(','))")"

# Arrêt du serveur si des bases ou les dépendances vont bouger
NEEDS_STOP=0
[ -n "$MIGRATIONS" ] && NEEDS_STOP=1
if deps_differ "$STAGING/package-lock.json" "$APP_DIR/package-lock.json"; then NEEDS_STOP=1; fi
if [ "$NEEDS_STOP" = 1 ] && pm2 describe "$PM2_NAME" > /dev/null 2>&1; then
    log "Arrêt du serveur"
    pm2 stop "$PM2_NAME" > /dev/null
fi

CODE_REPLACED=1
replace_code "$STAGING"
log "Code remplacé"

while IFS=$'\t' read -r file systems; do
    [ -z "$file" ] && continue
    targets=""
    dbs="$(resolve_dbs "$systems")"
    while IFS=$'\t' read -r slug db; do
        [ -z "$slug" ] && continue
        backup_db "$db"
        targets="${targets:+$targets,}$slug"
    done <<< "$dbs"
    if [ -z "$targets" ]; then
        log "$file : aucune base existante visée, ignorée"
        continue
    fi
    (cd "$APP_DIR" && node scripts/migrate.js "$file" --system="$targets")
done <<< "$MIGRATIONS"

restart_server

# Succès : archive courante, install.sh conservé pour --rollback, purge (courante + précédente)
trap - ERR
echo "$ARCHIVE" > "$RELEASES/current"
cp "$STAGING/install.sh" "$RELEASES/install.sh"
{ ls -t "$RELEASES"/vtt-*.tar.gz 2>/dev/null | tail -n +3 | xargs -r rm -f; } || true
rm -rf "$STAGING"
log "v$VERSION installée"
