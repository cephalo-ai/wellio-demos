import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as moment from 'moment';
import sendGridClient = require('@sendgrid/mail');

interface SendGridEmailData {
  emailAddress: string;
  firstName: string;
}

export const onUserRegistrationSendEmailHandler = async (
  snapshot: FirebaseFirestore.DocumentSnapshot,
  context: functions.EventContext
) => {
  sendGridClient.setApiKey(functions.config().send_grid.api_key);

  const emailDelayInSeconds = 30;
  const sendGridTemplateId = 'd-d166e660bbd74eb5bf96b5741bcec74c';
  const userId: string = context.params.userId;

  // Ensure the document contains an email address and first name
  const docData = snapshot.data() as any;
  const emailAddress = docData.emailAddress;
  const firstName = docData.firstName;

  if (!emailAddress || !firstName) {
    console.error(
      new Error('Missing emailAddress or firstName on user document. Aborting.')
    );
    return;
  }

  try {
    const sendGridEmailBody: SendGridEmailData = {
      firstName,
      emailAddress
    };
    await writeEmailMetaData(userId, emailAddress, emailDelayInSeconds);
    await triggerSendGridEmail(
      sendGridEmailBody,
      sendGridTemplateId,
      emailDelayInSeconds
    );
  } catch (error) {
    console.error(error);
    return;
  }
};

const writeEmailMetaData = (
  userId: string,
  emailAddress: number,
  delay: number
): Promise<string | FirebaseFirestore.Transaction> => {
  const docRef = admin
    .firestore()
    .doc(`emails/${userId}/transactional/accountCreation`);

  return admin.firestore().runTransaction(async transaction => {
    const metaData = {
      delay,
      emailAddress,
      userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    const emailDoc = await transaction.get(docRef);
    if (emailDoc.exists) {
      return Promise.reject(
        `Email document at ${docRef.path} already exists. Aborting`
      );
    }
    return transaction.create(docRef, metaData);
  });
};

const triggerSendGridEmail = (
  emailData: SendGridEmailData,
  templateId: string,
  delayInSeconds: number
): Promise<any> => {
  const mailData = {
    to: emailData.emailAddress,
    from: 'info@getwellio.com',
    send_at: moment()
      .add(delayInSeconds, 'seconds')
      .unix(),
    templateId,
    dynamic_template_data: {
      firstName: emailData.firstName
    }
  };
  return sendGridClient.send(mailData);
};
