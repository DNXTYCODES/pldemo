import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';
import ProductItem from './ProductItem';

const RelatedProducts = ({category}) => {
    const { getAvailableProducts } = useContext(ShopContext);
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const availableProducts = await getAvailableProducts();
                // Filter by category and in-stock status
                const filteredProducts = availableProducts.filter(item => 
                    category === item.category && item.inStock
                );
                // Shuffle products and take 5
                const shuffled = [...filteredProducts].sort(() => 0.5 - Math.random());
                setRelated(shuffled.slice(0, 5));
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchProducts();
    }, [category]);

    return (
        <div className='my-24'>
            <div className='text-center text-3xl py-2'>
                <Title text1={'RELATED'} text2={"PRODUCTS"} />
            </div>

            {loading ? (
                <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#008753]"></div>
                </div>
            ) : related.length > 0 ? (
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
                    {related.map((item, index) => (
                        <ProductItem 
                            key={index} 
                            id={item._id} 
                            name={item.name} 
                            basePrice={item.basePrice} 
                            image={item.image} 
                            inStock={item.inStock}
                        />
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500 py-4">
                    No related products available today
                </p>
            )}
        </div>
    );
};

export default RelatedProducts;




















// import React, { useContext, useEffect, useState } from 'react'
// import { ShopContext } from '../context/ShopContext'
// import Title from './Title';
// import ProductItem from './ProductItem';

// const RelatedProducts = ({category}) => {
//     const { getAvailableProducts } = useContext(ShopContext);
//     const [related, setRelated] = useState([]);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const fetchProducts = async () => {
//             try {
//                 setLoading(true);
//                 const availableProducts = await getAvailableProducts();
//                 const filteredProducts = availableProducts.filter(item => 
//                     category === item.category
//                 );
//                 setRelated(filteredProducts.slice(0, 5));
//             } catch (error) {
//                 console.error("Error fetching products:", error);
//             } finally {
//                 setLoading(false);
//             }
//         };
        
//         fetchProducts();
//     }, [category]);

//     return (
//         <div className='my-24'>
//             <div className='text-center text-3xl py-2'>
//                 <Title text1={'RELATED'} text2={"PRODUCTS"} />
//             </div>

//             {loading ? (
//                 <div className="flex justify-center py-10">
//                     <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#008753]"></div>
//                 </div>
//             ) : related.length > 0 ? (
//                 <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
//                     {related.map((item, index) => (
//                         <ProductItem 
//                             key={index} 
//                             id={item._id} 
//                             name={item.name} 
//                             price={item.price} 
//                             image={item.image} 
//                         />
//                     ))}
//                 </div>
//             ) : (
//                 <p className="text-center text-gray-500 py-4">
//                     No related products available today
//                 </p>
//             )}
//         </div>
//     );
// };

// export default RelatedProducts;
























// import React, { useContext, useEffect, useState } from 'react'
// import { ShopContext } from '../context/ShopContext'
// import Title from './Title';
// import ProductItem from './ProductItem';

// const RelatedProducts = ({category,subCategory}) => {

//     const { products } = useContext(ShopContext);
//     const [related,setRelated] = useState([]);

//     useEffect(()=>{

//         if (products.length > 0) {
            
//             let productsCopy = products.slice();
            
//             productsCopy = productsCopy.filter((item) => category === item.category);
//             productsCopy = productsCopy.filter((item) => subCategory === item.subCategory);

//             setRelated(productsCopy.slice(0,5));
//         }
        
//     },[products])

//   return (
//     <div className='my-24'>
//       <div className=' text-center text-3xl py-2'>
//         <Title text1={'RELATED'} text2={"PRODUCTS"} />
//       </div>

//       <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
//         {related.map((item,index)=>(
//             <ProductItem key={index} id={item._id} name={item.name} price={item.price} image={item.image}/>
//         ))}
//       </div>
//     </div>
//   )
// }

// export default RelatedProducts
