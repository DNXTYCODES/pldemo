import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";

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
          `${backendUrl}/api/users/${uploaderId}`,
        );
        const profileData = await profileResponse.json();

        if (profileData.success) {
          setUploaderInfo(profileData.user);
        } else {
          toast.error("Uploader not found");
          navigate("/");
          return;
        }

        // Fetch uploader's images
        const imagesResponse = await fetch(
          `${backendUrl}/api/images/search?sellerId=${uploaderId}&limit=50`,
        );
        const imagesData = await imagesResponse.json();

        if (imagesData.success) {
          setUploads(imagesData.images);
        }
      } catch (error) {
        console.error("Error fetching uploader data:", error);
        toast.error("Failed to load uploader profile");
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
        <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
          <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] items-center">
            {/* Avatar */}
            <div className="rounded-3xl border border-gray-200 bg-gray-100 p-5 flex items-center justify-center">
              {uploaderInfo.profilePicture ? (
                <img
                  src={uploaderInfo.profilePicture}
                  alt={uploaderInfo.name}
                  className="h-40 w-40 rounded-3xl object-cover shadow-sm"
                />
              ) : (
                <div className="flex h-40 w-40 items-center justify-center rounded-3xl bg-gray-300 text-5xl font-semibold text-gray-700">
                  {uploaderInfo.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="space-y-6">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-gray-400">
                  Photographer
                </p>
                <h1 className="mt-2 text-4xl font-semibold text-gray-900 sm:text-5xl">
                  {uploaderInfo.name}
                </h1>
                <p className="mt-3 max-w-2xl text-gray-600 text-base sm:text-lg">
                  {uploaderInfo.bio || "This creator has not added a bio yet."}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-gray-200 bg-slate-50 p-5">
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="mt-2 text-lg font-medium text-gray-900">
                    {uploaderInfo.location || "Not specified"}
                  </p>
                </div>

                <div className="rounded-3xl border border-gray-200 bg-slate-50 p-5">
                  <p className="text-sm text-gray-500">Expertise Level</p>
                  <p className="mt-2 text-lg font-medium text-gray-900">
                    {uploaderInfo.expertise_level || "Not specified"}
                  </p>
                </div>

                <div className="rounded-3xl border border-gray-200 bg-slate-50 p-5">
                  <p className="text-sm text-gray-500">Specialty</p>
                  <p className="mt-2 text-lg font-medium text-gray-900">
                    {uploaderInfo.photography_specialty?.length
                      ? uploaderInfo.photography_specialty.join(", ")
                      : "General Photography"}
                  </p>
                </div>

                <div className="rounded-3xl border border-gray-200 bg-slate-50 p-5">
                  <p className="text-sm text-gray-500">Total Uploads</p>
                  <p className="mt-2 text-lg font-medium text-gray-900">
                    {uploads.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Uploads Gallery */}
      <div className="max-w-7xl mx-auto px-4 py-10 sm:py-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Uploads ({uploads.length})
            </h2>
            <p className="mt-1 text-sm text-gray-500 max-w-2xl">
              Browse the collection of images created by this photographer.
            </p>
          </div>
        </div>

        {uploads.length > 0 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {uploads.map((image) => (
              <div
                key={image._id}
                onClick={() => navigate(`/image/${image._id}`)}
                className="group overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="aspect-[4/5] overflow-hidden bg-gray-100">
                  <img
                    src={image.thumbnailUrl || image.imageUrl}
                    alt={image.title}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-base font-semibold text-gray-900 line-clamp-2">
                    {image.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                    {image.category || "Photography"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
            No uploads yet from this photographer.
          </div>
        )}
      </div>
    </div>
  );
};

export default UploaderProfile;
