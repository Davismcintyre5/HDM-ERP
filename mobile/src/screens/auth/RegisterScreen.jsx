import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { register } from '../../api/public/registrationApi';
import { submitPayment } from '../../api/public/paymentApi';
import { getPlans } from '../../api/public/plansApi';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Alert from '../../components/ui/Alert';

const RegisterScreen = ({ navigation }) => {
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState({ companyName: '', fullName: '', email: '', phone: '', password: '', plan: 'free_trial', cycle: 'monthly' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getPlans().then(res => setPlans(res.data.data || [])).catch(() => {});
  }, []);

  const handleRegister = async () => {
    if (!form.companyName || !form.fullName || !form.email || !form.password) return setError('Fill all required fields');
    setError('');
    setLoading(true);
    try {
      await register({ companyName: form.companyName, contactEmail: form.email, plan: form.plan, billingCycle: form.cycle });
      const payRes = await submitPayment({
        companyName: form.companyName, contactEmail: form.email,
        plan: form.plan, billingCycle: form.cycle,
        paymentMethod: form.plan === 'free_trial' ? 'free_trial' : 'mpesa_send_money',
        phone: form.phone, password: form.password, fullName: form.fullName,
      });
      setSuccess(payRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={styles.centered}>
        <Text style={styles.successIcon}>🎉</Text>
        <Text style={styles.successTitle}>Registration Successful!</Text>
        {success.licenseKey && (
          <View style={styles.keyBox}>
            <Text style={styles.keyLabel}>Your License Key</Text>
            <Text style={styles.keyText} selectable>{success.licenseKey}</Text>
            <Text style={styles.keyWarning}>⚠ Save this key — you'll need it for activation</Text>
          </View>
        )}
        <Button title="Go to Login" onPress={() => navigation.navigate('Login')} style={styles.btn} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Register Your Company</Text>
          <Text style={styles.subtitle}>Get started with HDM ERP</Text>
        </View>

        {error ? <Alert variant="error" message={error} onClose={() => setError('')} /> : null}

        <Input label="Company Name *" value={form.companyName} onChangeText={(v) => setForm(p => ({ ...p, companyName: v }))} placeholder="Your company" required />
        <Input label="Full Name *" value={form.fullName} onChangeText={(v) => setForm(p => ({ ...p, fullName: v }))} placeholder="Your name" required />
        <Input label="Email *" value={form.email} onChangeText={(v) => setForm(p => ({ ...p, email: v }))} placeholder="you@company.com" keyboardType="email-address" required />
        <Input label="Phone" value={form.phone} onChangeText={(v) => setForm(p => ({ ...p, phone: v }))} placeholder="+254 7XX XXX XXX" keyboardType="phone-pad" />
        <Input label="Password *" value={form.password} onChangeText={(v) => setForm(p => ({ ...p, password: v }))} placeholder="Create password" secureTextEntry required />

        <Select
          label="Plan"
          value={form.plan}
          onValueChange={(v) => setForm(p => ({ ...p, plan: v }))}
          options={plans.filter(p => p.enabled).map(p => ({ label: `${p.displayName} — ${p.displayCurrency} ${p.pricing.monthly?.toLocaleString()}/mo`, value: p.name }))}
        />

        <Button title={form.plan === 'free_trial' ? 'Start Free Trial' : 'Continue to Payment'} onPress={handleRegister} loading={loading} style={styles.btn} />

        <View style={styles.links}>
          <Button title="← Back to Login" variant="ghost" onPress={() => navigation.navigate('Login')} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { flexGrow: 1, padding: 24, paddingBottom: 50 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB', padding: 24 },
  header: { alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#6B7280' },
  successIcon: { fontSize: 50, marginBottom: 12 },
  successTitle: { fontSize: 22, fontWeight: '700', color: '#10B981', marginBottom: 8 },
  keyBox: { backgroundColor: '#F3F4F6', borderRadius: 12, padding: 16, marginVertical: 16, width: '100%', alignItems: 'center' },
  keyLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  keyText: { fontSize: 16, fontFamily: 'monospace', color: '#10B981', fontWeight: '700', marginBottom: 4 },
  keyWarning: { fontSize: 12, color: '#F59E0B', textAlign: 'center' },
  btn: { marginTop: 12 },
  links: { marginTop: 16 },
});

export default RegisterScreen;