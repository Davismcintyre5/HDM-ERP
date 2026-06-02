import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { getProfitLoss, getBalanceSheet, getTrialBalance } from '../../api/tenant/financeApi';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import HeaderBar from '../../components/layout/HeaderBar';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import formatCurrency from '../../utils/formatCurrency';

const FinanceReportsScreen = ({ navigation }) => {
  const [active, setActive] = useState('pl');
  const [plData, setPlData] = useState(null);
  const [bsData, setBsData] = useState(null);
  const [tbData, setTbData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProfitLoss(), getBalanceSheet(), getTrialBalance()])
      .then(([pl, bs, tb]) => { setPlData(pl.data.data); setBsData(bs.data.data); setTbData(tb.data.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <View style={styles.flex}>
      <HeaderBar title="Financial Reports" onBack={() => navigation.goBack()} />
      <ScreenWrapper>
        <View style={styles.tabs}>
          {['pl', 'bs', 'tb'].map(k => (
            <Button key={k} title={k === 'pl' ? 'P&L' : k === 'bs' ? 'Balance' : 'Trial'} variant={active === k ? 'primary' : 'ghost'} size="sm" onPress={() => setActive(k)} style={{ flex: 1 }} />
          ))}
        </View>

        {active === 'pl' && plData && (
          <Card style={styles.card}>
            <Text style={styles.reportTitle}>Profit & Loss</Text>
            <View style={styles.reportRow}><Text style={styles.reportLabel}>Revenue</Text><Text style={styles.reportValue}>{formatCurrency(plData.revenue)}</Text></View>
            <View style={styles.reportRow}><Text style={styles.reportLabel}>Expenses</Text><Text style={styles.reportValue}>{formatCurrency(plData.expenses)}</Text></View>
            <View style={[styles.reportRow, styles.reportTotal]}><Text style={styles.reportLabelBold}>Net Profit</Text><Text style={[styles.reportValueBold, { color: plData.profit >= 0 ? '#10B981' : '#EF4444' }]}>{formatCurrency(plData.profit)}</Text></View>
          </Card>
        )}

        {active === 'bs' && bsData && (
          <Card style={styles.card}>
            <Text style={styles.reportTitle}>Balance Sheet</Text>
            <View style={styles.reportRow}><Text style={styles.reportLabel}>Assets</Text><Text style={styles.reportValue}>{formatCurrency(bsData.assets)}</Text></View>
            <View style={styles.reportRow}><Text style={styles.reportLabel}>Liabilities</Text><Text style={styles.reportValue}>{formatCurrency(bsData.liabilities)}</Text></View>
            <View style={[styles.reportRow, styles.reportTotal]}><Text style={styles.reportLabelBold}>Equity</Text><Text style={[styles.reportValueBold, { color: '#10B981' }]}>{formatCurrency(bsData.equity)}</Text></View>
          </Card>
        )}

        {active === 'tb' && tbData && (
          <Card style={styles.card}>
            <Text style={styles.reportTitle}>Trial Balance</Text>
            <View style={styles.reportRow}><Text style={styles.reportLabel}>Total Debit</Text><Text style={styles.reportValue}>{formatCurrency(tbData.totalDebit)}</Text></View>
            <View style={styles.reportRow}><Text style={styles.reportLabel}>Total Credit</Text><Text style={styles.reportValue}>{formatCurrency(tbData.totalCredit)}</Text></View>
            <View style={{ alignItems: 'center', marginTop: 12 }}><Badge variant={tbData.balanced ? 'success' : 'danger'}>{tbData.balanced ? '✓ Balanced' : '⚠ Unbalanced'}</Badge></View>
          </Card>
        )}
      </ScreenWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F9FAFB' },
  tabs: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 12 },
  card: { margin: 16, marginTop: 0, padding: 20 },
  reportTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16, textAlign: 'center' },
  reportRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  reportTotal: { borderTopWidth: 2, borderTopColor: '#10B981', marginTop: 8, paddingTop: 12 },
  reportLabel: { fontSize: 14, color: '#6B7280' },
  reportLabelBold: { fontSize: 16, fontWeight: '700', color: '#111827' },
  reportValue: { fontSize: 14, fontWeight: '500', color: '#111827' },
  reportValueBold: { fontSize: 18, fontWeight: '700' },
});

export default FinanceReportsScreen;