export default function handler(req, res) {
  const base = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const params = new URLSearchParams({ client_id: process.env.DISCORD_CLIENT_ID || '', redirect_uri: base + '/api/auth/discord/callback', response_type: 'code', scope: 'identify email' });
  res.redirect('https://discord.com/api/oauth2/authorize?' + params);
}
