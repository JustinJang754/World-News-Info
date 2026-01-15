
import { GoogleGenAI, Type } from "@google/genai";
import { NewsArticle, GroundingSource, NewsCategory, MarketIndex } from "../types";
import { sanitizeInput, withRetry } from "../utils/security";

const MODEL_NAME = 'gemini-3-flash-preview';

export const fetchMarketIndices = async (): Promise<MarketIndex[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: "Get the very latest values for KOSPI, KOSDAQ, S&P 500, NASDAQ, and USD/KRW exchange rate. Return them in a strict JSON array.",
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            indices: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  value: { type: Type.STRING },
                  change: { type: Type.STRING },
                  changePercent: { type: Type.STRING },
                  trend: { type: Type.STRING, enum: ['up', 'down', 'neutral'] }
                },
                required: ["name", "value", "change", "changePercent", "trend"]
              }
            }
          },
          required: ["indices"]
        }
      }
    });

    try {
      const parsed = JSON.parse(response.text);
      return parsed.indices;
    } catch (e) {
      console.error("Market data parse error", e);
      return [];
    }
  });
};

export const fetchEconomicNews = async (
  region: 'domestic' | 'overseas', 
  category: NewsCategory,
  query?: string
): Promise<{ articles: NewsArticle[], sources: GroundingSource[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const regionText = region === 'domestic' ? 'South Korea' : 'Global/US';
  const cleanQuery = query ? sanitizeInput(query) : "";
  
  const finalQuery = cleanQuery 
    ? `${regionText} market news about ${cleanQuery}` 
    : `Latest important ${category} news in ${regionText}`;

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Search for the most recent news: "${finalQuery}". 
      Translate results to Korean. Provide a JSON array of articles with reliability scores.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            articles: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  source: { type: Type.STRING },
                  sentiment: { type: Type.STRING, enum: ['positive', 'negative', 'neutral'] },
                  reliabilityScore: { type: Type.NUMBER }
                },
                required: ["id", "title", "summary", "source", "sentiment", "reliabilityScore"]
              }
            }
          },
          required: ["articles"]
        }
      },
    });

    const parsed = JSON.parse(response.text);
    const sources: GroundingSource[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.filter(chunk => chunk.web)
      ?.map(chunk => ({
        title: chunk.web?.title || "출처",
        uri: chunk.web?.uri || ""
      })) || [];

    return {
      articles: (parsed.articles || []).map((a: any, index: number) => ({
        ...a,
        publishedAt: new Date().toISOString(),
        url: sources[index]?.uri || "#",
        category: category
      })),
      sources
    };
  });
};

export const getDeepInsight = async (topic: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `주제: "${sanitizeInput(topic)}"에 대한 마켓 인사이트 보고서를 한글로 작성하세요.`,
      config: { tools: [{ googleSearch: {} }] }
    });
    return response.text;
  });
};
