#!/bin/bash

# 1. Force the correct Temurin Java & Android paths
export JAVA_HOME=/usr/lib/jvm/temurin-21-jdk-amd64
export ANDROID_HOME=$HOME/Android/Sdk

# Dynamically find the latest build-tools (for zipalign and apksigner)
BUILD_TOOLS_DIR=$(ls -d $ANDROID_HOME/build-tools/* 2>/dev/null | tail -n 1)
export PATH=$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$BUILD_TOOLS_DIR:$PATH

echo "--- Starting Build Process ---"

# 2. Build Web Assets
npm run build

# 3. Sync to Android
npx cap sync android

# 4. Compile the APK
cd android
./gradlew assembleRelease
cd ..

# 5. Safety Check: Did the APK actually build?
APK_PATH="android/app/build/outputs/apk/release/app-release-unsigned.apk"
if [ ! -f "$APK_PATH" ]; then
    echo "❌ ERROR: APK file not found at $APK_PATH"
    echo "Check the Gradle output above for compilation errors."
    exit 1
fi

# 6. Clean up old files
rm -f BibleKJV_v2_Final.apk
rm -f BibleKJV_v2_Aligned.apk

# 7. Align the APK
echo "--- Aligning APK ---"
zipalign -v 4 "$APK_PATH" BibleKJV_v2_Aligned.apk

# 8. Sign the APK
echo "--- Signing APK ---"
apksigner sign --ks bible-key.jks --out BibleKJV_v2_Final.apk BibleKJV_v2_Aligned.apk

# 9. Clean up
rm BibleKJV_v2_Aligned.apk

echo "------------------------------------------------"
echo "DONE! Your optimized APK is: BibleKJV_v2_Final.apk"
echo "------------------------------------------------"