import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface AnalysisResult {
  title: string;
  truthScore: number;
  classification: "Real" | "Fake" | "Misleading";
  aiGeneratedProb: number;
  confidence: number;
  reasons: string[];
  claims: { claim: string; status: string; evidence: string }[];
  explanation: string;
  mlMetrics: {
    logisticRegression: number;
    naiveBayes: number;
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  };
  intentAnalysis: {
    type: "Satire" | "Political propaganda" | "Clickbait" | "Conspiracy theory" | "Financial scam" | "Neutral";
    goal: string;
    confidence: number;
  };
  xaiMetrics: {
    languageManipulation: number;
    sourceCredibility: number;
    factInconsistency: number;
    aiWritingPattern: number;
  };
  globalStats: { country: string; status: string; impact: string }[];
  contentOrigin: {
    type: "AI Generated" | "Human Created" | "Mixed" | "Other";
    percentage: number;
    details: string;
    linguisticAnomalies: string[];
  };
  incidentTimeline: { date: string; event: string; source: string }[];
  sourceVerification: {
    publisher: string;
    isTrusted: boolean;
    reputationScore: number;
    biasType: string;
    verificationDetails: string;
  };
  nlpInsights: {
    sentiment: string;
    emotionalTone: string;
    complexityLevel: string;
    semanticConsistency: number;
  };
}

export async function analyzeNews(text: string, imageBase64?: string): Promise<AnalysisResult> {
  // Step 1: "ML Layer" - Simulating a model that also returns performance metrics
  const mlResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Act as a high-performance ML classifier (BERT/RoBERTa based). 
    1. Analyze this text for Real/Fake probability.
    2. Return simulated performance metrics for this specific model type (Accuracy, Precision, Recall, F1).
    Return ONLY a JSON object.
    Text: ${text.substring(0, 1000)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          lr: { type: Type.NUMBER, description: "Logistic Regression Score" },
          nb: { type: Type.NUMBER, description: "Naive Bayes Score" },
          accuracy: { type: Type.NUMBER },
          precision: { type: Type.NUMBER },
          recall: { type: Type.NUMBER },
          f1Score: { type: Type.NUMBER }
        },
        required: ["lr", "nb", "accuracy", "precision", "recall", "f1Score"]
      }
    }
  });

  const mlScores = JSON.parse(mlResponse.text || '{"lr": 0.5, "nb": 0.5, "accuracy": 0.92, "precision": 0.91, "recall": 0.93, "f1Score": 0.92}');

  // Step 2: Deep Analysis + NLP + Source Verification + XAI + Global Context
  const parts: any[] = [{ text }];
  if (imageBase64) {
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: imageBase64.split(',')[1] || imageBase64
      }
    });
  }

  const deepAnalysisResponse = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: { parts },
    config: {
      tools: [{ googleSearch: {} }],
      systemInstruction: `You are Truth Guard, an elite fake news detection AI using advanced NLP models.
      Analyze the provided news text and optional image. 
      1. Deep Contextual Analysis: Use advanced NLP to understand deeper context, sentiment, and semantic consistency.
      2. Source Verification: Validate the publisher against trusted news databases. Determine bias and reputation.
      3. Fact-Checking API Integration: Simulate connection to fact-checking APIs (Google Fact Check, Snopes) via Search.
      4. Linguistic Forensics: Detect AI writing patterns, unusual linguistic structures (perplexity/burstiness anomalies).
      5. Intent & XAI: Classify intent and provide Explainable AI metrics.
      6. Global Context: Search for international statistics and construct an incident timeline.
      7. Provide a final truth score (0-100) and classification.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          truthScore: { type: Type.NUMBER },
          classification: { type: Type.STRING, enum: ["Real", "Fake", "Misleading"] },
          aiGeneratedProb: { type: Type.NUMBER },
          confidence: { type: Type.NUMBER },
          reasons: { type: Type.ARRAY, items: { type: Type.STRING } },
          claims: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                claim: { type: Type.STRING },
                status: { type: Type.STRING },
                evidence: { type: Type.STRING }
              }
            }
          },
          explanation: { type: Type.STRING },
          intentAnalysis: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, enum: ["Satire", "Political propaganda", "Clickbait", "Conspiracy theory", "Financial scam", "Neutral"] },
              goal: { type: Type.STRING },
              confidence: { type: Type.NUMBER }
            },
            required: ["type", "goal", "confidence"]
          },
          xaiMetrics: {
            type: Type.OBJECT,
            properties: {
              languageManipulation: { type: Type.NUMBER },
              sourceCredibility: { type: Type.NUMBER },
              factInconsistency: { type: Type.NUMBER },
              aiWritingPattern: { type: Type.NUMBER }
            },
            required: ["languageManipulation", "sourceCredibility", "factInconsistency", "aiWritingPattern"]
          },
          globalStats: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                country: { type: Type.STRING },
                status: { type: Type.STRING },
                impact: { type: Type.STRING }
              }
            }
          },
          contentOrigin: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, enum: ["AI Generated", "Human Created", "Mixed", "Other"] },
              percentage: { type: Type.NUMBER },
              details: { type: Type.STRING },
              linguisticAnomalies: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["type", "percentage", "details", "linguisticAnomalies"]
          },
          incidentTimeline: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING },
                event: { type: Type.STRING },
                source: { type: Type.STRING }
              }
            }
          },
          sourceVerification: {
            type: Type.OBJECT,
            properties: {
              publisher: { type: Type.STRING },
              isTrusted: { type: Type.BOOLEAN },
              reputationScore: { type: Type.NUMBER },
              biasType: { type: Type.STRING },
              verificationDetails: { type: Type.STRING }
            },
            required: ["publisher", "isTrusted", "reputationScore", "biasType", "verificationDetails"]
          },
          nlpInsights: {
            type: Type.OBJECT,
            properties: {
              sentiment: { type: Type.STRING },
              emotionalTone: { type: Type.STRING },
              complexityLevel: { type: Type.STRING },
              semanticConsistency: { type: Type.NUMBER }
            },
            required: ["sentiment", "emotionalTone", "complexityLevel", "semanticConsistency"]
          }
        },
        required: ["title", "truthScore", "classification", "aiGeneratedProb", "confidence", "reasons", "claims", "explanation", "intentAnalysis", "xaiMetrics", "globalStats", "contentOrigin", "incidentTimeline", "sourceVerification", "nlpInsights"]
      }
    }
  });

  const result = JSON.parse(deepAnalysisResponse.text || '{}');

  return {
    ...result,
    mlMetrics: {
      logisticRegression: mlScores.lr * 100,
      naiveBayes: mlScores.nb * 100
    }
  };
}
