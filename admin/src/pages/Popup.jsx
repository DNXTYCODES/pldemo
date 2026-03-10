import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';

const Popup = ({ token }) => {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchPopup = async () => {
            try {
                const response = await axios.get(`${backendUrl}/api/popup`);
                setMessage(response.data.popup);
            } catch (error) {
                console.log(error);
            }
        };
        fetchPopup();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            await axios.put(
                `${backendUrl}/api/popup`, 
                { message }, 
                { headers: { token } }
            );
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='w-full'>
            <h2 className='text-2xl font-semibold mb-6'>Edit Global Popup Message</h2>
            
            <form onSubmit={handleSubmit} className='w-full max-w-2xl'>
                <textarea 
                    value={message} 
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Enter your popup message here..."
                    className='w-full h-40 p-3 border border-gray-300 rounded mb-4'
                />
                
                <div className='flex gap-3'>
                    <button 
                        type="submit"
                        disabled={loading}
                        className='px-6 py-2 bg-[#008753] text-white rounded hover:bg-[#006641] disabled:bg-gray-400'
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    
                    <button 
                        type="button"
                        onClick={() => setMessage('')}
                        className='px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400'
                    >
                        Clear Message
                    </button>
                </div>
                
                {success && (
                    <p className='text-green-600 mt-3'>
                        Popup updated successfully! The message will appear on all pages.
                    </p>
                )}
            </form>
            
            <div className="mt-8 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h3 className="font-semibold text-[#008753] mb-2">How it works:</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                    <li>This message will appear on every page of your website</li>
                    <li>Visitors will see it once per session</li>
                    <li>Leave empty to disable the popup</li>
                    <li>Use for important announcements and promotions</li>
                </ul>
            </div>
        </div>
    );
};

export default Popup;