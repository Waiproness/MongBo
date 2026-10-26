import { tr } from '../shared/locale.ts';
import { useEffect, useRef, useState } from 'react';
import { DEFAULT_PET, parseDrawing, type Drawing } from '../shared/model.ts';
import { blankDrawing, floodFill, paintLine, type Point } from '../shared/drawing.ts';
import { ColorPicker } from './ColorPicker.tsx';
import { Pet } from './Pet.tsx';

function restore(initial?: Drawing): Drawing {
  if (initial) return parseDrawing(initial);
  try { return parseDrawing(JSON.parse(localStorage.getItem('mongbo.drawing-draft') || 'null'), true); } catch { return blankDrawing(); }
}
export function DrawingEditor({ initial, apply }: { initial?: Drawing; apply(drawing: Drawing): void }) {
  const [drawing, setDrawing] = useState<Drawing>(() => restore(initial)), [color, setColor] = useState('#b9a3e3');
  const [tool, setTool] = useState<'pen' | 'erase' | 'fill' | 'pick'>('pen'), [brush, setBrush] = useState(1), [grid, setGrid] = useState(true);
  const [error, setError] = useState(''), [cursor, setCursor] = useState<Point>({ x: 15, y: 15 }), [, setRevision] = useState(0);
  const canvas = useRef<HTMLCanvasElement>(null), current = useRef(drawing), last = useRef<Point | null>(null);
  const undo = useRef<string[][]>([]), redo = useRef<string[][]>([]);
  const hasPixels = drawing.pixels.some(Boolean);
  function update(pixels: string[]) { const next: Drawing = { size: 32, pixels }; current.current = next; setDrawing(next); setError(''); }
  function remember() { undo.current.push([...current.current.pixels]); if (undo.current.length > 30) undo.current.shift(); redo.current = []; setRevision(n => n + 1); }
  function travel(direction: 'undo' | 'redo') {
    const source = direction === 'undo' ? undo.current : redo.current, target = direction === 'undo' ? redo.current : undo.current;
    const pixels = source.pop(); if (!pixels) return; target.push([...current.current.pixels]); update(pixels); setRevision(n => n + 1);
  }
  useEffect(() => { try { localStorage.setItem('mongbo.drawing-draft', JSON.stringify(drawing)); } catch { setError('เก็บแบบร่างอัตโนมัติไม่ได้ กดใช้ภาพนี้เพื่อบันทึกลงตัวละคร'); } }, [drawing]);
  useEffect(() => {
    const ctx = canvas.current?.getContext('2d'); if (!ctx) return;
    ctx.clearRect(0, 0, 512, 512);
    drawing.pixels.forEach((c, i) => { if (c) { ctx.fillStyle = c; ctx.fillRect(i % 32 * 16, Math.floor(i / 32) * 16, 16, 16); } });
    if (grid) { ctx.strokeStyle = '#82927b24'; ctx.lineWidth = 1; ctx.beginPath(); for (let n = 0; n <= 32; n++) { ctx.moveTo(n * 16, 0); ctx.lineTo(n * 16, 512); ctx.moveTo(0, n * 16); ctx.lineTo(512, n * 16); } ctx.stroke(); }
  }, [drawing, grid]);
  function point(e: React.PointerEvent<HTMLCanvasElement>): Point { const rect = e.currentTarget.getBoundingClientRect(); return { x: Math.min(31, Math.max(0, Math.floor((e.clientX - rect.left) / rect.width * 32))), y: Math.min(31, Math.max(0, Math.floor((e.clientY - rect.top) / rect.height * 32))) }; }
  function mark(p: Point, from = p) { update(paintLine(current.current.pixels, from, p, tool === 'erase' ? '' : color, brush)); }
  function down(e: React.PointerEvent<HTMLCanvasElement>) {
    if (e.button !== 0) return; e.preventDefault(); const p = point(e); setCursor(p); e.currentTarget.focus();
    if (tool === 'pick') { const picked = current.current.pixels[p.y * 32 + p.x]; if (picked) { setColor(picked); setTool('pen'); } return; }
    remember();
    if (tool === 'fill') { update(floodFill(current.current.pixels, p, color)); return; }
    last.current = p; e.currentTarget.setPointerCapture(e.pointerId); mark(p);
  }
  function move(e: React.PointerEvent<HTMLCanvasElement>) { const p = point(e); setCursor(p); if (last.current) { mark(p, last.current); last.current = p; } }
  function keyboard(e: React.KeyboardEvent<HTMLCanvasElement>) {
    const keys: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    if (keys[e.key]) { e.preventDefault(); const [x, y] = keys[e.key]; setCursor(p => ({ x: Math.max(0, Math.min(31, p.x + x)), y: Math.max(0, Math.min(31, p.y + y)) })); }
    if (e.key === ' ' || e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); remember(); if (e.key !== ' ') update(paintLine(current.current.pixels, cursor, cursor, '', brush)); else if (tool === 'fill') update(floodFill(current.current.pixels, cursor, color)); else mark(cursor); }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); travel(e.shiftKey ? 'redo' : 'undo'); }
  }
  return <div className="drawing-editor"><p className="drawing-intro">{tr("วาดเพื่อน Pixel Art 32 × 32 ด้วยเมาส์ นิ้ว หรือปากกา พื้นลายตารางคือพื้นที่โปร่งใส")}</p>
    <div className="drawing-layout"><div><div className="drawing-tools" aria-label={tr("เครื่องมือวาด")}>{([{ key: 'pen', label: tr("ปากกา"), symbol: '✎' }, { key: 'erase', label: tr("ยางลบ"), symbol: '▱' }, { key: 'fill', label: tr("ถังสี"), symbol: '◩' }, { key: 'pick', label: tr("ดูดสี"), symbol: '⌾' }] as const).map(t => <button key={t.key} aria-label={t.label} aria-pressed={tool === t.key} className={tool === t.key ? 'selected' : ''} onClick={() => setTool(t.key)}><span aria-hidden="true">{t.symbol}</span>{t.label}</button>)}</div>
      <div className="drawing-board-wrap"><canvas ref={canvas} width="512" height="512" className="drawing-board" tabIndex={0} role="application" aria-label={tr("กระดานวาดตัวละคร ใช้ลูกศรเลื่อน กด Space วาด และ Delete ลบ")} onPointerDown={down} onPointerMove={move} onPointerUp={() => { last.current = null; }} onLostPointerCapture={() => { last.current = null; }} onPointerCancel={() => { last.current = null; }} onKeyDown={keyboard}/><span className="pixel-cursor" style={{ left: `${cursor.x / 32 * 100}%`, top: `${cursor.y / 32 * 100}%`, width: '3.125%', height: '3.125%' }}/></div>
      <div className="drawing-actions"><button className="small-button" disabled={!undo.current.length} onClick={() => travel('undo')}>{tr("ย้อนกลับ")}</button><button className="small-button" disabled={!redo.current.length} onClick={() => travel('redo')}>{tr("ทำซ้ำ")}</button><button className="small-button" onClick={() => { remember(); update(blankDrawing().pixels); }}>{tr("ล้างกระดาน")}</button><label><input type="checkbox" checked={grid} onChange={e => setGrid(e.target.checked)}/>{tr("เส้นตาราง")}</label></div><p className="drawing-keyboard-help">{tr("คีย์บอร์ด: ลูกศรเลื่อน · Space วาด · Delete ลบ · Ctrl+Z ย้อนกลับ")}</p>
    </div><div className="drawing-sidebar"><div className="drawing-mini-preview">{hasPixels ? <Pet pet={{ ...DEFAULT_PET, name: tr("เพื่อนที่วาด"), species: 'custom', drawing, accessory: 'none' }}/> : <span>{tr("เพื่อนของคุณ")}<br/>{tr("จะปรากฏตรงนี้")}</span>}<small>{tr("ตัวอย่างขนาดจริง")}</small></div><ColorPicker label={tr("สีปากกา")} value={color} onChange={setColor}/><label className="brush-label" htmlFor="brush-size">{tr("ขนาดปากกา")}<select id="brush-size" value={brush} onChange={e => setBrush(Number(e.target.value))}>{[1, 2, 3, 5].map(n => <option key={n} value={n}>{n}{tr(" พิกเซล")}</option>)}</select></label><p className="drawing-hint-copy">{tr("วาดทั้งตัวและใบหน้าได้ตามใจ")}<br/>{tr("รูปที่วาดจะเด้งและเคลื่อนที่ได้")}<br/>{tr("แบบร่างเก็บไว้ในเครื่องอัตโนมัติ")}</p></div></div>
    {error && <p className="color-error" role="status">{tr(error)}</p>}
    <button className="primary-button apply-drawing" disabled={!hasPixels} onClick={() => { try { apply(parseDrawing(current.current)); } catch (e) { setError((e as Error).message); } }}>{tr("ใช้ภาพนี้เป็นตัวละคร")}</button>
  </div>;
}
