import { Switch } from 'react-native';

const Toggle = ({ value, onValueChange, disabled = false }) => (
  <Switch
    value={value}
    onValueChange={onValueChange}
    disabled={disabled}
    trackColor={{ false: '#D1D5DB', true: '#A7F3D0' }}
    thumbColor={value ? '#10B981' : '#9CA3AF'}
  />
);

export default Toggle;