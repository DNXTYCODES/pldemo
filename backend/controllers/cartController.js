import userModel from "../models/userModel.js";

// Add products to user cart with variations
const addToCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { itemId, variations } = req.body;

    const userData = await userModel.findById(userId);
    let cartData = userData.cartData || {};

    // Create unique key based on itemId and variations
    const variationsKey = JSON.stringify(variations || {});
    const cartItemKey = `${itemId}-${variationsKey}`;

    if (cartData[cartItemKey]) {
      cartData[cartItemKey].quantity += 1;
    } else {
      cartData[cartItemKey] = {
        productId: itemId,
        quantity: 1,
        variations: variations || {},
      };
    }

    await userModel.findByIdAndUpdate(userId, { cartData });

    res.json({ success: true, message: "Added To Cart" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Update user cart
const updateCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { cartItemKey, quantity } = req.body;

    const userData = await userModel.findById(userId);
    let cartData = userData.cartData;

    if (cartData[cartItemKey]) {
      if (quantity > 0) {
        cartData[cartItemKey].quantity = quantity;
      } else {
        delete cartData[cartItemKey];
      }

      await userModel.findByIdAndUpdate(userId, { cartData });
      res.json({ success: true, message: "Cart Updated" });
    } else {
      res.json({ success: false, message: "Item not found in cart" });
    }
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Get user cart data
const getUserCart = async (req, res) => {
  try {
    const userId = req.userId;
    const userData = await userModel.findById(userId);
    let cartData = userData.cartData || {};

    res.json({ success: true, cartData });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Clear user cart
const clearCart = async (req, res) => {
  try {
    const userId = req.userId;
    await userModel.findByIdAndUpdate(userId, { cartData: {} });
    res.json({ success: true, message: "Cart cleared successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Export the new function along with others
export { addToCart, updateCart, getUserCart, clearCart };

// import userModel from "../models/userModel.js";

// // Add products to user cart with variations
// const addToCart = async (req, res) => {
//     try {
//         const { userId, itemId, variations } = req.body;

//         const userData = await userModel.findById(userId);
//         let cartData = userData.cartData || {};

//         // Create unique key based on itemId and variations
//         const variationsKey = JSON.stringify(variations || {});
//         const cartItemKey = `${itemId}-${variationsKey}`;

//         if (cartData[cartItemKey]) {
//             cartData[cartItemKey].quantity += 1;
//         } else {
//             cartData[cartItemKey] = {
//                 productId: itemId,
//                 quantity: 1,
//                 variations: variations || {}
//             };
//         }

//         await userModel.findByIdAndUpdate(userId, { cartData });

//         res.json({ success: true, message: "Added To Cart" });
//     } catch (error) {
//         console.error(error);
//         res.json({ success: false, message: error.message });
//     }
// };

// // Update user cart
// const updateCart = async (req, res) => {
//     try {
//         const { userId, cartItemKey, quantity } = req.body;

//         const userData = await userModel.findById(userId);
//         let cartData = userData.cartData;

//         if (cartData[cartItemKey]) {
//             if (quantity > 0) {
//                 cartData[cartItemKey].quantity = quantity;
//             } else {
//                 delete cartData[cartItemKey];
//             }

//             await userModel.findByIdAndUpdate(userId, { cartData });
//             res.json({ success: true, message: "Cart Updated" });
//         } else {
//             res.json({ success: false, message: "Item not found in cart" });
//         }
//     } catch (error) {
//         console.error(error);
//         res.json({ success: false, message: error.message });
//     }
// };

// // Get user cart data
// const getUserCart = async (req, res) => {
//     try {
//         const { userId } = req.body;
//         const userData = await userModel.findById(userId);
//         let cartData = userData.cartData || {};

//         res.json({ success: true, cartData });
//     } catch (error) {
//         console.error(error);
//         res.json({ success: false, message: error.message });
//     }
// };

// export { addToCart, updateCart, getUserCart };

// import userModel from "../models/userModel.js";

// // Add products to user cart
// const addToCart = async (req, res) => {
//     try {
//         const { userId, itemId } = req.body;

//         const userData = await userModel.findById(userId);
//         let cartData = userData.cartData;

//         if (cartData[itemId]) {
//             cartData[itemId] += 1;
//         } else {
//             cartData[itemId] = 1;
//         }

//         await userModel.findByIdAndUpdate(userId, { cartData });

//         const result = { success: true, message: "Added To Cart" };
//         console.log("AddToCart Result:", result);
//         res.json(result);
//     } catch (error) {
//         console.error(error);
//         const errorResult = { success: false, message: error.message };
//         console.log("AddToCart Error:", errorResult);
//         res.json(errorResult);
//     }
// };

// // Update user cart
// const updateCart = async (req, res) => {
//     try {
//         const { userId, itemId, quantity } = req.body;

//         const userData = await userModel.findById(userId);
//         let cartData = userData.cartData;

//         cartData[itemId] = quantity;

//         await userModel.findByIdAndUpdate(userId, { cartData });

//         const result = { success: true, message: "Cart Updated" };
//         console.log("UpdateCart Result:", result);
//         res.json(result);
//     } catch (error) {
//         console.error(error);
//         const errorResult = { success: false, message: error.message };
//         console.log("UpdateCart Error:", errorResult);
//         res.json(errorResult);
//     }
// };

// // Get user cart data
// const getUserCart = async (req, res) => {
//     try {
//         const { userId } = req.body;

//         const userData = await userModel.findById(userId);
//         let cartData = userData.cartData;

//         const result = { success: true, cartData };
//         console.log("GetUserCart Result:", result);
//         res.json(result);
//     } catch (error) {
//         console.error(error);
//         const errorResult = { success: false, message: error.message };
//         console.log("GetUserCart Error:", errorResult);
//         res.json(errorResult);
//     }
// };

// export { addToCart, updateCart, getUserCart };

// import userModel from "../models/userModel.js"

// // add products to user cart
// const addToCart = async (req, res) => {
//     try {

//         const { userId, itemId } = req.body

//         const userData = await userModel.findById(userId)
//         let cartData = await userData.cartData;

//         if (cartData[itemId]) {
//             cartData[itemId] += 1;
//         } else {
//             cartData[itemId] = 1;
//         }

//         await userModel.findByIdAndUpdate(userId, { cartData })

//         res.json({ success: true, message: "Added To Cart" })

//     } catch (error) {
//         console.log(error)
//         res.json({ success: false, message: error.message })
//     }
// }

// // update user cart
// const updateCart = async (req, res) => {
//     try {

//         const { userId, itemId, quantity } = req.body

//         const userData = await userModel.findById(userId)
//         let cartData = await userData.cartData;

//         cartData[itemId] = quantity;

//         await userModel.findByIdAndUpdate(userId, { cartData })
//         res.json({ success: true, message: "Cart Updated" })

//     } catch (error) {
//         console.log(error)
//         res.json({ success: false, message: error.message })
//     }
// }

// // get user cart data
// const getUserCart = async (req, res) => {

//     try {

//         const { userId } = req.body

//         const userData = await userModel.findById(userId)
//         let cartData = await userData.cartData;

//         res.json({ success: true, cartData })

//     } catch (error) {
//         console.log(error)
//         res.json({ success: false, message: error.message })
//     }

// }

// export { addToCart, updateCart, getUserCart }

// import userModel from "../models/userModel.js"

// // add products to user cart
// const addToCart = async (req,res) => {
//     try {

//         const { userId, itemId, size } = req.body

//         const userData = await userModel.findById(userId)
//         let cartData = await userData.cartData;

//         if (cartData[itemId]) {
//             if (cartData[itemId][size]) {
//                 cartData[itemId][size] += 1
//             }
//             else {
//                 cartData[itemId][size] = 1
//             }
//         } else {
//             cartData[itemId] = {}
//             cartData[itemId][size] = 1
//         }

//         await userModel.findByIdAndUpdate(userId, {cartData})

//         res.json({ success: true, message: "Added To Cart" })

//     } catch (error) {
//         console.log(error)
//         res.json({ success: false, message: error.message })
//     }
// }

// // update user cart
// const updateCart = async (req,res) => {
//     try {

//         const { userId ,itemId, size, quantity } = req.body

//         const userData = await userModel.findById(userId)
//         let cartData = await userData.cartData;

//         cartData[itemId][size] = quantity

//         await userModel.findByIdAndUpdate(userId, {cartData})
//         res.json({ success: true, message: "Cart Updated" })

//     } catch (error) {
//         console.log(error)
//         res.json({ success: false, message: error.message })
//     }
// }

// // get user cart data
// const getUserCart = async (req,res) => {

//     try {

//         const { userId } = req.body

//         const userData = await userModel.findById(userId)
//         let cartData = await userData.cartData;

//         res.json({ success: true, cartData })

//     } catch (error) {
//         console.log(error)
//         res.json({ success: false, message: error.message })
//     }

// }

// export { addToCart, updateCart, getUserCart }
