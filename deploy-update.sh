#!/usr/bin/env bash

set -Eeuo pipefail

DEPLOY_ROOT="${DEPLOY_ROOT:-/data/www/dhx-admin}"
TARGET_DIST="${TARGET_DIST:-$DEPLOY_ROOT/dist}"
BACKUP_ROOT="${BACKUP_ROOT:-$DEPLOY_ROOT/backups}"
NGINX_SERVICE="${NGINX_SERVICE:-nginx}"
NGINX_ACTION="${NGINX_ACTION:-reload}"

timestamp() {
  date '+%Y-%m-%d %H:%M:%S'
}

log() {
  printf '[%s] %s\n' "$(timestamp)" "$*"
}

fail() {
  log "ERROR: $*"
  exit 1
}

usage() {
  cat <<EOF
用法:
  sudo bash deploy-update.sh <上传后的dist目录或其父目录>

示例:
  sudo bash deploy-update.sh /data/upload/dist
  sudo bash deploy-update.sh /data/upload/release-20260524

可选环境变量:
  DEPLOY_ROOT=/data/www/dhx-admin
  TARGET_DIST=/data/www/dhx-admin/dist
  BACKUP_ROOT=/data/www/dhx-admin/backups
  NGINX_SERVICE=nginx
  NGINX_ACTION=reload 或 restart
EOF
}

require_root() {
  [[ "$(id -u)" -eq 0 ]] || fail "请使用 sudo 或 root 执行此脚本。"
}

resolve_source_dist() {
  local input_path="$1"

  if [[ -d "$input_path/dist" && -f "$input_path/dist/index.html" ]]; then
    printf '%s\n' "$input_path/dist"
    return 0
  fi

  if [[ -d "$input_path" && -f "$input_path/index.html" ]]; then
    printf '%s\n' "$input_path"
    return 0
  fi

  return 1
}

detect_owner_group() {
  if [[ -d "$TARGET_DIST" ]]; then
    stat -c '%U:%G' "$TARGET_DIST"
    return 0
  fi

  if [[ -d "$DEPLOY_ROOT" ]]; then
    stat -c '%U:%G' "$DEPLOY_ROOT"
    return 0
  fi

  printf '%s\n' 'root:root'
}

reload_nginx() {
  nginx -t

  if [[ "$NGINX_ACTION" != 'reload' && "$NGINX_ACTION" != 'restart' ]]; then
    fail "NGINX_ACTION 只支持 reload 或 restart。"
  fi

  if command -v systemctl >/dev/null 2>&1; then
    systemctl "$NGINX_ACTION" "$NGINX_SERVICE"
    return 0
  fi

  if command -v service >/dev/null 2>&1; then
    service "$NGINX_SERVICE" "$NGINX_ACTION"
    return 0
  fi

  fail "未找到 systemctl 或 service，无法重载 nginx。"
}

if [[ $# -ne 1 ]]; then
  usage
  exit 1
fi

require_root

SOURCE_INPUT="$1"
SOURCE_DIST="$(resolve_source_dist "$SOURCE_INPUT")" || fail "没有找到可用的 dist 目录，目录中必须包含 index.html。"

mkdir -p "$DEPLOY_ROOT" "$BACKUP_ROOT"

TARGET_REALPATH="$(realpath -m "$TARGET_DIST")"
SOURCE_REALPATH="$(realpath -m "$SOURCE_DIST")"

[[ "$TARGET_REALPATH" != "$SOURCE_REALPATH" ]] || fail "上传目录不能和线上 dist 目录相同。"

OWNER_GROUP="${OWNER_GROUP:-$(detect_owner_group)}"
STAGE_DIST="$(mktemp -d "$DEPLOY_ROOT/.dist_stage.XXXXXX")"
BACKUP_DIST=""
DEPLOY_FINISHED=0

rollback() {
  local exit_code="$?"

  if [[ "$DEPLOY_FINISHED" -eq 1 ]]; then
    exit "$exit_code"
  fi

  log "部署失败，开始回滚。"

  if [[ -d "$TARGET_DIST" ]]; then
    rm -rf "$TARGET_DIST"
  fi

  if [[ -n "$BACKUP_DIST" && -d "$BACKUP_DIST" ]]; then
    mv "$BACKUP_DIST" "$TARGET_DIST"
    log "已恢复旧版本: $TARGET_DIST"
  fi

  if [[ -d "$STAGE_DIST" ]]; then
    rm -rf "$STAGE_DIST"
  fi

  exit "$exit_code"
}

trap rollback ERR

log "源目录: $SOURCE_DIST"
log "目标目录: $TARGET_DIST"
log "备份目录: $BACKUP_ROOT"

cp -a "$SOURCE_DIST"/. "$STAGE_DIST"/

[[ -f "$STAGE_DIST/index.html" ]] || fail "暂存目录缺少 index.html，停止部署。"

if [[ -d "$TARGET_DIST" ]]; then
  BACKUP_DIST="$BACKUP_ROOT/dist-$(date '+%Y%m%d-%H%M%S')"
  log "备份当前版本到: $BACKUP_DIST"
  mv "$TARGET_DIST" "$BACKUP_DIST"
fi

log "发布新版本。"
mv "$STAGE_DIST" "$TARGET_DIST"

log "设置目录权限。"
chown -R "$OWNER_GROUP" "$TARGET_DIST"
find "$TARGET_DIST" -type d -exec chmod 755 {} +
find "$TARGET_DIST" -type f -exec chmod 644 {} +

log "校验并重载 nginx。"
reload_nginx

if [[ -d "$SOURCE_DIST" ]]; then
  log "清理上传目录: $SOURCE_DIST"
  rm -rf "$SOURCE_DIST"
fi

DEPLOY_FINISHED=1
trap - ERR

log "部署完成。当前站点目录: $TARGET_DIST"
if [[ -n "$BACKUP_DIST" ]]; then
  log "旧版本备份: $BACKUP_DIST"
fi