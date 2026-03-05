import dbConnect from '../../../../lib/mongodb';
import { User } from '../../../../lib/models';
import { signToken } from '../../../../lib/jwt';

export default async function handler(req, res) {
  const { code } = req.query;
  if (!code) return res.redirect('/?error=no_code');
  try {
    await dbConnect();
    const base = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const tr = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ code, client_id: process.env.DISCORD_CLIENT_ID, client_secret: process.env.DISCORD_CLIENT_SECRET, redirect_uri: base + '/api/auth/discord/callback', grant_type: 'authorization_code' }),
    });
    const tokens = await tr.json();
    const pr = await fetch('https://discord.com/api/users/@me', { headers: { Authorization: 'Bearer ' + tokens.access_token } });
    const p = await pr.json();
    let user = await User.findOne({ discordId: p.id });
    if (!user) {
      let u = (p.username || 'user').slice(0, 20);
      if (await User.findOne({ username: u })) u = u + Math.floor(Math.random() * 9999);
      const av = p.avatar ? 'https://cdn.discordapp.com/avatars/' + p.id + '/' + p.avatar + '.png' : '';
      user = await User.create({ username: u, email: p.email || '', discordId: p.id, authMethod: 'discord', avatarUrl: av });
    }
    const token = signToken({ id: user._id.toString(), username: user.username });
    res.redirect('/?token=' + token + '&username=' + encodeURIComponent(user.username) + '&email=' + encodeURIComponent(user.email || '') + '&method=discord');
  } catch (e) {
    console.error('Discord callback error:', e);
    res.redirect('/?error=discord_failed');
  }
}
