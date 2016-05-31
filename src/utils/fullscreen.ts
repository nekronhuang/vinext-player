interface Api {
  exit: string
  request: string
  change: string
  element: string
}

let fullscreenApi: Api

const apiMap = [
  [
    'exitFullscreen',
    'requestFullscreen',
    'fullscreenchange',
    'fullscreenElement',
  ], [
    'webkitExitFullscreen',
    'webkitRequestFullscreen',
    'webkitfullscreenchange',
    'webkitFullscreenElement',
  ], [
    'webkitCancelFullScreen',
    'webkitRequestFullScreen',
    'webkitfullscreenchange',
    'webkitCurrentFullScreenElement',
  ], [
    'mozCancelFullScreen',
    'mozRequestFullScreen',
    'mozfullscreenchange',
    'mozFullScreenElement',
  ], [
    'msExitFullscreen',
    'msRequestFullscreen',
    'MSFullscreenChange',
    'msFullscreenElement',
  ],
]

for (let item of apiMap) {
  if (item[0] in document) {
    fullscreenApi = {
      exit: item[0],
      request: item[1],
      change: item[2],
      element: item[3],
    }
    break
  }
}

export default fullscreenApi
