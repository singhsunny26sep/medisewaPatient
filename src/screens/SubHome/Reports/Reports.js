import React, {useState, useEffect} from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {COLORS} from '../../../Theme/Colors';
import {scale, verticalScale, moderateScale} from '../../../utils/Scaling';
import {Instance} from '../../../api/Instance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import {PermissionsAndroid, Platform} from 'react-native';
import FileViewer from 'react-native-file-viewer';

export default function Reports({navigation}) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [downloadDest, setDownloadDest] = useState('');

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission Required',
            message: 'This app needs access to your storage to download files',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          const response = await Instance.get('/reports/user', {
            headers: {
              Authorization: token,
            },
          });
          setReports(response.data);
          // console.log(response.data, 'your responce');
        } else {
          setError('No token found');
        }
      } catch (err) {
        setError('Failed to fetch reports');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleDownload = async fileData => {
    const permissionGranted = await requestStoragePermission();
    if (permissionGranted) {
      try {
        const base64String = fileData.split(',')[1];
        const fileExtension = '.pdf';
        const fileName = `report_${new Date().getTime()}${fileExtension}`;
        const downloadDestPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

        // Write the file to disk
        await RNFS.writeFile(downloadDestPath, base64String, 'base64');

        // Check if the file exists
        const fileExists = await RNFS.exists(downloadDestPath);
        if (fileExists) {
          setDownloadDest(downloadDestPath);
          setSuccessModalVisible(true);
        } else {
          Alert.alert('Error', 'Failed to download file', [{text: 'OK'}]);
        }
      } catch (error) {
        console.error('Download error:', error);
        Alert.alert('Error', 'An error occurred while downloading the file.', [
          {text: 'OK'},
        ]);
      }
    } else {
      Alert.alert(
        'Permission Denied',
        'Storage permission is required to download files.',
      );
    }
  };

  const handleOpenFile = async filePath => {
    try {
      await FileViewer.open(filePath);
      setSuccessModalVisible(false);
    } catch (error) {
      console.error('Error opening file:', error);
      Alert.alert('Error', 'Failed to open the file', [{text: 'OK'}]);
    }
  };

  const renderReportItem = ({item}) => (
    <View style={styles.ReportView}>
      <Text style={styles.ReportTxt}>{item.details}</Text>
      <Text style={styles.ReportTxt}>
        {new Date(item.createdAt).toLocaleDateString()}
      </Text>
      <TouchableOpacity
        style={styles.downloadbtn}
        onPress={() => handleDownload(item.file)}>
        <Ionicons
          name="download-outline"
          size={20}
          color={COLORS.white}
          style={styles.icon}
        />
        <Text style={styles.downloadTxt}>Download Report</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.DODGERBLUE} barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.TittleView}>
          <Text style={styles.TittleText}>Appointment Reports</Text>
        </View>
      </View>
      <View style={styles.searchHeader}>
        <View style={styles.searchTouch}>
          <TextInput
            placeholder="Search..."
            placeholderTextColor={COLORS.grey}
            style={styles.searchInput}
          />
          <Ionicons
            name="search-circle-sharp"
            size={40}
            color={COLORS.DODGERBLUE}
          />
        </View>
      </View>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.DODGERBLUE} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : reports.length === 0 ? (
        <View style={styles.centered}>
          <Image
            source={require('../../../assets/no-data.jpg')}
            style={styles.NoDataImage}
          />
          <Text style={styles.errorText}>No reports available</Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          renderItem={renderReportItem}
          keyExtractor={item => item._id}
        />
      )}

      <Modal
        visible={successModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSuccessModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.successMessage}>
              File downloaded successfully
            </Text>
            <View style={styles.DoneImageView}>
              <Image
                style={styles.doneimage}
                source={require('../../../assets/done-icon.jpg')}
              />
            </View>
            <TouchableOpacity
              onPress={() => handleOpenFile(downloadDest)}
              style={styles.modalSucessButton}>
              <Text style={styles.modalButtonText}>Open File</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSuccessModalVisible(false)}
              style={styles.modalSucessButton}>
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(8),
    backgroundColor: COLORS.DODGERBLUE,
  },
  TittleView: {
    flex: 1,
  },
  TittleText: {
    fontSize: moderateScale(18),
    color: COLORS.white,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  searchHeader: {
    height: verticalScale(70),
    backgroundColor: COLORS.DODGERBLUE,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: moderateScale(10),
    borderBottomRightRadius: moderateScale(10),
  },
  searchTouch: {
    flexDirection: 'row',
    width: '90%',
    backgroundColor: COLORS.white,
    borderColor: COLORS.AntiFlashWhite,
    borderWidth: moderateScale(1),
    borderRadius: moderateScale(10),
    paddingHorizontal: scale(10),
    elevation: 3,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: verticalScale(40),
    color: COLORS.black,
    fontSize: moderateScale(16),
  },
  ReportMainView: {
    marginVertical: verticalScale(10),
    marginHorizontal: scale(10),
  },
  ReportView: {
    width: scale(330),
    backgroundColor: COLORS.AntiFlashWhite,
    borderRadius: moderateScale(5),
    borderWidth: moderateScale(0.5),
    borderColor: COLORS.AntiFlashWhite,
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(10),
    marginHorizontal: scale(10),
    marginVertical: verticalScale(10),
    alignSelf: 'center',
    elevation: 5,
  },
  ReportTxt: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: COLORS.DODGERBLUE,
    marginTop: verticalScale(5),
  },
  downloadbtn: {
    flexDirection: 'row',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(6),
    backgroundColor: COLORS.DODGERBLUE,
    borderColor: COLORS.DODGERBLUE,
    borderRadius: moderateScale(10),
    borderWidth: moderateScale(0.5),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  downloadTxt: {
    marginLeft: scale(5),
    color: COLORS.white,
    fontSize: moderateScale(14),
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    fontSize: moderateScale(16),
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  NoDataImage: {
    height: verticalScale(150),
    width: scale(180),
    overflow: 'hidden',
    resizeMode: 'contain',
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    padding: moderateScale(20),
    borderRadius: moderateScale(10),
    width: '80%',
  },
  successMessage: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: COLORS.DODGERBLUE,
    textAlign: 'center',
  },
  DoneImageView: {
    alignSelf: 'center',
    paddingVertical: verticalScale(5),
  },
  doneimage: {
    height: verticalScale(100),
    width: scale(150),
    overflow: 'hidden',
  },
  modalSucessButton: {
    backgroundColor: COLORS.DODGERBLUE,
    padding: moderateScale(10),
    borderRadius: moderateScale(5),
    marginHorizontal: moderateScale(5),
    marginTop: verticalScale(10),
  },
  modalButtonText: {
    color: COLORS.white,
    textAlign: 'center',
    fontSize: moderateScale(16),
  },
});
