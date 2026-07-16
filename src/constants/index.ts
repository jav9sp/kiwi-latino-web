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

// ─── Estructura completa de regiones, ciudades y pueblos ─────────────────────
// Para uso futuro en filtros más granulares, perfiles de usuario, etc.

export const NZ_REGIONS = [
  {
    region: 'Northland',
    cities: [
      'Whangarei', 'Kerikeri', 'Kaitaia', 'Paihia', 'Russell',
      'Dargaville', 'Mangawhai', 'Hikurangi',
    ],
  },
  {
    region: 'Auckland',
    cities: [
      'Auckland', 'Manukau', 'North Shore', 'Henderson', 'Waitakere',
      'Papakura', 'Pukekohe', 'Takapuna', 'Botany', 'Manurewa',
      'Papatoetoe', 'Onehunga', 'Mt Eden', 'Ponsonby', 'Orewa',
      'Silverdale', 'Warkworth', 'Helensville', 'Beachlands',
    ],
  },
  {
    region: 'Waikato',
    cities: [
      'Hamilton', 'Cambridge', 'Te Awamutu', 'Huntly', 'Ngaruawahia',
      'Tokoroa', 'Thames', 'Paeroa', 'Matamata', 'Morrinsville',
      'Whangamatā', 'Tairua', 'Raglan', 'Otorohanga',
    ],
  },
  {
    region: 'Bay of Plenty',
    cities: [
      'Tauranga', 'Mount Maunganui', 'Rotorua', 'Whakatāne',
      'Te Puke', 'Katikati', 'Ōpōtiki', 'Taupō', 'Tokoroa',
    ],
  },
  {
    region: 'Gisborne',
    cities: ['Gisborne', 'Tolaga Bay', 'Ruatoria'],
  },
  {
    region: "Hawke's Bay",
    cities: [
      'Napier', 'Hastings', 'Havelock North', 'Waipawa',
      'Waipukurau', 'Wairoa',
    ],
  },
  {
    region: 'Taranaki',
    cities: ['New Plymouth', 'Stratford', 'Hāwera', 'Eltham', 'Inglewood'],
  },
  {
    region: 'Manawatū-Whanganui',
    cities: [
      'Palmerston North', 'Whanganui', 'Feilding', 'Levin',
      'Foxton', 'Dannevirke', 'Woodville', 'Marton',
    ],
  },
  {
    region: 'Wellington',
    cities: [
      'Wellington', 'Lower Hutt', 'Upper Hutt', 'Porirua',
      'Paraparaumu', 'Waikanae', 'Masterton', 'Carterton',
    ],
  },
  {
    region: 'Tasman',
    cities: ['Richmond', 'Motueka', 'Takaka', 'Murchison'],
  },
  {
    region: 'Nelson',
    cities: ['Nelson'],
  },
  {
    region: 'Marlborough',
    cities: ['Blenheim', 'Picton', 'Havelock', 'Kaikōura', 'Renwick'],
  },
  {
    region: 'West Coast',
    cities: [
      'Greymouth', 'Westport', 'Hokitika', 'Reefton',
      'Franz Josef', 'Fox Glacier',
    ],
  },
  {
    region: 'Canterbury',
    cities: [
      'Christchurch', 'Rangiora', 'Rolleston', 'Ashburton',
      'Timaru', 'Hanmer Springs', 'Methven', 'Darfield',
      'Lincoln', 'Leeston', 'Geraldine', 'Temuka',
    ],
  },
  {
    region: 'Otago',
    cities: [
      'Dunedin', 'Queenstown', 'Wānaka', 'Alexandra',
      'Cromwell', 'Oamaru', 'Balclutha', 'Milton',
      'Clyde', 'Arrowtown',
    ],
  },
  {
    region: 'Southland',
    cities: [
      'Invercargill', 'Gore', 'Te Anau', 'Bluff',
      'Riverton', 'Winton', 'Lumsden',
    ],
  },
] as const;

export type NZRegion = (typeof NZ_REGIONS)[number]['region'];
export type NZLocationEntry = (typeof NZ_REGIONS)[number];

/** Todas las ciudades y pueblos de NZ en lista plana, ordenadas alfabéticamente */
export const NZ_ALL_CITIES = NZ_REGIONS
  .flatMap((r) => r.cities)
  .sort((a, b) => a.localeCompare(b, 'es')) as string[];

export const OFICIOS = [
  'Barbero / Peluquero',
  'Mecánico',
  'Carpintero',
  'Electricista',
  'Plomero / Gasfiter',
  'Pintor',
  'Cocinero / Chef',
  'Limpieza / Aseo',
  'Jardinero / Paisajista',
  'Manicurista / Esteticista',
  'Tatuador',
  'Fotógrafo / Videógrafo',
  'Traductor / Intérprete',
  'Profesor / Tutor',
  'Contador / Finanzas',
  'Construcción / Albañilería',
  'Costura / Modistería',
  'Diseño Gráfico / Web',
  'Otro',
] as const;

export type Oficio = (typeof OFICIOS)[number];

export const POST_MODULES = [
  { key: 'HOUSING',     label: 'Alojamiento', color: '#4CAF50' },
  { key: 'JOBS',        label: 'Empleos',     color: '#2196F3' },
  { key: 'MARKETPLACE', label: 'Marketplace',  color: '#FF9800' },
  { key: 'TRIPS',       label: 'Viajes',       color: '#9C27B0' },
  { key: 'COMMUNITY',   label: 'Comunidad',    color: '#F44336' },
] as const;

export type PostModuleKey = (typeof POST_MODULES)[number]['key'];
