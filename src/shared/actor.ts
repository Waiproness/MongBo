import { bounds, DEFAULT_SPEECH, parsePet, type Pet } from './model.ts';
import { petSVG } from './art.ts';
import { floorY, fallStep, swayStep, driftStep } from './motion.ts';
import { tr } from './locale.ts';

type Motion = 'idle' | 'walking' | 'held' | 'falling' | 'landing';

/** A single companion. Owns its frame loop and listeners, with explicit cleanup. */
export class PetActor {
  element: HTMLButtonElement;
  pet: Pet;
  x = 0; y = 0; paused = false;
  private tx = 0; private raf = 0; private last = 0; private next = 0;
  private velocityY = 0; private landingUntil = 0; private state: Motion = 'idle';
  private velocityX = 0; private dragSpeed = 0; private dragLast = 0;
  private sway = 0; private swayVelocity = 0;
  private renderer = petSVG;
  private dragging = false; private moved = false; private offsetX = 0; private offsetY = 0;
  private bubbleTimer?: ReturnType<typeof setTimeout>;
  private speechTimer?: ReturnType<typeof setTimeout>;
  private bubble: HTMLSpanElement | null = null;
  private bubbleWidth = 0; private bubbleHeight = 0; private areaWidth = 0; private areaHeight = 0;
  private messageIndex = 0;
  private observer: ResizeObserver;
  private abort = new AbortController();
  private motion = matchMedia('(prefers-reduced-motion: reduce)');
  private walking = false;
  private onMenu?: (x: number, y: number) => void;

  constructor(private container: HTMLElement, pet: Pet, options: { paused?: boolean; onMenu?: (x: number, y: number) => void; startFraction?: number } = {}) {
    this.pet = parsePet(pet); this.paused = options.paused ?? false; this.onMenu = options.onMenu;
    this.element = document.createElement('button'); this.element.type = 'button'; this.element.className = 'mb-pet';
    this.element.dataset.facing = 'right';
    container.append(this.element); this.render();
    this.areaWidth = container.clientWidth; this.areaHeight = container.clientHeight;
    this.x = Math.max(0, container.clientWidth - pet.size) * Math.max(0, Math.min(1, options.startFraction ?? .5)); this.y = this.floor;
    this.tx = this.x; this.element.dataset.motion = 'idle'; this.position();
    const signal = this.abort.signal;
    this.element.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      this.dragging = true; this.moved = false; this.velocityY = 0; this.velocityX = 0;
      this.dragSpeed = 0; this.dragLast = performance.now();
      const rect = this.element.getBoundingClientRect(); this.offsetX = e.clientX - rect.left; this.offsetY = e.clientY - rect.top;
      this.element.setPointerCapture(e.pointerId); this.setMotion('held');
    }, { signal });
    this.element.addEventListener('pointermove', e => {
      if (!this.dragging) return;
      const rect = container.getBoundingClientRect();
      const point = bounds(e.clientX - rect.left - this.offsetX, e.clientY - rect.top - this.offsetY, container.clientWidth, container.clientHeight, this.pet.size);
      if (Math.hypot(point.x - this.x, point.y - this.y) > 2) this.moved = true;
      const now = performance.now(), dx = point.x - this.x;
      const speed = Math.max(-1800, Math.min(1800, dx / Math.max(.008, (now - this.dragLast) / 1000)));
      this.dragSpeed += (speed - this.dragSpeed) * .45; this.dragLast = now;
      this.setFacing(dx);
      this.x = point.x; this.y = point.y; this.position();
    }, { signal });
    const release = () => {
      if (!this.dragging) return;
      this.dragging = false;
      this.velocityX = Math.max(-180, Math.min(180, this.dragSpeed * .12)); this.dragSpeed = 0;
      this.tx = this.x; this.next = performance.now() + 3000; this.drop();
    };
    this.element.addEventListener('pointerup', release, { signal });
    this.element.addEventListener('pointercancel', release, { signal });
    this.element.addEventListener('lostpointercapture', release, { signal });
    this.element.addEventListener('click', () => { if (!this.moved) this.speak(); }, { signal });
    this.element.addEventListener('contextmenu', e => { if (this.onMenu) { e.preventDefault(); this.onMenu(e.clientX, e.clientY); } }, { signal });
    this.element.addEventListener('keydown', e => {
      const keys: Record<string, [number, number]> = { ArrowLeft: [-16, 0], ArrowRight: [16, 0], ArrowUp: [0, -16], ArrowDown: [0, 16] };
      if (!keys[e.key]) return;
      e.preventDefault(); const [dx, dy] = keys[e.key];
      this.setFacing(dx); this.velocityX = 0;
      const point = bounds(this.x + dx, this.y + dy, container.clientWidth, container.clientHeight, this.pet.size);
      this.x = point.x; this.y = point.y; this.tx = this.x; this.next = performance.now() + 3000;
      this.drop(); this.position();
    }, { signal });
    this.observer = new ResizeObserver(() => this.clamp()); this.observer.observe(container);
    document.addEventListener('visibilitychange', () => { this.last = 0; this.dragSpeed = 0; this.dragLast = performance.now(); }, { signal });
    window.addEventListener('mongbo-languagechange', () => this.accessibility(), { signal });
    this.motion.addEventListener('change', () => { if (this.motion.matches && !this.dragging) this.drop(); }, { signal });
    this.raf = requestAnimationFrame(this.frame);
    this.scheduleSpeech();
  }
  private get floor() { return floorY(this.container.clientHeight, this.pet.size); }
  private get reaction() { return this.state === 'held' ? 'surprised' : this.state === 'falling' ? 'scared' : this.state === 'landing' ? 'dizzy' : undefined; }
  private render() {
    // Only allowlisted SVG paths and a validated hex color enter markup. Names stay in text/attributes.
    this.element.innerHTML = this.renderer(this.pet, this.reaction);
    this.element.style.width = `${this.pet.size}px`; this.element.style.height = `${this.pet.size}px`;
    this.element.style.setProperty('--mb-step-duration', `${(.9 - this.pet.energy * .0035).toFixed(3)}s`);
    this.accessibility();
  }
  private accessibility() {
    this.element.title = tr('ลากแล้วยกน้องได้ ปล่อยเพื่อกลับสู่พื้น • คลิกเพื่อทักทาย • ปุ่มลูกศรเพื่อขยับ');
    this.element.setAttribute('aria-label', tr('{0} ลากย้ายหรือใช้ปุ่มลูกศรได้', this.pet.name));
  }
  update(pet: Pet, renderer = petSVG) {
    if (pet.id !== this.pet.id) { this.messageIndex = 0; this.clearBubble(); }
    this.pet = parsePet(pet); this.renderer = renderer; this.render(); this.clamp(); this.scheduleSpeech();
  }
  setPaused(value: boolean) { this.paused = value; if (value && this.state === 'walking') this.setMotion('idle'); }
  private clamp() {
    const grounded = this.state === 'idle' || this.state === 'walking' || this.state === 'landing';
    this.areaWidth = this.container.clientWidth; this.areaHeight = this.container.clientHeight;
    if (this.bubble) { this.bubble.style.maxWidth = `${Math.min(240, Math.max(24, this.areaWidth - 12))}px`; this.bubbleWidth = this.bubble.offsetWidth; this.bubbleHeight = this.bubble.offsetHeight; }
    const point = bounds(this.x, this.y, this.container.clientWidth, this.container.clientHeight, this.pet.size);
    this.x = point.x; this.y = grounded ? this.floor : point.y;
    this.tx = bounds(this.tx, this.y, this.container.clientWidth, this.container.clientHeight, this.pet.size).x;
    this.position();
  }
  private setMotion(value: Motion) {
    if (this.state === value) return;
    const reaction = this.reaction; this.state = value; this.element.dataset.motion = value;
    this.setWalking(value === 'walking');
    if (reaction !== this.reaction) this.render();
  }
  private drop() {
    this.velocityY = 0;
    if (this.motion.matches || this.y >= this.floor) { this.y = this.floor; this.velocityX = 0; this.setMotion('idle'); this.position(); }
    else this.setMotion('falling');
  }
  private setFacing(dx: number) { if (Math.abs(dx) >= 1) this.element.dataset.facing = dx < 0 ? 'left' : 'right'; }
  private swing(delta: number) {
    if (!this.dragging && this.sway === 0 && this.swayVelocity === 0) return;
    if (this.motion.matches) { this.sway = 0; this.swayVelocity = 0; this.dragSpeed = 0; }
    else if (this.dragging || Math.abs(this.sway) + Math.abs(this.swayVelocity) > .01) {
      const target = this.dragging ? Math.max(-24, Math.min(24, this.dragSpeed * .018)) : 0;
      const next = swayStep(this.sway, this.swayVelocity, target, delta);
      this.sway = next.angle; this.swayVelocity = next.velocity;
      this.dragSpeed *= Math.exp(-8 * delta);
    } else { this.sway = 0; this.swayVelocity = 0; }
    this.element.style.setProperty('--mb-sway', `${this.sway.toFixed(3)}deg`);
  }
  private position() { this.element.style.transform = `translate3d(${this.x}px,${this.y}px,0)`; this.positionBubble(); }
  private positionBubble() {
    if (!this.bubble) return;
    const left = Math.max(4, Math.min(this.x + this.pet.size / 2 - this.bubbleWidth / 2, this.areaWidth - this.bubbleWidth - 4));
    const above = this.y - this.bubbleHeight - 7;
    const top = Math.max(4, Math.min(above >= 4 ? above : this.y + this.pet.size + 5, this.areaHeight - this.bubbleHeight - 4));
    this.bubble.style.transform = `translate3d(${left}px,${top}px,0)`;
  }
  private setWalking(value: boolean) { if (this.walking !== value) { this.walking = value; this.element.dataset.walking = String(value); } }
  private frame = (time: number) => {
    const delta = this.last ? Math.min((time - this.last) / 1000, .05) : 0; this.last = time;
    if (!document.hidden) this.swing(delta);
    if (!document.hidden && !this.dragging) {
      if (this.state === 'falling') {
        const fall = fallStep(this.y, this.velocityY, this.floor, delta);
        const drift = driftStep(this.x, this.velocityX, this.container.clientWidth, this.pet.size, delta);
        if (this.tx === this.x) this.tx = drift.x;
        this.x = drift.x; this.velocityX = drift.velocity;
        this.y = fall.y; this.velocityY = fall.velocity;
        if (fall.landed) { this.velocityX = 0; this.landingUntil = time + 420; this.next = Math.max(this.next, time + 900); this.setMotion('landing'); }
        this.position();
      } else if (this.state === 'landing' && time < this.landingUntil) {
        this.setWalking(false);
      } else if (!this.paused && !this.motion.matches && this.pet.energy > 0) {
        if (time > this.next) {
          this.tx = Math.random() * Math.max(0, this.container.clientWidth - this.pet.size);
          this.next = time + 3500 + (100 - this.pet.energy) * 65;
        }
        const dx = this.tx - this.x, distance = Math.abs(dx);
        this.setMotion(distance > 2 ? 'walking' : 'idle');
        if (distance > 2) { this.setFacing(dx); this.x += Math.sign(dx) * Math.min(distance, (18 + this.pet.energy * .6) * delta); }
        this.y = this.floor; this.position();
      } else this.setMotion('idle');
    }
    this.raf = requestAnimationFrame(this.frame);
  };
  call() {
    this.velocityX = 0;
    this.tx = Math.max(0, (this.container.clientWidth - this.pet.size) / 2);
    this.next = performance.now() + 8000;
    if (this.paused || this.motion.matches || this.pet.energy === 0) { this.x = this.tx; this.y = this.floor; this.velocityY = 0; this.velocityX = 0; this.setMotion('idle'); this.position(); }
    this.say(tr('มาแล้วว ♡'));
  }
  say(text: string) {
    this.clearBubble();
    const bubble = document.createElement('span'); bubble.className = 'mb-bubble'; bubble.textContent = text;
    bubble.setAttribute('role', 'status'); bubble.setAttribute('aria-live', 'polite');
    bubble.style.maxWidth = `${Math.min(240, Math.max(24, this.areaWidth - 12))}px`;
    this.container.append(bubble); this.bubble = bubble;
    this.bubbleWidth = bubble.offsetWidth; this.bubbleHeight = bubble.offsetHeight; this.positionBubble();
    this.bubbleTimer = setTimeout(() => this.clearBubble(), Math.min(12000, Math.max(4000, [...text].length * 90)));
  }
  speak() {
    const speech = this.pet.speech ?? DEFAULT_SPEECH;
    if (!speech.messages.length) return;
    const message = speech.messages[this.messageIndex++ % speech.messages.length];
    this.say(this.pet.speech ? message : tr(message));
  }
  private clearBubble() { clearTimeout(this.bubbleTimer); this.bubble?.remove(); this.bubble = null; }
  private scheduleSpeech() {
    clearTimeout(this.speechTimer); const speech = this.pet.speech ?? DEFAULT_SPEECH;
    if (!speech.auto || !speech.messages.length) return;
    this.speechTimer = setTimeout(() => { if (!document.hidden && !this.dragging && !this.bubble) this.speak(); this.scheduleSpeech(); }, speech.interval * 1000);
  }
  destroy() { cancelAnimationFrame(this.raf); clearTimeout(this.speechTimer); this.clearBubble(); this.observer.disconnect(); this.abort.abort(); this.element.remove(); }
}
