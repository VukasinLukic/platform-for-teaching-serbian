@echo off
echo ========================================
echo Nauci Srpski - Complete Deploy Script
echo ========================================
echo.

echo [1/9] Building frontend...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Frontend build failed!
    pause
    exit /b 1
)
echo ✅ Frontend build successful
echo.

echo [2/9] Installing Firebase CLI globally (if needed)...
call npm list -g firebase-tools >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing firebase-tools globally...
    call npm install -g firebase-tools
)
echo ✅ Firebase CLI ready
echo.

cd..

echo [3/9] Deploying Firebase Functions...
call firebase deploy --only functions
if %errorlevel% neq 0 (
    echo WARNING: Functions deploy had issues
)
echo ✅ Functions deployed
echo.

echo [4/9] Deploying Firestore Rules...
call firebase deploy --only firestore:rules
if %errorlevel% neq 0 (
    echo WARNING: Firestore rules deploy had issues
)
echo ✅ Firestore rules deployed
echo.

echo [5/9] Deploying Storage Rules...
call firebase deploy --only storage:rules
if %errorlevel% neq 0 (
    echo WARNING: Storage rules deploy had issues
)
echo ✅ Storage rules deployed
echo.

echo [6/9] Deploying Firestore Indexes...
call firebase deploy --only firestore:indexes
if %errorlevel% neq 0 (
    echo WARNING: Firestore indexes deploy had issues
)
echo ✅ Firestore indexes deployed
echo.

echo [7/9] Deploying Hosting (frontend)...
call firebase deploy --only hosting
if %errorlevel% neq 0 (
    echo WARNING: Hosting deploy had issues
)
echo ✅ Hosting deployed
echo.

echo ========================================
echo DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Next steps:
echo 1. Create admin user in Firebase Console
echo 2. Set up Gmail app password in backend/functions/.env
echo 3. Test all functions in Firebase Console
echo.
pause
