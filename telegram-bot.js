// Telegram Bot API helper functions
// This file contains utilities for interacting with the Telegram Bot API

class TelegramBot {
    constructor() {
        this.botToken = this.getBotToken();
        this.channelUsername = '@pepe_rewardofficial';
        this.botUsername = 'pepe_rewardbot';
    }

    getBotToken() {
        // Get bot token from environment variable or use default for testing
        return window.ENV?.TELEGRAM_BOT_TOKEN || 'your_bot_token_here';
    }

    async checkChannelMembership(userId) {
        try {
            const response = await fetch(`https://api.telegram.org/bot${this.botToken}/getChatMember`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: this.channelUsername,
                    user_id: userId
                })
            });

            const data = await response.json();
            
            if (data.ok) {
                const status = data.result.status;
                return ['member', 'administrator', 'creator'].includes(status);
            }
            
            return false;
        } catch (error) {
            console.error('Error checking channel membership:', error);
            return false;
        }
    }

    async sendMessage(chatId, text, options = {}) {
        try {
            const response = await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: text,
                    parse_mode: 'HTML',
                    ...options
                })
            });

            const data = await response.json();
            return data.ok ? data.result : null;
        } catch (error) {
            console.error('Error sending message:', error);
            return null;
        }
    }

    generateReferralLink(referralCode) {
        return `https://t.me/${this.botUsername}?start=${referralCode}`;
    }

    generateWebAppLink() {
        return `https://t.me/${this.botUsername}/app`;
    }
}

// Export for use in other scripts
window.TelegramBot = TelegramBot;

// Initialize bot instance
window.telegramBot = new TelegramBot();
