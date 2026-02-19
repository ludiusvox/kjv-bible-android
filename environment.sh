#!/bin/bash

echo "--- Initializing Android Environment ---"

# 1. Install required system packages
sudo apt update
sudo apt install -y openjdk-21-jdk unzip wget libpulse0

# 2. Create Android SDK directory if it doesn't exist
export ANDROID_HOME=$HOME/Android/Sdk
mkdir -p $ANDROID_HOME/cmdline-tools

# 3. Download Android Command Line Tools (if not present)
if [ ! -d "$ANDROID_HOME/cmdline-tools/latest" ]; then
    echo "Downloading Android Command Line Tools..."
    wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O /tmp/tools.zip
    unzip /tmp/tools.zip -d $ANDROID_HOME/cmdline-tools
    mv $ANDROID_HOME/cmdline-tools/cmdline-tools $ANDROID_HOME/cmdline-tools/latest
    rm /tmp/tools.zip
fi

# 4. Set Environment Variables for this session
export PATH=$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH

# 5. Accept Licenses and Install Build Tools / Platforms
echo "y" | sdkmanager --install "platform-tools" "platforms;android-34" "build-tools;34.0.0"

# 6. Create the local.properties file Gradle was complaining about
echo "sdk.dir=$ANDROID_HOME" > android/local.properties

echo "--- Setup Complete! ---"