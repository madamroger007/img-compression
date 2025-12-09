/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  experimental: {
    outputFileTracingIncludes: {
      '/api/**/*': ['./node_modules/@imgly/background-removal-node/**/*'],
    },
    // Keep native bindings as external deps in the server bundle
    serverComponentsExternalPackages: [
      "onnxruntime-node",
      "@imgly/background-removal-node",
      "sharp"
    ]
  },
  webpack: (config) => {
    // Keep native addons resolved at runtime from node_modules
    config.externals = config.externals || [];
    config.externals.push(
      { "onnxruntime-node": "commonjs onnxruntime-node" },
      { "sharp": "commonjs sharp" },
      { "@imgly/background-removal-node": "commonjs @imgly/background-removal-node" }
    );
    return config;
  }
};

export default nextConfig;
