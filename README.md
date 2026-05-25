# MP3 Player - Android APK 版本

极简的本地 MP3 播放器，支持打包为 Android APK 安装包。

## 功能特性

- **播放模式**：顺序播放、随机播放、单曲循环
- **播放次数**：播放 1 次、播放 2 次、循环播放
- **文件管理**：支持添加多个音频文件（MP3、WAV、OGG、M4A、FLAC）
- **选中播放**：可勾选特定歌曲进行播放
- **进度控制**：可拖动进度条跳转
- **音量调节**：内置音量控制

## 技术栈

- **前端**：原生 HTML/CSS/JavaScript
- **打包工具**：Capacitor 6.0
- **目标平台**：Android 5.0+ (API 21+)

## 快速开始

### 1. 安装依赖

```bash
cd mp3-player
npm install
```

### 2. 本地预览

```bash
npm run serve
```

访问 `http://localhost:8080` 在浏览器中预览应用。

### 3. 添加 Android 平台

```bash
npx cap add android
```

### 4. 同步到 Android

```bash
npm run build:android
```

### 5. 打开 Android Studio

```bash
npm run open:android
```

### 6. 生成 APK

在 Android Studio 中：

1. 等待 Gradle 同步完成
2. 点击菜单 `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
3. APK 文件生成在：`android/app/build/outputs/apk/debug/app-debug.apk`

## 打包为正式版 APK

### 1. 生成签名密钥

```bash
keytool -genkey -v -keystore mp3player.keystore -alias mp3player -keyalg RSA -keysize 2048 -validity 10000
```

### 2. 配置签名

在 `android/app/build.gradle` 中添加：

```gradle
android {
    ...
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
}
```

### 3. 生成正式版 APK

在 Android Studio 中：

1. 点击菜单 `Build` → `Generate Signed Bundle / APK`
2. 选择 `APK`
3. 选择密钥库文件并输入密码
4. 选择 `release` 构建变体
5. APK 生成在：`android/app/build/outputs/apk/release/app-release.apk`

## 安装到手机

### 方法 1：通过 USB 调试

1. 手机开启开发者模式和 USB 调试
2. 连接手机到电脑
3. 在 Android Studio 中点击 `Run` 按钮

### 方法 2：直接安装 APK

1. 将 APK 文件传输到手机
2. 在手机上打开 APK 文件
3. 允许安装未知来源应用
4. 完成安装

## 使用说明

1. **添加音乐**：点击右上角"添加"按钮，选择 MP3 文件
2. **选择歌曲**：勾选要播放的歌曲
3. **播放选中**：点击"播放选中"按钮播放勾选的歌曲
4. **播放全部**：不勾选任何歌曲时，点击"播放选中"播放全部
5. **切换模式**：在设置面板选择播放模式和播放次数
6. **控制播放**：使用播放控制按钮（上一首/播放暂停/下一首）
7. **调整进度**：点击进度条跳转到指定位置

## 项目结构

```
mp3-player/
├── index.html              # 主页面
├── renderer.js             # 播放器逻辑
├── package.json            # 项目配置
├── capacitor.config.json   # Capacitor 配置
├── android/                # Android 原生项目（执行 cap add 后生成）
└── README.md               # 说明文档
```

## 注意事项

1. **权限**：应用需要读取外部存储权限来访问音乐文件
2. **文件格式**：支持 MP3、WAV、OGG、M4A、FLAC 等常见音频格式
3. **兼容性**：需要 Android 5.0+ (API 21+)
4. **首次安装**：需要在手机设置中允许安装未知来源应用

## 常见问题

### Q: 安装时提示"解析包错误"？
A: 确保下载的 APK 文件完整，重新下载或重新生成 APK。

### Q: 无法添加音乐文件？
A: 检查应用是否有存储权限，在手机设置中授予权限。

### Q: 播放没有声音？
A: 检查手机音量设置，确保媒体音量已打开。

## 开发说明

- 修改前端代码后，需要重新执行 `npm run build:android` 同步到 Android 项目
- 修改原生代码后，直接在 Android Studio 中重新构建即可

## 许可证

MIT License

---

由 DuMate 创建 ❤️
