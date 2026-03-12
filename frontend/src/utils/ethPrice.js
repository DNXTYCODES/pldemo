/**
 * ETH Price Utility
 * Handles fetching current ETH price and converting between ETH and USD
 */

const ETH_PRICE_API = "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd";
const FALLBACK_ETH_PRICE = 3000; // Fallback price in USD

/**
 * Fetch current ETH price in USD
 * @returns {Promise<number>} Current ETH price in USD or fallback price
 */
export const fetchCurrentEthPrice = async () => {
  try {
    const response = await fetch(ETH_PRICE_API);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (data.ethereum && data.ethereum.usd) {
      return data.ethereum.usd;
    }
    return FALLBACK_ETH_PRICE;
  } catch (err) {
    console.error("Error fetching ETH price:", err);
    return FALLBACK_ETH_PRICE;
  }
};

/**
 * Convert ETH amount to USD
 * @param {string|number} ethAmount - Amount in ETH
 * @param {number} ethPrice - Current ETH price in USD
 * @returns {string} Formatted USD amount with 2 decimal places
 */
export const convertEthToUsd = (ethAmount, ethPrice) => {
  if (!ethAmount || !ethPrice) return "0.00";
  try {
    const usdAmount = (parseFloat(ethAmount) * ethPrice).toFixed(2);
    return usdAmount;
  } catch (err) {
    console.error("Error converting ETH to USD:", err);
    return "0.00";
  }
};

/**
 * Convert USD amount to ETH
 * @param {string|number} usdAmount - Amount in USD
 * @param {number} ethPrice - Current ETH price in USD
 * @returns {string} Formatted ETH amount with 8 decimal places
 */
export const convertUsdToEth = (usdAmount, ethPrice) => {
  if (!usdAmount || !ethPrice) return "0.00000000";
  try {
    const ethAmount = (parseFloat(usdAmount) / ethPrice).toFixed(8);
    return ethAmount;
  } catch (err) {
    console.error("Error converting USD to ETH:", err);
    return "0.00000000";
  }
};

/**
 * Format ETH amount with proper decimal places
 * @param {string|number} ethAmount - Amount in ETH
 * @param {number} decimals - Number of decimal places (default: 4)
 * @returns {string} Formatted ETH amount
 */
export const formatEth = (ethAmount, decimals = 4) => {
  if (!ethAmount) return "0.0000";
  try {
    return parseFloat(ethAmount).toFixed(decimals);
  } catch (err) {
    console.error("Error formatting ETH:", err);
    return "0.0000";
  }
};

/**
 * Format USD amount with proper decimal places
 * @param {string|number} usdAmount - Amount in USD
 * @returns {string} Formatted USD amount
 */
export const formatUsd = (usdAmount) => {
  if (!usdAmount) return "0.00";
  try {
    return parseFloat(usdAmount).toFixed(2);
  } catch (err) {
    console.error("Error formatting USD:", err);
    return "0.00";
  }
};

/**
 * Get formatted price based on currency preference
 * @param {string|number} ethAmount - Price in ETH
 * @param {number} ethPrice - Current ETH price
 * @param {string} currency - Currency preference ('eth' or 'usd')
 * @returns {string} Formatted price with currency symbol
 */
export const getFormattedPrice = (ethAmount, ethPrice, currency = "eth") => {
  if (currency === "usd") {
    const usd = convertEthToUsd(ethAmount, ethPrice);
    return `$${formatUsd(usd)}`;
  }
  return `${formatEth(ethAmount)} ETH`;
};
