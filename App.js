import { NavigationContainer } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import './global.css';

import SplashVideo from './SplashVideo';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

import { loadAndSync } from './src/services/firebaseSync';
import { initializeNotifications } from './src/services/notificationSetup';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  // 🔥 RODA DEPOIS QUE APP JÁ CARREGOU
  useEffect(() => {
    async function init() {
      try {
        console.log('🔥 Iniciando notificações e sync...');

        const timer = setTimeout(async () => {
          try {
            const allowed = await initializeNotifications();

            if (!allowed) {
              console.warn('⚠️ Notificações não foram inicializadas. Sync será pulado.');
              return;
            }

            await loadAndSync();
            console.log('🔥 Sync concluído');
          } catch (error) {
            console.error('❌ Erro no sync:', error);
          }
        }, 3000); // 🔥 espera splash + init Android

        return () => clearTimeout(timer);
      } catch (error) {
        console.error('Erro ao iniciar app:', error);
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
