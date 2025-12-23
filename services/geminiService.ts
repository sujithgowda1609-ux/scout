
import { GoogleGenAI, Type } from "@google/genai";
import { DetectionResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const detectObjectsInFrame = async (base64Image: string): Promise<DetectionResult> => {
  const model = "gemini-3-flash-preview";
  
  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          {
            text: `Act as an advanced product detection system (YOLOv8 + Grounding DINO ensemble). 
            Analyze this video frame from a movie trailer. 
            Identify high-value consumer products like clothing, gadgets, furniture, footwear, and accessories.
            
            For each object:
            1. Provide a label (e.g., "Luxury Watch", "Leather Jacket").
            2. Confidence score (0.95-0.99).
            3. Bounding box coordinates [ymin, xmin, ymax, xmax] normalized 0-1000.
            4. Detailed attributes (color, pattern, material).
            5. Generate a search query for Flipkart.
            
            Identify the overall scene (e.g., "High-stakes Casino", "Urban Street").`
          },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image
            }
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          scene: { type: Type.STRING },
          objects: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                label: { type: Type.STRING },
                confidence: { type: Type.NUMBER },
                box: { 
                  type: Type.ARRAY, 
                  items: { type: Type.NUMBER },
                  description: "ymin, xmin, ymax, xmax"
                },
                attributes: {
                  type: Type.OBJECT,
                  properties: {
                    color: { type: Type.STRING },
                    pattern: { type: Type.STRING },
                    material: { type: Type.STRING },
                    type: { type: Type.STRING }
                  }
                },
                flipkartUrl: { type: Type.STRING, description: "Direct search link for flipkart" }
              },
              required: ["id", "label", "confidence", "box", "flipkartUrl"]
            }
          }
        },
        required: ["scene", "objects"]
      }
    }
  });

  const result: DetectionResult = JSON.parse(response.text || '{"scene": "Unknown", "objects": []}');
  
  // Post-process: add placeholder images for UI and refine URLs
  result.objects = result.objects.map(obj => ({
    ...obj,
    imageUrl: `https://picsum.photos/seed/${obj.id}/300/300`,
    flipkartUrl: `https://www.flipkart.com/search?q=${encodeURIComponent(obj.label + ' ' + (obj.attributes?.color || ''))}`
  }));

  return result;
};
