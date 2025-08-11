# Overview

Pepe Earn is a Telegram Mini App that allows users to earn "PEPE" cryptocurrency by watching advertisements, completing tasks, and referring friends. The application features a gamified earning system with daily limits, bonus tasks for joining Telegram channels, a referral program with 10% commission, and a withdrawal system with a minimum threshold of 10,000 PEPE tokens.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Technology Stack**: Vanilla HTML5, CSS3, and JavaScript with no frameworks
- **UI/UX Design**: Gentle blue and white color scheme with gradient backgrounds and smooth animations
- **Component Structure**: Tab-based navigation system with four main sections (Home, Earn, Withdraw, Profile)
- **Responsive Design**: Mobile-first approach optimized for Telegram WebApp viewport
- **State Management**: Simple JavaScript object-based state management for user data and balances

## Backend Architecture
- **Database**: Firebase Firestore as the primary NoSQL database
- **Authentication**: Telegram WebApp authentication using user data from Telegram's initDataUnsafe
- **Real-time Updates**: Firestore listeners for live balance updates and withdrawal status changes
- **Data Models**: User profiles, transaction history, referral tracking, and daily task progress
- **Business Logic**: Client-side validation with server-side data integrity through Firestore security rules

## Core Features Implementation
- **Real Ad System**: Monetag SDK integration with zone 9696411 for real advertising revenue (40 ads per day, 250 PEPE each)
- **Manual Referral System**: 6-character code input system where users enter codes directly to get 300 PEPE bonus
- **10% Commission System**: Automatic referral commission on ALL earning activities (ads: 25 PEPE, bonus tasks: 30 PEPE)
- **Dual Referral Support**: Both URL-based (legacy) and manual code input systems work simultaneously
- **User Tracking**: Username and first name fields added to database for better identification
- **Bonus Tasks**: Telegram Bot API integration for channel membership verification
- **Withdrawal System**: Minimum threshold enforcement (10,000 PEPE) with pending/completed status tracking
- **Progress Tracking**: Real-time progress bars and statistics updates

## Security and Data Flow
- **Environment Variables**: Secure configuration management for Firebase credentials and Telegram bot tokens
- **Client-Side Validation**: Input validation and business rule enforcement in JavaScript
- **Database Security**: Firestore security rules for user data protection and transaction integrity
- **Error Handling**: Comprehensive try-catch blocks with fallback mechanisms for offline scenarios

## Hosting and Deployment
- **Static Hosting**: GitHub Pages for frontend deployment
- **Environment Configuration**: GitHub Secrets integration for secure credential management
- **Build Process**: Simple static file serving without build tools or bundlers

# External Dependencies

## Core Services
- **Firebase Firestore**: Primary database for user data, balances, transactions, and referral tracking
- **Telegram WebApp API**: User authentication and app integration within Telegram ecosystem
- **Telegram Bot API**: Channel membership verification and bot interactions
- **Bot Configuration**: @pepe_rewardbot (main bot), @taskupofficial (bonus channel)

## Frontend Libraries
- **Font Awesome 6.4.0**: Icon library for UI elements and visual enhancements
- **Firebase JavaScript SDK 10.12.2**: Client-side Firebase integration via CDN

## Third-party Integrations
- **Telegram Channel Integration**: Automated membership verification for bonus tasks
- **GitHub Pages**: Static web hosting platform for application deployment
- **Binance API** (Planned): User withdrawal processing through email/UID validation

## Development Tools
- **GitHub Secrets**: Secure environment variable management for production deployment
- **Browser APIs**: Local storage for temporary data and Telegram WebApp native features