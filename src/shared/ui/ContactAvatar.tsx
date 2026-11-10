import type { CSSProperties } from 'react';
import {
  IoBusinessOutline,
  IoFlowerOutline,
  IoPeopleOutline,
  IoStorefrontOutline,
} from 'react-icons/io5';
import contactAvatarSheet from '../assets/contact-avatar-persona-sheet.jpg';
import kindergartenChildAvatar from '../assets/kindergarten-child-avatar.jpg';

const AVATAR_PROFILES: Array<{ index: number; names: string[] }> = [
  { index: 0, names: ['Anh Tuấn Thợ Điện'] }, // Anonymous electrician tools preserve the alias mystery.
  { index: 1, names: ['Lan Anh Kế Toán'] }, // Ordinary workplace group photo.
  { index: 2, names: ['Thảo PT California', 'Thảo PT Gym'] }, // Full-body gym mirror photo.
  { index: 3, names: ['Bé Ngọc KTX'] }, // Anime student avatar.
  { index: 4, names: ['Mai Lễ Tân'] }, // Casual side-angle lobby selfie.
  { index: 5, names: ['Mẹ Ở Quê', 'Mẹ'] }, // Her garden and vegetables.
  { index: 6, names: ['Vợ'] }, // Candid adult couple photo.
  { index: 7, names: ['Tuấn Đụt'] }, // Amateur football team photo from a distance.
  { index: 8, names: ['Nam Dev'] }, // Cat photo beside a laptop.
  { index: 9, names: ['Bách Dev'] }, // Anime developer avatar.
  { index: 10, names: ['Anh Bách QLDA - Ban Quản Lý Toà Nhà'] }, // Distant team gathering photo.
  { index: 11, names: ['Bác Bảo Vệ Chung Cư'] }, // Everyday security-booth photo.
  { index: 12, names: ['Đức Nghĩa'] }, // Landscape photo.
  { index: 13, names: ['Bé Mèo Dễ Thương'] }, // Cat profile photo.
  { index: 14, names: ['Bé Trang SV (0904***888)', 'Bé Trang SV'] }, // Off-center cafe selfie.
];

const normalize = (name: string) =>
  name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLocaleLowerCase('vi')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const avatarIndexByName = new Map<string, number>();
for (const profile of AVATAR_PROFILES) {
  for (const name of profile.names) avatarIndexByName.set(normalize(name), profile.index);
}

const groupNames = new Set([
  'Alpha Team BA & Dev',
  'Team Dev Technosoft',
  'Gia Đình Ngoại',
  'Cư dân tầng 8',
]);

const flowerShopNames = new Set(['Tiệm Hoa Tươi Mimosa']);
const propertyOfficeNames = new Set(['Ban Quản Lý']);
const serviceNames = new Set([
  'Chăm sóc thuê bao',
  'EVN_HANOI',
  'Giao Hàng',
  'Giao Nước',
  'HOTEL_SAOMAI',
  'Mua sắm',
  'Nhà mạng',
  'Quán Cơm Thúy',
  'Shipper Mua sắm (0971***333)',
  'SPX_EXPRESS',
  'Thông tin gói cước',
  'VIETCOMBANK',
  'VIETTEL_QC',
  'Viettel CSKH',
]);

for (const names of [groupNames, flowerShopNames, propertyOfficeNames, serviceNames]) {
  const normalized = [...names].map(normalize);
  names.clear();
  normalized.forEach((name) => names.add(name));
}

function hashName(name: string) {
  let hash = 0;
  for (const character of name) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return hash;
}

type ContactAvatarProps = {
  name: string;
  size?: number;
  shape?: 'circle' | 'square';
  fluid?: boolean;
  className?: string;
};

export function ContactAvatar({ name, size = 44, shape = 'circle', fluid = false, className = '' }: ContactAvatarProps) {
  const normalizedName = normalize(name);
  const dimensions: CSSProperties = fluid ? { width: '100%', height: '100%' } : { width: size, height: size, flexShrink: 0 };
  const displayClass = fluid ? 'flex' : 'inline-flex';
  const radiusClass = shape === 'square' ? 'rounded-[1px]' : 'rounded-full';
  const classes = `${displayClass} items-center justify-center overflow-hidden ${radiusClass} border border-black/5 ${className}`;

  if (normalizedName === normalize('Lớp Mầm Non Tuổi Thơ')) {
    return (
      <span
        aria-hidden="true"
        className={classes}
        style={{ ...dimensions, backgroundImage: `url(${kindergartenChildAvatar})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      />
    );
  }

  if (groupNames.has(normalizedName)) {
    return (
      <span aria-hidden="true" className={`${classes} bg-[#EAF2FF] text-[#2563EB]`} style={dimensions}>
        <IoPeopleOutline className="h-[48%] w-[48%]" />
      </span>
    );
  }

  if (flowerShopNames.has(normalizedName)) {
    return (
      <span aria-hidden="true" className={`${classes} bg-[#FCEFF5] text-[#C44779]`} style={dimensions}>
        <IoFlowerOutline className="h-[48%] w-[48%]" />
      </span>
    );
  }

  if (propertyOfficeNames.has(normalizedName)) {
    return (
      <span aria-hidden="true" className={`${classes} bg-[#EDF2F7] text-[#526477]`} style={dimensions}>
        <IoBusinessOutline className="h-[48%] w-[48%]" />
      </span>
    );
  }

  if (serviceNames.has(normalizedName)) {
    return (
      <span aria-hidden="true" className={`${classes} bg-[#FFF4E5] text-[#A35B12]`} style={dimensions}>
        <IoStorefrontOutline className="h-[48%] w-[48%]" />
      </span>
    );
  }

  const index = avatarIndexByName.get(normalizedName) ?? hashName(normalizedName || 'unknown') % 16;
  const column = index % 4;
  const row = Math.floor(index / 4);
  const style: CSSProperties = {
    ...dimensions,
    backgroundColor: '#E5E5EA',
    backgroundImage: `url(${contactAvatarSheet})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: '400% 400%',
    backgroundPosition: `${(column / 3) * 100}% ${(row / 3) * 100}%`,
  };

  return <span aria-hidden="true" className={classes} style={style} />;
}
