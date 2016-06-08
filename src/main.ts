import { Option, Flashvars, PlayerElement } from './define/main.d'
import Bar from './modules/bar'

const log = require('debug')('vinext:main')
import './style'

log(VERSION)

class Player {
  $parent: Element
  $container: Element
  $player: PlayerElement
  option: Option
  isReady: boolean
  isEnd: boolean
  isSeeking: number
  bar: Bar
  _moveTimer: any
  _seekTimer: any

  constructor(parent: string, args: Option) {
    this.$parent = document.querySelector(parent)
    this.option = args
    this.isReady = false
    this.isEnd = false
    this.isSeeking = 0

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
      this.$player.play()
    }
  }

  public pause(): void {
    if (this.isReady) this.$player.pause()
  }

  public showBar() {
    if (this.isReady) this.bar.toggleDisplay(true)
  }

  public hideBar() {
    if (this.isReady) this.bar.toggleDisplay(false)
  }

  public get currentTime(): number {
    if (!this.isReady) {
      return 0
    }
    return this.$player.get('currentTime')
  }

  public set currentTime(time: number) {
    if (!this.isReady) {
      return
    }
    this.isSeeking = time
    this.$player.set('currentTime', time)
    if (this.paused) this.$player.play()
  }

  public get duration(): number {
    if (!this.isReady) {
      return 0
    }
    return this.$player.get('duration')
  }

  public get paused(): boolean {
    if (!this.isReady || this.isEnd) {
      return true
    }
    return this.$player.get('paused')
  }

  private _init(): void {
    (<any>window).vjjFlash = {
      onReady: () => {
        this.$player.set('src', this.option.video)
      },
      onEvent: (id: string, evtName: string) => {
        log(evtName)
        switch (evtName) {
          case 'loadeddata':
            this.isReady = true
            this.bar = new Bar(this)
            this.$player.play()
            break
          case 'play':
          case 'canplay':
            this.isEnd = false
            this.bar.togglePlay(true)
            if (typeof this.$player.onPlay === 'function') {
              this.$player.onPlay()
            }
            break
          case 'pause':
          case 'seeking':
            this.bar.togglePlay(false)
            if (typeof this.$player.onPause === 'function') {
              this.$player.onPause()
            }
            break
          case 'seeked':
            if (typeof this.$player.onSetTime === 'function') {
              this.$player.onSetTime(this.isSeeking)
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
      </div>
    `
    this.$parent.innerHTML += html
    this.$container = this.$parent.querySelector('#vinext-player--ctn')
    this.$player = this.$parent.querySelector('#vinext-player') as PlayerElement

    this.$container.addEventListener('mousemove', this._onCtnMove.bind(this), false)
    // can't fire click event on object
    this.$container.addEventListener('mousedown', this._onCtnClick.bind(this), false)
    let seekTime = 0
    document.addEventListener('keydown', (evt: KeyboardEvent) => {
      if (evt.keyCode === 37 || evt.keyCode === 39) {
        this.pause()
        this._onCtnMove()
        this.bar.toggleTimer(false)
        seekTime = seekTime || this.currentTime
        if (evt.keyCode === 37) {
          // left
          const temp = seekTime - 5
          seekTime = temp >= 0 ? temp : 0.1 // prevent trigger seekTime init value
        } else if (evt.keyCode === 39) {
          // right
          const temp = seekTime + 5
          seekTime = temp >= this.duration ? this.duration : temp
        }
        this.bar.updateProgress(seekTime)

        if (typeof this._seekTimer !== 'undefined') {
          clearTimeout(this._seekTimer)
        }
        this._seekTimer = setTimeout(() => {
          this.currentTime = seekTime
          this.bar.toggleTimer(true)
          this.play()
          seekTime = 0
        }, 500);
      }
    }, false)
  }

  private _onCtnMove() {
    this.showBar()

    clearTimeout(this._moveTimer)
    this._moveTimer = setTimeout(() => this.hideBar(), 2000)
  }

  private _onCtnClick() {
    if (this.paused) {
      this.play()
    } else {
      this.pause()
    }
  }
}

export = Player
