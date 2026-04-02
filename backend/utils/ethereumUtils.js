// Ethereum price conversion utility
// Uses CoinGecko API for real-time ETH/USD prices

let cachedEthPrice = null;
let lastPriceUpdate = null;
const CACHE_DURATION = 60 * 1000; // Cache for 1 minute

/**
 * Fetch current ETH/USD price from CoinGecko API
 * @returns {Promise<number>} Price of 1 ETH in USD
 */
export const fetchEthereumPrice = async () => {
  try {
    // Check if cached price is still valid
    const now = Date.now();
    if (
      cachedEthPrice !== null &&
      lastPriceUpdate &&
      now - lastPriceUpdate < CACHE_DURATION
    ) {
      return cachedEthPrice;
    }

    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd",
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    const price = data.ethereum.usd;

    // Update cache
    cachedEthPrice = price;
    lastPriceUpdate = now;

    return price;
  } catch (error) {
    console.error("Error fetching Ethereum price:", error);
    // Return cached price if available, otherwise throw
    if (cachedEthPrice !== null) {
      console.log("Returning cached ETH price due to API error");
      return cachedEthPrice;
    }
    throw new Error(
      "Unable to fetch Ethereum price and no cached price available",
    );
  }
};

/**
 * Convert Ethereum to USD
 * @param {number|string} ethAmount - Amount in Ethereum
 * @param {number} ethPrice - Current ETH/USD price
 * @returns {string} Amount in USD (as string for precision)
 */
export const convertEthToUsd = (ethAmount, ethPrice) => {
  const eth = parseFloat(ethAmount);
  const usd = eth * ethPrice;
  return usd.toFixed(2);
};

/**
 * Convert USD to Ethereum
 * @param {number|string} usdAmount - Amount in USD
 * @param {number} ethPrice - Current ETH/USD price
 * @returns {string} Amount in Ethereum (as string for precision)
 */
export const convertUsdToEth = (usdAmount, ethPrice) => {
  const usd = parseFloat(usdAmount);
  const eth = usd / ethPrice;
  return eth.toFixed(18); // ETH typically uses 18 decimal places
};

/**
 * Convert Ethereum to Wei (smallest unit)
 * @param {number|string} ethAmount - Amount in Ethereum
 * @returns {string} Amount in Wei
 */
export const convertEthToWei = (ethAmount) => {
  const eth = parseFloat(ethAmount);
  const wei = eth * 1e18;
  return wei.toFixed(0);
};

/**
 * Convert Wei to Ethereum
 * @param {number|string} weiAmount - Amount in Wei
 * @returns {string} Amount in Ethereum
 */
export const convertWeiToEth = (weiAmount) => {
  const wei = parseFloat(weiAmount);
  const eth = wei / 1e18;
  return eth.toFixed(18);
};

/**
 * Format price display (shows both ETH and USD)
 * @param {string} ethAmount - Amount in Ethereum
 * @param {number} ethPrice - Current ETH/USD price
 * @returns {object} Object with eth and usd formatted strings
 */
export const formatPrice = (ethAmount, ethPrice) => {
  const usd = convertEthToUsd(ethAmount, ethPrice);
  return {
    eth: parseFloat(ethAmount).toFixed(8),
    usd: parseFloat(usd).toFixed(2),
    combined: `${parseFloat(ethAmount).toFixed(8)} ETH ($${usd})`,
  };
};

/**
 * Get current ETH price
 * @returns {Promise<number>} ETH/USD price
 */
export const getCurrentEthPrice = async () => {
  return await fetchEthereumPrice();
};

export default {
  fetchEthereumPrice,
  convertEthToUsd,
  convertUsdToEth,
  convertEthToWei,
  convertWeiToEth,
  formatPrice,
  getCurrentEthPrice,
};
