import { useState, useEffect } from "react";
import { getPurifierSuggestions } from "../services/api";
import { searchPurifierProducts, getProminentPollutantsFromPrediction } from "../services/externalAPI";
import "./PurifierSuggestions.css";

export default function PurifierSuggestions({ selectedState, predictionData }) {
  const [purifierData, setPurifierData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState(null);

  useEffect(() => {
    if (!selectedState || selectedState === "All") return;

    const fetchPurifierData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // First get state-specific pollutant analysis
        const analysis = await getPurifierSuggestions(selectedState);
        setPurifierData(analysis);
        
        // Get prominent pollutants from prediction data (if available)
        let prominentPollutants = [];
        if (predictionData && predictionData.length > 0) {
          const pollutantAnalysis = getProminentPollutantsFromPrediction(predictionData);
          // Only use TOP 1 primary pollutant
          const primaryPollutant = pollutantAnalysis[0]?.pollutant;
          if (primaryPollutant) {
            prominentPollutants = [primaryPollutant];
          }
        } else if (analysis.pollutant) {
          // Fallback to single pollutant from backend
          prominentPollutants = [analysis.pollutant];
        }
        
        // Search for actual products dynamically based on prominent pollutants
        if (prominentPollutants.length > 0) {
          const productSearch = await searchPurifierProducts(prominentPollutants, selectedState, predictionData);
          setSearchResults(productSearch);
        }
      } catch (err) {
        console.error("Error fetching purifier suggestions:", err);
        setError("Failed to load purifier suggestions");
      } finally {
        setLoading(false);
      }
    };

    fetchPurifierData();
  }, [selectedState, predictionData]);

  if (!selectedState || selectedState === "All") {
    return (
      <div className="purifier-suggestions">
        <h3>Purifier Recommendations</h3>
        <p>Please select a specific state to see purifier recommendations based on local pollutant data.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="purifier-suggestions">
        <h3>Searching for best purifiers...</h3>
        <p>Please wait while we find the best options for {selectedState}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="purifier-suggestions">
        <h3>Error Loading Recommendations</h3>
        <p className="error">{error}</p>
      </div>
    );
  }

  if (!purifierData) {
    return (
      <div className="purifier-suggestions">
        <h3>Loading purifier suggestions...</h3>
        <p>Analyzing air quality data for {selectedState}</p>
      </div>
    );
  }

  return (
    <div className="purifier-suggestions">
      <div className="pollutant-info">
        <p><strong>Primary Pollutant:</strong> {purifierData.pollutant}</p>
        <p><em>{purifierData.generalAdvice}</em></p>
      </div>

      {/* External API Search Results */}
      {searchResults && searchResults.products && searchResults.products.length > 0 && (
        <div className="section-title">
          <h4>🔍 Recommended Purifiers for {searchResults.state}</h4>
          <div className="product-count-info">
            <p>Showing {searchResults.productCount || searchResults.products.length} products for {searchResults.prominentPollutants?.join(', ') || 'air pollutants'}</p>
          </div>
          <div className="purifier-grid">
            {searchResults.products.map((product, index) => (
              <div key={`${product.id}-${index}`} className="purifier-card no-image">
                <div className="purifier-header">
                  <div className="brand-name">{product.name.split(' ')[0]}</div>
                  <div className="product-name">{product.name.split(' ').slice(1).join(' ')}</div>
                  {product.pollutantSpecific && (
                    <div className="pollutant-badge">{product.pollutantSpecific} Removal</div>
                  )}
                </div>
                
                <div className="purifier-content">
                  <div className="price-section">
                    <div className="price-label">Price</div>
                    <div className="price-value">{product.cost}</div>
                  </div>
                  
                  <div className="benefits-section">
                    <div className="benefits-label">Key Benefits</div>
                    <div className="benefits-text">{product.benefits}</div>
                  </div>
                  
                  <div className="specs-section">
                    <div className="spec-item">
                      <span className="spec-label">Coverage:</span>
                      <span className="spec-value">{product.coverageArea || '30m²'}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Efficiency:</span>
                      <span className="spec-value">{product.removalRate || '95%+'}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Rating:</span>
                      <span className="spec-value">⭐ {product.rating || '4.0'}/5</span>
                    </div>
                  </div>
                  
                  <div className="action-section">
                    <a 
                      href={product.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="buy-button primary"
                    >
                      View on Amazon →
                    </a>
                    <div className="availability">
                      {product.availability || 'In Stock'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fallback if no products found */}
      {searchResults && (!searchResults.products || searchResults.products.length === 0) && (
        <div className="section-title">
          <h4>🔍 No Products Found</h4>
          <p>No purifier recommendations available at the moment. Please try again later.</p>
        </div>
      )}

      {/* Loading state for API calls */}
      {!searchResults && !loading && (
        <div className="section-title">
          <h4>🔍 Searching Products...</h4>
          <p>Finding the best purifiers for your air quality needs.</p>
        </div>
      )}
    </div>
  );
}
