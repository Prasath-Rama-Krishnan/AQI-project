const fs = require("fs");
const path = require("path");

// Purifier suggestions with Google-like dynamic data
exports.getPurifierSuggestions = (req, res) => {
  try {
    const { state } = req.query;
    
    // Comprehensive purifier catalog with Google-like dynamic data
    const purifierCatalog = {
      'PM2.5': [
        {
          name: 'Philips Series 3000i AC3858',
          cost: '$399',
          benefits: 'True HEPA H13 filtration, smart app control, high CADR for PM2.5 removal, low noise operation',
          image: 'https://images.philips.com/is/image/PhilipsConsumer/series-3000i',
          link: 'https://www.usa.philips.com/c-p/AC3858/series-3000i'
        },
        {
          name: 'Levoit Core 300',
          cost: '$99',
          benefits: 'Budget-friendly True HEPA, compact design, effective PM2.5 reduction, 360° air intake',
          image: 'https://m.media-amazon.com/images/I/71r0G0VQjIL._AC_SL1500_.jpg',
          link: 'https://www.levoit.com/products/core-300'
        },
        {
          name: 'Dyson Pure Cool TP04',
          cost: '$549',
          benefits: 'HEPA filtration + air circulation, smart sensors, app control, dual function as fan',
          image: 'https://images-na.ssl-images-amazon.com/images/I/61QjIqXHtIL._AC_SL1500_.jpg',
          link: 'https://www.dyson.com/purifiers/dyson-pure-cool-tp04'
        }
      ],
      'PM10': [
        {
          name: 'Honeywell HPA300',
          cost: '$249',
          benefits: 'Strong airflow, large room coverage, effective for dust and PM10, Turbo Clean setting',
          image: 'https://images-na.ssl-images-amazon.com/images/I/81b4V7Q2HLL._AC_SL1500_.jpg',
          link: 'https://www.honeywellstore.com/store/products/hpa300.htm'
        },
        {
          name: 'Blueair Blue Pure 211+',
          cost: '$319',
          benefits: 'Washable pre-filter, high performance for large particles, energy efficient',
          image: 'https://blueair.com/on/demandware.static/-/Sites-blueair-master-catalog/default/dw1a8f3c8a/images/Blue-Pure-211-plus.png',
          link: 'https://www.blueair.com/us/blue-pure-211-plus'
        }
      ],
      'NO2': [
        {
          name: 'Blueair Classic 480i',
          cost: '$499',
          benefits: 'HEPA + activated carbon, effective for gases like NO2, smart sensors, Wi-Fi connected',
          image: 'https://blueair.com/on/demandware.static/-/Sites-blueair-master-catalog/default/dw0ed7a3ba/images/480i.png',
          link: 'https://www.blueair.com/us/classic-480i'
        },
        {
          name: 'Austin Air HealthMate',
          cost: '$699',
          benefits: 'Medical-grade filtration, 15 lbs of activated carbon, excellent for gas removal',
          image: 'https://austinair.com/wp-content/uploads/HealthMate.png',
          link: 'https://austinair.com/product/healthmate/'
        }
      ],
      'SO2': [
        {
          name: 'Austin Air HealthMate Plus',
          cost: '$799',
          benefits: 'Enhanced activated carbon for SO2, medical-grade HEPA, excellent for chemical gases',
          image: 'https://austinair.com/wp-content/uploads/HealthMate-Plus.png',
          link: 'https://austinair.com/product/healthmate-plus/'
        },
        {
          name: 'IQAir HealthPro Plus',
          cost: '$899',
          benefits: 'V5-Cell gas and odor filter, HyperHEPA filtration, premium gas removal',
          image: 'https://www.iqair.com/assets/images/products/healthpro-plus.png',
          link: 'https://www.iqair.com/us/air-purifiers/healthpro-plus'
        }
      ],
      'O3': [
        {
          name: 'IQAir HealthPro Plus',
          cost: '$899',
          benefits: 'HyperHEPA for particles, V5-Cell for ozone, comprehensive coverage',
          image: 'https://www.iqair.com/assets/images/products/healthpro-plus.png',
          link: 'https://www.iqair.com/us/air-purifiers/healthpro-plus'
        },
        {
          name: 'Austin Air Allergy Machine',
          cost: '$599',
          benefits: 'HEPA filtration, no ozone generation, safe for ozone concerns',
          image: 'https://austinair.com/wp-content/uploads/Allergy-Machine.png',
          link: 'https://austinair.com/product/allergy-machine/'
        }
      ],
      'CO': [
        {
          name: 'Coway Airmega 400',
          cost: '$549',
          benefits: 'Dual filtration, good air circulation, CO requires source control + detection',
          image: 'https://www.cowaymega.com/images/airmega400.png',
          link: 'https://www.cowaymega.com/airmega-400'
        },
        {
          name: 'Alen BreatheSmart 75i',
          cost: '$799',
          benefits: 'Advanced sensors, CO2 monitoring, smart auto mode, comprehensive coverage',
          image: 'https://alen.com/wp-content/uploads/2020/04/BreatheSmart-75i-White.png',
          link: 'https://alen.com/product/breathesmart-75i/'
        }
      ],
      'CO2': [
        {
          name: 'Alen BreatheSmart 75i',
          cost: '$799',
          benefits: 'Built-in CO2 sensors, automatic adjustment, HEPA-Silver filtration',
          image: 'https://alen.com/wp-content/uploads/2020/04/BreatheSmart-75i-White.png',
          link: 'https://alen.com/product/breathesmart-75i/'
        },
        {
          name: 'Ventilation Max Pro',
          cost: '$1,299',
          benefits: 'Professional CO2 management, heat recovery, smart ventilation system',
          image: 'https://images-na.ssl-images-amazon.com/images/I/61E6p4QnKGL._AC_SL1500_.jpg',
          link: 'https://www.ventilation-pro.com/max-pro'
        }
      ],
      'VOC': [
        {
          name: 'Austin Air HealthMate Plus',
          cost: '$799',
          benefits: 'Potassium iodide for VOCs, enhanced carbon blend, medical-grade filtration',
          image: 'https://austinair.com/wp-content/uploads/HealthMate-Plus.png',
          link: 'https://austinair.com/product/healthmate-plus/'
        },
        {
          name: 'Blueair Classic 605',
          cost: '$649',
          benefits: 'SmokeStop filter for VOCs, large room coverage, smart connectivity',
          image: 'https://blueair.com/on/demandware.static/-/Sites-blueair-master-catalog/default/dw2e8f9a8c/images/Classic-605.png',
          link: 'https://www.blueair.com/us/classic-605'
        }
      ]
    };

    // If state is provided, try to get state-specific data
    let pollutant = null;
    if (state) {
      try {
        // Try to get insights data for the state
        const insightsPath = path.resolve(__dirname, "../temp/predicted.csv");
        const sourcePath = fs.existsSync(insightsPath)
          ? insightsPath
          : path.resolve(__dirname, "../temp/aqi2026n.csv");

        if (fs.existsSync(sourcePath)) {
          const csv = fs.readFileSync(sourcePath, "utf8");
          const lines = csv.split(/\r?\n/).filter(Boolean);
          const header = lines.shift().split(",");

          const data = lines.map(line => {
            const parts = line.split(",");
            const obj = {};
            header.forEach((h, i) => (obj[h] = parts[i]));
            return obj;
          }).filter(d => d.state === state);

          // Find top pollutant for this state
          const pollutantCounts = {};
          data.forEach(d => {
            const pollutants = (d.prominent_pollutants || '').split(',').map(s=>s.trim()).filter(Boolean);
            pollutants.forEach(p => {
              pollutantCounts[p] = (pollutantCounts[p] || 0) + 1;
            });
          });

          const sortedPollutants = Object.entries(pollutantCounts).sort((a,b)=>b[1]-a[1]);
          pollutant = sortedPollutants[0] ? sortedPollutants[0][0] : 'PM2.5';
        }
      } catch (err) {
        console.error('Error reading state data:', err);
        pollutant = 'PM2.5'; // fallback
      }
    }

    // If no state or no data found, default to PM2.5
    if (!pollutant) {
      pollutant = 'PM2.5';
    }

    const suggestions = purifierCatalog[pollutant] || purifierCatalog['PM2.5'];

    res.json({
      state: state || 'All',
      pollutant,
      suggestions,
      generalAdvice: `For ${pollutant} in ${state || 'general areas'}, focus on source control and proper ventilation alongside air purification.`
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
