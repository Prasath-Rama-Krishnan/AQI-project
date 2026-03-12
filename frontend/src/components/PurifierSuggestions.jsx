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
          const productSearch = await searchPurifierProducts(prominentPollutants, selectedState);
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
          <h4>🔍 Recommended Purifiers</h4>
          <div className="purifier-grid">
            {searchResults.products.map((product, index) => (
              <div key={`${product.id}-${index}`} className="purifier-card external-api">
                <div className="purifier-image">
                  <img
                    src={product.image}
                    alt={product.name}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="image-fallback">
                    <span>🛒</span>
                  </div>
                </div>
                <div className="purifier-info">
                  <h4>{product.name}</h4>
                  <p className="cost"><strong>{product.cost}</strong></p>
                  <p className="benefits">{product.benefits}</p>
                  {product.pollutant && (
                    <p className="pollutant-tag">Targets: {product.pollutant}</p>
                  )}
                  <a 
                    href={product.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="buy-button external"
                  >
                    View on {product.retailer} →
                  </a>
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
