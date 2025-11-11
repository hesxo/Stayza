import { Request, Response, NextFunction } from "express";

import { OpenAI } from "openai";
import Hotel from "../infrastructure/entities/Hotel";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const messages: { role: "user" | "assistant"; content: string }[] = [];
const MAX_HOTELS_FOR_AI = 40;
const DESCRIPTION_SNIPPET_LENGTH = 220;

export const respondToAIQuery = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { query } = req.body;
    if (!query || !query.trim()) {
      res.status(400).json({ message: "Query is required" });
      return;
    }

    const hotelsData = await Hotel.find()
      .select("name location description price rating image")
      .limit(MAX_HOTELS_FOR_AI)
      .lean();

    const formattedHotels = hotelsData
      .map((hotel, index) => {
        const descriptionSnippet = hotel.description
          ? hotel.description.slice(0, DESCRIPTION_SNIPPET_LENGTH).trim()
          : "No description available";

        return `${index + 1}. ${hotel.name} (${hotel.location}) - $${
          hotel.price
        }/night - Rating: ${hotel.rating ?? "N/A"}\nDescription: ${
          descriptionSnippet.length === DESCRIPTION_SNIPPET_LENGTH
            ? `${descriptionSnippet}…`
            : descriptionSnippet
        }`;
      })
      .join("\n\n");

    const aiPrompt =
      `User request: ${query.trim()}\n\nAvailable hotels:\n` +
      (formattedHotels || "No hotels available.");

    const response = await openai.responses.create({
      model: "gpt-5",
      instructions:
        "You are a helpful travel assistant. Recommend one to three hotels from the provided list that best match the user's request. Mention the hotel name, location, nightly price, and a short reason.",
      input: aiPrompt,
    });

    const aiResponse = response.output
      .filter((o) => o.type === "message")
      .map((el) => {
        return el.content
          .filter((c) => c.type === "output_text")
          .map((t) => t.text)
          .join("\n");
      })
      .join("\n");

    messages.push({
      role: "assistant",
      content: aiResponse,
    });

    console.log(messages);

    res.status(200).json({
      response: aiResponse,
    });
  } catch (error) {
    next(error);
  }
};
