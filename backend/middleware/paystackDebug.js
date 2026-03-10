// middlewares/paystackDebug.js
const paystackDebug = (req, res, next) => {
  console.log('Paystack Request:', {
    method: req.method,
    path: req.path,
    body: req.body,
    headers: req.headers
  });
  next();
};

// module.exports = paystackDebug;

export default paystackDebug;