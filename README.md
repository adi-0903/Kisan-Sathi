# KisanSaathi 🌾

KisanSaathi is a comprehensive, modern agricultural companion application built to empower farmers with tools to manage crops, record dairy activities, view weather forecasts with AI-powered spray recommendations, track farm expenses, and export farm statements into PDFs.

## ✨ Key Features

- **Crop Management:** Track active crops, field areas, sown dates, expected yield, and maintain a historical activity diary (sowing, chemical applications, harvesting).
- **Dairy Management:** Manage cattle herds, breeds, milk production estimates, and status (Dry/Milking).
- **AI Spray Recommendations & Assistant:** Get context-aware, Gemini-powered advice on spraying pesticides/fertilizers directly based on the current OpenWeather data and 5-day forecast.
- **Disease Detection:** Use device cameras or upload images to detect crop diseases and receive treatment remedies using powerful on-demand AI models.
- **Task Management:** Manage farm to-dos, keep track of completed activities.
- **Data Analytics & Reports:** Visually track data using beautiful interactive charts, and export PDF statements detailing expenses, monthly milk yields, and farm activities.
- **Offline-First Persistence:** Automatically syncs farm logs using internal persistent stores (`idb-keyval`) directly to the user's client storage.
- **Multi-language Support:** Accessible in multiple languages including English, Hindi, and Punjabi, to provide localized ease of access.

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS (v4) with accessible component structures
- **Icons & Graphics:** Lucide React icons & Recharts 
- **State & Storage:** Custom `useSyncState` hook combining `idb-keyval` to handle client-side database persistence reliably.
- **Localization:** `i18next` & `react-i18next`
- **Backend / Delivery:** Express server serving APIs and bundling the React SPA.
- **AI Integration:** `@google/genai` (Google Gen AI SDK) for Server-side prompt resolution.
- **PDF Generation:** `jspdf` and `jspdf-autotable`.

## 🚀 Getting Started

### Prerequisites

Ensure you have Node.js installed in your environment.

You need to provide your own API keys for the services to function properly. See `.env.example` in the root folder.
Create a local `.env` file and add the following keys:

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

3. **Build for Production**
   Compiles the frontend SPA and backend TypeScript server into standalone optimized assets.
   ```bash
   npm run build
   npm start
   ```

## 🏗️ Project Structure

The project relies on a monolithic separation of Express APIs and a Vite React app frontend:
- `/server.ts` - Edge entry point handling Gemini completion requests, weather data API proxying, and serving static React build files.
- `/src/main.tsx` - App entry point injecting `react-router-dom` definitions. 
- `/src/screens/` - Distinct views of the application (`HomeScreen`, `CropsScreen`, `DairyScreen`, `WeatherScreen`, `ReportsScreen`, `AIScreen`, etc.)
- `/src/lib/` - Shared business logic and custom React hooks natively persisting user inputs offline.

## 📄 License

This project is open-source and intended to be used as a reference for modern frontend and agricultural-based full-stack applications.
