// Web Search Integration for Stephly AI

export interface SearchResult {
  title: string;
  snippet: string;
  link: string;
}

/**
 * Detect if user query needs web search
 */
export const needsWebSearch = (query: string): boolean => {
  const lowerQuery = query.toLowerCase();
  
  // Questions that definitely need search
  const searchPatterns = [
    /what (is|are|was|were)/,
    /who (is|are|was|were)/,
    /when (did|is|was)/,
    /where (is|are|was)/,
    /how (much|many|does)/,
    /latest/,
    /current/,
    /today/,
    /now/,
    /recent/,
    /price/,
    /cost/,
    /rate/,
    /weather/,
    /news/,
    /bitcoin/,
    /crypto/,
    /dollar/,
    /exchange/,
    /president/,
    /capital/,
  ];

  return searchPatterns.some(pattern => pattern.test(lowerQuery));
};

/**
 * Perform web search using Google Custom Search API (high quality results)
 */
export const searchWithGoogle = async (query: string): Promise<SearchResult[]> => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_SEARCH_API_KEY;
  const searchEngineId = process.env.NEXT_PUBLIC_GOOGLE_SEARCH_ENGINE_ID;

  if (!apiKey || !searchEngineId || apiKey === 'YOUR_SEARCH_API_KEY_HERE') {
    console.log('⚠️ Google Search: No API key configured');
    return [];
  }

  try {
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}&num=3`;
    
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Google Search API error:', response.status, errorData);
      
      // If 400 error, the API key might need to be restricted or there's a config issue
      if (response.status === 400) {
        console.error('💡 Tip: Make sure API key is restricted to "Custom Search API" in Google Cloud Console');
      }
      
      return [];
    }

    const data = await response.json();
    const results: SearchResult[] = [];

    if (data.items && Array.isArray(data.items)) {
      data.items.slice(0, 3).forEach((item: any) => {
        results.push({
          title: item.title || 'Result',
          snippet: item.snippet || '',
          link: item.link || '',
        });
      });
    }

    return results;
  } catch (error) {
    console.error('❌ Google Search error:', error);
    return [];
  }
};

/**
 * Perform web search using DuckDuckGo (free fallback, no API key needed)
 */
export const searchWithDuckDuckGo = async (query: string): Promise<SearchResult[]> => {
  try {
    const response = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`
    );

    const data = await response.json();
    const results: SearchResult[] = [];

    // Get abstract
    if (data.Abstract) {
      results.push({
        title: data.Heading || 'Web Result',
        snippet: data.Abstract,
        link: data.AbstractURL || '',
      });
    }

    // Get related topics
    if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
      data.RelatedTopics.slice(0, 3).forEach((topic: any) => {
        if (topic.Text && topic.FirstURL) {
          results.push({
            title: topic.Text.split(' - ')[0] || 'Result',
            snippet: topic.Text,
            link: topic.FirstURL,
          });
        }
      });
    }

    return results.slice(0, 3);
  } catch (error) {
    console.error('DuckDuckGo search error:', error);
    return [];
  }
};

/**
 * Format search results for AI context
 */
export const formatSearchResults = (results: SearchResult[]): string => {
  if (results.length === 0) return '';

  return `
🔍 Web Search Results:
${results.map((r, i) => `
${i + 1}. ${r.title}
   ${r.snippet}
   Source: ${r.link}
`).join('\n')}
`;
};

/**
 * Search with intelligent fallback chain:
 * 1. Google Custom Search (most accurate, requires API key)
 * 2. DuckDuckGo (free, decent results)
 * 3. Wikipedia (factual fallback)
 */
export const searchWithFallback = async (query: string): Promise<SearchResult[]> => {
  // Try Google Custom Search first (best quality)
  let results = await searchWithGoogle(query);
  
  if (results.length > 0) {
    console.log('✅ Search: Google Custom Search');
    return results;
  }

  // Fallback to DuckDuckGo
  results = await searchWithDuckDuckGo(query);
  
  if (results.length > 0) {
    console.log('✅ Search: DuckDuckGo');
    return results;
  }

  // Final fallback to Wikipedia
  try {
    const wikiResponse = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`
    );
    
    if (wikiResponse.ok) {
      const wikiData = await wikiResponse.json();
      if (wikiData.extract) {
        console.log('✅ Search: Wikipedia');
        results.push({
          title: wikiData.title,
          snippet: wikiData.extract,
          link: wikiData.content_urls?.desktop?.page || '',
        });
      }
    }
  } catch (error) {
    console.error('Wikipedia search error:', error);
  }

  return results;
};
