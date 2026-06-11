import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';

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

// 👇 IMPORTA SEU DRAWER
import CustomDrawer from '../components/CustomDrawer';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();


// 🔥 DRAWER AQUI
function HomeDrawer() {
  return (
    <Drawer.Navigator
      screenOptions={{ headerShown: false }}
      
      // 👇 AQUI VOCÊ USA SEU CUSTOM DRAWER
      drawerContent={(props) => <CustomDrawer {...props} />}
    >
      <Drawer.Screen name="Dashboard" component={Dashboard} />
      <Drawer.Screen name="Clientes" component={Clientes} />
      <Drawer.Screen name="Contracts" component={Contracts} />
      <Drawer.Screen name="ListContracts" component={ListContracts} />
      <Drawer.Screen name="NovoCliente" component={NovoCliente} />
      <Drawer.Screen name="FechamentoPeriodo" component={FechamentoPeriodo} />
            <Stack.Screen name="CobrancasHoje" component={CobrancasHoje} />
            <Stack.Screen name="BrandStats" component={BrandStats} />
    </Drawer.Navigator>
  );
}


// 🔥 STACK PRINCIPAL
export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Login" component={Login} />

      {/* 👇 MUITO IMPORTANTE */}
      <Stack.Screen name="Dashboard" component={HomeDrawer} />
    </Stack.Navigator>
  );
}