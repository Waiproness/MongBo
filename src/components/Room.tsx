import { tr } from '../shared/locale.ts';
import { useEffect, useRef } from 'react';
import { PetActor } from '../shared/actor.ts';
import { PET_CSS, petSVG } from '../shared/art.ts';
import type { Pet } from '../shared/model.ts';
import { Icon } from './Icon.tsx';
export function Room({ pet, paused, onPause, speechPreview }: { pet: Pet; paused: boolean; onPause(): void; speechPreview?: { text: string; id: number } }) {
  const stage = useRef<HTMLDivElement>(null), actor = useRef<PetActor | null>(null);
  useEffect(() => { if (!stage.current) return; actor.current = new PetActor(stage.current, pet, { paused }); return () => { actor.current?.destroy(); actor.current = null; }; }, [PetActor]);
  // An imperative actor can outlive its module during Fast Refresh. Supply the live renderer.
  useEffect(() => { actor.current?.update(pet, petSVG); }, [pet, petSVG]);
  useEffect(() => { actor.current?.setPaused(paused); }, [paused]);
  useEffect(() => { if (speechPreview) actor.current?.say(speechPreview.text); }, [speechPreview]);
  return <div className="room-wrap"><style>{PET_CSS}</style>
    <div className="room-top"><span><i className="status-dot"/>{tr("ห้องพักของ ")}{pet.name || tr("เพื่อนคนใหม่")}</span><span className="room-time">quiet mode, always</span></div>
    <div className="room">
      <svg className="room-drawing" viewBox="0 0 780 430" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs><pattern id="wall" width="26" height="26" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".8" fill="var(--room-dot)" opacity=".5"/></pattern><linearGradient id="sky" x2="0" y2="1"><stop stopColor="var(--room-sky)"/><stop offset="1" stopColor="var(--room-sky-bottom)"/></linearGradient><clipPath id="window"><rect x="274" y="47" width="233" height="186" rx="75"/></clipPath></defs>
        <path fill="var(--room-wall)" d="M0 0h780v430H0z"/><path fill="url(#wall)" d="M0 0h780v300H0z"/>
        <path fill="var(--room-floor)" d="M0 304h780v126H0z"/><path stroke="var(--room-seam)" strokeWidth="2" d="M0 304h780"/>
        <ellipse cx="395" cy="366" rx="194" ry="45" fill="var(--room-rug)"/><ellipse cx="395" cy="366" rx="181" ry="36" fill="none" stroke="var(--room-rug-line)" strokeDasharray="3 6"/>
        <rect x="267" y="40" width="247" height="201" rx="82" fill="var(--room-trim)"/><rect x="274" y="47" width="233" height="186" rx="75" fill="url(#sky)"/>
        <g clipPath="url(#window)"><circle cx="444" cy="91" r="23" fill="#f6e7ad"/><path d="M245 151q20-29 44-7 26-23 46 4 32-7 36 13H245m171 28q18-28 40-9 27-15 41 9h50v38H416" fill="#faf9f3" opacity=".8"/><path d="M270 218q50-45 104 3 50-46 135-12v40H270" fill="var(--room-hills)"/></g>
        <path stroke="var(--room-trim)" strokeWidth="7" d="M390 47v187m-116-82h233"/><rect x="256" y="233" width="269" height="11" rx="5" fill="var(--room-sill)"/>
        <path d="M91 305v-44m-10-5q-27-21-8-43 25 12 18 48m3-12q1-42 22-43 19 26-22 43m-6-16q-33-7-29-29 27-3 29 29" fill="var(--room-leaf)" stroke="var(--room-leaf-ink)" strokeWidth="3"/>
        <path d="M67 281h51l-8 48H76Z" fill="#c09c81"/><path d="M64 282h57" stroke="#a68069" strokeWidth="6" strokeLinecap="round"/>
        <path d="M581 275h132v11H581z" fill="#b79476"/><path d="M593 285v66m109-66v66" stroke="#a5876f" strokeWidth="8"/>
        <rect x="607" y="221" width="66" height="46" rx="5" fill="var(--room-device)"/><rect x="612" y="226" width="56" height="34" rx="2" fill="var(--room-screen)"/><path d="m626 237-7 6 7 5m19-12-4 14m11-13 7 6-7 5" stroke="var(--room-device)" strokeWidth="2" fill="none"/><path d="M600 268h80" stroke="var(--room-device)" strokeWidth="5" strokeLinecap="round"/>
        <path d="M688 253h13v19h-13z" fill="#eee6d6"/><path d="M702 256q12 0 5 10h-5" stroke="#eee6d6" strokeWidth="3" fill="none"/>
        <path d="M125 108h65v62h-65z" fill="#c9b397"/><path d="M131 114h53v50h-53z" fill="#f6f0df"/><path d="m144 148 12-20 14 20z" fill="var(--room-picture)"/><circle cx="168" cy="124" r="5" fill="#e3c77e"/>
      </svg>
      <div className="room-note"><span>{tr("พักตรงนี้ได้นะ")}</span><span>{tr("ไม่มีอะไรต้องรีบ ♡")}</span></div>
      <div className="pet-stage" ref={stage} data-testid="pet-stage"/>
    </div>
    <div className="room-controls"><span><Icon name="mouse" size={16}/>{tr(" ลากขึ้น ปล่อยลงพื้น")}</span><div><button className="round-button" onClick={onPause} aria-label={paused ? tr("ให้น้องเดินต่อ") : tr("พักการเดิน")} title={paused ? tr("เดินต่อ") : tr("พักการเดิน")}><Icon name={paused ? 'play' : 'pause'} size={17}/></button><button className="round-button" onClick={() => actor.current?.speak()} aria-label={tr("ให้น้องพูด")} title={tr("ให้น้องพูด")}><Icon name="message" size={17}/></button><button className="small-button" onClick={() => actor.current?.call()}><Icon name="heart" size={16}/>{tr("เรียกมาหา")}</button></div></div>
  </div>;
}
