import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize GoogleGenAI client lazily or safely
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is required.");
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// API Endpoint for Analysis
app.post("/api/analyse", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== "string" || message.trim() === "") {
      return res.status(400).json({ error: "Message content is required" });
    }

    const ai = getGeminiClient();

    const systemInstruction = `You are "ScamShield Nigeria", an expert cybersecurity advisor specialized in detecting and analyzing digital scams, SMS (smishing), email phishing, WhatsApp fraud, and internet confidence tricks prevalent in Nigeria.
Your job is to analyze the user's suspicious message or email and provide a precise, objective, and detailed scam assessment.
Be extremely familiar with typical Nigerian scam patterns such as:
- Fake bank alerts / transaction notifications (claiming to be from GTBank, Zenith, Access, UBA, etc.)
- Bank Verification Number (BVN) update requests
- Fake NIN (National Identification Number) linking prompts
- One-Time Password (OTP) validation tricks
- Fraudulent job offers demanding payment for "processing" or "induction" (e.g., claiming to be from NNPC, Shell, Chevron, Federal Civil Service)
- Grandiose lottery or promo wins claiming to be from MTN, Airtel, Glo, or 9mobile
- Crypto investment scams promising quick astronomical returns or double money (e.g., MMM-style, daily ROI, mining pools)
- Government grant / empowerment schemes scams
- Next-of-kin or inheritances claims
- "Oga/My oga says" WhatsApp supply or purchase scams

Analyze the message strictly and yield structured response details according to the schema. Make sure your verdict is highly accurate:
- SCAM: Clear indicator of fraudulent intent (requests sensitive keys, BVN/NIN/OTP, demands payment for job, has suspicious links, fake alert language, bad grammar from "bank", high-pressure tactics).
- SUSPICIOUS: Shows warning signs, unverified source format, high-pressure urgency from unknown contact, unusual offers, but might theoretically be an aggressive sales piece. Better to caution.
- SAFE: Genuine informational message with no red flags.

Provide practical, highly contextual action tips localized for a Nigerian setting (mentioning commercial banks, government regulatory agencies like NITDA, EFCC, NCC, NPF, or Telecom networks where relevant).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: message,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verdict: {
              type: Type.STRING,
              description: "Must be exactly one of: SCAM, SUSPICIOUS, or SAFE",
            },
            confidence: {
              type: Type.INTEGER,
              description: "Confidence percentage of the verdict (0 to 100)",
            },
            scamType: {
              type: Type.STRING,
              description: "e.g., Bank Verification Scam, OTP Request, Lottery Scam, Crypto Investment, Job Offer Scam, Govt Grant Scam, or None",
            },
            redFlags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of specific warning signs, linguistic cues, or fraud tactics noticed in the text",
            },
            explanation: {
              type: Type.STRING,
              description: "A comprehensive but clear, concise explanation written for single-view visual display",
            },
            actionUrgency: {
              type: Type.STRING,
              description: "Must be exactly one of: CRITICAL, CAUTION, or NONE",
            },
            safetyTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "1-3 highly practical, localized tips suited for a Nigerian digital user to protect themselves (e.g., dial bank shortcodes, never share OTPs, call official numbers).",
            },
          },
          required: [
            "verdict",
            "confidence",
            "scamType",
            "redFlags",
            "explanation",
            "actionUrgency",
            "safetyTips",
          ],
        },
      },
    });

    const parsedData = JSON.parse(response.text || "{}");
    return res.json(parsedData);
  } catch (error: any) {
    console.error("Analysis Error:", error);
    return res.status(500).json({
      error: error.message || "An error occurred during verification",
      details: "Could not complete scam check. Please verify your GEMINI_API_KEY in Settings."
    });
  }
});

// Setup Vite Dev Server / Static Asset Server
const setupVite = async () => {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
};

setupVite();
