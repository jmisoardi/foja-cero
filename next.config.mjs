/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  outputFileTracingIncludes: {
    '/*': ['./node_modules/@swc/helpers/esm/**/*'],
  },
}

export default nextConfig
