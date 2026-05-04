import express from "express";
import { GoogleGenAI } from "@google/genai";

const app = express();
app.use(express.json());

// API Route for RPP Generation
const handleGenerate = async (req: express.Request, res: express.Response) => {
  try {
    const { prompt, systemInstruction } = req.body;
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        error: "GEMINI_API_KEY belum dikonfigurasi di server. Silakan buka menu 'Settings' di Vercel Dashboard dan tambahkan GEMINI_API_KEY Anda." 
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const result = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction
      }
    });

    res.json({ text: result.text });
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate content" });
  }
};

app.post("/api/generate", handleGenerate);
app.post("/generate", handleGenerate);

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.get("/health", (req, res) => res.json({ status: "ok" }));

export default app;
