
import { GoogleGenAI, Type } from "@google/genai";
import { ProductInput, GenerationResult } from "../types";

export async function generateAmazonContent(input: ProductInput): Promise<GenerationResult> {
  const modelName = 'gemini-3-flash-preview';
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    你是一位顶级的亚马逊美国站运营专家。你必须为 ${input.category} 类目的新品生成全套 Listing 文案、视觉方案和广告策略。
    
    重点任务：
    1. 标题生成：强制生成 1 个主标题 (Main Title) 和 3 个备选副标题 (Alternative Titles)。
    2. 五点描述：生成 5 个高转化 Bullet Points。
    3. 产品长描述 (Description)：
       - 必须采用 HTML 源代码格式（使用 <b>, <strong>, <p>, <br>, <ul>, <li> 等标签）。
       - 每个段落必须包含【主标题】和【副标题】，然后是详细内容。
       - 需要加粗强调的内容请直接在代码中使用 <b> 或 <strong>。
    4. 附图策划逻辑：
       - Slide 1: 核心功能展示 (Features Focus)
       - Slide 2: 真实场景演示 (Lifestyle Scenario)
       - Slide 3: 材质细节/特写 (Material & Detail)
       - Slide 4: 尺码建议/版型 (Sizing & Fit Guide)
       - Slide 5: 使用对比/痛点解决 (Comparison)
       - Slide 6: 品牌承诺/包装 (Brand Value)
    5. AI 指令工程：为 Nano Banana (Gemini 2.5 Flash Image) 生成摄影级英文提示词 (generationPrompt)。
    6. 语言：解释说明用中文，亚马逊 Listing 核心文案（Title, Bullets, Description）和 AI 指令必须用专业英文。
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      listing: {
        type: Type.OBJECT,
        properties: {
          mainTitle: { type: Type.STRING },
          altTitles: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 alternative titles" },
          bulletPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          description: { type: Type.STRING, description: "Professional Amazon product description in HTML format with main/sub headings and bold tags" },
          searchTerms: { type: Type.ARRAY, items: { type: Type.STRING } },
          visualAssets: {
            type: Type.OBJECT,
            properties: {
              mainImage: {
                type: Type.OBJECT,
                properties: {
                  composition: { type: Type.STRING },
                  lightingAndTone: { type: Type.STRING },
                  exampleDescription: { type: Type.STRING },
                  rationale: { type: Type.STRING },
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
                    usageScenario: { type: Type.STRING },
                    visualExample: { type: Type.STRING },
                    rationale: { type: Type.STRING },
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
                  usageScenario: { type: Type.STRING },
                  scriptOutline: { type: Type.STRING },
                  keyScenes: { type: Type.ARRAY, items: { type: Type.STRING } },
                  generationPrompt: { type: Type.STRING }
                }
              }
            }
          },
          rationales: {
            type: Type.OBJECT,
            properties: {
              titleLogic: { type: Type.STRING },
              bulletLogic: { type: Type.STRING }
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
                placementStrategy: { type: Type.STRING },
                biddingStrategy: { type: Type.STRING },
                contentInstruction: { type: Type.STRING },
                strategicLogic: { type: Type.STRING }
              }
            }
          }
        }
      }
    },
    required: ["listing", "ads"]
  };

  const parts: any[] = [];
  if (input.imageFront) parts.push({ inlineData: { mimeType: "image/jpeg", data: input.imageFront.split(',')[1] } });
  
  parts.push({ text: `
    请为以下产品生成全套资产。
    要求：1个主标题+3个副标题；HTML格式Description（包含主副标题及加粗）；6张附图方案；详细广告计划。
    
    产品详情：
    名称: ${input.name} | 类目: ${input.category} | 材质: ${input.material} | 风格: ${input.style} | 卖点: ${input.features}
  `});

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [{ parts }],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
        tools: [{ googleSearch: {} }]
      }
    });

    let text = response.text || "{}";
    text = text.replace(/^```json/, "").replace(/```$/, "").trim();
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
