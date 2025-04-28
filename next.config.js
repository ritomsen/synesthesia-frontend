/** @type {import('next').NextConfig} */

module.exports = {
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb', // Increased from 2mb
    },
  },
} 