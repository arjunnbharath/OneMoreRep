module.exports = async function handler(_req, res) {
  return res.status(200).json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '',
    appleClientId: process.env.APPLE_CLIENT_ID || process.env.VITE_APPLE_CLIENT_ID || '',
  })
}
