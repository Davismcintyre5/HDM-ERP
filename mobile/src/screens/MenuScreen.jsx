import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import HeaderBar from '../components/layout/HeaderBar';
import { useAuth } from '../hooks/useAuth';

const menuItems = [
  { title: 'Products', icon: 'pricetags-outline', screen: 'Products', desc: 'Product catalog & pricing' },
  { title: 'Orders', icon: 'reader-outline', screen: 'Orders', desc: 'All orders unified view' },
  { title: 'Reports', icon: 'stats-chart-outline', screen: 'Reports', desc: 'Reports & analytics' },
  { title: 'Settings', icon: 'settings-outline', screen: 'Settings', desc: 'Company, users & more' },
  { title: 'AI Assistant', icon: 'sparkles-outline', screen: 'AI', desc: 'Ask about your business' },
];

const MenuScreen = ({ navigation }) => {
  const { user } = useAuth();

  return (
    <View style={styles.flex}>
      <HeaderBar title="Menu" />
      <ScreenWrapper>
        <View style={styles.profile}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{user?.firstName?.[0]}{user?.lastName?.[0]}</Text></View>
          <View>
            <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>
        </View>

        {menuItems.map(item => (
          <TouchableOpacity
            key={item.screen}
            style={styles.menuItem}
            onPress={() => navigation.navigate(item.screen)}
          >
            <Ionicons name={item.icon} size={24} color="#10B981" />
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuDesc}>{item.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
          </TouchableOpacity>
        ))}
      </ScreenWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F9FAFB' },
  profile: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, backgroundColor: '#FFFFFF', marginBottom: 8, borderRadius: 12, marginHorizontal: 16, marginTop: 8 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  name: { fontSize: 16, fontWeight: '600', color: '#111827' },
  email: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 16, backgroundColor: '#FFFFFF', marginHorizontal: 16, marginBottom: 1,
  },
  menuTitle: { fontSize: 15, fontWeight: '500', color: '#111827' },
  menuDesc: { fontSize: 12, color: '#6B7280', marginTop: 2 },
});

export default MenuScreen;