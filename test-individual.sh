#!/bin/bash

# 各テストファイルを個別に実行するスクリプト

cd "/Users/ishidakouki/Desktop/HRシステム(個人開発)/backend"

echo "=========================================="
echo "1. employee.controller.test.ts"
echo "=========================================="
npm test -- --testPathPattern="employee.controller.test.ts" 2>&1 | tail -30
echo ""

echo "=========================================="
echo "2. request.controller.test.ts"
echo "=========================================="
npm test -- --testPathPattern="request.controller.test.ts" 2>&1 | tail -30
echo ""

echo "=========================================="
echo "3. employee.service.test.ts"
echo "=========================================="
npm test -- --testPathPattern="employee.service.test.ts" 2>&1 | tail -30
echo ""

echo "=========================================="
echo "4. request.service.test.ts"
echo "=========================================="
npm test -- --testPathPattern="request.service.test.ts" 2>&1 | tail -30
echo ""

echo "=========================================="
echo "5. employee.repository.test.ts"
echo "=========================================="
npm test -- --testPathPattern="employee.repository.test.ts" 2>&1 | tail -30
echo ""

echo "=========================================="
echo "すべてのテスト実行完了"
echo "=========================================="
