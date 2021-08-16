
test(
  'https://pull-hls-l1.ixigua.com/game/stream-109257009899766189_hd/playlist.m3u8'
)

function test(url) {
  var hls = new Hls()
  var videoHls = document.getElementById('video-hls')
  hls.loadSource(url)
  hls.attachMedia(videoHls)

  var playerLive = new window.xgplayer.default({
    id: 'video',
    plugins: [...new window['xgplayer-hls']({ isLive: true }).plugins],
    url,
    loop: false,
    autoplay: false,
    preloadTime:20,
    width: "100%",
  });

  // var playerVod = new window.xgplayer.default({
  //   id: 'video2',
  //   plugins: [...new window['xgplayer-hls']({ isLive: false }).plugins],
  //   url,
  //   loop: false,
  //   autoplay: false,
  //   preloadTime:20,
  //   width: "100%",
  // });
  
  var playPauseBtn = document.getElementById('play-pause')
  playPauseBtn.onclick = function () {
    const method = videoHls.paused ? 'play' : 'pause'
    videoHls[method]()
    if (typeof playerLive !== 'undefined') playerLive[method]()
    if (typeof playerVod !== 'undefined') playerVod[method]()
    videoHls.volume = 0.1
    if (typeof playerLive !== 'undefined') playerLive.video.volume = 0.1
    if (typeof playerVod !== 'undefined') playerVod.video.volume = 0.1
  }
  videoHls.onplay = videoHls.onpause = function () {
    playPauseBtn.textContent = videoHls.paused ? '播放' : '暂停'
  }
}

// player.on('SEI_PARSED', (sei) => {
//   let str;
//   for (let i = 0; i < sei.content.byteLength; i++) {
//       str += String.fromCharCode(sei.content[i])
//   }

//   console.log(sei.dts, str)
// })