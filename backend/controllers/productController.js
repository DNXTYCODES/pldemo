import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";
import mongoose from "mongoose";

// Helper function to get today's day
const getToday = () => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()];
};

// Add product
const addProduct = async (req, res) => {
    try {
        const { 
            name, 
            description, 
            basePrice, 
            category, 
            bestseller, 
            availableDays, 
            inStock,
            variations
        } = req.body;

        const image1 = req.files.image1 && req.files.image1[0];
        const image2 = req.files.image2 && req.files.image2[0];
        const image3 = req.files.image3 && req.files.image3[0];
        const image4 = req.files.image4 && req.files.image4[0];

        const images = [image1, image2, image3, image4].filter((item) => item !== undefined);

        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path, { resource_type: "image" });
                return result.secure_url;
            })
        );

        // Parse variations if provided
        let parsedVariations = {};
        if (variations) {
            try {
                parsedVariations = JSON.parse(variations);
            } catch (error) {
                console.error("Error parsing variations:", error);
                return res.json({ 
                    success: false, 
                    message: "Invalid variations format. Must be valid JSON." 
                });
            }
        }

        // Handle boolean values
        const bestsellerBool = bestseller === "true" || bestseller === true;
        const inStockBool = inStock === "true" || inStock === true;

        const productData = {
            name,
            description,
            category,
            basePrice: Number(basePrice),
            bestseller: bestsellerBool,
            image: imagesUrl,
            date: Date.now(),
            availableDays: availableDays || ['everyday'],
            inStock: inStockBool,
            variations: parsedVariations
        };

        const product = new productModel(productData);
        await product.save();

        res.json({ success: true, message: "Product Added" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// List all products (admin)
const listProducts = async (req, res) => {
    try {
        const products = await productModel.find({});
        res.json({ success: true, products });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get products available today (public)
const getAvailableProducts = async (req, res) => {
    try {
        const today = getToday();
        const products = await productModel.find({
            $or: [
                { availableDays: 'everyday' },
                { availableDays: today }
            ],
            inStock: true // Only include in-stock products
        });
        res.json({ success: true, products });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Remove product
const removeProduct = async (req, res) => {
    try {
        await productModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Product Removed" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get single product info
const singleProduct = async (req, res) => {
    try {
        const { productId } = req.body;
        const product = await productModel.findById(productId);
        res.json({ success: true, product });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Update product
const updateProduct = async (req, res) => {
    try {
        // Extract data from request
        const { 
            id, 
            name, 
            description, 
            basePrice, 
            category, 
            bestseller, 
            inStock,
            variations,
            availableDays
        } = req.body;

        // Handle boolean values
        const bestsellerBool = bestseller === "true" || bestseller === true;
        const inStockBool = inStock === "true" || inStock === true;

        // Parse variations if provided
        let parsedVariations = {};
        if (variations) {
            try {
                parsedVariations = JSON.parse(variations);
            } catch (error) {
                console.error("Error parsing variations:", error);
                return res.json({ 
                    success: false, 
                    message: "Invalid variations format. Must be valid JSON." 
                });
            }
        }

        const updateData = {
            name,
            description,
            basePrice: Number(basePrice),
            category,
            bestseller: bestsellerBool,
            availableDays: availableDays || ['everyday'],
            inStock: inStockBool,
            variations: parsedVariations
        };

        // Handle image updates
        const image1 = req.files?.image1?.[0];
        const image2 = req.files?.image2?.[0];
        const image3 = req.files?.image3?.[0];
        const image4 = req.files?.image4?.[0];
        
        const images = [image1, image2, image3, image4].filter(item => item !== undefined);
        
        if (images.length > 0) {
            const imagesUrl = await Promise.all(
                images.map(async (item) => {
                    const result = await cloudinary.uploader.upload(item.path, { resource_type: "image" });
                    return result.secure_url;
                })
            );
            
            // Replace existing images with new ones
            updateData.image = imagesUrl;
        }

        const updatedProduct = await productModel.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true }
        );

        if (!updatedProduct) {
            return res.json({ success: false, message: "Product not found" });
        }

        res.json({ success: true, message: "Product updated", product: updatedProduct });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { 
    listProducts, 
    addProduct, 
    removeProduct, 
    singleProduct, 
    getAvailableProducts,
    updateProduct
};




















// import { v2 as cloudinary } from "cloudinary";
// import productModel from "../models/productModel.js";
// import mongoose from "mongoose";

// // Helper function to get today's day
// const getToday = () => {
//   const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
//   return days[new Date().getDay()];
// };

// // Add product
// const addProduct = async (req, res) => {
//     try {
//         const { 
//             name, 
//             description, 
//             basePrice, 
//             category, 
//             bestseller, 
//             availableDays, 
//             inStock,
//             variations
//         } = req.body;

//         const image1 = req.files.image1 && req.files.image1[0];
//         const image2 = req.files.image2 && req.files.image2[0];
//         const image3 = req.files.image3 && req.files.image3[0];
//         const image4 = req.files.image4 && req.files.image4[0];

//         const images = [image1, image2, image3, image4].filter((item) => item !== undefined);

//         let imagesUrl = await Promise.all(
//             images.map(async (item) => {
//                 let result = await cloudinary.uploader.upload(item.path, { resource_type: "image" });
//                 return result.secure_url;
//             })
//         );

//         // Parse variations if provided
//         let parsedVariations = {};
//         if (variations) {
//             try {
//                 parsedVariations = JSON.parse(variations);
//             } catch (error) {
//                 console.error("Error parsing variations:", error);
//                 return res.json({ 
//                     success: false, 
//                     message: "Invalid variations format. Must be valid JSON." 
//                 });
//             }
//         }

//         const productData = {
//             name,
//             description,
//             category,
//             basePrice: Number(basePrice),
//             bestseller: bestseller === "true" ? true : false,
//             image: imagesUrl,
//             date: Date.now(),
//             availableDays: availableDays || ['everyday'],
//             inStock: inStock === "true" ? true : false,
//             variations: parsedVariations
//         };

//         const product = new productModel(productData);
//         await product.save();

//         res.json({ success: true, message: "Product Added" });
//     } catch (error) {
//         console.log(error);
//         res.json({ success: false, message: error.message });
//     }
// };

// // List all products (admin)
// const listProducts = async (req, res) => {
//     try {
//         const products = await productModel.find({});
//         res.json({ success: true, products });
//     } catch (error) {
//         console.log(error);
//         res.json({ success: false, message: error.message });
//     }
// };

// // Get products available today (public)
// const getAvailableProducts = async (req, res) => {
//     try {
//         const today = getToday();
//         const products = await productModel.find({
//             $or: [
//                 { availableDays: 'everyday' },
//                 { availableDays: today }
//             ],
//             inStock: true // Only include in-stock products
//         });
//         res.json({ success: true, products });
//     } catch (error) {
//         console.log(error);
//         res.json({ success: false, message: error.message });
//     }
// };

// // Remove product
// const removeProduct = async (req, res) => {
//     try {
//         await productModel.findByIdAndDelete(req.body.id);
//         res.json({ success: true, message: "Product Removed" });
//     } catch (error) {
//         console.log(error);
//         res.json({ success: false, message: error.message });
//     }
// };

// // Get single product info
// const singleProduct = async (req, res) => {
//     try {
//         const { productId } = req.body;
//         const product = await productModel.findById(productId);
//         res.json({ success: true, product });
//     } catch (error) {
//         console.log(error);
//         res.json({ success: false, message: error.message });
//     }
// };

// // Update product
// const updateProduct = async (req, res) => {
//     try {
//         const { 
//             id, 
//             name, 
//             description, 
//             basePrice, 
//             category, 
//             bestseller, 
//             availableDays, 
//             inStock,
//             variations
//         } = req.body;
        
//         const updateData = {
//             name,
//             description,
//             basePrice: Number(basePrice),
//             category,
//             bestseller: bestseller === "true" ? true : false,
//             availableDays: availableDays || ['everyday'],
//             inStock: inStock === "true" ? true : false
//         };

//         // Parse variations if provided
//         if (variations) {
//             try {
//                 updateData.variations = JSON.parse(variations);
//             } catch (error) {
//                 console.error("Error parsing variations:", error);
//                 return res.json({ 
//                     success: false, 
//                     message: "Invalid variations format. Must be valid JSON." 
//                 });
//             }
//         }

//         // Handle image updates
//         const image1 = req.files?.image1?.[0];
//         const image2 = req.files?.image2?.[0];
//         const image3 = req.files?.image3?.[0];
//         const image4 = req.files?.image4?.[0];
        
//         const images = [image1, image2, image3, image4].filter(item => item !== undefined);
        
//         if (images.length > 0) {
//             const imagesUrl = await Promise.all(
//                 images.map(async (item) => {
//                     const result = await cloudinary.uploader.upload(item.path, { resource_type: "image" });
//                     return result.secure_url;
//                 })
//             );
            
//             // Replace existing images with new ones
//             updateData.image = imagesUrl;
//         }

//         const updatedProduct = await productModel.findByIdAndUpdate(
//             id, 
//             updateData, 
//             { new: true }
//         );

//         if (!updatedProduct) {
//             return res.json({ success: false, message: "Product not found" });
//         }

//         res.json({ success: true, message: "Product updated", product: updatedProduct });
//     } catch (error) {
//         console.log(error);
//         res.json({ success: false, message: error.message });
//     }
// };

// export { 
//     listProducts, 
//     addProduct, 
//     removeProduct, 
//     singleProduct, 
//     getAvailableProducts,
//     updateProduct
// };























// import { v2 as cloudinary } from "cloudinary";
// import productModel from "../models/productModel.js";
// import mongoose from "mongoose";

// // Helper function to get today's day
// const getToday = () => {
//   const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
//   return days[new Date().getDay()];
// };

// // Add product
// const addProduct = async (req, res) => {
//     try {
//         const { name, description, price, category, bestseller, availableDays } = req.body;

//         const image1 = req.files.image1 && req.files.image1[0];
//         const image2 = req.files.image2 && req.files.image2[0];
//         const image3 = req.files.image3 && req.files.image3[0];
//         const image4 = req.files.image4 && req.files.image4[0];

//         const images = [image1, image2, image3, image4].filter((item) => item !== undefined);

//         let imagesUrl = await Promise.all(
//             images.map(async (item) => {
//                 let result = await cloudinary.uploader.upload(item.path, { resource_type: "image" });
//                 return result.secure_url;
//             })
//         );

//         const productData = {
//             name,
//             description,
//             category,
//             price: Number(price),
//             bestseller: bestseller === "true" ? true : false,
//             image: imagesUrl,
//             date: Date.now(),
//             availableDays: availableDays || ['everyday']
//         };

//         const product = new productModel(productData);
//         await product.save();

//         res.json({ success: true, message: "Product Added" });
//     } catch (error) {
//         console.log(error);
//         res.json({ success: false, message: error.message });
//     }
// };

// // List all products (admin)
// const listProducts = async (req, res) => {
//     try {
//         const products = await productModel.find({});
//         res.json({ success: true, products });
//     } catch (error) {
//         console.log(error);
//         res.json({ success: false, message: error.message });
//     }
// };

// // Get products available today (public)
// const getAvailableProducts = async (req, res) => {
//     try {
//         const today = getToday();
//         const products = await productModel.find({
//             $or: [
//                 { availableDays: 'everyday' },
//                 { availableDays: today }
//             ]
//         });
//         res.json({ success: true, products });
//     } catch (error) {
//         console.log(error);
//         res.json({ success: false, message: error.message });
//     }
// };

// // Remove product
// const removeProduct = async (req, res) => {
//     try {
//         await productModel.findByIdAndDelete(req.body.id);
//         res.json({ success: true, message: "Product Removed" });
//     } catch (error) {
//         console.log(error);
//         res.json({ success: false, message: error.message });
//     }
// };

// // Get single product info
// const singleProduct = async (req, res) => {
//     try {
//         const { productId } = req.body;
//         const product = await productModel.findById(productId);
//         res.json({ success: true, product });
//     } catch (error) {
//         console.log(error);
//         res.json({ success: false, message: error.message });
//     }
// };

// // Update product
// const updateProduct = async (req, res) => {
//     try {
//         const { id, name, description, price, category, bestseller, availableDays } = req.body;
//         const updateData = {
//             name,
//             description,
//             price: Number(price),
//             category,
//             bestseller: bestseller === "true" ? true : false,
//             availableDays: availableDays || ['everyday']
//         };

//         // Handle image updates
//         const image1 = req.files?.image1?.[0];
//         const image2 = req.files?.image2?.[0];
//         const image3 = req.files?.image3?.[0];
//         const image4 = req.files?.image4?.[0];
        
//         const images = [image1, image2, image3, image4].filter(item => item !== undefined);
        
//         if (images.length > 0) {
//             const imagesUrl = await Promise.all(
//                 images.map(async (item) => {
//                     const result = await cloudinary.uploader.upload(item.path, { resource_type: "image" });
//                     return result.secure_url;
//                 })
//             );
            
//             // Replace existing images with new ones
//             updateData.image = imagesUrl;
//         }

//         const updatedProduct = await productModel.findByIdAndUpdate(
//             id, 
//             updateData, 
//             { new: true }
//         );

//         if (!updatedProduct) {
//             return res.json({ success: false, message: "Product not found" });
//         }

//         res.json({ success: true, message: "Product updated", product: updatedProduct });
//     } catch (error) {
//         console.log(error);
//         res.json({ success: false, message: error.message });
//     }
// };

// export { 
//     listProducts, 
//     addProduct, 
//     removeProduct, 
//     singleProduct, 
//     getAvailableProducts,
//     updateProduct
// };




















// import { v2 as cloudinary } from "cloudinary";
// import productModel from "../models/productModel.js";

// // function for add product
// const addProduct = async (req, res) => {
//     try {
//         const { name, description, price, category, bestseller } = req.body;

//         const image1 = req.files.image1 && req.files.image1[0];
//         const image2 = req.files.image2 && req.files.image2[0];
//         const image3 = req.files.image3 && req.files.image3[0];
//         const image4 = req.files.image4 && req.files.image4[0];

//         const images = [image1, image2, image3, image4].filter((item) => item !== undefined);

//         let imagesUrl = await Promise.all(
//             images.map(async (item) => {
//                 let result = await cloudinary.uploader.upload(item.path, { resource_type: "image" });
//                 return result.secure_url;
//             })
//         );

//         const productData = {
//             name,
//             description,
//             category,
//             price: Number(price),
//             bestseller: bestseller === "true" ? true : false,
//             image: imagesUrl,
//             date: Date.now(),
//         };

//         console.log(productData);

//         const product = new productModel(productData);
//         await product.save();

//         res.json({ success: true, message: "Product Added" });
//     } catch (error) {
//         console.log(error);
//         res.json({ success: false, message: error.message });
//     }
// };

// // function for list product
// const listProducts = async (req, res) => {
//     try {
//         const products = await productModel.find({});
//         res.json({ success: true, products });
//     } catch (error) {
//         console.log(error);
//         res.json({ success: false, message: error.message });
//     }
// };

// // function for removing product
// const removeProduct = async (req, res) => {
//     try {
//         await productModel.findByIdAndDelete(req.body.id);
//         res.json({ success: true, message: "Product Removed" });
//     } catch (error) {
//         console.log(error);
//         res.json({ success: false, message: error.message });
//     }
// };

// // function for single product info
// const singleProduct = async (req, res) => {
//     try {
//         const { productId } = req.body;
//         const product = await productModel.findById(productId);
//         res.json({ success: true, product });
//     } catch (error) {
//         console.log(error);
//         res.json({ success: false, message: error.message });
//     }
// };

// export { listProducts, addProduct, removeProduct, singleProduct };


















// import { v2 as cloudinary } from "cloudinary"
// import productModel from "../models/productModel.js"

// // function for add product
// const addProduct = async (req, res) => {
//     try {

//         const { name, description, price, category, subCategory, sizes, bestseller } = req.body
//         // const { name, description, price, category, bestseller } = req.body

//         const image1 = req.files.image1 && req.files.image1[0]
//         const image2 = req.files.image2 && req.files.image2[0]
//         const image3 = req.files.image3 && req.files.image3[0]
//         const image4 = req.files.image4 && req.files.image4[0]

//         const images = [image1, image2, image3, image4].filter((item) => item !== undefined)

//         let imagesUrl = await Promise.all(
//             images.map(async (item) => {
//                 let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
//                 return result.secure_url
//             })
//         )

//         const productData = {
//             name,
//             description,
//             category,
//             price: Number(price),
//             subCategory,
//             bestseller: bestseller === "true" ? true : false,
//             sizes: JSON.parse(sizes),
//             image: imagesUrl,
//             date: Date.now()
//         }

//         console.log(productData);

//         const product = new productModel(productData);
//         await product.save()

//         res.json({ success: true, message: "Product Added" })

//     } catch (error) {
//         console.log(error)
//         res.json({ success: false, message: error.message })
//     }
// }

// // function for list product
// const listProducts = async (req, res) => {
//     try {
        
//         const products = await productModel.find({});
//         res.json({success:true,products})

//     } catch (error) {
//         console.log(error)
//         res.json({ success: false, message: error.message })
//     }
// }

// // function for removing product
// const removeProduct = async (req, res) => {
//     try {
        
//         await productModel.findByIdAndDelete(req.body.id)
//         res.json({success:true,message:"Product Removed"})

//     } catch (error) {
//         console.log(error)
//         res.json({ success: false, message: error.message })
//     }
// }

// // function for single product info
// const singleProduct = async (req, res) => {
//     try {
        
//         const { productId } = req.body
//         const product = await productModel.findById(productId)
//         res.json({success:true,product})

//     } catch (error) {
//         console.log(error)
//         res.json({ success: false, message: error.message })
//     }
// }

// export { listProducts, addProduct, removeProduct, singleProduct }