import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import { onUserRegistrationSendEmailHandler } from './on-user-registration-send-email';

const serviceAccount = require('../wellio-dev-zenpylon-firebase-admin-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://wellio-dev-zenpylon.firebaseio.com'
});

export const onUserRegistrationSendEmail = functions.firestore
  .document('users/{userId}')
  .onCreate(onUserRegistrationSendEmailHandler);
