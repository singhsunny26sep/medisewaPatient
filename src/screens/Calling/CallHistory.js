import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import {Container} from '../../component/Container/Container';
import {COLORS} from '../../Theme/Colors';
import CustomHeader from '../../component/header/CustomHeader';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {moderateScale, scale, verticalScale} from '../../utils/Scaling';
import {Fonts} from '../../Theme/Fonts';

const callHistoryData = [
  {
    id: '1',
    name: 'Dr. John Smith',
    time: '10:30 AM',
    date: 'Today',
    type: 'outgoing',
    duration: '5:30',
    profilePic: 'https://randomuser.me/api/portraits/men/1.jpg',
    phoneNumber: '+1234567890',
  },
  {
    id: '2',
    name: 'Dr. Sarah Johnson',
    time: 'Yesterday',
    date: '2:45 PM',
    type: 'incoming',
    duration: '3:15',
    profilePic: 'https://randomuser.me/api/portraits/women/1.jpg',
    phoneNumber: '+1234567891',
  },
  {
    id: '3',
    name: 'Dr. Michael Brown',
    time: '2 days ago',
    date: '11:20 AM',
    type: 'missed',
    duration: '0:00',
    profilePic: 'https://randomuser.me/api/portraits/men/2.jpg',
    phoneNumber: '+1234567892',
  },
  {
    id: '4',
    name: 'Dr. Emily Davis',
    time: '3 days ago',
    date: '4:15 PM',
    type: 'outgoing',
    duration: '7:45',
    profilePic: 'https://randomuser.me/api/portraits/women/2.jpg',
    phoneNumber: '+1234567893',
  },
];

const CallHistoryItem = ({item}) => {
  const getCallIconColor = () => {
    switch (item.type) {
      case 'outgoing':
        return COLORS.primary;
      case 'incoming':
        return COLORS.green;
      case 'missed':
        return COLORS.red;
      default:
        return COLORS.gray;
    }
  };

  const handleCall = () => {
    console.log('Calling:', item.phoneNumber);
  };

  return (
    <TouchableOpacity style={styles.callItem}>
      <View style={styles.leftContainer}>
        <Image source={{uri: item.profilePic}} style={styles.profilePic} />
        <View style={styles.userInfo}>
          <Text style={styles.nameText}>{item.name}</Text>
          <Text style={styles.dateText}>{item.date}</Text>
        </View>
      </View>
      <View style={styles.rightContainer}>
        <View style={styles.timeAndCallContainer}>
          <Text style={styles.timeText}>{item.time}</Text>
          <TouchableOpacity style={styles.callButton} onPress={handleCall}>
            <Icon name="call" size={24} color={COLORS.DODGERBLUE} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function CallHistory({navigation}) {
  return (
    <Container
      statusBarBackgroundColor={COLORS.white}
      statusBarStyle="dark-content"
      backgroundColor={COLORS.white}>
      <CustomHeader title={'Call History'} navigation={navigation} />
      <View>
        <FlatList
          data={callHistoryData}
          renderItem={({item}) => <CallHistoryItem item={item} />}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {},
  listContainer: {
    padding: scale(0),
  },
  callItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: verticalScale(12),
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.gray,
    paddingHorizontal: scale(15),
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightContainer: {
    alignItems: 'flex-end',
  },
  profilePic: {
    width: scale(50),
    height: scale(50),
    borderRadius: moderateScale(30),
    marginRight: scale(12),
  },
  userInfo: {
    flex: 1,
  },
  callInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(4),
  },
  timeAndCallContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callButton: {
    marginLeft: scale(8),
  },
  nameText: {
    fontSize: moderateScale(14),
    fontFamily: Fonts.Medium,
    color: COLORS.black,
  },
  dateText: {
    fontSize: moderateScale(14),
    color: COLORS.gray,
    fontFamily: Fonts.Regular,
  },
  timeText: {
    fontSize: moderateScale(14),
    color: COLORS.gray,
    fontFamily: Fonts.Regular,
  },
});
