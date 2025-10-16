package com.thesmartmediseva

import android.content.Context
import android.content.Intent
import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = AgoraNotificationModule.NAME)
class AgoraNotificationModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val NAME = "AgoraNotificationHandler"
    }

    override fun getName(): String = NAME

    override fun initialize() {
        super.initialize()
        // Initialize notification system
        Log.d("AgoraNotificationModule", "Module initialized")
    }

    @ReactMethod
    fun showCallNotification(callData: ReadableMap, promise: Promise) {
        try {
            val callId = callData.getString("callId") ?: ""
            val callType = callData.getString("callType") ?: "video"
            val callerName = callData.getString("callerName") ?: "Unknown"
            val callerId = callData.getString("callerId") ?: ""

            AgoraNotificationHandler.showCallNotification(
                reactApplicationContext,
                callId,
                callType,
                callerName,
                callerId
            )

            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("NOTIFICATION_ERROR", e.message)
        }
    }

    @ReactMethod
    fun cancelCallNotification(callId: String, promise: Promise) {
        try {
            AgoraNotificationHandler.cancelCallNotification(reactApplicationContext, callId)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("CANCEL_ERROR", e.message)
        }
    }

    @ReactMethod
    fun handleNotificationAction(callId: String, action: String, promise: Promise) {
        try {
            when (action) {
                "accept" -> {
                    // Navigate to call screen or handle accept
                    val intent = Intent(reactApplicationContext, MainActivity::class.java).apply {
                        putExtra("callId", callId)
                        putExtra("action", "ACCEPT_CALL")
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    }
                    reactApplicationContext.startActivity(intent)
                }
                "decline" -> {
                    // Cancel the notification
                    AgoraNotificationHandler.cancelCallNotification(reactApplicationContext, callId)
                }
            }

            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ACTION_ERROR", e.message)
        }
    }

    @ReactMethod
    fun getNotificationIntent(promise: Promise) {
        try {
            val activity = currentActivity as? MainActivity
            val notificationData = activity?.getNotificationData()

            if (notificationData != null) {
                val result = Arguments.createMap().apply {
                    putString("action", notificationData.getString("action"))
                    putString("callId", notificationData.getString("callId"))
                    putString("callType", notificationData.getString("callType"))
                    putString("callerName", notificationData.getString("callerName"))
                    putString("callerId", notificationData.getString("callerId"))
                }
                promise.resolve(result)
            } else {
                promise.resolve(null)
            }
        } catch (e: Exception) {
            promise.reject("INTENT_ERROR", e.message)
        }
    }
}