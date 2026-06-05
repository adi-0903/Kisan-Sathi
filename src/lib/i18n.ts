import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "greeting": "Hello",
      "home": "Home",
      "crops": "Crops",
      "dairy": "Dairy",
      "market": "Market",
      "ai_assistant": "Ask AI",
      "profile": "Profile",
      "weather_forecast": "Weather Forecast",
      "today_summary": "Today's Summary",
      "active_crops": "Active Crops",
      "cattle_count": "Cattle",
      "milk_produced": "Milk (L)",
      "pending_tasks": "Pending Tasks",
      "smart_alerts": "Smart Alerts",
      "upcoming_tasks": "Upcoming Tasks",
      "ask_ai_placeholder": "Ask your question here...",
      "capture_photo": "Capture Photo",
      "disease_result": "Diagnosis Result",
    }
  },
  hi: {
    translation: {
      "greeting": "नमस्ते",
      "home": "मुख्य पृष्ठ",
      "crops": "फ़सलें",
      "dairy": "डेयरी",
      "market": "मंडी",
      "ai_assistant": "AI से पूछें",
      "profile": "प्रोफ़ाइल",
      "weather_forecast": "मौसम पूर्वानुमान",
      "today_summary": "आज का सारांश",
      "active_crops": "सक्रिय फ़सलें",
      "cattle_count": "मवेशी",
      "milk_produced": "दूध (ली.)",
      "pending_tasks": "लंबित कार्य",
      "smart_alerts": "स्मार्ट अलर्ट",
      "upcoming_tasks": "आगामी कार्य",
      "ask_ai_placeholder": "अपना सवाल यहाँ पूछें...",
      "capture_photo": "फोटो खींचें",
      "disease_result": "निदान परिणाम",
    }
  },
  pa: {
    translation: {
      "greeting": "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ",
      "home": "ਮੁੱਖ ਪੰਨਾ",
      "crops": "ਫਸਲਾਂ",
      "dairy": "ਡੇਅਰੀ",
      "market": "ਮੰਡੀ",
      "ai_assistant": "AI ਨੂੰ ਪੁੱਛੋ",
      "profile": "ਪ੍ਰੋਫਾਈਲ",
      "weather_forecast": "ਮੌਸਮ ਦੀ ਭਵਿੱਖਬਾਣੀ",
      "today_summary": "ਅੱਜ ਦਾ ਸਾਰ",
      "active_crops": "ਸਰਗਰਮ ਫਸਲਾਂ",
      "cattle_count": "ਪਸ਼ੂ",
      "milk_produced": "ਦੁੱਧ (ਲੀ.)",
      "pending_tasks": "ਬਾਕੀ ਕੰਮ",
      "smart_alerts": "ਸਮਾਰਟ ਅਲਰਟ",
      "upcoming_tasks": "ਆਉਣ ਵਾਲੇ ਕੰਮ",
      "ask_ai_placeholder": "ਆਪਣਾ ਸਵਾਲ ਇੱਥੇ ਪੁੱਛੋ...",
      "capture_photo": "ਫੋਟੋ ਖਿੱਚੋ",
      "disease_result": "ਨਿਦਾਨ ਨਤੀਜਾ",
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
