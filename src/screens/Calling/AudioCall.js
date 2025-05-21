import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
} from 'react-native';
import {Container} from '../../component/Container/Container';
import {COLORS} from '../../Theme/Colors';
import {moderateScale, scale, verticalScale} from '../../utils/Scaling';
import {Fonts} from '../../Theme/Fonts';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function AudioCall({route, navigation}) {
  const {doctor} = route.params;
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [callDuration, setCallDuration] = useState('00:00');
  const [isKeypadVisible, setIsKeypadVisible] = useState(false);

  const pulseAnim = new Animated.Value(1);

  React.useEffect(() => {
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.2,
        duration: 700,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  

  return (
    <Container
      statusBarStyle={'light-content'}
      statusBarBackgroundColor={COLORS.DODGERBLUE}
      backgroundColor={COLORS.DODGERBLUE}>
      <View style={styles.container}>
        <View style={styles.doctorInfoContainer}>
          <Animated.View
            style={[
              styles.imageContainer,
              {
                transform: [{scale: pulseAnim}],
              },
            ]}>
            <Image source={{uri: doctor.image}} style={styles.doctorImage} />
          </Animated.View>
          <Text style={styles.doctorName}>{doctor.name}</Text>
          <Text style={styles.doctorSpecialization}>{callDuration}</Text>
          <View style={styles.callStatusContainer}>
            <View style={styles.statusDot} />
            <Text style={styles.callStatus}>Connecting...</Text>
          </View>
        </View>

        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[styles.controlButton, isMuted && styles.activeControl]}
            onPress={() => setIsMuted(!isMuted)}>
            <Ionicons
              name={isMuted ? 'mic-off' : 'mic'}
              size={30}
              color={COLORS.white}
            />
            <Text style={styles.controlText}>Mute</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, isSpeakerOn && styles.activeControl]}
            onPress={() => setIsSpeakerOn(!isSpeakerOn)}>
            <Ionicons
              name={isSpeakerOn ? 'volume-high' : 'volume-medium'}
              size={30}
              color={COLORS.white}
            />
            <Text style={styles.controlText}>Speaker</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.controlButton,
              isKeypadVisible && styles.activeControl,
            ]}>
            <Ionicons name="keypad" size={30} color={COLORS.white} />
            <Text style={styles.controlText}>Keypad</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.endCallButton}
          onPress={() => navigation.goBack()}>
          <Ionicons name="call" size={30} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: verticalScale(20),
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    marginTop: verticalScale(10),
  },
  statusText: {
    fontSize: moderateScale(16),
    color: COLORS.white,
    fontFamily: Fonts.Medium,
  },
  durationText: {
    fontSize: moderateScale(16),
    color: COLORS.white,
    fontFamily: Fonts.Medium,
  },
  doctorInfoContainer: {
    alignItems: 'center',
    marginTop: verticalScale(20),
  },
  imageContainer: {
    width: scale(140),
    height: scale(140),
    borderRadius: scale(70),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  doctorImage: {
    width: scale(120),
    height: scale(120),
    borderRadius: scale(60),
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  doctorName: {
    fontSize: moderateScale(24),
    color: COLORS.white,
    fontFamily: Fonts.Bold,
    marginBottom: verticalScale(5),
  },
  doctorSpecialization: {
    fontSize: moderateScale(16),
    color: COLORS.white,
    fontFamily: Fonts.Regular,
    marginBottom: verticalScale(10),
  },
  callStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: scale(15),
    paddingVertical: verticalScale(8),
    borderRadius: scale(20),
  },
  statusDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: COLORS.green,
    marginRight: scale(8),
  },
  callStatus: {
    fontSize: moderateScale(14),
    color: COLORS.white,
    fontFamily: Fonts.Regular,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: scale(20),
    marginBottom: verticalScale(20),
  },
  controlButton: {
    alignItems: 'center',
    padding: scale(15),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: scale(15),
    width: scale(85),
  },
  activeControl: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  controlText: {
    color: COLORS.white,
    fontSize: moderateScale(14),
    fontFamily: Fonts.Regular,
    marginTop: verticalScale(5),
  },
  endCallButton: {
    alignSelf: 'center',
    backgroundColor: COLORS.red,
    width: scale(70),
    height: scale(70),
    borderRadius: scale(35),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(20),
    elevation: 5,
    shadowColor: COLORS.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: scale(4),
  },
  keypadContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: scale(20),
    padding: scale(20),
    marginHorizontal: scale(20),
    marginBottom: verticalScale(20),
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: verticalScale(10),
  },
  keypadButton: {
    width: scale(60),
    height: scale(60),
    borderRadius: scale(30),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keypadText: {
    fontSize: moderateScale(24),
    color: COLORS.white,
    fontFamily: Fonts.Bold,
  },
});
