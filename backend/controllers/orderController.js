import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import { default as Paystack } from '@paystack/paystack-sdk';
import Flutterwave from 'flutterwave-node-v3';
import axios from 'axios';

// Initialize payment gateways
const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY);
const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY
);

// Helper function to create order
const createOrder = async (userId, items, amount, address, paymentMethod, currency = 'EUR') => {
  const orderData = {
    userId,
    items,
    address,
    amount,
    currency,
    paymentMethod,
    payment: paymentMethod === 'COD' ? false : undefined,
    date: Date.now(),
    status: 'Order Received'
  };
  
  const newOrder = new orderModel(orderData);
  await newOrder.save();
  return newOrder;
};

// Helper function to get NGN exchange rate
const getExchangeRate = async () => {
  try {
    return 1600; // Fallback rate: 1 EUR = 1600 NGN
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    return 1600; // Default fallback for Nigerian Naira
  }
};

// Placing orders using COD Method
const placeOrder = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;

    const newOrder = await createOrder(
      userId,
      items,
      amount,
      address,
      "COD"
    );

    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    res.json({ success: true, message: "Order Placed" });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Paystack Payment - UPDATED FOR NIGERIAN ACCOUNTS
const placeOrderPaystack = async (req, res) => {
  let newOrder;
  try {
    const { userId, items, amount, address } = req.body;
    const { origin } = req.headers;

    // Validate amount
    if (isNaN(amount) || amount <= 0) {
      throw new Error('Invalid order amount');
    }

    // Create order first
    newOrder = await createOrder(
      userId,
      items,
      amount,
      address,
      "Paystack"
    );

    // Convert EUR to NGN for Nigerian Paystack accounts
    const exchangeRate = await getExchangeRate();
    const nairaAmount = Math.round(amount * exchangeRate); // Convert to Naira
    const koboAmount = nairaAmount * 100; // Convert to kobo (1 NGN = 100 kobo)
    
    // Create payment payload
    const payload = {
      email: address.email,
      amount: koboAmount,
      currency: 'NGN', // Nigerian Naira
      callback_url: `${origin}/verify?orderId=${newOrder._id}&gateway=paystack`,
      metadata: {
        order_id: newOrder._id.toString(),
        user_id: userId
      }
    };

    // Initialize transaction
    const response = await paystack.transaction.initialize(payload);
    
    // Check if response is valid
    if (!response.status || !response.data?.authorization_url) {
      const errorMsg = response.message || 'Paystack service error';
      console.error('Paystack API error:', {
        status: response.status,
        message: response.message,
        data: response.data
      });
      throw new Error(errorMsg);
    }

    res.json({ 
      success: true, 
      authorization_url: response.data.authorization_url 
    });

  } catch (error) {
    console.error('Paystack order error:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    
    // Attempt to delete the order if creation failed
    if (newOrder) {
      try {
        await orderModel.findByIdAndDelete(newOrder._id);
      } catch (deleteError) {
        console.error('Failed to delete order:', deleteError.message);
      }
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to initialize payment'
    });
  }
};

// Verify Paystack - FIXED WITH DIRECT API CALL
const verifyPaystack = async (req, res) => {
  const { reference, orderId } = req.body;

  try {
    console.log('Verifying Paystack payment:', { reference, orderId });
    
    // Validate reference exists and is a non-empty string
    if (!reference || typeof reference !== 'string' || reference.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid payment reference' 
      });
    }

    if (!orderId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing order ID' 
      });
    }

    // Trim and clean the reference
    const cleanedReference = reference.trim();
    
    // Use direct API call to verify transaction
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(cleanedReference)}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

    const responseData = response.data;
    
    // Check if verification was successful
    if (responseData.status !== true || !responseData.data) {
      console.error('Paystack verification failed:', responseData);
      throw new Error(responseData.message || 'Payment verification failed');
    }
    
    const transaction = responseData.data;
    
    if (transaction.status === 'success') {
      const updatedOrder = await orderModel.findByIdAndUpdate(
        orderId, 
        { 
          payment: true,
          status: 'Order Received'
        },
        { new: true }
      );
      
      // Clear user's cart
      if (updatedOrder && updatedOrder.userId) {
        await userModel.findByIdAndUpdate(updatedOrder.userId, { cartData: {} });
      }
      
      res.json({ 
        success: true, 
        message: "Payment Successful",
        order: updatedOrder
      });
    } else {
      // Delete order if payment failed
      await orderModel.findByIdAndDelete(orderId);
      res.json({ 
        success: false, 
        message: `Payment Failed: ${transaction.gateway_response || 'Unknown error'}` 
      });
    }
  } catch (error) {
    console.error('Paystack verification error:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    
    let errorMessage = error.message || 'Payment verification error';
    
    // Extract more detailed error from response if available
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    
    // Attempt to delete order on verification failure
    if (orderId) {
      try {
        await orderModel.findByIdAndDelete(orderId);
      } catch (deleteError) {
        console.error('Failed to delete order:', deleteError.message);
      }
    }
    
    res.status(500).json({ 
      success: false, 
      message: errorMessage 
    });
  }
};

// Flutterwave Payment
const placeOrderFlutterwave = async (req, res) => {
  let newOrder;
  try {
    const { userId, items, amount, address } = req.body;
    const { origin } = req.headers;

    const newOrder = await createOrder(
      userId,
      items,
      amount,
      address,
      "Flutterwave"
    );

    const payload = {
      tx_ref: newOrder._id.toString(),
      amount: amount,
      currency: 'EUR', // Flutterwave supports EUR
      redirect_url: `${origin}/verify?orderId=${newOrder._id}&gateway=flutterwave`,
      customer: {
        email: address.email,
        phonenumber: address.phone,
        name: `${address.firstName} ${address.lastName}`
      },
      customizations: {
        title: "Order Payment",
        description: "Payment for items in cart"
      },
      meta: {
        user_id: userId
      }
    };

    const response = await flw.PaymentLink.create(payload);
    
    // Check Flutterwave response
    if (response.status !== 'success' || !response.data.link) {
      throw new Error(response.message || 'Failed to create payment link');
    }
    
    res.json({ success: true, link: response.data.link });

  } catch (error) {
    console.log('Flutterwave order error:', error);
    
    // Attempt to delete order on failure
    if (newOrder) {
      try {
        await orderModel.findByIdAndDelete(newOrder._id);
      } catch (deleteError) {
        console.error('Failed to delete order:', deleteError);
      }
    }
    
    res.json({ success: false, message: error.message });
  }
};

// Verify Flutterwave
const verifyFlutterwave = async (req, res) => {
  const { transaction_id, orderId } = req.body;

  try {
    console.log('Verifying Flutterwave payment:', { transaction_id, orderId });
    
    if (!transaction_id || !orderId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing transaction_id or orderId' 
      });
    }

    const response = await flw.Transaction.verify({ id: transaction_id });
    
    if (response.data.status === 'successful') {
      const updatedOrder = await orderModel.findByIdAndUpdate(
        orderId, 
        { 
          payment: true,
          status: 'Order Received'
        },
        { new: true }
      );
      
      // Get user ID from order to clear cart
      if (updatedOrder && updatedOrder.userId) {
        await userModel.findByIdAndUpdate(updatedOrder.userId, { cartData: {} });
      }
      
      res.json({ 
        success: true, 
        message: "Payment Successful",
        order: updatedOrder
      });
    } else {
      // Delete order if payment failed
      await orderModel.findByIdAndDelete(orderId);
      res.json({ 
        success: false, 
        message: `Payment Failed: ${response.data.processor_response || 'Unknown error'}` 
      });
    }
  } catch (error) {
    console.log('Flutterwave verification error:', error);
    
    // Attempt to delete order on verification failure
    try {
      await orderModel.findByIdAndDelete(orderId);
    } catch (deleteError) {
      console.error('Failed to delete order:', deleteError);
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Payment verification error' 
    });
  }
};

// All Orders data for Admin Panel
const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({})
      .populate('userId', 'name email')
      .sort({ date: -1 });
    
    res.json({ success: true, orders });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// User Order Data For Frontend
const userOrders = async (req, res) => {
  try {
    const { userId } = req.body;
    const orders = await orderModel.find({ userId }).sort({ date: -1 });
    res.json({ success: true, orders });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Update order status from Admin Panel
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    
    if (!orderId || !status) {
      return res.status(400).json({
        success: false,
        message: 'Missing orderId or status'
      });
    }
    
    // Validate status
    const validStatuses = [
      'Order Received',
      'Preparing',
      'Ready for Pickup',
      'Out for Delivery',
      'Delivered',
      'Cancelled'
    ];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }
    
    await orderModel.findByIdAndUpdate(orderId, { status });
    res.json({ success: true, message: 'Status Updated' });

  } catch (error) {
    console.log(error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Update payment status
const updatePaymentStatus = async (req, res) => {
  try {
    const { orderId, payment } = req.body;
    
    if (!orderId || payment === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing orderId or payment status'
      });
    }
    
    await orderModel.findByIdAndUpdate(orderId, { payment });
    res.json({ success: true, message: 'Payment status updated' });

  } catch (error) {
    console.log(error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Delete pending order (for failed payments)
const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Missing order ID'
      });
    }
    
    const order = await orderModel.findByIdAndDelete(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.json({ success: true, message: 'Order deleted' });
    
  } catch (error) {
    console.log(error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export {
  placeOrder,
  placeOrderPaystack,
  placeOrderFlutterwave,
  verifyPaystack,
  verifyFlutterwave,
  allOrders,
  userOrders,
  updateStatus,
  updatePaymentStatus,
  deleteOrder
};

























// import orderModel from "../models/orderModel.js";
// import userModel from "../models/userModel.js";
// import { default as Paystack } from '@paystack/paystack-sdk';
// import Flutterwave from 'flutterwave-node-v3';
// import axios from 'axios';

// // Initialize payment gateways
// const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY);
// const flw = new Flutterwave(
//   process.env.FLW_PUBLIC_KEY,
//   process.env.FLW_SECRET_KEY
// );

// // Helper function to create order
// const createOrder = async (userId, items, amount, address, paymentMethod, currency = 'EUR') => {
//   const orderData = {
//     userId,
//     items,
//     address,
//     amount,
//     currency,
//     paymentMethod,
//     payment: paymentMethod === 'COD' ? false : undefined,
//     date: Date.now(),
//     status: 'Order Received'
//   };
  
//   const newOrder = new orderModel(orderData);
//   await newOrder.save();
//   return newOrder;
// };

// // Helper function to get NGN exchange rate
// const getExchangeRate = async () => {
//   try {
//     return 1600; // Fallback rate: 1 EUR = 1600 NGN
//   } catch (error) {
//     console.error("Error fetching exchange rate:", error);
//     return 1600; // Default fallback for Nigerian Naira
//   }
// };

// // Placing orders using COD Method
// const placeOrder = async (req, res) => {
//   try {
//     const { userId, items, amount, address } = req.body;

//     const newOrder = await createOrder(
//       userId,
//       items,
//       amount,
//       address,
//       "COD"
//     );

//     await userModel.findByIdAndUpdate(userId, { cartData: {} });

//     res.json({ success: true, message: "Order Placed" });

//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// // Paystack Payment - UPDATED FOR NIGERIAN ACCOUNTS
// const placeOrderPaystack = async (req, res) => {
//   let newOrder;
//   try {
//     const { userId, items, amount, address } = req.body;
//     const { origin } = req.headers;

//     // Validate amount
//     if (isNaN(amount) || amount <= 0) {
//       throw new Error('Invalid order amount');
//     }

//     // Create order first
//     newOrder = await createOrder(
//       userId,
//       items,
//       amount,
//       address,
//       "Paystack"
//     );

//     // Convert EUR to NGN for Nigerian Paystack accounts
//     const exchangeRate = await getExchangeRate();
//     const nairaAmount = Math.round(amount * exchangeRate); // Convert to Naira
//     const koboAmount = nairaAmount * 100; // Convert to kobo (1 NGN = 100 kobo)
    
//     // Create payment payload
//     const payload = {
//       email: address.email,
//       amount: koboAmount,
//       currency: 'NGN', // Nigerian Naira
//       callback_url: `${origin}/verify?orderId=${newOrder._id}&gateway=paystack`,
//       metadata: {
//         order_id: newOrder._id.toString(),
//         user_id: userId
//       }
//     };

//     // Initialize transaction
//     const response = await paystack.transaction.initialize(payload);
    
//     // Check if response is valid
//     if (!response.status || !response.data?.authorization_url) {
//       const errorMsg = response.message || 'Paystack service error';
//       console.error('Paystack API error:', {
//         status: response.status,
//         message: response.message,
//         data: response.data
//       });
//       throw new Error(errorMsg);
//     }

//     res.json({ 
//       success: true, 
//       authorization_url: response.data.authorization_url 
//     });

//   } catch (error) {
//     console.error('Paystack order error:', {
//       message: error.message,
//       stack: error.stack,
//       response: error.response?.data
//     });
    
//     // Attempt to delete the order if creation failed
//     if (newOrder) {
//       try {
//         await orderModel.findByIdAndDelete(newOrder._id);
//       } catch (deleteError) {
//         console.error('Failed to delete order:', deleteError.message);
//       }
//     }
    
//     res.status(500).json({ 
//       success: false, 
//       message: error.message || 'Failed to initialize payment'
//     });
//   }
// };

// // Verify Paystack - FIXED
// const verifyPaystack = async (req, res) => {
//   const { reference, orderId } = req.body;

//   try {
//     console.log('Verifying Paystack payment:', { reference, orderId });
    
//     if (!reference || !orderId) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Missing reference or orderId' 
//       });
//     }

//     // Correct Paystack SDK usage
//     const response = await paystack.transaction.verify(reference);
    
//     // Check if verification was successful
//     if (!response.status || !response.data) {
//       console.error('Paystack verification failed:', {
//         status: response.status,
//         message: response.message,
//         data: response.data
//       });
//       throw new Error(response.message || 'Payment verification failed');
//     }
    
//     const transaction = response.data;
    
//     if (transaction.status === 'success') {
//       const updatedOrder = await orderModel.findByIdAndUpdate(
//         orderId, 
//         { 
//           payment: true,
//           status: 'Order Received'
//         },
//         { new: true }
//       );
      
//       // Get user ID from order to clear cart
//       if (updatedOrder && updatedOrder.userId) {
//         await userModel.findByIdAndUpdate(updatedOrder.userId, { cartData: {} });
//       }
      
//       res.json({ 
//         success: true, 
//         message: "Payment Successful",
//         order: updatedOrder
//       });
//     } else {
//       // Delete order if payment failed
//       await orderModel.findByIdAndDelete(orderId);
//       res.json({ 
//         success: false, 
//         message: `Payment Failed: ${transaction.gateway_response}` 
//       });
//     }
//   } catch (error) {
//     console.error('Paystack verification error:', {
//       message: error.message,
//       stack: error.stack,
//       response: error.response?.data
//     });
    
//     // Attempt to delete order on verification failure
//     if (orderId) {
//       try {
//         await orderModel.findByIdAndDelete(orderId);
//       } catch (deleteError) {
//         console.error('Failed to delete order:', deleteError.message);
//       }
//     }
    
//     res.status(500).json({ 
//       success: false, 
//       message: error.message || 'Payment verification error' 
//     });
//   }
// };

// // Flutterwave Payment
// const placeOrderFlutterwave = async (req, res) => {
//   let newOrder;
//   try {
//     const { userId, items, amount, address } = req.body;
//     const { origin } = req.headers;

//     const newOrder = await createOrder(
//       userId,
//       items,
//       amount,
//       address,
//       "Flutterwave"
//     );

//     const payload = {
//       tx_ref: newOrder._id.toString(),
//       amount: amount,
//       currency: 'EUR', // Flutterwave supports EUR
//       redirect_url: `${origin}/verify?orderId=${newOrder._id}&gateway=flutterwave`,
//       customer: {
//         email: address.email,
//         phonenumber: address.phone,
//         name: `${address.firstName} ${address.lastName}`
//       },
//       customizations: {
//         title: "Order Payment",
//         description: "Payment for items in cart"
//       },
//       meta: {
//         user_id: userId
//       }
//     };

//     const response = await flw.PaymentLink.create(payload);
    
//     // Check Flutterwave response
//     if (response.status !== 'success' || !response.data.link) {
//       throw new Error(response.message || 'Failed to create payment link');
//     }
    
//     res.json({ success: true, link: response.data.link });

//   } catch (error) {
//     console.log('Flutterwave order error:', error);
    
//     // Attempt to delete order on failure
//     if (newOrder) {
//       try {
//         await orderModel.findByIdAndDelete(newOrder._id);
//       } catch (deleteError) {
//         console.error('Failed to delete order:', deleteError);
//       }
//     }
    
//     res.json({ success: false, message: error.message });
//   }
// };

// // Verify Flutterwave
// const verifyFlutterwave = async (req, res) => {
//   const { transaction_id, orderId } = req.body;

//   try {
//     console.log('Verifying Flutterwave payment:', { transaction_id, orderId });
    
//     if (!transaction_id || !orderId) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Missing transaction_id or orderId' 
//       });
//     }

//     const response = await flw.Transaction.verify({ id: transaction_id });
    
//     if (response.data.status === 'successful') {
//       const updatedOrder = await orderModel.findByIdAndUpdate(
//         orderId, 
//         { 
//           payment: true,
//           status: 'Order Received'
//         },
//         { new: true }
//       );
      
//       // Get user ID from order to clear cart
//       if (updatedOrder && updatedOrder.userId) {
//         await userModel.findByIdAndUpdate(updatedOrder.userId, { cartData: {} });
//       }
      
//       res.json({ 
//         success: true, 
//         message: "Payment Successful",
//         order: updatedOrder
//       });
//     } else {
//       // Delete order if payment failed
//       await orderModel.findByIdAndDelete(orderId);
//       res.json({ 
//         success: false, 
//         message: `Payment Failed: ${response.data.processor_response || 'Unknown error'}` 
//       });
//     }
//   } catch (error) {
//     console.log('Flutterwave verification error:', error);
    
//     // Attempt to delete order on verification failure
//     try {
//       await orderModel.findByIdAndDelete(orderId);
//     } catch (deleteError) {
//       console.error('Failed to delete order:', deleteError);
//     }
    
//     res.status(500).json({ 
//       success: false, 
//       message: error.message || 'Payment verification error' 
//     });
//   }
// };

// // All Orders data for Admin Panel
// const allOrders = async (req, res) => {
//   try {
//     const orders = await orderModel.find({})
//       .populate('userId', 'name email')
//       .sort({ date: -1 });
    
//     res.json({ success: true, orders });

//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// // User Order Data For Frontend
// const userOrders = async (req, res) => {
//   try {
//     const { userId } = req.body;
//     const orders = await orderModel.find({ userId }).sort({ date: -1 });
//     res.json({ success: true, orders });

//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// // Update order status from Admin Panel
// const updateStatus = async (req, res) => {
//   try {
//     const { orderId, status } = req.body;
    
//     if (!orderId || !status) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing orderId or status'
//       });
//     }
    
//     // Validate status
//     const validStatuses = [
//       'Order Received',
//       'Preparing',
//       'Ready for Pickup',
//       'Out for Delivery',
//       'Delivered',
//       'Cancelled'
//     ];
    
//     if (!validStatuses.includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid status value'
//       });
//     }
    
//     await orderModel.findByIdAndUpdate(orderId, { status });
//     res.json({ success: true, message: 'Status Updated' });

//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// };

// // Update payment status
// const updatePaymentStatus = async (req, res) => {
//   try {
//     const { orderId, payment } = req.body;
    
//     if (!orderId || payment === undefined) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing orderId or payment status'
//       });
//     }
    
//     await orderModel.findByIdAndUpdate(orderId, { payment });
//     res.json({ success: true, message: 'Payment status updated' });

//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// };

// // Delete pending order (for failed payments)
// const deleteOrder = async (req, res) => {
//   try {
//     const { orderId } = req.params;
    
//     if (!orderId) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing order ID'
//       });
//     }
    
//     const order = await orderModel.findByIdAndDelete(orderId);
    
//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: 'Order not found'
//       });
//     }
    
//     res.json({ success: true, message: 'Order deleted' });
    
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// };

// export {
//   placeOrder,
//   placeOrderPaystack,
//   placeOrderFlutterwave,
//   verifyPaystack,
//   verifyFlutterwave,
//   allOrders,
//   userOrders,
//   updateStatus,
//   updatePaymentStatus,
//   deleteOrder
// };























// import orderModel from "../models/orderModel.js";
// import userModel from "../models/userModel.js";
// import { default as Paystack } from '@paystack/paystack-sdk';
// import Flutterwave from 'flutterwave-node-v3';
// import axios from 'axios';

// // Initialize payment gateways
// const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY);
// const flw = new Flutterwave(
//   process.env.FLW_PUBLIC_KEY,
//   process.env.FLW_SECRET_KEY
// );

// // Helper function to create order
// const createOrder = async (userId, items, amount, address, paymentMethod, currency = 'EUR') => {
//   const orderData = {
//     userId,
//     items,
//     address,
//     amount,
//     currency,
//     paymentMethod,
//     payment: paymentMethod === 'COD' ? false : undefined,
//     date: Date.now(),
//     status: 'Order Received'
//   };
  
//   const newOrder = new orderModel(orderData);
//   await newOrder.save();
//   return newOrder;
// };

// // Helper function to get NGN exchange rate
// const getExchangeRate = async () => {
//   try {
//     // Use a real exchange rate API in production
//     // const response = await axios.get('https://api.exchangerate-api.com/v4/latest/EUR');
//     // return response.data.rates.NGN;
//     return 1600; // Fallback rate: 1 EUR = 1600 NGN
//   } catch (error) {
//     console.error("Error fetching exchange rate:", error);
//     return 1600; // Default fallback for Nigerian Naira
//   }
// };

// // Placing orders using COD Method
// const placeOrder = async (req, res) => {
//   try {
//     const { userId, items, amount, address } = req.body;

//     const newOrder = await createOrder(
//       userId,
//       items,
//       amount,
//       address,
//       "COD"
//     );

//     await userModel.findByIdAndUpdate(userId, { cartData: {} });

//     res.json({ success: true, message: "Order Placed" });

//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// // Paystack Payment - UPDATED FOR NIGERIAN ACCOUNTS
// const placeOrderPaystack = async (req, res) => {
//   let newOrder;
//   try {
//     const { userId, items, amount, address } = req.body;
//     const { origin } = req.headers;

//     // Validate amount
//     if (isNaN(amount) || amount <= 0) {
//       throw new Error('Invalid order amount');
//     }

//     // Create order first
//     newOrder = await createOrder(
//       userId,
//       items,
//       amount,
//       address,
//       "Paystack"
//     );

//     // Convert EUR to NGN for Nigerian Paystack accounts
//     const exchangeRate = await getExchangeRate();
//     const nairaAmount = Math.round(amount * exchangeRate); // Convert to Naira
//     const koboAmount = nairaAmount * 100; // Convert to kobo (1 NGN = 100 kobo)
    
//     // Create payment payload
//     const payload = {
//       email: address.email,
//       amount: koboAmount,
//       currency: 'NGN', // Nigerian Naira
//       callback_url: `${origin}/verify?success=true&orderId=${newOrder._id}&gateway=paystack`,
//       metadata: {
//         order_id: newOrder._id.toString(),
//         user_id: userId
//       }
//     };

//     // Initialize transaction
//     const response = await paystack.transaction.initialize(payload);
    
//     // Check if response is valid
//     if (!response.status || !response.data?.authorization_url) {
//       const errorMsg = response.message || 'Paystack service error';
//       console.error('Paystack API error:', {
//         status: response.status,
//         message: response.message,
//         data: response.data
//       });
//       throw new Error(errorMsg);
//     }

//     res.json({ 
//       success: true, 
//       authorization_url: response.data.authorization_url 
//     });

//   } catch (error) {
//     console.error('Paystack order error:', {
//       message: error.message,
//       stack: error.stack,
//       response: error.response?.data
//     });
    
//     // Attempt to delete the order if creation failed
//     if (newOrder) {
//       try {
//         await orderModel.findByIdAndDelete(newOrder._id);
//       } catch (deleteError) {
//         console.error('Failed to delete order:', deleteError.message);
//       }
//     }
    
//     res.status(500).json({ 
//       success: false, 
//       message: error.message || 'Failed to initialize payment'
//     });
//   }
// };

// // Verify Paystack
// const verifyPaystack = async (req, res) => {
//   const { reference, orderId } = req.body;

//   try {
//     if (!reference || !orderId) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Missing reference or orderId' 
//       });
//     }

//     const response = await paystack.transaction.verify(reference);
    
//     // Check if verification was successful
//     if (!response.status || !response.data) {
//       console.error('Paystack verification failed:', response.message);
//       throw new Error(response.message || 'Payment verification failed');
//     }
    
//     const transaction = response.data;
    
//     if (transaction.status === 'success') {
//       await orderModel.findByIdAndUpdate(orderId, { 
//         payment: true,
//         status: 'Order Received'
//       });
      
//       // Get user ID from order to clear cart
//       const order = await orderModel.findById(orderId);
//       if (order && order.userId) {
//         await userModel.findByIdAndUpdate(order.userId, { cartData: {} });
//       }
      
//       res.json({ success: true, message: "Payment Successful" });
//     } else {
//       // Delete order if payment failed
//       await orderModel.findByIdAndDelete(orderId);
//       res.json({ 
//         success: false, 
//         message: `Payment Failed: ${transaction.gateway_response}` 
//       });
//     }
//   } catch (error) {
//     console.error('Verification error:', error.message);
    
//     // Attempt to delete order on verification failure
//     if (orderId) {
//       try {
//         await orderModel.findByIdAndDelete(orderId);
//       } catch (deleteError) {
//         console.error('Failed to delete order:', deleteError.message);
//       }
//     }
    
//     res.status(500).json({ 
//       success: false, 
//       message: error.message || 'Payment verification error' 
//     });
//   }
// };

// // Flutterwave Payment
// const placeOrderFlutterwave = async (req, res) => {
//   let newOrder;
//   try {
//     const { userId, items, amount, address } = req.body;
//     const { origin } = req.headers;

//     const newOrder = await createOrder(
//       userId,
//       items,
//       amount,
//       address,
//       "Flutterwave"
//     );

//     const payload = {
//       tx_ref: newOrder._id.toString(),
//       amount: amount,
//       currency: 'EUR', // Flutterwave supports EUR
//       redirect_url: `${origin}/verify?success=true&orderId=${newOrder._id}&gateway=flutterwave`,
//       customer: {
//         email: address.email,
//         phonenumber: address.phone,
//         name: `${address.firstName} ${address.lastName}`
//       },
//       customizations: {
//         title: "Order Payment",
//         description: "Payment for items in cart"
//       },
//       meta: {
//         user_id: userId
//       }
//     };

//     const response = await flw.PaymentLink.create(payload);
    
//     // Check Flutterwave response
//     if (response.status !== 'success' || !response.data.link) {
//       throw new Error(response.message || 'Failed to create payment link');
//     }
    
//     res.json({ success: true, link: response.data.link });

//   } catch (error) {
//     console.log('Flutterwave order error:', error);
    
//     // Attempt to delete order on failure
//     if (newOrder) {
//       try {
//         await orderModel.findByIdAndDelete(newOrder._id);
//       } catch (deleteError) {
//         console.error('Failed to delete order:', deleteError);
//       }
//     }
    
//     res.json({ success: false, message: error.message });
//   }
// };

// // Verify Flutterwave
// const verifyFlutterwave = async (req, res) => {
//   const { transaction_id, orderId } = req.body;

//   try {
//     if (!transaction_id || !orderId) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Missing transaction_id or orderId' 
//       });
//     }

//     const response = await flw.Transaction.verify({ id: transaction_id });
    
//     if (response.data.status === 'successful') {
//       await orderModel.findByIdAndUpdate(orderId, { 
//         payment: true,
//         status: 'Order Received'
//       });
      
//       // Get user ID from order to clear cart
//       const order = await orderModel.findById(orderId);
//       if (order && order.userId) {
//         await userModel.findByIdAndUpdate(order.userId, { cartData: {} });
//       }
      
//       res.json({ success: true, message: "Payment Successful" });
//     } else {
//       // Delete order if payment failed
//       await orderModel.findByIdAndDelete(orderId);
//       res.json({ success: false, message: 'Payment Failed' });
//     }
//   } catch (error) {
//     console.log(error);
    
//     // Attempt to delete order on verification failure
//     try {
//       await orderModel.findByIdAndDelete(orderId);
//     } catch (deleteError) {
//       console.error('Failed to delete order:', deleteError);
//     }
    
//     res.status(500).json({ 
//       success: false, 
//       message: error.message || 'Payment verification error' 
//     });
//   }
// };

// // All Orders data for Admin Panel
// const allOrders = async (req, res) => {
//   try {
//     const orders = await orderModel.find({})
//       .populate('userId', 'name email')
//       .sort({ date: -1 });
    
//     res.json({ success: true, orders });

//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// // User Order Data For Frontend
// const userOrders = async (req, res) => {
//   try {
//     const { userId } = req.body;
//     const orders = await orderModel.find({ userId }).sort({ date: -1 });
//     res.json({ success: true, orders });

//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// // Update order status from Admin Panel
// const updateStatus = async (req, res) => {
//   try {
//     const { orderId, status } = req.body;
    
//     if (!orderId || !status) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing orderId or status'
//       });
//     }
    
//     // Validate status
//     const validStatuses = [
//       'Order Received',
//       'Preparing',
//       'Ready for Pickup',
//       'Out for Delivery',
//       'Delivered',
//       'Cancelled'
//     ];
    
//     if (!validStatuses.includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid status value'
//       });
//     }
    
//     await orderModel.findByIdAndUpdate(orderId, { status });
//     res.json({ success: true, message: 'Status Updated' });

//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// };

// // Update payment status
// const updatePaymentStatus = async (req, res) => {
//   try {
//     const { orderId, payment } = req.body;
    
//     if (!orderId || payment === undefined) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing orderId or payment status'
//       });
//     }
    
//     await orderModel.findByIdAndUpdate(orderId, { payment });
//     res.json({ success: true, message: 'Payment status updated' });

//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// };

// // Delete pending order (for failed payments)
// const deleteOrder = async (req, res) => {
//   try {
//     const { orderId } = req.params;
    
//     if (!orderId) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing order ID'
//       });
//     }
    
//     const order = await orderModel.findByIdAndDelete(orderId);
    
//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: 'Order not found'
//       });
//     }
    
//     res.json({ success: true, message: 'Order deleted' });
    
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// };

// export {
//   placeOrder,
//   placeOrderPaystack,
//   placeOrderFlutterwave,
//   verifyPaystack,
//   verifyFlutterwave,
//   allOrders,
//   userOrders,
//   updateStatus,
//   updatePaymentStatus,
//   deleteOrder
// };






















// import orderModel from "../models/orderModel.js";
// import userModel from "../models/userModel.js";
// import { default as Paystack } from '@paystack/paystack-sdk';
// import Flutterwave from 'flutterwave-node-v3';
// import axios from 'axios';

// // Initialize payment gateways
// const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY);
// const flw = new Flutterwave(
//   process.env.FLW_PUBLIC_KEY,
//   process.env.FLW_SECRET_KEY
// );

// // Helper function to create order
// const createOrder = async (userId, items, amount, address, paymentMethod, currency = 'EUR') => {
//   const orderData = {
//     userId,
//     items,
//     address,
//     amount,
//     currency,
//     paymentMethod,
//     payment: paymentMethod === 'COD' ? false : undefined,
//     date: Date.now(),
//     status: 'Order Received'
//   };
  
//   const newOrder = new orderModel(orderData);
//   await newOrder.save();
//   return newOrder;
// };

// // Helper function to get USD exchange rate
// const getExchangeRate = async () => {
//   try {
//     // Use a real exchange rate API in production
//     // const response = await axios.get('https://api.exchangerate-api.com/v4/latest/EUR');
//     // return response.data.rates.USD;
//     return 1.07; // Fallback rate
//   } catch (error) {
//     console.error("Error fetching exchange rate:", error);
//     return 1.07; // Default fallback
//   }
// };

// // Placing orders using COD Method
// const placeOrder = async (req, res) => {
//   try {
//     const { userId, items, amount, address } = req.body;

//     const newOrder = await createOrder(
//       userId,
//       items,
//       amount,
//       address,
//       "COD"
//     );

//     await userModel.findByIdAndUpdate(userId, { cartData: {} });

//     res.json({ success: true, message: "Order Placed" });

//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// // Paystack Payment - UPDATED
// const placeOrderPaystack = async (req, res) => {
//   let newOrder;
//   try {
//     const { userId, items, amount, address } = req.body;
//     const { origin } = req.headers;

//     // Validate amount
//     if (isNaN(amount) || amount <= 0) {
//       throw new Error('Invalid order amount');
//     }

//     // Create order first
//     newOrder = await createOrder(
//       userId,
//       items,
//       amount,
//       address,
//       "Paystack"
//     );

//     // Convert EUR to USD for Paystack
//     const exchangeRate = await getExchangeRate();
//     const usdAmount = Math.round(amount * exchangeRate * 100);
    
//     // Create payment payload
//     const payload = {
//       email: address.email,
//       amount: usdAmount,
//       currency: 'USD',
//       callback_url: `${origin}/verify?success=true&orderId=${newOrder._id}&gateway=paystack`,
//       metadata: {
//         order_id: newOrder._id.toString(),
//         user_id: userId
//       }
//     };

//     // Initialize transaction
//     const response = await paystack.transaction.initialize(payload);
    
//     // Check if response is valid
//     if (!response.status || !response.data?.authorization_url) {
//       const errorMsg = response.message || 'Paystack service error';
//       console.error('Paystack API error:', {
//         status: response.status,
//         message: response.message,
//         data: response.data
//       });
//       throw new Error(errorMsg);
//     }

//     res.json({ 
//       success: true, 
//       authorization_url: response.data.authorization_url 
//     });

//   } catch (error) {
//     console.error('Paystack order error:', {
//       message: error.message,
//       stack: error.stack,
//       response: error.response?.data
//     });
    
//     // Attempt to delete the order if creation failed
//     if (newOrder) {
//       try {
//         await orderModel.findByIdAndDelete(newOrder._id);
//       } catch (deleteError) {
//         console.error('Failed to delete order:', deleteError.message);
//       }
//     }
    
//     res.status(500).json({ 
//       success: false, 
//       message: error.message || 'Failed to initialize payment'
//     });
//   }
// };

// // Verify Paystack
// const verifyPaystack = async (req, res) => {
//   const { reference, orderId } = req.body;

//   try {
//     if (!reference || !orderId) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Missing reference or orderId' 
//       });
//     }

//     const response = await paystack.transaction.verify(reference);
    
//     // Check if verification was successful
//     if (!response.status || !response.data) {
//       console.error('Paystack verification failed:', response.message);
//       throw new Error(response.message || 'Payment verification failed');
//     }
    
//     const transaction = response.data;
    
//     if (transaction.status === 'success') {
//       await orderModel.findByIdAndUpdate(orderId, { 
//         payment: true,
//         status: 'Order Received'
//       });
      
//       // Get user ID from order to clear cart
//       const order = await orderModel.findById(orderId);
//       if (order && order.userId) {
//         await userModel.findByIdAndUpdate(order.userId, { cartData: {} });
//       }
      
//       res.json({ success: true, message: "Payment Successful" });
//     } else {
//       // Delete order if payment failed
//       await orderModel.findByIdAndDelete(orderId);
//       res.json({ 
//         success: false, 
//         message: `Payment Failed: ${transaction.gateway_response}` 
//       });
//     }
//   } catch (error) {
//     console.error('Verification error:', error.message);
    
//     // Attempt to delete order on verification failure
//     if (orderId) {
//       try {
//         await orderModel.findByIdAndDelete(orderId);
//       } catch (deleteError) {
//         console.error('Failed to delete order:', deleteError.message);
//       }
//     }
    
//     res.status(500).json({ 
//       success: false, 
//       message: error.message || 'Payment verification error' 
//     });
//   }
// };

// // Flutterwave Payment
// const placeOrderFlutterwave = async (req, res) => {
//   let newOrder;
//   try {
//     const { userId, items, amount, address } = req.body;
//     const { origin } = req.headers;

//     const newOrder = await createOrder(
//       userId,
//       items,
//       amount,
//       address,
//       "Flutterwave"
//     );

//     const payload = {
//       tx_ref: newOrder._id.toString(),
//       amount: amount,
//       currency: 'EUR', // Flutterwave supports EUR
//       redirect_url: `${origin}/verify?success=true&orderId=${newOrder._id}&gateway=flutterwave`,
//       customer: {
//         email: address.email,
//         phonenumber: address.phone,
//         name: `${address.firstName} ${address.lastName}`
//       },
//       customizations: {
//         title: "Order Payment",
//         description: "Payment for items in cart"
//       },
//       meta: {
//         user_id: userId
//       }
//     };

//     const response = await flw.PaymentLink.create(payload);
    
//     // Check Flutterwave response
//     if (response.status !== 'success' || !response.data.link) {
//       throw new Error(response.message || 'Failed to create payment link');
//     }
    
//     res.json({ success: true, link: response.data.link });

//   } catch (error) {
//     console.log('Flutterwave order error:', error);
    
//     // Attempt to delete order on failure
//     if (newOrder) {
//       try {
//         await orderModel.findByIdAndDelete(newOrder._id);
//       } catch (deleteError) {
//         console.error('Failed to delete order:', deleteError);
//       }
//     }
    
//     res.json({ success: false, message: error.message });
//   }
// };

// // Verify Flutterwave
// const verifyFlutterwave = async (req, res) => {
//   const { transaction_id, orderId } = req.body;

//   try {
//     if (!transaction_id || !orderId) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Missing transaction_id or orderId' 
//       });
//     }

//     const response = await flw.Transaction.verify({ id: transaction_id });
    
//     if (response.data.status === 'successful') {
//       await orderModel.findByIdAndUpdate(orderId, { 
//         payment: true,
//         status: 'Order Received'
//       });
      
//       // Get user ID from order to clear cart
//       const order = await orderModel.findById(orderId);
//       if (order && order.userId) {
//         await userModel.findByIdAndUpdate(order.userId, { cartData: {} });
//       }
      
//       res.json({ success: true, message: "Payment Successful" });
//     } else {
//       // Delete order if payment failed
//       await orderModel.findByIdAndDelete(orderId);
//       res.json({ success: false, message: 'Payment Failed' });
//     }
//   } catch (error) {
//     console.log(error);
    
//     // Attempt to delete order on verification failure
//     try {
//       await orderModel.findByIdAndDelete(orderId);
//     } catch (deleteError) {
//       console.error('Failed to delete order:', deleteError);
//     }
    
//     res.status(500).json({ 
//       success: false, 
//       message: error.message || 'Payment verification error' 
//     });
//   }
// };

// // All Orders data for Admin Panel
// const allOrders = async (req, res) => {
//   try {
//     const orders = await orderModel.find({})
//       .populate('userId', 'name email')
//       .sort({ date: -1 });
    
//     res.json({ success: true, orders });

//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// // User Order Data For Frontend
// const userOrders = async (req, res) => {
//   try {
//     const { userId } = req.body;
//     const orders = await orderModel.find({ userId }).sort({ date: -1 });
//     res.json({ success: true, orders });

//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// // Update order status from Admin Panel
// const updateStatus = async (req, res) => {
//   try {
//     const { orderId, status } = req.body;
    
//     if (!orderId || !status) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing orderId or status'
//       });
//     }
    
//     // Validate status
//     const validStatuses = [
//       'Order Received',
//       'Preparing',
//       'Ready for Pickup',
//       'Out for Delivery',
//       'Delivered',
//       'Cancelled'
//     ];
    
//     if (!validStatuses.includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid status value'
//       });
//     }
    
//     await orderModel.findByIdAndUpdate(orderId, { status });
//     res.json({ success: true, message: 'Status Updated' });

//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// };

// // Update payment status
// const updatePaymentStatus = async (req, res) => {
//   try {
//     const { orderId, payment } = req.body;
    
//     if (!orderId || payment === undefined) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing orderId or payment status'
//       });
//     }
    
//     await orderModel.findByIdAndUpdate(orderId, { payment });
//     res.json({ success: true, message: 'Payment status updated' });

//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// };

// // Delete pending order (for failed payments)
// const deleteOrder = async (req, res) => {
//   try {
//     const { orderId } = req.params;
    
//     if (!orderId) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing order ID'
//       });
//     }
    
//     const order = await orderModel.findByIdAndDelete(orderId);
    
//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: 'Order not found'
//       });
//     }
    
//     res.json({ success: true, message: 'Order deleted' });
    
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// };

// export {
//   placeOrder,
//   placeOrderPaystack,
//   placeOrderFlutterwave,
//   verifyPaystack,
//   verifyFlutterwave,
//   allOrders,
//   userOrders,
//   updateStatus,
//   updatePaymentStatus,
//   deleteOrder
// };




























// import orderModel from "../models/orderModel.js";
// import userModel from "../models/userModel.js";
// // import { default as Paystack } from 'paystack';
// import { default as Paystack } from '@paystack/paystack-sdk';
// import Flutterwave from 'flutterwave-node-v3';

// // Initialize payment gateways
// const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY);
// const flw = new Flutterwave(
//   process.env.FLW_PUBLIC_KEY,
//   process.env.FLW_SECRET_KEY
// );

// // Helper function to create order
// const createOrder = async (userId, items, amount, address, paymentMethod, currency = 'EUR') => {
//   const orderData = {
//     userId,
//     items,
//     address,
//     amount,
//     currency, // Store original currency
//     paymentMethod,
//     payment: paymentMethod === 'COD' ? false : undefined,
//     date: Date.now(),
//     status: 'Order Received' // Default status
//   };
  
//   const newOrder = new orderModel(orderData);
//   await newOrder.save();
//   return newOrder;
// };

// // Placing orders using COD Method
// const placeOrder = async (req, res) => {
//   try {
//     const { userId, items, amount, address } = req.body;

//     const newOrder = await createOrder(
//       userId,
//       items,
//       amount,
//       address,
//       "COD"
//     );

//     await userModel.findByIdAndUpdate(userId, { cartData: {} });

//     res.json({ success: true, message: "Order Placed" });

//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// // Paystack Payment
// const placeOrderPaystack = async (req, res) => {
//   let newOrder;
//   try {
//     const { userId, items, amount, address } = req.body;
//     const { origin } = req.headers;

//     // Create order first
//     newOrder = await createOrder(
//       userId,
//       items,
//       amount,
//       address,
//       "Paystack"
//     );

//     // Convert EUR to USD for Paystack
//     const exchangeRate = 1.07; // 1 EUR = 1.07 USD
//     const usdAmount = Math.round(amount * exchangeRate * 100); // convert to cents
    
//     // Create payment payload
//     const payload = {
//       email: address.email,
//       amount: usdAmount,
//       currency: 'USD', // Paystack requires USD
//       callback_url: `${origin}/verify?success=true&orderId=${newOrder._id}&gateway=paystack`,
//       metadata: {
//         order_id: newOrder._id.toString(),
//         user_id: userId
//       }
//     };

//     // Initialize transaction
//     // const response = await paystack.transaction.initialize(payload);
    
// const response = await paystack.transaction.initialize({
//   ...payload,
//   amount: usdAmount, // Already calculated
//   currency: 'USD'
// });
    
//     // Check if response is valid
//     if (!response?.data?.status || !response.data.data?.authorization_url) {
//       const errorMsg = response?.data?.message || 'Paystack service error';
//       console.error('Paystack error:', errorMsg);
//       throw new Error(errorMsg);
//     }

//     res.json({ 
//       success: true, 
//       authorization_url: response.data.data.authorization_url 
//     });

//   } catch (error) {
//     // console.log('Paystack order error:', error.message);
//   console.error('Paystack error details:', {
//     message: error.message,
//     response: error.response?.data,
//     stack: error.stack
//   });
    
//     // Attempt to delete the order if creation failed
//     if (newOrder) {
//       try {
//         await orderModel.findByIdAndDelete(newOrder._id);
//       } catch (deleteError) {
//         console.error('Failed to delete order:', deleteError.message);
//       }
//     }
    
//     res.status(500).json({ 
//       success: false, 
//       message: error.message || 'Failed to initialize payment'
//     });
//   }
// };

// // Verify Paystack
// const verifyPaystack = async (req, res) => {
//   const { reference, orderId } = req.body;

//   try {
//     if (!reference || !orderId) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Missing reference or orderId' 
//       });
//     }

//     const response = await paystack.transaction.verify(reference);
    
//     // Check if verification was successful
//     if (!response.data.status || !response.data.data) {
//       console.error('Paystack verification failed:', response.data.message);
//       throw new Error(response.data.message || 'Payment verification failed');
//     }
    
//     const transaction = response.data.data;
    
//     if (transaction.status === 'success') {
//       await orderModel.findByIdAndUpdate(orderId, { 
//         payment: true,
//         status: 'Order Received'
//       });
      
//       // Get user ID from order to clear cart
//       const order = await orderModel.findById(orderId);
//       if (order && order.userId) {
//         await userModel.findByIdAndUpdate(order.userId, { cartData: {} });
//       }
      
//       res.json({ success: true, message: "Payment Successful" });
//     } else {
//       // Delete order if payment failed
//       await orderModel.findByIdAndDelete(orderId);
//       res.json({ 
//         success: false, 
//         message: `Payment Failed: ${transaction.gateway_response}` 
//       });
//     }
//   } catch (error) {
//     console.error('Verification error:', error.message);
    
//     // Attempt to delete order on verification failure
//     if (orderId) {
//       try {
//         await orderModel.findByIdAndDelete(orderId);
//       } catch (deleteError) {
//         console.error('Failed to delete order:', deleteError.message);
//       }
//     }
    
//     res.status(500).json({ 
//       success: false, 
//       message: error.message || 'Payment verification error' 
//     });
//   }
// };

// // Flutterwave Payment
// const placeOrderFlutterwave = async (req, res) => {
//   try {
//     const { userId, items, amount, address } = req.body;
//     const { origin } = req.headers;

//     const newOrder = await createOrder(
//       userId,
//       items,
//       amount,
//       address,
//       "Flutterwave"
//     );

//     const payload = {
//       tx_ref: newOrder._id.toString(),
//       amount: amount,
//       currency: 'EUR', // Flutterwave supports EUR
//       redirect_url: `${origin}/verify?success=true&orderId=${newOrder._id}&gateway=flutterwave`,
//       customer: {
//         email: address.email,
//         phonenumber: address.phone,
//         name: `${address.firstName} ${address.lastName}`
//       },
//       customizations: {
//         title: "Order Payment",
//         description: "Payment for items in cart"
//       },
//       meta: {
//         user_id: userId
//       }
//     };

//     const response = await flw.PaymentLink.create(payload);
    
//     // Check Flutterwave response
//     if (response.status !== 'success' || !response.data.link) {
//       throw new Error(response.message || 'Failed to create payment link');
//     }
    
//     res.json({ success: true, link: response.data.link });

//   } catch (error) {
//     console.log('Flutterwave order error:', error);
    
//     // Attempt to delete order on failure
//     if (newOrder) {
//       try {
//         await orderModel.findByIdAndDelete(newOrder._id);
//       } catch (deleteError) {
//         console.error('Failed to delete order:', deleteError);
//       }
//     }
    
//     res.json({ success: false, message: error.message });
//   }
// };

// // Verify Flutterwave
// const verifyFlutterwave = async (req, res) => {
//   const { transaction_id, orderId } = req.body;

//   try {
//     if (!transaction_id || !orderId) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Missing transaction_id or orderId' 
//       });
//     }

//     const response = await flw.Transaction.verify({ id: transaction_id });
    
//     if (response.data.status === 'successful') {
//       await orderModel.findByIdAndUpdate(orderId, { 
//         payment: true,
//         status: 'Order Received'
//       });
      
//       // Get user ID from order to clear cart
//       const order = await orderModel.findById(orderId);
//       if (order && order.userId) {
//         await userModel.findByIdAndUpdate(order.userId, { cartData: {} });
//       }
      
//       res.json({ success: true, message: "Payment Successful" });
//     } else {
//       // Delete order if payment failed
//       await orderModel.findByIdAndDelete(orderId);
//       res.json({ success: false, message: 'Payment Failed' });
//     }
//   } catch (error) {
//     console.log(error);
    
//     // Attempt to delete order on verification failure
//     try {
//       await orderModel.findByIdAndDelete(orderId);
//     } catch (deleteError) {
//       console.error('Failed to delete order:', deleteError);
//     }
    
//     res.status(500).json({ 
//       success: false, 
//       message: error.message || 'Payment verification error' 
//     });
//   }
// };

// // All Orders data for Admin Panel
// const allOrders = async (req, res) => {
//   try {
//     const orders = await orderModel.find({})
//       .populate('userId', 'name email')
//       .sort({ date: -1 });
    
//     res.json({ success: true, orders });

//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// // User Order Data For Frontend
// const userOrders = async (req, res) => {
//   try {
//     const { userId } = req.body;
//     const orders = await orderModel.find({ userId }).sort({ date: -1 });
//     res.json({ success: true, orders });

//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// // Update order status from Admin Panel
// const updateStatus = async (req, res) => {
//   try {
//     const { orderId, status } = req.body;
    
//     if (!orderId || !status) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing orderId or status'
//       });
//     }
    
//     // Validate status
//     const validStatuses = [
//       'Order Received',
//       'Preparing',
//       'Ready for Pickup',
//       'Out for Delivery',
//       'Delivered',
//       'Cancelled'
//     ];
    
//     if (!validStatuses.includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid status value'
//       });
//     }
    
//     await orderModel.findByIdAndUpdate(orderId, { status });
//     res.json({ success: true, message: 'Status Updated' });

//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// };

// // Update payment status
// const updatePaymentStatus = async (req, res) => {
//   try {
//     const { orderId, payment } = req.body;
    
//     if (!orderId || payment === undefined) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing orderId or payment status'
//       });
//     }
    
//     await orderModel.findByIdAndUpdate(orderId, { payment });
//     res.json({ success: true, message: 'Payment status updated' });

//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// };

// // Delete pending order (for failed payments)
// const deleteOrder = async (req, res) => {
//   try {
//     const { orderId } = req.params;
    
//     if (!orderId) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing order ID'
//       });
//     }
    
//     const order = await orderModel.findByIdAndDelete(orderId);
    
//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: 'Order not found'
//       });
//     }
    
//     res.json({ success: true, message: 'Order deleted' });
    
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// };

// export {
//   placeOrder,
//   placeOrderPaystack,
//   placeOrderFlutterwave,
//   verifyPaystack,
//   verifyFlutterwave,
//   allOrders,
//   userOrders,
//   updateStatus,
//   updatePaymentStatus,
//   deleteOrder
// };
































// import orderModel from "../models/orderModel.js";
// import userModel from "../models/userModel.js";
// import Paystack from 'paystack';
// import Flutterwave from 'flutterwave-node-v3';

// // Initialize payment gateways
// const paystack = Paystack(process.env.PAYSTACK_SECRET_KEY);
// const flw = new Flutterwave(
//   process.env.FLW_PUBLIC_KEY,
//   process.env.FLW_SECRET_KEY
// );

// // Helper function to create order
// const createOrder = async (userId, items, amount, address, paymentMethod, currency = 'EUR') => {
//   const orderData = {
//     userId,
//     items,
//     address,
//     amount,
//     currency, // Store original currency
//     paymentMethod,
//     payment: paymentMethod === 'COD' ? false : undefined,
//     date: Date.now(),
//     status: 'Order Received' // Default status
//   };
  
//   const newOrder = new orderModel(orderData);
//   await newOrder.save();
//   return newOrder;
// };

// // Placing orders using COD Method
// const placeOrder = async (req, res) => {
//   try {
//     const { userId, items, amount, address } = req.body;

//     const newOrder = await createOrder(
//       userId,
//       items,
//       amount,
//       address,
//       "COD"
//     );

//     await userModel.findByIdAndUpdate(userId, { cartData: {} });

//     res.json({ success: true, message: "Order Placed" });

//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// // Paystack Payment
// const placeOrderPaystack = async (req, res) => {
//   let newOrder;
//   try {
//     const { userId, items, amount, address } = req.body;
//     const { origin } = req.headers;

//     // Create order first
//     newOrder = await createOrder(
//       userId,
//       items,
//       amount,
//       address,
//       "Paystack"
//     );

//     // Convert EUR to USD for Paystack
//     const exchangeRate = 1.07; // 1 EUR = 1.07 USD
//     const usdAmount = Math.round(amount * exchangeRate * 100); // convert to cents
    
//     // Create payment payload
//     const payload = {
//       email: address.email,
//       amount: usdAmount,
//       currency: 'USD', // Paystack requires USD
//       callback_url: `${origin}/verify?success=true&orderId=${newOrder._id}&gateway=paystack`,
//       metadata: {
//         order_id: newOrder._id.toString(),
//         user_id: userId
//       }
//     };

//     // Initialize transaction
//     const response = await paystack.transaction.initialize(payload);
    
//     // Check if response is valid
//     if (!response?.data?.status || !response.data.data?.authorization_url) {
//       const errorMsg = response?.data?.message || 'Paystack service error';
//       console.error('Paystack error:', errorMsg);
//       throw new Error(errorMsg);
//     }

//     res.json({ 
//       success: true, 
//       authorization_url: response.data.data.authorization_url 
//     });

//   } catch (error) {
//     console.log('Paystack order error:', error.message);
    
//     // Attempt to delete the order if creation failed
//     if (newOrder) {
//       try {
//         await orderModel.findByIdAndDelete(newOrder._id);
//       } catch (deleteError) {
//         console.error('Failed to delete order:', deleteError.message);
//       }
//     }
    
//     res.status(500).json({ 
//       success: false, 
//       message: error.message || 'Failed to initialize payment'
//     });
//   }
// };

// // Verify Paystack
// const verifyPaystack = async (req, res) => {
//   const { reference, orderId } = req.body;

//   try {
//     if (!reference || !orderId) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Missing reference or orderId' 
//       });
//     }

//     const response = await paystack.transaction.verify(reference);
    
//     // Check if verification was successful
//     if (!response.data.status || !response.data.data) {
//       console.error('Paystack verification failed:', response.data.message);
//       throw new Error(response.data.message || 'Payment verification failed');
//     }
    
//     const transaction = response.data.data;
    
//     if (transaction.status === 'success') {
//       await orderModel.findByIdAndUpdate(orderId, { 
//         payment: true,
//         status: 'Order Received'
//       });
      
//       // Get user ID from order to clear cart
//       const order = await orderModel.findById(orderId);
//       if (order && order.userId) {
//         await userModel.findByIdAndUpdate(order.userId, { cartData: {} });
//       }
      
//       res.json({ success: true, message: "Payment Successful" });
//     } else {
//       // Delete order if payment failed
//       await orderModel.findByIdAndDelete(orderId);
//       res.json({ 
//         success: false, 
//         message: `Payment Failed: ${transaction.gateway_response}` 
//       });
//     }
//   } catch (error) {
//     console.error('Verification error:', error.message);
    
//     // Attempt to delete order on verification failure
//     if (orderId) {
//       try {
//         await orderModel.findByIdAndDelete(orderId);
//       } catch (deleteError) {
//         console.error('Failed to delete order:', deleteError.message);
//       }
//     }
    
//     res.status(500).json({ 
//       success: false, 
//       message: error.message || 'Payment verification error' 
//     });
//   }
// };

// // Flutterwave Payment
// const placeOrderFlutterwave = async (req, res) => {
//   try {
//     const { userId, items, amount, address } = req.body;
//     const { origin } = req.headers;

//     const newOrder = await createOrder(
//       userId,
//       items,
//       amount,
//       address,
//       "Flutterwave"
//     );

//     const payload = {
//       tx_ref: newOrder._id.toString(),
//       amount: amount,
//       currency: 'EUR', // Flutterwave supports EUR
//       redirect_url: `${origin}/verify?success=true&orderId=${newOrder._id}&gateway=flutterwave`,
//       customer: {
//         email: address.email,
//         phonenumber: address.phone,
//         name: `${address.firstName} ${address.lastName}`
//       },
//       customizations: {
//         title: "Order Payment",
//         description: "Payment for items in cart"
//       },
//       meta: {
//         user_id: userId
//       }
//     };

//     const response = await flw.PaymentLink.create(payload);
    
//     // Check Flutterwave response
//     if (response.status !== 'success' || !response.data.link) {
//       throw new Error(response.message || 'Failed to create payment link');
//     }
    
//     res.json({ success: true, link: response.data.link });

//   } catch (error) {
//     console.log('Flutterwave order error:', error);
    
//     // Attempt to delete order on failure
//     if (newOrder) {
//       try {
//         await orderModel.findByIdAndDelete(newOrder._id);
//       } catch (deleteError) {
//         console.error('Failed to delete order:', deleteError);
//       }
//     }
    
//     res.json({ success: false, message: error.message });
//   }
// };

// // Verify Flutterwave
// const verifyFlutterwave = async (req, res) => {
//   const { transaction_id, orderId } = req.body;

//   try {
//     if (!transaction_id || !orderId) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Missing transaction_id or orderId' 
//       });
//     }

//     const response = await flw.Transaction.verify({ id: transaction_id });
    
//     if (response.data.status === 'successful') {
//       await orderModel.findByIdAndUpdate(orderId, { 
//         payment: true,
//         status: 'Order Received'
//       });
      
//       // Get user ID from order to clear cart
//       const order = await orderModel.findById(orderId);
//       if (order && order.userId) {
//         await userModel.findByIdAndUpdate(order.userId, { cartData: {} });
//       }
      
//       res.json({ success: true, message: "Payment Successful" });
//     } else {
//       // Delete order if payment failed
//       await orderModel.findByIdAndDelete(orderId);
//       res.json({ success: false, message: 'Payment Failed' });
//     }
//   } catch (error) {
//     console.log(error);
    
//     // Attempt to delete order on verification failure
//     try {
//       await orderModel.findByIdAndDelete(orderId);
//     } catch (deleteError) {
//       console.error('Failed to delete order:', deleteError);
//     }
    
//     res.status(500).json({ 
//       success: false, 
//       message: error.message || 'Payment verification error' 
//     });
//   }
// };

// // All Orders data for Admin Panel
// const allOrders = async (req, res) => {
//   try {
//     const orders = await orderModel.find({})
//       .populate('userId', 'name email')
//       .sort({ date: -1 });
    
//     res.json({ success: true, orders });

//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// // User Order Data For Frontend
// const userOrders = async (req, res) => {
//   try {
//     const { userId } = req.body;
//     const orders = await orderModel.find({ userId }).sort({ date: -1 });
//     res.json({ success: true, orders });

//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// // Update order status from Admin Panel
// const updateStatus = async (req, res) => {
//   try {
//     const { orderId, status } = req.body;
    
//     if (!orderId || !status) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing orderId or status'
//       });
//     }
    
//     // Validate status
//     const validStatuses = [
//       'Order Received',
//       'Preparing',
//       'Ready for Pickup',
//       'Out for Delivery',
//       'Delivered',
//       'Cancelled'
//     ];
    
//     if (!validStatuses.includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid status value'
//       });
//     }
    
//     await orderModel.findByIdAndUpdate(orderId, { status });
//     res.json({ success: true, message: 'Status Updated' });

//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// };

// // Update payment status
// const updatePaymentStatus = async (req, res) => {
//   try {
//     const { orderId, payment } = req.body;
    
//     if (!orderId || payment === undefined) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing orderId or payment status'
//       });
//     }
    
//     await orderModel.findByIdAndUpdate(orderId, { payment });
//     res.json({ success: true, message: 'Payment status updated' });

//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// };

// // Delete pending order (for failed payments)
// const deleteOrder = async (req, res) => {
//   try {
//     const { orderId } = req.params;
    
//     if (!orderId) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing order ID'
//       });
//     }
    
//     const order = await orderModel.findByIdAndDelete(orderId);
    
//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: 'Order not found'
//       });
//     }
    
//     res.json({ success: true, message: 'Order deleted' });
    
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// };

// export {
//   placeOrder,
//   placeOrderPaystack,
//   placeOrderFlutterwave,
//   verifyPaystack,
//   verifyFlutterwave,
//   allOrders,
//   userOrders,
//   updateStatus,
//   updatePaymentStatus,
//   deleteOrder
// };





































// import orderModel from "../models/orderModel.js";
// import userModel from "../models/userModel.js";
// import Paystack from 'paystack';
// import Flutterwave from 'flutterwave-node-v3';

// // Global variables
// // const currency = 'EUR';
// const deliveryCharge = 1.5;

// // Initialize payment gateways
// const paystack = Paystack(process.env.PAYSTACK_SECRET_KEY);
// const flw = new Flutterwave(
//   process.env.FLW_PUBLIC_KEY,
//   process.env.FLW_SECRET_KEY
// );

// // Helper function to create order
// // const createOrder = async (userId, items, amount, address, paymentMethod) => {
// //   const orderData = {
// //     userId,
// //     items,
// //     address,
// //     amount,
// //     paymentMethod,
// //     payment: paymentMethod === 'COD' ? false : undefined, // COD is always unpaid initially
// //     date: Date.now(),
// //     status: 'Order Received' // Default status
// //   };
  
// //   const newOrder = new orderModel(orderData);
// //   await newOrder.save();
// //   return newOrder;
// // };



// // Update createOrder to store currency
// const createOrder = async (userId, items, amount, address, paymentMethod) => {
//   const orderData = {
//     userId,
//     items,
//     address,
//     amount,
//     paymentMethod,
//     currency: 'EUR', // Store original currency
//     payment: paymentMethod === 'COD' ? false : undefined,
//     date: Date.now(),
//     status: 'Order Received'
//   };
  
//   const newOrder = new orderModel(orderData);
//   await newOrder.save();
//   return newOrder;
// };




// // Placing orders using COD Method
// const placeOrder = async (req, res) => {
//   try {
//     const { userId, items, amount, address } = req.body;

//     const orderData = {
//       userId,
//       items,
//       address,
//       amount,
//       paymentMethod: "COD",
//       payment: false, // COD is unpaid until delivery
//       date: Date.now(),
//       status: 'Order Received'
//     };

//     const newOrder = new orderModel(orderData);
//     await newOrder.save();

//     await userModel.findByIdAndUpdate(userId, { cartData: {} });

//     res.json({ success: true, message: "Order Placed" });

//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// // Paystack Payment

// // Inside placeOrderPaystack



// // const placeOrderPaystack = async (req, res) => {
// //   let newOrder;
// //   try {
// //     const { userId, items, amount, address } = req.body;
// //     const { origin } = req.headers;

// //     newOrder = await createOrder(
// //       userId,
// //       items,
// //       amount,
// //       address,
// //       "Paystack"
// //     );

// //     // Use USD for Paystack as EUR is not supported
// //     const paystackCurrency = 'USD';
    
// //     // Create payment payload
// //     const payload = {
// //       email: address.email,
// //       amount: Math.round(amount * 100), // convert to cents
// //       currency: paystackCurrency,
// //       callback_url: `${origin}/verify?success=true&orderId=${newOrder._id}&gateway=paystack`,
// //       metadata: {
// //         order_id: newOrder._id.toString(),
// //         user_id: userId
// //       }
// //     };

// //     // Initialize transaction
// //     const response = await paystack.transaction.initialize(payload);
    
// //     // Check if response is valid
// //     if (!response?.data?.status || !response.data.data?.authorization_url) {
// //       const errorMsg = response?.data?.message || 'Paystack service error';
// //       console.error('Paystack error:', errorMsg);
// //       throw new Error(errorMsg);
// //     }

// //     res.json({ 
// //       success: true, 
// //       authorization_url: response.data.data.authorization_url 
// //     });

// //   } catch (error) {
// //     console.log('Paystack order error:', error.message);
    
// //     // Attempt to delete the order if creation failed
// //     if (newOrder) {
// //       try {
// //         await orderModel.findByIdAndDelete(newOrder._id);
// //       } catch (deleteError) {
// //         console.error('Failed to delete order:', deleteError.message);
// //       }
// //     }
    
// //     res.status(500).json({ 
// //       success: false, 
// //       message: error.message || 'Failed to initialize payment'
// //     });
// //   }
// // };




// // const verifyPaystack = async (req, res) => {
// //   const { reference, orderId } = req.body;

// //   try {
// //     if (!reference || !orderId) {
// //       return res.status(400).json({ 
// //         success: false, 
// //         message: 'Missing reference or orderId' 
// //       });
// //     }

// //     const response = await paystack.transaction.verify(reference);
    
// //     // Check if verification was successful
// //     if (!response.data.status) {
// //       console.error('Paystack verification failed:', response.data.message);
// //       throw new Error(response.data.message || 'Payment verification failed');
// //     }
    
// //     const transaction = response.data.data;
    
// //     if (transaction.status === 'success') {
// //       await orderModel.findByIdAndUpdate(orderId, { 
// //         payment: true,
// //         status: 'Order Received'
// //       });
      
// //       // Get user ID from order to clear cart
// //       const order = await orderModel.findById(orderId);
// //       if (order && order.userId) {
// //         await userModel.findByIdAndUpdate(order.userId, { cartData: {} });
// //       }
      
// //       res.json({ success: true, message: "Payment Successful" });
// //     } else {
// //       // Delete order if payment failed
// //       await orderModel.findByIdAndDelete(orderId);
// //       res.json({ 
// //         success: false, 
// //         message: `Payment Failed: ${transaction.gateway_response}` 
// //       });
// //     }
// //   } catch (error) {
// //     console.error('Verification error:', error);
    
// //     // Attempt to delete order on verification failure
// //     try {
// //       if (orderId) {
// //         await orderModel.findByIdAndDelete(orderId);
// //       }
// //     } catch (deleteError) {
// //       console.error('Failed to delete order:', deleteError);
// //     }
    
// //     res.status(500).json({ 
// //       success: false, 
// //       message: error.message || 'Payment verification error' 
// //     });
// //   }
// // };





// // At the top of the file
// // const currency = 'EUR'; // Remove this line

// // Inside placeOrderPaystack
// const placeOrderPaystack = async (req, res) => {
//   let newOrder;
//   try {
//     const { userId, items, amount, address } = req.body;
//     const { origin } = req.headers;

//     newOrder = await createOrder(
//       userId,
//       items,
//       amount,
//       address,
//       "Paystack"
//     );

//     // Use USD for Paystack as EUR is not supported
//     const paystackCurrency = 'USD';
    
//     // Create payment payload
//     const payload = {
//       email: address.email,
//       amount: Math.round(amount * 100), // convert to cents
//       currency: paystackCurrency,
//       callback_url: `${origin}/verify?success=true&orderId=${newOrder._id}&gateway=paystack`,
//       metadata: {
//         order_id: newOrder._id.toString(),
//         user_id: userId
//       }
//     };

//     // Initialize transaction
//     const response = await paystack.transaction.initialize(payload);
    
//     // Check if response is valid
//     if (!response?.data?.status || !response.data.data?.authorization_url) {
//       const errorMsg = response?.data?.message || 'Paystack service error';
//       console.error('Paystack error:', errorMsg);
//       throw new Error(errorMsg);
//     }

//     res.json({ 
//       success: true, 
//       authorization_url: response.data.data.authorization_url 
//     });

//   } catch (error) {
//     console.log('Paystack order error:', error.message);
    
//     // Attempt to delete the order if creation failed
//     if (newOrder) {
//       try {
//         await orderModel.findByIdAndDelete(newOrder._id);
//       } catch (deleteError) {
//         console.error('Failed to delete order:', deleteError.message);
//       }
//     }
    
//     res.status(500).json({ 
//       success: false, 
//       message: error.message || 'Failed to initialize payment'
//     });
//   }
// };

// // Update verifyPaystack to handle USD currency
// const verifyPaystack = async (req, res) => {
//   const { reference, orderId } = req.body;

//   try {
//     if (!reference || !orderId) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Missing reference or orderId' 
//       });
//     }

//     const response = await paystack.transaction.verify(reference);
    
//     // Check if verification was successful
//     if (!response.data.status || !response.data.data) {
//       console.error('Paystack verification failed:', response.data.message);
//       throw new Error(response.data.message || 'Payment verification failed');
//     }
    
//     const transaction = response.data.data;
    
//     if (transaction.status === 'success') {
//       await orderModel.findByIdAndUpdate(orderId, { 
//         payment: true,
//         status: 'Order Received'
//       });
      
//       // Get user ID from order to clear cart
//       const order = await orderModel.findById(orderId);
//       if (order && order.userId) {
//         await userModel.findByIdAndUpdate(order.userId, { cartData: {} });
//       }
      
//       res.json({ success: true, message: "Payment Successful" });
//     } else {
//       // Delete order if payment failed
//       await orderModel.findByIdAndDelete(orderId);
//       res.json({ 
//         success: false, 
//         message: `Payment Failed: ${transaction.gateway_response}` 
//       });
//     }
//   } catch (error) {
//     console.error('Verification error:', error.message);
    
//     // Attempt to delete order on verification failure
//     if (orderId) {
//       try {
//         await orderModel.findByIdAndDelete(orderId);
//       } catch (deleteError) {
//         console.error('Failed to delete order:', deleteError.message);
//       }
//     }
    
//     res.status(500).json({ 
//       success: false, 
//       message: error.message || 'Payment verification error' 
//     });
//   }
// };








// // Flutterwave Payment
// const placeOrderFlutterwave = async (req, res) => {
//   try {
//     const { userId, items, amount, address } = req.body;
//     const { origin } = req.headers;

//     const newOrder = await createOrder(
//       userId,
//       items,
//       amount,
//       address,
//       "Flutterwave"
//     );

//     const payload = {
//       tx_ref: newOrder._id.toString(),
//       amount: amount,
//       currency: currency,
//       redirect_url: `${origin}/verify?success=true&orderId=${newOrder._id}&gateway=flutterwave`,
//       customer: {
//         email: address.email,
//         phonenumber: address.phone,
//         name: `${address.firstName} ${address.lastName}`
//       },
//       customizations: {
//         title: "Order Payment",
//         description: "Payment for items in cart"
//       },
//       meta: {
//         user_id: userId
//       }
//     };

//     const response = await flw.PaymentLink.create(payload);
//     res.json({ success: true, link: response.data.link });

//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// // Verify Flutterwave
// const verifyFlutterwave = async (req, res) => {
//   const { transaction_id, orderId } = req.body;

//   try {
//     if (!transaction_id || !orderId) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Missing transaction_id or orderId' 
//       });
//     }

//     const response = await flw.Transaction.verify({ id: transaction_id });
    
//     if (response.data.status === 'successful') {
//       await orderModel.findByIdAndUpdate(orderId, { 
//         payment: true,
//         status: 'Order Received' // Reset status after payment
//       });
      
//       // Get user ID from order to clear cart
//       const order = await orderModel.findById(orderId);
//       if (order && order.userId) {
//         await userModel.findByIdAndUpdate(order.userId, { cartData: {} });
//       }
      
//       res.json({ success: true, message: "Payment Successful" });
//     } else {
//       // Delete order if payment failed
//       await orderModel.findByIdAndDelete(orderId);
//       res.json({ success: false, message: 'Payment Failed' });
//     }
//   } catch (error) {
//     console.log(error);
    
//     // Attempt to delete order on verification failure
//     try {
//       await orderModel.findByIdAndDelete(orderId);
//     } catch (deleteError) {
//       console.error('Failed to delete order:', deleteError);
//     }
    
//     res.status(500).json({ 
//       success: false, 
//       message: error.message || 'Payment verification error' 
//     });
//   }
// };

// // All Orders data for Admin Panel
// const allOrders = async (req, res) => {
//   try {
//     const orders = await orderModel.find({})
//       .populate('userId', 'name email') // Populate user info
//       .sort({ date: -1 }); // Newest first
    
//     res.json({ success: true, orders });

//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// // User Order Data For Frontend
// const userOrders = async (req, res) => {
//   try {
//     const { userId } = req.body;
//     const orders = await orderModel.find({ userId }).sort({ date: -1 });
//     res.json({ success: true, orders });

//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// // Update order status from Admin Panel
// const updateStatus = async (req, res) => {
//   try {
//     const { orderId, status } = req.body;
    
//     if (!orderId || !status) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing orderId or status'
//       });
//     }
    
//     // Validate status
//     const validStatuses = [
//       'Order Received',
//       'Preparing',
//       'Ready for Pickup',
//       'Out for Delivery',
//       'Delivered',
//       'Cancelled'
//     ];
    
//     if (!validStatuses.includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid status value'
//       });
//     }
    
//     await orderModel.findByIdAndUpdate(orderId, { status });
//     res.json({ success: true, message: 'Status Updated' });

//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// };

// // Update payment status
// const updatePaymentStatus = async (req, res) => {
//   try {
//     const { orderId, payment } = req.body;
    
//     if (!orderId || payment === undefined) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing orderId or payment status'
//       });
//     }
    
//     await orderModel.findByIdAndUpdate(orderId, { payment });
//     res.json({ success: true, message: 'Payment status updated' });

//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// };

// // Delete pending order (for failed payments)
// const deleteOrder = async (req, res) => {
//   try {
//     const { orderId } = req.params;
    
//     if (!orderId) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing order ID'
//       });
//     }
    
//     const order = await orderModel.findByIdAndDelete(orderId);
    
//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: 'Order not found'
//       });
//     }
    
//     res.json({ success: true, message: 'Order deleted' });
    
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// };

// export {
//   placeOrder,
//   placeOrderPaystack,
//   placeOrderFlutterwave,
//   verifyPaystack,
//   verifyFlutterwave,
//   allOrders,
//   userOrders,
//   updateStatus,
//   updatePaymentStatus, // Add this export
//   deleteOrder
// };









































// import orderModel from "../models/orderModel.js";
// import userModel from "../models/userModel.js";
// import Paystack from 'paystack';
// import Flutterwave from 'flutterwave-node-v3';

// // Global variables
// // const currency = 'EUR';
// const deliveryCharge = 1.5;

// // Initialize payment gateways
// const paystack = Paystack(process.env.PAYSTACK_SECRET_KEY);
// const flw = new Flutterwave(
//   process.env.FLW_PUBLIC_KEY,
//   process.env.FLW_SECRET_KEY
// );

// // Helper function to create order
// const createOrder = async (userId, items, amount, address, paymentMethod) => {
//   const orderData = {
//     userId,
//     items,
//     address,
//     amount,
//     paymentMethod,
//     payment: paymentMethod === 'COD' ? false : undefined, // COD is always unpaid initially
//     date: Date.now(),
//     status: 'Order Received' // Default status
//   };
  
//   const newOrder = new orderModel(orderData);
//   await newOrder.save();
//   return newOrder;
// };

// // Placing orders using COD Method
// const placeOrder = async (req, res) => {
//   try {
//     const { userId, items, amount, address } = req.body;

//     const orderData = {
//       userId,
//       items,
//       address,
//       amount,
//       paymentMethod: "COD",
//       payment: false, // COD is unpaid until delivery
//       date: Date.now(),
//       status: 'Order Received'
//     };

//     const newOrder = new orderModel(orderData);
//     await newOrder.save();

//     await userModel.findByIdAndUpdate(userId, { cartData: {} });

//     res.json({ success: true, message: "Order Placed" });

//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// // Paystack Payment

// // Inside placeOrderPaystack
// const placeOrderPaystack = async (req, res) => {
//   let newOrder;
//   try {
//     const { userId, items, amount, address } = req.body;
//     const { origin } = req.headers;

//     newOrder = await createOrder(
//       userId,
//       items,
//       amount,
//       address,
//       "Paystack"
//     );

//     // Use USD for Paystack as EUR is not supported
//     const paystackCurrency = 'USD';
    
//     // Create payment payload
//     const payload = {
//       email: address.email,
//       amount: Math.round(amount * 100), // convert to cents
//       currency: paystackCurrency,
//       callback_url: `${origin}/verify?success=true&orderId=${newOrder._id}&gateway=paystack`,
//       metadata: {
//         order_id: newOrder._id.toString(),
//         user_id: userId
//       }
//     };

//     // Initialize transaction
//     const response = await paystack.transaction.initialize(payload);
    
//     // Check if response is valid
//     if (!response?.data?.status || !response.data.data?.authorization_url) {
//       const errorMsg = response?.data?.message || 'Paystack service error';
//       console.error('Paystack error:', errorMsg);
//       throw new Error(errorMsg);
//     }

//     res.json({ 
//       success: true, 
//       authorization_url: response.data.data.authorization_url 
//     });

//   } catch (error) {
//     console.log('Paystack order error:', error.message);
    
//     // Attempt to delete the order if creation failed
//     if (newOrder) {
//       try {
//         await orderModel.findByIdAndDelete(newOrder._id);
//       } catch (deleteError) {
//         console.error('Failed to delete order:', deleteError.message);
//       }
//     }
    
//     res.status(500).json({ 
//       success: false, 
//       message: error.message || 'Failed to initialize payment'
//     });
//   }
// };




// const verifyPaystack = async (req, res) => {
//   const { reference, orderId } = req.body;

//   try {
//     if (!reference || !orderId) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Missing reference or orderId' 
//       });
//     }

//     const response = await paystack.transaction.verify(reference);
    
//     // Check if verification was successful
//     if (!response.data.status) {
//       console.error('Paystack verification failed:', response.data.message);
//       throw new Error(response.data.message || 'Payment verification failed');
//     }
    
//     const transaction = response.data.data;
    
//     if (transaction.status === 'success') {
//       await orderModel.findByIdAndUpdate(orderId, { 
//         payment: true,
//         status: 'Order Received'
//       });
      
//       // Get user ID from order to clear cart
//       const order = await orderModel.findById(orderId);
//       if (order && order.userId) {
//         await userModel.findByIdAndUpdate(order.userId, { cartData: {} });
//       }
      
//       res.json({ success: true, message: "Payment Successful" });
//     } else {
//       // Delete order if payment failed
//       await orderModel.findByIdAndDelete(orderId);
//       res.json({ 
//         success: false, 
//         message: `Payment Failed: ${transaction.gateway_response}` 
//       });
//     }
//   } catch (error) {
//     console.error('Verification error:', error);
    
//     // Attempt to delete order on verification failure
//     try {
//       if (orderId) {
//         await orderModel.findByIdAndDelete(orderId);
//       }
//     } catch (deleteError) {
//       console.error('Failed to delete order:', deleteError);
//     }
    
//     res.status(500).json({ 
//       success: false, 
//       message: error.message || 'Payment verification error' 
//     });
//   }
// };










// // Flutterwave Payment
// const placeOrderFlutterwave = async (req, res) => {
//   try {
//     const { userId, items, amount, address } = req.body;
//     const { origin } = req.headers;

//     const newOrder = await createOrder(
//       userId,
//       items,
//       amount,
//       address,
//       "Flutterwave"
//     );

//     const payload = {
//       tx_ref: newOrder._id.toString(),
//       amount: amount,
//       currency: currency,
//       redirect_url: `${origin}/verify?success=true&orderId=${newOrder._id}&gateway=flutterwave`,
//       customer: {
//         email: address.email,
//         phonenumber: address.phone,
//         name: `${address.firstName} ${address.lastName}`
//       },
//       customizations: {
//         title: "Order Payment",
//         description: "Payment for items in cart"
//       },
//       meta: {
//         user_id: userId
//       }
//     };

//     const response = await flw.PaymentLink.create(payload);
//     res.json({ success: true, link: response.data.link });

//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// // Verify Flutterwave
// const verifyFlutterwave = async (req, res) => {
//   const { transaction_id, orderId } = req.body;

//   try {
//     if (!transaction_id || !orderId) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Missing transaction_id or orderId' 
//       });
//     }

//     const response = await flw.Transaction.verify({ id: transaction_id });
    
//     if (response.data.status === 'successful') {
//       await orderModel.findByIdAndUpdate(orderId, { 
//         payment: true,
//         status: 'Order Received' // Reset status after payment
//       });
      
//       // Get user ID from order to clear cart
//       const order = await orderModel.findById(orderId);
//       if (order && order.userId) {
//         await userModel.findByIdAndUpdate(order.userId, { cartData: {} });
//       }
      
//       res.json({ success: true, message: "Payment Successful" });
//     } else {
//       // Delete order if payment failed
//       await orderModel.findByIdAndDelete(orderId);
//       res.json({ success: false, message: 'Payment Failed' });
//     }
//   } catch (error) {
//     console.log(error);
    
//     // Attempt to delete order on verification failure
//     try {
//       await orderModel.findByIdAndDelete(orderId);
//     } catch (deleteError) {
//       console.error('Failed to delete order:', deleteError);
//     }
    
//     res.status(500).json({ 
//       success: false, 
//       message: error.message || 'Payment verification error' 
//     });
//   }
// };

// // All Orders data for Admin Panel
// const allOrders = async (req, res) => {
//   try {
//     const orders = await orderModel.find({})
//       .populate('userId', 'name email') // Populate user info
//       .sort({ date: -1 }); // Newest first
    
//     res.json({ success: true, orders });

//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// // User Order Data For Frontend
// const userOrders = async (req, res) => {
//   try {
//     const { userId } = req.body;
//     const orders = await orderModel.find({ userId }).sort({ date: -1 });
//     res.json({ success: true, orders });

//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// // Update order status from Admin Panel
// const updateStatus = async (req, res) => {
//   try {
//     const { orderId, status } = req.body;
    
//     if (!orderId || !status) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing orderId or status'
//       });
//     }
    
//     // Validate status
//     const validStatuses = [
//       'Order Received',
//       'Preparing',
//       'Ready for Pickup',
//       'Out for Delivery',
//       'Delivered',
//       'Cancelled'
//     ];
    
//     if (!validStatuses.includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid status value'
//       });
//     }
    
//     await orderModel.findByIdAndUpdate(orderId, { status });
//     res.json({ success: true, message: 'Status Updated' });

//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// };

// // Update payment status
// const updatePaymentStatus = async (req, res) => {
//   try {
//     const { orderId, payment } = req.body;
    
//     if (!orderId || payment === undefined) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing orderId or payment status'
//       });
//     }
    
//     await orderModel.findByIdAndUpdate(orderId, { payment });
//     res.json({ success: true, message: 'Payment status updated' });

//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// };

// // Delete pending order (for failed payments)
// const deleteOrder = async (req, res) => {
//   try {
//     const { orderId } = req.params;
    
//     if (!orderId) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing order ID'
//       });
//     }
    
//     const order = await orderModel.findByIdAndDelete(orderId);
    
//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: 'Order not found'
//       });
//     }
    
//     res.json({ success: true, message: 'Order deleted' });
    
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// };

// export {
//   placeOrder,
//   placeOrderPaystack,
//   placeOrderFlutterwave,
//   verifyPaystack,
//   verifyFlutterwave,
//   allOrders,
//   userOrders,
//   updateStatus,
//   updatePaymentStatus, // Add this export
//   deleteOrder
// };
























// import orderModel from "../models/orderModel.js";
// import userModel from "../models/userModel.js";
// import Paystack from 'paystack';
// import Flutterwave from 'flutterwave-node-v3';

// // Global variables
// const currency = 'EUR';
// const deliveryCharge = 1.5;

// // Initialize payment gateways
// const paystack = Paystack(process.env.PAYSTACK_SECRET_KEY);
// const flw = new Flutterwave(
//   process.env.FLW_PUBLIC_KEY,
//   process.env.FLW_SECRET_KEY
// );

// // Helper function to create order
// const createOrder = async (userId, items, amount, address, paymentMethod) => {
//   const orderData = {
//     userId,
//     items,
//     address,
//     amount,
//     paymentMethod,
//     payment: paymentMethod === 'COD' ? false : undefined, // COD is always unpaid initially
//     date: Date.now(),
//     status: 'Order Received' // Default status
//   };
  
//   const newOrder = new orderModel(orderData);
//   await newOrder.save();
//   return newOrder;
// };

// // Placing orders using COD Method
// const placeOrder = async (req, res) => {
//   try {
//     const { userId, items, amount, address } = req.body;

//     const orderData = {
//       userId,
//       items,
//       address,
//       amount,
//       paymentMethod: "COD",
//       payment: false, // COD is unpaid until delivery
//       date: Date.now(),
//       status: 'Order Received'
//     };

//     const newOrder = new orderModel(orderData);
//     await newOrder.save();

//     await userModel.findByIdAndUpdate(userId, { cartData: {} });

//     res.json({ success: true, message: "Order Placed" });

//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// // Paystack Payment
// const placeOrderPaystack = async (req, res) => {
//   try {
//     const { userId, items, amount, address } = req.body;
//     const { origin } = req.headers;

//     const newOrder = await createOrder(
//       userId,
//       items,
//       amount,
//       address,
//       "Paystack"
//     );

//     const response = await paystack.transaction.initialize({
//       email: address.email,
//       amount: amount * 100, // convert to kobo/cent
//       currency: currency,
//       callback_url: `${origin}/verify?success=true&orderId=${newOrder._id}&gateway=paystack`,
//       metadata: {
//         order_id: newOrder._id.toString(),
//         user_id: userId
//       }
//     });

//     res.json({ 
//       success: true, 
//       authorization_url: response.data.authorization_url 
//     });

//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// // Verify Paystack
// const verifyPaystack = async (req, res) => {
//   const { reference, orderId } = req.body;

//   try {
//     if (!reference || !orderId) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Missing reference or orderId' 
//       });
//     }

//     const response = await paystack.transaction.verify(reference);
    
//     if (response.data.status === 'success') {
//       await orderModel.findByIdAndUpdate(orderId, { 
//         payment: true,
//         status: 'Order Received' // Reset status after payment
//       });
      
//       // Get user ID from order to clear cart
//       const order = await orderModel.findById(orderId);
//       if (order && order.userId) {
//         await userModel.findByIdAndUpdate(order.userId, { cartData: {} });
//       }
      
//       res.json({ success: true, message: "Payment Successful" });
//     } else {
//       // Delete order if payment failed
//       await orderModel.findByIdAndDelete(orderId);
//       res.json({ success: false, message: 'Payment Failed' });
//     }
//   } catch (error) {
//     console.log(error);
    
//     // Attempt to delete order on verification failure
//     try {
//       await orderModel.findByIdAndDelete(orderId);
//     } catch (deleteError) {
//       console.error('Failed to delete order:', deleteError);
//     }
    
//     res.status(500).json({ 
//       success: false, 
//       message: error.message || 'Payment verification error' 
//     });
//   }
// };

// // Flutterwave Payment
// const placeOrderFlutterwave = async (req, res) => {
//   try {
//     const { userId, items, amount, address } = req.body;
//     const { origin } = req.headers;

//     const newOrder = await createOrder(
//       userId,
//       items,
//       amount,
//       address,
//       "Flutterwave"
//     );

//     const payload = {
//       tx_ref: newOrder._id.toString(),
//       amount: amount,
//       currency: currency,
//       redirect_url: `${origin}/verify?success=true&orderId=${newOrder._id}&gateway=flutterwave`,
//       customer: {
//         email: address.email,
//         phonenumber: address.phone,
//         name: `${address.firstName} ${address.lastName}`
//       },
//       customizations: {
//         title: "Order Payment",
//         description: "Payment for items in cart"
//       },
//       meta: {
//         user_id: userId
//       }
//     };

//     const response = await flw.PaymentLink.create(payload);
//     res.json({ success: true, link: response.data.link });

//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// // Verify Flutterwave
// const verifyFlutterwave = async (req, res) => {
//   const { transaction_id, orderId } = req.body;

//   try {
//     if (!transaction_id || !orderId) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Missing transaction_id or orderId' 
//       });
//     }

//     const response = await flw.Transaction.verify({ id: transaction_id });
    
//     if (response.data.status === 'successful') {
//       await orderModel.findByIdAndUpdate(orderId, { 
//         payment: true,
//         status: 'Order Received' // Reset status after payment
//       });
      
//       // Get user ID from order to clear cart
//       const order = await orderModel.findById(orderId);
//       if (order && order.userId) {
//         await userModel.findByIdAndUpdate(order.userId, { cartData: {} });
//       }
      
//       res.json({ success: true, message: "Payment Successful" });
//     } else {
//       // Delete order if payment failed
//       await orderModel.findByIdAndDelete(orderId);
//       res.json({ success: false, message: 'Payment Failed' });
//     }
//   } catch (error) {
//     console.log(error);
    
//     // Attempt to delete order on verification failure
//     try {
//       await orderModel.findByIdAndDelete(orderId);
//     } catch (deleteError) {
//       console.error('Failed to delete order:', deleteError);
//     }
    
//     res.status(500).json({ 
//       success: false, 
//       message: error.message || 'Payment verification error' 
//     });
//   }
// };

// // All Orders data for Admin Panel
// const allOrders = async (req, res) => {
//   try {
//     const orders = await orderModel.find({})
//       .populate('userId', 'name email') // Populate user info
//       .sort({ date: -1 }); // Newest first
    
//     res.json({ success: true, orders });

//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// // User Order Data For Frontend
// const userOrders = async (req, res) => {
//   try {
//     const { userId } = req.body;
//     const orders = await orderModel.find({ userId }).sort({ date: -1 });
//     res.json({ success: true, orders });

//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// // Update order status from Admin Panel
// const updateStatus = async (req, res) => {
//   try {
//     const { orderId, status } = req.body;
    
//     if (!orderId || !status) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing orderId or status'
//       });
//     }
    
//     // Validate status
//     const validStatuses = [
//       'Order Received',
//       'Preparing',
//       'Ready for Pickup',
//       'Out for Delivery',
//       'Delivered',
//       'Cancelled'
//     ];
    
//     if (!validStatuses.includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid status value'
//       });
//     }
    
//     await orderModel.findByIdAndUpdate(orderId, { status });
//     res.json({ success: true, message: 'Status Updated' });

//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// };

// // Update payment status
// const updatePaymentStatus = async (req, res) => {
//   try {
//     const { orderId, payment } = req.body;
    
//     if (!orderId || payment === undefined) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing orderId or payment status'
//       });
//     }
    
//     await orderModel.findByIdAndUpdate(orderId, { payment });
//     res.json({ success: true, message: 'Payment status updated' });

//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// };

// // Delete pending order (for failed payments)
// const deleteOrder = async (req, res) => {
//   try {
//     const { orderId } = req.params;
    
//     if (!orderId) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing order ID'
//       });
//     }
    
//     const order = await orderModel.findByIdAndDelete(orderId);
    
//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: 'Order not found'
//       });
//     }
    
//     res.json({ success: true, message: 'Order deleted' });
    
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// };

// export {
//   placeOrder,
//   placeOrderPaystack,
//   placeOrderFlutterwave,
//   verifyPaystack,
//   verifyFlutterwave,
//   allOrders,
//   userOrders,
//   updateStatus,
//   updatePaymentStatus, // Add this export
//   deleteOrder
// };



