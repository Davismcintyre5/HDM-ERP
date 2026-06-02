import { ActivityIndicator, View } from 'react-native';

const Spinner = ({ size = 'large', color = '#10B981' }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
    <ActivityIndicator size={size} color={color} />
  </View>
);

export default Spinner;