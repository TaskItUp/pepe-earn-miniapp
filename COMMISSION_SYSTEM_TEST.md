# 10% Referral Commission System Test Guide

## Overview
The commission system automatically pays referrers 10% of everything their referrals earn from tasks (except referral bonuses and commission payments themselves).

## Commission Structure

### Activities That Pay Commission
- **Ad Watching**: 250 PEPE → 25 PEPE commission
- **Bonus Tasks**: 300 PEPE → 30 PEPE commission
- **Any Future Earning Activity**: 10% commission

### Activities That DON'T Pay Commission
- **Referral Bonus**: 300 PEPE for entering codes (no commission)
- **Commission Payments**: Avoid infinite loops

## How It Works

### 1. User Earnings Flow
```
User completes task → Earns PEPE → System checks if user was referred → Pays 10% commission to referrer
```

### 2. Firebase Updates
- **User Balance**: +full amount
- **Referrer Balance**: +10% commission
- **Referrer Stats**: +commission to referralEarnings
- **Database**: Commission transaction recorded

## Testing Steps

### Test 1: Set Up Referral Relationship
1. Create User A (referrer)
2. User A gets referral code (e.g., "ABC123")
3. Create User B (referee) 
4. User B enters User A's code
5. **Verify**: User B has `referredBy: User A's ID` in database

### Test 2: Ad Commission
1. User B watches 1 ad (earns 250 PEPE)
2. **Expected**: 
   - User B: +250 PEPE
   - User A: +25 PEPE commission
   - Console: "💰 Sending 25 PEPE commission to referrer"

### Test 3: Bonus Task Commission  
1. User B completes Telegram channel task (earns 300 PEPE)
2. **Expected**:
   - User B: +300 PEPE
   - User A: +30 PEPE commission
   - User A's stats.referralEarnings: +30

### Test 4: Multiple Activity Commission
1. User B watches 4 ads (1000 PEPE total)
2. **Expected**: User A gets 100 PEPE total commission
3. User B joins channel (300 PEPE)
4. **Expected**: User A gets additional 30 PEPE commission

### Test 5: No Commission Scenarios
1. User B enters another referral code (300 PEPE bonus)
2. **Expected**: NO commission paid to anyone
3. User A receives commission payment
4. **Expected**: NO commission paid on the commission itself

## Database Schema

### User Document
```javascript
{
  balance: 1000,
  referredBy: "referrer_user_id", // Set when user enters code
  stats: {
    totalEarned: 1000,
    referralEarnings: 100, // Only for referrers
    totalReferrals: 5
  }
}
```

### Transaction Document
```javascript
{
  userId: "referrer_id",
  amount: 25,
  type: "commission",
  timestamp: "2024-01-01T10:00:00Z",
  referralUserId: "referee_id",
  originalAmount: 250
}
```

## Console Log Examples

### Successful Commission
```
🎯 Processing referral commission for ad_reward...
Checking if user was referred...
💰 Sending 25 PEPE commission to referrer: user123
✅ Commission of 25 PEPE sent to referrer user123
```

### No Commission (Not Referred)
```
🎯 Processing referral commission for ad_reward...
Checking if user was referred...
ℹ️ User was not referred - no commission needed
```

### No Commission (Referral Bonus)
```
Adding 300 PEPE bonus reward...
// No commission processing logs should appear
```

## Success Metrics
- ✅ 10% commission paid on ad rewards (25 PEPE per 250 PEPE ad)
- ✅ 10% commission paid on bonus tasks (30 PEPE per 300 PEPE bonus)
- ✅ Commission properly tracked in referrer's stats.referralEarnings
- ✅ No commission paid on referral bonuses
- ✅ No commission paid on commission payments (no loops)
- ✅ Transaction records created for all commission payments
- ✅ Real-time balance updates for both user and referrer

## Error Handling
- Commission failures don't break main earning transactions
- Invalid referrer IDs handled gracefully
- Database errors logged but don't stop user earnings
- Zero commission amounts (< 1 PEPE) handled appropriately