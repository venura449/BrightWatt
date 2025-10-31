import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalState } from '../../lib/globalState';
import { getBackendUrl } from '../../lib/helpers.js';

const LoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);


  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`${getBackendUrl()}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store token/user data
        if (data.data?.token) {
          globalState.setToken(data.data.token);
          globalState.setUser(data.data.user);
        }
        
        // Redirect to dashboard after successful login
        router.push('/dashboard');
      } else {
        Alert.alert('Error', data.message || 'Invalid email or password');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Error', error.message || 'Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push('/Auth/Forgotpass');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 px-6 justify-center">
          {/* Logo/Header Section */}
          <View className="items-center mb-12">
            <View className="w-24 h-24 bg-blue-600 rounded-full items-center justify-center mb-6">
              <FontAwesome name="bolt" size={40} color="white" />
            </View>
            <Text className="text-3xl font-bold text-gray-900">Welcome Back</Text>
            <Text className="text-gray-500 mt-3 text-center">Sign in to continue to BrightWatt</Text>
          </View>

          {/* Form Section */}
          <View className="space-y-6">
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">Email</Text>
              <View className="flex-row items-center bg-white p-4 rounded-lg border border-gray-200">
                <FontAwesome 
                  name="envelope" 
                  size={16} 
                  color="#9ca3af" 
                  style={{ marginRight: 12 }} 
                />
                <TextInput
                  className="flex-1 text-gray-800 text-base"
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View className="mb-2 mt-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-sm font-medium text-gray-700">Password</Text>
                <TouchableOpacity onPress={handleForgotPassword}>
                  <Text className="text-blue-500 text-sm">Forgot Password?</Text>
                </TouchableOpacity>
              </View>
              <View className="flex-row items-center bg-white p-4 rounded-lg border border-gray-200">
                <FontAwesome 
                  name="lock" 
                  size={16} 
                  color="#9ca3af" 
                  style={{ marginRight: 12 }} 
                />
                <TextInput
                  className="flex-1 text-gray-800 text-base"
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity 
              className={`bg-blue-600 p-4 rounded-lg items-center justify-center mt-4 ${isLoading ? 'opacity-80' : ''}`}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <View className="flex-row items-center space-x-2">
                  <FontAwesome name="spinner" size={16} color="white" />
                  <Text className="text-white font-semibold text-lg">Signing In...</Text>
                </View>
              ) : (
                <View className="flex-row items-center space-x-2">
                  <FontAwesome name="sign-in" size={16} color="white" />
                  <Text className="text-white ml-3 font-semibold text-lg">Sign In</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Social Login Options */}
            <View className="my-6">
              <View className="flex-row items-center">
                <View className="flex-1 h-px bg-gray-300" />
                <Text className="px-4 text-gray-500 text-sm">Or continue with</Text>
                <View className="flex-1 h-px bg-gray-300" />
              </View>

              <View className="flex-row justify-center space-x-6 pl-6 mt-6" style={{gap:12}}>
                <TouchableOpacity className="p-4 bg-white border border-gray-200 rounded-lg items-center justify-center w-16 h-16">
                  <FontAwesome name="google" size={24} color="#ea4335" />
                </TouchableOpacity>
                <TouchableOpacity className="p-4 bg-white border border-gray-200 rounded-lg items-center justify-center w-16 h-16">
                  <FontAwesome name="facebook" size={24} color="#1877f2" />
                </TouchableOpacity>
                <TouchableOpacity className="p-4 bg-white border border-gray-200 rounded-lg items-center justify-center w-16 h-16">
                  <FontAwesome name="apple" size={24} color="#000000" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Sign Up Section */}
          <View className="flex-row justify-center mt-8">
            <Text className="text-gray-600">Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text className="text-blue-600 font-semibold">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;