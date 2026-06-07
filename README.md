# 🌾 KisanSaathi - The Ultimate Smart Farming Companion

Welcome to **KisanSaathi**, a comprehensive, offline-first, multilingual, and AI-powered agricultural companion application built to empower modern farmers. From real-time agronomy AI advice to livestock tracking, crop logistics, and financial reporting, KisanSaathi digitizes the entire farm-to-market lifecycle into a single incredibly optimized single-page application (SPA).

---

## ✨ Comprehensive Feature Suite

### 🌱 Agronomy & Farm Management
- **Crop Management:** Track active crops, land areas, sown dates, expected yield, and maintain a detailed, historical activity diary (sowing, chemical applications, harvesting).
- **Soil Health Tracker:** Input and visualize NPK (Nitrogen, Phosphorus, Potassium) values, pH levels, and receive data-driven recommendations to rejuvenate soil health.
- **Disease Detection:** Snap a photo or upload images of your distressed crops. The integrated Gemini AI Vision model will instantly diagnose diseases and suggest biological or chemical remedies.
- **Task Management & Scheduling:** A built-in To-Do tracker specifically tailored for farming ops (irrigation reminders, harvesting dates).

### 🐄 Livestock & Dairy
- **Dairy Logs:** Manage cattle herds, breed variants, daily milk production estimates, tagging, and biological status (Dry, Milking, Pregnant).
- **Yield Analytics:** View graphical charts corresponding to daily milk production.

### ⛈️ Hyper-Local Weather & AI Advisory
- **Real-time Forecasts:** Deep integration with local weather APIs mapping temperature, humidity, and rainfall.
- **AI Spray Recommendations:** Gemini models combine live weather data with current crop stages to issue hyper-adaptive "Spray Adisory" windows. It ensures pesticide application doesn't wash out in upcoming rains.

### 📈 Finance, Commercials & Logistics
- **Agri-Shop (E-commerce):** Browse and purchase high-quality farm inputs like seeds, bio-fertilizers, pesticides, and cattle feed directly in-app.
- **Market Prices:** Live connectivity to local Mandi updates mapping wholesale commodity pricing for informed selling decisions.
- **Transport & Logistics Booking:** A complete flow for booking secure truck/tractor transport to haul produce from farm boundaries straight to warehouses or APMC Mandis safely.
- **Finance & Inventory records:** Track granular expenses, operational income, and maintain stock registers for farm inputs (seeds, chemical inventories).
- **Reports Generation:** One-click automated PDF generation for month-end farm statements and dairy yields via `jspdf`.
- **Govt. Schemes Finder:** Dedicated module aggregating Indian central/state farming grants and PM-Kisan subsidies.

### 🌐 Scalable, Offline-First Architecture
- **No-Internet? No Problem:** Uses IndexedDB (`idb-keyval`) and Session/Local Storage state persistence ensuring farmers can log metrics deep in the field without cellular reception. Auto-rehydrates when re-opening the application.
- **Multilingual Support:** Implements native translations using `react-i18next` supporting regional languages (English, Hindi, Punjabi) out of the box dynamically mapping to the UI elements.
- **PWA Ready Interface:** Highly polished, mobile-first design leveraging responsive fluid layouts, safe-area bottom navs, dynamic FABs, and smooth route transitions via `motion/react`.
- **Theme Support:** Fully configurable toggle covering ambient Light/Dark/System visual themes.

---

## 🛠️ Technical Stack

- **Framework:** React 19, TypeScript, Express (API & Build Proxy)
- **Tooling:** Vite, ESBuild
- **Styling:** Tailwind CSS (v4)
- **State Management & Offline Storage:** Custom asynchronous React hook (`useSyncState`) coupled with `idb-keyval` for rapid JSON client-side storage bypassing latency.
- **Icons & Animations:** `lucide-react` for scalable SVGs and `motion/react` for buttery smooth component unmounting/mounting & transition logic.
- **Charts & Data Visualization:** `recharts` for robust and responsive interactive data graphs.
- **AI Engine:** `@google/genai` (Google's official Gen AI Native SDK) driving the Gemini Flash models behind chat, vision disease detection, and analytics.
- **PDF Generation:** `jspdf` and `jspdf-autotable`.

---

## 🚀 Getting Started

### Prerequisites

Ensure you have Node.js (v18 or higher) installed in your environment.

You need to provide your own API keys for the services to function properly. See `.env.example` in the root folder. Create a local `.env` file and add the following keys:

```env
OPENWEATHER_API_KEY=your_openweathermap_api_key_here
GEMINI_API_KEY=your_google_gemini_api_key_here
```

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   Start the development server which exposes both the Express backend and the Vite HMR.
   ```bash
   npm run dev
   ```
   > The application will automatically route requests mapping `/api` to the backend Express block while Vite manages hot module swapping on the frontend.

3. **Build Core & Run Production**
   Compiles the frontend SPA into static `/dist` and transpiles the monolithic `server.ts` into CommonJS format.
   ```bash
   npm run build
   npm start
   ```

---

## 🏗️ Project Architecture Breakdown

The project relies on a monolithic separation of Express APIs and a Vite React app frontend:
- `/server.ts` - Edge entry point. Serves static React build files in production, mounts Vite middleware in development, and securely hosts `/api` proxy routes terminating API keys out of client reach.
- `/src/App.tsx` - Root React container defining the standard `react-router-dom` definitions, context wrappers, splash screen mount points, and global layout bindings.
- `/src/screens/` - Modular, independent views of the application spanning `HomeScreen`, `ShopScreen`, `LogisticsScreen`, `AIScreen`, etc.
- `/src/lib/` - Shared business logic containing API abstractions, Context engines (`AuthContext`, `ThemeContext`), translation dictionaries, and persistence modules.
- `/src/components/` - Abstracted and shared UI snippets independent of screen context.

---

## 🛡️ Privacy & Data Ownership

KisanSaathi strongly aligns with modern data privacy paradigms. By operating predominantly *Offline-First*, critical operational farm data, yield logs, inventory numbers, and personal details (like verification sessions) are strictly retained within the device boundaries of the local browser. Unless explicitly querying the generative AI assistants or cloud APIs, sensitive financial logic completely avoids networked transmission. 

---

## 📄 License & Credits

This project is intended to be used as an open architectural reference for sophisticated, highly interconnected, offline-first agricultural and progressive web applications.
