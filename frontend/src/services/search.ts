import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1";

export const searchProducts = async (
  query: string,
  options: { limit?: number; offset?: number; sort?: string; filter?: string } = {}
) => {
  try {
    const params = new URLSearchParams({ query });
    if (options.limit) params.append("limit", options.limit.toString());
    if (options.offset) params.append("offset", options.offset.toString());
    if (options.sort) params.append("sort", options.sort);
    if (options.filter) params.append("filter", options.filter);

    const response = await axios.get(`${API_URL}/search?${params.toString()}`);
    return response.data.results;
  } catch (error) {
    console.error("Search API Error:", error);
    return [];
  }
};

export const getSearchSuggestions = async (query: string) => {
  try {
    const response = await axios.get(`${API_URL}/search/suggestions`, {
      params: { query },
    });
    return response.data.suggestions;
  } catch (error) {
    console.error("Search Suggestions Error:", error);
    return [];
  }
};
