import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import User from '../models/User.js';
import { encryptText } from '../utils/crypto.js';

// 🔴 2. JWT secret verification without hardcoded fallback
const generateToken = (id, name, email) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET configuration is missing in environment variables.');
  }
  return jwt.sign({ id, name, email }, secret, { expiresIn: '7d' });
};

const parseCookies = (req) => {
  const list = {};
  const rc = req.headers.cookie;
  if (rc) {
    rc.split(';').forEach((cookie) => {
      const parts = cookie.split('=');
      if (parts.length >= 2) {
        list[parts[0].trim()] = decodeURIComponent(parts.slice(1).join('=').trim());
      }
    });
  }
  return list;
};

// @desc    Initiate GitHub OAuth flow with secure CSRF state
// @route   GET /api/auth/github
// @access  Public
export const githubAuthUrl = async (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri =
    process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/auth/github/callback';

  const state = crypto.randomBytes(16).toString('hex');

  res.cookie('oauth_state', state, {
    httpOnly: true,
    maxAge: 10 * 60 * 1000,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  const isDemoAllowed = process.env.NODE_ENV !== 'production' || process.env.ALLOW_DEMO_OAUTH === 'true';

  const targetUrl = clientId
    ? `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=user:email&state=${state}`
    : isDemoAllowed
      ? `http://localhost:5000/api/auth/github/callback?code=demo_github_code_${Date.now()}&state=${state}`
      : null;

  if (!targetUrl) {
    return res.status(400).json({ message: 'GitHub OAuth is not configured for this environment.' });
  }

  if (req.query.redirect === 'true' || req.headers.accept?.includes('text/html')) {
    return res.redirect(targetUrl);
  }

  return res.json({ success: true, url: targetUrl, isDemo: !clientId });
};

// @desc    GitHub OAuth callback handler (Code exchange & Account linking)
// @route   GET /api/auth/github/callback
// @route   POST /api/auth/github/callback
// @access  Public
export const githubCallback = async (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const cookies = parseCookies(req);
  const savedState = cookies.oauth_state;

  res.clearCookie('oauth_state');

  if (req.query.error === 'access_denied') {
    const msg = 'GitHub sign-in was cancelled.';
    if (req.method === 'GET') {
      return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(msg)}`);
    }
    return res.status(400).json({ message: msg });
  }

  const code = req.query.code || req.body?.code;
  const state = req.query.state || req.body?.state;

  if (!state || !savedState || state !== savedState) {
    const msg = 'Invalid OAuth state. Security check failed.';
    if (req.method === 'GET') {
      return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(msg)}`);
    }
    return res.status(403).json({ message: msg });
  }

  if (!code) {
    const msg = 'Unable to sign in with GitHub. Authorization code missing.';
    if (req.method === 'GET') {
      return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(msg)}`);
    }
    return res.status(400).json({ message: msg });
  }

  let githubUser = null;
  let accessToken = null;
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const isDemoAllowed = process.env.NODE_ENV !== 'production' || process.env.ALLOW_DEMO_OAUTH === 'true';

  if (clientId && clientSecret && !code.startsWith('demo_')) {
    try {
      const tokenRes = await axios.post(
        'https://github.com/login/oauth/access_token',
        {
          client_id: clientId,
          client_secret: clientSecret,
          code,
          state,
        },
        { headers: { Accept: 'application/json' } }
      );

      accessToken = tokenRes.data?.access_token;
      if (!accessToken) {
        const msg =
          tokenRes.data?.error_description ||
          'Unable to sign in with GitHub. Code exchange failed.';
        if (req.method === 'GET') {
          return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(msg)}`);
        }
        return res.status(400).json({ message: msg });
      }

      const userRes = await axios.get('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const emailsRes = await axios.get('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const emails = emailsRes.data || [];
      const primaryVerified = emails.find((e) => e.primary && e.verified);
      const anyVerified = emails.find((e) => e.verified);
      const verifiedEmail = primaryVerified
        ? primaryVerified.email
        : anyVerified
          ? anyVerified.email
          : null;

      if (!verifiedEmail) {
        const msg =
          'No verified email address found on your GitHub account. Please verify an email on GitHub or use password sign-in.';
        if (req.method === 'GET') {
          return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(msg)}`);
        }
        return res.status(400).json({ message: msg });
      }

      githubUser = {
        id: String(userRes.data.id),
        username: userRes.data.login || '',
        name: userRes.data.name || userRes.data.login,
        email: verifiedEmail.trim().toLowerCase(),
        avatar: userRes.data.avatar_url || '',
      };
    } catch (err) {
      console.error(`[GitHub OAuth Exchange Error] ${err.message}`);
      const msg = 'Unable to sign in with GitHub. Service error occurred.';
      if (req.method === 'GET') {
        return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(msg)}`);
      }
      return res.status(500).json({ message: msg });
    }
  } else if (isDemoAllowed) {
    const mockEmail = req.query.email
      ? req.query.email.trim().toLowerCase()
      : 'developer@example.com';

    if (req.query.noVerifiedEmail === 'true') {
      const msg =
        'No verified email address found on your GitHub account. Please verify an email on GitHub or use password sign-in.';
      if (req.method === 'GET') {
        return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(msg)}`);
      }
      return res.status(400).json({ message: msg });
    }

    githubUser = {
      id: req.query.githubId || 'gh_sim_developer',
      username: req.query.username || 'developer',
      name: req.query.name || 'GitHub Developer',
      email: mockEmail,
      avatar: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
    };
  } else {
    const msg = 'GitHub OAuth is disabled in production without valid credentials.';
    if (req.method === 'GET') {
      return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(msg)}`);
    }
    return res.status(400).json({ message: msg });
  }

  try {
    const cleanEmail = githubUser.email.trim().toLowerCase();
    const githubId = githubUser.id;

    let user = await User.findOne({ email: cleanEmail });

    if (user) {
      if (!user.githubId) {
        user.githubId = githubId;
        if (githubUser.username) user.githubUsername = githubUser.username;
        if (!user.avatar && githubUser.avatar) {
          user.avatar = githubUser.avatar;
        }
        if (accessToken) user.githubAccessToken = encryptText(accessToken);
        await user.save();
      } else if (user.githubId === githubId) {
        if (githubUser.username && !user.githubUsername) {
          user.githubUsername = githubUser.username;
        }
        if (!user.avatar && githubUser.avatar) {
          user.avatar = githubUser.avatar;
        }
        if (accessToken) user.githubAccessToken = encryptText(accessToken);
        await user.save();
      } else {
        const msg =
          'Unable to link this GitHub account. Please use the original sign-in method for this account.';
        if (req.method === 'GET') {
          return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(msg)}`);
        }
        return res.status(409).json({ message: msg });
      }
    } else {
      user = await User.findOne({ githubId });

      if (!user) {
        user = await User.create({
          name: githubUser.name,
          email: cleanEmail,
          githubId: githubId,
          githubUsername: githubUser.username || '',
          avatar: githubUser.avatar,
          githubAccessToken: accessToken ? encryptText(accessToken) : '',
          role: 'user',
        });
      } else if (accessToken) {
        user.githubAccessToken = encryptText(accessToken);
        await user.save();
      }
    }

    const token = generateToken(user._id, user.name, user.email);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    if (req.method === 'GET') {
      return res.redirect(`${frontendUrl}/login?auth=success`);
    }

    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || '',
        githubUsername: user.githubUsername || '',
      },
    });
  } catch (err) {
    console.error(`[Account Resolution DB Error] ${err.message}`);
    const msg = 'Authentication failed due to database error.';
    if (req.method === 'GET') {
      return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(msg)}`);
    }
    return res.status(500).json({ message: msg });
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long' });
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    const existingUser = await User.findOne({ email: cleanEmail }).select('+password');

    if (existingUser) {
      if (existingUser.password) {
        return res.status(400).json({
          message:
            'An account with this email address already exists. Please sign in using your existing password.',
        });
      } else {
        return res.status(400).json({
          message:
            'An account with this email address already exists. Please sign in using GitHub.',
        });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name ? name.trim() : cleanEmail.split('@')[0],
      email: cleanEmail,
      password: hashedPassword,
      role: 'user',
    });

    const token = generateToken(user._id, user.name, user.email);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error.code === 11000 || error.name === 'MongoServerError') {
      return res.status(400).json({
        message:
          'An account with this email address already exists. Please sign in using your existing account.',
      });
    }
    console.error(`[Register Error] ${error.message}`);
    return res.status(500).json({ message: 'Registration failed due to server error.' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    const user = await User.findOne({ email: cleanEmail }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.password) {
      return res.status(400).json({
        message: 'This account was created using GitHub. Please sign in using GitHub.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id, user.name, user.email);

    // Set HttpOnly authentication cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || '',
        githubUsername: user.githubUsername || '',
      },
    });
  } catch (err) {
    console.error(`[Login Error] ${err.message}`);
    return res.status(500).json({ message: 'Login failed due to server error.' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      avatar: req.user.avatar || '',
      githubUsername: req.user.githubUsername || '',
    },
  });
};

// @desc    Update user profile & API key
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  const { name, apiKey, password, githubUsername } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name !== undefined && typeof name !== 'string') {
      return res.status(400).json({ message: 'Name must be a valid string' });
    }
    if (apiKey !== undefined && typeof apiKey !== 'string') {
      return res.status(400).json({ message: 'API key must be a valid string' });
    }
    if (githubUsername !== undefined && typeof githubUsername !== 'string') {
      return res.status(400).json({ message: 'GitHub username must be a valid string' });
    }
    if (password !== undefined && typeof password !== 'string') {
      return res.status(400).json({ message: 'Password must be a valid string' });
    }

    if (name !== undefined) {
      const trimmedName = name.trim();
      if (!trimmedName) {
        return res.status(400).json({ message: 'Name cannot be empty' });
      }
      if (trimmedName.length > 100) {
        return res.status(400).json({ message: 'Name cannot exceed 100 characters' });
      }
      user.name = trimmedName;
    }

    if (githubUsername !== undefined) {
      const trimmedGithub = githubUsername.trim();
      if (trimmedGithub.length > 100) {
        return res.status(400).json({ message: 'GitHub username cannot exceed 100 characters' });
      }
      user.githubUsername = trimmedGithub;
    }

    if (apiKey !== undefined) {
      const trimmedKey = apiKey.trim();
      if (trimmedKey.length > 500) {
        return res.status(400).json({ message: 'API key cannot exceed 500 characters' });
      }
      // Encrypt API key at rest using AES-256-GCM
      user.apiKey = trimmedKey ? encryptText(trimmedKey) : '';
    }

    if (password !== undefined) {
      if (password.length < 8 || password.length > 128) {
        return res.status(400).json({ message: 'Password must be between 8 and 128 characters long' });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || '',
        githubUsername: user.githubUsername || '',
      },
    });
  } catch (err) {
    console.error(`[Auth Profile Error] ${err.message}`);
    return res.status(500).json({ message: 'Profile update failed due to server error.' });
  }
};

// @desc    Logout user & clear authentication cookie
// @route   POST /api/auth/logout
// @access  Public
export const logoutUser = async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  return res.json({
    success: true,
    message: 'Logged out successfully',
  });
};