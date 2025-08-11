# Manual Referral Code System Test Guide

## Overview
The manual referral code system allows users to enter 6-character referral codes directly instead of using links. Users get 300 PEPE for entering valid codes, and referrers get tracking in their statistics.

## System Features

### Code Generation
- **Format**: 6-character codes (e.g., "123ABC")
- **Structure**: 3 digits from user ID + 3 random uppercase letters
- **Uniqueness**: Each user gets one permanent code
- **Display**: Shown in user's referral modal

### Code Input System
- **Location**: Profile tab → Gift icon → "Enter Referral Code" section
- **Validation**: 
  - Cannot use own code
  - Cannot use multiple codes (one per user lifetime)
  - Must be valid existing code
- **Reward**: 300 PEPE bonus for successful application

### Database Tracking
- **User Fields Added**:
  - `username`: Telegram username for identification
  - `firstName`: Display name from Telegram
  - `referredBy`: ID of user who referred them
- **Referrer Stats**: `stats.totalReferrals` incremented

## Testing Steps

### Test 1: Display Referral Code
1. Open app and go to Profile tab
2. Click the gift icon to open referral modal
3. **Verify**: Your referral code is displayed in "Your Code" section
4. **Verify**: Code is 6 characters (3 digits + 3 letters)
5. **Verify**: Copy button works for the code

### Test 2: Enter Valid Referral Code
1. Get a friend's referral code (or create test user)
2. In referral modal, enter code in "Enter Referral Code" section
3. Click "Apply" button
4. **Expected Result**: 
   - Success message appears
   - 300 PEPE added to balance
   - Input field becomes disabled
   - Button shows "Applied"

### Test 3: Prevent Self-Referral
1. Try entering your own referral code
2. **Expected Result**: Error message "You cannot use your own referral code"

### Test 4: Prevent Multiple Uses
1. After successfully using one code, try entering another
2. **Expected Result**: Input field disabled with "Already used referral code"

### Test 5: Invalid Code Handling
1. Enter non-existent code (e.g., "INVALID")
2. **Expected Result**: "Invalid referral code" error message

### Test 6: Database Verification
Check Firebase Console for:
- New user has `referredBy` field set
- Referrer's `stats.totalReferrals` increased by 1
- User's balance increased by 300
- Transaction recorded with type 'referral_bonus'

## Technical Implementation

### Key Functions
- `generateReferralCode(userId)`: Creates short 6-char code
- `applyReferralCode()`: Handles manual code input
- `checkReferralStatus()`: Prevents multiple uses
- `copyReferralCode()`: Copies user's code to clipboard

### Error Handling
- Empty code validation
- Self-referral prevention
- Multiple use prevention
- Invalid code detection
- Network error handling

### UI Elements
- Code display with copy button
- Input field with uppercase transformation
- Apply button with loading states
- Status messages (success/error/loading)
- Disabled states for used codes

## Success Metrics
- ✅ Users can see their own referral code
- ✅ Users can copy their code easily
- ✅ Manual code entry works reliably
- ✅ 300 PEPE bonus applied correctly
- ✅ Referrer statistics updated
- ✅ Prevents abuse (self-referral, multiple uses)
- ✅ Clear error messages for all edge cases
- ✅ Username tracking in database

## Migration Notes
- Existing link-based referrals still work
- New users get username tracking
- Short codes are more user-friendly
- Manual input reduces technical barriers
- Better reliability than URL-based system