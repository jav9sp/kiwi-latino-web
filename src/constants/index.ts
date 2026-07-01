export const NZ_CITIES = [
  'Auckland', 'Wellington', 'Christchurch', 'Hamilton', 'Tauranga',
  'Dunedin', 'Napier-Hastings', 'Palmerston North', 'Nelson', 'Queenstown',
  'Rotorua', 'Whangarei', 'New Plymouth', 'Invercargill',
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
