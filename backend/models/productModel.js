import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    basePrice: { type: Number, required: true }, // Changed from price to basePrice
    image: { type: Array, required: true },
    category: { type: String, required: true },
    subCategory: { type: String, required: false },
    // Changed sizes to variation object
    variations: {
        base: {
            name: { type: String, default: "Base" },
            options: [{ type: String }]
        },
        side: {
            name: { type: String, default: "Side" },
            options: [{ type: String }]
        },
        sizes: [{
            size: { type: String, required: true },
            price: { type: Number, required: true }
        }],
        wrap: {
            available: { type: Boolean, default: false },
            price: { type: Number, default: 0 }
        }
    },
    bestseller: { type: Boolean },
    date: { type: Number, required: true },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    availableDays: { 
        type: [String], 
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'everyday'],
        default: ['everyday'] 
    },
    inStock: { type: Boolean, default: true } // New stock field
});

const productModel  = mongoose.models.product || mongoose.model("product", productSchema);

export default productModel;

















// import mongoose from "mongoose";

// const productSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     description: { type: String, required: true },
//     price: { type: Number, required: true },
//     image: { type: Array, required: true },
//     category: { type: String, required: true },
//     subCategory: { type: String, required: false },
//     sizes: { type: Array, required: false },
//     bestseller: { type: Boolean },
//     date: { type: Number, required: true },
//     averageRating: { type: Number, default: 0 },
//     reviewCount: { type: Number, default: 0 },
//     // Add availability fields
//     availableDays: { 
//         type: [String], 
//         enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'everyday'],
//         default: ['everyday'] 
//     }
// });

// const productModel  = mongoose.models.product || mongoose.model("product", productSchema);

// export default productModel;





















// import mongoose from "mongoose";

// const productSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     description: { type: String, required: true },
//     price: { type: Number, required: true },
//     image: { type: Array, required: true },
//     category: { type: String, required: true },
//     subCategory: { type: String, required: false },
//     sizes: { type: Array, required: false },
//     bestseller: { type: Boolean },
//     date: { type: Number, required: true },
//     // Add these new fields
//     averageRating: { type: Number, default: 0 },
//     reviewCount: { type: Number, default: 0 }
// })

// const productModel  = mongoose.models.product || mongoose.model("product", productSchema);

// export default productModel;












// import mongoose from "mongoose";

// const productSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     description: { type: String, required: true },
//     price: { type: Number, required: true },
//     image: { type: Array, required: true },
//     category: { type: String, required: true },
//     subCategory: { type: String, required: false },
//     sizes: { type: Array, required: false },
//     bestseller: { type: Boolean },
//     date: { type: Number, required: true }
// })

// const productModel  = mongoose.models.product || mongoose.model("product",productSchema);

// export default productModel