# PowerBI Integration Guide - Using Past AQI Data

## 📊 How to Create a PowerBI Dashboard from Your AQI Prediction Data

### **Step 1: Export Data from Your Application**

#### **From Frontend Prediction Page:**
1. Upload your CSV dataset (date, state, area, aqi_value columns)
2. Click **"Predict"** button
3. Go to **"Results & Analysis"** tab
4. Click **"Download Predicted CSV"**
5. Save file as `aqi_predictions.csv`

#### **From Future Dashboard:**
1. Navigate to **"Future AQI Dashboard"**
2. Scroll to **"Reports & Predictions"** section
3. Click **"Download Predicted CSV"**
4. Save file as `aqi_future_predictions.csv`

#### **From Area Analysis:**
1. In **"Area-wise Avg AQI"** section
2. Click **"Download Area CSV"**
3. Save as `aqi_areas.csv`

---

### **Step 2: Prepare Data for PowerBI**

#### **CSV File Structure**
Your exported CSV should have these columns:
```
date,state,area,aqi_value,air_quality_status,prominent_pollutants
2024-01-01,Delhi,Central,250,Severe,PM2.5,PM10
2024-01-01,Delhi,North,180,Poor,NO2,PM2.5
2024-01-01,Mumbai,East,120,Moderate,PM10
...
```

#### **Data Cleaning in PowerBI**
1. Open PowerBI Desktop
2. **Get Data** → **Text/CSV**
3. Select your exported CSV file
4. In **Power Query Editor**:
   - Ensure **date** column is set to **Date** type
   - Ensure **aqi_value** is set to **Decimal Number**
   - Split **prominent_pollutants** if needed (or keep as text)
   - Remove any null rows
   - Click **Load**

---

### **Step 3: Create Relationships & Measures**

#### **Relationships** (if using multiple tables)
- Link **Predictions** table to **States** lookup table on State column
- Link **Predictions** table to **Areas** lookup table on Area column

#### **Calculated Measures**
```DAX
Average AQI = AVERAGE('AQI Data'[aqi_value])

Max AQI = MAX('AQI Data'[aqi_value])

Min AQI = MIN('AQI Data'[aqi_value])

Poor Days = CALCULATE(COUNTA('AQI Data'), 'AQI Data'[air_quality_status] IN {"Poor", "Severe"})

Good Days % = DIVIDE(CALCULATE(COUNTA('AQI Data'), 'AQI Data'[air_quality_status] = "Good"), COUNTA('AQI Data')) * 100

Days Count = COUNTA('AQI Data')
```

---

### **Step 4: Create Visualizations**

#### **1. KPI Cards**
- **Card 1**: Average AQI (Measure: Average AQI)
- **Card 2**: Maximum AQI (Measure: Max AQI)
- **Card 3**: Good Days % (Measure: Good Days %)
- **Card 4**: Total Days (Measure: Days Count)

#### **2. State Slicer**
- **Visualization**: Slicer
- **Field**: State
- **Type**: List (dropdown or buttons)
- **Allow single select** or **Multiple select**

#### **3. Month Slicer**
- **Visualization**: Slicer
- **Field**: Month (extract from date)
- **Type**: List or Timeline
- **Interact with other visuals** ✅

#### **4. Area-wise Bar Chart**
- **Visualization**: Clustered Bar Chart
- **Axis**: Area
- **Value**: Average AQI (use Average aggregation)
- **Sort**: Descending (highest AQI first)
- **Slicers**: State + Month

#### **5. State-wise Column Chart**
- **Visualization**: Clustered Column Chart
- **Axis**: State
- **Value**: Average AQI
- **Legend**: Air Quality Status (color-code by status)
- **Slicers**: Month

#### **6. Date Trend Line Chart**
- **Visualization**: Line Chart
- **Axis**: Date (continuous)
- **Values**: Average AQI
- **Legend**: State (give each state a line)
- **Slicers**: State, Month (when filtered by month, show only that month's trend)

#### **7. Air Quality Status Distribution (Pie Chart)**
- **Visualization**: Pie Chart
- **Legend**: Air Quality Status
- **Values**: Count of air_quality_status
- **Colors**: 
  - Good → Green
  - Moderate → Yellow
  - Poor → Orange
  - Severe → Red
  - Hazardous → Dark Red

#### **8. Top 10 Most Polluted Areas (Horizontal Bar)**
- **Visualization**: Horizontal Bar Chart
- **Axis**: Area
- **Value**: Average AQI
- **Top N Filter**: Top 10
- **Sort**: Descending
- **Slicers**: State, Month

#### **9. Bottom 10 Cleanest Areas (Horizontal Bar)**
- **Visualization**: Horizontal Bar Chart
- **Axis**: Area
- **Value**: Average AQI
- **Bottom N Filter**: Bottom 10
- **Sort**: Ascending

#### **10. Pollutant Frequency (Word Cloud or Column)**
- **Visualization**: Stacked Column Chart or Table
- **Axis**: Prominent Pollutants
- **Values**: Count
- **Shows which pollutants are most common**

#### **11. Map Visualization (Regional)**
- **Visualization**: Map (if you have lat/long for states)
- **Location**: State
- **Values**: Average AQI
- **Color Saturation**: High AQI = darker color

#### **12. Table: State Summary**
| State | Average AQI | Max AQI | Good Days % | Total Days | Top Pollutant |
|-------|-------------|---------|-------------|-----------|---------------|
| Delhi | 180 | 250 | 15% | 365 | PM2.5 |
| Mumbai | 140 | 200 | 30% | 365 | PM10 |

---

### **Step 5: Dashboard Layout**

#### **Page 1: Overview Dashboard**
```
┌─────────────────────────────────────────┐
│ AQI Analysis Dashboard                   │
├─────────────────────────────────────────┤
│  [State Slicer]   [Month Slicer]        │
├─────────────────────────────────────────┤
│ Avg AQI │ Max AQI │ Good Days% │ Days   │
│  170    │   250   │    25%     │  365   │
├─────────────────────────────────────────┤
│ Area-wise Bar Chart  │ Status Distribution │
│ (Top 10 areas)      │ (Pie chart)         │
└─────────────────────────────────────────┘
```

#### **Page 2: Trend Analysis**
```
┌─────────────────────────────────────────┐
│ Trends & Patterns                        │
├─────────────────────────────────────────┤
│ [State Slicer]  [Month Slicer]          │
├─────────────────────────────────────────┤
│ Date Trend Line Chart (full width)      │
│ (Shows AQI over time for selected state)│
├─────────────────────────────────────────┤
│ State Comparison │ Pollutant Frequency  │
│ (Column chart)   │ (Bar chart)          │
└─────────────────────────────────────────┘
```

#### **Page 3: State Summary**
```
┌─────────────────────────────────────────┐
│ State-wise Details                       │
├─────────────────────────────────────────┤
│ [State Slicer]                           │
├─────────────────────────────────────────┤
│ State Summary Table (scrollable)         │
│ Columns: State, Avg AQI, Max AQI,      │
│          Good Days%, Top Pollutant      │
└─────────────────────────────────────────┘
```

---

### **Step 6: Formatting & Colors**

#### **Color Scheme (Air Quality Status)**
```
Good        → #2ecc71 (Green)
Moderate    → #f39c12 (Orange-Yellow)
Poor        → #e74c3c (Red-Orange)
Severe      → #c0392b (Dark Red)
Hazardous   → #000000 (Black)
```

#### **AQI Value Conditional Formatting (Heat Map)**
```
0-50    → Light Green
51-100  → Green-Yellow
101-150 → Yellow-Orange
151-200 → Orange-Red
201-300 → Red
300+    → Dark Red
```

#### **Theme**
- **Background**: Light gray or white
- **Font**: Segoe UI or similar
- **Accent Color**: Cyan/Teal (to match your web app)

---

### **Step 7: Interactive Features**

#### **Cross-filter Behavior**
- When user selects a **State** in the slicer → All visuals update
- When user selects a **Month** in the slicer → All visuals update
- When user clicks on a bar in the **Area chart** → Trend line updates
- When user clicks on a **Status** in the pie chart → Table filters to that status

#### **Drill-down (Optional)**
- Dashboard level 1: National overview (all states)
- Dashboard level 2: State-selected view (one state, all areas)
- Dashboard level 3: Area-selected view (details for one area)

---

### **Step 8: Publish & Share**

1. **Save** your PowerBI report as `.pbix`
2. **Publish** to PowerBI Service (cloud):
   - Sign in to PowerBI.com
   - Click **Publish** in PowerBI Desktop
   - Select workspace
   - Create scheduled refresh for your CSV data (if updating regularly)
3. **Share** dashboard link with stakeholders
4. **Set Row-Level Security** if needed (different states for different users)

---

### **Step 9: Refresh Data**

#### **Option A: Manual Refresh**
1. Download new CSV from your app
2. Replace the file in PowerBI
3. Click **Refresh** in PowerBI Desktop
4. Publish again

#### **Option B: Automated Refresh (PowerBI Premium)**
1. Upload your CSV to **OneDrive** or **SharePoint**
2. In PowerBI Service → **Settings** → **Scheduled refresh**
3. Set refresh frequency (daily, hourly, etc.)

---

## 🎯 PowerBI Dashboard Features Summary

| Feature | Type | Description |
|---------|------|-------------|
| Average AQI | KPI Card | Real-time average calculation |
| Max AQI | KPI Card | Maximum value from dataset |
| Good Days % | KPI Card | Percentage of days with Good status |
| State Filter | Slicer | Dropdown to filter by state |
| Month Filter | Slicer | Timeline/dropdown to filter by month |
| Area-wise Chart | Bar Chart | Top/bottom areas ranked by AQI |
| Trend Line | Line Chart | AQI changes over time |
| Status Distribution | Pie Chart | % of Good/Moderate/Poor/Severe days |
| State Comparison | Column Chart | Average AQI per state |
| Pollutant Frequency | Bar Chart | Most common pollutants detected |
| Summary Table | Table | State-level statistics |

---

## 📈 Sample Dashboard Metrics

Once you have the dashboard, you can track:
- **Overall average AQI trend** (improving/worsening)
- **State-wise performance** (which states have best/worst air quality)
- **Area-wise hotspots** (where to focus pollution control)
- **Seasonal patterns** (which months have worst air quality)
- **Pollutant trends** (which pollutants are increasing)
- **Forecast accuracy** (compare predictions to actual if real-time data available)

---

## 🎓 Educational Value for Your PPT

### **What to Highlight:**
1. **Data Analysis**: From raw CSV to insights
2. **Visualization**: Multiple chart types for different perspectives
3. **Interactivity**: Slicers and cross-filtering for exploration
4. **Scalability**: Easy to add more data sources
5. **Business Intelligence**: Turn data into actionable insights
6. **Integration**: Web app → Data export → PowerBI dashboard

### **Show in Your Presentation:**
- Screenshot of PowerBI dashboard
- Sample metrics and insights
- How stakeholders use the dashboard
- Decision-making based on visualizations

