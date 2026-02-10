#!/bin/bash
cd ~/CodeWorkspace/hypeproof/web
npm run build 2>&1 | tail -5
if [ $? -eq 0 ]; then
  npx vercel --prod --yes 2>&1 | grep -E "(Production:|Error:|Aliased:)"
else
  echo "BUILD FAILED"
  exit 1
fi
