import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EmployeesScreen from '../screens/hr/EmployeesScreen';
import AttendanceScreen from '../screens/hr/AttendanceScreen';
import LeaveScreen from '../screens/hr/LeaveScreen';
import PayrollScreen from '../screens/hr/PayrollScreen';
import RecruitmentScreen from '../screens/hr/RecruitmentScreen';

const Stack = createNativeStackNavigator();

const HRNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HRHome" component={EmployeesScreen} />
    <Stack.Screen name="Attendance" component={AttendanceScreen} />
    <Stack.Screen name="Leave" component={LeaveScreen} />
    <Stack.Screen name="Payroll" component={PayrollScreen} />
    <Stack.Screen name="Recruitment" component={RecruitmentScreen} />
  </Stack.Navigator>
);

export default HRNavigator;