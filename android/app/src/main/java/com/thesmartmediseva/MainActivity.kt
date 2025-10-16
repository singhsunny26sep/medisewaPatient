package com.thesmartmediseva

import android.content.Intent
import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

   private var mNotificationData: Bundle? = null

   override fun onCreate(savedInstanceState: Bundle?) {
       super.onCreate(savedInstanceState)

       // Handle notification intents
       handleNotificationIntent(intent)
   }

   override fun onNewIntent(intent: Intent?) {
       super.onNewIntent(intent)
       intent?.let { handleNotificationIntent(it) }
   }

   private fun handleNotificationIntent(intent: Intent) {
       when (intent.action) {
           "ACCEPT_CALL" -> {
               val callId = intent.getStringExtra("callId")
               val callType = intent.getStringExtra("callType")
               val callerName = intent.getStringExtra("callerName")
               val callerId = intent.getStringExtra("callerId")

               mNotificationData = Bundle().apply {
                   putString("action", "ACCEPT_CALL")
                   putString("callId", callId)
                   putString("callType", callType)
                   putString("callerName", callerName)
                   putString("callerId", callerId)
               }

               // Navigate to call screen
               val callIntent = Intent(this, MainActivity::class.java).apply {
                   putExtra("callId", callId)
                   putExtra("callType", callType)
                   putExtra("callerName", callerName)
                   putExtra("callerId", callerId)
                   putExtra("action", "ACCEPT_CALL")
               }
               startActivity(callIntent)
           }
           "DECLINE_CALL" -> {
               val callId = intent.getStringExtra("callId")
               val callType = intent.getStringExtra("callType")

               mNotificationData = Bundle().apply {
                   putString("action", "DECLINE_CALL")
                   putString("callId", callId)
                   putString("callType", callType)
               }

               // Cancel the notification
               callId?.let { AgoraNotificationHandler.cancelCallNotification(this, it) }
           }
           "CALL_NOTIFICATION_TAPPED" -> {
               val callId = intent.getStringExtra("callId")
               val callType = intent.getStringExtra("callType")
               val callerName = intent.getStringExtra("callerName")

               mNotificationData = Bundle().apply {
                   putString("action", "CALL_NOTIFICATION_TAPPED")
                   putString("callId", callId)
                   putString("callType", callType)
                   putString("callerName", callerName)
               }
           }
       }
   }

   fun getNotificationData(): Bundle? {
       return mNotificationData
   }

   /**
    * Returns the name of the main component registered from JavaScript. This is used to schedule
    * rendering of the component.
    */
   override fun getMainComponentName(): String = "TheSmartMediseva"

   /**
    * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
    * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
    */
   override fun createReactActivityDelegate(): ReactActivityDelegate =
       DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
