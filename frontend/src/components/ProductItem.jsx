import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import { Link } from 'react-router-dom'

const ProductItem = ({ id, image, name, basePrice, inStock, variations }) => {
  const { currency } = useContext(ShopContext);
  
  // Check if product has multiple pricing options (size/wrapping)
  const hasMultipleOptions = (
    variations?.sizes?.length > 0 || 
    variations?.wrap?.available ||
    variations?.base?.options?.length > 0 ||
    variations?.side?.options?.length > 0
  );

  return (
    <Link 
      onClick={() => window.scrollTo(0,0)} 
      className='cursor-pointer group relative' 
      to={`/product/${id}`}
    >
      {/* Out of Stock Badge */}
      {!inStock && (
        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold z-10">
          OUT OF STOCK
        </div>
      )}
      
      {/* Multiple Options Indicator */}
      {hasMultipleOptions && (
        <div className="absolute top-2 left-2 bg-[#008753] text-white rounded-full w-7 h-7 flex items-center justify-center z-10 group-hover:animate-pulse">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            <path d="M5 2a1 1 0 00-1 1v1a1 1 0 001 1h1a1 1 0 001-1V3a1 1 0 00-1-1H5z" />
            <path d="M2 5a1 1 0 011-1h1a1 1 0 011 1v1a1 1 0 01-1 1H3a1 1 0 01-1-1V5z" />
            <path d="M14 2a1 1 0 00-1 1v1a1 1 0 001 1h1a1 1 0 001-1V3a1 1 0 00-1-1h-1z" />
            <path d="M17 5a1 1 0 011-1h1a1 1 0 011 1v1a1 1 0 01-1 1h-1a1 1 0 01-1-1V5z" />
          </svg>
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded py-1 px-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            Multiple options available
          </div>
        </div>
      )}
      
      <div className='overflow-hidden rounded-xl border border-[#008753]/20 relative'>
        <img 
          className={`w-full aspect-square object-cover group-hover:scale-105 transition-all duration-300 ${!inStock ? 'opacity-70' : ''}`} 
          src={image[0]} 
          alt={name} 
          loading="lazy"
        />
      </div>
      <div className="mt-3">
        <h3 className='prata-regular text-lg text-[#008753] group-hover:text-amber-600 transition-colors truncate'>
          {name}
        </h3>
        <p className={`text-[#008753] font-medium mt-1 ${!inStock ? 'line-through' : ''}`}>
          {currency}{basePrice}
        </p>
        {!inStock && (
          <p className="text-red-500 text-sm mt-1">Currently unavailable</p>
        )}
      </div>
      <div className="mt-2 flex items-center">
        <div className="w-6 h-[2px] bg-[#008753] mr-2"></div>
        <span className="text-xs text-gray-600">View Details</span>
      </div>
    </Link>
  )
}

export default ProductItem;
































// import React, { useContext } from 'react'
// import { ShopContext } from '../context/ShopContext'
// import { Link } from 'react-router-dom'

// const ProductItem = ({ id, image, name, basePrice, inStock, variations }) => {
//   const { currency } = useContext(ShopContext);
  
//   // Check if product has multiple pricing options (size/wrapping)
//   const hasMultipleOptions = (
//     variations?.sizes?.length > 0 || 
//     variations?.wrap?.available ||
//     variations?.base?.options?.length > 0 ||
//     variations?.side?.options?.length > 0
//   );

//   return (
//     <Link 
//       onClick={() => window.scrollTo(0,0)} 
//       className='cursor-pointer group relative' 
//       to={`/product/${id}`}
//     >
//       {/* Out of Stock Badge */}
//       {!inStock && (
//         <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold z-10">
//           OUT OF STOCK
//         </div>
//       )}
      
//       {/* Multiple Options Indicator */}
//       {hasMultipleOptions && (
//         <div className="absolute top-2 left-2 bg-[#008753] text-white rounded-full w-7 h-7 flex items-center justify-center z-10 group-hover:animate-pulse">
//           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
//             <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//             <path d="M5 2a1 1 0 00-1 1v1a1 1 0 001 1h1a1 1 0 001-1V3a1 1 0 00-1-1H5z" />
//             <path d="M2 5a1 1 0 011-1h1a1 1 0 011 1v1a1 1 0 01-1 1H3a1 1 0 01-1-1V5z" />
//             <path d="M14 2a1 1 0 00-1 1v1a1 1 0 001 1h1a1 1 0 001-1V3a1 1 0 00-1-1h-1z" />
//             <path d="M17 5a1 1 0 011-1h1a1 1 0 011 1v1a1 1 0 01-1 1h-1a1 1 0 01-1-1V5z" />
//           </svg>
//           <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded py-1 px-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
//             Multiple options available
//           </div>
//         </div>
//       )}
      
//       <div className='overflow-hidden rounded-xl border border-[#008753]/20 relative'>
//         <img 
//           className={`w-full aspect-square object-cover group-hover:scale-105 transition-all duration-300 ${!inStock ? 'opacity-70' : ''}`} 
//           src={image[0]} 
//           alt={name} 
//           loading="lazy"
//         />
//       </div>
//       <div className="mt-3">
//         <h3 className='prata-regular text-lg text-[#008753] group-hover:text-amber-600 transition-colors truncate'>
//           {name}
//         </h3>
//         <p className={`text-[#008753] font-medium mt-1 ${!inStock ? 'line-through' : ''}`}>
//           {currency}{basePrice}
//         </p>
//         {!inStock && (
//           <p className="text-red-500 text-sm mt-1">Currently unavailable</p>
//         )}
//       </div>
//       <div className="mt-2 flex items-center">
//         <div className="w-6 h-[2px] bg-[#008753] mr-2"></div>
//         <span className="text-xs text-gray-600">View Details</span>
//       </div>
//     </Link>
//   )
// }

// export default ProductItem;




























// import React, { useContext } from 'react'
// import { ShopContext } from '../context/ShopContext'
// import { Link } from 'react-router-dom'

// const ProductItem = ({ id, image, name, basePrice, inStock }) => {
//   const { currency } = useContext(ShopContext);

//   return (
//     <Link 
//       onClick={() => window.scrollTo(0,0)} 
//       className='cursor-pointer group relative' 
//       to={`/product/${id}`}
//     >
//       {/* Out of Stock Badge */}
//       {!inStock && (
//         <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold z-10">
//           OUT OF STOCK
//         </div>
//       )}
      
//       <div className='overflow-hidden rounded-xl border border-[#008753]/20 relative'>
//         <img 
//           className={`w-full aspect-square object-cover group-hover:scale-105 transition-all duration-300 ${!inStock ? 'opacity-70' : ''}`} 
//           src={image[0]} 
//           alt={name} 
//           loading="lazy"
//         />
//       </div>
//       <div className="mt-3">
//         <h3 className='prata-regular text-lg text-[#008753] group-hover:text-amber-600 transition-colors truncate'>
//           {name}
//         </h3>
//         <p className={`text-[#008753] font-medium mt-1 ${!inStock ? 'line-through' : ''}`}>
//           {currency}{basePrice}
//         </p>
//         {!inStock && (
//           <p className="text-red-500 text-sm mt-1">Currently unavailable</p>
//         )}
//       </div>
//       <div className="mt-2 flex items-center">
//         <div className="w-6 h-[2px] bg-[#008753] mr-2"></div>
//         <span className="text-xs text-gray-600">View Details</span>
//       </div>
//     </Link>
//   )
// }

// export default ProductItem;

























// import React, { useContext } from 'react'
// import { ShopContext } from '../context/ShopContext'
// import { Link } from 'react-router-dom'

// const ProductItem = ({ id, image, name, price }) => {
//   const { currency } = useContext(ShopContext);

//   return (
//     <Link 
//       onClick={() => window.scrollTo(0,0)} 
//       className='cursor-pointer group' 
//       to={`/product/${id}`}
//     >
//       <div className='overflow-hidden rounded-xl border border-[#008753]/20 relative'>
//         <img 
//           className='w-full aspect-square object-cover group-hover:scale-105 transition-all duration-300' 
//           src={image[0]} 
//           alt={name} 
//           loading="lazy"
//         />
//       </div>
//       <div className="mt-3">
//         <h3 className='prata-regular text-lg text-[#008753] group-hover:text-amber-600 transition-colors truncate'>
//           {name}
//         </h3>
//         <p className='text-[#008753] font-medium mt-1'>
//           {currency}{price}
//         </p>
//       </div>
//       <div className="mt-2 flex items-center">
//         <div className="w-6 h-[2px] bg-[#008753] mr-2"></div>
//         <span className="text-xs text-gray-600">View Details</span>
//       </div>
//     </Link>
//   )
// }

// export default ProductItem;

































// import React, { useContext } from 'react'
// import { ShopContext } from '../context/ShopContext'
// import { Link } from 'react-router-dom'

// const ProductItem = ({ id, image, name, price }) => {
//   const { currency } = useContext(ShopContext);

//   return (
//     <Link 
//       onClick={() => window.scrollTo(0,0)} 
//       className='cursor-pointer group' 
//       to={`/product/${id}`}
//     >
//       <div className='overflow-hidden rounded-xl border border-[#008753]/20'>
//         <img 
//           className='w-full aspect-square object-cover group-hover:scale-105 transition-all duration-300' 
//           src={image[0]} 
//           alt={name} 
//         />
//       </div>
//       <div className="mt-3">
//         <h3 className='prata-regular text-lg text-[#008753] group-hover:text-amber-600 transition-colors'>
//           {name}
//         </h3>
//         <p className='text-[#008753] font-medium mt-1'>
//           {currency}{price}
//         </p>
//       </div>
//       <div className="mt-2 flex items-center">
//         <div className="w-6 h-[2px] bg-[#008753] mr-2"></div>
//         <span className="text-xs text-gray-600">Add to cart</span>
//       </div>
//     </Link>
//   )
// }

// export default ProductItem




















// import React, { useContext } from 'react'
// import { ShopContext } from '../context/ShopContext'
// import {Link} from 'react-router-dom'

// const ProductItem = ({id,image,name,price}) => {
    
//     const {currency} = useContext(ShopContext);

//   return (
//   <Link onClick={()=>scrollTo(0,0)} className='text-goldenrod cursor-pointer' to={`/product/${id}`}>
//       <div className=' overflow-hidden'>
//         <img className=' rounded-xl hover:scale-110 transition ease-in-out aspect-square object-cover' src={image[0]} alt="" />
//       </div>
//       <p className='pt-3 pb-1 text-sm text-white prata-regular bg-golden-brown bg-clip-text text-transparent bg-to-b'>{name}</p>
//       <p className=' text-sm font-medium bg-golden-brown bg-clip-text text-transparent bg-to-b'>{currency}{price}</p>
//     </Link>
//   )
// }

// export default ProductItem
