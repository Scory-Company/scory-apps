#!/bin/bash

# ====================================================================
# API Test Examples for Re-Simplify Feature
# ====================================================================
#
# Usage:
#   1. Replace {TOKEN} with actual JWT token
#   2. Replace {ARTICLE_ID} with actual article UUID
#   3. Run each command to test endpoints
#
# ====================================================================

# Configuration
BASE_URL="http://192.168.1.53:5000/api/v1"
# BASE_URL="http://localhost:5000/api/v1"  # Alternative for local testing

# Get your token first (login)
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  # Replace with actual token

# Test article ID (replace after first simplify)
ARTICLE_ID="123e4567-e89b-12d3-a456-426614174000"

# ====================================================================
# TEST 1: Simplify External Paper (Create Initial Article)
# ====================================================================
echo "==================================================================="
echo "TEST 1: Simplify External Paper"
echo "==================================================================="

curl -X POST "${BASE_URL}/simplify/external" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "externalId": "https://openalex.org/W2964146389",
    "source": "openalex",
    "title": "Protist literacy: A novel concept of protist learning in higher education",
    "authors": ["Christina Bauer", "Anja Lembens"],
    "year": 2024,
    "abstract": "This study introduces the concept of protist literacy...",
    "readingLevel": "EXPERT"
  }' | jq

echo ""
echo "✅ Copy the 'articleId' from response and use it in next tests"
echo ""

# ====================================================================
# TEST 2: Re-Simplify to STUDENT Level
# ====================================================================
echo "==================================================================="
echo "TEST 2: Re-Simplify Article to STUDENT Level"
echo "==================================================================="

curl -X POST "${BASE_URL}/simplify/${ARTICLE_ID}/resimplify" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "readingLevel": "STUDENT"
  }' | jq

echo ""

# ====================================================================
# TEST 3: Re-Simplify to ACADEMIC Level
# ====================================================================
echo "==================================================================="
echo "TEST 3: Re-Simplify Article to ACADEMIC Level"
echo "==================================================================="

curl -X POST "${BASE_URL}/simplify/${ARTICLE_ID}/resimplify" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "readingLevel": "ACADEMIC"
  }' | jq

echo ""

# ====================================================================
# TEST 4: Re-Simplify to SIMPLE Level
# ====================================================================
echo "==================================================================="
echo "TEST 4: Re-Simplify Article to SIMPLE Level"
echo "==================================================================="

curl -X POST "${BASE_URL}/simplify/${ARTICLE_ID}/resimplify" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "readingLevel": "SIMPLE"
  }' | jq

echo ""

# ====================================================================
# TEST 5: Get Article By ID (Check All Levels)
# ====================================================================
echo "==================================================================="
echo "TEST 5: Get Article By ID"
echo "==================================================================="

curl -X GET "${BASE_URL}/articles/by-id/${ARTICLE_ID}" \
  -H "Authorization: Bearer ${TOKEN}" | jq

echo ""

# ====================================================================
# TEST 6: Get Article By Slug (Original endpoint)
# ====================================================================
echo "==================================================================="
echo "TEST 6: Get Article By Slug (for comparison)"
echo "==================================================================="

# Get slug from previous response
SLUG="protist-literacy-novel-concept-2024"

curl -X GET "${BASE_URL}/articles/${SLUG}" \
  -H "Authorization: Bearer ${TOKEN}" | jq

echo ""

# ====================================================================
# TEST 7: Re-Simplify to Existing Level (Should Return Cached)
# ====================================================================
echo "==================================================================="
echo "TEST 7: Re-Simplify to Existing Level (Test Cache)"
echo "==================================================================="

curl -X POST "${BASE_URL}/simplify/${ARTICLE_ID}/resimplify" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "readingLevel": "STUDENT"
  }' | jq

echo ""
echo "✅ This should return quickly (cached, no AI generation)"
echo ""

# ====================================================================
# ERROR TESTS
# ====================================================================

echo "==================================================================="
echo "ERROR TEST 1: Invalid Reading Level"
echo "==================================================================="

curl -X POST "${BASE_URL}/simplify/${ARTICLE_ID}/resimplify" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "readingLevel": "INVALID_LEVEL"
  }' | jq

echo ""

echo "==================================================================="
echo "ERROR TEST 2: Article Not Found"
echo "==================================================================="

curl -X POST "${BASE_URL}/simplify/00000000-0000-0000-0000-000000000000/resimplify" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "readingLevel": "STUDENT"
  }' | jq

echo ""

echo "==================================================================="
echo "ERROR TEST 3: Get Article By ID - Not Found"
echo "==================================================================="

curl -X GET "${BASE_URL}/articles/by-id/00000000-0000-0000-0000-000000000000" \
  -H "Authorization: Bearer ${TOKEN}" | jq

echo ""

# ====================================================================
# HEALTH CHECK
# ====================================================================

echo "==================================================================="
echo "HEALTH CHECK: Simplify Service"
echo "==================================================================="

curl -X GET "${BASE_URL}/simplify/health" | jq

echo ""

# ====================================================================
# PERFORMANCE TEST
# ====================================================================

echo "==================================================================="
echo "PERFORMANCE TEST: Measure Re-Simplify Time"
echo "==================================================================="

echo "Starting timer..."
START_TIME=$(date +%s)

curl -X POST "${BASE_URL}/simplify/${ARTICLE_ID}/resimplify" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "readingLevel": "STUDENT"
  }' | jq

END_TIME=$(date +%s)
ELAPSED=$((END_TIME - START_TIME))

echo ""
echo "⏱️  Re-simplify took: ${ELAPSED} seconds"
echo "✅ Expected: 20-30 seconds for new level, <2 seconds for cached"
echo ""

# ====================================================================
# END
# ====================================================================

echo "==================================================================="
echo "ALL TESTS COMPLETED"
echo "==================================================================="
echo ""
echo "Summary:"
echo "✅ TEST 1: Create initial article with EXPERT level"
echo "✅ TEST 2-4: Re-simplify to different levels"
echo "✅ TEST 5-6: Get article by ID and slug"
echo "✅ TEST 7: Cache test (should be fast)"
echo "✅ ERROR TESTS: Invalid requests"
echo "✅ HEALTH CHECK: Service status"
echo "✅ PERFORMANCE TEST: Timing"
echo ""
echo "Next Steps:"
echo "1. Check database to verify all levels are saved"
echo "2. Test in frontend app"
echo "3. Monitor AI costs"
echo ""
