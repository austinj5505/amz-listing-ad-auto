
import { GoogleGenAI, Type } from "@google/genai";
import { ProductInput, GenerationResult } from "../types";

export async function generateAmazonContent(input: ProductInput): Promise<GenerationResult> {
  const modelName = 'gemini-3-flash-preview';
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    你是一位顶级的亚马逊美国站运营专家。你必须为 ${input.category} 类目的新品生成全套 Listing 文案、视觉方案和广告策略。
    
    重点任务：
    1. 标题生成：生成 1 个主标题 (Main Title) 和 3 个备选副标题 (Alternative Titles)。
    2. 五点描述：生成 5 个高转化 Bullet Points。
    3. 产品描述：采用 HTML 源代码格式，包含【主标题】和【副标题】结构，加粗关键词。
    4. 视觉资产策划 (Visual Assets)：
       - 提供 1 张主图策略。
       - 提供 6 张附图的视觉构思及 AI 生成提示词。
       - 提供 A+ 页面布局建议 (aPlusContent)。
       - 提供 15-30 秒短视频脚本 (productVideo)，包含脚本大纲 (scriptOutline) 和关键分镜 (keyScenes)。
    5. 广告执行计划 (PPC Roadmap)：
       - 必须生成 4 个阶段的详细路线图（准备期、冷启动期、爆发期、稳定期）。
       - 每个阶段必须包含：时间范围(dayRange)、阶段名称(phaseName)、核心目标(objective)、日预算(dailyBudget)、投放重心(targetingFocus)、出价策略(biddingStrategy)、文案指令(contentInstruction)及战略逻辑(strategicLogic)。
    
    语言要求：Listing 核心内容 (Title, Bullets, Description) 和 AI Prompt 必须用英文；其他解释、逻辑分析、广告建议使用中文。
    注意：泳衣/运动类目内容需符合亚马逊健康向上的审美，避免任何违规词汇。
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      listing: {
        type: Type.OBJECT,
        properties: {
          mainTitle: { type: Type.STRING },
          altTitles: { type: Type.ARRAY, items: { type: Type.STRING } },
          bulletPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          description: { type: Type.STRING },
          searchTerms: { type: Type.ARRAY, items: { type: Type.STRING } },
          visualAssets: {
            type: Type.OBJECT,
            properties: {
              mainImage: {
                type: Type.OBJECT,
                properties: {
                  rationale: { type: Type.STRING },
                  exampleDescription: { type: Type.STRING },
                  generationPrompt: { type: Type.STRING }
                }
              },
              secondaryImages: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    keySellingPoint: { type: Type.STRING },
                    visualExample: { type: Type.STRING },
                    generationPrompt: { type: Type.STRING }
                  }
                }
              },
              aPlusContent: {
                type: Type.OBJECT,
                properties: {
                  layoutStrategy: { type: Type.STRING },
                  modules: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        type: { type: Type.STRING },
                        content: { type: Type.STRING },
                        designGoal: { type: Type.STRING }
                      }
                    }
                  }
                }
              },
              productVideo: {
                type: Type.OBJECT,
                properties: {
                  tone: { type: Type.STRING },
                  scriptOutline: { type: Type.STRING },
                  keyScenes: { type: Type.ARRAY, items: { type: Type.STRING } },
                  generationPrompt: { type: Type.STRING }
                }
              }
            }
          }
        },
        required: ["mainTitle", "altTitles", "bulletPoints", "description", "visualAssets"]
      },
      ads: {
        type: Type.OBJECT,
        properties: {
          detailedRoadmap: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                dayRange: { type: Type.STRING },
                phaseName: { type: Type.STRING },
                objective: { type: Type.STRING },
                dailyBudget: { type: Type.NUMBER },
                targetingFocus: { type: Type.STRING },
                biddingStrategy: { type: Type.STRING },
                contentInstruction: { type: Type.STRING },
                strategicLogic: { type: Type.STRING }
              },
              required: ["dayRange", "phaseName", "objective", "dailyBudget", "targetingFocus", "biddingStrategy", "contentInstruction", "strategicLogic"]
            }
          }
        },
        required: ["detailedRoadmap"]
      }
    },
    required: ["listing", "ads"]
  };

  const parts: any[] = [
    { text: `
      请根据以下信息生成产品资产，包含全套 Listing 文案、6张附图方案、视频脚本和 A+ 页面建议，以及完整的 4 个阶段广告执行计划。
      
      产品名: ${input.name}
      类目: ${input.category}
      材质: ${input.material}
      风格: ${input.style}
      卖点: ${input.features}
      
      特别注意：视觉资产中的 'productVideo' 必须包含详细的脚本大纲和分镜。
    ` }
  ];

  if (input.imageFront) {
    parts.unshift({ 
      inlineData: { 
        mimeType: "image/jpeg", 
        data: input.imageFront.split(',')[1] 
      } 
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [{ parts }],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
        maxOutputTokens: 8192,
        temperature: 0.8,
        safetySettings: [
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
        ]
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
}
