import { OpenAI } from "openai";

const openai =
  process.env.OPENAI_API_KEY !== undefined
    ? new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      })
    : null;

type AIHotelSearchFilters = {
  location?: string;
  maxPrice?: number;
  minPrice?: number;
  keywords?: string[];
};

const SYSTEM_INSTRUCTIONS = `
You are an assistant that converts natural-language hotel requests into structured filters.
Respond with a single JSON object using this shape:
{
  "location": string | null,
  "maxPrice": number | null,
  "minPrice": number | null,
  "keywords": string[] // adjectives, amenities, vibes from the query
}

Rules:
- location should be city, region, or country only (no extra description).
- maxPrice/minPrice should be nightly USD amounts if explicitly mentioned.
- keywords should contain 1-3 concise phrases that help narrow hotels (e.g., "beachfront", "family friendly").
- If a field is unknown, use null.
- Do not include commentary outside of the JSON.
`;

const extractJson = (raw: string) => {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    return null;
  }

  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }
};

export const interpretHotelSearchQuery = async (
  query: string
): Promise<AIHotelSearchFilters | null> => {
  if (!openai || !process.env.OPENAI_API_KEY) {
    return null;
  }

  try {
    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      instructions: SYSTEM_INSTRUCTIONS,
      input: query,
      temperature: 0.1,
    });

    const raw =
      response.output
        ?.filter((item) => item.type === "message")
        .map((item) =>
          item.content
            .filter((content) => content.type === "output_text")
            .map((text) => text.text)
            .join("\n")
        )
        .join("\n")
        .trim() || "";

    const parsed = extractJson(raw);
    if (!parsed) {
      return null;
    }

    const sanitizeKeywords = (keywords: unknown): string[] => {
      if (!Array.isArray(keywords)) {
        return [];
      }

      return keywords
        .map((kw) => (typeof kw === "string" ? kw.trim() : ""))
        .filter((kw) => kw.length > 0)
        .slice(0, 5);
    };

    const normalizeNumber = (value: unknown): number | undefined => {
      if (typeof value === "number" && Number.isFinite(value)) {
        return value;
      }
      if (typeof value === "string") {
        const num = Number(value.replace(/[^0-9.]/g, ""));
        if (!Number.isNaN(num)) {
          return num;
        }
      }
      return undefined;
    };

    const location =
      typeof parsed.location === "string" && parsed.location.trim().length > 0
        ? parsed.location.trim()
        : undefined;

    const maxPrice =
      normalizeNumber(parsed.maxPrice ?? parsed.priceMax ?? parsed.budget) ??
      undefined;

    const minPrice =
      normalizeNumber(parsed.minPrice ?? parsed.priceMin) ?? undefined;

    const keywords = sanitizeKeywords(parsed.keywords);

    return {
      location,
      maxPrice,
      minPrice,
      keywords,
    };
  } catch (error) {
    console.warn("Failed to interpret query with OpenAI:", error);
    return null;
  }
};
