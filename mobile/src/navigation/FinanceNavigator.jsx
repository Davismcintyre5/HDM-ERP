import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AccountsScreen from '../screens/finance/AccountsScreen';
import InvoicesScreen from '../screens/finance/InvoicesScreen';
import BillsScreen from '../screens/finance/BillsScreen';
import JournalScreen from '../screens/finance/JournalScreen';
import RevenueExpensesScreen from '../screens/finance/RevenueExpensesScreen';
import FinanceReportsScreen from '../screens/finance/FinanceReportsScreen';

const Stack = createNativeStackNavigator();

const FinanceNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="FinanceHome" component={AccountsScreen} />
    <Stack.Screen name="Invoices" component={InvoicesScreen} />
    <Stack.Screen name="Bills" component={BillsScreen} />
    <Stack.Screen name="Journal" component={JournalScreen} />
    <Stack.Screen name="RevenueExpenses" component={RevenueExpensesScreen} />
    <Stack.Screen name="FinanceReports" component={FinanceReportsScreen} />
  </Stack.Navigator>
);

export default FinanceNavigator;