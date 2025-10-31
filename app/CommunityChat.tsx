import { useLocalSearchParams, useRouter } from 'expo-router';
import CommunityChatScreen from '../components/screens/CommunityChatScreen';

export default function CommunityChat() {
  const params = useLocalSearchParams();
  const router = useRouter();
  
  // Extract community data from params
  const community = {
    _id: params._id as string,
    name: params.name as string,
    description: params.description as string,
    membersCount: parseInt(params.membersCount as string) || 1,
    createdAt: params.createdAt as string,
    updatedAt: params.updatedAt as string,
    isActive: params.isActive === 'true',
    isPrivate: params.isPrivate === 'true',
    maxMembers: parseInt(params.maxMembers as string) || 1000,
    members: params.members ? JSON.parse(params.members as string) : [],
    createdBy: params.createdBy as string,
  };

  // Create navigation object with goBack method
  const navigation = {
    goBack: () => router.back(),
  };

  return <CommunityChatScreen route={{ params: { community } }} navigation={navigation} />;
}
