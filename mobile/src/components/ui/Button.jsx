import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

const Button = ({ title, onPress, variant = 'primary', size = 'md', loading = false, disabled = false, style }) => {
  const bgColor = variant === 'primary' ? '#10B981' : variant === 'danger' ? '#EF4444' : variant === 'outline' ? 'transparent' : '#6B7280';
  const textColor = variant === 'outline' ? '#10B981' : '#FFFFFF';
  const borderColor = variant === 'outline' ? '#10B981' : 'transparent';
  const paddingV = size === 'sm' ? 8 : size === 'lg' ? 16 : 12;
  const fontSize = size === 'sm' ? 13 : size === 'lg' ? 17 : 15;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        { backgroundColor: disabled ? '#D1D5DB' : bgColor, paddingVertical: paddingV, borderColor, borderWidth: variant === 'outline' ? 1.5 : 0 },
        style,
      ]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text style={[styles.text, { color: disabled ? '#9CA3AF' : textColor, fontSize }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  text: {
    fontWeight: '600',
  },
});

export default Button;