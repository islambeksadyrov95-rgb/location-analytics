// Типы данных для Location Intelligence Pro

export interface Competitor {
  name: string;
  dist: number;
  rating: number;
  check?: number;
  reviews: number;
  branches?: number;
}

export interface IndirectCompetitor {
  name: string;
  dist: number;
  type: string;
  rating: number;
  branches?: number;
}

export interface SynergyPlace {
  name: string;
  dist: number;
  type: string;
  people: string;
}

export interface GovPlace {
  name: string;
  dist: number;
  type: string;
}

export interface TransportStop {
  name: string;
  dist: number;
  routes: string[];
}

export interface HousingData {
  buildings: number;
  apartments: number;
  totalAreaM2: number;
  estPopulation: number;
  avgApartmentM2: number;
  radius: number;
}

export interface PedestrianData {
  weekday: number;
  weekend: number;
  peakHour: number;
  source: string;
}

export interface RadiusData {
  direct: Competitor[];
  indirect: IndirectCompetitor[];
  synergy: SynergyPlace[];
  gov: GovPlace[];
  transport: TransportStop[];
  housing: HousingData;
  pedestrian: PedestrianData;
}

export interface Listing {
  id: number;
  district: string;
  propertyType: string;
  address: string;
  lat: number;
  lng: number;
  area: number;
  price: number;
  m2: number;
  floor: number;
  ceilings: number;
  condition: string;
  entrance: string;
  features: string[];
  photos: string[];
  source: string;
  sourceUrl: string;
  phone: string;
  radius: RadiusData;
}

export interface Niche {
  id: string;
  label: string;
  icon: string;
  directRubric: string;
  indirectRubric: string;
}
