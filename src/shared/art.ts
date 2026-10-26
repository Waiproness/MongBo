import { parsePet, type Pet } from './model.ts';
import { clothing, glasses, headwear } from './wardrobe.ts';
import { fitTransform, foregroundLimbs } from './fitting.ts';
export function petSVG(input: Pet, mood?: 'sleep' | Pet['face']): string {
  const p = parsePet(input), ink = '#414145';
  const parts = {
    blob: '<path d="M23 82V58C23 26 97 26 97 58V82Q94 99 80 92Q60 103 42 92Q27 99 23 82Z"/>',
    cat: '<g class="mb-ear-left"><path d="M24 53 25 22q1-7 7 1l15 16Z"/></g><g class="mb-ear-right"><path d="m73 39 15-16q6-7 7 0l3 30Z"/></g><path d="M23 83V54q0-22 37-22t38 22V83Q93 101 80 93Q60 102 41 93Q26 100 23 83Z"/>',
    bunny: '<g class="mb-ear-left"><path d="m39 42-4-27q-1-13 9-10 8 3 8 29v8Z"/></g><g class="mb-ear-right"><path d="M65 42V34q1-27 10-29 10-2 8 11l-4 26Z"/></g><path d="M27 82V57q0-22 34-22t34 24V82Q91 100 78 93Q61 101 43 93Q28 99 27 82Z"/>',
    bot: '<rect x="23" y="34" width="74" height="61" rx="22"/><path d="M60 34V23" fill="none" stroke-width="4"/><circle cx="60" cy="19" r="5"/>',
    bear: '<g class="mb-ear-left"><circle cx="32" cy="35" r="14"/></g><g class="mb-ear-right"><circle cx="88" cy="35" r="14"/></g><rect x="23" y="34" width="74" height="63" rx="30"/><ellipse cx="60" cy="72" rx="17" ry="14" fill="#f4e8d2" stroke="none"/>',
    fox: '<g class="mb-ear-left"><path d="m24 53-2-33 25 18Z"/></g><g class="mb-ear-right"><path d="m73 38 25-18-2 33Z"/></g><path d="M24 53q0-20 36-20t36 20l5 25-15 14-26 7-26-7-15-14Z"/><path d="m29 58 31 17 31-17-8 27-23 9-23-9Z" fill="#f6eedb" stroke="none"/>',
    frog: '<circle cx="39" cy="37" r="17"/><circle cx="81" cy="37" r="17"/><path d="M20 64q0-30 40-30t40 30v13q0 23-40 21T20 77Z"/><path d="M32 77q28 12 56 0" fill="none" opacity=".25"/>',
    panda: '<g class="mb-ear-left"><circle cx="30" cy="34" r="14" fill="#55555b"/></g><g class="mb-ear-right"><circle cx="90" cy="34" r="14" fill="#55555b"/></g><rect x="23" y="32" width="74" height="65" rx="30"/><ellipse cx="43" cy="61" rx="12" ry="15" fill="#86868c" opacity=".45" stroke="none"/><ellipse cx="77" cy="61" rx="12" ry="15" fill="#86868c" opacity=".45" stroke="none"/>',
    chick: '<path d="M25 79V58q0-30 35-30 35 0 35 30v21q0 20-35 18T25 79Z"/><path d="m50 30 1-13 10 10 9-10 1 13"/><path d="m54 70 6-4 6 4-6 6Z" fill="#e9b16b" stroke="none"/>',
    penguin: '<path d="M26 79V58q0-33 34-33t34 33v21q0 20-34 18T26 79Z"/><ellipse cx="60" cy="72" rx="26" ry="25" fill="#f4f1de" stroke="none"/><path d="m54 70 6-5 6 5-6 6Z" fill="#dfad72" stroke="none"/>',
    ghost: '<path d="M23 96V59q0-34 37-34t37 34v37l-13-8-12 9-12-9-12 9-12-9Z"/><path d="M23 62 12 77l14 3m71-18 11 15-14 3"/>',
    axolotl: '<path d="m27 50-16-14 3 18-9 8 15 7-7 15 19-6m61-28 16-14-3 18 9 8-15 7 7 15-19-6" fill="#d89eac"/><rect x="24" y="36" width="72" height="61" rx="29"/><path d="M20 57 9 61m91-4 11 4" fill="none"/>',
    mushroom: '<rect x="34" y="39" width="52" height="58" rx="23" fill="#f1e5cb"/><path d="M12 48Q19 11 60 13q41-2 48 35-48 16-96 0Z"/><g fill="#f6eddb" stroke="none"><ellipse cx="39" cy="29" rx="9" ry="6"/><ellipse cx="79" cy="33" rx="10" ry="7"/><circle cx="60" cy="44" r="5"/></g>',
    dragon: '<path d="M38 37l-6-18 18 15m20 0 18-15-6 18"/><rect x="25" y="33" width="70" height="64" rx="28"/><path d="m52 34 8-13 8 13" fill="#e6c37a"/><ellipse cx="60" cy="84" rx="16" ry="10" fill="#e4d7b3" stroke="none"/>',
    puppy: '<g class="mb-ear-left"><path d="M36 36Q13 21 13 58q0 27 19 14Z"/></g><g class="mb-ear-right"><path d="M88 36q23-15 23 22 0 27-19 14Z"/></g><rect x="26" y="34" width="68" height="63" rx="27"/><ellipse cx="60" cy="73" rx="18" ry="13" fill="#ecdcc8" stroke="none"/><path d="m56 67 4 6 4-6Z" fill="#626269" stroke="none"/>',
    octopus: '<path d="M23 73V59q0-32 37-32t37 32v14l8 12q5 14-12 11l-9-9q1 18-13 11L60 87 49 98q-14 7-13-11l-9 9q-17 3-12-11Z"/><path d="M22 85h7m12 5 5 3m28 0 5-3m12-5h7" opacity=".35"/>',
  };
  const faces = {
    happy: '<path d="M43 60v5m34-5v5"/><path d="M55 71q5 5 10 0" fill="none" stroke-width="2.6"/>',
    sleepy: '<path d="M38 64q5 4 10 0m24 0q5 4 10 0"/><ellipse cx="60" cy="74" rx="3" ry="2" stroke="none"/>',
    curious: '<ellipse cx="43" cy="62" rx="3" ry="5" stroke="none"/><ellipse cx="77" cy="62" rx="3" ry="5" stroke="none"/><path d="M37 52l9-3"/><circle cx="60" cy="73" r="3" fill="none" stroke-width="2.5"/>',
    shy: '<path d="M40 61l6 3-6 3m40-6-6 3 6 3"/><path d="M56 74q4-3 8 0" fill="none" stroke-width="2.4"/>',
    calm: '<path d="M38 63q5-5 10 0m24 0q5-5 10 0M55 73q5 3 10 0" fill="none"/>',
    excited: '<path d="m37 64 6-7 6 7m22 0 6-7 6 7" fill="none"/><path d="M53 71h14q-7 17-14 0Z"/>',
    love: '<path d="M43 67C28 58 39 51 43 58c4-7 15 0 0 9Zm34 0C62 58 73 51 77 58c4-7 15 0 0 9Z" fill="#ca748b" stroke="none"/><path d="M54 72q6 7 12 0" fill="none"/>',
    wink: '<path d="M43 59v6m29-3 8 3-8 2M54 73q7 6 13-1" fill="none"/>',
    laughing: '<path d="m37 63 6-5 6 5m22 0 6-5 6 5" fill="none"/><path d="M50 71h20q-10 20-20 0Z"/><path d="M55 80q5-3 10 0" stroke="#d995a0" stroke-width="3"/>',
    proud: '<path d="M38 60h10m24 0h10M41 64h4m30 0h4M53 73q8 8 16-1" fill="none"/>',
    focused: '<path d="m37 55 12 3m22 0 12-3M43 62v5m34-5v5M55 74h10" fill="none"/>',
    bored: '<path d="M36 61h14m20 0h14M43 63v3m34-3v3M55 75h10" fill="none"/>',
    sad: '<path d="m38 54 10-3m24 0 10 3M43 61v5m34-5v5M54 77q6-7 12 0" fill="none"/>',
    crying: '<path d="M38 60q5 5 10 0m24 0q5 5 10 0M54 77q6-7 12 0" fill="none"/><path d="M41 67v10m38-10v10" stroke="#7cb6d6" stroke-width="5"/>',
    worried: '<path d="m37 55 11-4m24 0 11 4M43 62v4m34-4v4M53 76l5-2 4 2 5-2" fill="none"/>',
    scared: '<ellipse cx="43" cy="62" rx="6" ry="8" fill="#faf9ef" stroke-width="2"/><ellipse cx="77" cy="62" rx="6" ry="8" fill="#faf9ef" stroke-width="2"/><path d="M43 61v3m34-3v3"/><ellipse cx="60" cy="77" rx="5" ry="6"/><path d="M94 51q-8-11 0-18 8 11 0 18" fill="#8bbbd4" stroke="none"/>',
    angry: '<path d="m36 54 14 6m20 0 14-6M43 63v4m34-4v4M54 77q6-7 12 0" fill="none"/>',
    surprised: '<path d="M37 52q6-5 12 0m22 0q6-5 12 0" fill="none"/><ellipse cx="43" cy="62" rx="3" ry="5" stroke="none"/><ellipse cx="77" cy="62" rx="3" ry="5" stroke="none"/><ellipse cx="60" cy="76" rx="4" ry="5" fill="none" stroke-width="2.5"/>',
    confused: '<path d="m37 52 11-3m24 5h11M43 61v5m34-5v5M54 75l12-3" fill="none"/>',
    dizzy: '<path d="M43 62q-7-7-10 0t10 7q12-6 5-14m29 7q-7-7-10 0t10 7q12-6 5-14M54 77q6-5 12 0" fill="none" stroke-width="2.5"/>',
  };
  const custom = p.species === 'custom';
  const pixels = custom ? p.drawing!.pixels.map((color, i) => color ? `<rect x="${12 + i % 32 * 3}" y="${6 + Math.floor(i / 32) * 3}" width="3" height="3" fill="${color}"/>` : '').join('') : '';
  const shape = custom ? pixels : parts[p.species as keyof typeof parts];
  const body = custom ? `<g shape-rendering="crispEdges">${pixels}</g>` : `<g fill="${p.color}" stroke="${ink}" stroke-width="2.3" stroke-linejoin="round">${shape}</g><path d="M33 51Q38 43 45 43" stroke="#fff" stroke-width="4" opacity=".32" stroke-linecap="round"/>`;
  const expression = mood === 'sleep' ? 'sleepy' : mood ?? p.face;
  const face = custom ? '' : `<g class="mb-face" data-face="${expression}" stroke="${ink}" fill="${ink}" stroke-width="3.4" stroke-linecap="round">${faces[expression]}</g><ellipse cx="34" cy="72" rx="7" ry="4" fill="#dc8d92" opacity=".4"/><ellipse cx="86" cy="72" rx="7" ry="4" fill="#dc8d92" opacity=".4"/>`;
  // Equal silhouettes share an id; different drawings cannot accidentally reference another thumbnail's clip.
  let hash = 2166136261; for (let i = 0; i < shape.length; i++) hash = Math.imul(hash ^ shape.charCodeAt(i), 16777619);
  const clip = `mb-silhouette-${p.species}-${(hash >>> 0).toString(36)}`;
  const outfit = `<g class="mb-fitted-outfit" transform="${fitTransform(p, 'outfit')}">${clothing(p)}</g>`;
  const worn = `<g class="mb-outfit-clip" clip-path="url(#${clip})">${outfit}</g>`;
  const shade = (amount: number) => '#' + p.outfitColor.slice(1).match(/../g)!.map(c => Math.max(0, Math.min(255, parseInt(c, 16) + amount)).toString(16).padStart(2, '0')).join('');
  const defs = `<defs><clipPath id="${clip}" clipPathUnits="userSpaceOnUse" fill="#000" stroke="none">${shape}</clipPath><linearGradient id="mb-fabric-${p.outfitColor.slice(1)}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${shade(14)}"/><stop offset=".55" stop-color="${p.outfitColor}"/><stop offset="1" stop-color="${shade(-17)}"/></linearGradient></defs>`;
  const cape = p.outfit === 'cape';
  // Overlap the lower body to keep the rounded feet attached; step groups retain the gait.
  const legs = custom || ['ghost', 'mushroom', 'octopus'].includes(p.species) ? '' : `<g class="mb-legs" fill="${p.color}" stroke="${ink}" stroke-width="2.3"><g class="mb-foot-left"><ellipse cx="42" cy="97" rx="9" ry="6"/></g><g class="mb-foot-right"><ellipse cx="78" cy="97" rx="9" ry="6"/></g></g>`;
  // Hand-drawn faces stay intact; a small external mark supplies the temporary reaction.
  const reaction = custom && (mood === 'scared' || mood === 'surprised' || mood === 'dizzy') ? `<g class="mb-reaction" stroke="${ink}" stroke-width="3" stroke-linecap="round"><path d="M105 14v9m0 5v1"/><path d="m95 15-4 6m22-6 4 6" opacity=".5"/></g>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">${defs}<ellipse class="mb-shadow" cx="60" cy="108" rx="32" ry="5" fill="#414145" opacity=".12"/><g class="mb-air-sway"><g class="mb-figure"><g class="mb-facing"><g class="mb-body">${cape ? outfit : ''}${body}${cape ? `<g transform="${fitTransform(p, 'outfit')}"><path d="M32 74q28 15 56 0" stroke="${p.outfitColor}" stroke-width="5"/><circle cx="60" cy="82" r="3" fill="#e9cc7a" stroke="${ink}"/></g>` : worn}${foregroundLimbs(p)}<g class="${custom ? 'mb-custom-gaze' : 'mb-gaze'}">${face}<g class="mb-fitted-eyewear" transform="${fitTransform(p, 'eyewear')}">${glasses(p)}</g></g><g class="mb-fitted-accessory" transform="${fitTransform(p, 'accessory')}">${headwear(p)}</g></g>${legs}</g></g></g>${reaction}${mood === 'love' ? '<path d="M59 16C46 5 38 20 59 32C80 20 72 5 59 16" fill="#d77486"/>' : ''}</svg>`;
}
export const PET_CSS = `
.mb-pet{position:absolute;left:0;top:0;border:0;background:transparent;padding:0;margin:0;cursor:grab;touch-action:none;user-select:none;outline-offset:-6px;contain:layout style;pointer-events:auto}
.mb-pet:focus-visible{outline:3px dashed #8170bd;border-radius:28px}.mb-pet:active{cursor:grabbing}.mb-pet svg{display:block;width:100%;height:100%;overflow:visible;pointer-events:none}
/* Separate lift phases keep a supporting foot planted while the other advances. */
.mb-foot-left{transform-origin:42px 97px}.mb-foot-right{transform-origin:78px 97px}
.mb-ear-left,.mb-ear-right{transform-box:fill-box;transform-origin:50% 90%}
.mb-figure{transform-origin:60px 103px}
.mb-facing{transform-origin:60px 60px}
.mb-pet[data-facing="left"] .mb-facing{transform:scaleX(-1)}
.mb-pet[data-walking="true"] .mb-figure{transform:rotate(2deg)}
.mb-pet[data-walking="true"][data-facing="left"] .mb-figure{transform:rotate(-2deg)}
.mb-pet[data-walking="true"] .mb-gaze{transform:translateX(2px)}
.mb-air-sway{transform-origin:60px 28px;transform:rotate(var(--mb-sway,0deg))}
.mb-pet[data-motion="held"] .mb-figure{transform:scale(.98,1.035)}
.mb-pet[data-motion="held"] .mb-ear-left{transform:rotate(calc(var(--mb-sway,0deg) * .4))}
.mb-pet[data-motion="held"] .mb-ear-right{transform:rotate(calc(var(--mb-sway,0deg) * -.4))}
.mb-pet[data-motion="falling"] .mb-figure{animation:mb-fall .4s ease-in-out infinite alternate}
.mb-pet[data-motion="landing"] .mb-figure{animation:mb-land .42s ease-out both}
.mb-pet:is([data-motion="held"],[data-motion="falling"]) .mb-shadow{opacity:0}
@keyframes mb-fall{from{transform:rotate(-5deg) scale(.94,1.06)}to{transform:rotate(5deg) scale(.97,1.03)}}
@keyframes mb-land{0%{transform:scale(1.14,.82)}45%{transform:scale(.97,1.03)}75%{transform:scale(1.02,.98)}100%{transform:scale(1)}}
.mb-pet[data-walking="true"] .mb-body{animation:mb-waddle var(--mb-step-duration,.7s) linear infinite;transform-origin:60px 96px}
.mb-pet[data-walking="true"] .mb-foot-left{animation:mb-left-step var(--mb-step-duration,.7s) linear infinite}
.mb-pet[data-walking="true"] .mb-foot-right{animation:mb-right-step var(--mb-step-duration,.7s) linear infinite}
.mb-pet[data-walking="true"] .mb-body .mb-ear-left{animation:mb-left-ear var(--mb-step-duration,.7s) ease-in-out infinite}
.mb-pet[data-walking="true"] .mb-body .mb-ear-right{animation:mb-right-ear var(--mb-step-duration,.7s) ease-in-out infinite}
@keyframes mb-left-ear{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(5deg)}}
@keyframes mb-right-ear{0%,100%{transform:rotate(4deg)}50%{transform:rotate(-5deg)}}
.mb-bubble{position:absolute;top:0;left:0;box-sizing:border-box;max-width:240px;background:#fcfaf8;color:#414145;border:1px solid #dedbe1;border-radius:16px;padding:9px 14px;font:13px/1.65 system-ui,sans-serif;white-space:pre-wrap;overflow-wrap:anywhere;text-align:center;box-shadow:0 3px 12px #34303a10;pointer-events:none;z-index:2}
@keyframes mb-waddle{0%,100%{transform:translateY(0) rotate(-1.5deg)}25%{transform:translateY(-2px) rotate(0) scale(.99,1.015)}50%{transform:translateY(0) rotate(1.5deg)}75%{transform:translateY(-2px) rotate(0) scale(.99,1.015)}}
@keyframes mb-left-step{0%,100%{transform:translate(-2px,0) rotate(-8deg)}25%{transform:translate(3px,-6px) rotate(8deg)}50%{transform:translate(3px,0) rotate(8deg)}75%{transform:translate(-2px,1px) rotate(-8deg)}}
@keyframes mb-right-step{0%,100%{transform:translate(3px,0) rotate(8deg)}25%{transform:translate(-2px,1px) rotate(-8deg)}50%{transform:translate(-2px,0) rotate(-8deg)}75%{transform:translate(3px,-6px) rotate(8deg)}}
@media(prefers-reduced-motion:reduce){.mb-pet *{animation:none!important}.mb-pet :is(.mb-figure,.mb-air-sway){transform:none!important}}
`;
