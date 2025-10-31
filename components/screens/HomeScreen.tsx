import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ConnectionTest from '../ConnectionTest';

const HomeScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <FontAwesome name="bolt" size={60} color="#3b82f6" />
        <Text style={styles.title}>Welcome to BrightWatt</Text>
        <Text style={styles.subtitle}>Your energy management solution</Text>
      </View>
      
      {/* Connection Test */}
      <ConnectionTest />
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push('/login')}
        >
          <FontAwesome name="sign-in" size={20} color="white" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]}
          onPress={() => router.push('/register')}
        >
          <FontAwesome name="user-plus" size={20} color="#3b82f6" style={styles.buttonIcon} />
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>Sign Up</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.featuresContainer}>
        <View style={styles.featureItem}>
          <FontAwesome name="leaf" size={24} color="#10b981" />
          <Text style={styles.featureText}>Energy Analytics</Text>
        </View>
        <View style={styles.featureItem}>
          <FontAwesome name="leaf" size={24} color="#10b981" />
          <Text style={styles.featureText}>Eco-Friendly</Text>
        </View>
        <View style={styles.featureItem}>
          <FontAwesome name="dollar" size={24} color="#10b981" />
          <Text style={styles.featureText}>Cost Savings</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
    marginBottom: 60,
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#3b82f6',
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureText: {
    marginTop: 8,
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
});

export default HomeScreen;
