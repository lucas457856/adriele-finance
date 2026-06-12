import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Text, TouchableOpacity, View } from 'react-native';

export default function NotificationPermission({ navigation }) {

  const requestPermission = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus === 'granted') {
      // 🔥 SALVA QUE JÁ LIBEROU
      await AsyncStorage.setItem('notification_permission', 'granted');

      navigation.replace('Login');
    } else {
      navigation.replace('Login');
    }
  };

  const skip = async () => {
    navigation.replace('Login');
  };

  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
      backgroundColor: '#0F1219'
    }}>
      <Text style={{
        fontSize: 22,
        fontWeight: '700',
        color: '#E8ECF4',
        textAlign: 'center',
        marginBottom: 12
      }}>
        🔔 Ative as notificações
      </Text>

      <Text style={{
        color: '#8892A4',
        textAlign: 'center',
        marginBottom: 30
      }}>
        Para não perder os vencimentos das parcelas dos seus clientes,
        ative as notificações do aplicativo.
      </Text>

      <TouchableOpacity
        onPress={requestPermission}
        style={{
          backgroundColor: '#A78BFA',
          padding: 16,
          borderRadius: 14,
          width: '100%',
          alignItems: 'center'
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '700' }}>
          Ativar notificações
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={skip}
        style={{ marginTop: 12 }}
      >
        <Text style={{ color: '#8892A4' }}>
          Agora não
        </Text>
      </TouchableOpacity>
    </View>
  );
}