import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

// Environment validation at startup
console.log("=== KisaniSaathi Server Startup ===");
const envVars = [
  { key: "GEMINI_API_KEY", required: true },
  { key: "OPENWEATHER_API_KEY", required: false },
  { key: "DATAGOVIN_API_KEY", required: false },
];

envVars.forEach(({ key, required }) => {
  const isSet = !!process.env[key];
  console.log(`| ${key.padEnd(25)} | ${isSet ? "✅ SET" : (required ? "❌ MISSING" : "⚠️ MISSING (Mock Fallback)")} |`);
  if (required && !isSet) {
    console.error(`\nCRITICAL: ${key} is required for full functionality, but missing.`);
  }
});
console.log("===================================\n");

// Types and helper functions for structured errors
const createErrorResponse = (message: string, code: string = "INTERNAL_SERVER_ERROR") => ({
  error: message,
  code,
  timestamp: new Date().toISOString()
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 1. Security Headers (Helmet)
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:", "https://*"],
        connectSrc: ["'self'", "https://api.anthropic.com", "https://generativelanguage.googleapis.com", "https://openweathermap.org", "https://api.openweathermap.org"],
        frameAncestors: ["*"],
      },
    },
    crossOriginEmbedderPolicy: false,
    xFrameOptions: false,
    crossOriginResourcePolicy: false,
  }));

  // 2. CORS configurations
  app.use(cors());

  // 3. Rate Limiters
  const aiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30, // 30 req/min per IP
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json(createErrorResponse("Too many requests. Please wait.", "TOO_MANY_REQUESTS"));
    }
  });

  const dataLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60, // 60 req/min per IP
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json(createErrorResponse("Too many requests. Please wait.", "TOO_MANY_REQUESTS"));
    }
  });

  // 4. Body parser
  app.use(express.json({ limit: "50mb" }));

  // Initialize Gemini
  let genAI: GoogleGenAI | null = null;
  const initGemini = () => {
    if (!genAI) {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY environment variable is required");
      }
      genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
    return genAI;
  };

  // Health endpoint
  app.get("/api/health", async (req, res) => {
    try {
      res.json({
        status: "ok",
        gemini: !!process.env.GEMINI_API_KEY,
        weather: !!process.env.OPENWEATHER_API_KEY,
        market: !!process.env.DATAGOVIN_API_KEY,
        uptime: Math.floor(process.uptime())
      });
    } catch (error: any) {
      console.error("Health API Error:", error.message || error);
      res.status(500).json(createErrorResponse("Health check failed.", "INTERNAL_SERVER_ERROR"));
    }
  });

  // Chat API
  app.post("/api/chat", aiLimiter, async (req, res) => {
    try {
      const ai = initGemini();
      let { prompt, language } = req.body;
      
      // Sanitization
      if (typeof prompt !== 'string' || !prompt.trim()) {
        res.status(400).json(createErrorResponse("Prompt must be a non-empty string.", "BAD_REQUEST"));
        return;
      }
      // Strip HTML
      prompt = prompt.replace(/<[^>]*>?/gm, '');
      prompt = prompt.trim();
      
      if (prompt.length > 2000) {
        res.status(400).json(createErrorResponse("Prompt exceeds the maximum length of 2000 characters.", "PAYLOAD_TOO_LARGE"));
        return;
      }

      const validLangs = ["English", "Hindi", "Punjabi"];
      if (!validLangs.includes(language)) {
        language = "English";
      }
      
      const systemPrompt = `You are KisanSaathi AI, a friendly agricultural assistant for Indian farmers. You help with crop advice, cattle health, weather interpretation, government schemes, and market prices. Always: 
1. Respond in the same language the farmer uses (Hindi, Punjabi, or English). The preferred language is currently: ${language}
2. Use simple, non-technical language a village farmer understands. 
3. Give practical, actionable advice specific to North India/Punjab. 
4. When recommending chemicals or medicines, mention generic names and suggest consulting a local agronomist or vet. 
5. Be warm, respectful, and encouraging. 
6. If you don't know something, say so honestly.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
        }
      });
      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Chat API Error:", error.message || error);
      res.status(500).json(createErrorResponse("Failed to process chat request.", "INTERNAL_SERVER_ERROR"));
    }
  });

  // Vision API
  app.post("/api/vision", aiLimiter, async (req, res) => {
    try {
      const ai = initGemini();
      let { imageBase64, language } = req.body;
      
      if (!imageBase64 || typeof imageBase64 !== 'string') {
        res.status(400).json(createErrorResponse("Image payload is missing or invalid.", "BAD_REQUEST"));
        return;
      }
      
      // Calculate byte size (roughly)
      // Remove data:...;base64, prefix if present
      const match = imageBase64.match(/^data:image\/(jpeg|png|webp);base64,(.*)$/);
      let mimeType = "image/jpeg";
      let base64Data = imageBase64;
      
      if (match) {
        mimeType = `image/${match[1]}`;
        base64Data = match[2];
      } else if (imageBase64.includes("data:")) {
        // Exists but not matching allowed types
        res.status(400).json(createErrorResponse("Invalid image. Only JPEG, PNG, WebP under 4MB are accepted.", "UNSUPPORTED_MEDIA_TYPE"));
        return;
      }

      const byteLength = (base64Data.length * 3) / 4 - (base64Data.match(/==?$/) ? base64Data.match(/==?$/)![0].length : 0);
      if (byteLength > 4 * 1024 * 1024) {
        res.status(400).json(createErrorResponse("Invalid image. Only JPEG, PNG, WebP under 4MB are accepted.", "PAYLOAD_TOO_LARGE"));
        return;
      }
      
      const systemPrompt = `You are an agricultural expert. Analyse this crop image.
Identify: 1) Crop type 2) Disease or pest if any 3) Severity (mild/moderate/severe) 4) Recommended treatment in simple language.
Respond in JSON format: { "crop": "name", "disease": "name or none", "severity": "mild/moderate/severe/none", "treatment": "treatment steps", "prevention": "prevention tips" }. Output the values in ${language || 'English'}.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          },
          systemPrompt
        ],
        config: {
          responseMimeType: "application/json",
        }
      });
      
      let parsed = {};
      try {
        parsed = JSON.parse(response.text || '{}');
      } catch (e) {
        parsed = { error: "Failed to parse JSON representation from model." };
      }
      res.json(parsed);

    } catch (error: any) {
      console.error("Vision API Error:", error.message || error);
      res.status(500).json(createErrorResponse("Failed to process vision request.", "INTERNAL_SERVER_ERROR"));
    }
  });

  // Weather api
  app.get("/api/weather", dataLimiter, async (req, res) => {
    try {
      const apiKey = process.env.OPENWEATHER_API_KEY;
      const lat = req.query.lat || "30.9010"; // Ludhiana, Punjab
      const lon = req.query.lon || "75.8573";
      
      if (!apiKey) {
        // Fallback
        return res.json({
          temp: 32,
          humidity: 45,
          windSpeed: 12,
          rainProb: 10,
          uvIndex: 5,
          sprayWindow: true,
          condition: "Sunny",
          forecast: [
            { day: "Mon", date: "2026-06-05", temp: 32, main: "Clear", condition: "Sunny", description: "clear sky", windSpeed: 12, rainProb: 10, icon: "01d" },
          ]
        });
      }

      const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
      if (!response.ok) {
         res.status(response.status).json(createErrorResponse(`Weather API Error: ${response.statusText}`, "BAD_GATEWAY"));
         return;
      }
      
      const data = await response.json();
      
      const dailyData: any[] = [];
      const seenDays = new Set();
      
      // Generate IST formatted dates mapping
      const toIST = (dateObj: Date) => {
        return new Date(dateObj.getTime() + (5.5 * 60 * 60 * 1000));
      };

      for (const item of data.list) {
        const istDate = toIST(new Date(item.dt * 1000));
        const dayStr = istDate.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
        const dateStr = istDate.toLocaleDateString('en-US', { timeZone: 'UTC' });
        
        if (!seenDays.has(dateStr)) {
          seenDays.add(dateStr);
          dailyData.push({
            day: dayStr,
            date: dateStr,
            temp: Math.round(item.main.temp),
            main: item.weather[0].main,
            condition: item.weather[0].main,
            description: item.weather[0].description,
            windSpeed: Math.round(item.wind.speed * 3.6), 
            rainProb: Math.round(item.pop * 100), 
            icon: item.weather[0].icon
          });
        }
      }

      const currentTemp = Math.round(data.list[0].main.temp);
      const currentWind = Math.round(data.list[0].wind.speed * 3.6);
      const currentRainProb = Math.round(data.list[0].pop * 100);
      const isSprayWindow = currentWind < 15 && currentRainProb < 30 && currentTemp >= 15 && currentTemp <= 35;

      res.json({
        temp: currentTemp,
        humidity: data.list[0].main.humidity,
        windSpeed: currentWind,
        rainProb: currentRainProb,
        uvIndex: 0, // Mocked as openweather free doesn't give precise UV via forecast
        sprayWindow: isSprayWindow,
        condition: data.list[0].weather[0].main,
        forecast: dailyData
      });
      
    } catch (error: any) {
      console.error("Weather API Error:", error.message || error);
      res.status(500).json(createErrorResponse("Failed to fetch weather data.", "INTERNAL_SERVER_ERROR"));
    }
  });

  app.post("/api/weather/spray-recommendation", dataLimiter, async (req, res) => {
    try {
      const { forecastData } = req.body;
      
      let ai;
      try {
        ai = initGemini();
      } catch (e) {
      }

      if (ai) {
        const systemPrompt = `You are an expert AI agronomist analyzing weather data. 
Given the following weather forecast, determine if the next few days are suitable for spraying pesticide.
Consider:
- High wind speed (>15 km/h) causes spray drift.
- High rain probability (>30%) washes away chemicals.
- Extreme temperatures are generally poor.
Respond in JSON format: { "recommendation": "Spray Now / Wait", "reasoning": "Simple, short reasoning.", "isGood": true }.`;

        try {
          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
              systemPrompt,
              "Forecast: " + JSON.stringify(forecastData)
            ],
            config: { responseMimeType: "application/json" }
          });
          
          res.json(JSON.parse(response.text || '{}'));
          return;
        } catch (geminiError: any) {
        }
      }

      const firstDay = forecastData && forecastData.length > 0 ? forecastData[0] : null;
      let isGood = true;
      let reasoning = "Conditions look acceptable for spraying.";
      
      if (firstDay) {
         if (firstDay.windSpeed > 15 && firstDay.rainProb > 30) {
            isGood = false;
            reasoning = "High winds and rain risk make spraying unsafe.";
         } else if (firstDay.windSpeed > 15) {
           isGood = false;
           reasoning = "High winds may cause spray drift.";
         } else if (firstDay.rainProb > 30) {
           isGood = false;
           reasoning = "High probability of rain could wash away spray.";
         } else if (firstDay.temp < 15 || firstDay.temp > 35) {
           isGood = false;
           reasoning = "Temperature is outside the optimal range for spraying.";
         }
      }
      res.json({
        recommendation: isGood ? "Spray Now" : "Wait",
        reasoning: reasoning,
        isGood: isGood
      });
      
    } catch (error: any) {
      console.error("Spray recommendation exception:", error.message || error);
      res.status(500).json(createErrorResponse("Failed to generate recommendation", "INTERNAL_SERVER_ERROR"));
    }
  });

  const marketCache = {
     data: null as any,
     timestamp: 0
  };
  const yesterdayMarketData = new Map<string, number>();

  // Market prices api
  app.get("/api/market", dataLimiter, async (req, res) => {
    try {
      const apiKey = process.env.DATAGOVIN_API_KEY;
      if (!apiKey) {
         console.warn("DATAGOVIN_API_KEY missing - returning mock market prices.");
         return res.json([
            { crop: "Wheat", today: 2275, yesterday: 2250, change: 1.1, mandi: "Khanna" },
            { crop: "Rice (Paddy)", today: 2203, yesterday: 2203, change: 0, mandi: "Ludhiana" },
            { crop: "Maize", today: 2090, yesterday: 2110, change: -0.9, mandi: "Jalandhar" },
            { crop: "Potato", today: 850, yesterday: 830, change: 2.4, mandi: "Amritsar" },
            { crop: "Mustard", today: 5650, yesterday: 5600, change: 0.9, mandi: "Patiala" },
            { crop: "Cotton", today: 6620, yesterday: 6700, change: -1.2, mandi: "Bathinda" },
          ]);
      }

      // 30 min cache
      const now = Date.now();
      if (marketCache.data && (now - marketCache.timestamp < 30 * 60 * 1000)) {
         return res.json(marketCache.data);
      }

      // Fetch from API
      const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&limit=20&filters[state.keyword]=Punjab`;
      const response = await fetch(url);
      
      if (!response.ok) {
         res.status(response.status).json(createErrorResponse(`Market API Error: ${response.statusText}`, "BAD_GATEWAY"));
         return;
      }
      
      const parsedData = await response.json();
      if (parsedData && parsedData.records) {
        
        let resetYesterdayMap = false;
        // Basic daily reset logic placeholder: simply keep map populated

        const formatted = parsedData.records.map((r: any) => {
          const crop = r.commodity || "Unknown";
          const market = r.market || "Unknown";
          const currentPrice = Number(r.modal_price) || 0;
          const mapKey = `${crop}_${market}`;
          
          let yesterdayPrice = yesterdayMarketData.get(mapKey);
          if (!yesterdayPrice) {
            yesterdayPrice = currentPrice; 
            yesterdayMarketData.set(mapKey, currentPrice);
          }
          
          let change = 0;
          if (yesterdayPrice > 0) {
             change = Number((((currentPrice - yesterdayPrice) / yesterdayPrice) * 100).toFixed(2));
          }

          // Update yesterday map for future runs if it's a new day
          yesterdayMarketData.set(mapKey, currentPrice);

          return {
            crop,
            today: currentPrice,
            yesterday: yesterdayPrice,
            change: change,
            mandi: market
          };
        });

        marketCache.data = formatted;
        marketCache.timestamp = now;
        res.json(formatted);
      } else {
        res.json([]);
      }
    } catch (error: any) {
      console.error("Mandi API Error:", error.message || error);
      res.status(500).json(createErrorResponse("Failed to fetch Mandi prices", "INTERNAL_SERVER_ERROR"));
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
