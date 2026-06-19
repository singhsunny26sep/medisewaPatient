import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Dimensions,
  Platform,
  Animated,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../../Theme/Colors';
import { scale, verticalScale, moderateScale } from '../../../utils/Scaling';
import { Instance } from '../../../api/Instance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import { PermissionsAndroid, Platform as RNPlatform } from 'react-native';
import FileViewer from 'react-native-file-viewer';

const { width, height } = Dimensions.get('window');

export default function Reports({ navigation }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [downloadDest, setDownloadDest] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [reports]);

  const requestStoragePermission = async () => {
    if (RNPlatform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission Required',
            message: 'This app needs access to your storage to download files',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const fetchReports = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        const response = await Instance.get('api/v1/reports/user', {
          headers: {
            Authorization: token,
          },
        });
        setReports(response.data);
      } else {
        setError('No token found');
      }
    } catch (err) {
      console.log(err.response?.data || err.message);
      setError('Failed to fetch reports');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const filteredReports = reports.filter((report) =>
    report.details?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownload = async (fileData, report) => {
    setSelectedReport(report);
    const permissionGranted = await requestStoragePermission();
    if (permissionGranted) {
      try {
        const base64String = fileData.split(',')[1];
        const fileExtension = '.pdf';
        const fileName = `report_${new Date().getTime()}${fileExtension}`;
        const downloadDestPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

        await RNFS.writeFile(downloadDestPath, base64String, 'base64');

        const fileExists = await RNFS.exists(downloadDestPath);
        if (fileExists) {
          setDownloadDest(downloadDestPath);
          setSuccessModalVisible(true);
        } else {
          Alert.alert('Error', 'Failed to download file', [{ text: 'OK' }]);
        }
      } catch (error) {
        console.error('Download error:', error);
        Alert.alert('Error', 'An error occurred while downloading the file.', [
          { text: 'OK' },
        ]);
      }
    } else {
      Alert.alert(
        'Permission Denied',
        'Storage permission is required to download files.'
      );
    }
  };

  const handleOpenFile = async (filePath) => {
    try {
      await FileViewer.open(filePath);
      setSuccessModalVisible(false);
    } catch (error) {
      console.error('Error opening file:', error);
      Alert.alert('Error', 'Failed to open the file', [{ text: 'OK' }]);
    }
  };

  const ReportCard = ({ item, index }) => {
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          delay: index * 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          delay: index * 100,
          useNativeDriver: true,
        }),
      ]).start();
    }, []);

    return (
      <Animated.View
        style={[
          styles.reportCard,
          {
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.iconWrapper}>
            <LinearGradient
              colors={['#3B82F6', '#2563EB']}
              style={styles.iconGradient}
            >
              <Ionicons name="document-text-outline" size={24} color="#FFF" />
            </LinearGradient>
          </View>
          <View style={styles.cardHeaderInfo}>
            <Text style={styles.reportTitle} numberOfLines={2}>
              {item.details || 'Medical Report'}
            </Text>
            <View style={styles.dateBadge}>
              <Ionicons name="calendar-outline" size={12} color="#6B7280" />
              <Text style={styles.dateText}>
                {new Date(item.createdAt).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={styles.downloadBtn}
            onPress={() => handleDownload(item.file, item)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#3B82F6', '#2563EB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.downloadGradient}
            >
              <Ionicons name="download-outline" size={18} color="#FFF" />
              <Text style={styles.downloadBtnText}>Download Report</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  const EmptyList = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconBg}>
        <Ionicons name="document-text-outline" size={60} color="#3B82F6" />
      </View>
      <Text style={styles.emptyTitle}>No Reports Found</Text>
      <Text style={styles.emptySubtitle}>
        Your medical reports will appear here once available
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loaderText}>Loading reports...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medical Reports</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Stats Summary */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{reports.length}</Text>
          <Text style={styles.statLabel}>Total Reports</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>
            {reports.filter((r) => r.file).length}
          </Text>
          <Text style={styles.statLabel}>Available</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>
            {new Date().getFullYear()}
          </Text>
          <Text style={styles.statLabel}>This Year</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search reports..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Reports List */}
      <Animated.FlatList
        data={filteredReports}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item._id}
        renderItem={({ item, index }) => <ReportCard item={item} index={index} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
        }
        ListEmptyComponent={<EmptyList />}
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
      />

      {/* Success Modal */}
      <Modal
        visible={successModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalIconWrapper}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.modalIconGradient}
              >
                <Ionicons name="checkmark" size={40} color="#FFF" />
              </LinearGradient>
            </View>
            <Text style={styles.modalTitle}>Download Complete!</Text>
            <Text style={styles.modalMessage}>
              Your report has been downloaded successfully
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancelBtn]}
                onPress={() => setSuccessModalVisible(false)}
              >
                <Text style={styles.modalCancelBtnText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalOpenBtn]}
                onPress={() => handleOpenFile(downloadDest)}
              >
                <LinearGradient
                  colors={['#3B82F6', '#2563EB']}
                  style={styles.modalOpenGradient}
                >
                  <Text style={styles.modalOpenBtnText}>Open File</Text>
                  <Ionicons name="open-outline" size={18} color="#FFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 20,
    paddingBottom: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  placeholder: {
    width: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 12,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#111827',
    padding: 0,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  reportCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  iconWrapper: {
    marginRight: 14,
  },
  iconGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardHeaderInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
    lineHeight: 22,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
  },
  cardFooter: {
    padding: 16,
  },
  downloadBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  downloadGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  downloadBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  loaderText: {
    marginTop: 12,
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    width: width - 48,
    alignItems: 'center',
  },
  modalIconWrapper: {
    marginBottom: 20,
  },
  modalIconGradient: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalBtn: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  modalCancelBtn: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  modalOpenBtn: {
    overflow: 'hidden',
  },
  modalOpenGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  modalOpenBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
});