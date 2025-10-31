import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { globalState } from '../../lib/globalState';
import { getBackendUrl } from '../../lib/helpers.js';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  energyProvider: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const ProfileScreen = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // First try to get stored user data
      const storedUser = globalState.getUser();
      if (storedUser) {
        setUser(storedUser);
        setIsLoading(false);
        return;
      }

      // If no stored user, try to get from API
      const token = globalState.getToken();
      if (!token) {
        router.push('/dashboard');
        return;
      }

      const response = await fetch(`${getBackendUrl()}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.user) {
          setUser(data.data.user);
          globalState.setUser(data.data.user);
        } else {
          router.push('/dashboard');
        }
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = globalState.getToken();
              if (token) {
                await fetch(`${getBackendUrl()}/api/auth/logout`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                  },
                });
              }
            } catch (error) {
              console.error('Logout error:', error);
            } finally {
              // Clear stored data and redirect
              globalState.clearAll();
              router.push('/');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <FontAwesome name="spinner" size={40} color="#3b82f6" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <FontAwesome name="exclamation-triangle" size={40} color="#ef4444" />
        <Text style={styles.errorText}>Failed to load user data</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadUserData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const profileData = {
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
    energyProvider: user.energyProvider,
    memberSince: new Date(user.createdAt).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    }),
    totalSavings: '$245.67', // This would come from energy data
    monthlyUsage: '850 kWh', // This would come from energy data
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <FontAwesome name="user" size={40} color="white" />
        </View>
        <Text style={styles.name}>{profileData.name}</Text>
        <Text style={styles.email}>{profileData.email}</Text>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <FontAwesome name="sign-out" size={16} color="white" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <FontAwesome name="dollar" size={24} color="#10b981" />
          <Text style={styles.statValue}>{profileData.totalSavings}</Text>
          <Text style={styles.statLabel}>Total Savings</Text>
        </View>
        <View style={styles.statCard}>
          <FontAwesome name="bolt" size={24} color="#f59e0b" />
          <Text style={styles.statValue}>{profileData.monthlyUsage}</Text>
          <Text style={styles.statLabel}>Monthly Usage</Text>
        </View>
      </View>

      {/* Account Information */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        
        <View style={styles.infoRow}>
          <View style={styles.infoLabelContainer}>
            <FontAwesome name="building" size={16} color="#9ca3af" style={{ marginRight: 8 }} />
            <Text style={styles.infoLabel}>Energy Provider</Text>
          </View>
          <Text style={styles.infoValue}>{profileData.energyProvider}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <View style={styles.infoLabelContainer}>
            <FontAwesome name="calendar" size={16} color="#9ca3af" style={{ marginRight: 8 }} />
            <Text style={styles.infoLabel}>Member Since</Text>
          </View>
          <Text style={styles.infoValue}>{profileData.memberSince}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsSection}>
        <TouchableOpacity style={styles.actionButton}>
          <FontAwesome name="edit" size={16} color="#3b82f6" style={{ marginRight: 12 }} />
          <Text style={styles.actionButtonText}>Edit Profile</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <FontAwesome name="key" size={16} color="#3b82f6" style={{ marginRight: 12 }} />
          <Text style={styles.actionButtonText}>Change Password</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <FontAwesome name="file" size={16} color="#3b82f6" style={{ marginRight: 12 }} />
          <Text style={styles.actionButtonText}>Billing History</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <FontAwesome name="cog" size={16} color="#3b82f6" style={{ marginRight: 12 }} />
          <Text style={styles.actionButtonText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'white',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#ef4444',
  },
  logoutText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 15,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginTop: 8,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  infoSection: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 16,
    color: '#64748b',
  },
  infoValue: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  actionsSection: {
    padding: 20,
    gap: 15,
    marginBottom: 40,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;
