export const LATAM_COUNTRIES = [
  { code: 'AR', name: 'Argentina' },
  { code: 'BO', name: 'Bolivia' },
  { code: 'BR', name: 'Brasil' },
  { code: 'CL', name: 'Chile' },
  { code: 'CO', name: 'Colombia' },
  { code: 'CR', name: 'Costa Rica' },
  { code: 'CU', name: 'Cuba' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'SV', name: 'El Salvador' },
  { code: 'ES', name: 'España' },
  { code: 'GT', name: 'Guatemala' },
  { code: 'HN', name: 'Honduras' },
  { code: 'MX', name: 'México' },
  { code: 'NI', name: 'Nicaragua' },
  { code: 'PA', name: 'Panamá' },
  { code: 'PY', name: 'Paraguay' },
  { code: 'PE', name: 'Perú' },
  { code: 'PR', name: 'Puerto Rico' },
  { code: 'DO', name: 'República Dominicana' },
  { code: 'UY', name: 'Uruguay' },
  { code: 'VE', name: 'Venezuela' },
] as const;

export type LatamCountryCode = (typeof LATAM_COUNTRIES)[number]['code'];

export function getFlagEmoji(countryCode: string): string {
  return countryCode
    .toUpperCase()
    .split('')
    .map((c) => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0)))
    .join('');
}

export const NZ_CITIES = [
  'Auckland', 'Wellington', 'Christchurch', 'Hamilton',
  'Tauranga', 'Napier', 'Palmerston North', 'Dunedin',
  'Nelson', 'Queenstown',
] as const;

export type NZCity = (typeof NZ_CITIES)[number];

export const POST_MODULES = [
  { key: 'HOUSING',     label: 'Alojamiento', color: '#4CAF50' },
  { key: 'JOBS',        label: 'Empleos',     color: '#2196F3' },
  { key: 'MARKETPLACE', label: 'Marketplace',  color: '#FF9800' },
  { key: 'TRIPS',       label: 'Viajes',       color: '#9C27B0' },
  { key: 'COMMUNITY',   label: 'Comunidad',    color: '#F44336' },
] as const;

export type PostModuleKey = (typeof POST_MODULES)[number]['key'];
