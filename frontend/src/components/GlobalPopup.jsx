import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';

const GlobalPopup = () => {
    const { popupMessage, showPopup, dismissPopup } = useContext(ShopContext);

    if (!showPopup || !popupMessage) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full shadow-lg">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="prata-regular text-xl text-[#008753]">Announcement</h3>
                        <button 
                            onClick={dismissPopup}
                            className="text-gray-500 hover:text-gray-700 text-2xl"
                            aria-label="Close announcement"
                        >
                            &times;
                        </button>
                    </div>
                    <p className="text-gray-700 mb-6">{popupMessage}</p>
                    <div className="flex justify-end">
                        <button
                            onClick={dismissPopup}
                            className="px-4 py-2 bg-[#008753] text-white rounded-lg hover:bg-[#006641]"
                        >
                            Continue to Site
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GlobalPopup;