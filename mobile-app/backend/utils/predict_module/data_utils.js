/**
 * Utility functions for processing sensor data
 */

/**
 * Normalize input values from sensors to a standard range
 * @param {object} values - Raw sensor values
 * @param {number} minRange - Minimum range for normalization
 * @param {number} maxRange - Maximum range for normalization
 * @returns {object} Normalized values
 */
function normalizeValues(values, minRange, maxRange) {
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    if (min === max) {
        return values.map(() => minRange);
    }
    
    return values.map(value => {
        const normalized = (value - min) / (max - min);
        return normalized * (maxRange - minRange) + minRange;
    });
}

/**
 * Normalize a single value to range 0-1
 * @param {number} value 
 * @param {number} min 
 * @param {number} max 
 * @returns {number} 
 */
function normalizeValue(value, min, max) {
    value = Math.max(min, Math.min(max, value));
    return (value - min) / (max - min);
}

module.exports = {
    normalizeValues
}; 