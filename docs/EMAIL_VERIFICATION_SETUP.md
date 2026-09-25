# Email Verification System - Setup & Testing Guide

## Overview

Custom email verification system has been implemented with the following flow:

1. User registers → Account created
2. Custom verification email sent with unique token
3. User clicks link in email → Redirected to `/verify?token=XXX`
4. Backend validates token and marks email as verified
5. User can now access courses

---

## Files Created/Modified

### Backend Files

#### New Files:
- `backend/functions/src/emailVerification.js` - Email verification Cloud Functions
  - `sendVerificationEmailFunction` - Sends verification email with token
  - `verifyEmailToken` - Validates token and marks email as verified
  - `resendVerificationEmail` - Resends verification email

#### Modified Files:
- `backend/functions/src/sendEmail.js`
  - Added `emailVerification` template
  - Added `sendVerificationEmail()` helper function

- `backend/functions/src/index.js`
  - Exported new email verification functions

- `backend/firestore.rules`
  - Added rules for `email_verifications` collection (backend-only)
  - Added rules for `rate_limits` collection (backend-only)
  - Existing `user_courses` rule already requires email verification ✅

- `backend/functions/src/confirmPayment.js`
  - Fixed duplicate `userCoursesRef` declaration bug

### Frontend Files

#### New Files:
- `frontend/src/pages/VerifyEmailPage.jsx` - Email verification page
  - Handles token validation
  - Shows success/error messages
  - Automatic redirect after verification
  - Resend email option

#### Modified Files:
- `frontend/src/App.jsx`
  - Added `/verify` route

- `frontend/src/services/auth.service.js`
  - Replaced Firebase default `sendEmailVerification()` with custom implementation
  - Calls `sendVerificationEmailFunction` Cloud Function

- `frontend/src/pages/RegisterPage.jsx`
  - Updated success message to inform user about verification email
  - Redirects to `/login` after 5 seconds (changed from `/dashboard`)

- `frontend/src/pages/DashboardPage.jsx`
  - Added email verification banner for unverified users
  - "Resend Email" button functionality
  - Dismissible banner

---

## Environment Variables

### Backend (Firebase Functions)

You need to set the `FRONTEND_URL` parameter for the verification link to work correctly:

```bash
cd backend/functions

# For production
firebase functions:config:set frontend.url="https://srpskiusrcu.com"

# For development
firebase functions:config:set frontend.url="http://localhost:5173"

# Deploy after setting config
npm run deploy
```

**Important**: The Cloud Function uses `process.env.FRONTEND_URL` which defaults to `http://localhost:5173` if not set.

---

## Deployment Steps

### 1. Deploy Backend Functions

```bash
cd backend/functions
npm run deploy
```

This will deploy:
- ✅ `sendVerificationEmailFunction`
- ✅ `verifyEmailToken`
- ✅ `resendVerificationEmail`

### 2. Deploy Firestore Rules

```bash
cd backend
firebase deploy --only firestore:rules
```

### 3. Build and Deploy Frontend

```bash
cd frontend
npm run build
firebase deploy --only hosting
```

---

## Testing the Email Verification Flow

### Test 1: New User Registration

1. Go to `/register`
2. Fill in registration form
3. Click "Register"
4. **Expected Result**:
   - Success message: "Регистрација успешна! Послали смо вам email..."
   - Welcome email received (from existing flow)
   - **NEW**: Verification email received with clickable link
   - Redirected to `/login` after 5 seconds

5. Check email inbox for verification email:
   - Subject: "✉️ Verifikujte vaš email - Srpski u Srcu"
   - Contains green "✅ Verifikuj email" button
   - Link format: `https://srpskiusrcu.com/verify?token=XXXXX`

### Test 2: Email Verification

1. Click the verification link in email
2. **Expected Result**:
   - Redirected to `/verify?token=XXXXX`
   - Shows "Verifikacija u toku..." with spinner
   - Shows "✅ Email Verifikovan!" success message
   - Countdown from 5 seconds
   - Automatic redirect to `/dashboard`

3. In Firestore:
   - `users/{userId}` → `emailVerified: true`
   - `email_verifications/{token}` → `verified: true`

4. In Firebase Auth:
   - User's `emailVerified` field is `true`

### Test 3: Dashboard Access Without Verification

1. Register a new user but **don't click verification link**
2. Try to access `/dashboard`
3. **Expected Result**:
   - Orange banner at top: "Верификујте ваш email да бисте приступили курсевима"
   - "Пошаљи поново" button visible
   - Cannot access courses (Firestore rules block access)

### Test 4: Resend Verification Email

1. On Dashboard (unverified user), click "Пошаљи поново"
2. **Expected Result**:
   - Button shows "Шаље се..."
   - New verification email sent
   - Button shows "Послато ✓"
   - Message changes to "✅ Нови email је послат!"
   - Old tokens are deleted, new token created

### Test 5: Expired Token

1. Wait 61 minutes after registration (token expires in 60 minutes)
2. Click old verification link
3. **Expected Result**:
   - Error message: "Token je istekao. Molimo zatražite novi email."
   - "Pošalji novi email" button visible
   - "Nazad na Prijavu" button visible

### Test 6: Already Verified

1. Verify email successfully
2. Try to click verification link again
3. **Expected Result**:
   - Error message: "Ovaj token je već iskorišćen. Vaš email je već verifikovan."
   - Automatic redirect to `/dashboard` after 3 seconds

### Test 7: Invalid Token

1. Try to access `/verify?token=INVALID_TOKEN`
2. **Expected Result**:
   - Error message: "Nevažeći ili istekao token."
   - "Pošalji novi email" button
   - "Nazad na Prijavu" button

---

## Database Collections

### email_verifications

Structure:
```javascript
{
  userId: "user123",
  email: "user@example.com",
  createdAt: Timestamp,
  expiresAt: Timestamp, // 60 minutes from creation
  verified: false
}
```

Document ID: The token itself (hex string, 64 characters)

**Security**:
- `allow read: if false` (backend-only)
- `allow write: if false` (backend-only)

### users

Added field:
```javascript
{
  // ... existing fields
  emailVerified: false, // Updated to true after verification
  verifiedAt: Timestamp // Added when email is verified
}
```

---

## Email Template

The verification email includes:

- Professional design matching platform branding
- Clear call-to-action button
- Warning about 60-minute expiration
- Plain-text link fallback
- Security notice
- Contact information

Preview: See `backend/functions/src/sendEmail.js` line 378

---

## Security Features

1. **Token Expiration**: Tokens expire after 60 minutes
2. **One-Time Use**: Token marked as `verified: true` after use
3. **Firestore Rules**: Backend-only access to verification tokens
4. **Rate Limiting**: Already implemented for other endpoints
5. **Auth Update**: Firebase Auth `emailVerified` updated via Admin SDK
6. **Course Access**: Firestore rules check `request.auth.token.email_verified`

---

## Troubleshooting

### Email Not Received

1. Check spam/junk folder
2. Verify Gmail credentials in Firebase Functions config:
   ```bash
   firebase functions:config:get
   ```
3. Check Cloud Functions logs:
   ```bash
   firebase functions:log
   ```

### Verification Link Broken

1. Check if `FRONTEND_URL` is set correctly:
   ```bash
   firebase functions:config:get frontend.url
   ```
2. Ensure Cloud Functions are deployed
3. Check browser console for errors

### "Permission Denied" on Course Access

1. Verify user's email is verified in Firebase Auth Console
2. Check Firestore `users/{userId}` → `emailVerified: true`
3. Force token refresh:
   ```javascript
   await user.getIdToken(true);
   ```

### Cloud Function Errors

Check logs:
```bash
firebase functions:log --only sendVerificationEmailFunction,verifyEmailToken
```

Common issues:
- Gmail credentials not set
- FRONTEND_URL not configured
- Firestore permissions

---

## Monitoring & Analytics

Track these metrics in Cloud Functions logs:

- Email verification emails sent
- Successful verifications
- Failed verifications (expired, invalid)
- Resend requests

Example log search:
```bash
firebase functions:log | grep "Verification email sent"
firebase functions:log | grep "Email verified for user"
```

---

## Future Enhancements

Potential improvements:

1. **Custom Email Domain**: Use `noreply@srpskiusrcu.com` instead of Gmail
2. **SMS Verification**: Add phone number verification option
3. **Magic Links**: Passwordless login via email
4. **Verification Reminders**: Automated email after 24h if not verified
5. **Analytics Dashboard**: Track verification rates

---

## Support

If you encounter issues:

1. Check this guide first
2. Review Cloud Functions logs
3. Check Firestore security rules
4. Verify email service configuration

Contact: kontakt@srpskiusrcu.com

---

**✅ Email Verification System is Complete and Ready for Testing!**
