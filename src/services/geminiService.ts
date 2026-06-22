import { GoogleGenAI, Type } from "@google/genai";

// Use environment variables for the API key depending on if we are in Vite or Vercel Node
const getAi = () => new GoogleGenAI({ 
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || process.env.API_KEY || process.env.GEMINI_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY || '' 
});

export interface ExtractedRecipe {
  title: string;
  ingredients: string[];
  instructions: string[];
  category: string;
  estimatedTime?: number;
}

const recipeSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
    instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
    category: { type: Type.STRING, description: "One of: Breakfast, Lunch, Dinner, Dessert, Snack, Drink, Other" },
    estimatedTime: { type: Type.NUMBER, description: "The estimated total time to make this recipe in minutes" }
  },
  required: ["title", "ingredients", "instructions", "category"]
};

export async function extractRecipeFromUrl(url: string): Promise<ExtractedRecipe> {
  try {
    if (!url.startsWith('http')) {
      throw new Error("Please enter a valid URL starting with http:// or https://");
    }

    const contents = [
      { text: `I need you to extract a recipe from this specific URL: ${url}` },
      { text: `Please use your tools to access the content of the page at ${url}.
      CRITICAL INSTRUCTION: Many recipe pages are very long and filled with ads or life stories. To find the actual recipe, you MUST search the page content for the exact words "ingredients", "directions", or "instructions". The recipe will be located near these keywords.
      
      Extract the following information in JSON format:
      - title: The name of the recipe
      - ingredients: An array of strings, each being one ingredient with its amount
      - instructions: An array of strings, each being one step of the recipe
      - category: One of [Breakfast, Lunch, Dinner, Dessert, Snack, Drink, Other]
      - estimatedTime: The estimated total time to make this recipe in minutes (number)
      
      Focus only on the recipe itself. Ignore the blog post text, ads, and comments.` }
    ];

    const response = await getAi().models.generateContent({
      model: "gemini-3-flash-preview",
      contents,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: recipeSchema
      }
    });

    const text = response.text;
    if (!text || text.trim() === "{}" || text.trim() === "[]") {
      throw new Error("The AI couldn't find a recipe at that URL. The website might be blocking access or the layout might be too complex.");
    }

    const jsonStr = text.replace(/```json\n?|\n?```/g, '').trim();
    let parsed: any;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (e) {
      console.error("JSON Parse Error:", text);
      throw new Error("The AI returned data in an unexpected format. Please try again.");
    }
    
    if (!parsed.title || !parsed.ingredients || parsed.ingredients.length === 0) {
      throw new Error("The AI found the page but couldn't identify a complete recipe. You might need to add this one manually.");
    }
    
    return parsed as ExtractedRecipe;
  } catch (error) {
    console.error("Error in extractRecipeFromUrl:", error);
    if (error instanceof Error) {
      if (error.message.includes("URL") || error.message.includes("AI") || error.message.includes("format") || error.message.includes("recipe")) {
        throw error;
      }
    }
    throw new Error("We had trouble reaching that website. Please try another URL or add the recipe manually.");
  }
}

export async function generateRecipe(category: string, details: string): Promise<ExtractedRecipe> {
  const prompt = `Act as a professional chef. Generate a high-quality, delicious recipe for a ${category}. 
  ${details ? `The user has requested the following specific details or ingredients: ${details}` : ''}
  Please provide a creative title, a list of ingredients with measurements, and step-by-step instructions.`;

  const response = await getAi().models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: recipeSchema
    }
  });

  const text = response.text;
  if (!text) throw new Error("Failed to generate recipe.");
  return JSON.parse(text) as ExtractedRecipe;
}

export async function compressImage(base64Str: string, maxWidth = 800, quality = 0.7): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64Str);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(base64Str);
  });
}

const CURATED_FOOD_IMAGES = [
  { id: 'photo-1482049016688-2d3e1b311543', tags: 'eggs, breakfast, toast, avocado, brunch' },
  { id: 'photo-1504674900247-0877df9cc836', tags: 'steak, meat, dinner, gourmet, beef' },
  { id: 'photo-1512621776951-a57141f2eefd', tags: 'salad, healthy, lunch, vegetables, green' },
  { id: 'photo-1563729784474-d77dbb933a9e', tags: 'cake, dessert, sweet, baking, chocolate' },
  { id: 'photo-1546069901-ba9599a7e63c', tags: 'bowl, healthy, lunch, quinoa, buddha bowl' },
  { id: 'photo-1565299624946-b28f40a0ae38', tags: 'pizza, italian, dinner, cheese, pepperoni' },
  { id: 'photo-1473093226795-af9932fe5856', tags: 'pasta, italian, dinner, tomato, spaghetti' },
  { id: 'photo-1528207776546-365bb710ee93', tags: 'pancakes, breakfast, syrup, sweet, stack' },
  { id: 'photo-1555939594-58d7cb561ad1', tags: 'bbq, meat, grill, dinner, skewers' },
  { id: 'photo-1540189549336-e6e99c3679fe', tags: 'salad, healthy, lunch, gourmet, salmon' },
  { id: 'photo-1565958011703-44f9829ba187', tags: 'dessert, cheesecake, sweet, berries, fruit' },
  { id: 'photo-1484723091739-30a097e8f929', tags: 'toast, breakfast, fruit, healthy, french toast' },
  { id: 'photo-1476224489421-aba8c155111a', tags: 'dinner, gourmet, plated, professional, seafood' },
  { id: 'photo-1517701550927-30cf4ba1dba5', tags: 'coffee, drink, breakfast, cafe, latte' },
  { id: 'photo-1544145945-f904253d0c7b', tags: 'cocktail, drink, bar, party, mojito' },
  { id: 'photo-1551024506-0bccd828d307', tags: 'donuts, dessert, sweet, snack, glazed' },
  { id: 'photo-1543339308-43e59d6b73a6', tags: 'snack, healthy, fruit, nuts, platter' },
  { id: 'photo-1562967914-608f82629710', tags: 'chicken, dinner, roasted, meat, poultry' },
  { id: 'photo-1493770348161-369560ae357d', tags: 'breakfast, healthy, fruit, bowl, smoothie' },
  { id: 'photo-1543353071-873f17a7a088', tags: 'soup, lunch, dinner, warm, bowl' },
  { id: 'photo-1511690656952-34342bb7c2f2', tags: 'food, table, spread, variety, feast' },
  { id: 'photo-1504113888839-1c8eb50233d3', tags: 'japanese, sushi, dinner, fish, rolls' },
  { id: 'photo-1551183053-bf91a1d81141', tags: 'pie, dessert, baking, fruit, crust' },
  { id: 'photo-1541014741259-de529411b96a', tags: 'burger, fast food, lunch, dinner, fries' },
  { id: 'photo-1513104890138-7c749659a591', tags: 'pizza, italian, cheese, dinner, fast food' },
  { id: 'photo-1432139555190-58524dae6a55', tags: 'meat, steak, dinner, gourmet, beef' },
  { id: 'photo-1467003909585-2f8a72700288', tags: 'salmon, fish, dinner, healthy, seafood' },
  { id: 'photo-1470333738027-550397360af1', tags: 'cocktail, drink, bar, party, alcohol' },
  { id: 'photo-1490645935967-10de6ba17061', tags: 'salad, healthy, lunch, vegetables, vegan' },
  { id: 'photo-1506084868730-342b1f852e0d', tags: 'breakfast, healthy, bowl, fruit, granola' }
];

export async function generateRecipeImage(prompt: string, category?: string): Promise<string> {
  // Bypass image generation because the free API key doesn't support it.
  try {
    const categoryMatch = CURATED_FOOD_IMAGES.find(img => img.tags.includes((category || '').toLowerCase()));
    
    // Choose a fallback ID safely
    let fallbackId = CURATED_FOOD_IMAGES[0].id;
    if (categoryMatch) {
      fallbackId = categoryMatch.id;
    }
    
    return `https://images.unsplash.com/${fallbackId}?auto=format&fit=crop&q=80&w=1000`;
  } catch (error) {
    console.error("Failed to select curated image:", error);
    // Returning a beautiful default food placeholder image from Unsplash instead.
    return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80";
  }
}
