import React, { useState } from "react";
import {
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaClock,
  FaInstagram,
  FaTwitter,
  FaLinkedin,
  FaFacebook,
} from "react-icons/fa";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Form submission logic would go here
    alert("Message sent successfully! We'll get back to you soon.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-black text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">Get In Touch</h1>
          <p className="text-xl text-gray-300">
            Have questions about Peak Lens Photography? We'd love to hear from
            you.
          </p>
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-8">
                  Contact Information
                </h2>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Whether you're interested in showcasing your work, purchasing
                  exclusive photography, or learning more about our platform,
                  we're here to help.
                </p>
              </div>

              {/* Contact Details */}
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="mt-1 text-amber-500 flex-shrink-0">
                    <FaEnvelope size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">
                      Email
                    </h3>
                    <p className="text-gray-600">
                      contact@peaklensphotography.com
                    </p>
                    <p className="text-gray-600">
                      support@peaklensphotography.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="mt-1 text-amber-500 flex-shrink-0">
                    <FaPhone size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">
                      Phone
                    </h3>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                    <p className="text-gray-600">+1 (555) 123-4568</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="mt-1 text-amber-500 flex-shrink-0">
                    <FaMapMarkerAlt size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">
                      Location
                    </h3>
                    <p className="text-gray-600">
                      Peak Lens Photography Studio
                    </p>
                    <p className="text-gray-600">
                      123 Creative Street, Arts District
                    </p>
                    <p className="text-gray-600">New York, NY 10001, USA</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="mt-1 text-amber-500 flex-shrink-0">
                    <FaClock size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">
                      Business Hours
                    </h3>
                    <p className="text-gray-600">
                      Monday - Friday: 9am - 6pm EST
                    </p>
                    <p className="text-gray-600">Saturday: 10am - 4pm EST</p>
                    <p className="text-gray-600">Sunday: Closed</p>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-4">
                  Follow Us
                </h3>
                <div className="flex gap-4">
                  <a
                    href="#"
                    className="w-12 h-12 rounded-full bg-gray-200 hover:bg-amber-500 text-gray-700 hover:text-white transition-colors flex items-center justify-center"
                    title="Instagram"
                  >
                    <FaInstagram size={20} />
                  </a>
                  <a
                    href="#"
                    className="w-12 h-12 rounded-full bg-gray-200 hover:bg-amber-500 text-gray-700 hover:text-white transition-colors flex items-center justify-center"
                    title="Twitter"
                  >
                    <FaTwitter size={20} />
                  </a>
                  <a
                    href="#"
                    className="w-12 h-12 rounded-full bg-gray-200 hover:bg-amber-500 text-gray-700 hover:text-white transition-colors flex items-center justify-center"
                    title="LinkedIn"
                  >
                    <FaLinkedin size={20} />
                  </a>
                  <a
                    href="#"
                    className="w-12 h-12 rounded-full bg-gray-200 hover:bg-amber-500 text-gray-700 hover:text-white transition-colors flex items-center justify-center"
                    title="Facebook"
                  >
                    <FaFacebook size={20} />
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-gray-50 rounded-xl p-8 shadow-lg">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Send us a Message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-gray-700 font-medium mb-2"
                  >
                    Full Name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                    placeholder="Your full name"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-gray-700 font-medium mb-2"
                  >
                    Email Address *
                  </label>
                  <input
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-gray-700 font-medium mb-2"
                  >
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                    required
                  >
                    <option value="">Select a subject</option>
                    <option value="artist-inquiry">Artist Inquiry</option>
                    <option value="collector-inquiry">Collector Inquiry</option>
                    <option value="commercial-services">
                      Commercial Services
                    </option>
                    <option value="nft-marketplace">NFT Marketplace</option>
                    <option value="general-inquiry">General Inquiry</option>
                    <option value="technical-support">Technical Support</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-gray-700 font-medium mb-2"
                  >
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors min-h-[150px] resize-none"
                    placeholder="Tell us how we can help..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
                >
                  Send Message
                </button>

                <p className="text-sm text-gray-600 text-center">
                  We typically respond within 24 hours during business days.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="py-16 px-4 bg-gray-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Our Portfolio
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-lg overflow-hidden shadow-lg h-64">
              <img
                src="https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&h=400&fit=crop"
                alt="Studio Photography"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="rounded-lg overflow-hidden shadow-lg h-64">
              <img
                src="https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=400&fit=crop"
                alt="Creative Work"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="rounded-lg overflow-hidden shadow-lg h-64">
              <img
                src="https://images.unsplash.com/photo-1617632410384-1b688ded9f1b?w=600&h=400&fit=crop"
                alt="NFT Digital Art"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg text-gray-900 mb-3">
                How do I become an artist on Peak Lens?
              </h3>
              <p className="text-gray-600">
                Simply create an account, verify your email, and upload your
                portfolio. Our team reviews submissions to ensure quality
                standards.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg text-gray-900 mb-3">
                How do I purchase photography or NFTs?
              </h3>
              <p className="text-gray-600">
                Browse our gallery or NFT marketplace, select items you love,
                and proceed to checkout. We accept multiple payment methods.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg text-gray-900 mb-3">
                Do you offer commercial services?
              </h3>
              <p className="text-gray-600">
                Yes! We provide professional photography for events, portraits,
                and commercial projects. Contact us for custom pricing.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg text-gray-900 mb-3">
                What makes Peak Lens different?
              </h3>
              <p className="text-gray-600">
                We combine professional photography expertise with cutting-edge
                NFT technology, offering the best of both traditional and
                digital art.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Connect?</h2>
          <p className="text-xl mb-8 opacity-90">
            Start your journey with Peak Lens Photography today. Whether you're
            an artist or collector, we're here to support your vision.
          </p>
          <a
            href="/collection"
            className="inline-block bg-white text-amber-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Explore Our Gallery
          </a>
        </div>
      </div>
    </div>
  );
};

export default Contact;

// import React from "react";
// import Title from "../components/Title";
// import { assets } from "../assets/assets";
// import NewsletterBox from "../components/NewsletterBox";

// const Contact = () => {
//   return (
//     <div>
//       <div className="text-center text-2xl pt-10 border-t">
//         <Title text1={"CONTACT"} text2={"US"} />
//       </div>

//       <div className="my-10 flex flex-col justify-center md:flex-row gap-10 mb-28">
//         <img
//           className="w-full md:max-w-[480px]"
//           src={assets.contact_img}
//           alt=""
//         />
//         <div className="flex flex-col justify-center items-start gap-6">
//           <p className="prata-regular text-xl  bg-golden-brown bg-clip-text text-transparent bg-to-b">
//             Our Store
//           </p>
//           <p className=" text-gray-500">
//             117 Red Oak Lane <br />, Beebe, Arkansas
//           </p>
//           <div className="w-full flex justify-center">
//             <iframe
//               title="Google Map"
//               style={{
//                 width: "100%",
//                 maxWidth: "480px",
//                 height: "300px",
//                 border: "0",
//               }}
//               src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3348.299332383841!2d-91.87977332456868!3d35.07003367257451!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x87d28216e3d2d4f7%3A0x8cfb7f556dd86eb4!2s117%20Red%20Oak%20Ln%2C%20Beebe%2C%20AR%2072021%2C%20USA!5e0!3m2!1sen!2sus!4v1705933294885!5m2!1sen!2sus"
//               allowFullScreen
//               loading="lazy"
//               referrerPolicy="no-referrer-when-downgrade"
//             ></iframe>
//           </div>

//           <p className=" text-gray-500">
//             Tel:{" "}
//             <a className="underline" href="tel:5012982272">
//               5012982272
//             </a>{" "}
//             <br /> Email:{" "}
//             <a className="underline" href="mailto:aflyboyp51@gmail.com">
//               aflyboy51@gmail.com
//             </a>
//           </p>
//           <p className="prata-regular text-xl  bg-golden-brown bg-clip-text text-transparent bg-to-b">
//             Careers at Flyboy
//           </p>
//           <p className=" text-gray-500">
//             Learn more about our teams and job openings.
//           </p>
//           <button className="border border-white text-white px-8 py-4 text-sm hover:bg-black hover:text-white transition-all duration-500 bg-[#333333]">
//             <a href="mailto:aflyboyp51@gmail.com">Explore Jobs</a>
//           </button>
//         </div>
//       </div>

//       <NewsletterBox />
//     </div>
//   );
// };

// export default Contact;
