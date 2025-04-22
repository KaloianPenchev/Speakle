import 'dotenv/config';

export default {
  name: "SpeakleApp",
  slug: "speakle-app",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  updates: {
    fallbackToCacheTimeout: 0
  },
  assetBundlePatterns: [
    "**/*"
  ],
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL,
  },
  ios: {
    supportsTablet: true,
    infoPlist: {
      NSMicrophoneUsageDescription: "This app needs access to your microphone for speech recognition.",
      UIBackgroundModes: ["audio"]
    }
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff"
    },
    permissions: [
      "RECORD_AUDIO",
      "MODIFY_AUDIO_SETTINGS"
    ]
  },
  web: {
    favicon: "./assets/favicon.png"
  }
}; 