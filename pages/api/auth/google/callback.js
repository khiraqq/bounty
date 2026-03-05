import dbConnect from '../../../../lib/mongodb';
import { User } from '../../../../lib/models';
import { signToken } from '../../../../lib/jwt';

export default async function handler(req, res) {
  const { code } = req.query;
  if (!code) return res.redirect('/?error=no_code');
  try {
    await dbConnect();
    const base = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const tr = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ code, client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET, redirect_uri: base + '/api/auth/google/callback', grant_type: 'authorization_code' }),
    });
    const tokens = await tr.json();
    const pr = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: 'Bearer ' + tokens.access_token } });
    const p = await pr.json();
    let user = await User.findOne({ googleId: p.sub });
    if (!user) {
      let u = (p.name || p.email.split('@')[0]).replace(/\s+/g, '').slice(0, 20);
      if (await User.findOne({ username: u })) u = u + Math.floor(Math.random() * 9999);
      user = await User.create({ username: u, email: p.email || '', googleId: p.sub, authMethod: 'google', avatarUrl: p.picture || '' });
    }
    const token = signToken({ id: user._id.toString(), username: user.username });
    res.redirect('/?token=' + token + '&username=' + encodeURIComponent(user.username) + '&email=' + encodeURIComponent(user.email || '') + '&method=google');
  } catch (e) {
    console.error('Google callback error:', e);
    res.redirect('/?error=google_failed');
  }
}
