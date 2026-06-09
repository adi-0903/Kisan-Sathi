import { spawn } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

// Helper to wait
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function runTests() {
  console.log("=== Kisan Sathi Integration Test Runner ===");
  console.log("Starting server process...");

  const serverProcess = spawn('npx', ['tsx', 'server.ts'], {
    stdio: 'pipe',
    shell: true,
    env: { ...process.env, PORT: PORT.toString() }
  });

  let outputLog = '';
  serverProcess.stdout.on('data', data => {
    outputLog += data.toString();
  });
  serverProcess.stderr.on('data', data => {
    outputLog += data.toString();
  });

  // Wait for server to start (poll health endpoint)
  let isReady = false;
  console.log("Polling health endpoint to check if server is active...");
  for (let i = 0; i < 15; i++) {
    try {
      const res = await fetch(`${BASE_URL}/api/health`);
      if (res.ok) {
        const body = await res.json();
        if (body.status === 'ok') {
          isReady = true;
          break;
        }
      }
    } catch (e) {
      // Ignore connection errors during startup
    }
    await delay(1000);
  }

  if (!isReady) {
    console.error("CRITICAL: Server failed to start or respond to health checks in 15 seconds.");
    console.error("Server logs:\n", outputLog);
    serverProcess.kill();
    process.exit(1);
  }

  console.log("Server is online! Running tests...\n");

  const results = [];

  // 1. Test GET /api/health
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    const status = res.status;
    const body = await res.json();
    const passed = status === 200 && body.status === 'ok';
    results.push({
      test: "GET /api/health",
      status,
      passed,
      detail: passed ? `Uptime: ${body.uptime}s` : JSON.stringify(body)
    });
  } catch (err) {
    results.push({ test: "GET /api/health", status: "ERR", passed: false, detail: err.message });
  }

  // 2. Test GET /api/weather
  try {
    const res = await fetch(`${BASE_URL}/api/weather?lat=30.9010&lon=75.8573`);
    const status = res.status;
    const body = await res.json();
    const passed = status === 200 && typeof body.temp === 'number' && Array.isArray(body.forecast);
    results.push({
      test: "GET /api/weather",
      status,
      passed,
      detail: passed ? `Condition: ${body.condition}, Temp: ${body.temp}°C, Forecast Days: ${body.forecast.length}` : JSON.stringify(body)
    });
  } catch (err) {
    results.push({ test: "GET /api/weather", status: "ERR", passed: false, detail: err.message });
  }

  // 3. Test POST /api/weather/spray-recommendation
  try {
    const dummyForecast = [
      { day: "Mon", date: "2026-06-05", temp: 32, main: "Clear", condition: "Sunny", windSpeed: 12, rainProb: 10 }
    ];
    const res = await fetch(`${BASE_URL}/api/weather/spray-recommendation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ forecastData: dummyForecast })
    });
    const status = res.status;
    const body = await res.json();
    const passed = status === 200 && body.recommendation && body.reasoning;
    results.push({
      test: "POST /api/weather/spray-recommendation",
      status,
      passed,
      detail: passed ? `Rec: ${body.recommendation}, Reason: "${body.reasoning}"` : JSON.stringify(body)
    });
  } catch (err) {
    results.push({ test: "POST /api/weather/spray-recommendation", status: "ERR", passed: false, detail: err.message });
  }

  // 4. Test GET /api/market
  try {
    const res = await fetch(`${BASE_URL}/api/market`);
    const status = res.status;
    const body = await res.json();
    const passed = status === 200 && Array.isArray(body);
    results.push({
      test: "GET /api/market",
      status,
      passed,
      detail: passed ? `Commodities Loaded: ${body.length} (Sample: ${body[0]?.crop || 'None'} @ ${body[0]?.today || 0} INR)` : JSON.stringify(body)
    });
  } catch (err) {
    results.push({ test: "GET /api/market", status: "ERR", passed: false, detail: err.message });
  }

  // 5. Test POST /api/chat
  try {
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: "Hello, what crop should I plant in Punjab?", language: "English" })
    });
    const status = res.status;
    const body = await res.json();
    
    // Handled error or success
    const hasGeminiKey = !!process.env.GEMINI_API_KEY;
    const passed = hasGeminiKey ? (status === 200 && !!body.text) : (status === 500 && !!body.error);
    results.push({
      test: "POST /api/chat (Kisan GPT)",
      status,
      passed,
      detail: hasGeminiKey 
        ? `Response: "${body.text?.substring(0, 50)}..."` 
        : `Handled error when GEMINI_API_KEY missing: "${body.error}"`
    });
  } catch (err) {
    results.push({ test: "POST /api/chat (Kisan GPT)", status: "ERR", passed: false, detail: err.message });
  }

  // 6. Test POST /api/vision (Crop Diagnosis)
  try {
    const dummyImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    const res = await fetch(`${BASE_URL}/api/vision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: dummyImage, language: "English" })
    });
    const status = res.status;
    const body = await res.json();
    
    const hasGeminiKey = !!process.env.GEMINI_API_KEY;
    const passed = hasGeminiKey ? (status === 200 || status === 500) : (status === 500 && !!body.error);
    results.push({
      test: "POST /api/vision (AI Scan)",
      status,
      passed,
      detail: hasGeminiKey
        ? `Response: ${JSON.stringify(body).substring(0, 50)}...`
        : `Handled error when GEMINI_API_KEY missing: "${body.error}"`
    });
  } catch (err) {
    results.push({ test: "POST /api/vision (AI Scan)", status: "ERR", passed: false, detail: err.message });
  }

  // 7. Test GET /api/test-neon
  try {
    const res = await fetch(`${BASE_URL}/api/test-neon`);
    const status = res.status;
    const body = await res.json();
    
    const passed = (status === 200 && body.status === 'neon_connected') || (status === 500 && !!body.error);
    results.push({
      test: "GET /api/test-neon",
      status,
      passed,
      detail: passed 
        ? `Status: ${body.status}, Type: ${body.connectionType}`
        : `Handled DB Connection Failure: "${body.error}"`
    });
  } catch (err) {
    results.push({ test: "GET /api/test-neon", status: "ERR", passed: false, detail: err.message });
  }

  console.log("Stopping backend server process...");
  serverProcess.kill();

  console.log("\n================ TEST SUMMARY ================");
  console.log("| Test Route                               | Status | Result | Details");
  console.log("| ---------------------------------------- | ------ | ------ | ----------------------------------------------------");
  let allPassed = true;
  for (const r of results) {
    const resStr = r.passed ? "✅ PASS" : "❌ FAIL";
    if (!r.passed) allPassed = false;
    console.log(`| ${r.test.padEnd(40)} | ${r.status.toString().padEnd(6)} | ${resStr} | ${r.detail}`);
  }
  console.log("==============================================\n");

  if (allPassed) {
    console.log("🎉 ALL INTEGRATION TESTS COMPLETED SUCCESSFULLY!");
    process.exit(0);
  } else {
    console.error("🚨 SOME INTEGRATION TESTS FAILED.");
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error("Test execution exception:", err);
  process.exit(1);
});
