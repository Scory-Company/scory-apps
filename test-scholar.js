// Simple test script untuk Google Scholar API
// Run with: node test-scholar.js

const axios = require('axios');

const SERPAPI_KEY = 'aa2ac5239676cd359d6a0da68a1f57cbbe232ed6d3d5dfa7220d76ae222ae303';
const SERPAPI_URL = 'https://serpapi.com/search.json';

async function testScholarAPI() {
  console.log('🔬 Testing Google Scholar API via SerpAPI...\n');

  try {
    const response = await axios.get(SERPAPI_URL, {
      params: {
        engine: 'google_scholar',
        q: 'machine learning',
        api_key: SERPAPI_KEY,
        num: 5,
        hl: 'en',
      },
    });

    console.log('✅ API Connection Successful!\n');
    console.log('📊 Search Results:\n');

    if (response.data.organic_results) {
      response.data.organic_results.forEach((article, index) => {
        console.log(`${index + 1}. ${article.title}`);
        console.log(`   Author: ${article.publication_info?.authors?.[0]?.name || 'Unknown'}`);
        console.log(`   Citations: ${article.inline_links?.cited_by?.total || 0}`);
        console.log(`   Year: ${article.publication_info?.summary?.match(/\d{4}/)?.[0] || 'N/A'}`);
        console.log(`   Link: ${article.link || 'N/A'}`);
        console.log('');
      });

      console.log(`\n📈 Total Results: ${response.data.search_information?.total_results || 0}`);
      console.log(`⏱️  Time Taken: ${response.data.search_metadata?.total_time_taken || 0}s`);
    }

  } catch (error) {
    console.error('❌ API Error:', error.response?.data || error.message);
  }
}

testScholarAPI();
