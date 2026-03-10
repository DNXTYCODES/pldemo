import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';

const ReviewModal = ({ isOpen, onClose, onSubmit, hasReviewed }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (rating > 0 && comment.trim() !== '') {
      onSubmit(rating, comment);
      setRating(0);
      setComment('');
      onClose();
    }
  };

  const renderStars = () => {
    return Array(5).fill(0).map((_, i) => (
      <button 
        key={i}
        className={`text-3xl ${i < (hoverRating || rating) ? 'text-amber-500' : 'text-gray-300'} transition-colors`}
        onClick={() => setRating(i + 1)}
        onMouseEnter={() => setHoverRating(i + 1)}
        onMouseLeave={() => setHoverRating(0)}
        aria-label={`Rate ${i + 1} stars`}
      >
        ★
      </button>
    ));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <FiX size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-4 text-[#008753]">
          {hasReviewed ? 'Update Your Review' : 'Review Our Restaurant'}
        </h2>
        
        <div className="flex justify-center mb-4">
          {renderStars()}
        </div>
        
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience..."
          className="w-full p-3 border border-gray-300 rounded-lg mb-4 min-h-[120px]"
        />
        
        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={rating === 0 || comment.trim() === ''}
            className={`flex-1 py-2 px-4 rounded-lg ${
              rating === 0 || comment.trim() === '' 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-[#008753] hover:bg-[#006e42] text-white'
            }`}
          >
            Submit
          </button>
          
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 rounded-lg border border-gray-300 hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;