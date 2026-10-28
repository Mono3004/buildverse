# 🌐 BuildVerse — High-Craft Developer Platform & Mobile App

**BuildVerse** is a modern, high-craft platform designed for developers, engineering students, and mentors. It features a **TanStack Start + Vite Web Platform** (with an Admin Console) and a **React Native (Expo SDK 57) Mobile Application** housing dedicated **Student** and **Mentor** modules.

---

## 🏛️ Platform Architecture (3 Core Modules)

```
┌────────────────────────────────────────────────────────────────────────┐
│                              BUILDVERSE                                │
├───────────────────────────────┬────────────────────────────────────────┤
│     📱 EXPO MOBILE APP        │           💻 WEB PLATFORM              │
│    (Expo SDK 57 • RN 0.86)    │      (TanStack Start • Vite • React 19)│
├───────────────────────────────┼────────────────────────────────────────┤
│ 🎓 Student Module:            │ 👑 Admin Console (/admin):             │
│   • Academy Courses & Videos  │   • System Telemetry & Cluster Health  │
│   • Interactive Lesson Ticker │   • User Roles & Permissions           │
│   • Verified Diplomas (PDF)   │   • Course Moderation & Curriculums    │
│   • Developer Portfolio & GPA │   • Platform-Wide Issue Diagnostics    │
│                               │                                        │
│ 👨‍🏫 Mentor Module:             │ 🎓 Student Dashboard (/dashboard)     │
│   • Telemetry & KPI Cards     │ 👨‍🏫 Mentor Telemetry (/mentor)         │
│   • Mentee Progress Tracking  │ 🚀 Team Projects & Repo Audits         │
│   • PR Code Review Queue      │                                        │
│   • Masterclass Authoring     │                                        │
│                               │                                        │
│ 🔄 Dynamic Role Switcher:     │                                        │
│   • 1-Tap Toggle at Top Bar   │                                        │
└───────────────────────────────┴────────────────────────────────────────┘
```

---

## ⚡ Quick Start: Running Web & Mobile Together

### Option A: Run Both Simultaneously (Recommended)
From the root directory (`d:\Builverse-main`), run:
```bash
npm run dev:all
```
This starts both:
- **`[WEB]`**: Vite server on [http://localhost:8080/](http://localhost:8080/)
- **`[APP]`**: Expo Metro bundler on port `8081` with the QR code.

---

### Option B: Two Separate Terminals

#### Terminal 1 — Web Application (Admin & Web Platform)
```bash
cd D:\Builverse-main
npm run dev
```
> Open [http://localhost:8080/](http://localhost:8080/) in your browser.
> - Access Admin Console at: [http://localhost:8080/admin](http://localhost:8080/admin)
> - Access Mentor Workspace at: [http://localhost:8080/mentor](http://localhost:8080/mentor)
> - Access Student Dashboard at: [http://localhost:8080/dashboard](http://localhost:8080/dashboard)

#### Terminal 2 — Mobile Application (Student & Mentor)
```bash
cd D:\Builverse-main\mobile
npx expo start -c
```
> Scan the QR code using **Expo Go** on your Android or iOS device (ensure phone and PC are on the same Wi-Fi).

---

## ✨ Mobile App Highlights (Expo SDK 57)

- 🔄 **Live Role Switcher Pill**:
  - Always visible at the top bar: tap `Student` or `Mentor` to switch modes instantly.
  - Automatically reconfigures the bottom navigation bar and active dashboard.
- 🎓 **Student Module (`mobile/src/screens/student/`)**:
  - **Academy Masterclasses**: Video lectures, level filters (`Core`, `Advanced`, `New`), and search.
  - **Interactive Lesson Tracker**: Check off lessons in real time with dynamic course progress calculation.
  - **Verified Certificate Diplomas**: Cryptographically signed diplomas (BV-CERT-xxxx) with gold seals and credential verification.
  - **Developer Portfolio**: GPA tracking, earned credits, verified skill chips, and featured projects.
- 👨‍🏫 **Mentor Module (`mobile/src/screens/mentor/`)**:
  - **Command Center Telemetry**: 4 KPI cards (Assigned Mentees, Pending PRs, Live Workshops, 4.9 Rating).
  - **Code Review Queue**: Real-time student PR review cards with branch names and 1-tap `Approve PR ✓` mutations.
  - **Assigned Mentees Roster**: Student milestone progress bars, active statuses, and direct chat actions.
  - **Masterclass Creator**: Form modal to author and publish new courses.
- 💬 **Shared Real-Time Hub (`mobile/src/screens/ChatScreen.js`)**:
  - Direct student-to-mentor messaging and developer community channels.

---

## 📁 Repository Structure

```
├── mobile/                        # React Native Mobile App (Expo SDK 57)
│   ├── src/
│   │   ├── components/            # RoleSwitcherHeader, CertificateModal, GlassCard
│   │   ├── context/               # UserRoleContext (Student ⇄ Mentor role engine)
│   │   ├── lib/                   # workspaceData (In-memory reactive course & review store)
│   │   ├── navigation/            # AppNavigator (Dynamic role-based tab navigator)
│   │   ├── screens/
│   │   │   ├── student/           # StudentCoursesScreen, StudentPortfolioScreen
│   │   │   ├── mentor/            # MentorOverviewScreen, MentorMenteesScreen, MentorCoursesScreen
│   │   │   ├── HomeScreen.js      # Student Workspace Dashboard
│   │   │   ├── LoginScreen.js     # 1-Tap Module Selector (Enter as Student / Mentor)
│   │   │   ├── ProjectsScreen.js  # Project Hub & Team Collaborations
│   │   │   └── ChatScreen.js      # Direct & Group Messaging
│   │   └── theme/                 # Dark/Light theme design tokens
├── src/                           # TanStack Start Web Platform
│   ├── admin/                     # Admin Console (Overview, Users, Courses, Projects, Issues)
│   ├── mentor/                    # Mentor Layout & Telemetry (Web)
│   ├── routes/                    # Web Application Routes
│   │   └── _authenticated/        # Dashboard, Courses, Portfolio, Projects, Chat
│   └── components/                # Web UI Primitives, AppShell, Navigation
└── package.json                   # Root configuration & dev:all multi-runner
```

---

## 🔒 License
Private / Proprietary — BuildVerse Platform.
