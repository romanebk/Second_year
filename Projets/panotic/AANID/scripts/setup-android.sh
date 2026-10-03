#!/usr/bin/env bash
# Génère le dossier android/ pour AANID/frontend (React Native 0.76)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FRONTEND="$ROOT/frontend"
TEMPLATE_DIR="/tmp/aanid-rn-template-$$"
RN_VERSION="0.76.9"

echo "→ Génération du template React Native $RN_VERSION..."
npx @react-native-community/cli@15.1.3 init AANIDTemplate \
  --version "$RN_VERSION" \
  --directory "$TEMPLATE_DIR" \
  --skip-install \
  --pm npm

if [ -d "$FRONTEND/android" ]; then
  echo "⚠  $FRONTEND/android existe déjà — sauvegarde en android.bak"
  mv "$FRONTEND/android" "$FRONTEND/android.bak.$(date +%s)"
fi

echo "→ Copie android/ vers $FRONTEND/android"
cp -R "$TEMPLATE_DIR/android" "$FRONTEND/android"

# Renommer le package Java/Kotlin com.aanidtemplate → com.aanid
OLD_PKG="com.aanidtemplate"
NEW_PKG="com.aanid"
ANDROID_SRC="$FRONTEND/android/app/src/main/java"

if [ -d "$ANDROID_SRC/com/aanidtemplate" ]; then
  mkdir -p "$ANDROID_SRC/com/aanid"
  mv "$ANDROID_SRC/com/aanidtemplate/"* "$ANDROID_SRC/com/aanid/" 2>/dev/null || true
  rm -rf "$ANDROID_SRC/com/aanidtemplate"
fi

# Patch fichiers android
find "$FRONTEND/android" -type f \( -name "*.gradle" -o -name "*.kt" -o -name "*.java" -o -name "*.xml" -o -name "*.properties" \) -exec \
  sed -i "s/aanidtemplate/aanid/g; s/AANIDTemplate/AANID/g; s/com\.aanidtemplate/com.aanid/g" {} +

# AndroidManifest — permissions carte + internet
MANIFEST="$FRONTEND/android/app/src/main/AndroidManifest.xml"
if [ -f "$MANIFEST" ]; then
  if ! grep -q "INTERNET" "$MANIFEST"; then
    sed -i 's/<manifest/<manifest xmlns:android="http:\/\/schemas.android.com\/apk\/res\/android"\n    /' "$MANIFEST" 2>/dev/null || true
  fi
fi

# local.properties template
if [ -n "${ANDROID_HOME:-}" ] && [ ! -f "$FRONTEND/android/local.properties" ]; then
  echo "sdk.dir=$ANDROID_HOME" > "$FRONTEND/android/local.properties"
fi

# Nettoyage
rm -rf "$TEMPLATE_DIR"

echo ""
echo "✅ android/ prêt dans $FRONTEND/android"
echo ""
echo "Prochaines étapes :"
echo "  1. export ANDROID_HOME=\$HOME/Android/Sdk"
echo "  2. cd $FRONTEND && npm install"
echo "  3. npm start          # terminal 1"
echo "  4. cd android && ./gradlew assembleDebug"
echo "  5. APK → android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "⚠  Ajoutez votre clé Google Maps dans AndroidManifest.xml"
echo "⚠  Mettez à jour PRODUCTION_API_ORIGIN dans src/config/api.ts"
