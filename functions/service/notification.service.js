const admin = require('firebase-admin');

/**
 * Retrieves all the FCM Tokens stored in the Realtime Database and returns
 * them in an array.
 */
exports.getAllFCMTokens = async function getAllFCMTokens() {
  const fcmTokensData = await admin.database().ref('/fcmTokens').once('value');
  
  // Initialize the FCM Tokens array.
  var fcmTokens = [];

  // Loop through each FCM Token and add it to the FCM Tokens array.
  fcmTokensData.forEach(tokenData => {
    fcmTokens.push(tokenData.val());
  });
  
  return fcmTokens;
}

/**
 * Sends a push notification to all the devices with the specified device tokens.
 */
exports.sendPushNotificationToMultiple = function sendPushNotificationToMultiple(title, message, fcmTokens) {
  return admin.messaging().sendMulticast({
    tokens: fcmTokens,
    notification: {
      title: title,
      body: message
    }
  });
}
