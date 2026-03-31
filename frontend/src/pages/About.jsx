import React from "react";
import { FaCamera, FaPalette, FaGlobeAmericas, FaLock } from "react-icons/fa";

const About = () => {
  const features = [
    {
      image:
        "data:image/jpeg;base64,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",
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
        "data:image/jpeg;base64,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",
      title: "Global Marketplace",
      description:
        "Connect with photographers and collectors worldwide in a secure, accessible platform",
    },
    {
      image:
        "https://www.glossy.co/wp-content/uploads/sites/4/2021/12/Fred.Segal_.Subnation.01.jpg",
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
      <div
        className="relative overflow-hidden bg-black text-white py-20 px-4"
        style={{
          backgroundImage:
            "url('data:image/jpeg;base64,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')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative max-w-6xl mx-auto text-center">
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
                src="https://www.glossy.co/wp-content/uploads/sites/4/2021/12/Fred.Segal_.Subnation.01.jpg"
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
                src="https://www.glossy.co/wp-content/uploads/sites/4/2021/12/Fred.Segal_.Subnation.01.jpg"
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
