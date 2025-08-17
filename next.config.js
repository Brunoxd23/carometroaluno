/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/nextjs-image/**",
      },
      {
        protocol: "https",
        hostname: "cdpofjje4o4wmpuy.public.blob.vercel-storage.com",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
