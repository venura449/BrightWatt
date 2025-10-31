import { FontAwesome } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Platform } from 'react-native';
import { getBackendUrl } from '../lib/helpers.js';


const ConnectionTest = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isTesting, setIsTesting] = useState(false);


  const testConnection = async () => {
    setIsTesting(true);
    try {
      const response = await fetch(`${getBackendUrl()}/health`);
      setIsConnected(response.ok); // true if status 200–299
    } catch (error) {
      setIsConnected(false);
    } finally {
      setIsTesting(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  const getStatusColor = () => {
    if (isConnected === null) return '#f59e0b';
    return isConnected ? '#10b981' : '#ef4444';
  };

  const getStatusText = () => {
    if (isConnected === null) return 'Unknown';
    return isConnected ? 'Connected' : 'Disconnected';
  };

  const getStatusIcon = () => {
    if (isConnected === null) return 'question-circle';
    return isConnected ? 'check-circle' : 'times-circle';
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusContainer}>
        <FontAwesome 
          name={getStatusIcon() as any} 
          size={16} 
          color={getStatusColor()} 
          style={styles.statusIcon}
        />
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          Backend: {getStatusText()}
        </Text>
      </View>
      
      <TouchableOpacity 
        style={styles.testButton} 
        onPress={testConnection}
        disabled={isTesting}
      >
        <FontAwesome 
          name={isTesting ? 'spinner' : 'refresh'} 
          size={14} 
          color="#3b82f6" 
        />
        <Text style={styles.testButtonText}>
          {isTesting ? 'Testing...' : 'Test Connection'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  testButtonText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500',
  },
});

export default ConnectionTest;
