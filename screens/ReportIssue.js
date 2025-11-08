import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function ReportIssue() {
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [manualLocation, setManualLocation] = useState('');
  const [locationMode, setLocationMode] = useState('auto');
  const [issueCategory, setIssueCategory] = useState('');
  const [priority, setPriority] = useState('medium');

  const categories = [
    { id: 'road', name: 'Road & Transport', icon: 'car-outline' },
    { id: 'water', name: 'Water & Drainage', icon: 'water-outline' },
    { id: 'electricity', name: 'Electricity', icon: 'flash-outline' },
    { id: 'waste', name: 'Waste Management', icon: 'trash-outline' },
    { id: 'safety', name: 'Safety & Security', icon: 'shield-outline' },
    { id: 'other', name: 'Other', icon: 'ellipsis-horizontal-outline' },
  ];

  const priorities = [
    { id: 'low', name: 'Low', color: '#28a745' },
    { id: 'medium', name: 'Medium', color: '#ffc107' },
    { id: 'high', name: 'High', color: '#dc3545' },
  ];

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await AsyncStorage.getItem('user_data');
      if (data) {
        setUserData(JSON.parse(data));
      }
    } catch (error) {
      console.log('Error loading user data:', error);
    }
  };

  const pickImage = async () => {
    Alert.alert(
      'Select Image',
      'Choose an option',
      [
        { text: 'Camera', onPress: openCamera },
        { text: 'Gallery', onPress: openGallery },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Camera permission is required');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const openGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setLocationLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);
      Alert.alert('Success', 'Location detected');
    } catch (error) {
      Alert.alert('Error', 'Failed to get location');
    } finally {
      setLocationLoading(false);
    }
  };

  const submitReport = async () => {
    const hasValidLocation = locationMode === 'auto'
      ? location !== null
      : manualLocation.trim() !== '';

    if (!image || !hasValidLocation || !description.trim() || !issueCategory) {
      Alert.alert('Missing Information', 'Please fill all required fields including category');
      return;
    }

    try {
      setLoading(true);
      
      const newReport = {
        id: Date.now().toString(),
        image,
        location: locationMode === 'auto' ? location : null,
        manualLocation: locationMode === 'manual' ? manualLocation.trim() : null,
        locationMode,
        description: description.trim(),
        category: issueCategory,
        priority: priority,
        status: 'Submitted',
        timestamp: new Date().toISOString(),
        reportedBy: userData?.fullName || 'Anonymous',
        userMobile: userData?.mobile || '',
      };

      const existingReports = await AsyncStorage.getItem('civic_reports');
      const reports = existingReports ? JSON.parse(existingReports) : [];
      reports.unshift(newReport);
      await AsyncStorage.setItem('civic_reports', JSON.stringify(reports));

      // Reset form
      setImage(null);
      setLocation(null);
      setManualLocation('');
      setDescription('');
      setIssueCategory('');
      setPriority('medium');
      setLocationMode('auto');

      Alert.alert('Success', 'Report submitted successfully! We will investigate this issue.');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.container}>
        {/* Enhanced Header with User Info */}
        <View style={styles.header}>
          <View style={styles.userSection}>
            <View style={styles.userAvatar}>
              <Ionicons name="person" size={24} color="#1a73e8" />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.greeting}>
                {getGreeting()}, {userData?.fullName?.split(' ')[0] || 'User'}!
              </Text>
              <Text style={styles.headerSubtitle}>Report a civic issue in your area</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.helpButton}>
            <Ionicons name="help-circle-outline" size={24} color="#5f6368" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Issue Category Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Issue Category *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryCard,
                    issueCategory === category.id && styles.categoryCardActive
                  ]}
                  onPress={() => setIssueCategory(category.id)}
                >
                  <Ionicons 
                    name={category.icon} 
                    size={24} 
                    color={issueCategory === category.id ? '#1a73e8' : '#5f6368'} 
                  />
                  <Text style={[
                    styles.categoryText,
                    issueCategory === category.id && styles.categoryTextActive
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Priority Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Priority Level</Text>
            <View style={styles.priorityContainer}>
              {priorities.map((priorityItem) => (
                <TouchableOpacity
                  key={priorityItem.id}
                  style={[
                    styles.priorityButton,
                    priority === priorityItem.id && { backgroundColor: priorityItem.color }
                  ]}
                  onPress={() => setPriority(priorityItem.id)}
                >
                  <Text style={[
                    styles.priorityText,
                    priority === priorityItem.id && styles.priorityTextActive
                  ]}>
                    {priorityItem.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Photo Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photo Evidence *</Text>
            <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
              {image ? (
                <View style={styles.imageContainer}>
                  <Image source={{ uri: image }} style={styles.photoPreview} />
                  <View style={styles.imageOverlay}>
                    <Ionicons name="checkmark-circle" size={24} color="#28a745" />
                  </View>
                </View>
              ) : (
                <View style={styles.photoPlaceholder}>
                  <View style={styles.cameraIcon}>
                    <Ionicons name="camera-outline" size={32} color="#1a73e8" />
                  </View>
                  <Text style={styles.photoButtonText}>Add Photo</Text>
                  <Text style={styles.photoHelpText}>Clear photos help resolve issues faster</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Location Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location *</Text>
            
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  locationMode === 'auto' && styles.toggleButtonActive
                ]}
                onPress={() => setLocationMode('auto')}
              >
                <Ionicons name="locate" size={16} color={locationMode === 'auto' ? '#1a73e8' : '#5f6368'} />
                <Text style={[
                  styles.toggleText,
                  locationMode === 'auto' && styles.toggleTextActive
                ]}>
                  Auto Detect
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  locationMode === 'manual' && styles.toggleButtonActive
                ]}
                onPress={() => setLocationMode('manual')}
              >
                <Ionicons name="create" size={16} color={locationMode === 'manual' ? '#1a73e8' : '#5f6368'} />
                <Text style={[
                  styles.toggleText,
                  locationMode === 'manual' && styles.toggleTextActive
                ]}>
                  Manual Entry
                </Text>
              </TouchableOpacity>
            </View>

            {locationMode === 'auto' ? (
              <View>
                <TouchableOpacity
                  style={styles.locationButton}
                  onPress={getCurrentLocation}
                  disabled={locationLoading}
                >
                  {locationLoading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Ionicons name="location-outline" size={18} color="#fff" />
                      <Text style={styles.locationButtonText}>
                        {location ? 'Location Detected' : 'Get Current Location'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
                
                {location && (
                  <View style={styles.locationInfo}>
                    <Ionicons name="checkmark-circle" size={16} color="#28a745" />
                    <Text style={styles.locationText}>
                      Coordinates: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <TextInput
                style={styles.input}
                placeholder="e.g., Main Street, near City Mall, Bangalore"
                value={manualLocation}
                onChangeText={setManualLocation}
                multiline
              />
            )}
          </View>

          {/* Description Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Issue Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe the issue in detail - what you observed, when it occurred, how it affects the community..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={5}
              maxLength={500}
            />
            <Text style={styles.characterCount}>{description.length}/500 characters</Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={submitReport}
            disabled={loading}
          >
            {loading ? (
              <>
                <ActivityIndicator color="#fff" />
                <Text style={styles.submitButtonText}>Submitting...</Text>
              </>
            ) : (
              <>
                <Ionicons name="send-outline" size={18} color="#fff" />
                <Text style={styles.submitButtonText}>Submit Report</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9faff',
  },

  // Enhanced Header
  header: {
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e8f0fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#5f6368',
  },
  helpButton: {
    padding: 8,
  },

  // Content
  content: {
    flex: 1,
    padding: 20,
  },

  // Section
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#07080aff',
    marginBottom: 12,
  },

  // Category Selection
  categoryScroll: {
    marginBottom: 8,
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  categoryCardActive: {
    borderColor: '#f9fbfcff',
    backgroundColor: '#e8f0fe',
  },
  categoryText: {
    fontSize: 12,
    color: '#030406ff',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#1a73e8',
  },

  // Priority
  priorityContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#050606ff',
  },
  priorityTextActive: {
    color: '#fff',
  },

  // Photo
  photoButton: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    overflow: 'hidden',
  },
  photoPlaceholder: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  cameraIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e8f0fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  photoButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
    marginBottom: 4,
  },
  photoHelpText: {
    fontSize: 12,
    color: '#5f6368',
  },
  imageContainer: {
    position: 'relative',
  },
  photoPreview: {
    width: '100%',
    height: 160,
  },
  imageOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
  },

  // Toggle
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f3f4',
    borderRadius: 6,
    padding: 2,
    marginBottom: 12,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    gap: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#fff',
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
  },

  // Location Button
  locationButton: {
    backgroundColor: '#1a73e8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 6,
    gap: 8,
  },
  locationButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },

  // Location Info
  locationInfo: {
    backgroundColor: '#d4edda',
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#155724',
    fontFamily: 'monospace',
  },

  // Input
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },

  // Character Count
  characterCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#5f6368',
    marginTop: 4,
  },

  // Submit Button
  submitButton: {
    backgroundColor: '#28a745',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Tips Card
  tipsCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
    marginBottom: 20,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f59e0b',
    marginLeft: 8,
  },
  tipsText: {
    fontSize: 14,
    color: '#5f6368',
    lineHeight: 20,
  },
});