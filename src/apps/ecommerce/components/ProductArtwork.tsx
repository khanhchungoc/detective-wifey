import catalogProducts from '../assets/shopoo-product-sheet-catalog.webp';
import orderProducts from '../assets/shopoo-product-sheet-orders.webp';
import { PRODUCT_ARTWORK_TILES } from '../productArtworks';

/** Bundled product photos; no remote requests or missing-image tiles. */
export function ProductArtwork({ kind }: { kind: string }) {
  const tile = PRODUCT_ARTWORK_TILES[kind];
  if (tile) {
    const image = tile.sheet === 'catalog' ? catalogProducts : orderProducts;
    const column = tile.index % 4;
    const row = Math.floor(tile.index / 4);
    return (
      <span
        aria-hidden="true"
        className="ecommerce-artwork ecommerce-artwork-photo"
        style={{
          backgroundImage: `url(${image})`,
          backgroundPosition: `${(column / 3) * 100}% ${(row / 3) * 100}%`,
        }}
      />
    );
  }

  return <svg viewBox="0 0 240 240" className={`ecommerce-artwork ecommerce-artwork-${kind}`} aria-hidden="true">
    <defs><linearGradient id={`surface-${kind}`} x2="1" y2="1"><stop stopColor="#ffffff" /><stop offset="1" stopColor="#e3e5e8" /></linearGradient></defs>
    <rect width="240" height="240" fill={kind === 'spray' ? '#a5defb' : kind === 'sponge' ? '#fff2e9' : kind === 'catfood' ? '#f5f2dd' : '#f0f1f3'} />
    <ellipse cx="124" cy="207" rx="77" ry="10" fill="#000" opacity=".09" />
    {kind === 'dress' && <><path d="m98 33 8 33h30l8-33" stroke="#923c4c" strokeWidth="7" fill="none" /><path d="m104 64 17 14 17-14 5 54 37 82q-57 22-119 0l39-82z" fill="#a4495d" /><path d="m103 66 18 14 18-14m-62 118q44 16 88 0" stroke="#e7adb6" strokeWidth="4" strokeDasharray="3 3" fill="none" /><path d="m119 91-9 92m23-72 12 72" stroke="#c87c8b" strokeWidth="2" fill="none" /></>}
    {kind === 'perfume' && <><rect x="77" y="94" width="87" height="106" rx="12" fill="#efd1ba" stroke="#c89d6e" strokeWidth="2" /><rect x="94" y="56" width="53" height="35" rx="4" fill="#d3ae6b" /><rect x="109" y="87" width="24" height="9" fill="#b98d46" /><rect x="87" y="127" width="67" height="43" fill="#fffcf6" /><text x="120" y="145" textAnchor="middle" fontSize="10" fill="#815a42">HƯƠNG GIÓ</text><text x="120" y="160" textAnchor="middle" fontSize="7" fill="#815a42">HƯƠNG HOA TRẮNG</text><path d="M86 105v85" stroke="white" strokeWidth="4" opacity=".6" /></>}
    {kind === 'mouse' && <g transform="rotate(-25 120 120)"><rect x="48" y="45" width="145" height="155" rx="8" fill="#ef7937" /><path d="M48 68h145v80H48z" fill="#f68d4c" /><rect x="64" y="118" width="110" height="58" fill="#fff9ef" /><path d="M103 130h57m-57 8h48m-48 8h55m-55 8h44" stroke="#606060" strokeWidth="3" /><text x="66" y="91" fill="white" fontSize="16">LÔ GÌ TẾCH</text><text x="66" y="109" fill="white" fontSize="9">CHUỘT KHÔNG DÂY</text></g>}
    {kind === 'spray' && <><circle cx="49" cy="65" r="30" fill="white" opacity=".25" /><circle cx="199" cy="132" r="40" fill="white" opacity=".3" /><rect x="95" y="73" width="51" height="127" rx="14" fill={`url(#surface-${kind})`} /><rect x="103" y="48" width="34" height="36" rx="6" fill="white" /><rect x="111" y="44" width="17" height="10" rx="3" fill="#d3d7d9" /><rect x="99" y="131" width="43" height="45" fill="#82968e" /><text x="120" y="111" textAnchor="middle" fontSize="10" fill="#63756b">GIÓ QUẬT</text><text x="120" y="150" textAnchor="middle" fontSize="8" fill="white">GIỮ NẾP</text><text x="120" y="164" textAnchor="middle" fontSize="13" fill="white">5</text></>}
    {kind === 'phone' && <g transform="rotate(28 120 120)"><rect x="63" y="26" width="114" height="185" rx="21" fill="#26282c" /><rect x="68" y="31" width="104" height="174" rx="17" fill="#424448" /><rect x="68" y="52" width="104" height="39" rx="18" fill="#18191d" /><circle cx="88" cy="71" r="12" fill="#080e17" stroke="#777" strokeWidth="2" /><circle cx="118" cy="71" r="12" fill="#080e17" stroke="#777" strokeWidth="2" /><circle cx="151" cy="71" r="5" fill="#eee7cf" /><circle cx="89" cy="69" r="4" fill="#285268" /></g>}
    {kind === 'trousers' && <><rect x="34" y="135" width="179" height="14" rx="3" fill="#b49062" /><path d="M80 33h82l-2 47 23 113-40 8-27-102-8 103-40-3 8-121z" fill="#7e8696" /><path d="M116 45v54M84 42l9 30m58-30-10 30" fill="none" stroke="#616b7c" strokeWidth="3" /><path d="m69 197 39 5-4 12H58zm73 4 40-8 14 16-48 7" fill="#d0dbdc" /></>}
    {kind === 'sponge' && <><path d="M110 76c-40-63 57-55 22-9" stroke="#dec993" strokeWidth="7" fill="none" /><ellipse cx="119" cy="137" rx="68" ry="49" fill="#e9d9ad" transform="rotate(-18 119 137)" />{[0,1,2,3,4,5,6,7].map(i => <path key={i} d={`M${68+i*12} 104q-21 38 8 64`} stroke="#fff7db" opacity=".55" strokeWidth="4" fill="none" />)}</>}
    {kind === 'catfood' && <><path d="m65 33 112 5 17 168-139-2z" fill="#1c2927" /><path d="m68 39 106 4 2 36H64z" fill="#3e6260" /><text x="124" y="65" textAnchor="middle" fontSize="15" fill="#fff">CẮN HOANG</text><path d="m87 118 4-27 21 16q17-6 30 0l20-17-2 31q10 44-34 46-45-3-39-49" fill="#b7c5ac" /><circle cx="111" cy="130" r="4" fill="#263d30" /><circle cx="143" cy="130" r="4" fill="#263d30" /><path d="m122 144 6 5 7-5" fill="#263d30" /><text x="124" y="188" textAnchor="middle" fontSize="10" fill="#eee">VỊ CÁ HỒI · 1,5 KG</text></>}
    {kind === 'polo' && <><path d="m83 47 26-10h24l27 10 38 41-31 24-14-19 7 110H79l6-110-15 19-30-24z" fill="white" stroke="#d6d7d9" strokeWidth="2" /><path d="m109 37 12 19 12-19 10 11-15 24-7-16-8 16-15-24z" fill="#e5e6e7" /><path d="M121 57v38" stroke="#d0d0d0" strokeWidth="2" /><circle cx="125" cy="77" r="2" fill="#a0a0a0" /></>}
    {kind === 'controller' && <g transform="rotate(-15 120 120)"><path d="M71 73q-25 0-37 89-3 39 26 25l34-31h51l35 31q29 14 25-25-11-89-37-89z" fill="#303137" stroke="#101215" strokeWidth="4" /><circle cx="93" cy="129" r="22" fill="#181a1d" stroke="#555" strokeWidth="3" /><circle cx="147" cy="153" r="18" fill="#181a1d" stroke="#555" strokeWidth="3" /><path d="M64 99v31m-15-16h31" stroke="#9c9fa6" strokeWidth="9" />{[[162,96],[179,113],[145,113],[162,130]].map(([cx,cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="6" fill="#b0b3b8" />)}</g>}
  </svg>;
}
