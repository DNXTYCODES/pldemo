import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import AdminPageGuide from "../components/AdminPageGuide";

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const navigate = useNavigate();

  const fetchList = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/product/list");
      if (response.data.success) {
        setList(response.data.products.reverse());
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const removeProduct = async (id) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/product/remove",
        { id },
        { headers: { token } },
      );

      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const editProduct = (id) => {
    navigate(`/admin/edit-product/${id}`);
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Products List
        </h1>
        <p className="text-gray-600">Total Products: {list.length}</p>
      </div>

      <AdminPageGuide
        title="Products List overview"
        overview="Browse your full product catalog, search by name, edit product details, or remove products that are no longer needed."
        modalTitle="Products List Guide"
        sections={[
          {
            heading: "Browse products",
            content:
              "View every product in the catalog with quick access to edit and delete actions.",
          },
          {
            heading: "Search and filter",
            content:
              "Use the search field to find products by name and focus on the ones you need to update.",
          },
          {
            heading: "Manage availability",
            content:
              "Click Edit to adjust pricing, inventory, categories, and availability for a product.",
          },
        ]}
      />

      {list.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">No products found</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-100 to-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Image
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Availability
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <img
                          className="w-12 h-12 object-cover rounded-md"
                          src={item.image[0]}
                          alt={item.name}
                        />
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {item.category}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {currency}
                        {item.price}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {item.availableDays.includes("everyday")
                          ? "✔️ Everyday"
                          : item.availableDays.join(", ")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => editProduct(item._id)}
                            className="bg-blue-100 text-blue-600 hover:bg-blue-200 p-2 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => removeProduct(item._id)}
                            className="bg-red-100 text-red-600 hover:bg-red-200 p-2 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
            {list.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md p-4 border border-gray-200"
              >
                <img
                  className="w-full h-40 sm:h-48 object-cover rounded-lg mb-4"
                  src={item.image[0]}
                  alt={item.name}
                />
                <div className="space-y-2">
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base line-clamp-2">
                    {item.name}
                  </h3>
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {item.category}
                    </span>
                    <span className="font-semibold text-gray-900">
                      {currency}
                      {item.price}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {item.availableDays.includes("everyday")
                      ? "✔️ Everyday"
                      : item.availableDays.join(", ")}
                  </p>
                  <div className="flex gap-2 pt-3">
                    <button
                      onClick={() => editProduct(item._id)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium text-sm transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => removeProduct(item._id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium text-sm transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default List;

// import axios from 'axios'
// import React, { useEffect, useState } from 'react'
// import { backendUrl, currency } from '../App'
// import { toast } from 'react-toastify'

// const List = ({ token }) => {

//   const [list, setList] = useState([])

//   const fetchList = async () => {
//     try {

//       const response = await axios.get(backendUrl + '/api/product/list')
//       if (response.data.success) {
//         setList(response.data.products.reverse());
//       }
//       else {
//         toast.error(response.data.message)
//       }

//     } catch (error) {
//       console.log(error)
//       toast.error(error.message)
//     }
//   }

//   const removeProduct = async (id) => {
//     try {

//       const response = await axios.post(backendUrl + '/api/product/remove', { id }, { headers: { token } })

//       if (response.data.success) {
//         toast.success(response.data.message)
//         await fetchList();
//       } else {
//         toast.error(response.data.message)
//       }

//     } catch (error) {
//       console.log(error)
//       toast.error(error.message)
//     }
//   }

//   useEffect(() => {
//     fetchList()
//   }, [])

//   return (
//     <>
//       <p className='mb-2'>All Products List</p>
//       <div className='flex flex-col gap-2'>

//         {/* ------- List Table Title ---------- */}

//         <div className='hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm'>
//           <b>Image</b>
//           <b>Name</b>
//           <b>Category</b>
//           <b>Price</b>
//           <b className='text-center'>Action</b>
//         </div>

//         {/* ------ Product List ------ */}

//         {
//           list.map((item, index) => (
//             <div className='grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm' key={index}>
//               <img className='w-12' src={item.image[0]} alt="" />
//               <p>{item.name}</p>
//               <p>{item.category}</p>
//               <p>{currency}{item.price}</p>
//               <p onClick={()=>removeProduct(item._id)} className='text-right md:text-center cursor-pointer text-lg'>X</p>
//             </div>
//           ))
//         }

//       </div>
//     </>
//   )
// }

// export default List
