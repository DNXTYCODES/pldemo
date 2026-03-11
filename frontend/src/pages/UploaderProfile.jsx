import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';

const UploaderProfile = () => {
  const { uploaderId } = useParams();
  const navigate = useNavigate();
  const { backendUrl } = useContext(ShopContext);

  const [uploaderInfo, setUploaderInfo] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUploaderData = async () => {
      try {
        setLoading(true);

        // Fetch uploader profile info
        const profileResponse = await fetch(
          `${backendUrl}/api/users/${uploaderId}`
        );
        const profileData = await profileResponse.json();

        if (profileData.success) {
          setUploaderInfo(profileData.user);
        } else {
          toast.error('Uploader not found');
          navigate('/');
          return;
        }

        // Fetch uploader's images
        const imagesResponse = await fetch(
          `${backendUrl}/api/images/search?sellerId=${uploaderId}&limit=50`
        );
        const imagesData = await imagesResponse.json();

        if (imagesData.success) {
          setUploads(imagesData.images);
        }
      } catch (error) {
        console.error('Error fetching uploader data:', error);
        toast.error('Failed to load uploader profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUploaderData();
  }, [uploaderId, backendUrl, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500">Loading profile...</div>
      </div>
    );
  }

  if (!uploaderInfo) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500">Uploader not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-start gap-8">
            {/* Avatar */}
            <div className="w-32 h-32 bg-gray-300 rounded-md flex items-center justify-center flex-shrink-0">
              <span className="text-4xl font-bold text-gray-600">
                {uploaderInfo.name?.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {uploaderInfo.name}
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Location</p>
                  <p className="text-lg font-medium text-gray-900">
                    {uploaderInfo.location || 'Not specified'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Expertise Level</p>
                  <p className="text-lg font-medium text-gray-900">
                    {uploaderInfo.expertiseLevel || 'Not specified'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Specialty</p>
                  <p className="text-lg font-medium text-gray-900">
                    {uploaderInfo.specialty || 'General Photography'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Uploads</p>
                  <p className="text-lg font-medium text-gray-900">{uploads.length}</p>
                </div>
              </div>

              {uploaderInfo.bio && (
                <div className="mt-6 pt-6 border-t">
                  <p className="text-gray-600">{uploaderInfo.bio}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Uploads Gallery */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          All Uploads ({uploads.length})
        </h2>

        {uploads.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploads.map((image) => (
              <div
                key={image._id}
                onClick={() => navigate(`/image/${image._id}`)}
                className="bg-gray-100 h-64 group relative cursor-pointer overflow-hidden rounded-md hover:shadow-md transition"
              >
                <img
                  src={image.thumbnailUrl || image.imageUrl}
                  alt={image.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition">
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                    <h3 className="font-bold text-sm line-clamp-2">{image.title}</h3>
                    <p className="text-xs text-gray-300 mt-1">
                      {image.category}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>No uploads yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploaderProfile;
