/**
 * Authentication Service
 * Handles user registration, login, logout
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { auth, db, functions } from './firebase';

/**
 * Register a new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} ime - Full name
 * @param {string} telefon - Phone number
 * @returns {Promise<User>}
 */
export const registerUser = async (email, password, ime, telefon) => {
  try {
    // Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update display name
    await updateProfile(user, { displayName: ime });

    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      ime,
      email,
      telefon,
      role: 'korisnik', // default role
      registrovan_at: new Date().toISOString(),
      emailVerified: false, // Track verification status
    });

    // ✅ Send custom verification email with token
    try {
      const sendVerificationEmail = httpsCallable(functions, 'sendVerificationEmailFunction');
      await sendVerificationEmail();
      console.log('✅ Verification email sent successfully');
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      // Don't throw - registration was successful, email sending is secondary
    }

    return user;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

/**
 * Login user
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Logout current user
 * @returns {Promise<void>}
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

/**
 * Send password reset email
 * @param {string} email
 * @returns {Promise<void>}
 */
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
};

/**
 * Get user profile from Firestore
 * @param {string} userId
 * @returns {Promise<Object|null>}
 */
export const getUserProfile = async (userId) => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error('Get user profile error:', error);
    throw error;
  }
};

/**
 * Get user role from custom claims (FAST - no Firestore read!)
 * @param {User} user - Firebase Auth user
 * @param {boolean} forceRefresh - Force token refresh
 * @returns {Promise<string>} User role ('admin' or 'korisnik')
 */
export const getUserRole = async (user, forceRefresh = false) => {
  try {
    const idTokenResult = await user.getIdTokenResult(forceRefresh);
    return idTokenResult.claims.role || 'korisnik'; // Default to 'korisnik'
  } catch (error) {
    console.error('Get user role error:', error);
    return 'korisnik'; // Safe default
  }
};

/**
 * Check if user is admin using custom claims (FAST!)
 * @param {User} user - Firebase Auth user
 * @returns {Promise<boolean>} True if admin
 */
export const isUserAdmin = async (user) => {
  try {
    const idTokenResult = await user.getIdTokenResult();
    return idTokenResult.claims.role === 'admin';
  } catch (error) {
    console.error('Check admin error:', error);
    return false;
  }
};
