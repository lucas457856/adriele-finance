import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const NOTIFICATION_CHANNEL_ID = 'cobrancas';

let notificationSetupCompleted = false;

export function configureNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  console.log('✅ Handler global de notificações configurado');
}

export async function setupAndroidNotificationChannel() {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
    name: 'Cobranças',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    sound: 'default',
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });

  console.log('✅ Canal Android de notificações configurado:', NOTIFICATION_CHANNEL_ID);
}

export async function ensureNotificationPermissions() {
  configureNotificationHandler();
  await setupAndroidNotificationChannel();

  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  console.log('📲 Permissão atual de notificações:', existingStatus);

  if (existingStatus === 'granted') {
    return true;
  }

  const { status: requestedStatus } = await Notifications.requestPermissionsAsync();

  console.log('📲 Permissão solicitada de notificações:', requestedStatus);

  if (requestedStatus !== 'granted') {
    console.warn('⚠️ Notificações não serão agendadas porque a permissão foi negada.');
    return false;
  }

  return true;
}

export async function initializeNotifications() {
  if (notificationSetupCompleted) {
    console.log('✅ Notificações já inicializadas nesta sessão');
    return true;
  }

  const allowed = await ensureNotificationPermissions();

  if (allowed) {
    notificationSetupCompleted = true;
  }

  return allowed;
}
