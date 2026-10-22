/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    // El home es Calificar Fidelización; la ruta vieja apunta al home (temporal, reversible)
    return [{ source: '/fidelizacion', destination: '/', permanent: false }]
  },
}
export default nextConfig
