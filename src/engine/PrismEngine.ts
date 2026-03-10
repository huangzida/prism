import { Mesh, Program, Renderer, Triangle } from "ogl";
import { defu } from "defu";
import { fragmentShader, vertexShader } from "./index";
import { meta } from "../meta";
import type { PrismAnimationType, PrismProps } from "../types";

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const toRad = (deg: number) => (deg * Math.PI) / 180;

const setMat3FromEuler = (
  yawY: number,
  pitchX: number,
  rollZ: number,
  out: Float32Array,
) => {
  const cy = Math.cos(yawY);
  const sy = Math.sin(yawY);
  const cx = Math.cos(pitchX);
  const sx = Math.sin(pitchX);
  const cz = Math.cos(rollZ);
  const sz = Math.sin(rollZ);
  const r00 = cy * cz + sy * sx * sz;
  const r01 = -cy * sz + sy * sx * cz;
  const r02 = sy * cx;
  const r10 = cx * sz;
  const r11 = cx * cz;
  const r12 = -sx;
  const r20 = -sy * cz + cy * sx * sz;
  const r21 = sy * sz + cy * sx * cz;
  const r22 = cy * cx;
  out[0] = r00;
  out[1] = r10;
  out[2] = r20;
  out[3] = r01;
  out[4] = r11;
  out[5] = r21;
  out[6] = r02;
  out[7] = r12;
  out[8] = r22;
  return out;
};

export class PrismRenderer {
  private renderer: Renderer;
  private gl: any;
  private mesh: Mesh;
  private program: Program;
  private geometry: Triangle;
  private container: HTMLElement;
  private config: PrismProps;
  private iResBuf = new Float32Array(2);
  private offsetPxBuf = new Float32Array(2);
  private rotBuf = new Float32Array(9);
  private animationId = 0;
  private isPaused = false;
  private startTime = performance.now();
  private ro: ResizeObserver;
  private io?: IntersectionObserver;
  private pointer = { x: 0, y: 0, inside: false };
  private yaw = 0;
  private pitch = 0;
  private roll = 0;
  private targetYaw = 0;
  private targetPitch = 0;
  private noiseIsZero = false;
  private wX = 0.8;
  private wY = 0.7;
  private wZ = 0.5;
  private phX = 0;
  private phZ = 0;
  private currentAnimationType: PrismAnimationType = "rotate";
  private onPointerMoveBound?: (e: PointerEvent) => void;
  private onLeaveBound?: () => void;
  private onBlurBound?: () => void;

  constructor(container: HTMLElement, config: PrismProps) {
    this.container = container;
    this.config = defu(config, meta.defaultConfig);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    this.renderer = new Renderer({
      dpr,
      alpha: this.config.transparent,
      antialias: true,
    });
    this.gl = this.renderer.gl;
    this.gl.disable(this.gl.DEPTH_TEST);
    this.gl.disable(this.gl.CULL_FACE);
    this.gl.disable(this.gl.BLEND);

    const canvas = this.gl.canvas as HTMLCanvasElement;
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    this.container.appendChild(canvas);

    this.geometry = new Triangle(this.gl);
    this.program = new Program(this.gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        iResolution: { value: this.iResBuf },
        iTime: { value: 0 },
        uHeight: { value: 1 },
        uBaseHalf: { value: 1 },
        uUseBaseWobble: { value: 1 },
        uRot: { value: this.rotBuf },
        uGlow: { value: 1 },
        uOffsetPx: { value: this.offsetPxBuf },
        uNoise: { value: 0 },
        uSaturation: { value: 1 },
        uScale: { value: 1 },
        uHueShift: { value: 0 },
        uColorFreq: { value: 1 },
        uBloom: { value: 1 },
        uCenterShift: { value: 1 },
        uInvBaseHalf: { value: 1 },
        uInvHeight: { value: 1 },
        uMinAxis: { value: 1 },
        uPxScale: { value: 1 },
        uTimeScale: { value: 1 },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });

    this.mesh = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program,
    });

    this.ro = new ResizeObserver(this.resize);
    this.ro.observe(this.container);

    this.applyConfig(this.config, true);
    this.resize();
    this.attachVisibilityObserver();
    this.start();
  }

  public updateConfig(newConfig: Partial<PrismProps>) {
    const previousAnimationType = this.currentAnimationType;
    const previousSuspend = this.config.suspendWhenOffscreen;
    this.config = { ...this.config, ...newConfig };
    this.applyConfig(this.config);

    if (previousAnimationType !== this.currentAnimationType) {
      this.detachAnimationListeners();
      this.attachAnimationListeners();
      this.start();
    }

    if (previousSuspend !== this.config.suspendWhenOffscreen) {
      this.detachVisibilityObserver();
      this.attachVisibilityObserver();
    }
  }

  public pause() {
    this.isPaused = true;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = 0;
    }
  }

  public resume() {
    if (!this.isPaused) {
      return;
    }
    this.isPaused = false;
    this.start();
  }

  public restart() {
    this.startTime = performance.now();
    this.start();
  }

  public destroy() {
    this.pause();
    this.detachAnimationListeners();
    this.detachVisibilityObserver();
    this.ro.disconnect();
    if (this.container.contains(this.gl.canvas as HTMLCanvasElement)) {
      this.container.removeChild(this.gl.canvas as HTMLCanvasElement);
    }
    this.gl.getExtension("WEBGL_lose_context")?.loseContext();
  }

  private applyConfig(config: PrismProps, initial = false) {
    const uniforms = this.program.uniforms;
    const H = Math.max(0.001, config.height || 3.5);
    const BW = Math.max(0.001, config.baseWidth || 5.5);
    const BASE_HALF = BW * 0.5;
    const NOISE = Math.max(0, config.noise || 0);
    const SCALE = Math.max(0.001, config.scale || 3.6);
    const SATURATION = config.transparent === false ? 1 : 1.5;
    uniforms.uHeight.value = H;
    uniforms.uBaseHalf.value = BASE_HALF;
    uniforms.uGlow.value = Math.max(0, config.glow || 0);
    uniforms.uNoise.value = NOISE;
    uniforms.uSaturation.value = SATURATION;
    uniforms.uScale.value = SCALE;
    uniforms.uHueShift.value = toRad(config.hueShift || 0);
    uniforms.uColorFreq.value = Math.max(0, config.colorFrequency || 1);
    uniforms.uBloom.value = Math.max(0, config.bloom || 0);
    uniforms.uCenterShift.value = H * 0.25;
    uniforms.uInvBaseHalf.value = 1 / BASE_HALF;
    uniforms.uInvHeight.value = 1 / H;
    uniforms.uMinAxis.value = Math.min(BASE_HALF, H);
    uniforms.uTimeScale.value = Math.max(0, config.timeScale || 0);

    this.offsetPxBuf[0] = (config.offsetX || 0) * (this.renderer.dpr || 1);
    this.offsetPxBuf[1] = (config.offsetY || 0) * (this.renderer.dpr || 1);
    uniforms.uOffsetPx.value = this.offsetPxBuf;

    this.currentAnimationType = config.animationType || "rotate";
    uniforms.uUseBaseWobble.value = this.currentAnimationType === "rotate" ? 1 : 0;

    if (initial) {
      const rnd = () => Math.random();
      this.wX = 0.3 + rnd() * 0.6;
      this.wY = 0.2 + rnd() * 0.7;
      this.wZ = 0.1 + rnd() * 0.5;
      this.phX = rnd() * Math.PI * 2;
      this.phZ = rnd() * Math.PI * 2;
      this.attachAnimationListeners();
    }

    this.noiseIsZero = NOISE < 1e-6;
    this.resize();
  }

  private start() {
    if (this.animationId || this.isPaused) {
      return;
    }
    this.animationId = requestAnimationFrame(this.render);
  }

  private render = (t: number) => {
    this.animationId = 0;
    if (this.isPaused) {
      return;
    }

    const time = (t - this.startTime) * 0.001;
    const uniforms = this.program.uniforms;
    uniforms.iTime.value = time;
    let continueRAF = true;
    const mode = this.currentAnimationType;
    const TS = Math.max(0, this.config.timeScale || 0);

    if (mode === "hover") {
      const maxPitch = 0.6 * Math.max(0, this.config.hoverStrength || 0);
      const maxYaw = 0.6 * Math.max(0, this.config.hoverStrength || 0);
      this.targetYaw = (this.pointer.inside ? -this.pointer.x : 0) * maxYaw;
      this.targetPitch = (this.pointer.inside ? this.pointer.y : 0) * maxPitch;
      const inertia = clamp(this.config.inertia || 0.05, 0, 1);
      this.yaw = this.yaw + (this.targetYaw - this.yaw) * inertia;
      this.pitch = this.pitch + (this.targetPitch - this.pitch) * inertia;
      this.roll = this.roll + (0 - this.roll) * 0.1;
      uniforms.uRot.value = setMat3FromEuler(
        this.yaw,
        this.pitch,
        this.roll,
        this.rotBuf,
      );

      if (this.noiseIsZero) {
        const settled =
          Math.abs(this.yaw - this.targetYaw) < 1e-4 &&
          Math.abs(this.pitch - this.targetPitch) < 1e-4 &&
          Math.abs(this.roll) < 1e-4;
        if (settled) {
          continueRAF = false;
        }
      }
    } else if (mode === "3drotate") {
      const tScaled = time * TS;
      this.yaw = tScaled * this.wY;
      this.pitch = Math.sin(tScaled * this.wX + this.phX) * 0.6;
      this.roll = Math.sin(tScaled * this.wZ + this.phZ) * 0.5;
      uniforms.uRot.value = setMat3FromEuler(
        this.yaw,
        this.pitch,
        this.roll,
        this.rotBuf,
      );
      if (TS < 1e-6) {
        continueRAF = false;
      }
    } else {
      this.rotBuf[0] = 1;
      this.rotBuf[1] = 0;
      this.rotBuf[2] = 0;
      this.rotBuf[3] = 0;
      this.rotBuf[4] = 1;
      this.rotBuf[5] = 0;
      this.rotBuf[6] = 0;
      this.rotBuf[7] = 0;
      this.rotBuf[8] = 1;
      uniforms.uRot.value = this.rotBuf;
      if (TS < 1e-6) {
        continueRAF = false;
      }
    }

    this.renderer.render({ scene: this.mesh });

    if (continueRAF) {
      this.animationId = requestAnimationFrame(this.render);
    }
  };

  private resize = () => {
    if (!this.container) {
      return;
    }
    const width = this.container.clientWidth || 1;
    const height = this.container.clientHeight || 1;
    this.renderer.setSize(width, height);
    this.iResBuf[0] = this.gl.drawingBufferWidth;
    this.iResBuf[1] = this.gl.drawingBufferHeight;
    const SCALE = Math.max(0.001, this.config.scale || 3.6);
    this.program.uniforms.uPxScale.value =
      1 / ((this.gl.drawingBufferHeight || 1) * 0.1 * SCALE);
  };

  private onPointerMove = (e: PointerEvent) => {
    const ww = Math.max(1, window.innerWidth);
    const wh = Math.max(1, window.innerHeight);
    const cx = ww * 0.5;
    const cy = wh * 0.5;
    const nx = (e.clientX - cx) / (ww * 0.5);
    const ny = (e.clientY - cy) / (wh * 0.5);
    this.pointer.x = clamp(nx, -1, 1);
    this.pointer.y = clamp(ny, -1, 1);
    this.pointer.inside = true;
    this.start();
  };

  private onPointerLeave = () => {
    this.pointer.inside = false;
    this.start();
  };

  private attachAnimationListeners() {
    if (this.currentAnimationType !== "hover") {
      return;
    }
    this.onPointerMoveBound = this.onPointerMove;
    this.onLeaveBound = this.onPointerLeave;
    this.onBlurBound = this.onPointerLeave;
    window.addEventListener("pointermove", this.onPointerMoveBound, {
      passive: true,
    });
    window.addEventListener("mouseleave", this.onLeaveBound);
    window.addEventListener("blur", this.onBlurBound);
  }

  private detachAnimationListeners() {
    if (this.onPointerMoveBound) {
      window.removeEventListener("pointermove", this.onPointerMoveBound);
      this.onPointerMoveBound = undefined;
    }
    if (this.onLeaveBound) {
      window.removeEventListener("mouseleave", this.onLeaveBound);
      this.onLeaveBound = undefined;
    }
    if (this.onBlurBound) {
      window.removeEventListener("blur", this.onBlurBound);
      this.onBlurBound = undefined;
    }
  }

  private attachVisibilityObserver() {
    if (!this.config.suspendWhenOffscreen) {
      return;
    }
    this.io = new IntersectionObserver((entries) => {
      const visible = entries.some((entry) => entry.isIntersecting);
      if (visible) {
        this.resume();
      } else {
        this.pause();
      }
    });
    this.io.observe(this.container);
  }

  private detachVisibilityObserver() {
    this.io?.disconnect();
    this.io = undefined;
    if (!this.isPaused) {
      return;
    }
    if (!this.config.suspendWhenOffscreen) {
      this.resume();
    }
  }
}
