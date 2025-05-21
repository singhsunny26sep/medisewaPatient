import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import {Container} from '../../component/Container/Container';
import {COLORS} from '../../Theme/Colors';
import {moderateScale, scale, verticalScale} from '../../utils/Scaling';
import {Fonts} from '../../Theme/Fonts';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const {width, height} = Dimensions.get('window');

export default function VideoCall({route}) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isCameraFlipped, setIsCameraFlipped] = useState(false);

  const doctor = route.params?.doctor;

  return (
    <Container
      statusBarStyle={'light-content'}
      statusBarBackgroundColor={COLORS.black}
      backgroundColor={COLORS.black}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />

      <View style={styles.videoContainer}>
        <View style={styles.remoteVideo}>
          {doctor?.image && (
            <Image
              source={{uri: doctor.image}}
              style={styles.doctorImage}
              resizeMode="cover"
            />
          )}
          <View style={styles.doctorInfoContainer}>
            <Text style={styles.doctorName}>{doctor?.name || 'Doctor'}</Text>
            <Text style={styles.callStatus}>Video Call</Text>
            <View style={styles.callDurationContainer}>
              <Ionicons name="time" size={16} color={COLORS.white} />
              <Text style={styles.callDuration}>00:00</Text>
            </View>
          </View>
        </View>

        <View style={styles.localVideo}>
          <View style={styles.localVideoContent}>
            <View style={styles.localVideoHeader}>
              <View style={styles.connectionStatus}>
                <View style={styles.connectionDot} />
                <Text style={styles.connectionText}>Connected</Text>
              </View>
            </View>
            <View style={styles.youTextContainer}>
              <Text style={styles.youText}>You</Text>
            </View>
          </View>
        </View>

        <View style={styles.topControls}>
          <TouchableOpacity
            style={styles.topControlButton}
            onPress={() => setIsCameraFlipped(!isCameraFlipped)}>
            <MaterialIcons
              name="flip-camera-ios"
              size={24}
              color={COLORS.white}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.topControlButton}>
            <Ionicons name="settings" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.controlsContainer}>
        <View style={styles.controlGroup}>
          <TouchableOpacity
            style={[
              styles.controlButton,
              isMuted && styles.controlButtonActive,
            ]}
            onPress={() => setIsMuted(!isMuted)}>
            <Ionicons
              name={isMuted ? 'mic-off' : 'mic'}
              size={30}
              color={COLORS.white}
            />
            <Text style={styles.controlText}>Mute</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.controlButton,
              isVideoOff && styles.controlButtonActive,
            ]}
            onPress={() => setIsVideoOff(!isVideoOff)}>
            <Ionicons
              name={isVideoOff ? 'videocam-off' : 'videocam'}
              size={30}
              color={COLORS.white}
            />
            <Text style={styles.controlText}>Video</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.controlButton,
              isSpeakerOn && styles.controlButtonActive,
            ]}
            onPress={() => setIsSpeakerOn(!isSpeakerOn)}>
            <Ionicons
              name={isSpeakerOn ? 'volume-high' : 'volume-medium'}
              size={30}
              color={COLORS.white}
            />
            <Text style={styles.controlText}>Speaker</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.endCallButton}>
          <Ionicons name="call" size={30} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  videoContainer: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  remoteVideo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorImage: {
    width: scale(120),
    height: scale(120),
    borderRadius: moderateScale(60),
    marginBottom: verticalScale(20),
    borderWidth: 2,
    borderColor: COLORS.DODGERBLUE,
  },
  doctorInfoContainer: {
    alignItems: 'center',
  },
  doctorName: {
    fontSize: moderateScale(24),
    color: COLORS.white,
    fontFamily: Fonts.Bold,
    marginBottom: verticalScale(5),
  },
  callStatus: {
    fontSize: moderateScale(16),
    color: COLORS.white,
    fontFamily: Fonts.Regular,
    marginBottom: verticalScale(10),
  },
  callDurationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: scale(15),
    paddingVertical: verticalScale(5),
    borderRadius: moderateScale(20),
  },
  callDuration: {
    fontSize: moderateScale(14),
    color: COLORS.white,
    fontFamily: Fonts.Medium,
    marginLeft: scale(5),
  },
  localVideo: {
    position: 'absolute',
    right: scale(20),
    top: verticalScale(50),
    width: scale(100),
    height: scale(150),
    backgroundColor: COLORS.gray,
    borderRadius: moderateScale(10),
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.DODGERBLUE,
  },
  localVideoContent: {
    flex: 1,
  },
  localVideoHeader: {
    padding: scale(5),
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: COLORS.green,
    marginRight: scale(5),
  },
  connectionText: {
    fontSize: moderateScale(10),
    color: COLORS.white,
    fontFamily: Fonts.Regular,
  },
  youTextContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: scale(5),
  },
  youText: {
    fontSize: moderateScale(12),
    color: COLORS.white,
    fontFamily: Fonts.Medium,
    textAlign: 'center',
  },
  topControls: {
    position: 'absolute',
    top: verticalScale(20),
    right: scale(20),
    flexDirection: 'row',
  },
  topControlButton: {
    width: scale(40),
    height: scale(40),
    borderRadius: moderateScale(20),
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: scale(10),
  },
  controlsContainer: {
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(20),
  },
  controlGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: verticalScale(20),
  },
  controlButton: {
    alignItems: 'center',
    padding: scale(10),
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: moderateScale(25),
    width: scale(85),
  },
  controlButtonActive: {
    backgroundColor: COLORS.DODGERBLUE,
  },
  controlText: {
    fontSize: moderateScale(12),
    color: COLORS.white,
    fontFamily: Fonts.Regular,
    marginTop: verticalScale(5),
  },
  endCallButton: {
    alignSelf: 'center',
    backgroundColor: COLORS.red,
    width: scale(70),
    height: scale(70),
    borderRadius: moderateScale(35),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: COLORS.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: moderateScale(4),
  },
});
