import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { TenantProvider } from './src/context/TenantContext';
import { OfflineProvider } from './src/context/OfflineContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <AuthProvider>
        <TenantProvider>
          <OfflineProvider>
            <RootNavigator />
          </OfflineProvider>
        </TenantProvider>
      </AuthProvider>
    </NavigationContainer>
  );
}