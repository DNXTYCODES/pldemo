/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  // theme: {
  //   extend: {},
  // },
  theme: {
    extend: {
      backgroundImage: {
        "golden-brown": "linear-gradient(90deg, #996515, white)", // Adjust colors as needed
      },
    },
  },
  plugins: [
    // require('@tailwindcss/aspect-ratio')
  ],
};
