import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { doc, getDoc, setDoc, updateDoc, addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getBytes } from 'firebase/storage';
const env = await initializeTestEnvironment({ projectId: 'demo-srpski',
  firestore: { rules: readFileSync('../firestore.rules','utf8'), host: '127.0.0.1', port: 8080 },
  storage: { rules: readFileSync('../storage.rules','utf8'), host: '127.0.0.1', port: 9199 } });
let fails = 0;
const t = async (name, p) => { try { await p; console.log('PASS', name); } catch (e) { fails++; console.log('FAIL', name, e.message); } };
await env.withSecurityRulesDisabled(async (c) => {
  const db = c.firestore();
  await setDoc(doc(db,'users','alice'), { ime:'Alice', email:'a@x.rs', role:'korisnik', emailVerified:true });
  await setDoc(doc(db,'users','bob'), { ime:'Bob', email:'b@x.rs', role:'korisnik', emailVerified:true });
  await setDoc(doc(db,'transactions','tx1'), { userId:'alice', user_id:'alice', courseId:'cheap', course_id:'cheap', amount:1000, status:'pending' });
  await setDoc(doc(db,'transactions','tx2'), { userId:'bob', courseId:'c', amount:1000, status:'pending' });
  await uploadBytes(ref(c.storage(), 'course-materials/c/l/f.pdf'), new Uint8Array([1]));
  await setDoc(doc(db,'online_sessions','s1'), { groupId:'g1', meetLink:'https://meet.google.com/x', status:'scheduled' });
  await setDoc(doc(db,'online_groups','g1'), { name:'G' });
});
const alice = env.authenticatedContext('alice', { email_verified: true });
const admin = env.authenticatedContext('adm', { role: 'admin' });
const anon = env.unauthenticatedContext();
const adb = alice.firestore();
// B-02
await t('user cannot set own role admin', assertFails(updateDoc(doc(adb,'users','alice'), { role:'admin' })));
await t('user can edit own profile field', assertSucceeds(updateDoc(doc(adb,'users','alice'), { razred: 8 })));
await t('user with firestore role admin is NOT admin', assertFails(getDoc(doc(env.authenticatedContext('bob').firestore(),'users','alice'))));
await t('register: cannot create with role admin', assertFails(setDoc(doc(env.authenticatedContext('carl').firestore(),'users','carl'), { ime:'C', role:'admin', emailVerified:false })));
await t('register: normal create ok', assertSucceeds(setDoc(doc(env.authenticatedContext('dan').firestore(),'users','dan'), { ime:'D', email:'d@x.rs', telefon:'1', role:'korisnik', registrovan_at:'x', emailVerified:false })));
await t('user cannot set emailVerified', assertFails(updateDoc(doc(env.authenticatedContext('dan').firestore(),'users','dan'), { emailVerified:true, ime:'A' })));
await t('user cannot grant self course', assertFails(setDoc(doc(adb,'user_courses','alice'), { courses:{ c:{active:true} } })));
// B-03
await t('user cannot read other user', assertFails(getDoc(doc(adb,'users','bob'))));
await t('user cannot list users', assertFails(getDocs(collection(adb,'users'))));
await t('user reads own doc', assertSucceeds(getDoc(doc(adb,'users','alice'))));
await t('admin lists users', assertSucceeds(getDocs(query(collection(admin.firestore(),'users'), where('role','==','korisnik')))));
// B-07
await t('user cannot create transaction', assertFails(addDoc(collection(adb,'transactions'), { userId:'alice', courseId:'exp', amount:1, status:'pending' })));
await t('user cannot switch course on tx', assertFails(updateDoc(doc(adb,'transactions','tx1'), { course_id:'expensive' })));
await t('user cannot change amount', assertFails(updateDoc(doc(adb,'transactions','tx1'), { amount:1 })));
await t('user cannot confirm own tx', assertFails(updateDoc(doc(adb,'transactions','tx1'), { status:'confirmed' })));
await t('user can attach confirmation', assertSucceeds(updateDoc(doc(adb,'transactions','tx1'), { confirmationUrl:'u', confirmationUploadedAt:'t', status:'pending' })));
await t('user queries own tx', assertSucceeds(getDocs(query(collection(adb,'transactions'), where('userId','==','alice')))));
await t('user cannot read others tx', assertFails(getDoc(doc(adb,'transactions','tx2'))));
await t('admin updates tx', assertSucceeds(updateDoc(doc(admin.firestore(),'transactions','tx2'), { status:'confirmed' })));
// Storage
await t('owner uploads confirmation', assertSucceeds(uploadBytes(ref(alice.storage(),'payment-confirmations/tx1'), new Uint8Array([1]), { contentType:'image/png' })));
await t('other user cannot upload to tx1', assertFails(uploadBytes(ref(env.authenticatedContext('bob').storage(),'payment-confirmations/tx1'), new Uint8Array([1]), { contentType:'image/png' })));
await t('other user cannot read confirmation', assertFails(getBytes(ref(env.authenticatedContext('bob').storage(),'payment-confirmations/tx1'))));
await t('non-image rejected', assertFails(uploadBytes(ref(alice.storage(),'payment-confirmations/tx1'), new Uint8Array([1]), { contentType:'text/html' })));
await t('user cannot read material directly', assertFails(getBytes(ref(alice.storage(),'course-materials/c/l/f.pdf'))));
await t('anon cannot read material', assertFails(getBytes(ref(anon.storage(),'course-materials/c/l/f.pdf'))));
await t('user cannot read session meet link', assertFails(getDoc(doc(adb,'online_sessions','s1'))));
await t('user cannot list sessions', assertFails(getDocs(collection(adb,'online_sessions'))));
await t('user cannot read group', assertFails(getDoc(doc(adb,'online_groups','g1'))));
await t('admin reads sessions', assertSucceeds(getDocs(collection(admin.firestore(),'online_sessions'))));
await t('user cannot create own enrollment', assertFails(addDoc(collection(adb,'online_enrollments'), { userId:'alice', status:'active', remainingClasses:999 })));
await t('register with consent fields ok', assertSucceeds(setDoc(doc(env.authenticatedContext('eve').firestore(),'users','eve'), { ime:'E', email:'e@x.rs', role:'korisnik', emailVerified:false, termsAndParentalConsent:true, consentAt:'x' })));
await env.cleanup();
console.log(fails ? `${fails} FAILED` : 'ALL PASSED');
process.exit(fails ? 1 : 0);
