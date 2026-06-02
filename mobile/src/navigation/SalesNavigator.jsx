import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OrdersScreen from '../screens/sales/OrdersScreen';
import QuotationsScreen from '../screens/sales/QuotationsScreen';
import PricingScreen from '../screens/sales/PricingScreen';

const Stack = createNativeStackNavigator();

const SalesNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SalesHome" component={OrdersScreen} />
    <Stack.Screen name="Quotations" component={QuotationsScreen} />
    <Stack.Screen name="Pricing" component={PricingScreen} />
  </Stack.Navigator>
);

export default SalesNavigator;