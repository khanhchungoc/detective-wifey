import type { CSSProperties } from 'react';
import {
  IoBusinessOutline,
  IoFlowerOutline,
  IoPeopleOutline,
  IoStorefrontOutline,
} from 'react-icons/io5';
import contactAvatarSheet from '../assets/contact-avatar-persona-sheet.webp';
import kindergartenChildAvatar from '../assets/kindergarten-child-avatar.webp';
import { avatarIndexForName, normalizeAvatarName as normalize } from './avatarDirectory';

const groupNames = new Set([
  'Alpha Team BA & Dev',
  'Team Dev Technosoft',
  'Gia Đình Ngoại',
  'Cư dân tầng 8',
  'Cư dân tầng 12 CT2',
  'Technosoft - Toàn công ty',
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

type ContactAvatarProps = {
  name: string;
  /** Photo slot in the avatar sheet. Falls back to the name directory for name-only callers. */
  avatarIndex?: number;
  /** From data (thread.isGroup); shows the group icon whatever the group is named. */
  isGroup?: boolean;
  size?: number;
  shape?: 'circle' | 'square';
  fluid?: boolean;
  className?: string;
};

export function ContactAvatar({ name, avatarIndex, isGroup = false, size = 44, shape = 'circle', fluid = false, className = '' }: ContactAvatarProps) {
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

  if (isGroup || groupNames.has(normalizedName)) {
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

  const index = avatarIndex ?? avatarIndexForName(name);
  // Names without an assigned photo get an initial: borrowing another persona's photo would
  // show the wrong person (e.g. a colleague wearing the receptionist's face).
  if (index === undefined) {
    return (
      <span aria-hidden="true" className={`${classes} bg-[#D1D5DB] font-semibold text-[#4B5563]`} style={{ ...dimensions, fontSize: fluid ? undefined : size * 0.42 }}>
        {name.trim().charAt(0).toLocaleUpperCase('vi')}
      </span>
    );
  }
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
