import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const Select = ({ label, value, onValueChange, options, placeholder }) => (
  <View style={styles.container}>
    {label && <Text style={styles.label}>{label}</Text>}
    <View style={styles.pickerWrapper}>
      <Picker selectedValue={value} onValueChange={onValueChange} style={styles.picker}>
        {placeholder && <Picker.Item label={placeholder} value="" color="#9CA3AF" />}
        {options.map(opt => (
          <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
        ))}
      </Picker>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 4 },
  pickerWrapper: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, overflow: 'hidden', backgroundColor: '#FFFFFF' },
  picker: { height: 50 },
});

export default Select;