<div align="center">
  <h1>🌾 KisanSaathi</h1>
  <p><b>The Complete Farm-to-Fork Ecosystem: Empowering Farmers, Nourishing Consumers</b></p>
  <br />
  
  [![React 19](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev)
  [![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com)
  [![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](#)
  [![Google Gemini](https://img.shields.io/badge/Gemini_2.5_Flash-8E75B2?style=flat-square&logo=google&logoColor=white)](#)
  [![TypeScript 5.8](https://img.shields.io/badge/TypeScript_5.8-007ACC?style=flat-square&logo=typescript&logoColor=white)](#)
  
</div>

---

Welcome to **KisanSaathi**, a next-generation Agritech platform serving as a dual-sided ecosystem. For **Farmers**, it offers deep, AI-driven agronomy tools, livestock management, and financial insights. For **Consumers**, it provides a transparent Direct-to-Consumer (D2C) marketplace to procure organic, fresh produce straight from the source.

By eliminating middlemen, KisanSaathi guarantees maximized agricultural yield via GenAI insights and maximized revenue via direct market access. Completely offline-capable, multilingual, and highly responsive.

## 🌟 Core Ecosystem

KisanSaathi is divided into two deeply integrated experiences. User roles are natively handled during authentication.

### 👨‍🌾 For Farmers (Agrifintech & Management)
- **Crop & Soil Diagnostics:** Comprehensive digital ledgers tracking crops, NPK soil health, and land area allocations.
- **AI Disease Detection:** Instantly diagnose plant diseases by simply capturing a photo. The platform leverages Google's Gemini Vision models to automatically assess leaf pathology and recommend exact countermeasures.
- **Livestock & Dairy Engine:** Digital tracking of herds, dairy milk yield analytics, and biological state logs.
- **Hyper-Local Intelligence:** Connected APIs fetching real-time weather layers, enabling **AI Spray Recommendations** so chemical applications are never washed out by unpredicted rains.
- **Logistics & Machinery Hub:** Need a tractor or transport? A robust dashboard to acquire or lease heavy machinery and request labor seamlessly.
- **Financial Intelligence:** Automatic, offline-first ledger generation for expenses, revenues, and automated PDF Month-End Report generation.
- **D2C Storefront Configurator:** List cultivated produce directly on the consumer market platform, defining stock quantities and per-kg pricing.

### 🍅 For Consumers (Direct-to-Consumer Marketplace)
- **Verified Farmer Directory:** Browse authentic, certified locational farmers natively. View their farm size, ratings, and operating locations.
- **Fresh Produce Marketplace:** A beautiful shopping experience featuring categorized fresh yields (Vegetables, Fruits, Dairy, Grains).
- **Subscription Engine:** Intelligent food-security subscriptions. Consumers unlock fixed-price supply lines.
  - **Free Tier:** 30 Days free, max 5 quintals.
  - **Monthly Plan:** Order up to 15 quintals of organic produce regularly.
  - **Yearly Plan:** Order up to 30 quintals throughout the year without supply chain markup.
- **Cart & Order Tracking:** End-to-end cart state management synchronizing live with Firebase Firestore. Track active orders intuitively.

---

## 🛠️ Technology Stack

We believe in a deeply optimized, unified full-stack architecture prioritizing performance and scale:

* **Frontend Engine:** React 19 + TypeScript (strict typing) powered by Vite.
* **Component Styling:** Tailwind CSS v4 featuring motion/react for 60-FPS layout transition and micro-interactions.
* **Database & Auth:** Firebase Auth and Cloud Firestore (providing NoSQL scalable cloud persistence with live snapshot subscriptions).
* **AI & Intelligence:** Google `@google/genai` natively mapping to Gemini Flash for fast conversational advisory and visual parsing.
* **Offline Mechanics:** Local-first methodology utilizing `idb-keyval` paired with custom reactive sync hooks for offline-resilience in low-bandwidth rural zones.
* **Backend Gateway:** Monolithic Express.js proxy ensuring AI API keys and external platform tokens are securely terminated server-side.

---

## 🎨 Visual Journey & UI/UX

KisanSaathi avoids generic default aesthetics, implementing intentional design constraints:
- **Responsive Layouts:** The core UI scales flawlessly from ultra-wide desktops to 300px width mobile screens utilizing Tailwind safe-area configurations.
- **Bento Grids & Micro-Interactions:** Modern dashboard structures (bento-grids) coupled with staggered fading mounting animations and elegant native Lucide icons.
- **Data Visualizations:** Recharts powers the dairy yield, soil nutrient, and financial dashboards delivering smooth SVGs without heavy dependencies.

---

## 🚀 Getting Started

### Local Development Requirements
Ensure you have Node.js (v20+) or Docker installed.

1. **Clone the Repository**
2. **Environment Configuration**  
   Create a `.env` in the project root containing your sensitive tokens:
   ```env
   # Mandatory for Gen-AI functionality
   GEMINI_API_KEY=your_gemini_key_here

   # Secondary Integrations (Weather and Market APIs)
   OPENWEATHER_API_KEY=your_open_weather_key
   DATAGOVIN_API_KEY=your_data_gov_key
   ```
   *(Ensure you have `firebase-applet-config.json` containing the Firebase SDK config mapped).*

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Launch Development Server**
   ```bash
   npm run dev
   ```
   *The Express edge server starts up and serves the Vite HMR application asynchronously at `http://localhost:3000`.*

### Building for Production
The solution bundles smoothly into standalone static JS via ESBuild and Vite. 
```bash
npm run build
npm start
```

### Containerization (Docker)
A production-ready `Dockerfile` is integrated. 
```bash
docker build -t kisan-saathi-app .
docker run -p 3000:3000 --env-file .env kisan-saathi-app
```

---

## 🛡️ Security & Architecture Flow

Instead of exposing tokens to the browser environment, KisanSaathi executes strict **Server-Side Rendering Proxies**:
1. React client detects intent (e.g. "Diagnose this crop image").
2. Client securely executes `fetch('/api/gemini/vision', ... )` towards the internal Express mount.
3. Express validates rate-limits, attaches the secretive `GEMINI_API_KEY`, executes the request to Google, and filters malicious payloads, ensuring maximum compliance and secure operation.

Firestore rules (`firestore.rules`) act as the absolute source of truth on the persistent layer, guaranteeing consumers can only read marketplace arrays, and farmers can only mutate their isolated agricultural sub-collections.

---

## 🤝 Contribution Guidelines
This ecosystem is actively developed to tackle immense infrastructural gaps in global farming chains.
1. Fork the repo and create your branch (`feature/SmartIrrigation`).
2. Utilize Semantic Commits.
3. Keep UI modifications mapped inside the strict Tailwind CSS standard configurations.
4. Pass the TypeScript Linter (`npm run lint`).
5. Open a Pull Request.

---

<p align="center">
  <i>Cultivated with love for the Agricultural Community.</i>
</p>
