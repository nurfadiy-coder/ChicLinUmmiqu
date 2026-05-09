import { GoogleGenAI } from "@google/genai";
import { Sale, Expense, DashboardStats } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeBusinessPerformance(
  stats: DashboardStats,
  recentSales: Sale[],
  recentExpenses: Expense[]
) {
  const prompt = `
    Analyze the business performance for 'CHICLIN UMMIQU'.
    
    Current Stats:
    - Total Sales: IDR ${stats.totalSales}
    - Total Cost (HPP): IDR ${stats.totalCost}
    - Total Expenses: IDR ${stats.totalExpenses}
    - Net Income: IDR ${stats.netIncome}
    
    Recent Data Summary:
    - Number of sales recorded: ${recentSales.length}
    - Number of expense entries: ${recentExpenses.length}
    
    Based on this data, provide:
    1. A brief summary of the business health.
    2. One key insight for growth (e.g., focus on a specific product or reduce an expense category).
    3. A realistic goal for the next week.
    
    Format the response as clear, concise bullet points in Indonesian.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Maaf, analisis bisnis tidak dapat dimuat saat ini. Silakan coba lagi nanti.";
  }
}
