import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Platform as RNPlatform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalState } from '../../lib/globalState';
import { getBackendUrl } from '../../lib/helpers.js';

const RegisterScreen = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  

  const handleRegister = async () => {
    const { firstName, lastName, email, password, confirmPassword } = formData;
    
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`${getBackendUrl()}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          energyProvider: 'BrightWatt Energy'
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store token/user data
        if (data.data?.token) {
          globalState.setToken(data.data.token);
          globalState.setUser(data.data.user);
        }
        
        Alert.alert('Success', 'Account created successfully!', [
          {
            text: 'OK',
            onPress: () => router.push('/dashboard')
          }
        ]);
      } else {
        Alert.alert('Error', data.message || 'Registration failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      Alert.alert('Error', error.message || 'Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 py-4">
          {/* Header Section */}
          <View className="items-center mb-12">
            <View className="w-24 h-24 bg-blue-600 rounded-full items-center justify-center mb-6">
              <FontAwesome name="bolt" size={40} color="white" />
            </View>
            <Text className="text-3xl font-bold text-gray-900">Create Account</Text>
            <Text className="text-gray-500 mt-3 text-center">Join BrightWatt today</Text>
          </View>

          {/* Form Section */}
          <View className="space-y-6">
            {/* Name Row */}
            <View className="flex-row space-x-4" style={{gap:2}}>
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-2">First Name</Text>
                <View className="flex-row items-center bg-white p-4 rounded-lg border border-gray-200">
                  <FontAwesome name="user" size={16} color="#9ca3af" style={{ marginRight: 12 }} />
                  <TextInput
                    className="flex-1 text-gray-800 text-base"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChangeText={(value) => updateFormData('firstName', value)}
                    autoCapitalize="words"
                  />
                </View>
              </View>
              
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-2">Last Name</Text>
                <View className="flex-row items-center bg-white p-4 rounded-lg border border-gray-200">
                  <FontAwesome name="user" size={16} color="#9ca3af" style={{ marginRight: 12 }} />
                  <TextInput
                    className="flex-1 text-gray-800 text-base"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChangeText={(value) => updateFormData('lastName', value)}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            </View>

            {/* Email */}
            <View className="mt-2" >
              <Text className="text-sm font-medium text-gray-700 mb-2">Email</Text>
              <View className="flex-row items-center bg-white p-4 rounded-lg border border-gray-200">
                <FontAwesome name="envelope" size={16} color="#9ca3af" style={{ marginRight: 12 }} />
                <TextInput
                  className="flex-1 text-gray-800 text-base"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChangeText={(value) => updateFormData('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password */}
            <View className="mt-2">
              <Text className="text-sm font-medium text-gray-700 mb-2">Password</Text>
              <View className="flex-row items-center bg-white p-4 rounded-lg border border-gray-200">
                <FontAwesome name="lock" size={16} color="#9ca3af" style={{ marginRight: 12 }} />
                <TextInput
                  className="flex-1 text-gray-800 text-base"
                  placeholder="Create password (min 6 chars)"
                  value={formData.password}
                  onChangeText={(value) => updateFormData('password', value)}
                  secureTextEntry
                />
              </View>
            </View>

            {/* Confirm Password */}
            <View className="mt-2">
              <Text className="text-sm font-medium text-gray-700 mb-2">Confirm Password</Text>
              <View className="flex-row items-center bg-white p-4 rounded-lg border border-gray-200">
                <FontAwesome name="lock" size={16} color="#9ca3af" style={{ marginRight: 12 }} />
                <TextInput
                  className="flex-1 text-gray-800 text-base"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChangeText={(value) => updateFormData('confirmPassword', value)}
                  secureTextEntry
                />
              </View>
            </View>

            {/* Register Button */}
            <TouchableOpacity 
              className={`bg-blue-600 p-4 rounded-lg items-center justify-center mt-4 ${isLoading ? 'opacity-80' : ''}`}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <View className="flex-row items-center space-x-2">
                  <FontAwesome name="spinner" size={16} color="white" />
                  <Text className="text-white font-semibold text-lg">Creating Account...</Text>
                </View>
              ) : (
                <View className="flex-row items-center space-x-2">
                  <FontAwesome name="user-plus" size={16} color="white" />
                  <Text className="text-white font-semibold text-lg ml-4">Create Account</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View className="my-6">
              <View className="flex-row items-center">
                <View className="flex-1 h-px bg-gray-300" />
                <Text className="px-4 text-gray-500 text-sm">Already registered?</Text>
                <View className="flex-1 h-px bg-gray-300" />
              </View>
            </View>

            {/* Sign In Option */}
            <TouchableOpacity 
              className="p-4 bg-white border border-blue-600 rounded-lg items-center justify-center"
              onPress={() => router.push('/login')}
            >
              <View className="flex-row items-center space-x-2">
                <FontAwesome name="sign-in" size={16} color="#3b82f6" />
                <Text className="text-blue-600 font-semibold text-lg ml-4">Sign In</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;