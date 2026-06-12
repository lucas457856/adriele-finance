import { NavigationContainer } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import './global.css';

import * as Notifications from 'expo-notifications';

import SplashVideo from './SplashVideo';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

import { loadAndSync } from './src/services/firebaseSync';

// 🔥 NOTIFICAÇÕES GLOBAIS
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  // 🔥 RODA DEPOIS QUE APP JÁ CARREGOU
  useEffect(() => {
    async function init() {
      try {
        console.log('🔥 Iniciando sync...');

        const timer = setTimeout(async () => {
          await loadAndSync();
          console.log('🔥 Sync concluído');
        }, 3000); // 🔥 espera splash + init Android

        return () => clearTimeout(timer);
      } catch (error) {
        console.log('Erro no sync:', error);
      }
    }

    init();
  }, []);

  if (showSplash) {
    return <SplashVideo onFinish={() => setShowSplash(false)} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <View style={{ flex: 1 }}>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </View>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}