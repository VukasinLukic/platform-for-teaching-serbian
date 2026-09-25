/**
 * Online classes - group and schedule data for enrolled students.
 * online_groups and online_sessions (including Meet links) are admin-only in
 * Firestore rules; students get their own group's data only through this function.
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// Callable responses cannot carry Firestore Timestamps; send ISO strings instead
const serialize = (data) => {
  const out = {};
  for (const [key, value] of Object.entries(data || {})) {
    if (value instanceof Timestamp) {
      out[key] = value.toDate().toISOString();
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      out[key] = serialize(value);
    } else {
      out[key] = value;
    }
  }
  return out;
};

const PUBLIC_GROUP_FIELDS = ['name', 'teacherName', 'schedule'];

export const getMyOnlineGroup = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Morate biti prijavljeni');
  }

  try {
    const db = getFirestore();

    const enrollments = await db.collection('online_enrollments')
      .where('userId', '==', request.auth.uid)
      .where('status', '==', 'active')
      .limit(1)
      .get();

    if (enrollments.empty) {
      return { group: null, nextSession: null };
    }

    const enrollment = enrollments.docs[0].data();
    if (!enrollment.groupId) {
      return { group: null, nextSession: null };
    }

    const groupDoc = await db.collection('online_groups').doc(enrollment.groupId).get();
    let group = null;
    if (groupDoc.exists) {
      const data = groupDoc.data();
      group = {};
      for (const field of PUBLIC_GROUP_FIELDS) {
        if (data[field] !== undefined) group[field] = data[field];
      }
      group = serialize(group);
    }

    const sessions = await db.collection('online_sessions')
      .where('groupId', '==', enrollment.groupId)
      .where('status', '==', 'scheduled')
      .where('scheduledDate', '>', Timestamp.now())
      .orderBy('scheduledDate', 'asc')
      .limit(1)
      .get();

    let nextSession = null;
    if (!sessions.empty) {
      const s = sessions.docs[0];
      const data = s.data();
      nextSession = serialize({
        id: s.id,
        notes: data.notes || null,
        scheduledDate: data.scheduledDate,
        scheduledTime: data.scheduledTime || null,
        meetLink: data.meetLink || null,
      });
    }

    return { group, nextSession };
  } catch (error) {
    console.error('Error loading online group:', error.message);
    throw new HttpsError('internal', 'Greška pri učitavanju časova');
  }
});
