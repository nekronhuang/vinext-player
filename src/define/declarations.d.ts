declare interface Flashvars {
  /*
   * 互动层加载方式
   * 1 手动启动互动层
   * 2 播放器内部接入互动层
   * 3 互动层覆盖在播放器上
   */
  playFormat: number

  /*
   * 视频流形式
   * 0 直播
   * 1 点播
   */
  videoForm: number

  appkey: string

  /*
   * 视频流格式
   * FLV 直接播放
   * HLS m3u8
   * RTMP rtmp
   * YOUKU 解析视频
   * SOCKET 直播跟踪
   */
  mode: string

  /*
   * videojj api host
   */
  host: string

  referer: string

  /*
   * m3u8使用presrc
   */
  src?: string
  presrc?: string

  /*
   * 播放器控制条ui
   */
  path?: string
  showControls?: number
}

declare interface Dot {
  time: number
  intro: string
}

declare interface Option {
  appkey: string
  video: string

  isLiveStream?: boolean
  needParse?: boolean
}

declare interface PlayerElement extends Element {
  get: Function
  set: Function

  play: Function
  pause: Function

  muteOn?: Function
  muteOff?: Function
}

declare const VERSION: string

declare function require(m: string): any
