import Bar from './modules/bar'
import Loading from './modules/loading'
import { NOT_READY_ERR } from './constants/error'

const log = require('debug')('vinext:main')
import './style'

/* tslint:disable */
console.info(VERSION)
/* tslint:enable */

class Player {
  $parent: Element
  $container: Element
  $player: PlayerElement
  option: Option
  isReady: boolean
  isEnd: boolean
  isSeeking: number
  bar: Bar
  loading: Loading
  flashvars: Flashvars
  _eventCallback: any
  _seekTime: number
  _moveTimer: any
  _seekTimer: any

  constructor(parent: string, args: Option, callback: Function) {
    this.$parent = document.querySelector(parent)
    this.option = args
    this.isReady = false
    this.isEnd = false
    this.isSeeking = 0
    this._eventCallback = {}
    if (callback) this.addCallback('init', callback)

    if (this.$parent) {
      this._init()
      this.$inject()
    } else {
      throw new Error(`parent DOM not existed!`)
    }
  }

  public play(): void {
    if (this.isReady) {
      if (this.isEnd) {
        this.currentTime = 0
      }
      if (this.flashvars.mode === 'RTMP') {
        this.$player.set('src', this.option.video)
      }
      return this.$player.play()
    }
    throw new Error(NOT_READY_ERR)
  }

  public pause(): void {
    if (this.isReady) return this.$player.pause()
    throw new Error(NOT_READY_ERR)
  }

  public showBar() {
    if (this.isReady) return this.bar.toggleDisplay(true)
    throw new Error(NOT_READY_ERR)
  }

  public hideBar() {
    if (this.isReady) return this.bar.toggleDisplay(false)
    throw new Error(NOT_READY_ERR)
  }

  public showLoading() {
    this.loading.toggleDisplay(true)
  }

  public hideLoading() {
    this.loading.toggleDisplay(false)
  }

  public insertDots(dots: Array<Dot>) {
    if (this.isReady) {
      const arr = dots.filter(dot => dot.time > 0 && dot.time < this.duration)
      return this.bar.insertDots(arr)
    }
    throw new Error(NOT_READY_ERR)
  }

  public get currentTime(): number {
    if (!this.isReady) {
      return 0
    }
    return this.$player.get('currentTime')
  }

  public set currentTime(time: number) {
    if (!this.isReady) {
      throw new Error(NOT_READY_ERR)
    }
    this.isSeeking = time
    this.$player.set('currentTime', time)
  }

  public get duration(): number {
    if (!this.isReady) {
      return NaN
    }
    return this.$player.get('duration')
  }

  public get paused(): boolean {
    if (!this.isReady || this.isEnd) {
      return true
    }
    return this.$player.get('paused')
  }

  public addCallback(event: string, handler: Function) {
    this._eventCallback[event] = handler
  }

  public removeCallback(events: Array<string>) {
    events.forEach((event) => {
      this._eventCallback[event] = undefined
    })
  }

  public destroy() {
    this.bar.destroy()
    document.removeEventListener('keydown', this._eventCallback.keydown, false)
    this.$container.remove()
  }

  private _init(): void {
    (<any>window).vjjFlash = {
      onReady: () => {
        // this.$player.set('src', this.option.video)
        if (this.flashvars.mode === 'RTMP') {
          this.$player.play()
        }
      },
      onEvent: (id: string, evtName: string) => {
        log('event: %s', evtName)
        switch (evtName) {
          case 'loadeddata':
            if (!this.isReady) {
              this.isReady = true
              if (!this.bar) this.bar = new Bar(this)
              // this.$player.play()
              if (this._eventCallback.init) this._eventCallback.init()
            }
            break
          case 'play':
            this.bar.togglePlay(true)
            if (typeof this._eventCallback.onPlay === 'function') {
              this._eventCallback.onPlay()
            }
            break
          case 'canplay':
            this.isEnd = false
            this.hideLoading()
            break
          case 'waiting':
            this.showLoading()
            if (typeof this._eventCallback.onWaiting === 'function') {
              this._eventCallback.onWaiting()
            }
            break
          case 'pause':
            // case 'NetStream.SeekStart.Notify':
            this.bar.togglePlay(false)
            if (typeof this._eventCallback.onPause === 'function') {
              this._eventCallback.onPause()
            }
            break
          case 'seeked':
            if (typeof this._eventCallback.onSetTime === 'function') {
              this._eventCallback.onSetTime(this.isSeeking)
            }
            break
          case 'ended':
            this.isEnd = true
            break
          default:
            break
        }
      },
    }
  }

  private $inject(): void {
    const url = 'http://flash.videojj.com/test/vjj-swf1.swf'
    const m3u8Reg: any = new RegExp('\.m3u8$')
    const rtmpReg: any = new RegExp('^rtmp:\/\/')
    let vars: Flashvars = {
      playFormat: 1,
      videoForm: 1,
      appkey: this.option.appkey,
      mode: '',
      host: 'http://videojj.com',
      referer: location.href,
      path: 'http://flash.videojj.com/test/player_ui.swf',
      src: this.option.video,
    }

    if (m3u8Reg.test(this.option.video)) {
      vars.mode = 'HLS'
      vars.presrc = this.option.video
    } else if (rtmpReg.test(this.option.video)) {
      vars.mode = 'RTMP'
    } else if (this.option.needParse) {
      vars.mode = 'YOUKU'
    } else {
      vars.mode = 'FLV'
    }
    this.flashvars = vars

    const flashvars = Object.keys(vars).map(k => k + '=' + vars[k]).reduce((a, b) => a + '&' + b)
    const html = `
      <div id="vinext-player--ctn">
        <object id="vinext-player" type="application/x-shockwave-flash" data="${url}">
          <param name="wmode" value="opaque">
          <param name="quality" value="high" />
          <param name="bgcolor" value="#000000" />
          <param name="allowScriptAccess" value="always" />
          <param name="allowFullScreen" value="true" />
          <param name="allowInsecureDomain" value="*" />
          <param name="allowDomain" value="*" />
          <param name="flashvars" value="${flashvars}" />
        </object>
        <div id="vinext-controlbar--ctn"></div>
        <div id="vinext-loading--ctn"></div>
      </div>
    `
    this.$parent.innerHTML += html
    this.$container = this.$parent.querySelector('#vinext-player--ctn')
    this.$player = this.$parent.querySelector('#vinext-player') as PlayerElement

    this.$container.addEventListener('mousemove', this._onCtnMove.bind(this), false)
    // can't fire click event on object
    this.$container.addEventListener('mousedown', this._onCtnClick.bind(this), false)
    this._seekTime = 0
    this.addCallback('keydown', this._onKeyDown.bind(this))
    document.addEventListener('keydown', this._eventCallback.keydown, false)

    this.loading = new Loading(this)
  }

  private _onKeyDown(evt: KeyboardEvent) {
    const target = <HTMLElement>evt.target
    if (!this.isReady) return
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
    if (evt.keyCode === 37 || evt.keyCode === 39) {
      this.pause()
      this._onCtnMove()
      this.bar.toggleTimer(false)
      this._seekTime = this._seekTime || this.currentTime
      if (evt.keyCode === 37) {
        // left
        const temp = this._seekTime - 5
        this._seekTime = temp >= 0 ? temp : 0.1 // prevent trigger seekTime init value
      } else if (evt.keyCode === 39) {
        // right
        const temp = this._seekTime + 5
        this._seekTime = temp >= this.duration ? this.duration : temp
      }
      this.bar.updateProgress(this._seekTime)

      if (typeof this._seekTimer !== 'undefined') {
        clearTimeout(this._seekTimer)
      }
      this._seekTimer = setTimeout(() => {
        this.currentTime = this._seekTime
        this.bar.toggleTimer(true)
        this.play()
        this._seekTime = 0
      }, 500);
    }
  }

  private _onCtnMove() {
    if (!this.isReady) return
    this.showBar()

    clearTimeout(this._moveTimer)
    this._moveTimer = setTimeout(() => this.hideBar(), 2000)
  }

  private _onCtnClick() {
    if (!this.isReady) return
    if (this.paused) {
      this.play()
    } else {
      this.pause()
    }
  }
}

export = Player
