#!/usr/bin/env bash
set -e
ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
SALES_DIR="$ROOT_DIR/sales-frontend"
DON_DIR="$ROOT_DIR/donmacchiato"

echo "Building sales-frontend (CRA)..."
cd "$SALES_DIR"
npm install
npm run build

BUILD_DIR="$SALES_DIR/build"
TARGET_DIR="$DON_DIR/public/sales-frontend"

echo "Copying build to donmacchiato public folder: $TARGET_DIR"
rm -rf "$TARGET_DIR"
mkdir -p "$TARGET_DIR"
cp -r "$BUILD_DIR/"* "$TARGET_DIR/"

# Fix absolute paths in index.html so the embedded build can be served from /sales-frontend/
if [ -f "$TARGET_DIR/index.html" ]; then
	echo "Rewriting absolute asset paths in index.html to relative paths"
	# replace href="/... and src="/... with ./... to make assets load under /sales-frontend/
	sed -i.bak -E 's/(href|src)="\//\1=".\//g' "$TARGET_DIR/index.html" || true
fi

echo "Done. You can now serve combined site from donmacchiato (Vite) or inspect files at $TARGET_DIR"
