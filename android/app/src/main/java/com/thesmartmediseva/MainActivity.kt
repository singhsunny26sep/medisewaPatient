package com.thesmartmediseva

import android.app.ActivityManager
import android.content.Intent
import android.os.Bundle
import android.util.Log
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

    companion object {
        private const val TAG = "MainActivity"
        private const val NOTIFICATION_ACTION_KEY = "action"
        private const val CALL_ID_KEY = "callId"
        private const val CALL_TYPE_KEY = "callType"
        private const val CALLER_NAME_KEY = "callerName"
        private const val CALLER_ID_KEY = "callerId"
    }

    private var mNotificationData: Bundle? = null
    private var isHandlingNotification = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Log.d(TAG, "onCreate called with intent: $intent")
        handleNotificationIntent(intent)
    }

    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        Log.d(TAG, "onNewIntent called with intent: $intent")
        intent?.let { handleNotificationIntent(it) }
    }

    override fun onResume() {
        super.onResume()
        Log.d(TAG, "onResume called")
        mNotificationData?.let { data ->
            Log.d(TAG, "Processing pending notification data in onResume: $data")
            processStoredNotification(data)
            mNotificationData = null
        }
    }

    private fun handleNotificationIntent(intent: Intent) {
        if (isHandlingNotification) {
            Log.d(TAG, "Already handling notification, skipping duplicate")
            return
        }

        val action = intent.action
        Log.d(TAG, "handleNotificationIntent called with action: $action")

        if (action == null) {
            Log.d(TAG, "No action in intent, checking extras")
            val hasCallData = intent.hasExtra(CALL_ID_KEY) || 
                             intent.extras?.containsKey(CALL_ID_KEY) == true
            if (!hasCallData) {
                Log.d(TAG, "No call data in intent extras, skipping")
                return
            }
        }

        when (action) {
            "ACCEPT_CALL",
            "DECLINE_CALL",
            "CALL_NOTIFICATION_TAPPED",
            null -> {
                isHandlingNotification = true
                mNotificationData = Bundle().apply {
                    putString(NOTIFICATION_ACTION_KEY, action)
                    putString(CALL_ID_KEY, intent.getStringExtra(CALL_ID_KEY))
                    putString(CALL_TYPE_KEY, intent.getStringExtra(CALL_TYPE_KEY))
                    putString(CALLER_NAME_KEY, intent.getStringExtra(CALLER_NAME_KEY))
                    putString(CALLER_ID_KEY, intent.getStringExtra(CALLER_ID_KEY))
                }

                if (action == "DECLINE_CALL") {
                    val callId = intent.getStringExtra(CALL_ID_KEY)
                    if (callId != null) {
                        AgoraNotificationHandler.cancelCallNotification(this, callId)
                    }
                    mNotificationData = null
                    isHandlingNotification = false
                } else if (action == "ACCEPT_CALL") {
                    val callId = intent.getStringExtra(CALL_ID_KEY)
                    if (callId != null) {
                        AgoraNotificationHandler.cancelCallNotification(this, callId)
                    }
                }

                Log.d(TAG, "Stored notification data for processing: $mNotificationData")
            }
            else -> Log.d(TAG, "Ignoring unknown action: $action")
        }
    }

    private fun processStoredNotification(data: Bundle) {
        val action = data.getString(NOTIFICATION_ACTION_KEY)
        val callId = data.getString(CALL_ID_KEY)
        val callType = data.getString(CALL_TYPE_KEY) ?: "video"
        val callerName = data.getString(CALLER_NAME_KEY) ?: "Unknown"

        Log.d(TAG, "processStoredNotification: action=$action, callId=$callId, callType=$callType")

        when (action) {
            "ACCEPT_CALL",
            "CALL_NOTIFICATION_TAPPED" -> {
                if (callId != null) {
                    navigateToCallScreen(callId, callType, callerName, action == "ACCEPT_CALL")
                } else {
                    Log.w(TAG, "No callId in notification data")
                }
            }
            "DECLINE_CALL" -> {
                Log.d(TAG, "Call declined, notification already cancelled")
            }
        }

        isHandlingNotification = false
    }

    private fun navigateToCallScreen(callId: String, callType: String, callerName: String, callAccepted: Boolean) {
        try {
            val currentActivity = this
            Log.d(TAG, "Navigating to call screen: type=$callType, callId=$callId, accepted=$callAccepted")

            val intent = Intent().apply {
                putExtra(CALL_ID_KEY, callId)
                putExtra(CALL_TYPE_KEY, callType)
                putExtra(CALLER_NAME_KEY, callerName)
            }

            runOnUiThread {
                try {
                    sendResultToReactNative(intent)
                } catch (e: Exception) {
                    Log.e(TAG, "Error sending result to RN", e)
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error navigating to call screen", e)
            isHandlingNotification = false
        }
    }

    private fun sendResultToReactNative(intent: Intent) {
        val callId = intent.getStringExtra(CALL_ID_KEY)
        val callType = intent.getStringExtra(CALL_TYPE_KEY) ?: "video"
        val callerName = intent.getStringExtra(CALLER_NAME_KEY) ?: "Unknown"

        Log.d(TAG, "sendResultToReactNative called for callId: $callId")
        isHandlingNotification = false
    }

    fun getNotificationData(): Bundle? {
        val data = mNotificationData
        mNotificationData = null
        isHandlingNotification = false
        return data
    }

    override fun getMainComponentName(): String = "TheSmartMediseva"

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}