/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for @ffmpeg/ffmpeg WASM - needs SharedArrayBuffer
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
        ],
      },
    ];
  },
  turbopack: {},
};

export default nextConfig;
