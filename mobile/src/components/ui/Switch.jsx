import { Switch as RNSwitch } from 'react-native';

const Switch = ({ value, onValueChange }) => (
  <RNSwitch
    value={value}
    onValueChange={onValueChange}
    trackColor={{ false: '#D1D5DB', true: '#A7F3D0' }}
    thumbColor={value ? '#10B981' : '#9CA3AF'}
  />
);

export default Switch;