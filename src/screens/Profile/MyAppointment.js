import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Image,
} from 'react-native';
import {Container} from '../../component/Container/Container';
import {COLORS} from '../../Theme/Colors';
import CustomHeader from '../../component/header/CustomHeader';
import {Instance} from '../../api/Instance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {moderateScale, scale, verticalScale} from '../../utils/Scaling';
import {Fonts} from '../../Theme/Fonts';
import strings from '../../../localization';
import ShimmerCard from '../../component/Shimmer/ShimmerCard';

export default function MyAppointment({navigation}) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.warn('No token found');
        setLoading(false);
        return;
      }

      const response = await Instance.get(
        '/api/v1/bookings/patientBooking/patient/null', 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        setAppointments(response.data.result);
      }
    } catch (error) {
      console.error(
        'Error fetching appointments:',
        error?.response?.data || error.message,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const renderAppointment = ({item}) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Image
          source={{uri: item.doctorId.image}}
          style={styles.doctorImage}
          resizeMode="cover"
        />
        <View style={{flex: 1, paddingLeft: 10}}>
          <Text style={styles.doctorName}>{item.doctorId.name}</Text>
          <Text style={styles.clinicText}>{item.doctorId.clinicAddress}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.infoRow}>
        <Text style={styles.label}>📅 Date</Text>
        <Text style={styles.value}>
          {new Date(item.appointmentDate).toDateString()}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>⏰ Time</Text>
        <Text style={styles.value}>{item.appointmentTime}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>💸 Fee</Text>
        <Text style={styles.value}>₹{item.consultationFee}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>🧾 Total</Text>
        <Text style={styles.value}>₹{item.totalAmount}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>📍 Status</Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                item.bookingStatus.toLowerCase() === 'confirmed'
                  ? COLORS.green + '20'
                  : item.bookingStatus.toLowerCase() === 'pending'
                  ? COLORS.red + '20'
                  : COLORS.yellowgreen + '20',
            },
          ]}>
          <Text
            style={[
              styles.statusText,
              {
                color:
                  item.bookingStatus.toLowerCase() === 'confirmed'
                    ? COLORS.green
                    : item.bookingStatus.toLowerCase() === 'pending'
                    ? COLORS.red
                    : COLORS.yellowgreen,
              },
            ]}>
            {item.bookingStatus}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <Container
      statusBarStyle={'dark-content'}
      statusBarBackgroundColor={COLORS.white}
      backgroundColor={COLORS.white}>
      <CustomHeader title={strings.MyAppointment} navigation={navigation} />

      {loading ? (
        <FlatList
          data={[1, 2, 3, 4, 5]}
          keyExtractor={(item) => item.toString()}
          renderItem={() => <ShimmerCard type="appointment" />}
          contentContainerStyle={{padding: 16}}
        />
      ) : appointments.length === 0 ? (
        <View style={styles.noData}>
          <Text style={styles.noDataText}>No appointments found</Text>
        </View>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={item => item._id}
          renderItem={renderAppointment}
          contentContainerStyle={{padding: 16}}
        />
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  card: {
    backgroundColor: COLORS.white,
    padding: moderateScale(15),
    borderRadius: moderateScale(12),
    marginBottom: scale(16),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorImage: {
    width: scale(60),
    height: scale(60),
    borderRadius: moderateScale(35),
  },
  doctorName: {
    fontSize: moderateScale(15),
    fontFamily: Fonts.Bold,
    color: COLORS.black,
  },
  clinicText: {
    fontSize: moderateScale(13),
    marginTop: 2,
    fontFamily: Fonts.Medium,
    color: COLORS.gray,
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: verticalScale(10),
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  label: {
    fontSize: moderateScale(13),
    fontFamily: Fonts.Medium,
    color: COLORS.black,
  },
  value: {
    fontSize: moderateScale(14),
    color: COLORS.black,
    fontFamily: Fonts.Regular,
  },
  statusBadge: {
    paddingVertical: scale(4),
    paddingHorizontal: scale(10),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: moderateScale(14),
    fontFamily: Fonts.Bold,
    textTransform: 'capitalize',
  },
  noData: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(50),
  },
  noDataText: {
    fontSize: moderateScale(16),
    fontFamily: Fonts.Medium,
    color: COLORS.gray,
  },
});
