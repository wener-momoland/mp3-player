// 版本管理
const APP_VERSION = '1.1.0';
const GITHUB_REPO = 'wener-momoland/mp3-player';
const UPDATE_CHECK_URL = `https://api.github.com/repos/${GITHUB_REPO}/contents/www/version.json`;
const UPDATE_DOWNLOAD_URL = `https://raw.githubusercontent.com/${GITHUB_REPO}/main/www/`;

// 播放器状态
const player = {
  playlist: [],
  currentIndex: -1,
  playMode: 'sequence', // sequence, shuffle, single
  playCount: '1', // '1', '2', 'loop'
  currentPlayTime: 0,
  selectedTracks: new Set(),
  isPlaying: false
};

// DOM 元素
const audioPlayer = document.getElementById('audioPlayer');
const playlistElement = document.getElementById('playlist');
const playPauseBtn = document.getElementById('playPauseBtn');
const albumArt = document.getElementById('albumArt');
const trackTitle = document.getElementById('trackTitle');
const trackInfo = document.getElementById('trackInfo');
const progressFill = document.getElementById('progressFill');
const currentTimeEl = document.getElementById('currentTime');
const totalTimeEl = document.getElementById('totalTime');
const playlistCount = document.getElementById('playlistCount');
const fileInput = document.getElementById('fileInput');
const updateBtn = document.getElementById('updateBtn');

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  audioPlayer.volume = 0.8;
  
  // 显示当前版本
  const versionEl = document.getElementById('appVersion');
  if (versionEl) {
    versionEl.textContent = `v${APP_VERSION}`;
  }
  
  // 音频事件监听
  audioPlayer.addEventListener('timeupdate', updateProgress);
  audioPlayer.addEventListener('ended', handleTrackEnd);
  audioPlayer.addEventListener('loadedmetadata', () => {
    totalTimeEl.textContent = formatTime(audioPlayer.duration);
  });
  
  // 尝试加载 Capacitor
  if (typeof Capacitor !== 'undefined') {
    console.log('Capacitor 已加载');
    initCapacitorPlugins();
  }
  
  // 检查更新
  checkForUpdates();
});

// 初始化 Capacitor 插件
async function initCapacitorPlugins() {
  try {
    // 请求存储权限
    if (Capacitor.Plugins.Filesystem) {
      const permission = await Capacitor.Plugins.Filesystem.requestPermissions();
      console.log('存储权限:', permission);
    }
  } catch (error) {
    console.log('插件初始化失败:', error);
  }
}

// 添加文件
function addFiles() {
  fileInput.click();
}

// 处理文件选择
function handleFileSelect(event) {
  const files = Array.from(event.target.files);
  if (files.length > 0) {
    addTracks(files);
  }
  // 重置 input，允许重复选择相同文件
  event.target.value = '';
}

// 添加音轨到播放列表
function addTracks(files) {
  files.forEach(file => {
    // 创建本地 URL
    const url = URL.createObjectURL(file);
    const fileName = file.name.replace(/\.[^/.]+$/, '');
    
    // 检测文件类型
    const extension = file.name.split('.').pop().toLowerCase();
    const isVideo = ['mp4', 'webm', 'mkv', 'avi', 'mov'].includes(extension);
    
    player.playlist.push({
      file: file,
      url: url,
      name: fileName,
      duration: null,
      isVideo: isVideo,
      extension: extension
    });
  });
  
  renderPlaylist();
  
  // 如果是第一次添加，自动选择第一首
  if (player.currentIndex === -1 && player.playlist.length > 0) {
    player.currentIndex = 0;
    loadTrack(0);
  }
}

// 渲染播放列表
function renderPlaylist() {
  if (player.playlist.length === 0) {
    playlistElement.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🎵</div>
        <div class="empty-state-text">点击"添加"按钮添加音乐文件</div>
        <div class="empty-state-hint">支持 MP3、MP4、WAV 等格式</div>
      </div>
    `;
    playlistCount.textContent = '0 首歌曲';
    return;
  }
  
  playlistElement.innerHTML = player.playlist.map((track, index) => `
    <div class="playlist-item ${index === player.currentIndex ? 'active' : ''} ${player.selectedTracks.has(index) ? 'selected' : ''}"
         onclick="selectTrack(${index}, event)">
      <input type="checkbox" class="playlist-item-checkbox" 
             ${player.selectedTracks.has(index) ? 'checked' : ''}
             onclick="toggleSelect(event, ${index})">
      <div class="playlist-item-info">
        <div class="playlist-item-name">
          ${track.isVideo ? '🎬 ' : '🎵 '}${track.name}
        </div>
        <div class="playlist-item-duration">${track.duration || '加载中...'}</div>
      </div>
      ${index === player.currentIndex && player.isPlaying ? '<span class="playlist-item-playing">▶</span>' : ''}
    </div>
  `).join('');
  
  playlistCount.textContent = `${player.playlist.length} 首歌曲`;
}

// 选择音轨
function selectTrack(index, event) {
  if (event.target.type === 'checkbox') return;
  
  // 双击播放
  if (event.detail === 2) {
    playTrack(index);
    return;
  }
  
  player.currentIndex = index;
  renderPlaylist();
}

// 切换选择
function toggleSelect(event, index) {
  event.stopPropagation();
  
  if (player.selectedTracks.has(index)) {
    player.selectedTracks.delete(index);
  } else {
    player.selectedTracks.add(index);
  }
  
  renderPlaylist();
}

// 播放选中的音轨
function playSelected() {
  if (player.selectedTracks.size === 0) {
    // 如果没有选中项，播放全部
    if (player.playlist.length > 0) {
      playTrack(0);
    }
    return;
  }
  
  // 只播放选中的音轨
  const selectedIndices = Array.from(player.selectedTracks).sort((a, b) => a - b);
  player.playlist = selectedIndices.map(index => player.playlist[index]);
  player.selectedTracks.clear();
  player.currentIndex = 0;
  
  renderPlaylist();
  playTrack(0);
}

// 播放指定音轨
function playTrack(index) {
  if (index < 0 || index >= player.playlist.length) return;
  
  player.currentIndex = index;
  player.currentPlayTime = 0;
  loadTrack(index);
  audioPlayer.play();
  player.isPlaying = true;
  updatePlayPauseButton();
  renderPlaylist();
}

// 加载音轨
function loadTrack(index) {
  const track = player.playlist[index];
  if (!track) return;
  
  audioPlayer.src = track.url;
  trackTitle.textContent = (track.isVideo ? '🎬 ' : '🎵 ') + track.name;
  trackInfo.textContent = `音轨 ${index + 1} / ${player.playlist.length}`;
  
  // 加载时长
  audioPlayer.addEventListener('loadedmetadata', function onLoad() {
    track.duration = formatTime(audioPlayer.duration);
    renderPlaylist();
    audioPlayer.removeEventListener('loadedmetadata', onLoad);
  });
}

// 切换播放/暂停
function togglePlayPause() {
  if (player.playlist.length === 0) return;
  
  if (player.currentIndex === -1) {
    playTrack(0);
    return;
  }
  
  if (player.isPlaying) {
    audioPlayer.pause();
    player.isPlaying = false;
  } else {
    audioPlayer.play();
    player.isPlaying = true;
  }
  
  updatePlayPauseButton();
}

// 更新播放/暂停按钮
function updatePlayPauseButton() {
  playPauseBtn.textContent = player.isPlaying ? '⏸' : '▶';
  
  if (player.isPlaying) {
    albumArt.classList.add('playing');
  } else {
    albumArt.classList.remove('playing');
  }
}

// 上一首
function previousTrack() {
  if (player.playlist.length === 0) return;
  
  let newIndex;
  if (player.playMode === 'shuffle') {
    newIndex = Math.floor(Math.random() * player.playlist.length);
  } else {
    newIndex = player.currentIndex - 1;
    if (newIndex < 0) newIndex = player.playlist.length - 1;
  }
  
  playTrack(newIndex);
}

// 下一首
function nextTrack() {
  if (player.playlist.length === 0) return;
  
  let newIndex;
  if (player.playMode === 'shuffle') {
    newIndex = Math.floor(Math.random() * player.playlist.length);
  } else {
    newIndex = player.currentIndex + 1;
    if (newIndex >= player.playlist.length) newIndex = 0;
  }
  
  playTrack(newIndex);
}

// 处理音轨播放结束
function handleTrackEnd() {
  // 检查播放次数
  if (player.playCount === '1') {
    // 播放1次后结束
    if (player.playMode === 'single') {
      // 单曲循环模式，继续播放
      playTrack(player.currentIndex);
    } else {
      // 顺序或随机播放，播放下一首
      playNextInSequence();
    }
  } else if (player.playCount === '2') {
    // 播放2次
    player.currentPlayTime++;
    if (player.currentPlayTime < 2) {
      // 再播放一次
      audioPlayer.currentTime = 0;
      audioPlayer.play();
    } else {
      // 已播放2次，播放下一首
      player.currentPlayTime = 0;
      playNextInSequence();
    }
  } else {
    // 循环播放
    playNextInSequence();
  }
}

// 按顺序播放下一首
function playNextInSequence() {
  if (player.playMode === 'single') {
    playTrack(player.currentIndex);
  } else if (player.playMode === 'shuffle') {
    nextTrack();
  } else {
    // 顺序播放
    if (player.currentIndex < player.playlist.length - 1) {
      playTrack(player.currentIndex + 1);
    } else {
      // 已到列表末尾
      player.isPlaying = false;
      updatePlayPauseButton();
    }
  }
}

// 更新进度条
function updateProgress() {
  const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
  progressFill.style.width = progress + '%';
  currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
}

// 跳转进度
function seek(event) {
  const progressBar = document.getElementById('progressBar');
  const rect = progressBar.getBoundingClientRect();
  const percent = (event.clientX - rect.left) / rect.width;
  audioPlayer.currentTime = percent * audioPlayer.duration;
}

// 更新播放模式
function updatePlayMode() {
  player.playMode = document.getElementById('playMode').value;
}

// 更新播放次数
function updatePlayCount() {
  player.playCount = document.getElementById('playCount').value;
  player.currentPlayTime = 0;
}

// 更新音量
function updateVolume() {
  const volume = document.getElementById('volumeSlider').value / 100;
  audioPlayer.volume = volume;
}

// 格式化时间
function formatTime(seconds) {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ========== 热更新功能 ==========

// 检查更新
async function checkForUpdates() {
  try {
    const response = await fetch(UPDATE_CHECK_URL, {
      headers: {
        'Accept': 'application/vnd.github.v3.raw'
      }
    });
    
    if (!response.ok) {
      console.log('检查更新失败:', response.status);
      return;
    }
    
    const versionInfo = await response.json();
    console.log('远程版本:', versionInfo.version, '本地版本:', APP_VERSION);
    
    if (compareVersions(versionInfo.version, APP_VERSION) > 0) {
      showUpdateNotification(versionInfo);
    }
  } catch (error) {
    console.log('检查更新出错:', error);
  }
}

// 版本比较
function compareVersions(v1, v2) {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  return 0;
}

// 显示更新通知
function showUpdateNotification(versionInfo) {
  const notification = document.createElement('div');
  notification.className = 'update-notification';
  notification.innerHTML = `
    <div class="update-content">
      <h3>🎉 发现新版本 v${versionInfo.version}</h3>
      <p>${versionInfo.changelog || '性能优化和Bug修复'}</p>
      <div class="update-buttons">
        <button onclick="performUpdate()" class="btn-update">立即更新</button>
        <button onclick="this.parentElement.parentElement.parentElement.remove()" class="btn-later">稍后提醒</button>
      </div>
    </div>
  `;
  document.body.appendChild(notification);
}

// 执行更新
async function performUpdate() {
  const updateStatus = document.getElementById('updateStatus');
  if (updateStatus) {
    updateStatus.textContent = '正在更新...';
  }
  
  try {
    // 获取需要更新的文件列表
    const filesToUpate = [
      'index.html',
      'renderer.js',
      'version.json'
    ];
    
    for (const file of filesToUpate) {
      const response = await fetch(`${UPDATE_DOWNLOAD_URL}${file}`);
      if (response.ok) {
        const content = await response.text();
        // 保存到本地存储（Capacitor 环境）
        if (typeof Capacitor !== 'undefined' && Capacitor.Plugins.Filesystem) {
          await Capacitor.Plugins.Filesystem.writeFile({
            path: file,
            data: btoa(content),
            directory: 'DATA'
          });
        } else {
          // Web 环境，保存到 localStorage
          localStorage.setItem(`app_${file}`, content);
        }
        console.log(`已更新: ${file}`);
      }
    }
    
    // 提示用户重启应用
    if (updateStatus) {
      updateStatus.textContent = '更新完成，请重启应用';
    }
    
    alert('更新完成！请重启应用以使用新版本。');
    
    // 重新加载页面
    setTimeout(() => {
      window.location.reload();
    }, 1000);
    
  } catch (error) {
    console.error('更新失败:', error);
    if (updateStatus) {
      updateStatus.textContent = '更新失败: ' + error.message;
    }
    alert('更新失败，请检查网络连接后重试。');
  }
}

// 手动检查更新
function manualCheckUpdate() {
  const updateStatus = document.getElementById('updateStatus');
  if (updateStatus) {
    updateStatus.textContent = '正在检查更新...';
  }
  
  checkForUpdates().then(() => {
    if (updateStatus) {
      updateStatus.textContent = '已是最新版本';
      setTimeout(() => {
        updateStatus.textContent = '';
      }, 2000);
    }
  });
}

// 键盘快捷键
document.addEventListener('keydown', (event) => {
  switch(event.code) {
    case 'Space':
      event.preventDefault();
      togglePlayPause();
      break;
    case 'ArrowLeft':
      audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - 5);
      break;
    case 'ArrowRight':
      audioPlayer.currentTime = Math.min(audioPlayer.duration, audioPlayer.currentTime + 5);
      break;
    case 'ArrowUp':
      const volUp = Math.min(100, parseInt(document.getElementById('volumeSlider').value) + 10);
      document.getElementById('volumeSlider').value = volUp;
      updateVolume();
      break;
    case 'ArrowDown':
      const volDown = Math.max(0, parseInt(document.getElementById('volumeSlider').value) - 10);
      document.getElementById('volumeSlider').value = volDown;
      updateVolume();
      break;
  }
});
