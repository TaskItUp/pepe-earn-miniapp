# Firebase Admin Guide - Pepe Earn Bot

## How to View User Statistics in Firebase Console

### 1. Access Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `peperewardbot`
3. Click on "Firestore Database" in the left sidebar

### 2. View User Data
1. In Firestore Database, you'll see collections:
   - **users** - All user profiles and stats
   - **withdrawals** - Withdrawal requests
   - **transactions** - Transaction history
   - **referrals** - Referral tracking

### 3. User Collection Structure
Click on the "users" collection to see all users. Each user document contains:

```javascript
{
  balance: 2750,                    // Current PEPE balance
  dailyAdCount: 15,                // Ads watched today
  bonusCompleted: true,            // Channel bonus claimed
  referralCode: "REFuser12_3456",  // User's referral code
  referredBy: "other_user_id",     // Who referred this user
  joinDate: "2025-08-10T17:00:00Z", // When user joined
  lastDailyReset: "2025-08-10T00:00:00Z", // Last daily reset
  stats: {
    totalEarned: 2750,             // Total PEPE earned
    totalAdsWatched: 35,           // Total ads watched
    totalReferrals: 3,             // Number of people referred
    referralEarnings: 450          // PEPE earned from referrals
  }
}
```

### 4. Viewing Specific User Stats
**To find a user:**
1. Click on any user document ID to view their data
2. Look for their Telegram ID (usually starts with numbers)
3. Check their `first_name` and `username` fields

**Key metrics to monitor:**
- `balance` - Current PEPE tokens
- `stats.totalEarned` - Lifetime earnings
- `stats.totalReferrals` - Referral count
- `dailyAdCount` - Daily activity
- `bonusCompleted` - Channel bonus status

### 5. Withdrawal Management
**To manage withdrawal requests:**
1. Click on "withdrawals" collection
2. Each withdrawal shows:
   ```javascript
   {
     userId: "user_telegram_id",
     amount: 10000,
     method: "binance",
     binanceEmail: "user@email.com",
     status: "pending",           // Change to "completed"
     createdAt: "2025-08-10T17:00:00Z",
     userName: "User Name"
   }
   ```

**To approve a withdrawal:**
1. Click on the withdrawal document
2. Change `status` from "pending" to "completed"
3. Click "Update" - user will see status change instantly

### 6. Query Users with Filters
**Find users by criteria:**
1. Click "Start collection" for users
2. Use "Add filter" to find:
   - Users with balance > 10000
   - Users who completed bonus task
   - Most active referrers
   - Recent joiners

**Example filters:**
- Field: `balance`, Operator: `>`, Value: `10000`
- Field: `stats.totalReferrals`, Operator: `>`, Value: `0`
- Field: `bonusCompleted`, Operator: `==`, Value: `true`

### 7. Export Data
**To export user statistics:**
1. Use Firebase Admin SDK (for developers)
2. Or manually copy data from console
3. For bulk operations, use Firebase CLI

### 8. Real-time Monitoring
**Track live activity:**
- Watch the users collection for real-time updates
- Monitor withdrawal requests as they come in
- See balance changes and referral activity live

### 9. Analytics Queries
**Useful statistics to track:**
- Total active users: Count of user documents
- Total PEPE distributed: Sum of all `stats.totalEarned`
- Most successful referrers: Sort by `stats.totalReferrals`
- Pending withdrawals: Filter `status == "pending"`

### 10. Security Notes
- Only admins should have access to Firebase console
- Never share Firebase configuration publicly
- Monitor for unusual activity patterns
- Set up billing alerts for Firebase usage

### Common Tasks:

**Daily Admin Tasks:**
1. Check pending withdrawals
2. Review new user registrations
3. Monitor total PEPE distribution
4. Check for any error patterns

**Weekly Admin Tasks:**
1. Analyze referral performance
2. Review top earning users
3. Check withdrawal patterns
4. Update bonus task rewards if needed

**To find specific user data:**
1. Go to Firestore > users collection
2. Use the user's Telegram ID as the document ID
3. All their stats, balance, and activity history will be displayed

This gives you complete visibility into your Pepe Earn bot's performance and user activity!