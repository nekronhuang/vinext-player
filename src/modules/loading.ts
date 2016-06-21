import Player = require('../main')

const log = require('debug')('vinext:loading')

class Loading {
  player: Player
  $container: HTMLElement

  constructor(p: Player) {
    this.player = p
    this.$container = this.player.$parent.querySelector('#vinext-loading--ctn') as HTMLElement

    this.$inject()
  }

  public toggleDisplay(status: boolean) {
    log('show loading: %o', status)
    if (status) {
      this.$container.classList.add('__show')
    } else {
      this.$container.classList.remove('__show')
    }
  }

  private $inject() {
    const html = `
      <div class="vinext-loading">
        <div class="vinext-circle--outer"></div>
        <div class="vinext-circle--inner"></div>
      </div>
    `
    this.$container.innerHTML += html
    this.$container.addEventListener('mousemove', this.stopPropagation, false)
    this.$container.addEventListener('mousedown', this.stopPropagation, false)
  }

  private stopPropagation(evt: MouseEvent) {
    evt.stopPropagation()
  }
}

export default Loading
