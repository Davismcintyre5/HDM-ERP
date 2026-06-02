import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Switch from '../../components/ui/Switch';

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) return setError('Email and password required');
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password, rememberMe);
      if (result?.requiresActivation) {
        navigation.navigate('Activate');
        return;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>HDM</Text>
          </View>
          <Text style={styles.title}>Login to HDM ERP</Text>
          <Text style={styles.subtitle}>Smart Business Management</Text>
        </View>

        {error ? <Alert variant="error" message={error} onClose={() => setError('')} /> : null}

        <Input label="Email" value={email} onChangeText={setEmail} placeholder="you@company.com" keyboardType="email-address" required />
        <Input label="Password" value={password} onChangeText={setPassword} placeholder="Enter password" secureTextEntry required />

        <View style={styles.switchRow}>
          <Switch value={rememberMe} onValueChange={setRememberMe} />
          <Text style={styles.switchLabel}>Remember me</Text>
        </View>

        <Button title="Login" onPress={handleLogin} loading={loading} style={styles.loginBtn} />

        <View style={styles.links}>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.link}>Don't have an account? <Text style={styles.linkBold}>Register</Text></Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Activate')}>
            <Text style={styles.linkSmall}>Activate this device</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, paddingBottom: 50 },
  header: { alignItems: 'center', marginBottom: 30 },
  logoContainer: {
    width: 70, height: 70, borderRadius: 18, backgroundColor: '#10B981',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  logo: { fontSize: 24, fontWeight: '900', color: '#FFFFFF', letterSpacing: 2 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#6B7280' },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  switchLabel: { fontSize: 14, color: '#374151' },
  loginBtn: { marginTop: 4 },
  links: { alignItems: 'center', marginTop: 24, gap: 12 },
  link: { fontSize: 14, color: '#6B7280' },
  linkBold: { color: '#10B981', fontWeight: '600' },
  linkSmall: { fontSize: 13, color: '#9CA3AF' },
});

export default LoginScreen;