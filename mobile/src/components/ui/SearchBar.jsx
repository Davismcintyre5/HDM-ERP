import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SearchBar = ({ value, onChangeText, placeholder = 'Search...' }) => (
  <View style={styles.container}>
    <Ionicons name="search" size={18} color="#9CA3AF" />
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#9CA3AF"
    />
  </View>
);

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 10, paddingHorizontal: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  input: { flex: 1, paddingVertical: 10, fontSize: 14, marginLeft: 8, color: '#111827' },
});

export default SearchBar;