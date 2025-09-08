// Detailed Indian Address Data System
// This file provides comprehensive access to detailed area-level address data from addressData.json

export interface AreaData {
  areaname: string;
  pincode: number;
}

export interface DistrictData {
  districtname: string;
  areas: AreaData[];
}

export interface StateData {
  statename: string;
  districts: DistrictData[];
}

export interface DetailedAddressData {
  [stateKey: string]: StateData;
}

export interface AddressSearchResult {
  state: string;
  district: string;
  area: string;
  pincode: number;
}

export interface PincodeSearchResult {
  pincode: number;
  state: string;
  district: string;
  area: string;
}

export interface AddressValidationResult {
  isValid: boolean;
  errors: string[];
  suggestions?: {
    states?: string[];
    districts?: string[];
    areas?: string[];
    pincodes?: number[];
  };
}

// Import the JSON data (you'll need to ensure this works with your build system)
// For now, we'll create a type-safe way to work with the data
let addressData: DetailedAddressData | null = null;

// Function to load the address data
export async function loadAddressData(): Promise<DetailedAddressData> {
  if (addressData) {
    return addressData;
  }
  
  try {
    // This assumes you have the JSON file accessible
    // You might need to adjust this based on your build setup
    const response = await fetch('/addressData.json');
    addressData = await response.json();
    return addressData;
  } catch (error) {
    console.error('Failed to load address data:', error);
    throw new Error('Failed to load address data');
  }
}

// Get all available states
export function getAllStates(data: DetailedAddressData): string[] {
  return Object.keys(data).map(key => data[key].statename);
}

// Get districts for a specific state
export function getDistrictsForState(data: DetailedAddressData, state: string): string[] {
  const stateKey = Object.keys(data).find(key => 
    data[key].statename.toUpperCase() === state.toUpperCase()
  );
  
  if (!stateKey) return [];
  
  return data[stateKey].districts.map(d => d.districtname);
}

// Get areas for a specific district in a state
export function getAreasForDistrict(data: DetailedAddressData, state: string, district: string): string[] {
  const stateKey = Object.keys(data).find(key => 
    data[key].statename.toUpperCase() === state.toUpperCase()
  );
  
  if (!stateKey) return [];
  
  const districtData = data[stateKey].districts.find(d => 
    d.districtname.toUpperCase() === district.toUpperCase()
  );
  
  if (!districtData) return [];
  
  return districtData.areas.map(a => a.areaname);
}

// Get pincode for a specific area
export function getPincodeForArea(data: DetailedAddressData, state: string, district: string, area: string): number | null {
  const stateKey = Object.keys(data).find(key => 
    data[key].statename.toUpperCase() === state.toUpperCase()
  );
  
  if (!stateKey) return null;
  
  const districtData = data[stateKey].districts.find(d => 
    d.districtname.toUpperCase() === district.toUpperCase()
  );
  
  if (!districtData) return null;
  
  const areaData = districtData.areas.find(a => 
    a.areaname.toUpperCase() === area.toUpperCase()
  );
  
  return areaData ? areaData.pincode : null;
}

// Search for addresses by pincode
export function searchByPincode(data: DetailedAddressData, pincode: number): PincodeSearchResult[] {
  const results: PincodeSearchResult[] = [];
  
  Object.keys(data).forEach(stateKey => {
    const stateData = data[stateKey];
    
    stateData.districts.forEach(district => {
      district.areas.forEach(area => {
        if (area.pincode === pincode) {
          results.push({
            pincode: area.pincode,
            state: stateData.statename,
            district: district.districtname,
            area: area.areaname
          });
        }
      });
    });
  });
  
  return results;
}

// Search for addresses by partial area name
export function searchByAreaName(data: DetailedAddressData, query: string, limit: number = 20): AddressSearchResult[] {
  const results: AddressSearchResult[] = [];
  const queryLower = query.toLowerCase();
  
  Object.keys(data).forEach(stateKey => {
    const stateData = data[stateKey];
    
    stateData.districts.forEach(district => {
      district.areas.forEach(area => {
        if (area.areaname.toLowerCase().includes(queryLower)) {
          results.push({
            state: stateData.statename,
            district: district.districtname,
            area: area.areaname,
            pincode: area.pincode
          });
          
          if (results.length >= limit) return;
        }
      });
      
      if (results.length >= limit) return;
    });
    
    if (results.length >= limit) return;
  });
  
  return results;
}

// Validate a complete address
export function validateAddress(data: DetailedAddressData, state: string, district: string, area: string, pincode?: number): AddressValidationResult {
  const errors: string[] = [];
  const suggestions: { states?: string[]; districts?: string[]; areas?: string[]; pincodes?: number[] } = {};
  
  // Find the state
  const stateKey = Object.keys(data).find(key => 
    data[key].statename.toUpperCase() === state.toUpperCase()
  );
  
  if (!stateKey) {
    errors.push(`State "${state}" not found`);
    suggestions.states = getAllStates(data).slice(0, 5);
    return { isValid: false, errors, suggestions };
  }
  
  const stateData = data[stateKey];
  
  // Find the district
  const districtData = stateData.districts.find(d => 
    d.districtname.toUpperCase() === district.toUpperCase()
  );
  
  if (!districtData) {
    errors.push(`District "${district}" not found in ${stateData.statename}`);
    suggestions.districts = getDistrictsForState(data, stateData.statename).slice(0, 5);
    return { isValid: false, errors, suggestions };
  }
  
  // Find the area
  const areaData = districtData.areas.find(a => 
    a.areaname.toUpperCase() === area.toUpperCase()
  );
  
  if (!areaData) {
    errors.push(`Area "${area}" not found in ${districtData.districtname}, ${stateData.statename}`);
    suggestions.areas = getAreasForDistrict(data, stateData.statename, districtData.districtname).slice(0, 5);
    return { isValid: false, errors, suggestions };
  }
  
  // Validate pincode if provided
  if (pincode && areaData.pincode !== pincode) {
    errors.push(`Pincode ${pincode} does not match the area "${area}". Expected pincode: ${areaData.pincode}`);
    suggestions.pincodes = [areaData.pincode];
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    suggestions: Object.keys(suggestions).length > 0 ? suggestions : undefined
  };
}

// Get all pincodes for a district
export function getPincodesForDistrict(data: DetailedAddressData, state: string, district: string): number[] {
  const stateKey = Object.keys(data).find(key => 
    data[key].statename.toUpperCase() === state.toUpperCase()
  );
  
  if (!stateKey) return [];
  
  const districtData = data[stateKey].districts.find(d => 
    d.districtname.toUpperCase() === district.toUpperCase()
  );
  
  if (!districtData) return [];
  
  return districtData.areas.map(a => a.pincode).sort((a, b) => a - b);
}

// Get address statistics
export function getAddressStatistics(data: DetailedAddressData): {
  totalStates: number;
  totalDistricts: number;
  totalAreas: number;
  totalPincodes: number;
} {
  let totalDistricts = 0;
  let totalAreas = 0;
  const pincodeSet = new Set<number>();
  
  Object.keys(data).forEach(stateKey => {
    const stateData = data[stateKey];
    totalDistricts += stateData.districts.length;
    
    stateData.districts.forEach(district => {
      totalAreas += district.areas.length;
      district.areas.forEach(area => {
        pincodeSet.add(area.pincode);
      });
    });
  });
  
  return {
    totalStates: Object.keys(data).length,
    totalDistricts,
    totalAreas,
    totalPincodes: pincodeSet.size
  };
}

// Export a simplified version for backward compatibility
export const DETAILED_ADDRESS_UTILS = {
  getAllStates,
  getDistrictsForState,
  getAreasForDistrict,
  getPincodeForArea,
  searchByPincode,
  searchByAreaName,
  validateAddress,
  getPincodesForDistrict,
  getAddressStatistics
};
