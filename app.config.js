const appJson = require('./app.json');

export default {
  expo: {
    ...appJson.expo,
    ios: {
      ...appJson.expo.ios,
      bundleIdentifier: 'com.iusif-797.wish-list-react-native',
      infoPlist: {
        NSFaceIDUsageDescription: 'Вход в приложение с помощью Face ID',
      },
    },
    plugins: ['expo-web-browser'],
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL || 'https://wish-list-fqg6.onrender.com/api',
      wsUrl: process.env.EXPO_PUBLIC_WS_URL || 'wss://wish-list-fqg6.onrender.com',
      oauthCallbackUrl:
        process.env.EXPO_PUBLIC_OAUTH_CALLBACK_URL ||
        'https://wish-list-dun.vercel.app/auth/callback',
    },
  },
};
