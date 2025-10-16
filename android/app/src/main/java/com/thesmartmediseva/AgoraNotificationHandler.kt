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

class AgoraNotificationHandler {
    companion object {
        private const val CHANNEL_ID = "agora_incoming_calls"
        private const val NOTIFICATION_ID = 1001

        @JvmStatic
        fun showCallNotification(
            context: Context,
            callId: String,
            callType: String,
            callerName: String,
            callerId: String
        ) {
            Log.d("AgoraNotificationHandler", "Showing call notification for callId: $callId")

            createNotificationChannel(context)

            // Intent to handle call accept
            val acceptIntent = Intent(context, MainActivity::class.java).apply {
                action = "ACCEPT_CALL"
                putExtra("callId", callId)
                putExtra("callType", callType)
                putExtra("callerName", callerName)
                putExtra("callerId", callerId)
            }

            val acceptPendingIntent = PendingIntent.getActivity(
                context, 0, acceptIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            // Intent to handle call decline
            val declineIntent = Intent(context, MainActivity::class.java).apply {
                action = "DECLINE_CALL"
                putExtra("callId", callId)
                putExtra("callType", callType)
            }

            val declinePendingIntent = PendingIntent.getActivity(
                context, 1, declineIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            // Main intent when notification is tapped
            val mainIntent = Intent(context, MainActivity::class.java).apply {
                action = "CALL_NOTIFICATION_TAPPED"
                putExtra("callId", callId)
                putExtra("callType", callType)
                putExtra("callerName", callerName)
            }

            val mainPendingIntent = PendingIntent.getActivity(
                context, 2, mainIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            val builder = NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(R.drawable.notification_icon)
                .setContentTitle("Incoming ${if (callType == "video") "Video" else "Audio"} Call")
                .setContentText("$callerName is calling you")
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setCategory(NotificationCompat.CATEGORY_CALL)
                .setFullScreenIntent(mainPendingIntent, true)
                .setOngoing(true)
                .setAutoCancel(false)
                .addAction(R.drawable.notification_icon, "Accept", acceptPendingIntent)
                .addAction(R.drawable.notification_icon, "Decline", declinePendingIntent)
                .setContentIntent(mainPendingIntent)

            val notificationManager = NotificationManagerCompat.from(context)
            notificationManager.notify(callId.hashCode(), builder.build())
        }

        @JvmStatic
        fun cancelCallNotification(context: Context, callId: String) {
            Log.d("AgoraNotificationHandler", "Cancelling call notification for callId: $callId")
            val notificationManager = NotificationManagerCompat.from(context)
            notificationManager.cancel(callId.hashCode())
        }

        private fun createNotificationChannel(context: Context) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val channel = NotificationChannel(
                    CHANNEL_ID,
                    "Incoming Calls",
                    NotificationManager.IMPORTANCE_HIGH
                ).apply {
                    description = "Notifications for incoming video and audio calls"
                    lockscreenVisibility = NotificationCompat.VISIBILITY_PUBLIC
                    enableVibration(true)
                    vibrationPattern = longArrayOf(0, 1000, 500, 1000)
                }

                val manager = context.getSystemService(NotificationManager::class.java)
                manager.createNotificationChannel(channel)
            }
        }
    }
}