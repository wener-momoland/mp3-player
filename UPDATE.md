# v1.2.0 更新说明

## 新增功能

### 1. 支持添加文件夹
- 点击"添加文件夹"按钮
- 选择整个文件夹
- 自动扫描并添加所有音频和视频文件

### 2. 界面优化
- 第一行只保留标题和添加按钮
- 移除独立的"检查更新"和"播放"按钮
- 更新功能隐藏在版本号下（点击版本号检查更新）
- 如已是最新版本，提示"已是最新版本"

### 3. APK 竖屏锁定
- 应用强制竖屏显示
- 防止横屏旋转

### 4. 自定义图标
- 包含"赵"字风格的 APP 图标
- 图标文件在 `icons/app_icon.png`

---

## 文件清单

```
mp3-player-v1.2.0/
├── index.html              # 应用主页面
├── renderer.js             # 播放器逻辑
├── package.json            # 项目配置
├── capacitor.config.json   # 竖屏配置
├── icons/
│   └── app_icon.png        # 赵字图标 (1024x1024)
├── www/
│   ├── index.html          # 热更新用
│   ├── renderer.js         # 热更新用
│   └── version.json        # 版本信息
└── .github/workflows/
    └── build-apk.yml       # 自动构建配置
```

---

## 上传步骤

1. 打开 GitHub 仓库：https://github.com/wener-momoland/mp3-player

2. 点击 "Add file" → "Upload files"

3. 拖拽上传所有文件和文件夹

4. 点击 "Commit changes"

---

## APK 图标替换说明

构建 APK 后，图标位于：
```
android/app/src/main/res/
├── mipmap-mdpi/ic_launcher.png (48x48)
├── mipmap-hdpi/ic_launcher.png (72x72)
├── mipmap-xhdpi/ic_launcher.png (96x96)
├── mipmap-xxhdpi/ic_launcher.png (144x144)
└── mipmap-xxxhdpi/ic_launcher.png (192x192)
```

### 使用 Android Studio 替换图标

1. 打开项目：`npx cap open android`
2. 右键 `app` → `New` → `Image Asset`
3. 选择 `icons/app_icon.png` 作为源图像
4. 点击 `Next` → `Finish`
5. 重新构建 APK

---

## 版本号检查更新

- 点击右上角版本号（如 v1.2.0）
- 如果有新版本，提示更新
- 如果已是最新，提示"已是最新版本"
- 启动时自动静默检查更新
