import { useState, useEffect, useCallback } from 'react';
import { 
  DetailedAddressData, 
  loadAddressData, 
  getAllStates, 
  getDistrictsForState, 
  getAreasForDistrict,
  getPincodeForArea,
  searchByPincode,
  searchByAreaName,
  validateAddress,
  getPincodesForDistrict,
  getAddressStatistics,
  AddressSearchResult,
  PincodeSearchResult,
  AddressValidationResult
} from '../lib/detailedAddressData';

interface UseAddressDataReturn {
  // Data
  addressData: DetailedAddressData | null;
  
  // Loading and error states
  isLoading: boolean;
  error: string | null;
  
  // Utility functions
  getAllStates: () => string[];
  getDistrictsForState: (state: string) => string[];
  getAreasForDistrict: (state: string, district: string) => string[];
  getPincodeForArea: (state: string, district: string, area: string) => number | null;
  searchByPincode: (pincode: number) => PincodeSearchResult[];
  searchByAreaName: (query: string, limit?: number) => AddressSearchResult[];
  validateAddress: (state: string, district: string, area: string, pincode?: number) => AddressValidationResult;
  getPincodesForDistrict: (state: string, district: string) => number[];
  getAddressStatistics: () => { totalStates: number; totalDistricts: number; totalAreas: number; totalPincodes: number } | null;
  
  // Refresh function
  refresh: () => Promise<void>;
}

export function useAddressData(): UseAddressDataReturn {
  const [addressData, setAddressData] = useState<DetailedAddressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await loadAddressData();
      setAddressData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load address data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // Wrapper functions that check if data is loaded
  const safeGetAllStates = useCallback(() => {
    if (!addressData) return [];
    return getAllStates(addressData);
  }, [addressData]);

  const safeGetDistrictsForState = useCallback((state: string) => {
    if (!addressData) return [];
    return getDistrictsForState(addressData, state);
  }, [addressData]);

  const safeGetAreasForDistrict = useCallback((state: string, district: string) => {
    if (!addressData) return [];
    return getAreasForDistrict(addressData, state, district);
  }, [addressData]);

  const safeGetPincodeForArea = useCallback((state: string, district: string, area: string) => {
    if (!addressData) return null;
    return getPincodeForArea(addressData, state, district, area);
  }, [addressData]);

  const safeSearchByPincode = useCallback((pincode: number) => {
    if (!addressData) return [];
    return searchByPincode(addressData, pincode);
  }, [addressData]);

  const safeSearchByAreaName = useCallback((query: string, limit: number = 20) => {
    if (!addressData) return [];
    return searchByAreaName(addressData, query, limit);
  }, [addressData]);

  const safeValidateAddress = useCallback((state: string, district: string, area: string, pincode?: number) => {
    if (!addressData) {
      return {
        isValid: false,
        errors: ['Address data not loaded yet'],
        suggestions: undefined
      };
    }
    return validateAddress(addressData, state, district, area, pincode);
  }, [addressData]);

  const safeGetPincodesForDistrict = useCallback((state: string, district: string) => {
    if (!addressData) return [];
    return getPincodesForDistrict(addressData, state, district);
  }, [addressData]);

  const safeGetAddressStatistics = useCallback(() => {
    if (!addressData) return null;
    return getAddressStatistics(addressData);
  }, [addressData]);

  return {
    // Data
    addressData,
    
    // Loading and error states
    isLoading,
    error,
    
    // Utility functions
    getAllStates: safeGetAllStates,
    getDistrictsForState: safeGetDistrictsForState,
    getAreasForDistrict: safeGetAreasForDistrict,
    getPincodeForArea: safeGetPincodeForArea,
    searchByPincode: safeSearchByPincode,
    searchByAreaName: safeSearchByAreaName,
    validateAddress: safeValidateAddress,
    getPincodesForDistrict: safeGetPincodesForDistrict,
    getAddressStatistics: safeGetAddressStatistics,
    
    // Refresh function
    refresh
  };
}
