export class InputHandler {
  constructor() {
    this.listeners = new Map();
  }

  subscribe(event, handler) {
    this.listeners.set(event, handler);
  }

  attach() {
    window.addEventListener('keydown', this.handleKeydown.bind(this), { passive: false });
  }

  handleKeydown(event) {
    const code = event.code;
    const gameKeys = ['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', 'Space', 'KeyP'];
    if (gameKeys.includes(code)) {
      event.preventDefault();
    }

    if (code === 'ArrowLeft') {
      this.listeners.get('move')?.(-1);
    } else if (code === 'ArrowRight') {
      this.listeners.get('move')?.(1);
    } else if (code === 'ArrowDown') {
      this.listeners.get('softDrop')?.();
    } else if (code === 'ArrowUp') {
      this.listeners.get('rotate')?.();
    } else if (code === 'Space') {
      this.listeners.get('hardDrop')?.();
    } else if (code === 'KeyP') {
      this.listeners.get('pause')?.();
    }
  }
}
