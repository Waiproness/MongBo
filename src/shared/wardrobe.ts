import type { Pet } from './model.ts';

export function clothing(p: Pet): string {
  const c = `url(#mb-fabric-${p.outfitColor.slice(1)})`, line = '#414145';
  const items: Record<Pet['outfit'], string> = {
    none: '',
    tee: `<path d="m32 75 12-4q16 9 32 0l12 4 10 11-9 7-7-7v10H38V86l-7 7-9-7Z" fill="${c}"/><path d="M50 74q10 10 20 0"/>`,
    hoodie: `<path d="M29 79q3-11 15-10 16 10 32 0 12-1 15 10l-8 17H37Z" fill="${c}"/><path d="M43 72q17 17 34 0M55 79v8m10-8v8m-17 3h24v6H48"/>`,
    sweater: `<path d="m35 74 11-3q14 9 28 0l11 3 10 16-12 5-4-9v10H41V86l-4 9-12-5Z" fill="${c}"/><path d="M43 91h34M50 75v18m10-15v15m10-18v18" opacity=".45"/>`,
    overalls: `<path d="M39 72h8v10h26V72h8v24H39Z" fill="${c}"/><path d="M48 86h24v9H48"/><circle cx="43" cy="81" r="2" fill="#f2d182"/><circle cx="77" cy="81" r="2" fill="#f2d182"/>`,
    suit: `<path d="m35 76 13-6 12 14 12-14 13 6-3 20H38Z" fill="${c}"/><path d="m49 72 11 12 11-12-11 23Z" fill="#f7f4e9"/><path d="m58 79 4 0 2 5-4 7-4-7Z" fill="#b86e7b"/>`,
    scarf: `<path d="M30 72q30 12 60 0v12q-30 10-60 0Z" fill="${c}"/><path d="m72 80 11 3-3 20-12-3Z" fill="${c}"/><path d="M72 94l9 2m-10 2 9 2"/>`,
    raincoat: `<path d="M34 75q-1-13 10-12l16 15 16-15q11-1 10 12l4 21H30Z" fill="${c}"/><path d="M60 78v18m-18-9h9m18 0h9"/><circle cx="64" cy="85" r="1"/><circle cx="64" cy="91" r="1"/>`,
    space: `<rect x="32" y="73" width="56" height="24" rx="10" fill="${c}"/><rect x="45" y="77" width="29" height="16" rx="3" fill="#f4f2f0"/><path d="M50 81h9m-9 5h18"/><circle cx="68" cy="81" r="2" fill="#d78781"/>`,
    kimono: `<path d="m35 71 25 10 25-10 12 17-17 5v4H40v-4l-17-5Z" fill="${c}"/><path d="m43 73 17 13 17-13M39 89h42"/><path d="M49 86h22v8H49Z" fill="#e8c983"/>`,
    armor: `<path d="m32 74 12-5 16 8 16-8 12 5-7 23H39Z" fill="${c}"/><path d="m44 73 16 8 16-8M60 80v16M40 89h40"/><path d="m60 82 6 3-6 8-6-8Z" fill="#e5ca7a"/>`,
    labcoat: `<path d="m35 76 15-7 10 13 10-13 15 7-3 21H38Z" fill="${c}"/><path d="m48 73-5 8 17 10 17-10-5-8M60 82v15m-18-8h10m17 0h10"/><path d="M72 78v7m-3-4h6" stroke="#c58080"/>`,
    sailor: `<path d="M34 74h52l-4 23H38Z" fill="${c}"/><path d="m37 73 23 11 23-11-8 18-15-5-15 5Z" fill="#f5f3f1"/><path d="m56 85 4-3 4 3-4 10Z" fill="#c88582"/>`,
    jersey: `<path d="m35 75 11-4q14 8 28 0l11 4 9 12-12 7-5-8v11H43V86l-5 8-12-7Z" fill="${c}"/><path d="M55 81h9l-5 12" stroke="#faf7e9" stroke-width="3"/>`,
    pajamas: `<path d="m35 75 13-4 12 9 12-9 13 4-4 22H39Z" fill="${c}"/><path d="m49 73 11 7 11-7M60 80v17"/><g fill="#eee5bb" stroke="none"><circle cx="45" cy="83" r="2"/><circle cx="75" cy="89" r="2"/><circle cx="49" cy="93" r="2"/></g>`,
    cape: `<path d="M32 74q28 15 56 0l9 27-22-5-15 6-15-6-22 5Z" fill="${c}"/><path d="M32 74q28 15 56 0"/><circle cx="60" cy="82" r="4" fill="#e9cc7a"/>`,
  };
  return `<g class="mb-clothing" stroke="${line}" stroke-width="1.5" stroke-linejoin="round" fill="none">${items[p.outfit]}</g>`;
}

export function headwear(p: Pet): string {
  const c = p.accessoryColor;
  const items: Record<Pet['accessory'], string> = {
    none: '',
    sprout: `<path d="M60 34V19" fill="none"/><path d="M60 24Q43 26 43 12Q59 10 60 24M60 20Q62 5 77 8Q78 21 60 20" fill="${c}"/>`,
    headphones: `<path d="M24 58V49C24 16 96 16 96 49V58" fill="none" stroke="${c}" stroke-width="7"/><rect x="17" y="52" width="13" height="25" rx="6" fill="${c}"/><rect x="90" y="52" width="13" height="25" rx="6" fill="${c}"/>`,
    bow: `<path d="M72 37Q56 17 57 33Q57 47 72 37Q90 19 88 35Q88 49 72 37" fill="${c}"/><circle cx="72" cy="37" r="4" fill="#f5d9bf"/>`,
    star: `<path d="m87 27 3 8 9 1-7 6 2 9-7-5-8 5 2-9-7-6 9-1Z" fill="${c}"/>`,
    cap: `<path d="M32 39q0-22 28-22t28 22Z" fill="${c}"/><path d="M30 39h65q5 0 5 5H32Z" fill="${c}"/><path d="M60 18v20" fill="none"/>`,
    beanie: `<path d="M34 37q0-24 26-24t26 24" fill="${c}"/><rect x="29" y="32" width="62" height="12" rx="5" fill="${c}"/><circle cx="60" cy="11" r="7" fill="${c}"/><path d="M43 18v14m17-15v15m17-14v14" opacity=".4"/>`,
    crown: `<path d="m36 38-5-22 17 10 12-16 12 16 17-10-5 22Z" fill="${c}"/><path d="M37 32h46"/><circle cx="60" cy="27" r="3" fill="#eab4b4"/>`,
    wizard: `<path d="m35 36 24-33 24 33Z" fill="${c}"/><ellipse cx="60" cy="37" rx="37" ry="7" fill="${c}"/><path d="m59 13 1 4 4 1-4 2-1 4-2-4-4-2 4-1Z" fill="#f2dc96" stroke="none"/>`,
    flower: `<g fill="${c}"><ellipse cx="83" cy="27" rx="6" ry="9"/><ellipse cx="83" cy="42" rx="6" ry="9"/><ellipse cx="75" cy="35" rx="9" ry="6"/><ellipse cx="91" cy="35" rx="9" ry="6"/></g><circle cx="83" cy="35" r="5" fill="#f0d27a"/>`,
    halo: `<ellipse cx="60" cy="16" rx="27" ry="7" fill="none" stroke="${c}" stroke-width="5"/>`,
    pirate: `<path d="M24 39q3-19 19-12 17-27 34 0 17-7 20 12Z" fill="${c}"/><circle cx="60" cy="29" r="7" fill="#f7f3e9"/><path d="m54 27 3 3m6-3 3 3m-10 5h8"/>`,
    beret: `<path d="M28 34Q25 15 59 15Q91 13 94 27Q99 40 28 40Z" fill="${c}"/><path d="m60 15 4-9"/><path d="M33 38h53"/>`,
    horns: `<path d="M36 40Q16 32 28 13Q27 29 43 31m34 0q16-2 15-18 12 19-8 27" fill="${c}"/>`,
    antenna: `<path d="m39 37-8-18m50 18 8-18" fill="none"/><circle cx="29" cy="15" r="6" fill="${c}"/><circle cx="91" cy="15" r="6" fill="${c}"/>`,
    party: `<path d="m42 36 18-32 18 32Z" fill="${c}"/><path d="m49 23 20 2m-15-12 9 1" stroke="#f5e6a7" stroke-width="4"/><circle cx="60" cy="5" r="4" fill="#f5e6a7"/>`,
    chef: `<path d="M35 34q-13-3-9-15 4-11 17-7 15-17 30 0 15-5 20 8 3 12-8 14l-2 11H37Z" fill="${c}"/><path d="M37 35h46m-36-9v8m26-8v8"/>`,
    straw: `<path d="m38 35 5-19h34l5 19" fill="${c}"/><ellipse cx="60" cy="37" rx="38" ry="8" fill="${c}"/><path d="M40 29h40" stroke="#bd7b7f" stroke-width="5"/>`,
    tiara: `<path d="m35 37 5-14 11 7 9-19 9 19 11-7 5 14Z" fill="${c}"/><path d="m60 18 4 6-4 6-4-6Z" fill="#efb9ce"/>`,
    leaf: `<path d="M38 37Q35 2 82 12Q84 40 38 37Z" fill="${c}"/><path d="m41 34 32-18m-20 11 1-10m8 5 12 3"/>`,
  };
  return `<g stroke="#414145" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${items[p.accessory]}</g>`;
}

export function glasses(p: Pet): string {
  const items: Record<Pet['eyewear'], string> = {
    none: '',
    round: '<circle cx="43" cy="62" r="11"/><circle cx="77" cy="62" r="11"/><path d="M54 62h12M24 59l8 2m56 0 8-2"/>',
    square: '<rect x="30" y="53" width="25" height="18" rx="4"/><rect x="65" y="53" width="25" height="18" rx="4"/><path d="M55 61h10m-42-3 7 2m60 0 7-2"/>',
    sun: '<path d="M29 54h26v10q-13 17-26 0Zm36 0h26v10q-13 17-26 0Z" fill="#414145"/><path d="M55 58h10M24 56h5m62 0h5"/><path d="m34 57 12 0m25 0h12" stroke="#f4f3f2" opacity=".4"/>',
    heart: '<path d="M43 72C18 59 32 44 43 55C54 44 68 59 43 72ZM77 72C52 59 66 44 77 55C88 44 102 59 77 72Z" fill="#dc9bb24d"/><path d="M56 59h8"/>',
    monocle: '<circle cx="77" cy="62" r="12"/><path d="M88 67q13 21 4 29" stroke="#bba16d"/>',
    visor: '<rect x="28" y="52" width="64" height="20" rx="8" fill="#a8b5e080"/><path d="M33 57h51m-47 9h15m-12-14 9 20" stroke="#949cc3"/>',
  };
  return `<g class="mb-eyewear" fill="none" stroke="#414145" stroke-width="2" stroke-linejoin="round">${items[p.eyewear]}</g>`;
}
