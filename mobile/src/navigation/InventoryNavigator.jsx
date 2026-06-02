import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StockScreen from '../screens/inventory/StockScreen';
import MovementsScreen from '../screens/inventory/MovementsScreen';
import WarehousesScreen from '../screens/inventory/WarehousesScreen';
import TransfersScreen from '../screens/inventory/TransfersScreen';

const Stack = createNativeStackNavigator();

const InventoryNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="InventoryHome" component={StockScreen} />
    <Stack.Screen name="Movements" component={MovementsScreen} />
    <Stack.Screen name="Warehouses" component={WarehousesScreen} />
    <Stack.Screen name="Transfers" component={TransfersScreen} />
  </Stack.Navigator>
);

export default InventoryNavigator;