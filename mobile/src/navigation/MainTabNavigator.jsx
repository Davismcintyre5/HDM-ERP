import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import AIChatScreen from '../screens/ai/AIChatScreen';
import BusinessScreen from '../screens/BusinessScreen';
import PeopleScreen from '../screens/PeopleScreen';
import MenuScreen from '../screens/MenuScreen';
import FinanceNavigator from './FinanceNavigator';
import SalesNavigator from './SalesNavigator';
import InventoryNavigator from './InventoryNavigator';
import SupplyChainNavigator from './SupplyChainNavigator';
import ManufacturingNavigator from './ManufacturingNavigator';
import HRNavigator from './HRNavigator';
import ContactsScreen from '../screens/contacts/ContactsScreen';
import ProductsScreen from '../screens/products/ProductsScreen';
import OrdersScreen from '../screens/orders/OrdersScreen';
import ReportsScreen from '../screens/reports/ReportsScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const BusinessStack = createNativeStackNavigator();
const PeopleStack = createNativeStackNavigator();
const MenuStack = createNativeStackNavigator();

const HomeNavigator = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="DashboardMain" component={DashboardScreen} />
    <HomeStack.Screen name="AI" component={AIChatScreen} />
  </HomeStack.Navigator>
);

const BusinessNavigator = () => (
  <BusinessStack.Navigator screenOptions={{ headerShown: false }}>
    <BusinessStack.Screen name="BusinessHome" component={BusinessScreen} />
    <BusinessStack.Screen name="Finance" component={FinanceNavigator} />
    <BusinessStack.Screen name="Sales" component={SalesNavigator} />
    <BusinessStack.Screen name="Inventory" component={InventoryNavigator} />
    <BusinessStack.Screen name="SupplyChain" component={SupplyChainNavigator} />
    <BusinessStack.Screen name="Manufacturing" component={ManufacturingNavigator} />
  </BusinessStack.Navigator>
);

const PeopleNavigator = () => (
  <PeopleStack.Navigator screenOptions={{ headerShown: false }}>
    <PeopleStack.Screen name="PeopleHome" component={PeopleScreen} />
    <PeopleStack.Screen name="HR" component={HRNavigator} />
    <PeopleStack.Screen name="Contacts" component={ContactsScreen} />
  </PeopleStack.Navigator>
);

const MenuNavigator = () => (
  <MenuStack.Navigator screenOptions={{ headerShown: false }}>
    <MenuStack.Screen name="MenuHome" component={MenuScreen} />
    <MenuStack.Screen name="Products" component={ProductsScreen} />
    <MenuStack.Screen name="Orders" component={OrdersScreen} />
    <MenuStack.Screen name="Reports" component={ReportsScreen} />
    <MenuStack.Screen name="Settings" component={SettingsScreen} />
    <MenuStack.Screen name="AI" component={AIChatScreen} />
  </MenuStack.Navigator>
);

const MainTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        const icons = {
          Home: focused ? 'home' : 'home-outline',
          Business: focused ? 'briefcase' : 'briefcase-outline',
          People: focused ? 'people' : 'people-outline',
          Menu: focused ? 'menu' : 'menu-outline',
        };
        return <Ionicons name={icons[route.name] || 'ellipse-outline'} size={24} color={color} />;
      },
      tabBarActiveTintColor: '#10B981',
      tabBarInactiveTintColor: '#9CA3AF',
      tabBarStyle: { backgroundColor: '#FFFFFF', borderTopColor: '#E5E7EB', paddingTop: 4, height: 60 },
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginBottom: 4 },
    })}
  >
    <Tab.Screen name="Home" component={HomeNavigator} />
    <Tab.Screen name="Business" component={BusinessNavigator} />
    <Tab.Screen name="People" component={PeopleNavigator} />
    <Tab.Screen name="Menu" component={MenuNavigator} />
  </Tab.Navigator>
);

export default MainTabNavigator;