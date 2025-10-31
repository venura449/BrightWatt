import { useNavigation } from '@react-navigation/native';
import DashboardScreen from '../components/screens/DashboardScreen';

export default function Dashboard() {
  const navigation = useNavigation();
  return <DashboardScreen navigation={navigation} />;
}
