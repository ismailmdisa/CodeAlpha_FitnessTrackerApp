# ⚡ KINETIC — CodeAlpha Fitness Tracker App
### Task 3: Mobile & Web Fitness Tracking Application | CodeAlpha Internship

[![CodeAlpha Internship](https://img.shields.io/badge/CodeAlpha-App%20Development%20Internship-586400?style=for-the-badge&logo=codeforces&logoColor=white)](https://www.codealpha.tech/)
[![React Native](https://img.shields.io/badge/React_Native-0.76.7-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-52.0-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![SQLite](https://img.shields.io/badge/SQLite-Local_Engine-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)

---

## 📌 Project Overview
**KINETIC** is an editorial-grade, cross-platform fitness tracking application designed and built for the **CodeAlpha App Development Internship (Task 3)**. It provides athletes and daily movers with a responsive, offline-first health tracking companion powered by a local **SQLite** database, real-time reactive aggregations, dynamic SVG charting, and an interactive workout companion.

---

## 🎯 CodeAlpha Task 3 Requirements Matrix

| Requirement from CodeAlpha Instruction | Implementation in KINETIC | Status |
| :--- | :--- | :---: |
| **Track daily fitness activities** (steps, workouts, calories) | Tri-ring activity tracker, daily step counters, real-time calorie calculation | ✅ Implemented |
| **Add / Log fitness data manually** | "Add Activity" modal with activity chips, validation, and auto-burn helper | ✅ Implemented |
| **Dashboard / Summary screen** | Daily & weekly progress overview, streak tracker, live feeds, rings | ✅ Implemented |
| **Clean & User-friendly UI with graphs/bars** | Bézier continuous SVG wave chart, capsule bars, and animated counters | ✅ Implemented |
| **Local storage using SQLite** | `expo-sqlite` local database engine with automated schema & zero-flicker sync | ✅ Implemented |

---

## 🌟 Key Features

### 1. 📊 Radiant Performance Dashboard
- **Concentric Activity Rings**: Visual progress tracking for Energy Burn (Calories), Exercise Time, and Movement.
- **Pedometer Metric Card**: Real-time progress bar displaying current steps against dynamic daily targets.
- **Interactive Daily Streaks**: Consecutive activity streak calculation (`🔥 4 Days Active`) with celebration modal.
- **Live Activity Log**: Immediate feed of logged workouts with inline edit and delete capabilities.

### 2. 📝 Manual Activity Logging & Validation
- **Activity Categories**: Running, Walking, Gym / Weightlifting, Cycling, and Custom routines.
- **Instant Auto-Calculation**: Smart estimation of calories and steps based on duration and intensity.
- **Strict Data Validation**: Blocks negative values, prevents future-dated logs, and ensures database integrity.

### 3. 📈 Interactive Analytics & Bézier Wave Chart
- **Smooth Bézier Curve Graph**: Interactive SVG area chart mapping workout trends across time.
- **View Toggle**: Instantly switch between Continuous Wave (`📈`) and Capsule Bars (`📊`).
- **Interactive Data Nodes**: Tap any day or node to inspect calories burned and duration details.
- **Compact 2x2 Performance Matrix**: Lifetime metrics for Energy Burn, Total Distance, Active Minutes, and Workout Sessions.

### 4. 🏋️‍♂️ Guided Workout Routines Engine
- **Curated Circuits**: Cardio Shred, Upper Body Hypertrophy, Core Stability, and Mobility flows.
- **Interactive Session Runner**: Active countdown timer, exercise progression, rep counter, and completion screen.
- **Automatic Logging**: Finishing a routine automatically records the actual session time and calories into SQLite!

### 5. 👤 Professional Athlete Profile & Biometrics
- **Persistent Profile Picture**: Dual-mode upload (HTML file reader on Web + `expo-image-picker` on mobile) with instant synchronous hydration across page refreshes.
- **Physical Biometrics**: Live BMI calculator, body fat estimation, height, and weight management.
- **Data Portability**: One-click JSON data export for complete user activity records.

---

## 🗄️ Database Architecture (SQLite)

The app utilizes a local-first SQLite database schema structured as follows:

```sql
-- 1. Activities Table
CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  steps INTEGER NOT NULL,
  calories_burned INTEGER NOT NULL,
  timestamp INTEGER NOT NULL
);

-- 2. Daily User Goals Table
CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY,
  step_target INTEGER NOT NULL,
  calorie_target INTEGER NOT NULL,
  active_minutes_target INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- 3. User Profile & Biometrics Table
CREATE TABLE IF NOT EXISTS profile (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  avatar_uri TEXT,
  weight_kg REAL NOT NULL,
  height_cm REAL NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL,
  member_tier TEXT NOT NULL
);
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo Go](https://expo.dev/go) app installed on your Android or iOS device (optional for mobile testing)

### Installation
1. Clone the repository:
```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/CodeAlpha_FitnessTrackerApp.git
cd CodeAlpha_FitnessTrackerApp
```

2. Install dependencies:
```bash
npm install
```

3. Run the automated database cycle test:
```bash
npm run test:db
```
*Outputs 100% verification for schema creation, input validation, add/edit/delete operations, and streak queries.*

4. Start the application:
```bash
# Start Metro bundler:
npx expo start

# Open in Web Browser directly:
npx expo start --web
```
- Press `w` in the terminal to view in your web browser (`http://localhost:8081`).
- Scan the displayed QR code with the **Expo Go** mobile app to run it live on your physical Android or iOS device.

---

## 📱 Building the Android APK (Standalone)

To compile a standalone Android APK installer:
```bash
# 1. Install EAS CLI globally
npm install -g eas-cli

# 2. Login to your Expo account
eas login

# 3. Build the standalone preview APK
eas build -p android --profile preview
```

---

## 📂 Project Directory Structure

```
├── assets/                  # App icon, adaptive icon, splash screen, favicon
├── src/
│   ├── components/          # Reusable UI components (Header, BottomNav, InteractiveWaveChart, etc.)
│   ├── context/             # FitnessContext state management & reactive SQLite dispatchers
│   ├── database/            # SQLite schema, adapter, migration engine, and query API
│   ├── screens/             # Screen modules (HomeScreen, WorkoutsScreen, ProgressScreen, ProfileScreen)
│   ├── theme/               # Radiant Editorial Athleisure color palette and tokens
│   └── types/               # TypeScript interfaces and data models
├── test_db_cycle.js         # Automated end-to-end SQLite integration test suite
├── App.tsx                  # Root application frame and navigation container
├── app.json                 # Expo production configuration & Android/iOS bundle identifiers
├── package.json             # Dependencies and build scripts
└── README.md                # Project documentation
```

---

## 👨‍💻 Author & Internship Submission
- **Intern Name**: Md. Ismail Hossen
- **Internship Program**: App Development Internship
- **Organization**: [CodeAlpha](https://www.codealpha.tech/)
- **Task Assigned**: Task 3 — Fitness Tracker App
- **Repository Name**: `CodeAlpha_FitnessTrackerApp`
