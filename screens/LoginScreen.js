import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ onLoginSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    // Basic validation
    if (isSignUp && !fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }

    if (!mobileNumber.trim()) {
      Alert.alert('Error', 'Please enter your mobile number');
      return;
    }

    if (mobileNumber.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (isSignUp) {
      if (!confirmPassword.trim()) {
        Alert.alert('Error', 'Please confirm your password');
        return;
      }

      if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }
    }

    setLoading(true);

    try {
      if (isSignUp) {
        // Sign Up Logic
        const userData = {
          fullName: fullName.trim(),
          mobile: mobileNumber,
          password: password, // In production, this should be hashed
          id: Date.now().toString(),
        };

        await AsyncStorage.setItem('user_credentials_' + mobileNumber, JSON.stringify(userData));
        await AsyncStorage.setItem('user_data', JSON.stringify(userData));
        await AsyncStorage.setItem('user_token', 'auth_token_' + Date.now());

        setTimeout(() => {
          setLoading(false);
          Alert.alert('Success', 'Account created successfully!', [
            {
              text: 'OK',
              onPress: () => onLoginSuccess()
            }
          ]);
        }, 1000);
      } else {
        // Sign In Logic
        const storedCredentials = await AsyncStorage.getItem('user_credentials_' + mobileNumber);
        
        if (!storedCredentials) {
          setTimeout(() => {
            setLoading(false);
            Alert.alert('Error', 'Account not found. Please sign up first.');
          }, 1000);
          return;
        }

        const userData = JSON.parse(storedCredentials);
        
        if (userData.password !== password) {
          setTimeout(() => {
            setLoading(false);
            Alert.alert('Error', 'Invalid password. Please try again.');
          }, 1000);
          return;
        }

        await AsyncStorage.setItem('user_data', JSON.stringify(userData));
        await AsyncStorage.setItem('user_token', 'auth_token_' + Date.now());

        setTimeout(() => {
          setLoading(false);
          Alert.alert('Success', 'Login successful!', [
            {
              text: 'OK',
              onPress: () => onLoginSuccess()
            }
          ]);
        }, 1000);
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const handleMobileChange = (text) => {
    const numericText = text.replace(/[^0-9]/g, '').slice(0, 10);
    setMobileNumber(numericText);
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setFullName('');
    setMobileNumber('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <View style={styles.container}>
        <KeyboardAvoidingView 
          style={styles.keyboardView} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContainer} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Ionicons name="shield-checkmark" size={48} color="#5f6368" />
              </View>
              <Text style={styles.appTitle}>Our City</Text>
              <Text style={styles.subtitle}>
                {isSignUp ? 'Create your account' : 'Welcome back'}
              </Text>
            </View>

            {/* Form Container */}
            <View style={styles.formContainer}>
              {/* Sign In / Sign Up Toggle */}
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    !isSignUp && styles.toggleButtonActive
                  ]}
                  onPress={() => !isSignUp || toggleAuthMode()}
                >
                  <Text style={[
                    styles.toggleText,
                    !isSignUp && styles.toggleTextActive
                  ]}>
                    Sign In
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    isSignUp && styles.toggleButtonActive
                  ]}
                  onPress={() => isSignUp || toggleAuthMode()}
                >
                  <Text style={[
                    styles.toggleText,
                    isSignUp && styles.toggleTextActive
                  ]}>
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Full Name Input - Only for Sign Up */}
              {isSignUp && (
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={20} color="#5f6368" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor="#9aa0a6"
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                </View>
              )}

              {/* Mobile Number Input */}
              <View style={styles.inputWrapper}>
                <Ionicons name="call-outline" size={20} color="#5f6368" style={styles.inputIcon} />
                <Text style={styles.countryCode}>+91</Text>
                <TextInput
                  style={[styles.input, { marginLeft: 8 }]}
                  placeholder="Mobile Number"
                  placeholderTextColor="#9aa0a6"
                  value={mobileNumber}
                  onChangeText={handleMobileChange}
                  keyboardType="numeric"
                  maxLength={10}
                  returnKeyType="next"
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color="#5f6368" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#9aa0a6"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  returnKeyType={isSignUp ? "next" : "done"}
                  onSubmitEditing={!isSignUp ? handleAuth : undefined}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.passwordToggle}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#5f6368" 
                  />
                </TouchableOpacity>
              </View>

              {/* Confirm Password Input - Only for Sign Up */}
              {isSignUp && (
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color="#5f6368" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    placeholderTextColor="#9aa0a6"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    returnKeyType="done"
                    onSubmitEditing={handleAuth}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.passwordToggle}
                  >
                    <Ionicons 
                      name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color="#5f6368" 
                    />
                  </TouchableOpacity>
                </View>
              )}

              {/* Auth Button */}
              <TouchableOpacity 
                style={[styles.authButton, loading && styles.buttonDisabled]} 
                onPress={handleAuth}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons 
                      name={isSignUp ? "person-add-outline" : "log-in-outline"} 
                      size={20} 
                      color="#fff" 
                    />
                    <Text style={styles.buttonText}>
                      {isSignUp ? 'Create Account' : 'Sign In'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

         
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e8eaed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#3c4043',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#5f6368',
    textAlign: 'center',
  },

  // Form
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  // Toggle
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f3f4',
    borderRadius: 6,
    padding: 2,
    marginBottom: 24,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#5f6368',
  },
  toggleTextActive: {
    color: '#1a73e8',
    fontWeight: '600',
  },

  // Input
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dadce0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    backgroundColor: '#fafafa',
  },
  inputIcon: {
    marginRight: 12,
  },
  countryCode: {
    fontSize: 16,
    color: '#3c4043',
    fontWeight: '500',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#3c4043',
    paddingVertical: 0,
  },
  passwordToggle: {
    padding: 4,
  },

  // Button
  authButton: {
    backgroundColor: '#1a73e8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
    shadowColor: '#1a73e8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});