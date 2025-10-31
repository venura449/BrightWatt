import { FontAwesome } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { globalState } from '../../lib/globalState';
import { getBackendUrl } from '../../lib/helpers.js';

interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  messageType: string;
}

interface CommunityChatScreenProps {
  navigation: any;
  route: any;
}

const CommunityChatScreen: React.FC<CommunityChatScreenProps> = ({ navigation, route }) => {
  const { community } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isMember, setIsMember] = useState<boolean | null>(null);
  const [checkingMembership, setCheckingMembership] = useState(true);
  const [joiningCommunity, setJoiningCommunity] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [leavingCommunity, setLeavingCommunity] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    checkMembership();
  }, [community._id]);

  const checkMembership = async () => {
    try {
      setCheckingMembership(true);
      const response = await fetch(`${getBackendUrl()}/api/communities/${community._id}/membership`, {
        headers: {
          'Authorization': `Bearer ${globalState.getToken()}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setIsMember(data.data.isMember);
          if (data.data.isMember) {
            fetchMessages();
          }
        }
      } else {
        console.error('Failed to check membership');
        setIsMember(false);
      }
    } catch (error) {
      console.error('Error checking membership:', error);
      setIsMember(false);
    } finally {
      setCheckingMembership(false);
    }
  };

  const joinCommunity = async () => {
    try {
      setJoiningCommunity(true);
      const response = await fetch(`${getBackendUrl()}/api/communities/${community._id}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${globalState.getToken()}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          Alert.alert('Success', 'You have successfully joined the community!');
          setIsMember(true);
          fetchMessages();
        }
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to join community');
      }
    } catch (error) {
      console.error('Error joining community:', error);
      Alert.alert('Error', 'Failed to join community');
    } finally {
      setJoiningCommunity(false);
    }
  };

  const handleCancel = () => {
    if (navigation && navigation.goBack) {
      navigation.goBack();
    }
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const showCommunityInfo = () => {
    setShowMenu(false);
    Alert.alert(
      'Community Info',
      `${community.name}\n\n${community.description || 'No description'}\n\nMembers: ${community.membersCount || 1}`,
      [{ text: 'OK' }]
    );
  };

  const leaveCommunity = async () => {
    setShowMenu(false);
    Alert.alert(
      'Leave Community',
      `Are you sure you want to leave "${community.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              setLeavingCommunity(true);
              const response = await fetch(`${getBackendUrl()}/api/communities/${community._id}/leave`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${globalState.getToken()}`,
                },
              });

              if (response.ok) {
                const data = await response.json();
                Alert.alert('Success', 'You have left the community');
                if (navigation && navigation.goBack) {
                  navigation.goBack();
                }
              } else {
                const errorData = await response.json();
                Alert.alert('Error', errorData.message || 'Failed to leave community');
              }
            } catch (error) {
              console.error('Error leaving community:', error);
              Alert.alert('Error', 'Failed to leave community');
            } finally {
              setLeavingCommunity(false);
            }
          },
        },
      ]
    );
  };

  const fetchMessages = async (pageNum = 1, refresh = false) => {
    try {
      if (refresh) {
        setPage(1);
        setHasMore(true);
      }
      
      const response = await fetch(
        `${getBackendUrl()}/api/messages/${community._id}?page=${pageNum}&limit=50`,
        {
          headers: {
            'Authorization': `Bearer ${globalState.getToken()}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const newMessages = data.data.messages;
          if (refresh || pageNum === 1) {
            setMessages(newMessages);
          } else {
            setMessages(prev => [...newMessages, ...prev]);
          }
          setHasMore(data.data.pagination.hasMore);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const response = await fetch(`${getBackendUrl()}/api/messages/${community._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${globalState.getToken()}`,
        },
        body: JSON.stringify({
          content: newMessage.trim(),
          messageType: 'text',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMessages(prev => [...prev, data.data.message]);
          setNewMessage('');
          // Scroll to bottom
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMessages(1, true);
  };

  const loadMoreMessages = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMessages(nextPage);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.sender._id === globalState.getUser()?._id;
    
    return (
      <View style={[styles.messageContainer, isMyMessage ? styles.myMessage : styles.otherMessage]}>
        {!isMyMessage && (
          <Text style={styles.senderName}>{item.sender.name}</Text>
        )}
        <View style={[styles.messageBubble, isMyMessage ? styles.myBubble : styles.otherBubble]}>
          <Text style={[styles.messageText, isMyMessage ? styles.myMessageText : styles.otherMessageText]}>
            {item.content}
          </Text>
          <Text style={[styles.messageTime, isMyMessage ? styles.myMessageTime : styles.otherMessageTime]}>
            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  if (checkingMembership) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Checking membership...</Text>
      </View>
    );
  }

  if (isMember === false) {
    return (
      <View style={styles.membershipContainer}>
        <View style={styles.membershipCard}>
          <View style={styles.membershipIcon}>
            <FontAwesome name="users" size={48} color="#3b82f6" />
          </View>
          <Text style={styles.membershipTitle}>Join {community.name}</Text>
          {community.description && (
            <Text style={styles.membershipSubtitle}>{community.description}</Text>
          )}
          <Text style={styles.membershipDescription}>
            You need to become a member to access this community chat.
          </Text>
          <View style={styles.membershipActions}>
            <TouchableOpacity
              style={[styles.joinButton, joiningCommunity && styles.joinButtonDisabled]}
              onPress={joinCommunity}
              disabled={joiningCommunity}
            >
              {joiningCommunity ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <FontAwesome name="user-plus" size={16} color="white" />
              )}
              <Text style={styles.joinButtonText}>
                {joiningCommunity ? 'Joining...' : 'Become a Member'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading messages...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {showMenu && (
        <TouchableOpacity 
          style={styles.backdrop} 
          onPress={() => setShowMenu(false)}
          activeOpacity={1}
        />
      )}
      {/* Header with community info */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.groupIcon}>
              <FontAwesome name="users" size={24} color="#3b82f6" />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>{community.name}</Text>
              {community.description && (
                <Text style={styles.headerDescription} numberOfLines={1}>
                  {community.description}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.menuContainer}>
            <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
              <FontAwesome name="ellipsis-v" size={20} color="#3b82f6" />
            </TouchableOpacity>
            {showMenu && (
              <View style={styles.menuDropdown}>
                <TouchableOpacity 
                  style={styles.menuItem} 
                  onPress={showCommunityInfo}
                  disabled={leavingCommunity}
                >
                  <FontAwesome name="info-circle" size={16} color="#6b7280" />
                  <Text style={styles.menuItemText}>View Group Info</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.menuItem} 
                  onPress={leaveCommunity}
                  disabled={leavingCommunity}
                >
                  {leavingCommunity ? (
                    <ActivityIndicator size="small" color="#ef4444" />
                  ) : (
                    <FontAwesome name="sign-out" size={16} color="#ef4444" />
                  )}
                  <Text style={[styles.menuItemText, styles.leaveText]}>
                    {leavingCommunity ? 'Leaving...' : 'Leave Group'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
        <Text style={styles.headerSubtitle}>
          {community.membersCount || 1} members
        </Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item._id}
        style={styles.messagesList}
        inverted={false}
        onEndReached={loadMoreMessages}
        onEndReachedThreshold={0.1}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome name="comments" size={48} color="#9ca3af" />
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>Start the conversation!</Text>
          </View>
        }
      />
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[styles.sendButton, !newMessage.trim() || sending ? styles.sendButtonDisabled : null]}
          onPress={sendMessage}
          disabled={!newMessage.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <FontAwesome name="send" size={16} color="white" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  groupIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
  },
  infoButton: {
    padding: 8,
  },
  menuContainer: {
    position: 'relative',
  },
  menuButton: {
    padding: 8,
  },
  menuDropdown: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    minWidth: 160,
    zIndex: 1000,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuItemText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  leaveText: {
    color: '#ef4444',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 999,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
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
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageContainer: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  senderName: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
    marginLeft: 8,
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    maxWidth: '100%',
  },
  myBubble: {
    backgroundColor: '#3b82f6',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  myMessageText: {
    color: 'white',
  },
  otherMessageText: {
    color: '#1e293b',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  otherMessageTime: {
    color: '#9ca3af',
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
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    backgroundColor: '#3b82f6',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  membershipContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  membershipCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    maxWidth: 400,
    width: '100%',
  },
  membershipIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  membershipSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  membershipTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  membershipDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  membershipActions: {
    width: '100%',
    gap: 12,
  },
  joinButton: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  joinButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  joinButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default CommunityChatScreen;
