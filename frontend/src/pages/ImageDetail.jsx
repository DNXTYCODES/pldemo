import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';

const ImageDetail = () => {
  const { imageId } = useParams();
  const navigate = useNavigate();
  const { backendUrl, token } = useContext(ShopContext);
  
  const [imageData, setImageData] = useState(null);
  const [relatedImages, setRelatedImages] = useState([]);
  const [uploaderInfo, setUploaderInfo] = useState(null);
  const [uploaderOtherImages, setUploaderOtherImages] = useState([]);
  const [isFavourite, setIsFavourite] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [priceInETH, setPriceInETH] = useState(true);

  // Fetch image details
  useEffect(() => {
    const fetchImageDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${backendUrl}/api/images/${imageId}`);
        const data = await response.json();

        if (data.success) {
          setImageData(data.image);
          setIsFavourite(data.image.isFavourite || false);

          // Fetch related images (same category)
          const relatedResponse = await fetch(
            `${backendUrl}/api/images/search?category=${data.image.category}&limit=5`,
          );
          const relatedData = await relatedResponse.json();
          if (relatedData.success) {
            setRelatedImages(
              relatedData.images.filter((img) => img._id !== imageId),
            );
          }

          // Fetch uploader info and their other images
          if (data.image.sellerId) {
            setUploaderInfo(data.image.sellerId);

            const uploaderImagesResponse = await fetch(
              `${backendUrl}/api/images/search?sellerId=${data.image.sellerId._id}&limit=6`,
            );
            const uploaderImagesData = await uploaderImagesResponse.json();
            if (uploaderImagesData.success) {
              setUploaderOtherImages(
                uploaderImagesData.images.filter((img) => img._id !== imageId),
              );
            }
          }
        } else {
          toast.error('Image not found');
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching image details:', error);
        toast.error('Failed to load image');
      } finally {
        setLoading(false);
      }
    };

    fetchImageDetails();
  }, [imageId, backendUrl, navigate]);

  const handleFavourite = async () => {
    if (!token) {
      toast.error('Please log in to favourite images');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/images/${imageId}/favourite`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setIsFavourite(!isFavourite);
        toast.success(isFavourite ? 'Removed from favourites' : 'Added to favourites');
      } else {
        toast.error(data.message || 'Failed to update favourite');
      }
    } catch (error) {
      console.error('Error updating favourite:', error);
      toast.error('Failed to update favourite');
    }
  };

  const handleReport = async () => {
    if (!token) {
      toast.error('Please log in to report images');
      navigate('/login');
      return;
    }

    const reason = prompt('Please describe the reason for reporting this image:');
    if (!reason) return;

    try {
      const response = await fetch(`${backendUrl}/api/images/${imageId}/report`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Image reported successfully');
      } else {
        toast.error(data.message || 'Failed to report image');
      }
    } catch (error) {
      console.error('Error reporting image:', error);
      toast.error('Failed to report image');
    }
  };

  const handleBuyRequest = async () => {
    if (!token) {
      toast.error('Please log in to request purchase');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/images/${imageId}/buy-request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Purchase request sent to uploader');
      } else {
        toast.error(data.message || 'Failed to send purchase request');
      }
    } catch (error) {
      console.error('Error sending purchase request:', error);
      toast.error('Failed to send purchase request');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500">Loading image...</div>
      </div>
    );
  }

  if (!imageData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500">Image not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div
          className="fixed inset-0 bg-black z-50 flex items-center justify-center"
          onClick={() => setIsFullscreen(false)}
        >
          <button
            className="absolute top-4 right-4 text-white text-2xl hover:opacity-70"
            onClick={() => setIsFullscreen(false)}
          >
            ✕
          </button>
          <img
            src={imageData.imageUrl}
            alt={imageData.title}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-12 mb-12">
          {/* Image Section */}
          <div className="flex flex-col gap-4">
            <div
              className="aspect-square bg-gray-100 rounded-md overflow-hidden cursor-pointer relative group"
              onClick={() => setIsFullscreen(true)}
            >
              <img
                src={imageData.imageUrl}
                alt={imageData.title}
                className="w-full h-full object-cover group-hover:scale-105 transition"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                <span className="text-white text-sm font-medium">View Fullscreen</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleFavourite}
                className={`flex-1 py-3 rounded-md font-medium transition ${
                  isFavourite
                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isFavourite ? 'Favourited' : 'Add to Favourite'}
              </button>
              <button
                onClick={handleBuyRequest}
                className="flex-1 py-3 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
              >
                Request to Buy
              </button>
              <button
                onClick={handleReport}
                className="flex-1 py-3 rounded-md bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 transition"
              >
                Report
              </button>
            </div>
          </div>

          {/* Image Info Section */}
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {imageData.title}
              </h1>
              <p className="text-gray-600 mb-4">{imageData.description}</p>
              <div className="flex gap-4 mb-4">
                <span className="bg-gray-100 px-3 py-1 rounded text-sm text-gray-700">
                  {imageData.category}
                </span>
                {imageData.tags &&
                  imageData.tags.map((tag) => (
                    <span key={tag} className="bg-gray-100 px-3 py-1 rounded text-sm text-gray-700">
                      {tag}
                    </span>
                  ))}
              </div>

              {/* Price Section */}
              <div className="mt-6 p-4 bg-amber-50 rounded-md border border-amber-200">
                <p className="text-sm text-gray-600 mb-3">Price</p>
                <div className="flex items-center justify-between">
                  <div>
                    {priceInETH ? (
                      <div>
                        <p className="text-3xl font-bold text-gray-900">
                          {parseFloat(imageData.priceEth).toFixed(4)} ETH
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          ${parseFloat(imageData.priceUsd).toFixed(2)} USD
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-3xl font-bold text-gray-900">
                          ${parseFloat(imageData.priceUsd).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {parseFloat(imageData.priceEth).toFixed(4)} ETH
                        </p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setPriceInETH(!priceInETH)}
                    className="px-3 py-1 text-sm bg-white border border-amber-200 text-amber-600 rounded hover:bg-amber-50 transition"
                  >
                    {priceInETH ? 'Show USD' : 'Show ETH'}
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Uploader Information</h3>
              {uploaderInfo && (
                <div
                  className="flex items-start gap-4 p-4 bg-gray-50 rounded-md cursor-pointer hover:bg-gray-100 transition"
                  onClick={() => navigate(`/uploader/${uploaderInfo._id}`)}
                >
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center">
                    <span className="text-gray-600 font-bold">
                      {uploaderInfo.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{uploaderInfo.name}</h4>
                    <p className="text-sm text-gray-600">{uploaderInfo.location}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Expertise: {uploaderInfo.expertiseLevel || 'Not specified'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Images */}
        {relatedImages.length > 0 && (
          <div className="mb-12 border-t pt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Images</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {relatedImages.map((image) => (
                <div
                  key={image._id}
                  onClick={() => navigate(`/image/${image._id}`)}
                  className="bg-gray-100 h-48 group relative cursor-pointer overflow-hidden rounded-md hover:shadow-md transition"
                >
                  <img
                    src={image.thumbnailUrl || image.imageUrl}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition">
                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                      <h3 className="font-bold text-sm line-clamp-2">{image.title}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Uploader's Other Images */}
        {uploaderOtherImages.length > 0 && (
          <div className="mb-12 border-t pt-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">More from {uploaderInfo?.name}</h2>
              <button
                onClick={() => navigate(`/uploader/${uploaderInfo._id}`)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                View Profile
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {uploaderOtherImages.map((image) => (
                <div
                  key={image._id}
                  onClick={() => navigate(`/image/${image._id}`)}
                  className="bg-gray-100 h-56 group relative cursor-pointer overflow-hidden rounded-md hover:shadow-md transition"
                >
                  <img
                    src={image.thumbnailUrl || image.imageUrl}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition">
                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                      <h3 className="font-bold text-sm line-clamp-2">{image.title}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageDetail;
