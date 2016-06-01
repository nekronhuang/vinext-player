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
  bar: Bar
  _moveTimer: any
  _seekTimer: any

  constructor(parent: string, args: Option) {
    this.$parent = document.querySelector(parent)
    this.option = args

    if (this.$parent) {
      this._init()
      this.$inject()
    } else {
      throw new Error(`parent DOM not existed!`)
    }
  }

  public play(): void {
    if (this.isReady) this.bar.togglePlay(true)
  }

  public pause(): void {
    if (this.isReady) this.bar.togglePlay(false)
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
    this.$player.set('currentTime', time)
  }

  public get duration(): number {
    if (!this.isReady) {
      return 0
    }
    return this.$player.get('duration')
  }

  public get paused(): boolean {
    if (!this.isReady) {
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
        switch (evtName) {
          case 'loadeddata':
            this.isReady = true
            this.bar = new Bar(this)
            this.$player.play()
            break
          case 'play':
            if (typeof this.$player.onPlay === 'function') {
              this.$player.onPlay()
            }
            break
          case 'pause':
          case 'seeking':
            if (typeof this.$player.onPause === 'function') {
              this.$player.onPause()
            }
            break
          case 'canplay':
            if (typeof this.$player.onSetTime === 'function') {
              this.$player.onSetTime()
            }
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
      this.pause()
      this._onCtnMove()
      this.bar.toggleTimer(false)
      seekTime = seekTime || this.currentTime

      if (evt.keyCode === 37) {
        // left
        seekTime -= 5
      } else if (evt.keyCode === 39) {
        // right
        seekTime += 5
      }
      this.bar.updateProgress(seekTime)

      clearTimeout(this._seekTimer)
      this._seekTimer = setTimeout(() => {
        this.currentTime = seekTime
        this.bar.toggleTimer(true)
        this.play()
        seekTime = 0
      }, 300);
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
