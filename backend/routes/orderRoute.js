import express from 'express'
import {
  placeOrder,
  // placeOrderPaystack,
  // placeOrderFlutterwave,
  allOrders,
  userOrders,
  updateStatus,
  updatePaymentStatus, // Import new function
  // verifyPaystack,
  // verifyFlutterwave,
  deleteOrder
} from '../controllers/orderController.js'
import adminAuth  from '../middleware/adminAuth.js'
import authUser from '../middleware/auth.js'
import paystackDebug from '../middleware/paystackDebug.js'

const orderRouter = express.Router()

// Admin Features
orderRouter.post('/list', adminAuth, allOrders)
orderRouter.post('/status', adminAuth, updateStatus)
orderRouter.post('/payment-status', adminAuth, updatePaymentStatus) // Add this route
// orderRouter.post('/payment-status', updatePaymentStatus) // Add this route

// Payment Features
orderRouter.post('/place', authUser, placeOrder)
// orderRouter.post('/paystack', authUser, paystackDebug, placeOrderPaystack)
// orderRouter.post('/flutterwave', authUser, placeOrderFlutterwave)

// User Feature 
orderRouter.post('/userorders', authUser, userOrders)

// Verify payment
// orderRouter.post('/verifyPaystack', authUser, paystackDebug, verifyPaystack)
// orderRouter.post('/verifyPaystack', authUser, verifyPaystack)
// orderRouter.post('/verifyFlutterwave', authUser, verifyFlutterwave)

// Delete order
orderRouter.delete('/:orderId', authUser, deleteOrder)

export default orderRouter




























// import express from 'express'
// import {
//   placeOrder,
//   placeOrderPaystack,
//   placeOrderFlutterwave,
//   allOrders,
//   userOrders,
//   updateStatus,
//   updatePaymentStatus, // Import new function
//   verifyPaystack,
//   verifyFlutterwave,
//   deleteOrder
// } from '../controllers/orderController.js'
// import adminAuth  from '../middleware/adminAuth.js'
// import authUser from '../middleware/auth.js'

// const orderRouter = express.Router()

// // Admin Features
// orderRouter.post('/list', adminAuth, allOrders)
// orderRouter.post('/status', adminAuth, updateStatus)
// orderRouter.post('/payment-status', adminAuth, updatePaymentStatus) // Add this route
// // orderRouter.post('/payment-status', updatePaymentStatus) // Add this route

// // Payment Features
// orderRouter.post('/place', authUser, placeOrder)
// orderRouter.post('/paystack', authUser, placeOrderPaystack)
// orderRouter.post('/flutterwave', authUser, placeOrderFlutterwave)

// // User Feature 
// orderRouter.post('/userorders', authUser, userOrders)

// // Verify payment
// orderRouter.post('/verifyPaystack', authUser, verifyPaystack)
// orderRouter.post('/verifyFlutterwave', authUser, verifyFlutterwave)

// // Delete order
// orderRouter.delete('/:orderId', authUser, deleteOrder)

// export default orderRouter

















// import express from 'express'
// import {
//   placeOrder,
//   placeOrderPaystack,
//   placeOrderFlutterwave,
//   allOrders,
//   userOrders,
//   updateStatus,
//   verifyPaystack,
//   verifyFlutterwave,
//   deleteOrder
// } from '../controllers/orderController.js'
// import adminAuth  from '../middleware/adminAuth.js'
// import authUser from '../middleware/auth.js'

// const orderRouter = express.Router()

// // Admin Features
// orderRouter.post('/list', adminAuth, allOrders)
// orderRouter.post('/status', adminAuth, updateStatus)

// // Payment Features
// orderRouter.post('/place', authUser, placeOrder)
// orderRouter.post('/paystack', authUser, placeOrderPaystack)
// orderRouter.post('/flutterwave', authUser, placeOrderFlutterwave)

// // User Feature 
// orderRouter.post('/userorders', authUser, userOrders)

// // Verify payment
// orderRouter.post('/verifyPaystack', authUser, verifyPaystack)
// orderRouter.post('/verifyFlutterwave', authUser, verifyFlutterwave)

// // Delete order
// orderRouter.delete('/:orderId', authUser, deleteOrder)

// export default orderRouter
















// import express from 'express'
// import {
//   placeOrder,
//   placeOrderPaystack,
//   placeOrderFlutterwave,
//   allOrders,
//   userOrders,
//   updateStatus,
//   verifyPaystack,
//   verifyFlutterwave
// } from '../controllers/orderController.js'
// import adminAuth  from '../middleware/adminAuth.js'
// import authUser from '../middleware/auth.js'

// const orderRouter = express.Router()

// // Admin Features
// orderRouter.post('/list', adminAuth, allOrders)
// orderRouter.post('/status', adminAuth, updateStatus)

// // Payment Features
// orderRouter.post('/place', authUser, placeOrder)
// orderRouter.post('/paystack', authUser, placeOrderPaystack)
// orderRouter.post('/flutterwave', authUser, placeOrderFlutterwave)

// // User Feature 
// orderRouter.post('/userorders', authUser, userOrders)

// // Verify payment
// orderRouter.post('/verifyPaystack', authUser, verifyPaystack)
// orderRouter.post('/verifyFlutterwave', authUser, verifyFlutterwave)

// export default orderRouter




















// import express from 'express'
// import {placeOrder, placeOrderStripe, placeOrderRazorpay, allOrders, userOrders, updateStatus, verifyStripe, verifyRazorpay} from '../controllers/orderController.js'
// import adminAuth  from '../middleware/adminAuth.js'
// import authUser from '../middleware/auth.js'

// const orderRouter = express.Router()

// // Admin Features
// orderRouter.post('/list',adminAuth,allOrders)
// orderRouter.post('/status',adminAuth,updateStatus)

// // Payment Features
// orderRouter.post('/place',authUser,placeOrder)
// orderRouter.post('/stripe',authUser,placeOrderStripe)
// orderRouter.post('/razorpay',authUser,placeOrderRazorpay)

// // User Feature 
// orderRouter.post('/userorders',authUser,userOrders)

// // verify payment
// orderRouter.post('/verifyStripe',authUser, verifyStripe)
// orderRouter.post('/verifyRazorpay',authUser, verifyRazorpay)

// export default orderRouter