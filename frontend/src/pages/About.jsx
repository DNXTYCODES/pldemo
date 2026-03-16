import React from "react";
import { FaCamera, FaPalette, FaGlobeAmericas, FaLock } from "react-icons/fa";

const About = () => {
  const features = [
    {
      image:
        "https://images.unsplash.com/photo-1612198188060-c7d47be4a6ba?w=400&h=300&fit=crop",
      title: "Professional Photography",
      description:
        "Expert photographers capturing life's most extraordinary moments with precision and artistry",
    },
    {
      image:
        "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop",
      title: "Creative Vision",
      description:
        "Transforming moments into timeless visual experiences with state-of-the-art equipment",
    },
    {
      image:
        "https://images.unsplash.com/photo-1526628652108-aa09b6985fcc?w=400&h=300&fit=crop",
      title: "Global Marketplace",
      description:
        "Connect with photographers and collectors worldwide in a secure, accessible platform",
    },
    {
      image:
        "https://images.unsplash.com/photo-1639356216098-0e03388e897a?w=400&h=300&fit=crop",
      title: "NFT & Digital Assets",
      description:
        "Exclusive limited edition photography and digital assets with complete ownership",
    },
  ];

  const values = [
    {
      title: "Trust",
      description:
        "We maintain transparency and security in every transaction, protecting creators and collectors",
    },
    {
      title: "Innovation",
      description:
        "Pioneering the intersection of traditional photography and digital NFT technology",
    },
    {
      title: "Excellence",
      description:
        "Uncompromising commitment to quality in every image, every frame, every moment",
    },
    {
      title: "Empowerment",
      description:
        "Enabling artists to monetize their work and collectors to own exclusive digital art",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-900 to-black text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Peak Lens Photography
          </h1>
          <p className="text-xl md:text-2xl text-amber-400 mb-4">
            Where Every Moment Reaches Its Peak
          </p>
          <p className="text-gray-300 max-w-3xl mx-auto text-lg">
            A premier photography platform combining traditional artistry with
            digital innovation, empowering creators and collectors in the modern
            visual economy
          </p>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
            Our Story
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Photography Services Excellence
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Peak Lens Photography is a premier photography studio
                  dedicated to capturing life's most extraordinary moments with
                  unmatched precision and artistry. We specialize in
                  professional photography services including portraits, events,
                  commercial shoots, and creative projects.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Our Philosophy
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Every frame tells a story. Using state-of-the-art equipment
                  and a keen artistic eye, we transform moments into timeless
                  visual experiences. Our team of experienced photographers
                  combines technical expertise with creative vision to ensure
                  that every image reflects authentic emotion, stunning
                  composition, and impeccable quality.
                </p>
              </div>
            </div>

            <div className="bg-gray-300 rounded-xl overflow-hidden shadow-lg h-96">
              <img
                src="https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&h=400&fit=crop"
                alt="Peak Lens Studio"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Digital Marketplace Section */}
      <div className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
            The Digital Revolution
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="bg-gray-300 rounded-xl overflow-hidden shadow-lg h-96">
              <img
                src="https://images.unsplash.com/photo-1617632410384-1b688ded9f1b?w=600&h=400&fit=crop"
                alt="NFT Marketplace"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Cutting-Edge Platform
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Peak Lens Photography is a cutting-edge online platform for
                  photographers, digital artists, and collectors to buy, sell,
                  and showcase high-quality photography and NFT assets. We
                  bridge the gap between creative talent and collectors,
                  offering a secure, intuitive, and professional marketplace for
                  visual content.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Empowering Creators & Collectors
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Artists can monetize their work, reach a global audience, and
                  maintain ownership of their creations. Buyers gain access to
                  exclusive photography and limited edition digital assets. With
                  a focus on trust, transparency, and innovation, we empower
                  creators and collectors to thrive in the modern digital
                  economy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="bg-gray-50 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
            What Makes Us Different
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6 text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
            Our Core Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-amber-50 to-white border-l-4 border-amber-500 rounded-lg p-6 shadow-sm"
              >
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Join Our Community</h2>
          <p className="text-xl mb-8 opacity-90">
            Whether you're a photographer looking to showcase your work or a
            collector seeking exclusive visual art, Peak Lens Photography is
            your destination.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/explore"
              className="bg-white text-amber-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Explore Gallery
            </a>
            <a
              href="/contact"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              Get In Touch
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
