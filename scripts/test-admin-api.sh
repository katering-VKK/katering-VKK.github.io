#!/bin/bash
# Тест адмін API (auth, health, upload, products)
# Використання: ./scripts/test-admin-api.sh [BASE_URL]
BASE="${1:-https://lumu-pearl.vercel.app}"
TOKEN="lumu-admin-2024"
PIXEL="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

echo "=== Тест API: $BASE ==="
echo ""

echo "1. Auth"
AUTH=$(curl -s -X POST "$BASE/api/admin/auth" -H "Content-Type: application/json" -d "{\"password\":\"$TOKEN\"}")
echo "$AUTH"
if echo "$AUTH" | grep -q '"ok":true'; then echo "   ✓ OK"; else echo "   ✗ FAIL"; exit 1; fi
echo ""

echo "2. Health"
HEALTH=$(curl -s "$BASE/api/admin/health")
echo "$HEALTH"
if echo "$HEALTH" | grep -q '"configured":true'; then echo "   ✓ OK"; else echo "   ✗ FAIL"; exit 1; fi
echo ""

echo "3. Upload"
UPLOAD=$(curl -s -X POST "$BASE/api/admin/upload-image" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"base64\":\"$PIXEL\",\"productId\":99997,\"ext\":\"jpg\",\"token\":\"$TOKEN\"}")
echo "$UPLOAD"
if echo "$UPLOAD" | grep -q '"ok":true'; then echo "   ✓ OK"; else echo "   ✗ FAIL"; exit 1; fi
echo ""

echo "4. Products (PUT)"
PRODUCTS=$(curl -s -X PUT "$BASE/api/admin/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"products":[{"id":1,"name":"Test","price":"100 ₴","category":"Книги","tag":""},{"id":2,"name":"Тест іграшка","price":"200 ₴","category":"Іграшки","tag":"New"}],"token":"'$TOKEN'"}')
echo "$PRODUCTS"
if echo "$PRODUCTS" | grep -q '"ok":true'; then echo "   ✓ OK"; else echo "   ✗ FAIL"; exit 1; fi
echo ""

echo "=== Всі тести пройдено ✓ ==="
