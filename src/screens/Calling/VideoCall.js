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

export default function VideoCall({route, navigation}) {
  const {doctor, callData} = route?.params || {};
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef(null);
  
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
    // Notify backend that this call is accepted (if navigated without handler)
    (async () => {
      try {
        if (callId) {
          await ACCEPT_CALL(callId)
        }
      } catch (e) {}
    })()
    intervalRef.current = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);


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
          <Text style={styles.timer}>{timerLabel}</Text>
        </View>
        <View style={{width: scale(24)}} />
      </View>

      <View style={styles.videoArea}>
        <View style={styles.remoteVideo}>
          {joined && remoteUsers.length > 0 ? (
            <RtcRemoteView.SurfaceView
              style={StyleSheet.absoluteFill}
              uid={remoteUsers[0]}
              channelId={channel}
            />
          ) : (
            <Text style={styles.videoLabel}>{joined ? "Waiting for remote..." : "Connecting..."}</Text>
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
});