# APK 构建指南

## 前提条件

### 1. 安装 Java JDK 17

**Windows:**
```bash
# 下载并安装 JDK 17
# https://adoptium.net/temurin/releases/?version=17
```

**macOS:**
```bash
brew install openjdk@17
```

**Linux:**
```bash
sudo apt install openjdk-17-jdk
```

### 2. 安装 Android SDK

**方法 1：安装 Android Studio（推荐）**
1. 下载 Android Studio: https://developer.android.com/studio
2. 安装后打开，它会自动安装 Android SDK
3. 在 Android Studio 中安装 SDK Build-Tools 34

**方法 2：仅安装 Android SDK 命令行工具**
1. 下载: https://developer.android.com/studio#command-tools
2. 解压到 `~/Android/Sdk` (Linux/macOS) 或 `%LOCALAPPDATA%\Android\Sdk` (Windows)
3. 设置环境变量：
   ```bash
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

### 3. 安装 Node.js

确保安装 Node.js 18+ : https://nodejs.org/

## 构建步骤

### 1. 解压项目

```bash
tar -xzf mp3-player-android.tar.gz
cd mp3-player
```

### 2. 安装依赖

```bash
npm install
```

### 3. 添加 Android 平台

```bash
npx cap add android
```

### 4. 同步项目

```bash
npx cap sync android
```

### 5. 构建 APK

**方法 1：使用命令行（需要 Android SDK）**

```bash
cd android
./gradlew assembleDebug
```

APK 文件位置：
```
android/app/build/outputs/apk/debug/app-debug.apk
```

**方法 2：使用 Android Studio（推荐）**

```bash
npx cap open android
```

然后在 Android Studio 中：
1. 等待 Gradle 同步完成
2. 点击 `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
3. APK 文件在：`android/app/build/outputs/apk/debug/app-debug.apk`

## 生成正式版 APK

### 1. 创建签名密钥

```bash
keytool -genkey -v -keystore mp3player.keystore -alias mp3player -keyalg RSA -keysize 2048 -validity 10000
```

### 2. 配置签名

编辑 `android/app/build.gradle`，在 `android` 块中添加：

```gradle
signingConfigs {
    release {
        storeFile file('../../mp3player.keystore')
        storePassword '你的密码'
        keyAlias 'mp3player'
        keyPassword '你的密码'
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled false
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

### 3. 构建正式版

```bash
cd android
./gradlew assembleRelease
```

APK 文件位置：
```
android/app/build/outputs/apk/release/app-release.apk
```

## 安装到手机

### 方法 1：USB 调试

1. 手机开启开发者模式和 USB 调试
2. 连接手机到电脑
3. 运行：`adb install android/app/build/outputs/apk/debug/app-debug.apk`

### 方法 2：直接安装

1. 将 APK 文件传输到手机
2. 在手机上打开 APK 文件
3. 允许安装未知来源应用
4. 完成安装

## 常见问题

### Q: Gradle 下载很慢怎么办？
A: 可以配置国内镜像。编辑 `android/build.gradle`：

```gradle
allprojects {
    repositories {
        maven { url 'https://maven.aliyun.com/repository/google' }
        maven { url 'https://maven.aliyun.com/repository/public' }
        google()
        mavenCentral()
    }
}
```

### Q: 提示 SDK 版本不匹配？
A: 在 Android Studio 中打开 SDK Manager，安装对应的 SDK 版本。

### Q: 构建失败？
A: 检查：
1. Java 版本是否为 17
2. ANDROID_HOME 环境变量是否正确
3. Android SDK Build-Tools 是否已安装

## 在线构建服务

如果没有本地环境，可以使用在线构建服务：

1. **GitHub Actions**（免费）
   - 上传项目到 GitHub
   - 配置 GitHub Actions 自动构建

2. **App Center**（微软，免费）
   - https://appcenter.ms/
   - 上传项目自动构建

3. **Bitrise**（免费额度）
   - https://www.bitrise.io/
   - 支持 Android 构建

## 需要帮助？

如果遇到问题，请提供：
1. 操作系统版本
2. Java 版本（`java -version`）
3. Android SDK 版本
4. 完整的错误信息
