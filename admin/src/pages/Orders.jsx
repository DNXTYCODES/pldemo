import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';
import { FaCheck, FaTimes, FaSync, FaTrash, FaInfoCircle } from 'react-icons/fa';

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Restaurant-specific delivery statuses
  const restaurantStatuses = [
    'Order Received',
    'Preparing',
    'Ready for Pickup',
    'Out for Delivery',
    'Delivered',
    'Cancelled'
  ];

  const fetchAllOrders = async () => {
    if (!token) return;
    setLoading(true);
    
    try {
      const response = await axios.post(
        backendUrl + '/api/order/list', 
        {}, 
        { headers: { token } }
      );
      
      if (response.data.success) {
        setOrders(response.data.orders.reverse());
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const statusHandler = async (status, orderId) => {
    setUpdating(orderId);
    try {
      const response = await axios.post(
        backendUrl + '/api/order/status', 
        { orderId, status }, 
        { headers: { token } }
      );
      
      if (response.data.success) {
        await fetchAllOrders();
        toast.success('Order status updated');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setUpdating(null);
    }
  };

  const paymentStatusHandler = async (orderId, paymentStatus) => {
    setUpdating(orderId);
    try {
      const response = await axios.post(
        backendUrl + '/api/order/payment-status', 
        { orderId, payment: paymentStatus }, 
        { headers: { token } }
      );
      
      if (response.data.success) {
        await fetchAllOrders();
        toast.success(`Payment marked as ${paymentStatus ? 'Paid' : 'Pending'}`);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setUpdating(null);
    }
  };

  const deleteOrderHandler = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    
    setUpdating(orderId);
    try {
      const response = await axios.delete(
        backendUrl + '/api/order/' + orderId, 
        { headers: { token } }
      );
      
      if (response.data.success) {
        await fetchAllOrders();
        toast.success('Order deleted successfully');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setUpdating(null);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [token]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'order received':
        return 'bg-blue-500';
      case 'preparing':
        return 'bg-yellow-500';
      case 'ready for pickup':
        return 'bg-purple-500';
      case 'out for delivery':
        return 'bg-orange-500';
      case 'delivered':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const toggleOrderDetails = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          <p className="mt-3 text-lg">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Order Management</h2>
        <div className="flex gap-3">
          <button
            onClick={fetchAllOrders}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            <FaSync /> Refresh Orders
          </button>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-100 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <img 
              src={assets.order_icon} 
              className="w-12 opacity-70" 
              alt="No orders" 
            />
          </div>
          <h3 className="text-2xl text-gray-700 mb-2">
            No Orders Found
          </h3>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            There are currently no orders to display
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div 
              key={order._id} 
              className="border rounded-lg p-4 bg-white shadow-sm transition-all"
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg truncate">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </h3>
                    <span className={`min-w-2 h-2 rounded-full ${getStatusColor(order.status)}`}></span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(order.date).toLocaleString()}
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => toggleOrderDetails(order._id)}
                    className="flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                  >
                    <FaInfoCircle />
                    {expandedOrder === order._id ? 'Hide Details' : 'View Details'}
                  </button>
                  
                  <button
                    onClick={() => deleteOrderHandler(order._id)}
                    disabled={updating === order._id}
                    className="flex items-center gap-1 px-3 py-1 bg-red-100 hover:bg-red-500 hover:text-white rounded text-sm disabled:opacity-50"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
              
              <div className="mt-4 flex flex-wrap gap-4">
                <div className="flex items-center">
                  <span className={`min-w-2 h-2 rounded-full ${order.payment ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <p className="ml-2 font-medium">
                    Payment: {order.payment ? 'Paid' : 'Pending'}
                  </p>
                </div>
                
                <p className="font-medium">
                  Method: <span className="capitalize">{order.paymentMethod}</span>
                </p>
                
                <p className="font-medium">
                  Total: <span className="text-green-700">{currency}{order.amount.toFixed(2)}</span>
                </p>
              </div>
              
              {expandedOrder === order._id && (
                <div className="mt-5 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <h4 className="font-medium mb-2">Customer Information</h4>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="font-semibold">{order.address?.firstName} {order.address?.lastName}</p>
                        <p className="mt-1">📱 {order.address?.phone}</p>
                        <p>📧 {order.address?.email}</p>
                        
                        {order.userId && (
                          <p className="mt-2 text-sm">
                            User ID: <span className="font-mono text-gray-500">{order.userId?._id || 'N/A'}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Delivery Address</h4>
                      <div className="bg-gray-50 p-3 rounded">
                        <p>{order.address?.street}</p>
                        <p>{order.address?.city}, {order.address?.state}</p>
                        <p>{order.address?.zipcode}, {order.address?.country}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Order Items</h4>
                    <div className="space-y-3">
                      {order.items.map((item, index) => {
                        // Generate variation description
                        let variationDesc = "";
                        if (item.variations?.base) variationDesc += `Base: ${item.variations.base}, `;
                        if (item.variations?.side) variationDesc += `Side: ${item.variations.side}, `;
                        if (item.variations?.size) variationDesc += `Size: ${item.variations.size}, `;
                        if (item.variations?.wrap) variationDesc += `Wrap: Yes, `;
                        variationDesc = variationDesc.replace(/,\s*$/, "");
                        
                        return (
                          <div key={index} className="flex items-start gap-4 p-3 border rounded-lg">
                            <div className="bg-gray-100 p-2 rounded flex-shrink-0">
                              <img 
                                className="w-16 h-16 object-contain rounded" 
                                src={item.image?.[0] || assets.parcel_icon} 
                                alt={item.name} 
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{item.name}</p>
                              {variationDesc && (
                                <p className="text-sm text-gray-500 mt-1">{variationDesc}</p>
                              )}
                            </div>
                            <div className="flex flex-col items-end">
                              <p className="font-medium">{currency}{item.price.toFixed(2)}</p>
                              <p className="text-gray-500">x {item.quantity}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <h4 className="font-medium mb-2">Delivery Status</h4>
                      <div className="flex flex-col gap-3">
                        <select
                          value={order.status}
                          onChange={(e) => statusHandler(e.target.value, order._id)}
                          disabled={updating === order._id}
                          className="w-full p-2 border rounded bg-white disabled:bg-gray-100"
                        >
                          {restaurantStatuses.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                        
                        <div className="flex gap-2">
                          {restaurantStatuses.map(status => (
                            <button
                              key={status}
                              onClick={() => statusHandler(status, order._id)}
                              disabled={updating === order._id || order.status === status}
                              className={`flex-1 py-1 px-2 text-xs rounded ${
                                order.status === status 
                                  ? 'bg-blue-500 text-white' 
                                  : 'bg-gray-100 hover:bg-gray-200'
                              } disabled:opacity-50`}
                            >
                              {status.split(' ')[0]}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Payment Status</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => paymentStatusHandler(order._id, true)}
                          disabled={order.payment || updating === order._id}
                          className={`py-2 px-3 rounded flex items-center justify-center gap-2 ${
                            order.payment 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800 hover:bg-green-500 hover:text-white'
                          } disabled:opacity-50`}
                        >
                          <FaCheck /> Mark Paid
                        </button>
                        
                        <button
                          onClick={() => paymentStatusHandler(order._id, false)}
                          disabled={!order.payment || updating === order._id}
                          className={`py-2 px-3 rounded flex items-center justify-center gap-2 ${
                            !order.payment 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-gray-100 text-gray-800 hover:bg-red-500 hover:text-white'
                          } disabled:opacity-50`}
                        >
                          <FaTimes /> Mark Unpaid
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;


















// import React, { useEffect, useState } from 'react'
// import axios from 'axios'
// import { backendUrl, currency } from '../App'
// import { toast } from 'react-toastify'
// import { assets } from '../assets/assets'
// import { FaCheck, FaTimes, FaSync } from 'react-icons/fa'

// const Orders = ({ token }) => {
//   const [orders, setOrders] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [updating, setUpdating] = useState(null)

//   const restaurantStatuses = [
//     'Order Received',
//     'Preparing',
//     'Ready for Pickup',
//     'Out for Delivery',
//     'Delivered',
//     'Cancelled'
//   ]

//   const fetchAllOrders = async () => {
//     if (!token) return
//     setLoading(true)
    
//     try {
//       const response = await axios.post(
//         backendUrl + '/api/order/list', 
//         {}, 
//         { headers: { token } }
//       )
      
//       if (response.data.success) {
//         setOrders(response.data.orders.reverse())
//       } else {
//         toast.error(response.data.message)
//       }
//     } catch (error) {
//       toast.error(error.message)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const statusHandler = async (event, orderId) => {
//     setUpdating(orderId)
//     try {
//       const response = await axios.post(
//         backendUrl + '/api/order/status', 
//         { orderId, status: event.target.value }, 
//         { headers: { token } }
//       )
      
//       if (response.data.success) {
//         await fetchAllOrders()
//         toast.success('Order status updated')
//       } else {
//         toast.error(response.data.message)
//       }
//     } catch (error) {
//       console.log(error)
//       toast.error(error.response?.data?.message || error.message)
//     } finally {
//       setUpdating(null)
//     }
//   }

//   const paymentStatusHandler = async (orderId, paymentStatus) => {
//     setUpdating(orderId)
//     try {
//       const response = await axios.post(
//         backendUrl + '/api/order/payment-status', 
//         { orderId, payment: paymentStatus }, 
//         { headers: { token } }
//       )
      
//       if (response.data.success) {
//         await fetchAllOrders()
//         toast.success(`Payment marked as ${paymentStatus ? 'Paid' : 'Pending'}`)
//       } else {
//         toast.error(response.data.message)
//       }
//     } catch (error) {
//       console.log(error)
//       toast.error(error.response?.data?.message || error.message)
//     } finally {
//       setUpdating(null)
//     }
//   }

//   useEffect(() => {
//     fetchAllOrders()
//   }, [token])

//   const getStatusColor = (status) => {
//     switch (status.toLowerCase()) {
//       case 'order received':
//         return 'bg-blue-500';
//       case 'preparing':
//         return 'bg-yellow-500';
//       case 'ready for pickup':
//         return 'bg-purple-500';
//       case 'out for delivery':
//         return 'bg-orange-500';
//       case 'delivered':
//         return 'bg-green-500';
//       case 'cancelled':
//         return 'bg-red-500';
//       default:
//         return 'bg-gray-500';
//     }
//   }

//   if (loading) {
//     return (
//       <div className="flex justify-center py-20">
//         <div className="text-center">
//           <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
//           <p className="mt-3 text-lg">Loading orders...</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="p-4">
//       <div className="flex justify-between items-center mb-6">
//         <h2 className="text-2xl font-bold text-gray-800">Order Management</h2>
//         <button
//           onClick={fetchAllOrders}
//           className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
//         >
//           <FaSync /> Refresh Orders
//         </button>
//       </div>

//       {orders.length === 0 ? (
//         <div className="text-center py-12">
//           <div className="bg-gray-100 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
//             <img 
//               src={assets.order_icon} 
//               className="w-12 opacity-70" 
//               alt="No orders" 
//             />
//           </div>
//           <h3 className="text-2xl text-gray-700 mb-2">
//             No Orders Found
//           </h3>
//           <p className="text-gray-600 max-w-md mx-auto mb-6">
//             There are currently no orders to display
//           </p>
//         </div>
//       ) : (
//         <div className="space-y-4">
//           {orders.map((order) => (
//             <div 
//               key={order._id} 
//               className="border rounded-lg p-4 bg-white shadow-sm"
//             >
//               <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 pb-3 border-b">
//                 <div className="mb-3 md:mb-0">
//                   <p className="font-medium">
//                     Order ID: <span className="text-gray-500 font-mono">{order._id.slice(-8)}</span>
//                   </p>
//                   <p className="text-sm mt-1">
//                     Date: <span className="text-gray-500">{new Date(order.date).toLocaleString()}</span>
//                   </p>
//                 </div>
                
//                 <div className="flex flex-wrap gap-4">
//                   <div className="flex items-center gap-2">
//                     <span className={`min-w-2 h-2 rounded-full ${getStatusColor(order.status)}`}></span>
//                     <p className='text-sm md:text-base font-medium capitalize'>{order.status.toLowerCase()}</p>
//                   </div>
                  
//                   <div className="flex items-center gap-2">
//                     <span className={`min-w-2 h-2 rounded-full ${order.payment ? 'bg-green-500' : 'bg-red-500'}`}></span>
//                     <p className='text-sm md:text-base font-medium'>
//                       Payment: {order.payment ? 'Paid' : 'Pending'}
//                     </p>
//                   </div>
//                 </div>
//               </div>
              
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
//                 <div>
//                   <h3 className="font-medium mb-2">Delivery Address:</h3>
//                   <div className="text-sm bg-gray-50 p-3 rounded">
//                     <p>{order.address?.firstName} {order.address?.lastName}</p>
//                     <p>{order.address?.street}</p>
//                     <p>{order.address?.city}, {order.address?.state} {order.address?.zipcode}</p>
//                     <p>{order.address?.country}</p>
//                     <p className="mt-1">📱 {order.address?.phone}</p>
//                     <p>📧 {order.address?.email}</p>
//                   </div>
//                 </div>
                
//                 <div>
//                   <h3 className="font-medium mb-2">Order Details:</h3>
//                   <div className="text-sm bg-gray-50 p-3 rounded">
//                     <p>Method: <span className="capitalize">{order.paymentMethod}</span></p>
//                     <p className="mt-2">Items: {order.items.length}</p>
//                     <p className="font-bold mt-2">Total: {currency}{order.amount.toFixed(2)}</p>
//                   </div>
//                 </div>
                
//                 <div>
//                   <h3 className="font-medium mb-2">Manage Order:</h3>
//                   <div className="grid grid-cols-2 gap-3">
//                     <div>
//                       <label className="block text-sm font-medium mb-1">Delivery Status:</label>
//                       <select
//                         onChange={(e) => statusHandler(e, order._id)}
//                         value={order.status}
//                         disabled={updating === order._id}
//                         className="w-full p-2 border rounded bg-white disabled:bg-gray-100"
//                       >
//                         {restaurantStatuses.map(status => (
//                           <option key={status} value={status}>{status}</option>
//                         ))}
//                       </select>
//                     </div>
                    
//                     <div>
//                       <label className="block text-sm font-medium mb-1">Payment Status:</label>
//                       <div className="flex gap-2">
//                         <button
//                           onClick={() => paymentStatusHandler(order._id, true)}
//                           disabled={order.payment || updating === order._id}
//                           className={`flex-1 py-2 px-3 rounded flex items-center justify-center gap-1 ${
//                             order.payment 
//                               ? 'bg-green-100 text-green-800' 
//                               : 'bg-gray-200 text-gray-800 hover:bg-green-500 hover:text-white'
//                           } disabled:opacity-50`}
//                         >
//                           <FaCheck /> Paid
//                         </button>
                        
//                         <button
//                           onClick={() => paymentStatusHandler(order._id, false)}
//                           disabled={!order.payment || updating === order._id}
//                           className={`flex-1 py-2 px-3 rounded flex items-center justify-center gap-1 ${
//                             !order.payment 
//                               ? 'bg-red-100 text-red-800' 
//                               : 'bg-gray-200 text-gray-800 hover:bg-red-500 hover:text-white'
//                           } disabled:opacity-50`}
//                         >
//                           <FaTimes /> Unpaid
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
              
//               <div className="border-t pt-3">
//                 <h3 className="font-medium mb-2">Order Items:</h3>
//                 <div className="space-y-3">
//                   {order.items.map((item, index) => {
//                     // Generate variation description
//                     let variationDesc = "";
//                     if (item.variations?.base) variationDesc += `Base: ${item.variations.base}, `;
//                     if (item.variations?.side) variationDesc += `Side: ${item.variations.side}, `;
//                     if (item.variations?.size) variationDesc += `Size: ${item.variations.size}, `;
//                     if (item.variations?.wrap) variationDesc += `Wrap: Yes, `;
//                     variationDesc = variationDesc.replace(/,\s*$/, "");
                    
//                     return (
//                       <div key={index} className="flex items-start gap-3 p-2 border rounded">
//                         <div className="bg-gray-100 p-1 rounded">
//                           <img 
//                             className="w-12 h-12 object-cover rounded" 
//                             src={assets.parcel_icon} 
//                             alt="Item" 
//                           />
//                         </div>
//                         <div className="flex-1">
//                           <p className="font-medium">{item.name}</p>
//                           {variationDesc && (
//                             <p className="text-xs text-gray-500">{variationDesc}</p>
//                           )}
//                           <div className="flex justify-between mt-1">
//                             <p>Quantity: {item.quantity}</p>
//                             <p className="font-medium">{currency}{item.price.toFixed(2)}</p>
//                           </div>
//                         </div>
//                       </div>
//                     )
//                   })}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }

// export default Orders
























// import React from 'react'
// import { useEffect } from 'react'
// import { useState } from 'react'
// import axios from 'axios'
// import { backendUrl, currency } from '../App'
// import { toast } from 'react-toastify'
// import { assets } from '../assets/assets'

// const Orders = ({ token }) => {

//   const [orders, setOrders] = useState([])

//   const fetchAllOrders = async () => {

//     if (!token) {
//       return null;
//     }

//     try {

//       const response = await axios.post(backendUrl + '/api/order/list', {}, { headers: { token } })
//       if (response.data.success) {
//         setOrders(response.data.orders.reverse())
//       } else {
//         toast.error(response.data.message)
//       }

//     } catch (error) {
//       toast.error(error.message)
//     }


//   }

//   const statusHandler = async ( event, orderId ) => {
//     try {
//       const response = await axios.post(backendUrl + '/api/order/status' , {orderId, status:event.target.value}, { headers: {token}})
//       if (response.data.success) {
//         await fetchAllOrders()
//       }
//     } catch (error) {
//       console.log(error)
//       toast.error(response.data.message)
//     }
//   }

//   useEffect(() => {
//     fetchAllOrders();
//   }, [token])

//   return (
//     <div>
//       <h3>Order Page</h3>
//       <div>
//         {
//           orders.map((order, index) => (
//             <div className='grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start border-2 border-gray-200 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700' key={index}>
//               <img className='w-12' src={assets.parcel_icon} alt="" />
//               <div>
//                 <div>
//                   {order.items.map((item, index) => {
//                     // Generate variation description
//                     let variationDesc = "";
//                     if (item.variations?.base) variationDesc += `Base: ${item.variations.base}, `;
//                     if (item.variations?.side) variationDesc += `Side: ${item.variations.side}, `;
//                     if (item.variations?.size) variationDesc += `Size: ${item.variations.size}, `;
//                     if (item.variations?.wrap) variationDesc += `Wrap: Yes, `;
//                     variationDesc = variationDesc.replace(/,\s*$/, "");
                    
//                     return (
//                       <div className='py-0.5' key={index}>
//                         <p>{item.name} x {item.quantity}</p>
//                         {variationDesc && <p className="text-xs text-gray-500">{variationDesc}</p>}
//                       </div>
//                     )
//                   })}
//                 </div>
//                 <p className='mt-3 mb-2 font-medium'>{order.address.firstName + " " + order.address.lastName}</p>
//                 <div>
//                   <p>{order.address.street + ","}</p>
//                   <p>{order.address.city + ", " + order.address.state + ", " + order.address.country + ", " + order.address.zipcode}</p>
//                 </div>
//                 <p>{order.address.phone}</p>
//               </div>
//               <div>
//                 <p className='text-sm sm:text-[15px]'>Items : {order.items.length}</p>
//                 <p className='mt-3'>Method : {order.paymentMethod}</p>
//                 <p>Payment : { order.payment ? 'Done' : 'Pending' }</p>
//                 <p>Date : {new Date(order.date).toLocaleDateString()}</p>
//               </div>
//               <p className='text-sm sm:text-[15px]'>{currency}{order.amount}</p>
//               <select onChange={(event)=>statusHandler(event,order._id)} value={order.status} className='p-2 font-semibold'>
//                 <option value="Order Placed">Order Placed</option>
//                 <option value="Packing">Packing</option>
//                 <option value="Shipped">Shipped</option>
//                 <option value="Out for delivery">Out for delivery</option>
//                 <option value="Delivered">Delivered</option>
//               </select>
//             </div>
//           ))
//         }
//       </div>
//     </div>
//   )
// }

// export default Orders;

















// import React from 'react'
// import { useEffect } from 'react'
// import { useState } from 'react'
// import axios from 'axios'
// import { backendUrl, currency } from '../App'
// import { toast } from 'react-toastify'
// import { assets } from '../assets/assets'

// const Orders = ({ token }) => {

//   const [orders, setOrders] = useState([])

//   const fetchAllOrders = async () => {

//     if (!token) {
//       return null;
//     }

//     try {

//       const response = await axios.post(backendUrl + '/api/order/list', {}, { headers: { token } })
//       if (response.data.success) {
//         setOrders(response.data.orders.reverse())
//       } else {
//         toast.error(response.data.message)
//       }

//     } catch (error) {
//       toast.error(error.message)
//     }


//   }

//   const statusHandler = async ( event, orderId ) => {
//     try {
//       const response = await axios.post(backendUrl + '/api/order/status' , {orderId, status:event.target.value}, { headers: {token}})
//       if (response.data.success) {
//         await fetchAllOrders()
//       }
//     } catch (error) {
//       console.log(error)
//       toast.error(response.data.message)
//     }
//   }

//   useEffect(() => {
//     fetchAllOrders();
//   }, [token])

//   return (
//     <div>
//       <h3>Order Page</h3>
//       <div>
//         {
//           orders.map((order, index) => (
//             <div className='grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start border-2 border-gray-200 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700' key={index}>
//               <img className='w-12' src={assets.parcel_icon} alt="" />
//               <div>
//                 <div>
//                   {order.items.map((item, index) => {
//                     if (index === order.items.length - 1) {
//                       return <p className='py-0.5' key={index}> {item.name} x {item.quantity} <span> {item.size} </span> </p>
//                     }
//                     else {
//                       return <p className='py-0.5' key={index}> {item.name} x {item.quantity} <span> {item.size} </span> ,</p>
//                     }
//                   })}
//                 </div>
//                 <p className='mt-3 mb-2 font-medium'>{order.address.firstName + " " + order.address.lastName}</p>
//                 <div>
//                   <p>{order.address.street + ","}</p>
//                   <p>{order.address.city + ", " + order.address.state + ", " + order.address.country + ", " + order.address.zipcode}</p>
//                 </div>
//                 <p>{order.address.phone}</p>
//               </div>
//               <div>
//                 <p className='text-sm sm:text-[15px]'>Items : {order.items.length}</p>
//                 <p className='mt-3'>Method : {order.paymentMethod}</p>
//                 <p>Payment : { order.payment ? 'Done' : 'Pending' }</p>
//                 <p>Date : {new Date(order.date).toLocaleDateString()}</p>
//               </div>
//               <p className='text-sm sm:text-[15px]'>{currency}{order.amount}</p>
//               <select onChange={(event)=>statusHandler(event,order._id)} value={order.status} className='p-2 font-semibold'>
//                 <option value="Order Placed">Order Placed</option>
//                 <option value="Packing">Packing</option>
//                 <option value="Shipped">Shipped</option>
//                 <option value="Out for delivery">Out for delivery</option>
//                 <option value="Delivered">Delivered</option>
//               </select>
//             </div>
//           ))
//         }
//       </div>
//     </div>
//   )
// }

// export default Orders