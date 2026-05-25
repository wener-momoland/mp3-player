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

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  audioPlayer.volume = 0.8;
  
  // 音频事件监听
  audioPlayer.addEventListener('timeupdate', updateProgress);
  audioPlayer.addEventListener('ended', handleTrackEnd);
  audioPlayer.addEventListener('loadedmetadata', () => {
    totalTimeEl.textContent = formatTime(audioPlayer.duration);
  });
  
  // 尝试加载 Capacitor
  if (typeof Capacitor !== 'undefined') {
    console.log('Capacitor 已加载');
  }
});

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
    
    player.playlist.push({
      file: file,
      url: url,
      name: fileName,
      duration: null
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
        <div class="playlist-item-name">${track.name}</div>
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
  trackTitle.textContent = track.name;
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
