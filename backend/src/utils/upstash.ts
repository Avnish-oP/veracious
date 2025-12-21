import { Search } from "@upstash/search";

// Using hardcoded credentials as per request
const UPSTASH_SEARCH_URL = process.env.UPSTASH_SEARCH_URL;
const UPSTASH_SEARCH_TOKEN = process.env.UPSTASH_SEARCH_TOKEN;

const client = new Search({
  url: UPSTASH_SEARCH_URL,
  token: UPSTASH_SEARCH_TOKEN,
});

// Explicitly typing as any to avoid "exported anonymous class type" error
// because @upstash/search does not export the SearchIndex class.
export const searchIndex: any = client.index("products");
