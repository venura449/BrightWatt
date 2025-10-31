import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { globalState } from '../../lib/globalState';
import { getBackendUrl } from '../../lib/helpers.js';

interface Community {
  _id: string;
  name: string;
  description: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  membersCount: number;
  createdAt: string;
  updatedAt?: string;
  isActive: boolean;
  isPrivate?: boolean;
  maxMembers?: number;
  members: Array<{
    user: string;
    role: string;
  }>;
}

const DiscoverCommunitiesScreen: React.FC = () => {
  const router = useRouter();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCommunities, setFilteredCommunities] = useState<Community[]>([]);

  useEffect(() => {
    fetchCommunities();
  }, []);

  useEffect(() => {
    filterCommunities();
  }, [searchQuery, communities]);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${getBackendUrl()}/api/communities`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const communitiesData = Array.isArray(data.data) ? data.data : data.data.communities || [];
          setCommunities(communitiesData);
        }
      }
    } catch (error) {
      console.error('Error fetching communities:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCommunities = () => {
    if (!searchQuery.trim()) {
      setFilteredCommunities(communities);
    } else {
      const filtered = communities.filter(community =>
        community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        community.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCommunities(filtered);
    }
  };

  const joinCommunity = async (communityId: string) => {
    try {
      const response = await fetch(`${getBackendUrl()}/api/communities/${communityId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${globalState.getToken()}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        Alert.alert('Success', data.message || 'Successfully joined community!');
        // Refresh communities to update member counts
        fetchCommunities();
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to join community');
      }
    } catch (error) {
      console.error('Error joining community:', error);
      Alert.alert('Error', 'Failed to join community');
    }
  };

  const leaveCommunity = async (communityId: string) => {
    try {
      const response = await fetch(`${getBackendUrl()}/api/communities/${communityId}/leave`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${globalState.getToken()}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        Alert.alert('Success', data.message || 'Successfully left community!');
        // Refresh communities to update member counts
        fetchCommunities();
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to leave community');
      }
    } catch (error) {
      console.error('Error leaving community:', error);
      Alert.alert('Error', 'Failed to leave community');
    }
  };

  const isMember = (community: Community) => {
    return community.members.some(member => member.user === globalState.getUser()?._id);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCommunities();
  };

  const renderCommunity = ({ item }: { item: Community }) => {
    const member = isMember(item);
    
    return (
      <View style={styles.communityCard}>
        <View style={styles.communityHeader}>
          <View style={styles.communityIcon}>
            <FontAwesome name="users" size={24} color="#10b981" />
          </View>
          <View style={styles.communityInfo}>
            <Text style={styles.communityName}>{item.name}</Text>
            <Text style={styles.communityCreator}>by {item.createdBy?.name || 'Unknown'}</Text>
          </View>
          <View style={styles.memberBadge}>
            <Text style={styles.memberCount}>{item.membersCount}</Text>
            <Text style={styles.memberLabel}>members</Text>
          </View>
        </View>
        
                 {item.description && (
           <Text style={styles.communityDescription}>{item.description}</Text>
         )}
         
         
         
         <View style={styles.communityActions}>
           {member ? (
             <View style={styles.memberActions}>
               <TouchableOpacity 
                 style={styles.chatButton}
                                  onPress={() => router.push({
                    pathname: '/CommunityChat',
                                         params: {
                       _id: item._id,
                       name: item.name,
                       description: item.description || '',
                       membersCount: item.membersCount,
                       createdAt: item.createdAt,
                       updatedAt: item.updatedAt || item.createdAt,
                       isActive: item.isActive ? 'true' : 'false',
                       isPrivate: item.isPrivate ? 'true' : 'false',
                       maxMembers: item.maxMembers || 1000,
                       members: JSON.stringify(item.members || []),
                       createdBy: item.createdBy?._id || '',
                     }
                  })}
               >
                 <FontAwesome name="comments" size={16} color="#3b82f6" />
                 <Text style={styles.chatButtonText}>Chat</Text>
               </TouchableOpacity>
               <TouchableOpacity 
                 style={styles.leaveButton}
                 onPress={() => leaveCommunity(item._id)}
               >
                 <FontAwesome name="sign-out" size={16} color="#ef4444" />
                 <Text style={styles.leaveButtonText}>Leave</Text>
               </TouchableOpacity>
             </View>
                       ) : (
              <View style={styles.joinSection}>
                <TouchableOpacity 
                  style={[styles.joinButton, member ? styles.alreadyMemberButton : null]}
                  onPress={() => member ? null : joinCommunity(item._id)}
                  disabled={member}
                >
                  <FontAwesome name={member ? "check" : "plus"} size={16} color="white" />
                  <Text style={styles.joinButtonText}>
                    {member ? "Already a Member" : "Join Community"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
         </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading communities...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <FontAwesome name="search" size={16} color="#9ca3af" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search communities..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredCommunities}
        renderItem={renderCommunity}
        keyExtractor={(item) => item._id}
        style={styles.communitiesList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome name="users" size={48} color="#9ca3af" />
            <Text style={styles.emptyText}>
              {searchQuery ? 'No communities found' : 'No communities available'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try adjusting your search' : 'Be the first to create a community!'}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6b7280',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
  },
  communitiesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  communityCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  communityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  communityIcon: {
    marginRight: 12,
  },
  communityInfo: {
    flex: 1,
  },
  communityName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  communityCreator: {
    fontSize: 14,
    color: '#6b7280',
  },
  memberBadge: {
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  memberCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0369a1',
  },
  memberLabel: {
    fontSize: 12,
    color: '#0369a1',
  },
  communityDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 16,
  },

  communityActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  memberActions: {
    flexDirection: 'row',
    gap: 8,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  chatButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3b82f6',
    marginLeft: 6,
  },
  leaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  leaveButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ef4444',
    marginLeft: 6,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  joinSection: {
    // Container for join button
  },
  alreadyMemberButton: {
    backgroundColor: '#6b7280',
    opacity: 0.8,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default DiscoverCommunitiesScreen;
