import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import { assets } from '../assets/assets';
import CartTotal from '../components/CartTotal';

const Cart = () => {
  const { products, currency, cartItems, updateQuantity, navigate } = useContext(ShopContext);
  const [cartData, setCartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (products.length > 0) {
      const tempData = Object.entries(cartItems)
        .map(([cartItemKey, cartItem]) => {
          const productData = products.find(p => p._id === cartItem.productId);
          
          // Calculate price based on variations
          let price = productData?.basePrice || 0;
          
          if (cartItem.variations?.wrap && productData?.variations?.wrap?.available) {
            price = productData.variations.wrap.price;
          } 
          else if (cartItem.variations?.size) {
            const sizeObj = productData?.variations?.sizes?.find(s => s.size === cartItem.variations.size);
            if (sizeObj) price = sizeObj.price;
          }
          
          // Generate variation description
          let variationDesc = "";
          if (cartItem.variations?.base) variationDesc += `Base: ${cartItem.variations.base}, `;
          if (cartItem.variations?.side) variationDesc += `Side: ${cartItem.variations.side}, `;
          if (cartItem.variations?.size) variationDesc += `Size: ${cartItem.variations.size}, `;
          if (cartItem.variations?.wrap) variationDesc += `Wrap: Yes, `;
          variationDesc = variationDesc.replace(/,\s*$/, "");
          
          return {
            cartItemKey,
            quantity: cartItem.quantity,
            name: productData?.name || "Unknown Product",
            price,
            image: productData?.image || [assets.placeholder],
            variationDesc
          };
        })
        .filter(item => item.quantity > 0);
      
      setCartData(tempData);
      setLoading(false);
    }
  }, [cartItems, products]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#008753]"></div>
      </div>
    );
  }

  return (
    <div className='border-t pt-14'>
      <div className='text-2xl mb-3'>
        <Title text1={'YOUR'} text2={'CART'} />
      </div>

      {cartData.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-[#008753]/10 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <img 
              src={assets.cart_icon} 
              className="w-12 opacity-70" 
              alt="Empty cart" 
            />
          </div>
          <h3 className="prata-regular text-2xl text-[#008753] mb-2">
            Your Cart is Empty
          </h3>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            Add some delicious meals to your cart!
          </p>
          <button
            onClick={() => navigate('/menu')}
            className="px-6 py-2 bg-[#008753] text-white rounded-lg hover:bg-[#006641] transition-colors"
          >
            Browse Menu
          </button>
        </div>
      ) : (
        <>
          <div>
            {cartData.map((item, index) => (
              <div
                key={index}
                className='py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4'
              >
                <div className='flex items-start gap-6'>
                  <img className='w-16 sm:w-20' src={item.image[0]} alt={item.name} />
                  <div>
                    <p className='text-xs sm:text-lg font-medium'>{item.name}</p>
                    {item.variationDesc && (
                      <p className="text-xs text-gray-500 mt-1">{item.variationDesc}</p>
                    )}
                    <p className='mt-2'>{currency}{item.price}</p>
                  </div>
                </div>
                <input
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    if (value > 0) {
                      updateQuantity(item.cartItemKey, value);
                    }
                  }}
                  className='border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1'
                  type="number"
                  min={1}
                  value={item.quantity}
                />
                <img
                  onClick={() => updateQuantity(item.cartItemKey, 0)}
                  className='w-4 mr-4 sm:w-5 cursor-pointer'
                  src={assets.bin_icon}
                  alt="Remove"
                />
              </div>
            ))}
          </div>

          <div className='flex justify-end my-20'>
            <div className='w-full sm:w-[450px]'>
              <CartTotal />
              <div className='w-full text-end'>
                <button
                  onClick={() => navigate('/place-order')}
                  className='border border-white text-white px-8 py-4 text-sm hover:bg-black hover:text-white transition-all duration-500 bg-[#008753]'
                >
                  PROCEED TO CHECKOUT
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;

























// import React, { useContext, useEffect, useState } from 'react';
// import { ShopContext } from '../context/ShopContext';
// import Title from '../components/Title';
// import { assets } from '../assets/assets';
// import CartTotal from '../components/CartTotal';

// const Cart = () => {
//   const { products, currency, cartItems, updateQuantity, navigate } = useContext(ShopContext);
//   const [cartData, setCartData] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (products.length > 0) {
//       const tempData = Object.entries(cartItems)
//         .map(([itemId, quantity]) => {
//           const productData = products.find(p => p._id === itemId);
//           return {
//             _id: itemId,
//             quantity,
//             name: productData?.name || "Unknown Product",
//             price: productData?.price || 0,
//             image: productData?.image || [assets.placeholder]
//           };
//         })
//         .filter(item => item.quantity > 0);
      
//       setCartData(tempData);
//       setLoading(false);
//     }
//   }, [cartItems, products]);

//   if (loading) {
//     return (
//       <div className="flex justify-center py-20">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#008753]"></div>
//       </div>
//     );
//   }

//   return (
//     <div className='border-t pt-14'>
//       <div className='text-2xl mb-3'>
//         <Title text1={'YOUR'} text2={'CART'} />
//       </div>

//       {cartData.length === 0 ? (
//         <div className="text-center py-12">
//           <div className="bg-[#008753]/10 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
//             <img 
//               src={assets.cart_icon} 
//               className="w-12 opacity-70" 
//               alt="Empty cart" 
//             />
//           </div>
//           <h3 className="prata-regular text-2xl text-[#008753] mb-2">
//             Your Cart is Empty
//           </h3>
//           <p className="text-gray-600 max-w-md mx-auto mb-6">
//             Add some delicious meals to your cart!
//           </p>
//           <button
//             onClick={() => navigate('/menu')}
//             className="px-6 py-2 bg-[#008753] text-white rounded-lg hover:bg-[#006641] transition-colors"
//           >
//             Browse Menu
//           </button>
//         </div>
//       ) : (
//         <>
//           <div>
//             {cartData.map((item, index) => (
//               <div
//                 key={index}
//                 className='py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4'
//               >
//                 <div className='flex items-start gap-6'>
//                   <img className='w-16 sm:w-20' src={item.image[0]} alt={item.name} />
//                   <div>
//                     <p className='text-xs sm:text-lg font-medium'>{item.name}</p>
//                     <p className='mt-2'>{currency}{item.price}</p>
//                   </div>
//                 </div>
//                 <input
//                   onChange={(e) => {
//                     const value = parseInt(e.target.value) || 0;
//                     if (value > 0) {
//                       updateQuantity(item._id, value);
//                     }
//                   }}
//                   className='border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1'
//                   type="number"
//                   min={1}
//                   value={item.quantity}
//                 />
//                 <img
//                   onClick={() => updateQuantity(item._id, 0)}
//                   className='w-4 mr-4 sm:w-5 cursor-pointer'
//                   src={assets.bin_icon}
//                   alt="Remove"
//                 />
//               </div>
//             ))}
//           </div>

//           <div className='flex justify-end my-20'>
//             <div className='w-full sm:w-[450px]'>
//               <CartTotal />
//               <div className='w-full text-end'>
//                 <button
//                   onClick={() => navigate('/place-order')}
//                   className='border border-white text-white px-8 py-4 text-sm hover:bg-black hover:text-white transition-all duration-500 bg-[#008753]'
//                 >
//                   PROCEED TO CHECKOUT
//                 </button>
//               </div>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default Cart;






























// import React, { useContext, useEffect, useState } from 'react';
// import { ShopContext } from '../context/ShopContext';
// import Title from '../components/Title';
// import { assets } from '../assets/assets';
// import CartTotal from '../components/CartTotal';

// const Cart = () => {
//   const { products, currency, cartItems, updateQuantity, navigate } = useContext(ShopContext);

//   const [cartData, setCartData] = useState([]);

//   useEffect(() => {
//     if (products.length > 0) {
//       const tempData = Object.entries(cartItems)
//         .map(([itemId, quantity]) => ({
//           _id: itemId,
//           quantity,
//         }))
//         .filter((item) => item.quantity > 0);
//       setCartData(tempData);
//     }
//   }, [cartItems, products]);

//   return (
//     <div className='border-t pt-14'>
//       <div className='text-2xl mb-3'>
//         <Title text1={'YOUR'} text2={'CART'} />
//       </div>

//       <div>
//         {cartData.map((item, index) => {
//           const productData = products.find((product) => product._id === item._id);

//           return (
//             <div
//               key={index}
//               className='py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4'
//             >
//               <div className='flex items-start gap-6'>
//                 <img className='w-16 sm:w-20' src={productData.image[0]} alt="" />
//                 <div>
//                   <p className='text-xs sm:text-lg font-medium'>{productData.name}</p>
//                   <p className='mt-2'>{currency}{productData.price}</p>
//                 </div>
//               </div>
//               <input
//                 onChange={(e) =>
//                   e.target.value === '' || e.target.value === '0'
//                     ? null
//                     : updateQuantity(item._id, Number(e.target.value))
//                 }
//                 className='border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1'
//                 type="number"
//                 min={1}
//                 defaultValue={item.quantity}
//               />
//               <img
//                 onClick={() => updateQuantity(item._id, 0)}
//                 className='w-4 mr-4 sm:w-5 cursor-pointer'
//                 src={assets.bin_icon}
//                 alt=""
//               />
//             </div>
//           );
//         })}
//       </div>

//       <div className='flex justify-end my-20'>
//         <div className='w-full sm:w-[450px]'>
//           <CartTotal />
//           <div className='w-full text-end'>
//             <button
//               onClick={() => navigate('/place-order')}
//               className='border border-white text-white px-8 py-4 text-sm hover:bg-black hover:text-white transition-all duration-500 bg-[#333333]'
//             >
//               PROCEED TO CHECKOUT
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Cart;


















// import React, { useContext, useEffect, useState } from "react";
// import { ShopContext } from "../context/ShopContext";
// import Title from "../components/Title";
// import { assets } from "../assets/assets";
// import CartTotal from "../components/CartTotal";

// const Cart = () => {
//   const { products, currency, cartItems, updateQuantity, navigate } = useContext(ShopContext);

//   const [cartData, setCartData] = useState([]);

//   useEffect(() => {
//     if (products.length > 0) {
//       const tempData = [];
//       for (const itemId in cartItems) {
//         if (cartItems[itemId] > 0) {
//           tempData.push({
//             _id: itemId,
//             quantity: cartItems[itemId],
//           });
//         }
//       }
//       setCartData(tempData);
//     }
//   }, [cartItems, products]);

//   return (
//     <div className="border-t pt-14">
//       <div className="text-2xl mb-3">
//         <Title text1={"YOUR"} text2={"CART"} />
//       </div>

//       <div>
//         {cartData.map((item, index) => {
//           const productData = products.find((product) => product._id === item._id);

//           return (
//             <div
//               key={index}
//               className="py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4"
//             >
//               <div className="flex items-start gap-6">
//                 <img className="w-16 sm:w-20" src={productData.image[0]} alt="" />
//                 <div>
//                   <p className="text-xs sm:text-lg font-medium">{productData.name}</p>
//                   <div className="flex items-center gap-5 mt-2">
//                     <p>
//                       {currency}
//                       {productData.price}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//               <input
//                 onChange={(e) =>
//                   e.target.value === "" || e.target.value === "0"
//                     ? null
//                     : updateQuantity(item._id, Number(e.target.value))
//                 }
//                 className="border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1"
//                 type="number"
//                 min={1}
//                 defaultValue={item.quantity}
//               />
//               <img
//                 onClick={() => updateQuantity(item._id, 0)}
//                 className="w-4 mr-4 sm:w-5 cursor-pointer"
//                 src={assets.bin_icon}
//                 alt=""
//               />
//             </div>
//           );
//         })}
//       </div>

//       <div className="flex justify-end my-20">
//         <div className="w-full sm:w-[450px]">
//           <CartTotal />
//           <div className="w-full text-end">
//             <button
//               onClick={() => navigate("/place-order")}
//               className="border border-white text-white px-8 py-4 text-sm hover:bg-black hover:text-white transition-all duration-500 bg-[#333333]"
//             >
//               PROCEED TO CHECKOUT
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Cart;
























// import React, { useContext, useEffect, useState } from 'react'
// import { ShopContext } from '../context/ShopContext'
// import Title from '../components/Title';
// import { assets } from '../assets/assets';
// import CartTotal from '../components/CartTotal';

// const Cart = () => {

//   const { products, currency, cartItems, updateQuantity, navigate } = useContext(ShopContext);

//   const [cartData, setCartData] = useState([]);

//   useEffect(() => {

//     if (products.length > 0) {
//       const tempData = [];
//       for (const items in cartItems) {
//         for (const item in cartItems[items]) {
//           if (cartItems[items][item] > 0) {
//             tempData.push({
//               _id: items,
//               size: item,
//               quantity: cartItems[items][item]
//             })
//           }
//         }
//       }
//       setCartData(tempData);
//     }
//   }, [cartItems, products])

//   return (
//     <div className='border-t pt-14'>

//       <div className=' text-2xl mb-3'>
//         <Title text1={'YOUR'} text2={'CART'} />
//       </div>

//       <div>
//         {
//           cartData.map((item, index) => {

//             const productData = products.find((product) => product._id === item._id);

//             return (
//               <div key={index} className='py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4'>
//                 <div className=' flex items-start gap-6'>
//                   <img className='w-16 sm:w-20' src={productData.image[0]} alt="" />
//                   <div>
//                     <p className='text-xs sm:text-lg font-medium'>{productData.name}</p>
//                     <div className='flex items-center gap-5 mt-2'>
//                       <p>{currency}{productData.price}</p>
//                       <p className='px-2 sm:px-3 sm:py-1 border bg-slate-50'>{item.size}</p>
//                     </div>
//                   </div>
//                 </div>
//                 <input onChange={(e) => e.target.value === '' || e.target.value === '0' ? null : updateQuantity(item._id, item.size, Number(e.target.value))} className='border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1' type="number" min={1} defaultValue={item.quantity} />
//                 <input onChange={(e) => e.target.value === '' || e.target.value === '0' ? null : updateQuantity(item._id, Number(e.target.value))} className='border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1' type="number" min={1} defaultValue={item.quantity} />
//                 <img onClick={() => updateQuantity(item._id, 0)} className='w-4 mr-4 sm:w-5 cursor-pointer' src={assets.bin_icon} alt="" />
//                 <img onClick={() => updateQuantity(item._id, item.size, 0)} className='w-4 mr-4 sm:w-5 cursor-pointer' src={assets.bin_icon} alt="" />
//               </div>
//             )

//           })
//         }
//       </div>

//       <div className='flex justify-end my-20'>
//         <div className='w-full sm:w-[450px]'>
//           <CartTotal />
//           <div className=' w-full text-end'>
//             <button onClick={() => navigate('/place-order')} className='border border-white text-white px-8 py-4 text-sm hover:bg-black hover:text-white transition-all duration-500 bg-[#333333]'>PROCEED TO CHECKOUT</button>
//           </div>
//         </div>
//       </div>

//     </div>
//   )
// }

// export default Cart
