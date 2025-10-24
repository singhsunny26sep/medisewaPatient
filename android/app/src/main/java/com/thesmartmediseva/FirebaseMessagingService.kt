package com.thesmartmediseva

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.facebook.react.ReactApplication
import com.facebook.react.ReactInstanceManager
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class MyFirebaseMessagingService : com.google.firebase.messaging.FirebaseMessagingService() {

    companion object {
        private const val GENERAL_CHANNEL_ID = "general_notifications"
        private const val CALL_CHANNEL_ID = "agora_incoming_calls"
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)

        Log.d("FCM", "Message received: ${remoteMessage.data}")

        // Check if it's an incoming call
        if (remoteMessage.data["type"] == "incoming_call") {
            handleIncomingCall(remoteMessage)
        } else {
            // Handle general notification
            displayGeneralNotification(remoteMessage)
        }
    }

    private fun handleIncomingCall(remoteMessage: RemoteMessage) {
        val callId = remoteMessage.data["callId"] ?: return
        val callType = remoteMessage.data["callType"] ?: "video"
        val callerName = remoteMessage.data["callerName"] ?: "Unknown Doctor"
        val callerId = remoteMessage.data["callerId"] ?: ""

        AgoraNotificationHandler.showCallNotification(
            this,
            callId,
            callType,
            callerName,
            callerId
        )
    }

    private fun displayGeneralNotification(remoteMessage: RemoteMessage) {
        createGeneralNotificationChannel()

        val title = remoteMessage.notification?.title ?: remoteMessage.data["title"] ?: "New Message"
        val body = remoteMessage.notification?.body ?: remoteMessage.data["body"] ?: "You have a new message"

        val intent = Intent(this, MainActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
        }
        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val builder = NotificationCompat.Builder(this, GENERAL_CHANNEL_ID)
            .setSmallIcon(R.drawable.notification_icon)
            .setContentTitle(title)
            .setContentText(body)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)

        val notificationManager = NotificationManagerCompat.from(this)
        notificationManager.notify(System.currentTimeMillis().toInt(), builder.build())
    }

    private fun createGeneralNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                GENERAL_CHANNEL_ID,
                "General Notifications",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Notifications for general app messages"
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 1000, 500, 1000)
            }

            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }
}