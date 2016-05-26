import { Option, Flashvars, PlayerElement } from './define/main.d'

import './style'

class Player {
  $parent: Element
  $player: PlayerElement
  option: Option
  isReady: boolean

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
    this.$player.play()
  }

  public pause(): void {
    this.$player.pause()
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
        this.isReady = true
        // this.$player.set('src', this.option.video)
      },
      onEvent: (id: string, evtName: string) => {
        switch (evtName) {
          case 'loadeddata':
            // this.$player.play()
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
      playFormat: 3,
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
    this.$player = this.$parent.querySelector('#vinext-player') as PlayerElement
  }
}

export = Player
