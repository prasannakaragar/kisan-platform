/**
 * Smart Irrigation Recommendation Route
 * POST /api/irrigation/predict
 *
 * Calculates recommended irrigation time based on:
 *  - Crop type (base water requirement in minutes)
 *  - Soil type (absorption factor)
 *  - Temperature (weather factor)
 *  - Rain prediction (skip irrigation if rain expected)
 */

const express = require('express');
const router  = express.Router();

// ─── Data Tables ────────────────────────────────────────────────────────────

/**
 * Base water requirement (minutes per irrigation session).
 * Sources: ICAR / Indian agronomy guidelines.
 */
const CROP_BASE_WATER = {
  rice:       30,
  wheat:      20,
  maize:      25,
  cotton:     35,
  sugarcane:  45,
  soybean:    22,
  groundnut:  18,
  mustard:    15,
  sorghum:    20,
  barley:     17,
  millet:     14,
  sunflower:  19,
  tomato:     25,
  potato:     28,
  onion:      22,
  chickpea:   16,
  lentil:     14,
  pigeonpea:  20,
  jute:       30,
  tobacco:    24,
};

/**
 * Soil moisture-retention factor.
 * Sandy soil drains fast (needs more water),
 * clay retains well (needs less).
 */
const SOIL_FACTOR = {
  sandy:      1.3,
  loamy:      1.0,
  clay:       0.8,
  silt:       0.95,
  peat:       0.7,
  chalky:     1.1,
  black:      0.85,
  red:        1.15,
  laterite:   1.2,
  alluvial:   0.9,
};

/**
 * Derive a weather factor from temperature.
 * Higher temps mean faster evapotranspiration → more water needed.
 *
 * @param {number} temperature - Celsius
 * @returns {number} factor
 */
function getWeatherFactor(temperature) {
  if (temperature > 35) return 1.3;
  if (temperature > 25) return 1.1;
  return 0.9;
}

/**
 * Validate incoming request body.
 * Returns an error string if invalid, or null if valid.
 *
 * @param {{ cropType, soilType, temperature, rainPrediction }} body
 * @returns {string|null}
 */
function validateInput({ cropType, soilType, temperature, rainPrediction }) {
  if (!cropType  || !CROP_BASE_WATER[cropType.toLowerCase()])
    return `Invalid crop type: "${cropType}". Supported: ${Object.keys(CROP_BASE_WATER).join(', ')}.`;

  if (!soilType  || !SOIL_FACTOR[soilType.toLowerCase()])
    return `Invalid soil type: "${soilType}". Supported: ${Object.keys(SOIL_FACTOR).join(', ')}.`;

  const temp = Number(temperature);
  if (isNaN(temp) || temperature === '' || temperature === null || temperature === undefined)
    return 'Temperature must be a valid number.';
  if (temp < -10 || temp > 60)
    return 'Temperature must be between -10°C and 60°C.';

  const rain = String(rainPrediction).toLowerCase();
  if (rain !== 'yes' && rain !== 'no')
    return 'Rain prediction must be "yes" or "no".';

  return null;
}

// ─── Route ───────────────────────────────────────────────────────────────────

/**
 * POST /api/irrigation/predict
 * Body: { cropType, soilType, temperature, rainPrediction }
 * Returns: { irrigationTime, details }
 */
router.post('/predict', (req, res) => {
  const { cropType, soilType, temperature, rainPrediction } = req.body;

  // Validate
  const validationError = validateInput({ cropType, soilType, temperature, rainPrediction });
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const crop  = cropType.toLowerCase();
  const soil  = soilType.toLowerCase();
  const temp  = Number(temperature);
  const rain  = String(rainPrediction).toLowerCase();

  // If rain is predicted, skip irrigation entirely
  if (rain === 'yes') {
    return res.json({
      irrigationTime: null,
      message:        'No irrigation needed today',
      details: {
        cropType:      crop,
        soilType:      soil,
        temperature:   temp,
        rainPredicted: true,
        reason:        'Rain is expected — natural precipitation will provide sufficient moisture.',
      },
    });
  }

  // Calculate irrigation time
  const baseCropWater = CROP_BASE_WATER[crop];
  const soilFactor    = SOIL_FACTOR[soil];
  const weatherFactor = getWeatherFactor(temp);
  const irrigationTime = Math.round(baseCropWater * soilFactor * weatherFactor);

  return res.json({
    irrigationTime: `${irrigationTime} minutes`,
    message:        `Recommended irrigation time: ${irrigationTime} minutes`,
    details: {
      cropType:      crop,
      soilType:      soil,
      temperature:   temp,
      rainPredicted: false,
      baseCropWater,
      soilFactor,
      weatherFactor,
      formula:       `${baseCropWater} × ${soilFactor} (soil) × ${weatherFactor} (weather) = ${irrigationTime} min`,
    },
  });
});

/**
 * GET /api/irrigation/options
 * Returns all supported crops and soil types for the frontend dropdowns.
 */
router.get('/options', (req, res) => {
  res.json({
    crops: Object.keys(CROP_BASE_WATER).map(key => ({
      value: key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      baseWater: CROP_BASE_WATER[key],
    })),
    soilTypes: Object.keys(SOIL_FACTOR).map(key => ({
      value: key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      factor: SOIL_FACTOR[key],
    })),
  });
});

module.exports = router;
