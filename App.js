import { NavigationContainer } from '@react-navigation/native';
import { View } from 'react-native';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import './global.css';

import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
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