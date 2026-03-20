export interface Office {
  id: string;
  nameAr: string;
  nameEn?: string;
  crNumber?: string;
  phone?: string;
  email?: string;
  city: string;
  address?: string;
  logoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Building {
  id: string;
  officeId: string;
  ownerId?: string;
  nameAr: string;
  nameEn?: string;
  city: string;
  district?: string;
  address?: string;
  totalUnits: number;
  floors?: number;
  yearBuilt?: number;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Unit {
  id: string;
  buildingId: string;
  unitNumber: string;
  floor?: number;
  tenantId?: string;
  bedrooms?: number;
  bathrooms?: number;
  areaSqm?: number;
  monthlyRent?: number;
  isOccupied: boolean;
  createdAt: Date;
  updatedAt: Date;
}
