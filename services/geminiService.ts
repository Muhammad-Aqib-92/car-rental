import { GoogleGenAI } from "@google/genai";

const getGeminiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    // In a real scenario we might throw, but here we might rely on the window.aistudio injection
    // throw new Error("API Key is missing"); 
  }
  return new GoogleGenAI({ apiKey: apiKey || '' });
};

export const generateCarDescription = async (name: string, modelYear: number, category: string): Promise<string> => {
  try {
    const ai = getGeminiClient();
    const prompt = `Write a short, appealing marketing description (max 2 sentences) for a car rental listing. 
    Car: ${modelYear} ${name}. Category: ${category}. 
    Focus on comfort, style, or performance based on category.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text || "A great car for your next trip.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `Enjoy your ride with this ${modelYear} ${name}.`;
  }
};

export const generateVideoScript = async (carName: string, category: string): Promise<string> => {
  try {
    const ai = getGeminiClient();
    const prompt = `Write a short, highly visual prompt for an AI video generator (like Veo) to create a cinematic commercial for a ${carName} (${category}). 
    Describe camera angles, lighting, and environment. Max 1 sentence.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text || `Cinematic shot of a ${carName} driving on a scenic road.`;
  } catch (error) {
    console.error("Gemini Script Error:", error);
    return `Cinematic shot of a ${carName} driving on a scenic road.`;
  }
};

export const chatWithBot = async (userMessage: string, history: {role: 'user' | 'model', text: string}[]): Promise<string> => {
    try {
        const ai = getGeminiClient();
        const systemInstruction = `You are DriveBot, a helpful and friendly AI assistant for the DriveEasy car rental platform. 
        Your goal is to help customers find cars, understand rental policies, and feel confident about their booking.
        - Be concise and polite.
        - You can suggest car categories (SUV, Sedan, Luxury, Sports).
        - If asked about prices, give a general range ($50 - $500/day).
        - If asked about support, tell them to email support@driveeasy.com.
        `;

        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction,
            },
            history: history.map(h => ({
                role: h.role,
                parts: [{ text: h.text }]
            }))
        });

        const result = await chat.sendMessage({ message: userMessage });
        return result.text;
    } catch (error) {
        console.error("Chatbot Error:", error);
        return "I'm having trouble connecting to the server right now. Please try again later.";
    }
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const generateVeoVideo = async (imageFile: File, prompt?: string): Promise<string> => {
  // 1. Check/Request API Key
  const aistudio = (window as any).aistudio;
  if (aistudio && aistudio.openSelectKey) {
    const hasKey = await aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await aistudio.openSelectKey();
    }
  }

  // 2. Initialize Client (re-init to pick up key)
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const base64Image = await fileToBase64(imageFile);

  // 3. Start Generation
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt || 'Cinematic video of this car driving on a scenic road, high quality, photorealistic',
    image: {
      imageBytes: base64Image,
      mimeType: imageFile.type,
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });

  // 4. Poll for completion
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  // 5. Get Video URI
  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!videoUri) throw new Error("Failed to generate video");

  // 6. Fetch Video Data
  const response = await fetch(`${videoUri}&key=${process.env.API_KEY || ''}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};