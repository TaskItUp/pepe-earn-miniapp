// Telegram WebApp initialization
const tg = window.Telegram.WebApp;
let currentUser = null;
let userBalance = 0;
let dailyAdCount = 0;
let userStats = {};
let referralCode = '';

// Initialize the app
document.addEventListener('DOMContentLoaded', async function() {
    console.log('App initializing...');
    
    // Initialize Telegram WebApp
    tg.ready();
    tg.expand();
    
    // Set theme
    document.body.style.backgroundColor = tg.backgroundColor;
    
    // Initialize user data
    await initializeUser();
    
    // Setup event listeners
    setupEventListeners();
    
    // Hide loading screen
    document.getElementById('loading-screen').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';
    
    // Check for referral parameter
    await checkReferralCode();
    
    // Check home referral status
    await checkHomeReferralStatus();
    
    // Start daily reset timer
    startDailyResetTimer();
    
    console.log('App initialized successfully');
});

// Initialize user data
async function initializeUser() {
    try {
        currentUser = tg.initDataUnsafe?.user;
        
        if (!currentUser) {
            // Fallback for testing
            currentUser = {
                id: 'test_user_' + Date.now(),
                first_name: 'Test User',
                username: 'testuser'
            };
        }
        
        console.log('Current user:', currentUser);
        
        // Generate referral code
        referralCode = generateReferralCode(currentUser.id);
        
        // Initialize or load user data from Firebase
        await loadUserData();
        
        // Update UI with user data
        updateUserInterface();
        
    } catch (error) {
        console.error('Error initializing user:', error);
        showError('Failed to initialize user data');
    }
}

// Load user data from Firebase
async function loadUserData() {
    try {
        console.log('Loading user data from Firebase...');
        const userDocRef = window.firebase.doc(window.firebase.db, 'users', currentUser.id.toString());
        const userDoc = await window.firebase.getDoc(userDocRef);
        
        if (userDoc.exists()) {
            console.log('User data found in Firebase');
            const userData = userDoc.data();
            userBalance = userData.balance || 0;
            dailyAdCount = userData.dailyAdCount || 0;
            userStats = userData.stats || {
                totalEarned: 0,
                totalAdsWatched: 0,
                totalReferrals: 0,
                referralEarnings: 0
            };
            
            // Update username if it has changed
            if (currentUser.username && userData.username !== currentUser.username) {
                await updateUserData({ username: currentUser.username });
            }
            
            // Check bonus completion status
            if (userData.bonusCompleted) {
                document.querySelector('.bonus-task-card').style.display = 'none';
                document.getElementById('bonus-completed').style.display = 'flex';
            }
            
            // Check if daily reset is needed
            const lastReset = userData.lastDailyReset?.toDate();
            const now = new Date();
            if (!lastReset || !isSameDay(lastReset, now)) {
                dailyAdCount = 0;
                await updateUserData({ 
                    dailyAdCount: 0, 
                    lastDailyReset: now 
                });
            }
        } else {
            // Create new user document
            const initialData = {
                balance: 0,
                dailyAdCount: 0,
                bonusCompleted: false,
                stats: {
                    totalEarned: 0,
                    totalAdsWatched: 0,
                    totalReferrals: 0,
                    referralEarnings: 0
                },
                referralCode: referralCode,
                username: currentUser.username || 'unknown',
                firstName: currentUser.first_name || 'Unknown',
                joinDate: new Date(),
                lastDailyReset: new Date()
            };
            
            await window.firebase.setDoc(userDocRef, initialData);
            userBalance = 0;
            dailyAdCount = 0;
            userStats = initialData.stats;
        }
        
        // Load withdrawal history
        loadWithdrawalHistory();
        
        // Set up real-time user statistics listener
        setupRealTimeStatsListener();
        
    } catch (error) {
        console.error('Error loading user data:', error);
        showError('Failed to load user data');
    }
}

// Update user data in Firebase
async function updateUserData(updates) {
    try {
        const userDocRef = window.firebase.doc(window.firebase.db, 'users', currentUser.id.toString());
        await window.firebase.updateDoc(userDocRef, updates);
    } catch (error) {
        console.error('Error updating user data:', error);
        throw error;
    }
}

// Update user interface
function updateUserInterface() {
    // Update welcome message
    document.getElementById('welcome-message').textContent = `Welcome, ${currentUser.first_name}!`;
    
    // Update profile information
    document.getElementById('profile-name').textContent = currentUser.first_name;
    document.getElementById('profile-username').textContent = `@${currentUser.username || 'username'}`;
    
    // Update user avatars
    const userInitial = currentUser.first_name?.charAt(0).toUpperCase() || 'U';
    document.getElementById('user-initial').textContent = userInitial;
    document.getElementById('profile-initial').textContent = userInitial;
    
    // Update balance displays
    updateBalance();
    
    // Update progress bars
    updateAdProgress();
    
    // Update statistics
    updateStatistics();
    
    // Update referral links
    updateReferralLinks();
}

// Update balance displays
function updateBalance() {
    const balanceElements = [
        'user-balance',
        'home-balance',
        'withdraw-balance'
    ];
    
    balanceElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = formatNumber(userBalance);
        }
    });
}

// Update ad progress
function updateAdProgress() {
    const progressText = document.getElementById('ad-progress-text');
    const progressFill = document.getElementById('ad-progress-fill');
    const watchAdBtn = document.getElementById('watch-ad-btn');
    const limitReached = document.getElementById('ad-limit-reached');
    
    progressText.textContent = `${dailyAdCount}/40`;
    progressFill.style.width = `${(dailyAdCount / 40) * 100}%`;
    
    if (dailyAdCount >= 40) {
        watchAdBtn.style.display = 'none';
        limitReached.style.display = 'flex';
    } else {
        watchAdBtn.style.display = 'block';
        limitReached.style.display = 'none';
    }
}

// Update statistics
function updateStatistics() {
    document.getElementById('total-earned').textContent = formatNumber(userStats.totalEarned || 0);
    document.getElementById('total-ads').textContent = userStats.totalAdsWatched || 0;
    document.getElementById('total-referrals').textContent = userStats.totalReferrals || 0;
    document.getElementById('referral-earnings').textContent = formatNumber(userStats.referralEarnings || 0);
}

// Update referral links
function updateReferralLinks() {
    const referralLink = `https://t.me/pepe_rewardbot?start=${referralCode}`;
    
    document.getElementById('referral-link').value = referralLink;
    document.getElementById('modal-referral-link').value = referralLink;
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(button => {
        button.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });
    
    // Bonus task buttons
    document.getElementById('join-channel-btn').addEventListener('click', joinChannel);
    document.getElementById('verify-join-btn').addEventListener('click', verifyChannelJoin);
    
    // Watch ad button
    document.getElementById('watch-ad-btn').addEventListener('click', watchAd);
    
    // Withdrawal form
    document.getElementById('submit-withdrawal').addEventListener('click', submitWithdrawal);
    
    // Copy referral link buttons
    document.getElementById('copy-referral').addEventListener('click', () => copyReferralLink('referral-link'));
    document.getElementById('modal-copy-referral').addEventListener('click', () => copyReferralLink('modal-referral-link'));
    
    // Share referral button
    document.getElementById('share-referral').addEventListener('click', shareReferralLink);
    

    
    // Referral gift box
    document.getElementById('referral-gift').addEventListener('click', openReferralModal);
    
    // Apply referral code button
    document.getElementById('apply-referral-code').addEventListener('click', applyReferralCode);
    
    // Copy referral code button
    document.getElementById('copy-code-btn').addEventListener('click', copyReferralCode);
    
    // Home referral code button
    const homeReferralBtn = document.getElementById('home-apply-referral-code');
    if (homeReferralBtn) {
        homeReferralBtn.addEventListener('click', applyHomeReferralCode);
        console.log('✅ Home referral button event listener attached');
    } else {
        console.error('❌ Home referral button not found');
    }
    
    // Modal close
    document.querySelector('.modal-close').addEventListener('click', closeReferralModal);
    
    // Add test referral button (for development)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        addTestReferralButton();
        // Add debug function for referral modal
        window.debugReferralModal = function() {
            console.log('=== REFERRAL MODAL DEBUG ===');
            console.log('Modal element:', document.getElementById('referral-modal'));
            console.log('Input element:', document.getElementById('referral-code-input'));
            console.log('Apply button:', document.getElementById('apply-referral-code'));
            console.log('Status div:', document.getElementById('referral-status'));
            console.log('Code display:', document.getElementById('your-referral-code'));
            console.log('Referral sections:', document.querySelectorAll('.referral-section'));
            
            // Test opening modal
            const modal = document.getElementById('referral-modal');
            if (modal) {
                modal.style.display = 'flex';
                console.log('Modal should now be visible');
            }
        };
        console.log('💡 Run window.debugReferralModal() in console to test the referral modal');
    }
    
    // Modal backdrop close
    document.getElementById('referral-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeReferralModal();
        }
    });
    
    // Withdrawal amount input validation
    document.getElementById('withdraw-amount').addEventListener('input', validateWithdrawalAmount);
}

// Switch tabs
function switchTab(tabName) {
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

// Join Telegram channel
function joinChannel() {
    const channelUrl = 'https://t.me/taskupofficial';
    window.open(channelUrl, '_blank');
    
    // Enable verify button after a short delay
    setTimeout(() => {
        document.getElementById('verify-join-btn').disabled = false;
    }, 2000);
}

// Verify channel join
async function verifyChannelJoin() {
    try {
        const verifyBtn = document.getElementById('verify-join-btn');
        verifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
        verifyBtn.disabled = true;
        
        // Check if user has already completed the bonus
        const userDocRef = window.firebase.doc(window.firebase.db, 'users', currentUser.id.toString());
        const userDoc = await window.firebase.getDoc(userDocRef);
        
        if (userDoc.exists() && userDoc.data().bonusCompleted) {
            showError('You have already completed the bonus task!');
            verifyBtn.innerHTML = '<i class="fas fa-check"></i> Already Completed';
            verifyBtn.disabled = true;
            return;
        }
        
        // Simulate verification delay (in real implementation, you would check via Telegram Bot API)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Add bonus reward
        console.log('Adding 300 PEPE bonus reward...');
        await addBalance(300, 'bonus_task');
        
        // Update database to mark bonus as completed
        await updateUserData({ bonusCompleted: true });
        
        // Update UI
        document.querySelector('.bonus-task-card').style.display = 'none';
        document.getElementById('bonus-completed').style.display = 'flex';
        
        // Update balance display immediately
        updateBalance();
        updateStatistics();
        
        showSuccess('Bonus task completed! +300 PEPE added to your balance.');
        console.log('Bonus verification completed successfully');
        
    } catch (error) {
        console.error('Error verifying channel join:', error);
        showError('Failed to verify channel join. Please try again.');
        
        const verifyBtn = document.getElementById('verify-join-btn');
        verifyBtn.innerHTML = '<i class="fas fa-check"></i> Verify';
        verifyBtn.disabled = false;
    }
}

// Watch ad
async function watchAd() {
    if (dailyAdCount >= 40) {
        showError('Daily ad limit reached. Come back tomorrow!');
        return;
    }
    
    // Check if Monetag SDK is loaded
    if (typeof window.show_9696411 !== 'function') {
        console.error('Monetag SDK not loaded');
        showError('Ad system not ready. Please refresh the page.');
        return;
    }
    
    try {
        const watchBtn = document.getElementById('watch-ad-btn');
        watchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading Real Ad...';
        watchBtn.disabled = true;
        
        console.log('🎬 Starting Monetag Rewarded Interstitial (Zone: 9696411)...');
        
        // Show Monetag Rewarded Interstitial
        await window.show_9696411();
        
        // Ad was successfully watched - reward the user
        console.log('✅ Real ad watched successfully - rewarding user');
        
        // Add reward
        await addBalance(250, 'ad_reward');
        
        // Update ad count
        dailyAdCount++;
        await updateUserData({ 
            dailyAdCount,
            'stats.totalAdsWatched': window.firebase.increment(1)
        });
        
        // Update progress
        updateAdProgress();
        
        showSuccess(`Real ad completed! +250 PEPE added to your balance. (${dailyAdCount}/40)`);
        console.log('💰 User rewarded: 250 PEPE from real ad view');
        
        watchBtn.innerHTML = '<i class="fas fa-play"></i> Watch Ad';
        watchBtn.disabled = false;
        
    } catch (error) {
        console.error('Monetag ad error:', error);
        
        // Handle different ad errors
        if (error && error.toString().includes('closed')) {
            showError('Ad was closed before completion. Please watch the full ad to earn rewards.');
        } else if (error && error.toString().includes('blocked')) {
            showError('Ad blocker detected. Please disable your ad blocker to earn rewards.');
        } else if (error && error.toString().includes('unavailable')) {
            showError('No ads available right now. Please try again in a moment.');
        } else {
            showError('Failed to load ad. Please check your internet connection.');
        }
        
        const watchBtn = document.getElementById('watch-ad-btn');
        watchBtn.innerHTML = '<i class="fas fa-play"></i> Watch Ad';
        watchBtn.disabled = false;
    }
}

// Add balance
async function addBalance(amount, source) {
    userBalance += amount;
    userStats.totalEarned += amount;
    
    // Update Firebase
    await updateUserData({
        balance: window.firebase.increment(amount),
        'stats.totalEarned': window.firebase.increment(amount)
    });
    
    // Update UI
    updateBalance();
    updateStatistics();
    
    // Handle referral commission for ALL earning activities (except commission itself)
    if (source !== 'commission' && source !== 'referral_bonus') {
        console.log(`🎯 Processing referral commission for ${source}...`);
        await processReferralCommission(amount);
    }
}

// Process referral commission when user earns from ads
async function processReferralCommission(amount) {
    try {
        console.log('Checking if user was referred...');
        
        // Get current user data to check if they were referred
        const userDocRef = window.firebase.doc(window.firebase.db, 'users', currentUser.id.toString());
        const userDoc = await window.firebase.getDoc(userDocRef);
        const userData = userDoc.data();
        
        if (userData.referredBy) {
            const referrerId = userData.referredBy;
            const commission = Math.floor(amount * 0.1); // 10% commission
            
            console.log(`💰 Sending ${commission} PEPE commission to referrer: ${referrerId}`);
            
            // Update referrer's balance and commission earnings
            const referrerDocRef = window.firebase.doc(window.firebase.db, 'users', referrerId);
            
            await window.firebase.updateDoc(referrerDocRef, {
                balance: window.firebase.increment(commission),
                'stats.referralEarnings': window.firebase.increment(commission),
                'stats.totalEarned': window.firebase.increment(commission)
            });
            
            console.log(`✅ Commission of ${commission} PEPE sent to referrer ${referrerId}`);
        } else {
            console.log('ℹ️ User was not referred - no commission needed');
        }
        
    } catch (error) {
        console.error('❌ Error processing referral commission:', error);
    }
}

// Handle referral commission
// OLD FUNCTION REMOVED - Using processReferralCommission instead

// Submit withdrawal
async function submitWithdrawal() {
    const amount = parseInt(document.getElementById('withdraw-amount').value);
    const binanceEmail = document.getElementById('binance-email').value.trim();
    const errorDiv = document.getElementById('withdrawal-error');
    
    // Validation
    if (!amount || amount < 10000) {
        showWithdrawalError('Minimum withdrawal amount is 10,000 PEPE');
        return;
    }
    
    if (amount > userBalance) {
        showWithdrawalError('Insufficient balance');
        return;
    }
    
    if (!binanceEmail) {
        showWithdrawalError('Please enter your Binance email or UID');
        return;
    }
    
    try {
        const submitBtn = document.getElementById('submit-withdrawal');
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        submitBtn.disabled = true;
        
        // Create withdrawal request
        const withdrawalData = {
            userId: currentUser.id.toString(),
            amount: amount,
            method: 'binance',
            binanceEmail: binanceEmail,
            status: 'pending',
            createdAt: new Date(),
            userName: currentUser.first_name
        };
        
        // Add withdrawal to UI immediately (optimistic update)
        const withdrawalList = document.getElementById('withdrawal-list');
        if (withdrawalList && withdrawalList.querySelector('.empty-state')) {
            withdrawalList.innerHTML = '';
        }
        
        const immediateWithdrawal = {
            ...withdrawalData,
            createdAt: { toDate: () => withdrawalData.createdAt }
        };
        
        const newElement = createWithdrawalElement(immediateWithdrawal);
        if (withdrawalList) {
            withdrawalList.insertBefore(newElement, withdrawalList.firstChild);
        }
        
        // Add to withdrawals collection
        await window.firebase.addDoc(
            window.firebase.collection(window.firebase.db, 'withdrawals'),
            withdrawalData
        );
        
        console.log('Withdrawal request added to database');
        
        // Deduct from user balance
        userBalance -= amount;
        await updateUserData({
            balance: window.firebase.increment(-amount)
        });
        
        // Update UI
        updateBalance();
        
        // Clear form
        document.getElementById('withdraw-amount').value = '';
        document.getElementById('binance-email').value = '';
        
        showSuccess('Withdrawal request submitted successfully! You will see status updates in real-time.');
        
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Withdrawal';
        submitBtn.disabled = false;
        
    } catch (error) {
        console.error('Error submitting withdrawal:', error);
        showWithdrawalError('Failed to submit withdrawal. Please try again.');
        
        const submitBtn = document.getElementById('submit-withdrawal');
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Withdrawal';
        submitBtn.disabled = false;
    }
}

// Load withdrawal history with real-time updates
function loadWithdrawalHistory() {
    try {
        const withdrawalsRef = window.firebase.collection(window.firebase.db, 'withdrawals');
        // Simplified query without orderBy to avoid index requirement
        const q = window.firebase.query(
            withdrawalsRef,
            window.firebase.where('userId', '==', currentUser.id.toString())
        );
        
        console.log('Setting up real-time withdrawal listener...');
        
        // Listen for real-time updates
        const unsubscribe = window.firebase.onSnapshot(q, (snapshot) => {
            console.log('Withdrawal history updated, processing...');
            const withdrawalList = document.getElementById('withdrawal-list');
            
            if (!withdrawalList) return;
            
            withdrawalList.innerHTML = '';
            
            if (snapshot.empty) {
                withdrawalList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <p>No withdrawals yet</p>
                    </div>
                `;
                return;
            }
            
            // Convert to array and sort manually by date
            const withdrawals = [];
            snapshot.forEach((doc) => {
                withdrawals.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            // Sort by creation date (newest first)
            withdrawals.sort((a, b) => {
                const dateA = a.createdAt?.toDate() || new Date(0);
                const dateB = b.createdAt?.toDate() || new Date(0);
                return dateB - dateA;
            });
            
            // Create elements
            withdrawals.forEach(withdrawal => {
                const withdrawalElement = createWithdrawalElement(withdrawal);
                withdrawalList.appendChild(withdrawalElement);
            });
            
            console.log(`Displayed ${withdrawals.length} withdrawals`);
        }, (error) => {
            console.error('Error in withdrawal listener:', error);
            // Fallback: load withdrawals without real-time updates
            loadWithdrawalHistoryFallback();
        });
        
        // Store unsubscribe function for cleanup
        window.withdrawalUnsubscribe = unsubscribe;
        
    } catch (error) {
        console.error('Error setting up withdrawal history:', error);
        loadWithdrawalHistoryFallback();
    }
}

// Fallback method without real-time updates
async function loadWithdrawalHistoryFallback() {
    try {
        console.log('Using fallback withdrawal loading...');
        const withdrawalsRef = window.firebase.collection(window.firebase.db, 'withdrawals');
        const q = window.firebase.query(
            withdrawalsRef,
            window.firebase.where('userId', '==', currentUser.id.toString())
        );
        
        const snapshot = await window.firebase.getDocs(q);
        const withdrawalList = document.getElementById('withdrawal-list');
        
        if (!withdrawalList) return;
        
        withdrawalList.innerHTML = '';
        
        if (snapshot.empty) {
            withdrawalList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>No withdrawals yet</p>
                </div>
            `;
            return;
        }
        
        const withdrawals = [];
        snapshot.forEach((doc) => {
            withdrawals.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        withdrawals.sort((a, b) => {
            const dateA = a.createdAt?.toDate() || new Date(0);
            const dateB = b.createdAt?.toDate() || new Date(0);
            return dateB - dateA;
        });
        
        withdrawals.forEach(withdrawal => {
            const withdrawalElement = createWithdrawalElement(withdrawal);
            withdrawalList.appendChild(withdrawalElement);
        });
        
    } catch (error) {
        console.error('Error loading withdrawal history fallback:', error);
    }
}

// Create withdrawal element
function createWithdrawalElement(withdrawal) {
    const div = document.createElement('div');
    div.className = 'withdrawal-item';
    div.setAttribute('data-withdrawal-id', withdrawal.id || 'temp-' + Date.now());
    
    let date;
    try {
        if (withdrawal.createdAt && withdrawal.createdAt.toDate) {
            date = withdrawal.createdAt.toDate().toLocaleDateString();
        } else if (withdrawal.createdAt instanceof Date) {
            date = withdrawal.createdAt.toLocaleDateString();
        } else {
            date = 'Just now';
        }
    } catch (error) {
        date = 'Just now';
    }
    
    const status = withdrawal.status || 'pending';
    const statusClass = status === 'completed' ? 'status-completed' : 'status-pending';
    const statusIcon = status === 'completed' ? 'fas fa-check-circle' : 'fas fa-clock';
    
    div.innerHTML = `
        <div class="withdrawal-info">
            <div class="withdrawal-amount">${formatNumber(withdrawal.amount)} PEPE</div>
            <div class="withdrawal-date">${date}</div>
            <div class="withdrawal-method">Binance: ${withdrawal.binanceEmail}</div>
        </div>
        <div class="withdrawal-status ${statusClass}">
            <i class="${statusIcon}"></i>
            ${status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
    `;
    
    return div;
}

// Copy referral link
function copyReferralLink(inputId) {
    const input = document.getElementById(inputId);
    input.select();
    input.setSelectionRange(0, 99999); // For mobile devices
    
    navigator.clipboard.writeText(input.value).then(() => {
        showSuccess('Referral link copied to clipboard!');
    }).catch(() => {
        // Fallback for older browsers
        document.execCommand('copy');
        showSuccess('Referral link copied to clipboard!');
    });
}

// Share referral link
function shareReferralLink() {
    const referralLink = document.getElementById('modal-referral-link').value;
    const shareText = `🐸 Join me on Pepe Earn and start earning cryptocurrency by watching ads! Use my referral link: ${referralLink}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Pepe Earn - Earn Crypto!',
            text: shareText,
            url: referralLink
        });
    } else {
        // Fallback: open Telegram share with correct bot username
        const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`;
        window.open(telegramUrl, '_blank');
    }
}

// Open referral modal
function openReferralModal() {
    const modal = document.getElementById('referral-modal');
    const referralLink = `https://t.me/pepe_rewardbot?start=${referralCode}`;
    
    document.getElementById('modal-referral-link').value = referralLink;
    document.getElementById('your-referral-code').textContent = referralCode;
    
    // Check if user already used a referral code
    checkReferralStatus();
    
    modal.style.display = 'flex';
}

// Check referral status and disable input if already used
async function checkReferralStatus() {
    try {
        const statusDiv = document.getElementById('referral-status');
        const inputField = document.getElementById('referral-code-input');
        const applyBtn = document.getElementById('apply-referral-code');
        
        console.log('🔍 Checking referral status...');
        console.log('Elements found:', {
            statusDiv: !!statusDiv,
            inputField: !!inputField,
            applyBtn: !!applyBtn
        });
        
        if (!statusDiv || !inputField || !applyBtn) {
            console.error('⚠️ Referral modal elements not found!');
            return;
        }
        
        const userDocRef = window.firebase.doc(window.firebase.db, 'users', currentUser.id.toString());
        const userDoc = await window.firebase.getDoc(userDocRef);
        const userData = userDoc.data();
        
        if (userData && userData.referredBy) {
            statusDiv.innerHTML = '<div class="status-success"><i class="fas fa-check"></i> You already used a referral code!</div>';
            inputField.disabled = true;
            inputField.placeholder = 'Already used referral code';
            applyBtn.disabled = true;
            applyBtn.innerHTML = '<i class="fas fa-check"></i> Already Applied';
            console.log('✅ User already has referral code applied');
        } else {
            statusDiv.innerHTML = '';
            inputField.disabled = false;
            inputField.placeholder = 'Enter code (e.g. ABC123)';
            applyBtn.disabled = false;
            applyBtn.innerHTML = '<i class="fas fa-check"></i> Apply';
            console.log('✅ User can enter new referral code');
        }
    } catch (error) {
        console.error('Error checking referral status:', error);
    }
}

// Apply referral code
async function applyReferralCode() {
    try {
        const inputField = document.getElementById('referral-code-input');
        const codeToApply = inputField.value.trim().toUpperCase();
        const statusDiv = document.getElementById('referral-status');
        const applyBtn = document.getElementById('apply-referral-code');
        
        if (!codeToApply) {
            statusDiv.innerHTML = '<div class="status-error"><i class="fas fa-exclamation"></i> Please enter a referral code</div>';
            return;
        }
        
        if (codeToApply === referralCode) {
            statusDiv.innerHTML = '<div class="status-error"><i class="fas fa-times"></i> You cannot use your own referral code</div>';
            return;
        }
        
        // Check if user already used a referral code
        const userDocRef = window.firebase.doc(window.firebase.db, 'users', currentUser.id.toString());
        const userDoc = await window.firebase.getDoc(userDocRef);
        const userData = userDoc.data();
        
        if (userData.referredBy) {
            statusDiv.innerHTML = '<div class="status-error"><i class="fas fa-times"></i> You already used a referral code</div>';
            return;
        }
        
        applyBtn.disabled = true;
        applyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';
        statusDiv.innerHTML = '<div class="status-loading"><i class="fas fa-spinner fa-spin"></i> Verifying code...</div>';
        
        console.log('Applying referral code:', codeToApply);
        
        // Find the referrer by their referral code
        const usersRef = window.firebase.collection(window.firebase.db, 'users');
        const referrerQuery = window.firebase.query(usersRef, window.firebase.where('referralCode', '==', codeToApply));
        const referrerSnapshot = await window.firebase.getDocs(referrerQuery);
        
        if (referrerSnapshot.empty) {
            statusDiv.innerHTML = '<div class="status-error"><i class="fas fa-times"></i> Invalid referral code</div>';
            applyBtn.disabled = false;
            applyBtn.innerHTML = '<i class="fas fa-check"></i> Apply';
            return;
        }
        
        const referrerDoc = referrerSnapshot.docs[0];
        const referrerId = referrerDoc.id;
        
        console.log('Valid referral code found, referrer ID:', referrerId);
        
        // Set the referral relationship for the current user
        await updateUserData({ referredBy: referrerId });
        
        // Update referrer's referral count
        const referrerDocRef = window.firebase.doc(window.firebase.db, 'users', referrerId);
        await window.firebase.updateDoc(referrerDocRef, {
            'stats.totalReferrals': window.firebase.increment(1)
        });
        
        // Give 300 PEPE bonus to current user (no commission paid on referral bonus itself)
        await addBalance(300, 'referral_bonus');
        
        console.log('✅ Referral code applied successfully');
        console.log(`✅ User got 300 PEPE bonus`);
        console.log(`✅ Referrer ${referrerId} got +1 referral`);
        
        statusDiv.innerHTML = '<div class="status-success"><i class="fas fa-check"></i> Success! You earned 300 PEPE!</div>';
        inputField.disabled = true;
        inputField.value = codeToApply;
        applyBtn.disabled = true;
        applyBtn.innerHTML = '<i class="fas fa-check"></i> Applied';
        
        showSuccess('Referral code applied! You earned 300 PEPE bonus!');
        
        // Update UI
        updateUserInterface();
        
    } catch (error) {
        console.error('Error applying referral code:', error);
        const statusDiv = document.getElementById('referral-status');
        const applyBtn = document.getElementById('apply-referral-code');
        
        statusDiv.innerHTML = '<div class="status-error"><i class="fas fa-times"></i> Failed to apply code</div>';
        applyBtn.disabled = false;
        applyBtn.innerHTML = '<i class="fas fa-check"></i> Apply';
        
        showError('Failed to apply referral code. Please try again.');
    }
}

// Copy referral code
function copyReferralCode() {
    navigator.clipboard.writeText(referralCode).then(() => {
        showSuccess('Referral code copied!');
    }).catch(() => {
        showError('Failed to copy code');
    });
}

// Apply home referral code
async function applyHomeReferralCode() {
    try {
        const inputField = document.getElementById('home-referral-code-input');
        const codeToApply = inputField.value.trim().toUpperCase();
        const statusDiv = document.getElementById('home-referral-status');
        const applyBtn = document.getElementById('home-apply-referral-code');
        
        if (!codeToApply) {
            statusDiv.innerHTML = '<div class="status-error"><i class="fas fa-exclamation"></i> Please enter a referral code</div>';
            return;
        }
        
        if (codeToApply === referralCode) {
            statusDiv.innerHTML = '<div class="status-error"><i class="fas fa-times"></i> You cannot use your own referral code</div>';
            return;
        }
        
        // Check if user already used a referral code
        const userDocRef = window.firebase.doc(window.firebase.db, 'users', currentUser.id.toString());
        const userDoc = await window.firebase.getDoc(userDocRef);
        const userData = userDoc.data();
        
        if (userData && userData.referredBy) {
            statusDiv.innerHTML = '<div class="status-error"><i class="fas fa-times"></i> You already used a referral code</div>';
            return;
        }
        
        applyBtn.disabled = true;
        applyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';
        statusDiv.innerHTML = '<div class="status-loading"><i class="fas fa-spinner fa-spin"></i> Verifying code...</div>';
        
        console.log('Applying home referral code:', codeToApply);
        
        // Find the referrer by their referral code
        const usersRef = window.firebase.collection(window.firebase.db, 'users');
        const referrerQuery = window.firebase.query(usersRef, window.firebase.where('referralCode', '==', codeToApply));
        const referrerSnapshot = await window.firebase.getDocs(referrerQuery);
        
        if (referrerSnapshot.empty) {
            statusDiv.innerHTML = '<div class="status-error"><i class="fas fa-times"></i> Invalid referral code</div>';
            applyBtn.disabled = false;
            applyBtn.innerHTML = '<i class="fas fa-check"></i> Apply Code';
            return;
        }
        
        const referrerDoc = referrerSnapshot.docs[0];
        const referrerId = referrerDoc.id;
        
        console.log('Valid referral code found, referrer ID:', referrerId);
        
        // Set the referral relationship for the current user
        await updateUserData({ referredBy: referrerId });
        
        // Update referrer's referral count
        const referrerDocRef = window.firebase.doc(window.firebase.db, 'users', referrerId);
        await window.firebase.updateDoc(referrerDocRef, {
            'stats.totalReferrals': window.firebase.increment(1)
        });
        
        // Give 300 PEPE bonus to current user (no commission paid on referral bonus itself)
        await addBalance(300, 'referral_bonus');
        
        console.log('✅ Home referral code applied successfully');
        console.log(`✅ User got 300 PEPE bonus`);
        console.log(`✅ Referrer ${referrerId} got +1 referral`);
        
        statusDiv.innerHTML = '<div class="status-success"><i class="fas fa-check"></i> Success! You earned 300 PEPE!</div>';
        inputField.disabled = true;
        inputField.value = codeToApply;
        applyBtn.disabled = true;
        applyBtn.innerHTML = '<i class="fas fa-check"></i> Applied';
        
        // Hide the card after successful application
        setTimeout(() => {
            document.querySelector('.home-referral-card').style.display = 'none';
        }, 3000);
        
        showSuccess('Referral code applied! You earned 300 PEPE bonus!');
        
        // Update UI
        updateUserInterface();
        
    } catch (error) {
        console.error('Error applying home referral code:', error);
        const statusDiv = document.getElementById('home-referral-status');
        const applyBtn = document.getElementById('home-apply-referral-code');
        
        statusDiv.innerHTML = '<div class="status-error"><i class="fas fa-times"></i> Failed to apply code</div>';
        applyBtn.disabled = false;
        applyBtn.innerHTML = '<i class="fas fa-check"></i> Apply Code';
        
        showError('Failed to apply referral code. Please try again.');
    }
}

// Check home referral status on load
async function checkHomeReferralStatus() {
    try {
        console.log('🔍 Checking home referral status...');
        
        const homeReferralCard = document.querySelector('.home-referral-card');
        console.log('Home referral card element:', homeReferralCard);
        
        if (!homeReferralCard) {
            console.error('❌ Home referral card not found in DOM!');
            return;
        }
        
        const userDocRef = window.firebase.doc(window.firebase.db, 'users', currentUser.id.toString());
        const userDoc = await window.firebase.getDoc(userDocRef);
        const userData = userDoc.data();
        
        console.log('User referral data:', userData?.referredBy);
        
        if (userData && userData.referredBy) {
            // User already used a referral code, hide the card
            homeReferralCard.style.display = 'none';
            console.log('✅ User already has referral code, hiding home card');
        } else {
            // User can still enter a referral code, show the card
            homeReferralCard.style.display = 'block';
            homeReferralCard.style.visibility = 'visible';
            console.log('✅ User can enter referral code, showing home card');
            
            // Also log the card's computed styles for debugging
            const computedStyle = window.getComputedStyle(homeReferralCard);
            console.log('Card display:', computedStyle.display);
            console.log('Card visibility:', computedStyle.visibility);
        }
    } catch (error) {
        console.error('Error checking home referral status:', error);
        // Fallback: show the card if there's an error
        const homeReferralCard = document.querySelector('.home-referral-card');
        if (homeReferralCard) {
            homeReferralCard.style.display = 'block';
        }
    }
}

// Close referral modal
function closeReferralModal() {
    document.getElementById('referral-modal').style.display = 'none';
}

// Check for referral code in URL
async function checkReferralCode() {
    try {
        console.log('=== CHECKING REFERRAL CODE ===');
        
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const urlStartParam = urlParams.get('tgWebAppStartParam');
        console.log('URL start param:', urlStartParam);
        
        // Get Telegram start parameter  
        const tgStartParam = tg?.initDataUnsafe?.start_param;
        console.log('Telegram start param:', tgStartParam);
        
        // Check both sources for referral code
        const startParam = urlStartParam || tgStartParam;
        console.log('Final start param:', startParam);
        console.log('Current user referral code:', referralCode);
        
        if (startParam && startParam !== referralCode) {
            console.log(`🎯 Processing referral with code: ${startParam}`);
            
            // Check if user was already referred
            const userDocRef = window.firebase.doc(window.firebase.db, 'users', currentUser.id.toString());
            const userDoc = await window.firebase.getDoc(userDocRef);
            const userData = userDoc.data();
            
            if (!userData.referredBy) {
                console.log('👥 Processing new referral...');
                await processReferralJoin(startParam);
            } else {
                console.log('ℹ️ User already has a referrer:', userData.referredBy);
            }
        } else if (startParam === referralCode) {
            console.log('⚠️ User tried to use their own referral code');
        } else {
            console.log('ℹ️ No referral code found - direct join');
        }
    } catch (error) {
        console.error('Error checking referral code:', error);
    }
}

// Handle referral join
async function handleReferralJoin(referrerCode) {
    try {
        console.log(`Processing referral with code: ${referrerCode}`);
        
        // Find referrer by referral code
        const usersRef = window.firebase.collection(window.firebase.db, 'users');
        const q = window.firebase.query(usersRef, window.firebase.where('referralCode', '==', referrerCode));
        const querySnapshot = await window.firebase.getDocs(q);
        
        if (!querySnapshot.empty) {
            const referrerDoc = querySnapshot.docs[0];
            const referrerId = referrerDoc.id;
            const referrerData = referrerDoc.data();
            
            console.log(`Found referrer: ${referrerId}`);
            
            // Check if user is not already referred and not referring themselves
            const userDocRef = window.firebase.doc(window.firebase.db, 'users', currentUser.id.toString());
            const userDoc = await window.firebase.getDoc(userDocRef);
            
            if (referrerId !== currentUser.id.toString()) {
                if (!userDoc.exists() || !userDoc.data().referredBy) {
                    console.log('Processing new referral...');
                    
                    // Update user with referrer info
                    await updateUserData({ referredBy: referrerId });
                    
                    // Update referrer's statistics with real-time updates
                    await window.firebase.updateDoc(referrerDoc.ref, {
                        'stats.totalReferrals': window.firebase.increment(1)
                    });
                    
                    console.log(`✅ Referral processed: ${referrerId} got +1 referral`);
                    showSuccess('🎉 Welcome! You joined through a referral link and your friend will earn commissions from your activity!');
                    
                    // Force update statistics display if we're on profile tab
                    if (document.querySelector('.tab-content.active')?.id === 'profile-tab') {
                        setTimeout(() => {
                            loadUserData(); // Reload to get fresh stats
                        }, 1000);
                    }
                } else {
                    console.log('User already referred by someone else');
                }
            } else {
                console.log('User cannot refer themselves');
            }
        } else {
            console.log(`No referrer found with code: ${referrerCode}`);
        }
    } catch (error) {
        console.error('Error handling referral join:', error);
    }
}

// Set up real-time statistics listener
function setupRealTimeStatsListener() {
    try {
        const userDocRef = window.firebase.doc(window.firebase.db, 'users', currentUser.id.toString());
        
        console.log('Setting up real-time stats listener...');
        
        // Listen for real-time updates to user document
        const unsubscribe = window.firebase.onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
                const userData = doc.data();
                
                // Update local statistics
                userStats = userData.stats || userStats;
                userBalance = userData.balance || userBalance;
                
                // Update UI immediately
                updateStatistics();
                updateBalance();
                
                console.log('Real-time stats updated:', {
                    referrals: userStats.totalReferrals,
                    earnings: userStats.referralEarnings,
                    balance: userBalance
                });
            }
        }, (error) => {
            console.error('Error in stats listener:', error);
        });
        
        // Store unsubscribe function
        window.statsUnsubscribe = unsubscribe;
        
    } catch (error) {
        console.error('Error setting up real-time stats listener:', error);
    }
}

// Process referral when user joins through a referral link
async function processReferralJoin(referralCode) {
    try {
        console.log('🔍 Processing referral join with code:', referralCode);
        
        // Find the referrer by their referral code
        const usersRef = window.firebase.collection(window.firebase.db, 'users');
        const referrerQuery = window.firebase.query(usersRef, window.firebase.where('referralCode', '==', referralCode));
        const referrerSnapshot = await window.firebase.getDocs(referrerQuery);
        
        if (referrerSnapshot.empty) {
            console.log('❌ No user found with referral code:', referralCode);
            showError('Invalid referral code.');
            return false;
        }
        
        const referrerDoc = referrerSnapshot.docs[0];
        const referrerId = referrerDoc.id;
        const referrerData = referrerDoc.data();
        
        // Prevent self-referral
        if (referrerId === currentUser.id.toString()) {
            console.log('❌ Self-referral prevented');
            showError('You cannot refer yourself.');
            return false;
        }
        
        console.log('✅ Found referrer:', referrerId);
        
        // Set the referral relationship for the new user
        await updateUserData({ referredBy: referrerId });
        
        // Update referrer's referral count IMMEDIATELY
        const referrerDocRef = window.firebase.doc(window.firebase.db, 'users', referrerId);
        await window.firebase.updateDoc(referrerDocRef, {
            'stats.totalReferrals': window.firebase.increment(1)
        });
        
        console.log('✅ Referral relationship established');
        console.log(`✅ Referrer ${referrerId} now has +1 referral`);
        
        showSuccess(`Welcome! You were referred by a friend. They will earn 10% commission from your earnings!`);
        
        return true;
        
    } catch (error) {
        console.error('❌ Error processing referral:', error);
        showError('Failed to process referral.');
        return false;
    }
}

// Manual test function for referral system
async function testReferralNow() {
    try {
        console.log('=== MANUAL REFERRAL TEST ===');
        
        // Step 1: Create a fake referrer for testing
        const fakeReferrerId = 'manual_test_referrer';
        const fakeReferralCode = 'TESTCODE123';
        
        console.log('Creating test referrer...');
        const referrerData = {
            balance: 1000,
            dailyAdCount: 5,
            bonusCompleted: true,
            stats: {
                totalEarned: 1000,
                totalAdsWatched: 4,
                totalReferrals: 0,
                referralEarnings: 0
            },
            referralCode: fakeReferralCode,
            joinDate: new Date(),
            lastDailyReset: new Date()
        };
        
        const referrerDocRef = window.firebase.doc(window.firebase.db, 'users', fakeReferrerId);
        await window.firebase.setDoc(referrerDocRef, referrerData);
        console.log('✅ Test referrer created');
        
        // Step 2: Make current user be referred by test referrer
        console.log('Setting referral relationship...');
        await processReferralJoin(fakeReferralCode);
        
        // Step 3: Test commission by adding ad reward
        console.log('Testing commission system...');
        await addBalance(250, 'ad_reward');
        
        // Step 4: Check results after delay
        setTimeout(async () => {
            const finalReferrerDoc = await window.firebase.getDoc(referrerDocRef);
            const finalStats = finalReferrerDoc.data().stats;
            
            console.log('=== TEST RESULTS ===');
            console.log(`Referrer referrals: ${finalStats.totalReferrals}`);
            console.log(`Referrer commission: ${finalStats.referralEarnings} PEPE`);
            console.log(`Test ${finalStats.totalReferrals >= 1 && finalStats.referralEarnings >= 25 ? 'PASSED' : 'FAILED'}`);
            
            if (finalStats.totalReferrals >= 1 && finalStats.referralEarnings >= 25) {
                showSuccess('Referral test PASSED! System working correctly.');
            } else {
                showError('Referral test FAILED! System needs debugging.');
            }
        }, 2000);
        
    } catch (error) {
        console.error('Manual test error:', error);
        showError('Test failed: ' + error.message);
    }
}

// Quick test button in console
if (typeof window !== 'undefined') {
    window.testReferral = testReferralNow;
    console.log('💡 Run window.testReferral() in console to test the referral system');
}

// Check Monetag SDK loading
function checkMonetag() {
    console.log('🔍 Checking Monetag SDK...');
    
    if (typeof window.show_9696411 === 'function') {
        console.log('✅ Monetag SDK loaded successfully (Zone: 9696411)');
        return true;
    } else {
        console.log('❌ Monetag SDK not loaded');
        
        // Try to reload after a delay
        setTimeout(() => {
            if (typeof window.show_9696411 === 'function') {
                console.log('✅ Monetag SDK loaded after delay');
            } else {
                console.log('⚠️ Monetag SDK still not available - ads may not work');
            }
        }, 3000);
        
        return false;
    }
}

// Run checks on app start
setTimeout(() => {
    // Check Monetag SDK
    checkMonetag();
}, 5000);

// Utility functions
function generateReferralCode(userId) {
    // Create short 6-character referral code
    const userPart = userId.toString().replace(/[^0-9]/g, '').slice(-3) || Math.random().toString().slice(-3);
    const randomPart = Math.random().toString(36).slice(2, 5).toUpperCase();
    return userPart + randomPart;
}

function formatNumber(num) {
    return new Intl.NumberFormat().format(num);
}

function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}

function startDailyResetTimer() {
    function updateTimer() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const timeUntilReset = tomorrow - now;
        const hours = Math.floor(timeUntilReset / (1000 * 60 * 60));
        const minutes = Math.floor((timeUntilReset % (1000 * 60 * 60)) / (1000 * 60));
        
        const timerElement = document.getElementById('time-until-reset');
        if (timerElement) {
            timerElement.textContent = `Resets in ${hours}h ${minutes}m`;
        }
    }
    
    updateTimer();
    setInterval(updateTimer, 60000); // Update every minute
}

// Add test referral functionality for development
function addTestReferralButton() {
    const profileTab = document.getElementById('profile-tab');
    const testSection = document.createElement('div');
    testSection.className = 'referral-section';
    testSection.innerHTML = `
        <h3><i class="fas fa-flask"></i> Test Referral System</h3>
        <p>Test the referral functionality:</p>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button id="test-create-referrer" class="btn btn-primary">Create Test Referrer</button>
            <button id="test-simulate-referral" class="btn btn-secondary">Simulate Being Referred</button>
            <button id="test-referral-commission" class="btn btn-secondary">Test Commission</button>
            <button id="test-bonus-task" class="btn btn-secondary">Test Bonus Task</button>
        </div>
        <div id="test-results" style="margin-top: 15px; padding: 10px; background: #f0f0f0; border-radius: 5px; display: none;"></div>
    `;
    profileTab.appendChild(testSection);
    
    // Add event listeners for test buttons
    document.getElementById('test-create-referrer').addEventListener('click', createTestReferrer);
    document.getElementById('test-simulate-referral').addEventListener('click', simulateReferral);
    document.getElementById('test-referral-commission').addEventListener('click', testReferralCommission);
    document.getElementById('test-bonus-task').addEventListener('click', testBonusTask);
}

// Create a test referrer user
async function createTestReferrer() {
    try {
        const testReferrerId = 'test_referrer_' + Date.now();
        const testReferralCode = generateReferralCode(testReferrerId);
        
        const testReferrerData = {
            balance: 5000,
            dailyAdCount: 0,
            bonusCompleted: true,
            stats: {
                totalEarned: 5000,
                totalAdsWatched: 20,
                totalReferrals: 0,
                referralEarnings: 0
            },
            referralCode: testReferralCode,
            joinDate: new Date(),
            lastDailyReset: new Date()
        };
        
        const referrerDocRef = window.firebase.doc(window.firebase.db, 'users', testReferrerId);
        await window.firebase.setDoc(referrerDocRef, testReferrerData);
        
        showTestResult(`Test referrer created with ID: ${testReferrerId} and referral code: ${testReferralCode}`);
        console.log('Test referrer created:', testReferrerId, testReferralCode);
        
    } catch (error) {
        console.error('Error creating test referrer:', error);
        showTestResult('Error creating test referrer: ' + error.message);
    }
}

// Simulate being referred by the test referrer
async function simulateReferral() {
    try {
        // Get all test referrers
        const usersRef = window.firebase.collection(window.firebase.db, 'users');
        const q = window.firebase.query(usersRef, window.firebase.where('referralCode', '!=', ''));
        const querySnapshot = await window.firebase.getDocs(q);
        
        if (!querySnapshot.empty) {
            const referrerDoc = querySnapshot.docs[0];
            const referrerId = referrerDoc.id;
            const referrerCode = referrerDoc.data().referralCode;
            
            // Simulate referral join
            await handleReferralJoin(referrerCode);
            
            showTestResult(`Simulated referral join with code: ${referrerCode} from referrer: ${referrerId}`);
            
        } else {
            showTestResult('No test referrers found. Create one first.');
        }
    } catch (error) {
        console.error('Error simulating referral:', error);
        showTestResult('Error simulating referral: ' + error.message);
    }
}

// Test referral commission system
async function testReferralCommission() {
    try {
        // Add balance and trigger commission
        const testAmount = 1000;
        await addBalance(testAmount, 'ad_reward');
        
        showTestResult(`Added ${testAmount} PEPE to balance and triggered referral commission check`);
        
        // Update UI to reflect changes
        updateBalance();
        updateStatistics();
        
    } catch (error) {
        console.error('Error testing commission:', error);
        showTestResult('Error testing commission: ' + error.message);
    }
}

// Test bonus task functionality
async function testBonusTask() {
    try {
        // Reset bonus status for testing
        await updateUserData({ bonusCompleted: false });
        
        // Show bonus task card again
        document.querySelector('.bonus-task-card').style.display = 'block';
        document.getElementById('bonus-completed').style.display = 'none';
        
        // Re-enable verify button
        const verifyBtn = document.getElementById('verify-join-btn');
        verifyBtn.innerHTML = '<i class="fas fa-check"></i> Verify';
        verifyBtn.disabled = false;
        
        showTestResult('Bonus task reset - you can now test the join & verify functionality');
        
    } catch (error) {
        console.error('Error testing bonus task:', error);
        showTestResult('Error testing bonus task: ' + error.message);
    }
}

// Show test results
function showTestResult(message) {
    const resultDiv = document.getElementById('test-results');
    if (resultDiv) {
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `<strong>Test Result:</strong> ${message}`;
        setTimeout(() => {
            resultDiv.style.display = 'none';
        }, 10000);
    }
}

function validateWithdrawalAmount() {
    const amount = parseInt(document.getElementById('withdraw-amount').value);
    const submitBtn = document.getElementById('submit-withdrawal');
    
    if (amount && amount >= 10000 && amount <= userBalance) {
        submitBtn.disabled = false;
        hideWithdrawalError();
    } else {
        submitBtn.disabled = true;
    }
}

function showSuccess(message) {
    // Create and show success notification
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Add styles if not already added
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 10px;
                color: white;
                font-weight: bold;
                z-index: 3000;
                display: flex;
                align-items: center;
                gap: 10px;
                max-width: 300px;
                animation: slideIn 0.3s ease-out;
            }
            .notification.success {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            }
            .notification.error {
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function showError(message) {
    const notification = document.createElement('div');
    notification.className = 'notification error';
    notification.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function showWithdrawalError(message) {
    const errorDiv = document.getElementById('withdrawal-error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function hideWithdrawalError() {
    const errorDiv = document.getElementById('withdrawal-error');
    errorDiv.style.display = 'none';
}

// Handle app visibility change
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // App became visible, refresh data
        loadUserData().then(() => {
            updateUserInterface();
        });
    }
});

// Handle Telegram WebApp events
tg.onEvent('viewportChanged', function() {
    console.log('Viewport changed:', tg.viewportHeight);
});

tg.onEvent('themeChanged', function() {
    console.log('Theme changed');
    document.body.style.backgroundColor = tg.backgroundColor;
});
