import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput } from 'react-native';
import { getPricing, updatePrice } from '../../api/tenant/salesApi';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import HeaderBar from '../../components/layout/HeaderBar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import formatCurrency from '../../utils/formatCurrency';

const PricingScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState(0);

  const fetchPricing = useCallback(async () => {
    try { const res = await getPricing(); setProducts(res.data.data || []); } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPricing(); }, [fetchPricing]);

  const handleSave = async (id) => {
    try { await updatePrice(id, editPrice); setEditingId(null); fetchPricing(); } catch {}
  };

  if (loading) return <Spinner />;

  return (
    <View style={styles.flex}>
      <HeaderBar title="Pricing" onBack={() => navigation.goBack()} />
      <ScreenWrapper scrollable={false}>
        <FlatList
          data={products}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.prodName}>{item.name}</Text>
                <Text style={styles.prodSku}>{item.sku || '—'}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4, minWidth: 100 }}>
                <Text style={styles.costText}>{formatCurrency(item.costPrice)}</Text>
                {editingId === item._id ? (
                  <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
                    <TextInput
                      style={styles.priceInput}
                      value={String(editPrice)}
                      onChangeText={(v) => setEditPrice(parseFloat(v) || 0)}
                      keyboardType="numeric"
                    />
                    <Button title="✓" size="sm" onPress={() => handleSave(item._id)} style={{ paddingHorizontal: 10 }} />
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                    <Text style={styles.sellText}>{formatCurrency(item.sellingPrice)}</Text>
                    <Button title="Edit" variant="ghost" size="sm" onPress={() => { setEditingId(item._id); setEditPrice(item.sellingPrice); }} />
                  </View>
                )}
                <Text style={styles.marginText}>
                  {item.costPrice ? Math.round((item.sellingPrice - item.costPrice) / item.costPrice * 100) : 0}% margin
                </Text>
              </View>
            </View>
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState icon="pricetags-outline" title="No products" />}
        />
      </ScreenWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F9FAFB' },
  list: { padding: 16, paddingTop: 8 },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#FFFFFF', padding: 14, borderRadius: 10, marginBottom: 8,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  prodName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  prodSku: { fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace', marginTop: 2 },
  costText: { fontSize: 13, color: '#6B7280' },
  sellText: { fontSize: 15, fontWeight: '700', color: '#10B981' },
  marginText: { fontSize: 11, color: '#6B7280' },
  priceInput: {
    borderWidth: 1, borderColor: '#10B981', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 4, fontSize: 14,
    width: 80, textAlign: 'right', color: '#111827',
  },
});

export default PricingScreen;