import React, { useState } from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Form submission logic would go here
    alert('Message sent successfully!');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-amber-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-[2px] bg-[#008753]"></div>
            <h1 className="prata-regular text-3xl text-[#008753]">Contact Us</h1>
            <div className="w-8 h-[2px] bg-[#008753]"></div>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Have questions or feedback? We'd love to hear from you! Reach out to us through any of the channels below.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="prata-regular text-2xl text-[#008753] mb-6">Get In Touch</h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="mt-1 text-[#008753]">
                  <FaMapMarkerAlt size={24} />
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-1">Address</h3>
                  <p className="text-gray-600">123 Food Street, Lagos, Nigeria</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="mt-1 text-[#008753]">
                  <FaPhone size={24} />
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-1">Phone</h3>
                  <p className="text-gray-600">+234 812 345 6789</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="mt-1 text-[#008753]">
                  <FaEnvelope size={24} />
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-1">Email</h3>
                  <p className="text-gray-600">contact@nigeriancuisine.com</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="mt-1 text-[#008753]">
                  <FaClock size={24} />
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-1">Opening Hours</h3>
                  <p className="text-gray-600">Monday - Saturday: 10am - 10pm</p>
                  <p className="text-gray-600">Sunday: 12pm - 8pm</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="font-medium text-lg mb-4">Follow Us</h3>
              <div className="flex gap-4">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="w-10 h-10 rounded-full bg-[#008753]/10 flex items-center justify-center text-[#008753] hover:bg-[#008753] hover:text-white transition-colors cursor-pointer">
                    <span className="font-bold">f</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="prata-regular text-2xl text-[#008753] mb-6">Send Us a Message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-gray-700 mb-2">Full Name</label>
                <input 
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  type="text" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008753] focus:border-transparent" 
                  placeholder="Your name"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-gray-700 mb-2">Email Address</label>
                <input 
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  type="email" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008753] focus:border-transparent" 
                  placeholder="your@email.com"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-gray-700 mb-2">Subject</label>
                <input 
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  type="text" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008753] focus:border-transparent" 
                  placeholder="Subject"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-gray-700 mb-2">Message</label>
                <textarea 
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008753] focus:border-transparent min-h-[150px]" 
                  placeholder="Your message"
                  required
                />
              </div>
              
              <button 
                type="submit" 
                className="w-full bg-[#008753] text-white py-3 rounded-lg font-medium hover:bg-[#006641] transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
        
        {/* Map Section */}
        <div className="mt-12 bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="h-80 w-full bg-gray-200 flex items-center justify-center">
            <p className="text-gray-500">Map would be displayed here</p>
          </div>
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
