# 📱 BuildVerse Mobile App (React Native Setup Guide)

Welcome to the **BuildVerse Mobile App** built with **React Native (Expo SDK 57)**. This guide will help you set up, run, and test the mobile app on your physical mobile phone via **Expo Go**.

---

## 🌟 Overview
The React Native mobile app brings full feature parity with the BuildVerse platform:
1. **Dynamic Light & Dark Theme Mode**: High-contrast glassmorphic design system with real-time theme switching.
2. **Project CRUD & Task Tracker**: Create, view, complete, and delete projects with priority management (`HIGH`, `MEDIUM`, `LOW`).
3. **Team Invites & Group Channels**: Multi-select member invitation system with auto team group chats.
4. **Community Hub & Messaging**: Real-time channels, WhatsApp-style messaging, and topic discussions.
5. **PDF Certificate Diploma Generator**: Downloadable completion diplomas.
6. **Authentication & Live Sync**: Interactive auth with live MongoDB backend sync and offline fallback mode.

---

## ⚡ Quick Start: Running on your Mobile Phone (Expo Go SDK 57)

### 1. Prerequisites
- Install the **Expo Go** app from Google Play Store (Android) or App Store (iOS) on your phone.

### 2. Navigate to Mobile Directory & Install Dependencies
```bash
cd mobile
npm install
```

### 3. Start Expo Dev Server
```bash
npm start
```
*Tip: If your phone and PC are on different Wi-Fi networks or behind a firewall, run with tunnel:*
```bash
npm run tunnel
# or: npx expo start --tunnel
```

### 4. Connect with Expo Go on your Phone
- **Android**: Open the **Expo Go** app on your phone and scan the QR code displayed in your terminal.
- **iOS**: Open the native **Camera** app and tap the Expo notification prompt to open in Expo Go.
- **Web**: Press **`w`** in the terminal to view in your browser.