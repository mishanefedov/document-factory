/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["node-pty", "chokidar"],
  webpack: (config) => {
    // node-pty must not be bundled — it's a native module.
    config.externals = config.externals || [];
    config.externals.push({ "node-pty": "commonjs node-pty" });
    return config;
  },
};

export default nextConfig;
