import { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { activateAccount } from '../../api/public/activationApi';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';

const ActivateScreen = ({ navigation }) => {
  const [licenseKey, setLicenseKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleActivate = async () => {
    if (!licenseKey) return setError('License key is required');
    setError('');
    setLoading(true);
    try {
      await activateAccount(licenseKey);
      setSuccess(true);
      setTimeout(() => navigation.navigate('Login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid license key');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={styles.centered}>
        <Text style={styles.successIcon}>✅</Text>
        <Text style={styles.successTitle}>Device Activated!</Text>
        <Text style={styles.successSub}>Redirecting to login...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.emoji}>🔐</Text>
          <Text style={styles.title}>Activate Your Device</Text>
          <Text style={styles.subtitle}>Enter your license key to activate this device</Text>
        </View>

        {error ? <Alert variant="error" message={error} onClose={() => setError('')} /> : null}

        <Input
          label="License Key"
          value={licenseKey}
          onChangeText={(text) => setLicenseKey(text.toUpperCase())}
          placeholder="HDM-XXXX-XXXX-XXXX"
          required
        />

        <Button title="Activate Device" onPress={handleActivate} loading={loading} style={styles.btn} />

        <View style={styles.links}>
          <Button title="← Back to Login" variant="ghost" onPress={() => navigation.navigate('Login')} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB', padding: 24 },
  header: { alignItems: 'center', marginBottom: 30 },
  emoji: { fontSize: 50, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
  successIcon: { fontSize: 50, marginBottom: 12 },
  successTitle: { fontSize: 22, fontWeight: '700', color: '#10B981', marginBottom: 4 },
  successSub: { fontSize: 14, color: '#6B7280' },
  btn: { marginTop: 4 },
  links: { marginTop: 16 },
});

export default ActivateScreen;