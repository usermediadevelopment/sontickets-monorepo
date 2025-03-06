/* eslint-disable */
import * as functions from 'firebase-functions';

import { EmailHelper } from './helper/emailt';

import { endOfDay, startOfDay, subDays } from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import { logger } from 'firebase-functions';

import { onRequest } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2/options';
import { Timestamp, getFirestore } from 'firebase-admin/firestore';
import { initializeApp } from 'firebase-admin/app';
import { TCompany } from './types/Company';

setGlobalOptions({ maxInstances: 10, timeoutSeconds: 3600 });
initializeApp();

exports.updateReservation = functions.firestore
  .document('/reservations/{documentId}')
  .onUpdate(async (snap) => {
    const emailHelper = new EmailHelper();
    const reservationBeforeData = snap.before.data();
    const reservationAfterData = snap.after.data();

    const { lang, emailsTo, forms, locationData, companyDoc } =
      await _getDataForComposeEmail(reservationAfterData);

    if (
      reservationAfterData?.status === 'confirmed' ||
      reservationAfterData?.status === 'checkin' ||
      reservationAfterData?.status === 'checkout'
    ) {
      return true;
    }

    if (!reservationBeforeData?.code && reservationAfterData?.code) {
      const form = forms.docs[0].data();
      const newReservationEmail = form.emails.new_reservation;
      let clientHtmlEmail = newReservationEmail.client.html?.[lang];
      let adminHtmlEmail = newReservationEmail.admin.html?.[lang];

      clientHtmlEmail = findReplaceString(clientHtmlEmail, 'location', locationData.name);
      adminHtmlEmail = findReplaceString(adminHtmlEmail, 'location', locationData.name);

      Object.keys(reservationAfterData).forEach((key) => {
        clientHtmlEmail = findReplaceString(
          clientHtmlEmail,
          key,
          reservationAfterData[key],
        );
        adminHtmlEmail = findReplaceString(
          adminHtmlEmail,
          key,
          reservationAfterData[key],
        );
      });

      emailHelper.sendEmail({
        email: reservationAfterData.email,
        subject:
          lang == 'es' || !lang
            ? 'Su reserva en ' + companyDoc.data().name + ' ha sido confirmada'
            : 'Your reservation at ' + companyDoc.data().name + ' has been confirmed',
        template: clientHtmlEmail,
      });

      emailHelper.sendEmail({
        email: emailsTo,
        subject: 'Nueva reserva en ' + companyDoc.data().name,
        template: adminHtmlEmail,
      });

      return true;
    }

    if (reservationAfterData?.status === 'cancelled') {
      const form = forms.docs[0].data();
      const cancellationEmail = form.emails.cancellation;
      let clientHtmlEmail = cancellationEmail.client.html?.[lang];
      let adminHtmlEmail = cancellationEmail.admin.html?.[lang];

      clientHtmlEmail = findReplaceString(clientHtmlEmail, 'location', locationData.name);
      adminHtmlEmail = findReplaceString(adminHtmlEmail, 'location', locationData.name);
      Object.keys(reservationAfterData).forEach((key) => {
        clientHtmlEmail = findReplaceString(
          clientHtmlEmail,
          key,
          reservationAfterData[key],
        );
        adminHtmlEmail = findReplaceString(
          adminHtmlEmail,
          key,
          reservationAfterData[key],
        );
      });

      emailHelper.sendEmail({
        email: reservationAfterData.email,
        subject:
          lang == 'es' || !lang
            ? 'Su reserva en ' + companyDoc.data().name + ' ha sido cancelada'
            : 'Your reservation in ' + companyDoc.data().name + ' has been cancelled.',
        template: clientHtmlEmail,
      });

      emailHelper.sendEmail({
        email: emailsTo,
        subject: 'Reserva cancelada ' + companyDoc.data().name,
        template: adminHtmlEmail,
      });
      return;
    }

    const form = forms.docs[0].data();
    const newReservationEmail = form.emails.update_reservation;
    let clientHtmlEmail = newReservationEmail.client.html?.[lang];
    let adminHtmlEmail = newReservationEmail.admin.html?.[lang];

    const locationName =
      reservationAfterData.location?.name == reservationBeforeData.location?.name
        ? reservationAfterData.location?.name
        : reservationBeforeData.location?.name +
          ' -> ' +
          reservationAfterData.location?.name;
    clientHtmlEmail = findReplaceString(clientHtmlEmail, 'location', locationName);
    adminHtmlEmail = findReplaceString(adminHtmlEmail, 'location', locationName);

    Object.keys(reservationAfterData).forEach((key) => {
      const value =
        reservationAfterData[key] == reservationBeforeData[key]
          ? reservationAfterData[key]
          : `${reservationBeforeData[key]} -> ${reservationAfterData[key]}`;

      clientHtmlEmail = findReplaceString(clientHtmlEmail, key, value);
      adminHtmlEmail = findReplaceString(adminHtmlEmail, key, value);
    });

    emailHelper.sendEmail({
      email: reservationAfterData.email,
      subject:
        lang == 'es' || !lang
          ? 'Su reserva en ' + companyDoc.data().name + ' ha sido actualizada'
          : 'Your reservation at ' + companyDoc.data().name + ' has been updated',
      template: clientHtmlEmail,
    });

    emailHelper.sendEmail({
      email: emailsTo,
      subject: 'Reserva actualiza en ' + companyDoc.data().name,
      template: adminHtmlEmail,
    });

    return snap.after.ref.set({ emailSent: true }, { merge: true });
  });

const _getDataForComposeEmail = async (reservation: any) => {
  const db = getFirestore();
  const lang = reservation.lang;
  const locationData = reservation.location;

  const companyRef = locationData.company;
  const companyDoc = await companyRef.get();
  const company = companyDoc.data();
  const companyId = companyDoc.id;

  const emailsTo = company?.settings?.emailsTo ?? [];

  const forms = await db.collection('forms').where('company', '==', companyId).get();

  return {
    lang,
    emailsTo,
    forms,
    locationData,
    companyDoc,
  };
};

const findReplaceString = (string: string, find: string, replace: string) => {
  if (/[a-zA-Z\_]+/g.test(string)) {
    return string.replace(
      new RegExp('{{(?:\\s+)?(' + find + ')(?:\\s+)?}}', 'g'),
      replace,
    );
  } else {
    throw new Error('Find statement does not match regular expression: /[a-zA-Z_]+/');
  }
};

export const sendemailafterreservation = onRequest(async (req, res) => {
  try {
    const timeZone = 'America/Bogota';
    var today = zonedTimeToUtc(new Date(), timeZone);
    today = utcToZonedTime(today, timeZone);
    const emailHelper = new EmailHelper();

    var oneDayBeforeDate = subDays(today, 1);
    const startDay = startOfDay(oneDayBeforeDate);
    const endDay = endOfDay(oneDayBeforeDate);
    const db = getFirestore();

    const companiesSnapshot = await db.collection('companies').get();
    const companies = companiesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as TCompany[];
    for await (const company of companies) {
      if (!company?.settings?.reservationUpdates?.thanksForVisitUs) continue;
      const thanksForVisitUs = company?.settings?.reservationUpdates?.thanksForVisitUs;

      const { html } = thanksForVisitUs;
      if (!html) continue;

      logger.info('company', company.id);
      logger.info('start', Timestamp.fromDate(startDay).toMillis());

      const reservationsSnapshot = await db
        .collection('reservations')
        .where('startDatetime', '>', Timestamp.fromDate(startDay))
        .where('startDatetime', '<', Timestamp.fromDate(endDay))
        .where('location.company', '==', db.collection('companies').doc(company.id))
        .get();

      if (reservationsSnapshot.empty) continue;

      const reservations: any[] = reservationsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      for (const reservation of reservations) {
        logger.info('reservation', reservation);
        if (reservation.status == 'cancelled' || reservation.status == 'pending')
          continue;
        const email = reservation.email;
        const lang = reservation.lang;
        let clientHtmlEmail: string = html[lang as keyof typeof html];
        Object.keys(reservation).forEach((key) => {
          clientHtmlEmail = findReplaceString(clientHtmlEmail, key, reservation[key]);
        });

        await emailHelper.sendEmail({
          email,
          subject:
            lang == 'es' || !lang ? 'Gracias por visitarnos' : 'Thanks for visit us',
          template: clientHtmlEmail,
        });
      }
    }

    res.json({ message: 'ok' });
  } catch (error) {
    logger.error(error);
    res.json({ message: 'failure', error });
  }
});
