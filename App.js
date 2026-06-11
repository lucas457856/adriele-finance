import { NavigationContainer } from '@react-navigation/native';
import { useState } from 'react';
import { View } from 'react-native';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import './global.css';

import SplashVideo from './SplashVideo';
import AppNavigator from './src/navigation/AppNavigator';

// 👇 IMPORTA O PROVIDER
import { ThemeProvider } from './src/context/ThemeContext';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  // 👇 SPLASH PRIMEIRO (não precisa de Theme aqui)
  if (showSplash) {
    return <SplashVideo onFinish={() => setShowSplash(false)} />;
  }

  // 👇 APP NORMAL COM THEME
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