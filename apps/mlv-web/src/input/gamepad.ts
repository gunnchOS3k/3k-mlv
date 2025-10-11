export interface GamepadState {
  id: string;
  connected: boolean;
  axes: number[];
  buttons: boolean[];
  mapping: string;
}

export interface GamepadAction {
  moveX: number;
  moveY: number;
  jump: boolean;
  interact: boolean;
  menu: boolean;
  cameraX: number;
  cameraY: number;
}

class GamepadManager {
  private gamepads: Map<number, GamepadState> = new Map();
  private listeners: Set<(gamepads: GamepadState[]) => void> = new Set();
  private animationFrame: number | null = null;
  private isPolling = false;

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    window.addEventListener('gamepadconnected', (e) => {
      console.log('Gamepad connected:', e.gamepad.id);
      this.startPolling();
    });

    window.addEventListener('gamepaddisconnected', (e) => {
      console.log('Gamepad disconnected:', e.gamepad.id);
      this.gamepads.delete(e.gamepad.index);
      this.notifyListeners();
    });
  }

  private startPolling() {
    if (this.isPolling) return;
    this.isPolling = true;
    this.poll();
  }

  private poll() {
    const gamepads = navigator.getGamepads();
    let hasConnected = false;

    for (let i = 0; i < gamepads.length; i++) {
      const gamepad = gamepads[i];
      if (gamepad) {
        hasConnected = true;
        this.gamepads.set(i, {
          id: gamepad.id,
          connected: true,
          axes: Array.from(gamepad.axes),
          buttons: Array.from(gamepad.buttons).map(btn => btn.pressed),
          mapping: gamepad.mapping
        });
      }
    }

    if (hasConnected) {
      this.notifyListeners();
    }

    this.animationFrame = requestAnimationFrame(() => this.poll());
  }

  private notifyListeners() {
    const gamepadArray = Array.from(this.gamepads.values());
    this.listeners.forEach(listener => listener(gamepadArray));
  }

  public addListener(listener: (gamepads: GamepadState[]) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public getGamepads(): GamepadState[] {
    return Array.from(this.gamepads.values());
  }

  public getActions(gamepadIndex: number = 0): GamepadAction {
    const gamepad = this.gamepads.get(gamepadIndex);
    if (!gamepad) {
      return {
        moveX: 0, moveY: 0, jump: false, interact: false, menu: false,
        cameraX: 0, cameraY: 0
      };
    }

    // Normalize for DualSense/Switch Pro
    const deadzone = 0.15;
    const leftStickX = Math.abs(gamepad.axes[0]) > deadzone ? gamepad.axes[0] : 0;
    const leftStickY = Math.abs(gamepad.axes[1]) > deadzone ? gamepad.axes[1] : 0;
    const rightStickX = Math.abs(gamepad.axes[2]) > deadzone ? gamepad.axes[2] : 0;
    const rightStickY = Math.abs(gamepad.axes[3]) > deadzone ? gamepad.axes[3] : 0;

    return {
      moveX: leftStickX,
      moveY: leftStickY,
      jump: gamepad.buttons[0] || gamepad.buttons[1], // A or B
      interact: gamepad.buttons[2] || gamepad.buttons[3], // X or Y
      menu: gamepad.buttons[9], // Start/Options
      cameraX: rightStickX,
      cameraY: rightStickY
    };
  }

  public triggerVibration(gamepadIndex: number, strongMagnitude: number, weakMagnitude: number) {
    const gamepad = navigator.getGamepads()?.[gamepadIndex];
    if (gamepad?.hapticActuators?.[0]) {
      gamepad.hapticActuators[0].pulse(strongMagnitude, weakMagnitude);
    }
  }

  public destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    this.listeners.clear();
    this.gamepads.clear();
  }
}

export const gamepadManager = new GamepadManager();
