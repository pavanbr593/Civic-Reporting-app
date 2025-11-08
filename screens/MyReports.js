import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

// Simple Report Card Component
const ReportCard = ({ report, onDelete }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'submitted': return '#ffc107';
      case 'in progress': return '#17a2b8';
      case 'resolved': return '#28a745';
      case 'rejected': return '#6c757d';
      default: return '#ffc107';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <View style={styles.reportCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {report.description}
          </Text>
          <Text style={styles.cardDate}>
            {formatDate(report.timestamp)}
          </Text>
        </View>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={onDelete}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={18} color="#dc3545" />
        </TouchableOpacity>
      </View>

      <View style={styles.cardContent}>
        {report.image && (
          <View style={styles.infoRow}>
            <Ionicons name="image-outline" size={16} color="#6c757d" />
            <Text style={styles.infoText}>Photo attached</Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={16} color="#6c757d" />
          <Text style={styles.infoText} numberOfLines={1}>
            {report.manualLocation || 
             (report.location ? 
               `${report.location.latitude.toFixed(4)}, ${report.location.longitude.toFixed(4)}` : 
               'Location unavailable'
             )
            }
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={16} color="#6c757d" />
          <Text style={styles.infoText}>
            {report.reportedBy || 'Anonymous'}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.status) }]}>
          <Text style={styles.statusText}>
            {report.status || 'Submitted'}
          </Text>
        </View>

        <Text style={styles.reportId}>
          #{report.id.slice(-6)}
        </Text>
      </View>
    </View>
  );
};

// Simple Empty State Component
const EmptyState = () => {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="document-text-outline" size={64} color="#adb5bd" />
      </View>
      
      <Text style={styles.emptyTitle}>No Reports Yet</Text>
      <Text style={styles.emptyDescription}>
        Your submitted civic issue reports will appear here. Tap "Report Issue" to get started.
      </Text>
      
      <View style={styles.emptyFeatures}>
        <View style={styles.featureItem}>
          <Ionicons name="camera-outline" size={16} color="#28a745" />
          <Text style={styles.featureText}>Add photos</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="location-outline" size={16} color="#17a2b8" />
          <Text style={styles.featureText}>Track location</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="eye-outline" size={16} color="#6f42c1" />
          <Text style={styles.featureText}>Monitor progress</Text>
        </View>
      </View>
    </View>
  );
};

export default function MyReports() {
  const [reports, setReports] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const storedReports = await AsyncStorage.getItem('civic_reports');
      if (storedReports) {
        setReports(JSON.parse(storedReports));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  const deleteReport = async (reportId) => {
    Alert.alert(
      'Delete Report',
      'Are you sure you want to delete this report?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedReports = reports.filter(report => report.id !== reportId);
              setReports(updatedReports);
              await AsyncStorage.setItem('civic_reports', JSON.stringify(updatedReports));
            } catch (error) {
              Alert.alert('Error', 'Failed to delete report');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0d6efd" />
        <Text style={styles.loadingText}>Loading reports...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Reports</Text>
          <Text style={styles.headerSubtitle}>
            {reports.length} {reports.length === 1 ? 'report' : 'reports'} submitted
          </Text>
        </View>

        {/* Reports List */}
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ReportCard 
              report={item} 
              onDelete={() => deleteReport(item.id)}
            />
          )}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={['#0d6efd']}
              tintColor="#0d6efd"
            />
          }
          contentContainerStyle={[
            styles.listContainer,
            reports.length === 0 && styles.emptyList
          ]}
          ListEmptyComponent={<EmptyState />}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  
  // Header
  header: {
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6c757d',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 12,
  },

  // List
  listContainer: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
  },

  // Report Card
  reportCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
    lineHeight: 20,
  },
  cardDate: {
    fontSize: 12,
    color: '#6c757d',
  },
  deleteButton: {
    padding: 4,
  },
  cardContent: {
    marginBottom: 12,
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#495057',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
    textTransform: 'capitalize',
  },
  reportId: {
    fontSize: 12,
    color: '#6c757d',
    fontFamily: 'monospace',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  emptyIconContainer: {
    marginBottom: 24,
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 50,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyFeatures: {
    gap: 12,
    alignItems: 'flex-start',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#495057',
  },
});