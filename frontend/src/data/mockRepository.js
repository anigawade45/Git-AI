export const mockRepositoryData = {
  id: 'ecommerce-platform',
  name: 'ecommerce-platform',
  owner: 'facebook',
  url: 'https://github.com/facebook/react',
  description: 'Full-stack MERN e-commerce application with AI recommendations, authentication & real-time analytics.',
  language: 'JavaScript',
  license: 'MIT',
  stars: '1.2k',
  forks: '243',
  defaultBranch: 'main',
  branches: ['main', 'develop', 'feature/ai-chat', 'fix/auth-jwt'],
  
  stats: {
    files: 124,
    functions: 387,
    commits: 542,
    lastUpdated: '2 hours ago',
  },

  latestCommit: {
    hash: 'a83f91c',
    author: 'Aniket Gawade',
    message: 'Refactor authentication middleware and JWT token validation logic',
    time: '2 hours ago',
  },

  files: [
    {
      id: 'folder-src',
      name: 'src',
      type: 'folder',
      path: 'src',
      children: [
        {
          id: 'folder-controllers',
          name: 'controllers',
          type: 'folder',
          path: 'src/controllers',
          children: [
            {
              id: 'file-auth-controller',
              name: 'authController.js',
              type: 'file',
              path: 'src/controllers/authController.js',
              language: 'javascript',
              size: '1.8 KB',
              content: `import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error during authentication", error: error.message });
  }
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to register user", error: error.message });
  }
};`,
            },
            {
              id: 'file-user-controller',
              name: 'userController.js',
              type: 'file',
              path: 'src/controllers/userController.js',
              language: 'javascript',
              size: '1.2 KB',
              content: `import User from "../models/User.js";

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User profile not found" });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: "Server error fetching profile" });
  }
};`,
            },
          ],
        },
        {
          id: 'folder-services',
          name: 'services',
          type: 'folder',
          path: 'src/services',
          children: [
            {
              id: 'file-auth-service',
              name: 'authService.js',
              type: 'file',
              path: 'src/services/authService.js',
              language: 'javascript',
              size: '1.1 KB',
              content: `import axios from "axios";

const API_URL = "/api/auth";

export const authService = {
  async login(credentials) {
    const response = await axios.post(\`\${API_URL}/login\`, credentials);
    if (response.data.token) {
      localStorage.setItem("user_token", response.data.token);
    }
    return response.data;
  },

  async register(userData) {
    const response = await axios.post(\`\${API_URL}/register\`, userData);
    if (response.data.token) {
      localStorage.setItem("user_token", response.data.token);
    }
    return response.data;
  },

  logout() {
    localStorage.removeItem("user_token");
  },
};`,
            },
          ],
        },
        {
          id: 'folder-models',
          name: 'models',
          type: 'folder',
          path: 'src/models',
          children: [
            {
              id: 'file-user-model',
              name: 'User.js',
              type: 'file',
              path: 'src/models/User.js',
              language: 'javascript',
              size: '850 B',
              content: `import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);`,
            },
          ],
        },
        {
          id: 'file-app',
          name: 'App.jsx',
          type: 'file',
          path: 'src/App.jsx',
          language: 'jsx',
          size: '640 B',
          content: `import React from 'react';
import Navbar from './components/Navbar';

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="max-w-7xl mx-auto p-6">
        <h1 className="text-2xl font-bold">E-Commerce Application Workspace</h1>
      </main>
    </div>
  );
}`,
        },
      ],
    },
    {
      id: 'file-package-json',
      name: 'package.json',
      type: 'file',
      path: 'package.json',
      language: 'json',
      size: '520 B',
      content: `{
  "name": "ecommerce-platform",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "start": "node server.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "express": "^4.19.2",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.3.1",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  }
}`,
    },
    {
      id: 'file-readme',
      name: 'README.md',
      type: 'file',
      path: 'README.md',
      language: 'markdown',
      size: '780 B',
      content: `# E-Commerce Platform

Full-stack MERN e-commerce application integrated with AI recommendations & GitHub Knowledge Assistant.

## Features
- User Authentication with JWT & bcrypt
- Product catalog & Shopping Cart
- Vector-indexed repository code search
- Automated AI Code Review & Documentation

## Getting Started
\`\`\`bash
npm install
npm run dev
\`\`\`
`,
    },
    {
      id: 'file-env',
      name: '.env.example',
      type: 'file',
      path: '.env.example',
      language: 'plaintext',
      size: '180 B',
      content: `PORT=5000
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=super_secret_jwt_key_12345
OPENAI_API_KEY=sk-proj-mock-key`,
    },
  ],
};
