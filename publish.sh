#!/bin/bash

# 1. Force the correct Java version for Capacitor 7
export JAVA_HOME=/usr/lib/jvm/temurin-21-jdk-amd64
export PATH=$JAVA_HOME/bin:$PATH

echo "--- Starting Build Process ---"

# 2. Build Web Assets
npm run build

# 3. Sync to Android
npx cap sync android

# 4. Compile the APK
cd android
./gradlew assembleRelease
cd ..

# 5. Clean up old final APK if it exists
rm -f BibleKJV_v2_Final.apk

# 6. Align the APK (Optimizes RAM usage for the 12MB Bible text)
zipalign -v 4 android/app/build/outputs/apk/release/app-release-unsigned.apk BibleKJV_v2_Aligned.apk

# 7. Sign the APK with V2/V3 schemes (Fixes Android 15 lag)
# Note: This will prompt for your keystore password
apksigner sign --ks bible-key.jks --out BibleKJV_v2_Final.apk BibleKJV_v2_Aligned.apk

# 8. Clean up temporary aligned file
rm BibleKJV_v2_Aligned.apk

echo "------------------------------------------------"
echo "DONE! Your optimized APK is: BibleKJV_v2_Final.apk"
echo "------------------------------------------------"
