# 快速开始 - 在线构建 APK

## 方法 1：使用 GitHub Actions（推荐，免费）

### 步骤 1：创建 GitHub 仓库

1. 访问 https://github.com/new
2. 创建新仓库（例如：mp3-player）
3. 不要勾选 "Add a README file"

### 步骤 2：上传项目

在项目目录执行：

```bash
git init
git add .
git commit -m "Initial commit: MP3 Player"
git branch -M main
git remote add origin https://github.com/你的用户名/mp3-player.git
git push -u origin main
```

### 步骤 3：等待自动构建

1. 推送后，GitHub Actions 会自动开始构建
2. 访问仓库的 "Actions" 标签页查看进度
3. 构建完成后（约 5-10 分钟），在 "Artifacts" 中下载 APK

### 步骤 4：下载 APK

1. 点击已完成的 workflow
2. 在页面底部找到 "Artifacts"
3. 下载 `app-debug` 或 `app-release`
4. 解压后得到 APK 文件

---

## 方法 2：本地构建（需要 Android SDK）

### 前提条件

1. **Java JDK 17**
   ```bash
   # macOS
   brew install openjdk@17

   # Linux
   sudo apt install openjdk-17-jdk

   # Windows - 下载安装
   # https://adoptium.net/temurin/releases/?version=17
   ```

2. **Android SDK**
   - 安装 Android Studio: https://developer.android.com/studio
   - 或仅安装命令行工具: https://developer.android.com/studio#command-tools

3. **Node.js 18+**
   - 下载: https://nodejs.org/

### 构建步骤

```bash
# 1. 解压项目
tar -xzf mp3-player-complete.tar.gz
cd mp3-player

# 2. 安装依赖
npm install

# 3. 添加 Android 平台
npx cap add android

# 4. 同步项目
npx cap sync android

# 5. 构建 APK
cd android
./gradlew assembleDebug

# APK 位置
# android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 方法 3：使用 Android Studio（最简单）

### 步骤 1：准备环境

1. 安装 Android Studio: https://developer.android.com/studio
2. 安装 Node.js: https://nodejs.org/

### 步骤 2：构建项目

```bash
tar -xzf mp3-player-complete.tar.gz
cd mp3-player
npm install
npx cap add android
npx cap sync android
npx cap open android
```

### 步骤 3：在 Android Studio 中构建

1. 等待 Gradle 同步完成
2. 点击菜单 `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
3. APK 生成在：`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 安装到手机

### USB 安装

```bash
# 开启手机 USB 调试模式
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### 直接安装

1. 将 APK 传输到手机
2. 在手机上打开 APK 文件
3. 允许安装未知来源应用
4. 完成安装

---

## 项目文件说明

```
mp3-player/
├── index.html              # 应用主页面
├── renderer.js             # 播放器逻辑
├── package.json            # 项目配置
├── capacitor.config.json   # Capacitor 配置
├── www/                    # Web 资源目录
├── .github/workflows/      # GitHub Actions 配置
│   └── build-apk.yml       # 自动构建配置
├── BUILD.md                # 详细构建指南
└── README.md               # 项目说明
```

---

## 功能说明

- **播放模式**：顺序播放、随机播放、单曲循环
- **播放次数**：播放 1 次、播放 2 次、循环播放
- **文件管理**：支持添加多个音频文件
- **选中播放**：可勾选特定歌曲进行播放
- **进度控制**：可拖动进度条跳转
- **音量调节**：内置音量控制

---

## 需要帮助？

如果遇到问题，请查看 `BUILD.md` 文件中的详细说明和常见问题解答。
