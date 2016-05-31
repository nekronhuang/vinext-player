import fullscreenApi from '../utils/fullscreen'
import { formatDuration } from '../utils/format'
import Player = require('../main')

const log = require('debug')('vinext:bar')

class Bar {
  player: Player
  $container: Element
  $playBtn: Element
  $muteBtn: Element
  $fsBtn: Element
  $progress: Element
  $dot: HTMLElement
  $currentTime: Element
  _fsListener: EventListenerObject
  _timer: any

  constructor(p: Player) {
    this.player = p
    this.$container = this.player.$parent.querySelector('#vinext-controlbar--ctn')

    this.$inject()
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
        <div class="vinext-bar-btn--mute">&#xe604;</div>
        <div class="vinext-bar-btn--fs">&#xe601;</div>
        <div class="vinext-bar-list--clarity"></div>
        <div class="vinext-bar-logo">
          <img class="vinext-img" src="http://7xjfim.com2.z0.glb.qiniucdn.com/iva2-logo-white.svg">
        </div>
      </div>
    `
    /* tslint:enable */
    this.$container.innerHTML += html

    this.$playBtn = this.$container.querySelector('.vinext-bar-btn--play')
    this.$playBtn.addEventListener('click', this._onPlayClick.bind(this), false)

    this.$muteBtn = this.$container.querySelector('.vinext-bar-btn--mute')
    this.$muteBtn.addEventListener('click', this._onMuteClick.bind(this), false)

    this.$fsBtn = this.$container.querySelector('.vinext-bar-btn--fs')
    this._fsListener = this._onFsClick.bind(this)
    this.$fsBtn.addEventListener('click', this._fsListener, false)

    this.$progress = this.$container.querySelector('.vinext-bar-progress')
    this.$dot = <HTMLElement>this.$progress.querySelector('.vinext-dot')
    const moveFn = this._onProgressMove.bind(this)
    this.$progress.addEventListener('mousemove', moveFn, false)
    this.$progress.addEventListener('mouseleave', moveFn, false)
    this.$progress.addEventListener('click', moveFn, false)

    this.$currentTime = this.$container.querySelector('.vinext-bar-time--current')
    this._timer = setInterval(() => {
      this.$currentTime.innerHTML = formatDuration(this.player.currentTime)
      const $played = <HTMLElement>this.$progress.querySelector('.vinext-played')
      $played.style.width = this.player.currentTime / this.player.duration * 100 + '%'
    }, 250)
  }

  private _onPlayClick() {
    const btn = this.$playBtn

    log('video paused: ', this.player.paused)

    if (this.player.paused) {
      btn.innerHTML = '&#xe602;'
      this.player.play()
    } else {
      btn.innerHTML = '&#xe603;'
      this.player.pause()
    }
  }

  private _onMuteClick() {
    const btn = this.$muteBtn

    log('video muted: ', this.player.$player.get('muted'))

    if (this.player.$player.get('muted')) {
      btn.innerHTML = '&#xe604;'
      this.player.$player.muteOn()
    } else {
      btn.innerHTML = '&#xe605;'
      this.player.$player.muteOff()
    }
  }

  private _onFsClick(evt: Event) {
    const btn = this.$fsBtn

    log('video fullscreen: ', document[fullscreenApi.element], evt.type)

    if (evt.type === 'click') {
      // btn click
      if (document[fullscreenApi.element]) {
        btn.innerHTML = '&#xe601;'
        document[fullscreenApi.exit]()
      } else {
        btn.innerHTML = '&#xe600;'
        this.player.$container[fullscreenApi.request]()
        document.removeEventListener(fullscreenApi.change, this._fsListener, false)
        document.addEventListener(fullscreenApi.change, this._fsListener, false)
      }
    } else {
      // native exit fullscreen
      if (document[fullscreenApi.element]) {
        btn.innerHTML = '&#xe600;'
      } else {
        document.removeEventListener(fullscreenApi.change, this._fsListener, false)
        btn.innerHTML = '&#xe601;'
      }
    }
  }

  private _onProgressMove(evt: DragEvent) {
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
}

export default Bar
