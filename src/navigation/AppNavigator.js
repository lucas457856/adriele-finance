import AsyncStorage from '@react-native-async-storage/async-storage';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';

// TELAS
import BrandStats from '../screens/BrandStats';
import Clientes from '../screens/Clientes';
import CobrancasHoje from '../screens/CobrancasHoje';
import Contracts from '../screens/Contracts';
import Dashboard from '../screens/Dashboard';
import FechamentoPeriodo from '../screens/FechamentoPeriodo';
import ListContracts from '../screens/ListContracts';
import Login from '../screens/Login';
import NovoCliente from '../screens/NovoCliente';

import CustomDrawer from '../components/CustomDrawer';
import NotificationPermission from '../screens/NotificationPermission';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

function HomeDrawer() {
  return (
    <Drawer.Navigator
      screenOptions={{ headerShown: false }}
      drawerContent={(props) => <CustomDrawer {...props} />}
    >
      <Drawer.Screen name="Dashboard" component={Dashboard} />
      <Drawer.Screen name="Clientes" component={Clientes} />
      <Drawer.Screen name="Contracts" component={Contracts} />
      <Drawer.Screen name="ListContracts" component={ListContracts} />
      <Drawer.Screen name="NovoCliente" component={NovoCliente} />
      <Drawer.Screen name="FechamentoPeriodo" component={FechamentoPeriodo} />
      <Drawer.Screen name="CobrancasHoje" component={CobrancasHoje} />
      <Drawer.Screen name="BrandStats" component={BrandStats} />
    </Drawer.Navigator>
  );
}

export default function AppNavigator() {
  const [loading, setLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    async function check() {
    //  console.log('🔎 [DEBUG] Iniciando verificação de permissão...');

      try {
        const saved = await AsyncStorage.getItem('notification_permission');
       // console.log('💾 [DEBUG] AsyncStorage:', saved);

        const systemPermission = await Notifications.getPermissionsAsync();
      //  console.log('📲 [DEBUG] Permissão sistema:', systemPermission);

        const isGranted =
          saved === 'granted' && systemPermission.status === 'granted';

      //  console.log('🧠 [DEBUG] isGranted calculado:', isGranted);

        if (isGranted) {
         // console.log('✅ [DEBUG] Indo para Login');
          setInitialRoute('Login');
        } else {
         // console.log('⚠️ [DEBUG] Indo para NotificationPermission');
          setInitialRoute('NotificationPermission');
        }
      } catch (_error) {
       // console.log('❌ [DEBUG] ERRO:', error);
        setInitialRoute('NotificationPermission');
      } finally {
        setLoading(false);
        // console.log('🏁 [DEBUG] Finalizou check');
      }
    }

    check();
  }, []);

  if (loading) {
   // console.log('⏳ [DEBUG] Loading...');
    return null;
  }

 // console.log('🚀 [DEBUG] initialRoute final:', initialRoute);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
      <Stack.Screen name="NotificationPermission" component={NotificationPermission} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Dashboard" component={HomeDrawer} />
    </Stack.Navigator>
  );
}