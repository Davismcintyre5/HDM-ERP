import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PurchaseOrdersScreen from '../screens/supplychain/PurchaseOrdersScreen';
import ReceivingScreen from '../screens/supplychain/ReceivingScreen';
import SuppliersScreen from '../screens/supplychain/SuppliersScreen';
import RequisitionsScreen from '../screens/supplychain/RequisitionsScreen';

const Stack = createNativeStackNavigator();

const SupplyChainNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SCHome" component={PurchaseOrdersScreen} />
    <Stack.Screen name="Receiving" component={ReceivingScreen} />
    <Stack.Screen name="Suppliers" component={SuppliersScreen} />
    <Stack.Screen name="Requisitions" component={RequisitionsScreen} />
  </Stack.Navigator>
);

export default SupplyChainNavigator;