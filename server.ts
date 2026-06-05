import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

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

  // Chat/Text API
  app.post("/api/chat", async (req, res) => {
    try {
      const ai = initGemini();
      const { prompt, language } = req.body;
      
      const systemPrompt = `You are KisanSaathi AI, a friendly agricultural assistant for Indian farmers. You help with crop advice, cattle health, weather interpretation, government schemes, and market prices. Always: 
1. Respond in the same language the farmer uses (Hindi, Punjabi, or English). The preferred language is currently: ${language || 'English'}
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
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vision API for crop disease detection
  app.post("/api/vision", async (req, res) => {
    try {
      const ai = initGemini();
      const { imageBase64, language } = req.body;
      
      const systemPrompt = `You are an agricultural expert. Analyse this crop image.
Identify: 1) Crop type 2) Disease or pest if any 3) Severity (mild/moderate/severe) 4) Recommended treatment in simple language.
Respond in JSON format: { "crop": "name", "disease": "name or none", "severity": "mild/moderate/severe/none", "treatment": "treatment steps", "prevention": "prevention tips" }. Output the values in ${language || 'English'}.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            inlineData: {
              data: imageBase64.split(",")[1] || imageBase64,
              mimeType: "image/jpeg"
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
        // Handle malformed JSON
        parsed = { error: "Failed to parse JSON", raw: response.text };
      }
      res.json(parsed);

    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  // Weather api using OpenWeatherMap
  app.get("/api/weather", async (req, res) => {
    try {
      const apiKey = process.env.OPENWEATHER_API_KEY;
      const lat = req.query.lat || "30.9010"; // Ludhiana, Punjab
      const lon = req.query.lon || "75.8573";
      
      if (!apiKey) {
        console.warn("OPENWEATHER_API_KEY is missing. Using mock weather data.");
        return res.json({
          temp: 32,
          humidity: 45,
          windSpeed: 12,
          rainProb: 10,
          condition: "Sunny",
          forecast: [
            { day: "Mon", date: "2026-06-05", temp: 32, main: "Clear", condition: "Sunny", description: "clear sky", windSpeed: 12, rainProb: 10, icon: "01d" },
            { day: "Tue", date: "2026-06-06", temp: 33, main: "Clouds", condition: "Cloudy", description: "few clouds", windSpeed: 15, rainProb: 20, icon: "02d" },
            { day: "Wed", date: "2026-06-07", temp: 31, main: "Rain", condition: "Rain", description: "light rain", windSpeed: 20, rainProb: 80, icon: "10d" },
            { day: "Thu", date: "2026-06-08", temp: 29, main: "Rain", condition: "Rain", description: "moderate rain", windSpeed: 25, rainProb: 60, icon: "10d" },
            { day: "Fri", date: "2026-06-09", temp: 30, main: "Clear", condition: "Sunny", description: "clear sky", windSpeed: 10, rainProb: 5, icon: "01d" },
          ]
        });
      }

      // Fetch 5-day / 3-hour forecast from OpenWeatherMap Free API
      const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenWeather API Error: ${errorData.message || response.statusText}`);
      }
      
      const data = await response.json();
      
      // Process data into daily forecast (approx 5 days)
      const dailyData: any[] = [];
      const seenDays = new Set();
      
      for (const item of data.list) {
        const dateObj = new Date(item.dt * 1000);
        const dayStr = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
        const dateStr = dateObj.toLocaleDateString('en-US');
        
        if (!seenDays.has(dateStr)) {
          seenDays.add(dateStr);
          dailyData.push({
            day: dayStr,
            date: dateStr,
            temp: Math.round(item.main.temp),
            main: item.weather[0].main,
            condition: item.weather[0].main,
            description: item.weather[0].description,
            windSpeed: Math.round(item.wind.speed * 3.6), // Convert m/s to km/h
            rainProb: Math.round(item.pop * 100), // Probability of precipitation
            icon: item.weather[0].icon
          });
        }
      }

      res.json({
        temp: Math.round(data.list[0].main.temp),
        humidity: data.list[0].main.humidity,
        windSpeed: Math.round(data.list[0].wind.speed * 3.6),
        rainProb: Math.round(data.list[0].pop * 100),
        condition: data.list[0].weather[0].main,
        forecast: dailyData
      });
      
    } catch (error: any) {
      console.error("Weather API Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // AI-Driven Spray Recommendation API
  app.post("/api/weather/spray-recommendation", async (req, res) => {
    try {
      const { forecastData } = req.body;
      
      let ai;
      try {
        ai = initGemini();
      } catch (e) {
        // API key missing, proceed to fallback
      }

      if (ai) {
        const systemPrompt = `You are an expert AI agronomist analyzing weather data. 
Given the following weather forecast, determine if the next few days are suitable for spraying pesticide or fertilizer.
Consider:
- High wind speed (>15 km/h) causes spray drift.
- High rain probability (>30%) washes away chemicals.
- Extreme temperatures are generally poor.
Respond in JSON format: { "recommendation": "Spray Now / Wait", "reasoning": "Simple, short reasoning.", "isGood": true }. "isGood" should be a boolean indicating if weather is currently favorable.`;

        try {
          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
              systemPrompt,
              "Forecast: " + JSON.stringify(forecastData)
            ],
            config: {
              responseMimeType: "application/json",
            }
          });
          
          return res.json(JSON.parse(response.text || '{}'));
        } catch (geminiError: any) {
          console.log("Using programmatic fallback rules for spray recommendation.");
        }
      }

      // Fallback response if Gemini fails or is not configured
      const firstDay = forecastData && forecastData.length > 0 ? forecastData[0] : null;
      let isGood = true;
      let reasoning = "Conditions look acceptable for spraying.";
      
      if (firstDay) {
         if (firstDay.windSpeed > 15) {
           isGood = false;
           reasoning = "High winds may cause spray drift.";
         } else if (firstDay.rainProb > 30) {
           isGood = false;
           reasoning = "High probability of rain could wash away spray.";
         }
      }
      return res.json({
        recommendation: isGood ? "Spray Now" : "Wait",
        reasoning: reasoning,
        isGood: isGood
      });
      
    } catch (error: any) {
      console.log("Spray recommendation exception:", error.message);
      res.status(500).json({ error: "Failed to generate recommendation" });
    }
  });

  // Market prices mock api
  app.get("/api/market", (req, res) => {
    res.json([
      { crop: "Wheat", today: 2275, yesterday: 2250, change: 1.1, mandi: "Khanna" },
      { crop: "Rice (Paddy)", today: 2203, yesterday: 2203, change: 0, mandi: "Ludhiana" },
      { crop: "Maize", today: 2090, yesterday: 2110, change: -0.9, mandi: "Jalandhar" },
      { crop: "Potato", today: 850, yesterday: 830, change: 2.4, mandi: "Amritsar" },
      { crop: "Mustard", today: 5650, yesterday: 5600, change: 0.9, mandi: "Patiala" },
      { crop: "Cotton", today: 6620, yesterday: 6700, change: -1.2, mandi: "Bathinda" },
    ]);
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
