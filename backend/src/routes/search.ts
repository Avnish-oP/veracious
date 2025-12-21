import { Router, Request, Response } from "express";
import { searchIndex } from "../utils/upstash";

const router = Router();

// Search Products
router.get("/", async (req: Request, res: Response) => {
  try {
    const { query, limit = 20, offset = 0, sort, filter } = req.query;

    if (!query) {
      return res.status(400).json({ success: false, message: "Query parameter is required" });
    }

    const searchOptions: any = {
      limit: Number(limit),
      offset: Number(offset),
    };

    // Add filtering if provided (e.g., "price > 100 AND category = 'Sunglasses'")
    if (filter) {
      searchOptions.filter = String(filter);
    }
    
    // Add sorting if provided (e.g., "price:desc")
    // Upstash search sort format might differ, usually it's passed in options
    // Checking upstash docs: options.sort is not directly in the search method payload in the user snippet
    // But commonly supported. The user snippet only showed filter. 
    // We will assume basic search for now.
    
    const results = await searchIndex.search({
      query: String(query),
      ...searchOptions
    });

    // Results from upstash are usually { id, score, metadata } or similar
    // We might need to fetch full product details from DB or rely on metadata if we stored enough.
    // For now returning what Upstash returns.

    return res.status(200).json({
      success: true,
      results: results,
    });
  } catch (error: any) {
    console.error("Search Error:", error);
    return res.status(500).json({ success: false, message: "Search failed", error: error.message });
  }
});

// Search Suggestions
router.get("/suggestions", async (req: Request, res: Response) => {
  try {
    const { query } = req.query;

    if (!query || String(query).length < 2) {
        return res.status(200).json({ success: true, suggestions: [] });
    }
    
    // Using search with limit 5 for suggestions, or specific suggestion API if available. 
    // Upstash Search doesn't strictly have a "suggestion" endpoint separate from search,
    // but we can search prefixes or use specific logic. 
    // We'll use a simple search with limit 5.
    
    const results = await searchIndex.search({
        query: String(query),
        limit: 5,
    });

    // formatting suggestions
    const suggestions = results.map((hit: any) => ({
        id: hit.id,
        text: hit.metadata?.name || hit.id,
        image: hit.metadata?.image || null,
        slug: hit.metadata?.slug,
        price: hit.metadata?.price
    }));

    return res.status(200).json({
      success: true,
      suggestions: suggestions,
    });
  } catch (error: any) {
    console.error("Suggestion Error:", error);
    return res.status(500).json({ success: false, message: "Failed to get suggestions" });
  }
});

export default router;
