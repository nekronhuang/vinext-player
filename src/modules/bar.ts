import fullscreenApi from '../utils/fullscreen'
import { formatDuration } from '../utils/format'
import Player = require('../main')

const log = require('debug')('vinext:bar')

class Bar {
  player: Player
  $container: Element
  $parent: Element
  $playBtn: Element
  $muteBtn: Element
  $volBar: Element
  $fsBtn: Element
  $progress: Element
  $dot: HTMLElement
  $currentTime: Element
  _eventListener: Array<EventListenerObject>
  _timer: any

  constructor(p: Player) {
    this.player = p
    this.$container = this.player.$parent.querySelector('#vinext-controlbar--ctn')
    this.$parent = this.player.$container

    this.$inject()
  }

  public insertDots(dots: Array<Dot>) {
    log('insert white dots: %o', dots)

    const oldHtml = this.$progress.querySelectorAll('.vinext-dot--static')
    Array.prototype.forEach.call(oldHtml, oldDom => this.$progress.removeChild(oldDom))

    const html = document.createDocumentFragment()
    dots.forEach(dot => {
      const div = document.createElement('div')
      div.classList.add('vinext-dot', 'vinext-dot--static')
      div.style.left = (dot.time / this.player.duration * 100) + '%'
      /* tslint:disable */
      div.dataset['time'] = dot.time.toString()
      div.innerHTML = `<div class="vinext-fill"></div><div class="vinext-hint"><div class="vinext-text">${formatDuration(dot.time)}<br>${dot.intro}</div></div>`
      /* tslint:enable */
      html.appendChild(div)
    })
    this.$progress.appendChild(html)

    const doms = this.$progress.querySelectorAll('.vinext-dot--static')
    const fn = this._onDotMove.bind(this)
    Array.prototype.forEach.call(doms, (dom: HTMLElement) => {
      dom.addEventListener('mousemove', fn, false)
      dom.addEventListener('mouseleave', fn, false)
      dom.addEventListener('click', fn, false)
    })
  }

  public toggleDisplay(status: boolean) {
    if (status) {
      this.$container.classList.add('__show')
    } else {
      this.$container.classList.remove('__show')
    }
  }

  public togglePlay(status: boolean) {
    if (status) {
      this.$playBtn.innerHTML = '&#xe602;'
    } else {
      this.$playBtn.innerHTML = '&#xe603;'
    }
  }

  public toggleTimer(status: boolean) {
    if (status) {
      this._timer = setInterval(() => this.updateProgress(this.player.currentTime), 250)
    } else {
      clearInterval(this._timer)
    }
  }

  public updateProgress(time: number) {
    this.$currentTime.innerHTML = formatDuration(time)
    const $played = <HTMLElement>this.$progress.querySelector('.vinext-played')
    $played.style.width = time / this.player.duration * 100 + '%'
  }

  public destroy() {
    this.toggleTimer(false)
    document.removeEventListener(fullscreenApi.change, this._eventListener[0], false)
  }

  private $inject(): void {
    /* tslint:disable */
    const html = `
      <div class="vinext-bar">
        <div class="vinext-bar-btn--play">&#xe602;</div>
        <div class="vinext-bar-time--current">${formatDuration(this.player.currentTime)}</div>
        <div class="vinext-bar-progress">
          <div class="vinext-buffered"></div>
          <div class="vinext-played"></div>
          <div class="vinext-dot">
            <div class="vinext-fill"></div>
            <div class="vinext-hint"></div>
          </div>
        </div>
        <div class="vinext-bar-time--total">${formatDuration(this.player.duration)}</div>
        <div class="vinext-bar-btn--mute">
          <div class="vinext-btn">&#xe604;</div>
          <div class="vinext-dropdown-list">
            <div class="vinext-dropdown-item"><div class="vinext-fill"></div></div>
          </div>
        </div>
        <div class="vinext-bar-btn--fs">&#xe601;</div>
        <div class="vinext-bar-list--clarity"></div>
        <div class="vinext-bar-logo">
          <img class="vinext-img" src="http://7xjfim.com2.z0.glb.qiniucdn.com/iva2-logo-white.svg">
        </div>
      </div>
    `
    /* tslint:enable */
    this.$container.innerHTML += html

    this.$container.addEventListener('mousedown', evt => {
      evt.stopPropagation()
      const event = new MouseEvent('mousemove')
      this.$parent.dispatchEvent(event)
    }, false)

    this.$playBtn = this.$container.querySelector('.vinext-bar-btn--play')
    this.$playBtn.addEventListener('click', this._onPlayClick.bind(this), false)

    this.$muteBtn = this.$container.querySelector('.vinext-bar-btn--mute')
    this.$muteBtn.addEventListener('click', this._onMuteClick.bind(this), false)
    this.$volBar = this.$muteBtn.querySelector('.vinext-dropdown-list')
    this.$volBar.addEventListener('click', this._onVolBarClick.bind(this), false)

    this.$fsBtn = this.$container.querySelector('.vinext-bar-btn--fs')
    this._eventListener = [this._onFsClick.bind(this)]
    this.$fsBtn.addEventListener('click', this._eventListener[0], false)

    this.$progress = this.$container.querySelector('.vinext-bar-progress')
    this.$currentTime = this.$container.querySelector('.vinext-bar-time--current')

    if (this.player.option.isLiveStream || this.player.flashvars.mode === 'RTMP') {
      this.$progress.classList.add('__hide')
      this.$currentTime.classList.add('__hide')
      this.$container.querySelector('.vinext-bar-time--total').classList.add('__hide')
      this.$muteBtn.classList.add('__layout')
      return
    }

    this.$dot = <HTMLElement>this.$progress.querySelector('.vinext-dot')
    const moveFn = this._onProgressMove.bind(this)
    this.$progress.addEventListener('mousemove', moveFn, false)
    this.$progress.addEventListener('mouseleave', moveFn, false)
    this.$progress.addEventListener('click', moveFn, false)

    this.toggleTimer(true)
  }

  private _onPlayClick() {
    log('video paused: %o', this.player.paused)

    if (this.player.paused) {
      this.player.play()
    } else {
      this.player.pause()
    }
  }

  private _onMuteClick() {
    const btn = this.$muteBtn

    log('video muted: %o', this.player.$player.get('muted'))

    if (this.player.$player.get('muted')) {
      btn.innerHTML = '&#xe604;'
      this.player.$player.muteOn()
    } else {
      btn.innerHTML = '&#xe605;'
      this.player.$player.muteOff()
    }
  }

  private _onVolBarClick(evt: DragEvent) {
    evt.stopPropagation()
    const height = this.$volBar.clientHeight - 10 // padding
    const min = 5
    const max = height - min
    let v = height - evt.offsetY
    if (v < min) {
      v = 0
    } else if (v > max) {
      v = height
    }
    const ratio = v / height

    log('video volume: %o', ratio)

    this.player.$player.set('volume', ratio)
    const $fill = <HTMLElement>this.$volBar.querySelector('.vinext-fill')
    $fill.style.height = ratio * 100 + '%'
  }

  private _onFsClick(evt: Event) {
    const btn = this.$fsBtn

    log('trigger fullscreen: %o, type: %s', document[fullscreenApi.element], evt.type)

    if (evt.type === 'click') {
      // btn click
      if (document[fullscreenApi.element]) {
        const dom = <HTMLElement>document[fullscreenApi.element]

        btn.innerHTML = '&#xe601;'
        dom.style.width = (<any>dom.dataset).w
        dom.style.height = (<any>dom.dataset).h
        document[fullscreenApi.exit]()
      } else {
        const dom = <HTMLElement>this.player.$parent

        btn.innerHTML = '&#xe600;'
        /* tslint:disable */
        dom.dataset['w'] = dom.style.width
        dom.dataset['h'] = dom.style.height
        /* tslint:enable */
        dom.style.width = '100%'
        dom.style.height = '100%'
        dom[fullscreenApi.request]()
        document.removeEventListener(fullscreenApi.change, this._eventListener[0], false)
        document.addEventListener(fullscreenApi.change, this._eventListener[0], false)
      }
    } else {
      // native exit fullscreen
      if (document[fullscreenApi.element]) {
        btn.innerHTML = '&#xe600;'
      } else {
        const dom = <HTMLElement>this.player.$parent

        document.removeEventListener(fullscreenApi.change, this._eventListener[0], false)
        btn.innerHTML = '&#xe601;'
        dom.style.width = (<any>dom.dataset).w
        dom.style.height = (<any>dom.dataset).h
      }
    }
  }

  private _onProgressMove(evt: DragEvent) {
    const isStatic = (<HTMLElement>evt.target).classList.contains('vinext-dot--static')
    if (isStatic) {
      return evt.stopPropagation()
    }
    const $hint = this.$dot.querySelector('.vinext-hint')
    const ratio = evt.offsetX / (<HTMLElement>evt.target).clientWidth
    if (evt.type === 'mousemove') {
      this.$dot.classList.add('__show')
      this.$dot.style.left = ratio * 100 + '%'
      $hint.innerHTML = formatDuration(ratio * this.player.duration)
    } else if (evt.type === 'mouseleave') {
      this.$dot.classList.remove('__show')
    } else if (evt.type === 'click') {
      this.player.currentTime = ratio * this.player.duration
    }
  }

  private _onDotMove(evt: DragEvent) {
    const $this = <HTMLElement>evt.target
    if (evt.type === 'mousemove') {
      this.$dot.classList.remove('__show')
      $this.classList.add('__show')
    } else if (evt.type === 'mouseleave') {
      $this.classList.remove('__show')
    } else if (evt.type === 'click') {
      this.player.currentTime = parseFloat((<any>$this.dataset).time)
    }
  }
}

export default Bar
