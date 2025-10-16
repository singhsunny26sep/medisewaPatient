import React, {useEffect, useMemo, useRef, useState} from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import {COLORS} from "../../Theme/Colors";
import {Fonts} from "../../Theme/Fonts";
import {moderateScale, scale, verticalScale} from "../../utils/Scaling";
import {RtcLocalView, RtcRemoteView} from "react-native-agora";
import {useAgoraCall} from "../../utils/useAgoraCall";
import {buildChannelName} from "../../utils/agoraConfig";
import {ACCEPT_CALL, END_CALL} from "../../api/Api_Controller";
import {useCallManager} from "../../utils/CallManager";
import {AgoraNotificationManager} from "../../utils/AgoraNotificationHandler";

export default function VideoCall({route, navigation}) {
  const {doctor, callData, callAccepted = false} = route?.params || {};
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const [showCallBackOptions, setShowCallBackOptions] = useState(false);
  const [hasAcceptedCall, setHasAcceptedCall] = useState(false);
  const [isCallAccepted, setIsCallAccepted] = useState(callAccepted);
  const [callStatus, setCallStatus] = useState(callAccepted ? 'Connecting...' : 'Ringing...');
  const intervalRef = useRef(null);
  const { initiateCall } = useCallManager();

  if (!doctor) {
    console.error('VideoCall: No doctor data provided');
    Alert.alert(
      "Error",
      "Doctor information is missing. Please try again.",
      [{ text: "OK", onPress: () => navigation.goBack() }]
    );
    return null;
  }

  const channel = callData?.channelName || buildChannelName(doctor?.id ?? "demo");
  const uid = callData?.uid || 0;
  const token = callData?.token;
  const callId = callData?.callId;
  
  const {joined, remoteUsers, toggleMute, toggleVideo, switchCamera, leave} = useAgoraCall({
    channel, 
    uid, 
    withVideo: true, 
    token
  });

  useEffect(() => {
    // Only call ACCEPT_CALL API if this is the receiver who accepted the call
    if (callAccepted && callId && !hasAcceptedCall) {
      (async () => {
        try {
          console.log('VideoCall: Receiver accepted call - calling ACCEPT_CALL API for callId:', callId);
          await ACCEPT_CALL(callId);
          setHasAcceptedCall(true);
          setIsCallAccepted(true);
          setCallStatus('Connecting...');
          console.log('VideoCall: Call accepted successfully on server');
        } catch (error) {
          console.error('VideoCall: Error calling ACCEPT_CALL API:', error);
        }
      })();
    }

    // Start call timer only after call is accepted
    if (isCallAccepted) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [callId, hasAcceptedCall, callAccepted, isCallAccepted]);


  const timerLabel = useMemo(() => {
    const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
    const ss = String(seconds % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }, [seconds]);

  const endCall = async () => {
    try {
      if (callId) {
        console.log('VideoCall: Ending call with callId:', callId);
        const response = await END_CALL(callId);
        console.log('VideoCall: Call ended successfully:', response);
      }
    } catch (error) {
      console.log('VideoCall: Error ending call:', error);
    } finally {
      await leave();
      navigation.goBack();
    }
  };

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
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.topBarCenter}>
          <Text style={styles.doctorName} numberOfLines={1}>
            {callData?.receiver?.name || doctor?.name || "Doctor"}
          </Text>
          <Text style={styles.timer}>{isCallAccepted ? timerLabel : callStatus}</Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowCallBackOptions(!showCallBackOptions)}
          style={styles.callBackButton}
        >
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
            <Ionicons name="videocam" size={24} color={COLORS.DODGERBLUE} />
            <Text style={styles.callBackText}>Video Call Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.callBackOption}
            onPress={() => handleCallBack('audio')}
          >
            <Ionicons name="call" size={24} color={COLORS.DODGERBLUE} />
            <Text style={styles.callBackText}>Audio Call Back</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.videoArea}>
        <View style={styles.remoteVideo}>
          {joined && remoteUsers.length > 0 ? (
            <RtcRemoteView.SurfaceView
              style={StyleSheet.absoluteFill}
              uid={remoteUsers[0]}
              channelId={channel}
            />
          ) : (
            <Text style={styles.videoLabel}>{joined ? "Waiting for remote..." : (isCallAccepted ? "Connecting..." : "Ringing...")}</Text>
          )}
        </View>
        <View style={styles.localVideo}>
          {joined ? (
            <RtcLocalView.SurfaceView style={StyleSheet.absoluteFill} />
          ) : (
            <Text style={styles.videoLabelSmall}>You</Text>
          )}
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, !isMuted ? styles.enabled : null]}
          onPress={async () => {
            const next = !isMuted;
            setIsMuted(next);
            await toggleMute(next);
          }}
        >
          <Ionicons name={isMuted ? "mic-off" : "mic"} size={24} color={COLORS.white} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, isCameraOn ? styles.enabled : null]}
          onPress={async () => {
            const next = !isCameraOn;
            setIsCameraOn(next);
            await toggleVideo(!next);
          }}
        >
          <Ionicons name={isCameraOn ? "videocam" : "videocam-off"} size={24} color={COLORS.white} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={switchCamera}>
          <Ionicons name="camera-reverse" size={24} color={COLORS.white} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.controlButton, styles.hangup]} onPress={endCall}>
          <Ionicons name="call" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  topBar: {
    height: verticalScale(56),
    paddingHorizontal: scale(16),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.DODGERBLUE,
  },
  topBarCenter: {
    flex: 1,
    alignItems: "center",
  },
  doctorName: {
    color: COLORS.white,
    fontFamily: Fonts.Medium,
    fontSize: moderateScale(15),
  },
  timer: {
    color: COLORS.AntiFlashWhite,
    fontFamily: Fonts.Light,
    fontSize: moderateScale(12),
    marginTop: verticalScale(2),
  },
  videoArea: {
    flex: 1,
    position: "relative",
    backgroundColor: COLORS.black,
  },
  remoteVideo: {
    flex: 1,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
  },
  localVideo: {
    position: "absolute",
    right: scale(12),
    bottom: scale(12),
    width: scale(110),
    height: verticalScale(160),
    backgroundColor: "#222",
    borderRadius: moderateScale(10),
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  videoLabel: {
    color: COLORS.white,
    fontFamily: Fonts.Medium,
    fontSize: moderateScale(16),
  },
  videoLabelSmall: {
    color: COLORS.white,
    fontFamily: Fonts.Medium,
    fontSize: moderateScale(12),
  },
  controls: {
    height: verticalScale(90),
    backgroundColor: "rgba(0,0,0,0.6)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingHorizontal: scale(16),
  },
  controlButton: {
    width: scale(54),
    height: scale(54),
    borderRadius: scale(27),
    backgroundColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },
  enabled: {
    backgroundColor: COLORS.DODGERBLUE,
  },
  hangup: {
    backgroundColor: COLORS.red,
  },
  callBackButton: {
    paddingHorizontal: scale(8),
    paddingVertical: scale(8),
  },
  callBackModal: {
    position: 'absolute',
    top: verticalScale(56),
    right: scale(16),
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