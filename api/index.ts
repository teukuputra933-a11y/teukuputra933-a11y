import { GoogleGenAI } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Hanya izinkan metode POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt, systemInstruction } = req.body;
    
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return res.status(500).json({ 
        error: "GEMINI_API_KEY belum dikonfigurasi di Vercel. Silakan buka Dashboard Vercel -> Settings -> Environment Variables dan tambahkan GEMINI_API_KEY Anda." 
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Gunakan model gemini-1.5-flash untuk stabilitas
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: systemInstruction
      }
    });

    return res.status(200).json({ text: response.text });
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return res.status(500).json({ error: error.message || "Gagal menghasilkan konten" });
  }
}
