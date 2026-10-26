import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_SITE_COLOR, SITE_COLORS, parseSiteColor, siteColorTokens } from '../src/shared/site-color.ts';

test('site colors normalize HEX and reject imported style expressions', () => {
  assert.equal(parseSiteColor('#AbC'), '#aabbcc');
  for (const value of [null, {}, 'red', 'url(x)', '#abc; color:red', '<script>']) assert.equal(parseSiteColor(value), DEFAULT_SITE_COLOR);
});

function luminance(hex: string) {
  const rgb = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(n => n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4);
  return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
}
function contrast(a: string, b: string) { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); }

test('preset and extreme custom colors keep text readable in both modes', () => {
  for (const color of [...SITE_COLORS.map(p => p.color), '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00']) {
    for (const dark of [false, true]) {
      const t = siteColorTokens(color, dark);
      for (const [text, background] of [['--ink', '--page'], ['--muted', '--surface'], ['--accent-ink', '--lavender'], ['--mint-ink', '--mint']]) {
        assert.ok(contrast(t[text], t[background]) >= 4.5, `${color} dark=${dark} ${text}/${background}`);
      }
      for (const token of Object.values(t)) assert.match(token, /^#[0-9a-f]{6}([0-9a-f]{2})?$/);
    }
  }
});

test('color selection changes the palette independently of brightness mode', () => {
  const blue = SITE_COLORS[1].color, pink = SITE_COLORS[2].color;
  assert.notEqual(siteColorTokens(blue, false)['--page'], siteColorTokens(pink, false)['--page']);
  assert.ok(luminance(siteColorTokens(blue, false)['--page']) > luminance(siteColorTokens(blue, true)['--page']));
});
