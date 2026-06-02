import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BOMsScreen from '../screens/manufacturing/BOMsScreen';
import WorkOrdersScreen from '../screens/manufacturing/WorkOrdersScreen';
import ShopFloorScreen from '../screens/manufacturing/ShopFloorScreen';
import QCScreen from '../screens/manufacturing/QCScreen';

const Stack = createNativeStackNavigator();

const ManufacturingNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MfgHome" component={BOMsScreen} />
    <Stack.Screen name="WorkOrders" component={WorkOrdersScreen} />
    <Stack.Screen name="ShopFloor" component={ShopFloorScreen} />
    <Stack.Screen name="QC" component={QCScreen} />
  </Stack.Navigator>
);

export default ManufacturingNavigator;