import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
  Alert,
} from 'react-native';
import {Container} from '../../component/Container/Container';
import {COLORS} from '../../Theme/Colors';
import {moderateScale, scale, verticalScale} from '../../utils/Scaling';
import {Fonts} from '../../Theme/Fonts';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useAgoraCall} from '../../utils/useAgoraCall';
import {buildChannelName} from '../../utils/agoraConfig';
import {ACCEPT_CALL, END_CALL} from '../../api/Api_Controller';
import {useCallManager} from '../../utils/CallManager';
import {AgoraNotificationManager} from '../../utils/AgoraNotificationHandler';

export default function AudioCall({route, navigation}) {
  const {doctor, callData, callAccepted = false} = route?.params || {};
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef(null);
  const [isKeypadVisible, setIsKeypadVisible] = useState(false);
  const [showCallBackOptions, setShowCallBackOptions] = useState(false);
  const [hasAcceptedCall, setHasAcceptedCall] = useState(false);
  const [isCallAccepted, setIsCallAccepted] = useState(callAccepted);
  const [callStatus, setCallStatus] = useState(callAccepted ? 'Connecting...' : 'Ringing...');
  const { initiateCall } = useCallManager();

  // Validate required data
  if (!doctor) {
    console.error('AudioCall: No doctor data provided');
    Alert.alert(
      "Error",
      "Doctor information is missing. Please try again.",
      [{ text: "OK", onPress: () => navigation.goBack() }]
    );
    return null;
  }

  // Use call data from API response or fallback to doctor data
  const channel = callData?.channelName || buildChannelName(doctor?.id ?? 'demo');
  const uid = callData?.uid || 0;
  const token = callData?.token;
  const callId = callData?.callId;
  
  const {joined, toggleMute, setSpeakerphone, leave} = useAgoraCall({
    channel, 
    uid, 
    withVideo: false, 
    token
  });

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
  
  useEffect(() => {
    // Only call ACCEPT_CALL API if this is the receiver who accepted the call
    if (callAccepted && callId && !hasAcceptedCall) {
      (async () => {
        try {
          console.log('AudioCall: Receiver accepted call - calling ACCEPT_CALL API for callId:', callId);
          await ACCEPT_CALL(callId);
          setHasAcceptedCall(true);
          setIsCallAccepted(true);
          setCallStatus('Connecting...');
          console.log('AudioCall: Call accepted successfully on server');
        } catch (error) {
          console.error('AudioCall: Error calling ACCEPT_CALL API:', error);
        }
      })();
    }

    // Start call timer only after call is accepted and joined
    if (isCallAccepted && joined) {
      intervalRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [joined, callId, hasAcceptedCall, callAccepted, isCallAccepted]);


  const timerLabel = React.useMemo(() => {
    const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
    const ss = String(seconds % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  }, [seconds]);

  // Handle call back to patient
  const handleCallBack = async (callType) => {
    try {
      console.log(`Doctor initiating ${callType} call back to patient`);

      // Get patient info from current call
      const patientInfo = {
        id: callData?.patientId || doctor?.patientId,
        name: callData?.patientName || doctor?.patientName || 'Patient',
        userId: callData?.patientUserId || doctor?.patientUserId,
      };

      if (!patientInfo.userId) {
        Alert.alert('Error', 'Patient information not available for call back');
        return;
      }

      // Initiate call back through call manager
      const callResult = await initiateCall(patientInfo, callType, true); // true = doctor initiated

      if (callResult) {
        console.log('Call back initiated successfully:', callResult);

        // Navigate to new call screen
        navigation.replace(callType === 'video' ? 'VideoCall' : 'AudioCall', {
          doctor: patientInfo,
          callData: callResult,
          isCallBack: true,
        });
      }
    } catch (error) {
      console.error('Error initiating call back:', error);
      Alert.alert('Error', 'Failed to initiate call back. Please try again.');
    } finally {
      setShowCallBackOptions(false);
    }
  };
  

  return (
    <Container
      statusBarStyle={'light-content'}
      statusBarBackgroundColor={COLORS.DODGERBLUE}
      backgroundColor={COLORS.DODGERBLUE}>
      <View style={styles.container}>

        {/* Call Back Button */}
        <View style={styles.statusBar}>
          <TouchableOpacity onPress={() => setShowCallBackOptions(!showCallBackOptions)}>
            <Ionicons name="call" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Call Back Options Modal */}
        {showCallBackOptions && (
          <View style={styles.callBackModal}>
            <TouchableOpacity
              style={styles.callBackOption}
              onPress={() => handleCallBack('video')}
            >
              <Ionicons name="videocam" size={20} color={COLORS.DODGERBLUE} />
              <Text style={styles.callBackText}>Video Call Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.callBackOption}
              onPress={() => handleCallBack('audio')}
            >
              <Ionicons name="call" size={20} color={COLORS.DODGERBLUE} />
              <Text style={styles.callBackText}>Audio Call Back</Text>
            </TouchableOpacity>
          </View>
        )}
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
          <Text style={styles.doctorName}>
            {callData?.receiver?.name || doctor?.name || "Doctor"}
          </Text>
          <Text style={styles.doctorSpecialization}>
            {isCallAccepted && joined ? timerLabel : callStatus}
          </Text>
          <View style={styles.callStatusContainer}>
            <View style={styles.statusDot} />
            <Text style={styles.callStatus}>{callStatus}</Text>
          </View>
        </View>

        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[styles.controlButton, isMuted && styles.activeControl]}
            onPress={async () => {
              const next = !isMuted
              setIsMuted(next)
              await toggleMute(next)
            }}>
            <Ionicons
              name={isMuted ? 'mic-off' : 'mic'}
              size={30}
              color={COLORS.white}
            />
            <Text style={styles.controlText}>Mute</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, isSpeakerOn && styles.activeControl]}
            onPress={async () => {
              const next = !isSpeakerOn;
              setIsSpeakerOn(next);
              await setSpeakerphone(next);
            }}>
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
          onPress={async () => {
            try {
              // End the call on the server
              if (callId) {
                console.log('AudioCall: Ending call with callId:', callId);
                const response = await END_CALL(callId);
                console.log('AudioCall: Call ended successfully:', response);
              }
            } catch (error) {
              console.log('AudioCall: Error ending call:', error);
              // Continue with local cleanup even if server call fails
            } finally {
              // Always clean up local resources
              await leave();
              navigation.goBack();
            }
          }}>
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
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    marginTop: verticalScale(10),
  },
  callBackModal: {
    position: 'absolute',
    top: verticalScale(60),
    right: scale(20),
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(8),
    padding: scale(8),
    elevation: 5,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 1000,
  },
  callBackOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(12),
    minWidth: scale(140),
  },
  callBackText: {
    marginLeft: scale(8),
    fontSize: moderateScale(14),
    color: COLORS.DODGERBLUE,
    fontFamily: Fonts.Medium,
  },
});
