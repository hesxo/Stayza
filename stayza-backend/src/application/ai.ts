import { Request, Response, NextFunction } from "express";

import { OpenAI } from "openai";
import Hotel from "../infrastructure/entities/Hotel";

// Initialize OpenAI client
let openai: OpenAI;

try {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} catch (error) {
  console.error("Failed to initialize OpenAI client:", error);
}

const messages: { role: "user" | "assistant"; content: string }[] = [];

export const respondToAIQuery = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("AI Query received:", req.body);
    console.log("OpenAI API Key exists:", !!process.env.OPENAI_API_KEY);
    
    const { query } = req.body;

    if (!openai) {
      // Fallback response if OpenAI is not available
      const fallbackResponse = `I understand you're looking for: "${query}". While our AI assistant is temporarily unavailable, here are some general recommendations: Look for hotels that match your specific needs, check reviews, and consider location and amenities.`;
      
      return res.status(200).json({
        response: fallbackResponse,
      });
    }

    const hotelsData = await Hotel.find();

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant that helps users choose hotels based on their preferences and requirements. You have access to the following hotels: ${JSON.stringify(hotelsData)}. Based on the user's query, recommend suitable hotels and explain why they match the user's needs.`,
        },
        {
          role: "user",
          content: query,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0]?.message?.content || "Sorry, I couldn't process your request.";

    messages.push({
      role: "assistant",
      content: aiResponse,
    });

    console.log(messages);

    res.status(200).json({
      response: aiResponse,
    });
  } catch (error) {
    console.error("AI Query Error:", error);
    
    // Provide a fallback response instead of throwing an error
    const fallbackResponse = `I understand you're looking for: "${req.body.query}". While our AI assistant is experiencing technical difficulties, please try browsing our available hotels or contact our support team for personalized recommendations.`;
    
    res.status(200).json({
      response: fallbackResponse,
    });
  }
};