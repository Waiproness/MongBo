import { useState } from 'react';
import { tr } from '../shared/locale.ts';

const browsers = {
  Brave: 'brave://extensions', Edge: 'edge://extensions', Opera: 'opera://extensions',
};
export function BrowserSetup() {
  const [browser, setBrowser] = useState<keyof typeof browsers>('Brave');
  return <>
    <label>{tr('เบราว์เซอร์ของคุณ')} <select value={browser} onChange={e => setBrowser(e.target.value as keyof typeof browsers)}>{Object.keys(browsers).map(name => <option key={name}>{name}</option>)}</select></label>
    <p>{tr('ดาวน์โหลด ZIP แล้วแตกลงโฟลเดอร์ใหม่ จากนั้นเปิด')} <code>{browsers[browser]}</code></p>
    <p>{tr('เปิด Developer mode กด Load unpacked แล้วเลือกโฟลเดอร์ที่มี manifest.json')}</p>
    <a className="primary-button" href="./downloads/mongbo-chromium.zip" download>{tr('ดาวน์โหลดสำหรับ {0}', browser)}</a>

  </>;
}
