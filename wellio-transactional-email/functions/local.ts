import { onUserRegistrationSendEmailHandler } from './src/on-user-registration-send-email';
// import * as admin from 'firebase-admin';

const snapshot = {
  data: function() {
    return { firstName: 'Andrew', emailAddress: 'ajdecker1022@gmail.com' };
  }
};
const context = { params: { userId: 'userId126' } };

onUserRegistrationSendEmailHandler(
  (snapshot as unknown) as any,
  (context as unknown) as any
);
