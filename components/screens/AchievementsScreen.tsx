import { FontAwesome } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { LearningStats, UserAchievement } from '../../lib/api';
import { globalState } from '../../lib/globalState';
import { getBackendUrl } from '../../lib/helpers.js';

interface AchievementsScreenProps {
  navigation: any;
}

const AchievementsScreen: React.FC<AchievementsScreenProps> = ({ navigation }) => {
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchStats(),
        fetchAchievements()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load achievements data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    const response = await fetch(`${getBackendUrl()}/api/achievements/stats`, {
      headers: {
        'Authorization': `Bearer ${globalState.getToken()}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        setStats(data.data.stats);
      }
    }
  };

  const fetchAchievements = async () => {
    const response = await fetch(`${getBackendUrl()}/api/achievements/my`, {
      headers: {
        'Authorization': `Bearer ${globalState.getToken()}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        setAchievements(data.data.achievements);
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#6b7280';
      case 'rare': return '#3b82f6';
      case 'epic': return '#8b5cf6';
      case 'legendary': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getRarityBackground = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#f3f4f6';
      case 'rare': return '#eff6ff';
      case 'epic': return '#f3f4ff';
      case 'legendary': return '#fffbeb';
      default: return '#f3f4f6';
    }
  };

  const renderAchievement = ({ item }: { item: UserAchievement }) => (
    <View style={[
      styles.achievementCard,
      { backgroundColor: getRarityBackground(item.achievement.rarity) }
    ]}>
      <View style={styles.achievementHeader}>
        <Text style={styles.achievementIcon}>{item.achievement.icon}</Text>
        <View style={styles.achievementInfo}>
          <Text style={styles.achievementName}>{item.achievement.name}</Text>
          <Text style={styles.achievementDescription}>{item.achievement.description}</Text>
        </View>
        <View style={styles.achievementMeta}>
          <Text style={[styles.rarityBadge, { color: getRarityColor(item.achievement.rarity) }]}>
            {item.achievement.rarity.toUpperCase()}
          </Text>
          <Text style={styles.pointsText}>+{item.pointsEarned} pts</Text>
        </View>
      </View>
      <View style={styles.achievementFooter}>
        <Text style={styles.earnedDate}>
          Earned {new Date(item.earnedAt).toLocaleDateString()}
        </Text>
        {item.isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderStatsCard = () => (
    <View style={styles.statsCard}>
      <Text style={styles.statsTitle}>Your Learning Stats</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <FontAwesome name="star" size={24} color="#f59e0b" />
          <Text style={styles.statNumber}>{stats?.totalPoints || 0}</Text>
          <Text style={styles.statLabel}>Total Points</Text>
        </View>
        <View style={styles.statItem}>
          <FontAwesome name="graduation-cap" size={24} color="#10b981" />
          <Text style={styles.statNumber}>{stats?.lessonsCompleted || 0}</Text>
          <Text style={styles.statLabel}>Lessons Completed</Text>
        </View>
        <View style={styles.statItem}>
          <FontAwesome name="fire" size={24} color="#ef4444" />
          <Text style={styles.statNumber}>{stats?.currentStreak || 0}</Text>
          <Text style={styles.statLabel}>Current Streak</Text>
        </View>
        <View style={styles.statItem}>
          <FontAwesome name="trophy" size={24} color="#8b5cf6" />
          <Text style={styles.statNumber}>{stats?.perfectScores || 0}</Text>
          <Text style={styles.statLabel}>Perfect Scores</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading achievements...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={achievements}
        renderItem={renderAchievement}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={renderStatsCard}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome name="trophy" size={64} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No Achievements Yet</Text>
            <Text style={styles.emptyText}>
              Complete lessons to earn your first achievements!
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContainer}
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
  listContainer: {
    padding: 16,
  },
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  achievementCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  achievementMeta: {
    alignItems: 'flex-end',
  },
  rarityBadge: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  achievementFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  earnedDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  newBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
});

export default AchievementsScreen;

