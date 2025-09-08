import React, { useState } from 'react';
import { useAddressData } from '../hooks/useAddressData';

export const AddressSearch: React.FC = () => {
  const {
    searchByPincode,
    searchByAreaName,
    getAddressStatistics
  } = useAddressData();

  const [searchType, setSearchType] = useState<'pincode' | 'area'>('pincode');
  const [pincodeQuery, setPincodeQuery] = useState('');
  const [areaQuery, setAreaQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handlePincodeSearch = () => {
    if (!pincodeQuery.trim()) return;
    
    setIsSearching(true);
    const pincode = parseInt(pincodeQuery);
    
    if (isNaN(pincode) || pincode.toString().length !== 6) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    
    const results = searchByPincode(pincode);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleAreaSearch = () => {
    if (!areaQuery.trim()) return;
    
    setIsSearching(true);
    const results = searchByAreaName(areaQuery, 50);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleSearch = () => {
    if (searchType === 'pincode') {
      handlePincodeSearch();
    } else {
      handleAreaSearch();
    }
  };

  const clearResults = () => {
    setSearchResults([]);
    setPincodeQuery('');
    setAreaQuery('');
  };

  const stats = getAddressStatistics();

  return (
    <div className="address-search">
      <div className="search-header">
        <h2>Address Search</h2>
        {stats && (
          <div className="stats">
            <span>{stats.totalStates} States</span>
            <span>{stats.totalDistricts} Districts</span>
            <span>{stats.totalAreas} Areas</span>
            <span>{stats.totalPincodes} Pincodes</span>
          </div>
        )}
      </div>

      <div className="search-controls">
        <div className="search-type-selector">
          <label>
            <input
              type="radio"
              value="pincode"
              checked={searchType === 'pincode'}
              onChange={(e) => setSearchType(e.target.value as 'pincode' | 'area')}
            />
            Search by Pincode
          </label>
          <label>
            <input
              type="radio"
              value="area"
              checked={searchType === 'area'}
              onChange={(e) => setSearchType(e.target.value as 'pincode' | 'area')}
            />
            Search by Area Name
          </label>
        </div>

        <div className="search-input">
          {searchType === 'pincode' ? (
            <div className="input-group">
              <input
                type="text"
                placeholder="Enter 6-digit pincode"
                value={pincodeQuery}
                onChange={(e) => setPincodeQuery(e.target.value)}
                maxLength={6}
                pattern="[0-9]{6}"
              />
              <button onClick={handlePincodeSearch} disabled={!pincodeQuery.trim()}>
                Search
              </button>
            </div>
          ) : (
            <div className="input-group">
              <input
                type="text"
                placeholder="Enter area name (e.g., 'Mumbai', 'Delhi')"
                value={areaQuery}
                onChange={(e) => setAreaQuery(e.target.value)}
              />
              <button onClick={handleAreaSearch} disabled={!areaQuery.trim()}>
                Search
              </button>
            </div>
          )}
        </div>

        <button className="clear-btn" onClick={clearResults}>
          Clear Results
        </button>
      </div>

      {isSearching && (
        <div className="searching">
          Searching...
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="search-results">
          <h3>Search Results ({searchResults.length})</h3>
          <div className="results-list">
            {searchResults.map((result, index) => (
              <div key={index} className="result-item">
                {searchType === 'pincode' ? (
                  <>
                    <div className="pincode">{result.pincode}</div>
                    <div className="details">
                      <div className="area">{result.area}</div>
                      <div className="location">{result.district}, {result.state}</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="area">{result.area}</div>
                    <div className="details">
                      <div className="pincode">Pincode: {result.pincode}</div>
                      <div className="location">{result.district}, {result.state}</div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {searchResults.length === 0 && !isSearching && (pincodeQuery || areaQuery) && (
        <div className="no-results">
          No results found for your search.
        </div>
      )}

      <style jsx>{`
        .address-search {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        .search-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .search-header h2 {
          margin-bottom: 1rem;
          color: #333;
        }
        
        .stats {
          display: flex;
          justify-content: center;
          gap: 2rem;
          flex-wrap: wrap;
        }
        
        .stats span {
          background: #f8f9fa;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
          color: #666;
        }
        
        .search-controls {
          margin-bottom: 2rem;
        }
        
        .search-type-selector {
          display: flex;
          gap: 2rem;
          margin-bottom: 1rem;
          justify-content: center;
        }
        
        .search-type-selector label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }
        
        .search-input {
          margin-bottom: 1rem;
        }
        
        .input-group {
          display: flex;
          gap: 0.5rem;
          max-width: 500px;
          margin: 0 auto;
        }
        
        .input-group input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }
        
        .input-group button {
          padding: 0.75rem 1.5rem;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
        }
        
        .input-group button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        
        .clear-btn {
          display: block;
          margin: 0 auto;
          padding: 0.5rem 1rem;
          background: #6c757d;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .searching {
          text-align: center;
          padding: 2rem;
          color: #666;
        }
        
        .search-results h3 {
          margin-bottom: 1rem;
          color: #333;
        }
        
        .results-list {
          display: grid;
          gap: 1rem;
        }
        
        .result-item {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: #f8f9fa;
        }
        
        .result-item .pincode {
          font-weight: bold;
          color: #007bff;
          min-width: 80px;
        }
        
        .result-item .area {
          font-weight: bold;
          color: #333;
          min-width: 150px;
        }
        
        .result-item .details {
          flex: 1;
        }
        
        .result-item .location {
          color: #666;
          font-size: 0.9rem;
        }
        
        .no-results {
          text-align: center;
          padding: 2rem;
          color: #666;
        }
      `}</style>
    </div>
  );
};
