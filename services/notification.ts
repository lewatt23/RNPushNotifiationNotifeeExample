import {useEffect, useState} from 'react';

import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import notifee, {EventType} from '@notifee/react-native';
import {Linking} from 'react-native';

const PushNotificationController = (props: any) => {
  const [firebaseToken, setToken] = useState<string | null>(null);

  const requestFCMPermission = async () => {
    const authResponse = await messaging().requestPermission();
    const enabled = authResponse === messaging.AuthorizationStatus.AUTHORIZED;

    if (enabled) {
      // Register the device with FCM
      await messaging().registerDeviceForRemoteMessages();
      // Get the token
      const fcmToken = await messaging().getToken();
      console.log('token', fcmToken);
      setToken(fcmToken);
    }
  };
  const onMessageHandler = async (
    remoteMessage: FirebaseMessagingTypes.RemoteMessage,
  ) => {
    const {notification, data} = remoteMessage;

    const channelId = await notifee.createChannel({
      id: 'rnpushnotifi-id',
      name: 'renpushnotifi',
    });

    notifee.displayNotification({
      title: notification?.title,
      body: notification?.body,
      data: data || {},
      android: {
        channelId,
        smallIcon: 'ic_launcher_round',
      },
    });
  };

  useEffect(() => {
    requestFCMPermission();
    const unsubMessaging = messaging().onMessage(onMessageHandler);

    return () => {
      unsubMessaging();
    };
  }, []);

  useEffect(() => {
    const unsubscribe = notifee.onForegroundEvent(({type, detail}) => {
      if (type === EventType.PRESS) {
        const {link = null} = detail.notification?.data || {};

        if (link) {
          Linking.openURL(link);
        }
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    messaging().onNotificationOpenedApp((remoteMessage: any) => {
      const {link = null} = remoteMessage.data || {};

      if (link) {
        Linking.openURL(link);
      }
    });

    // Check whether an initial notification is available
    messaging()
      .getInitialNotification()
      .then((remoteMessage: any) => {
        if (remoteMessage) {
          const {link = null} = remoteMessage.data || {};

          if (link) {
            Linking.openURL(link);
          }
        }
      });
  }, []);

  return null;
};

export default PushNotificationController;
