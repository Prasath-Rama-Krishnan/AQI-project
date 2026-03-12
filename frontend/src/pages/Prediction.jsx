import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../services/api';
import './Prediction.css';

export default function Prediction() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadedData, setUploadedData] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage('');
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(API_ENDPOINTS.upload, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('File uploaded successfully! Processing predictions...');
        setUploadedData(data);
        
        // Navigate to dashboard after successful upload
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setMessage(data.error || 'Upload failed');
      }
    } catch (error) {
      setMessage('Error uploading file');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="prediction-page">
      <div className="upload-container">
        <div className="upload-header">
          <h1>📊 Historical Data Upload</h1>
          <p>Upload your AQI dataset for analysis and future predictions</p>
        </div>
        
        <div className="upload-steps">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Choose Dataset</h3>
              <p>Select CSV, XLSX, or XLS file containing AQI data</p>
            </div>
          </div>
          
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Upload & Process</h3>
              <p>System will analyze data and generate predictions</p>
            </div>
          </div>
          
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>View Dashboard</h3>
              <p>Access comprehensive analysis and insights</p>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleUpload} className="upload-form">
          <div className="file-input-wrapper">
            <div className="file-input-area">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="file-input"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="file-label">
                <div className="upload-icon">📁</div>
                <div className="upload-text">
                  <span className="upload-title">Click to upload or drag and drop</span>
                  <span className="upload-subtitle">CSV, XLSX, XLS (MAX. 10MB)</span>
                </div>
              </label>
            </div>
            
            {file && (
              <div className="file-selected">
                <div className="file-icon">📄</div>
                <div className="file-details">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{(file.size / 1024).toFixed(2)} KB</span>
                </div>
                <button 
                  type="button" 
                  className="remove-file"
                  onClick={() => setFile(null)}
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className="upload-button"
            disabled={uploading || !file}
          >
            {uploading ? (
              <>
                <span className="spinner"></span>
                Processing...
              </>
            ) : (
              <>
                <span className="upload-icon">🚀</span>
                Upload & Predict
              </>
            )}
          </button>
        </form>

        {message && (
          <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
            <span className="message-icon">
              {message.includes('success') ? '✓' : '⚠️'}
            </span>
            {message}
          </div>
        )}

        {uploadedData && (
          <div className="upload-success">
            <h3>🎉 Upload Successful!</h3>
            <p>Your data has been processed. Redirecting to dashboard...</p>
            <div className="success-animation">
              <div className="pulse"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
