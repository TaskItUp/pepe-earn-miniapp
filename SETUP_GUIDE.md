# Complete Setup Guide for Pepe Earn Telegram Mini App

## Overview
This guide will walk you through setting up and deploying your Pepe Earn Telegram Mini App from start to finish.

## Step 1: Firebase Setup

### 1.1 Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `peperewardbot` (or your preferred name)
4. Disable Google Analytics (not needed)
5. Click "Create project"

### 1.2 Enable Firestore Database
1. In your Firebase project, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (we'll update rules later)
4. Select your preferred region (closest to your users)
5. Click "Create"

### 1.3 Set Up Security Rules
1. Go to "Firestore Database" > "Rules"
2. Copy the contents of `firestore.rules` from this project
3. Paste and publish the rules

### 1.4 Get Configuration Keys
1. Go to "Project Settings" > "General"
2. Scroll to "Your apps" section
3. Click the web app icon (</>)
4. Register your app with name "Pepe Earn"
5. Copy the configuration values:
   - `apiKey`
   - `projectId` 
   - `appId`

## Step 2: Telegram Bot Setup

### 2.1 Create Your Bot
1. Open Telegram and search for @BotFather
2. Send `/newbot`
3. Choose a name: `Pepe Reward Bot`
4. Choose a username: `peperewardbot` (must end with 'bot')
5. Save the bot token you receive

### 2.2 Create Telegram Channel
1. Create a new Telegram channel for bonus tasks
2. Make it public with username: `peperewardchannel`
3. Add your bot as an admin to the channel

### 2.3 Configure Mini App
1. Send `/newapp` to @BotFather
2. Select your bot
3. Enter app name: `Pepe Earn`
4. Enter description: `Earn Pepe tokens by watching ads and completing tasks`
5. Upload app icon (512x512 PNG)
6. Enter your web app URL (will be provided after deployment)

## Step 3: GitHub Setup for Deployment

### 3.1 Create GitHub Repository
1. Create a new repository on GitHub
2. Name it `pepe-earn-miniapp`
3. Make it public
4. Clone this project files to your repository

### 3.2 Set Up GitHub Secrets
1. Go to your repository > Settings > Secrets and variables > Actions
2. Add the following secrets:
   - `VITE_FIREBASE_API_KEY`: (from Firebase config)
   - `VITE_FIREBASE_PROJECT_ID`: (from Firebase config)
   - `VITE_FIREBASE_APP_ID`: (from Firebase config)

### 3.3 Create GitHub Actions Workflow
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Configure environment
        run: |
          node deploy.js
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
          
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
```

### 3.4 Enable GitHub Pages
1. Go to repository Settings > Pages
2. Select "Deploy from a branch"
3. Choose "gh-pages" branch
4. Save settings

## Step 4: Configuration Updates

### 4.1 Update Bot and Channel Names
In the deployed code, make sure these match your actual:
- Bot username: `peperewardbot`
- Channel username: `peperewardchannel`

### 4.2 Configure Mini App URL
1. After deployment, your app will be at: `https://yourusername.github.io/pepe-earn-miniapp`
2. Go back to @BotFather
3. Send `/myapps`
4. Select your app
5. Edit settings and set the Web App URL

## Step 5: Testing and Launch

### 5.1 Test the App
1. Open your bot in Telegram
2. Try the Mini App
3. Test all features:
   - Balance display
   - Ad watching
   - Channel joining bonus
   - Referral system
   - Withdrawal requests

### 5.2 Set Up Admin Panel (Optional)
For managing withdrawals, you can:
1. Create an admin panel
2. Use Firebase Admin SDK
3. Monitor withdrawal requests
4. Update withdrawal status from "pending" to "completed"

## Step 6: Maintenance

### 6.1 Monitor Users
- Check Firebase console for user data
- Monitor withdrawal requests
- Track app usage statistics

### 6.2 Update Content
- Change ad rewards if needed
- Update channel links
- Modify referral commission rates

## Security Notes

- Never share your bot token publicly
- Keep Firebase API keys secure
- Regularly review Firestore security rules
- Monitor for suspicious activity

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify Firebase connection
3. Test bot commands in Telegram
4. Check GitHub Actions deployment logs

Your Pepe Earn Mini App is now ready to launch! 🚀