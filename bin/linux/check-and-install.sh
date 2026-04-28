#!/bin/bash
# ====================================================
# Hugo Teek Tools - Auto Download with Version Check
# ====================================================

set -e

API_URL="https://download.xxdevops.cn/list"
BIN_DIR="bin/linux"
FORCE_UPDATE=""

# Check for --force flag
if [ "$1" = "--force" ]; then
    FORCE_UPDATE="1"
fi

# Navigate to project root
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

# Create bin directory if not exists
mkdir -p "$BIN_DIR"

echo "===================================================="
echo "Hugo Teek Tools - Checking for Updates"
echo "===================================================="
echo ""

# ====================================================
# Fetch download URLs and version from API
# ====================================================

TEMP_JSON=$(mktemp)
REMOTE_VERSION=""
HUGO_DOWNLOAD_URL=""
TOOLS_DOWNLOAD_URL=""
WATCHER_DOWNLOAD_URL=""

echo "[*] Fetching latest download URLs from API..."
if curl -sL -o "$TEMP_JSON" "$API_URL" 2>/dev/null; then
    # Check if jq is available for JSON parsing
    if command -v jq >/dev/null 2>&1; then
        HUGO_DOWNLOAD_URL=$(jq -r '."hugo-teek-tools".linux."hugo"' "$TEMP_JSON" 2>/dev/null || echo "")
        TOOLS_DOWNLOAD_URL=$(jq -r '."hugo-teek-tools".linux."hugo-teek-tools"' "$TEMP_JSON" 2>/dev/null || echo "")
        VERSION_STRING=$(jq -r '."hugo-teek-tools".version' "$TEMP_JSON" 2>/dev/null || echo "")
    else
        # Fallback: use grep/sed for JSON parsing (less reliable but works without jq)
        HUGO_DOWNLOAD_URL=$(grep -o '"linux"[[:space:]]*:[[:space:]]*{[^}]*"hugo"[[:space:]]*:[[:space:]]*"[^"]*"' "$TEMP_JSON" | grep -o '"hugo"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"\([^"]*\)".*/\1/')
        TOOLS_DOWNLOAD_URL=$(grep -o '"linux"[[:space:]]*:[[:space:]]*{[^}]*"hugo-teek-tools"[[:space:]]*:[[:space:]]*"[^"]*"' "$TEMP_JSON" | grep -o '"hugo-teek-tools"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"\([^"]*\)".*/\1/')
        VERSION_STRING=$(grep -o '"version"[[:space:]]*:[[:space:]]*"[^"]*"' "$TEMP_JSON" | head -1 | sed 's/.*"\([^"]*\)".*/\1/')
    fi

    # Extract version number from "hugo-teek-tools version 1.59 (commit: ...)"
    if [ -n "$VERSION_STRING" ]; then
        REMOTE_VERSION=$(echo "$VERSION_STRING" | awk '{print $3}')
    fi

    rm -f "$TEMP_JSON"
fi

if [ -n "$REMOTE_VERSION" ]; then
    echo "[OK] Remote version: $REMOTE_VERSION"
else
    echo "[ERROR] Could not fetch download URLs from API"
    echo "[HINT] Please check your network connection or download manually"
    exit 1
fi

if [ -z "$HUGO_DOWNLOAD_URL" ]; then
    echo "[ERROR] Could not get Hugo download URL"
    exit 1
fi

if [ -z "$TOOLS_DOWNLOAD_URL" ]; then
    echo "[ERROR] Could not get hugo-teek-tools download URL"
    exit 1
fi

echo ""

# ====================================================
# Check and update hugo-teek-tools
# ====================================================

TOOL_PATH="$BIN_DIR/hugo-teek-tools"
NEED_DOWNLOAD=""

if [ -f "$TOOL_PATH" ]; then
    if [ -n "$FORCE_UPDATE" ]; then
        echo "[*] Force update enabled, will re-download hugo-teek-tools"
        NEED_DOWNLOAD="1"
        rm -f "$TOOL_PATH"
    elif [ -n "$REMOTE_VERSION" ]; then
        # Get local version
        chmod +x "$TOOL_PATH" 2>/dev/null || true
        LOCAL_VERSION=$("$TOOL_PATH" --version 2>&1 | awk '{print $3; exit}')

        if [ -n "$LOCAL_VERSION" ]; then
            echo "[*] Local version: $LOCAL_VERSION"
            echo "[*] Remote version: $REMOTE_VERSION"

            # Compare versions
            if [ "$LOCAL_VERSION" != "$REMOTE_VERSION" ]; then
                echo ""
                echo "===================================================="
                echo "🎉 NEW VERSION AVAILABLE!"
                echo "===================================================="
                echo "Current version: $LOCAL_VERSION"
                echo "Latest version:  $REMOTE_VERSION"
                echo ""
                echo "Auto-updating hugo-teek-tools..."
                echo "===================================================="
                echo ""
                NEED_DOWNLOAD="1"
                rm -f "$TOOL_PATH"
            else
                echo "[OK] hugo-teek-tools is up to date"
            fi
        else
            echo "[WARN] Could not get local version, keeping existing file"
        fi
    else
        echo "[OK] hugo-teek-tools exists"
    fi
else
    echo "[*] hugo-teek-tools not found"
    NEED_DOWNLOAD="1"
fi

if [ -n "$NEED_DOWNLOAD" ]; then
    echo "[*] Downloading hugo-teek-tools..."
    echo ""
    echo "    +----------------------------------------------------------+"
    echo "    | URL: $TOOLS_DOWNLOAD_URL"
    echo "    +----------------------------------------------------------+"
    echo ""

    if curl -L --progress-bar -o "$TOOL_PATH" "$TOOLS_DOWNLOAD_URL" 2>/dev/null; then
        FILE_SIZE=$(stat -f%z "$TOOL_PATH" 2>/dev/null || stat -c%s "$TOOL_PATH" 2>/dev/null || echo "0")
        if [ "$FILE_SIZE" -gt 10240 ]; then
            chmod +x "$TOOL_PATH"
            echo ""
            echo "===================================================="
            echo "✅ UPDATE SUCCESSFUL"
            echo "===================================================="
            echo "hugo-teek-tools updated to version $REMOTE_VERSION"

            # Display file size
            SIZE_MB=$((FILE_SIZE / 1048576))
            echo "File size: ${SIZE_MB} MB"
            echo "===================================================="
            echo ""
        else
            echo "[ERROR] Download failed or file too small"
            rm -f "$TOOL_PATH"
            exit 1
        fi
    else
        echo "[ERROR] Download failed"
        rm -f "$TOOL_PATH"
        exit 1
    fi
fi

echo ""

# ====================================================
# Check and download hugo
# ====================================================

HUGO_PATH="$BIN_DIR/hugo"

if [ ! -f "$HUGO_PATH" ]; then
    echo "[*] Downloading hugo..."
    echo ""
    echo "    +----------------------------------------------------------+"
    echo "    | URL: $HUGO_DOWNLOAD_URL"
    echo "    +----------------------------------------------------------+"
    echo ""

    if curl -L --progress-bar -o "$HUGO_PATH" "$HUGO_DOWNLOAD_URL" 2>/dev/null; then
        FILE_SIZE=$(stat -f%z "$HUGO_PATH" 2>/dev/null || stat -c%s "$HUGO_PATH" 2>/dev/null || echo "0")
        if [ "$FILE_SIZE" -gt 1048576 ]; then
            chmod +x "$HUGO_PATH"
            echo ""
            echo "[OK] hugo downloaded"

            # Display file size
            SIZE_MB=$((FILE_SIZE / 1048576))
            echo "     File size: ${SIZE_MB} MB"
        else
            echo "[ERROR] Download failed or file too small"
            rm -f "$HUGO_PATH"
            exit 1
        fi
    else
        echo "[ERROR] Download failed"
        rm -f "$HUGO_PATH"
        exit 1
    fi
else
    echo "[OK] hugo exists"
fi

echo ""

# ====================================================
# Check and update content-watcher
# ====================================================

echo ""
echo "===================================================="
echo "[OK] All tools ready"
echo "===================================================="

# Display final version
if [ -f "$TOOL_PATH" ]; then
    echo ""
    echo "Installed version:"
    "$TOOL_PATH" --version 2>/dev/null || true
fi

exit 0
