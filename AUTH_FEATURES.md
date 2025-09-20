# Authentication Features

## Overview
Complete authentication system with OTP verification for signup and password reset.

## Features Implemented

### 1. User Signup with Email Verification
- User creates account with name, email, password, and role
- OTP sent to email for verification
- Account activated only after OTP verification
- Resend OTP functionality available

### 2. Login System
- Email and password authentication
- JWT token-based session management
- Verification check before login
- Secure password handling with bcrypt

### 3. Forgot Password with OTP
- Email-based password reset request
- OTP sent to registered email
- Secure password reset with OTP verification
- New password encryption

### 4. Security Features
- Password hashing with bcrypt
- JWT tokens with expiration
- OTP expiration (10 minutes)
- Email verification requirement
- Secure password reset flow

## API Endpoints

### Authentication Routes (`/api/auth/`)
- `POST /signup` - Create new user account
- `POST /verify-otp` - Verify email with OTP
- `POST /resend-otp` - Resend verification OTP
- `POST /login` - User login
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with OTP

## Frontend Components

### Auth Component (`/src/components/Auth.tsx`)
- Unified authentication interface
- Multiple modes: login, signup, verify, forgot, reset
- Form validation and error handling
- Responsive design with Tailwind CSS

## Environment Variables Required

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
JWT_SECRET=your-jwt-secret
```

## Usage Flow

### New User Registration:
1. User fills signup form
2. OTP sent to email
3. User enters OTP to verify
4. Account activated and logged in

### Password Reset:
1. User clicks "Forgot Password"
2. Enters email address
3. OTP sent to email
4. User enters OTP and new password
5. Password updated successfully

## Testing
- Use the existing start-system.bat to run the application
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Email functionality requires valid SMTP credentials in .env file