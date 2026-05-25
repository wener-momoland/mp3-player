#!/bin/bash

echo "================================"
echo "  MP3 Player 安装脚本"
echo "================================"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未检测到 Node.js，请先安装 Node.js (https://nodejs.org/)"
    exit 1
fi

echo "✓ Node.js 版本: $(node -v)"
echo ""

# 安装依赖
echo "正在安装依赖..."
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ 依赖安装成功！"
    echo ""
    echo "================================"
    echo "  安装完成"
    echo "================================"
    echo ""
    echo "运行方式："
    echo "  开发模式: npm start"
    echo "  打包应用: npm run build-mac (macOS)"
    echo "           npm run build-win (Windows)"
    echo "           npm run build-linux (Linux)"
    echo ""
else
    echo ""
    echo "❌ 依赖安装失败，请检查网络连接或 npm 配置"
    exit 1
fi
