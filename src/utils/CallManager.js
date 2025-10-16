import { useState, useCallback, useRef, useEffect } from 'react';
import { sendEnhancedAudioCallInvite, sendEnhancedVideoCallInvite } from './rtmService';
import { INITIATE_CALL, ACCEPT_CALL, END_CALL } from '../api/Api_Controller';
import { notificationService } from './NotificationService';

class CallManager {
  constructor() {
    this.currentCall = null;
    this.callHistory = [];
    this.callListeners = [];
    this.isInitiatingCall = false;
  }

  // Add call event listener
  addCallListener(listener) {
    this.callListeners.push(listener);
    return () => {
      this.callListeners = this.callListeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners of call events
  notifyListeners(event, data) {
    this.callListeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (error) {
        console.error('Error in call listener:', error);
      }
    });
  }

  // Initiate a call (patient calling doctor or doctor calling patient)
  async initiateCall(targetUser, callType = 'video', isDoctorInitiated = false) {
    if (this.isInitiatingCall) {
      console.log('Call already being initiated');
      return null;
    }

    this.isInitiatingCall = true;

    try {
      console.log(`Initiating ${callType} call to:`, targetUser.name, { isDoctorInitiated });

      // Call your backend API to initiate the call
      const response = await INITIATE_CALL({
        recieverId: targetUser.id || targetUser.userId,
        callType,
      });

      if (response?.data) {
        const callData = {
          callId: response.data.callId,
          channelName: response.data.channelName,
          token: response.data.token,
          callerId: response.data.callerId,
          callerName: response.data.callerName,
          callerAvatar: response.data.callerAvatar,
          receiver: targetUser,
          callType,
          isDoctorInitiated,
          timestamp: new Date(),
        };

        this.currentCall = callData;

        // Send enhanced call invitation through Agora
        await this.sendCallInvitation(targetUser.id || targetUser.userId, callData);

        this.notifyListeners('CALL_INITIATED', callData);
        return callData;
      }

      return null;
    } catch (error) {
      console.error('Error initiating call:', error);
      this.notifyListeners('CALL_ERROR', { error, targetUser, callType });
      return null;
    } finally {
      this.isInitiatingCall = false;
    }
  }

  // Handle call acceptance when call screen opens
  async handleCallScreenOpened(callId) {
    try {
      console.log('CallManager: Call screen opened for callId:', callId);

      // Call ACCEPT_CALL API when call screen opens (user has accepted the call)
      const response = await ACCEPT_CALL(callId);

      // Update current call status
      if (this.currentCall && this.currentCall.callId === callId) {
        this.currentCall.status = 'accepted';
        this.currentCall.acceptedAt = new Date();
      }

      this.notifyListeners('CALL_ACCEPTED', { callId, response });
      return response;
    } catch (error) {
      console.error('Error accepting call when screen opened:', error);
      this.notifyListeners('CALL_ERROR', { error, callId, action: 'accept_on_screen_open' });
      throw error;
    }
  }

  // Send call invitation through Agora RTM
  async sendCallInvitation(targetUserId, callData) {
    try {
      if (callData.callType === 'audio') {
        await sendEnhancedAudioCallInvite(targetUserId, {
          callId: callData.callId,
          channel: callData.channelName,
          callerId: callData.callerId,
          callerName: callData.callerName,
          callerAvatar: callData.callerAvatar,
        });
      } else {
        await sendEnhancedVideoCallInvite(targetUserId, {
          callId: callData.callId,
          channel: callData.channelName,
          callerId: callData.callerId,
          callerName: callData.callerName,
          callerAvatar: callData.callerAvatar,
        });
      }

      console.log('Call invitation sent successfully');
    } catch (error) {
      console.error('Error sending call invitation:', error);
      throw error;
    }
  }

  // Accept an incoming call (called when user opens call screen)
  async acceptCall(callId) {
    try {
      console.log('CallManager: User opened call screen - accepting call:', callId);

      // This is called when user opens the call screen, indicating they've accepted the call
      // The ACCEPT_CALL API should be called by the call screen component itself
      // Here we just update the local state and notify listeners

      this.notifyListeners('CALL_ACCEPTED', { callId });
      return { success: true, callId };
    } catch (error) {
      console.error('Error in call acceptance:', error);
      throw error;
    }
  }

  // End current call
  async endCall(callId) {
    try {
      console.log('Ending call:', callId);

      // Notify backend that call is ended
      const response = await END_CALL(callId);

      this.currentCall = null;
      this.notifyListeners('CALL_ENDED', { callId });
      return response;
    } catch (error) {
      console.error('Error ending call:', error);
      throw error;
    }
  }

  // Get current call info
  getCurrentCall() {
    return this.currentCall;
  }

  // Check if currently in a call
  isInCall() {
    return this.currentCall !== null;
  }

  // Add call to history
  addToHistory(callData) {
    this.callHistory.unshift({
      ...callData,
      timestamp: new Date(),
    });

    // Keep only last 50 calls
    if (this.callHistory.length > 50) {
      this.callHistory = this.callHistory.slice(0, 50);
    }
  }

  // Get call history
  getCallHistory() {
    return this.callHistory;
  }
}

// Create singleton instance
const callManager = new CallManager();

export { callManager };

// React hook for using call manager
export const useCallManager = () => {
  const [currentCall, setCurrentCall] = useState(callManager.getCurrentCall());
  const [callHistory, setCallHistory] = useState(callManager.getCallHistory());

  useEffect(() => {
    const handleCallEvent = (event, data) => {
      switch (event) {
        case 'CALL_INITIATED':
          setCurrentCall(data);
          callManager.addToHistory(data);
          setCallHistory([...callManager.getCallHistory()]);
          break;
        case 'CALL_ACCEPTED':
          if (currentCall && currentCall.callId === data.callId) {
            setCurrentCall({ ...currentCall, status: 'accepted' });
          }
          break;
        case 'CALL_ENDED':
          setCurrentCall(null);
          setCallHistory([...callManager.getCallHistory()]);
          break;
        case 'CALL_ERROR':
          console.error('Call error:', data);
          break;
      }
    };

    const unsubscribe = callManager.addCallListener(handleCallEvent);

    return unsubscribe;
  }, [currentCall]);

  const initiateCall = useCallback(async (targetUser, callType = 'video', isDoctorInitiated = false) => {
    return await callManager.initiateCall(targetUser, callType, isDoctorInitiated);
  }, []);

  const acceptCall = useCallback(async (callId) => {
    return await callManager.acceptCall(callId);
  }, []);

  const handleCallScreenOpened = useCallback(async (callId) => {
    return await callManager.handleCallScreenOpened(callId);
  }, []);

  const endCall = useCallback(async (callId) => {
    return await callManager.endCall(callId);
  }, []);

  return {
    currentCall,
    callHistory,
    initiateCall,
    acceptCall,
    handleCallScreenOpened,
    endCall,
    isInCall: callManager.isInCall(),
  };
};