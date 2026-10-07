export const documentationTypes = [
  {
    id: 'readme',
    title: 'README',
    iconName: 'BookOpen',
    description: 'Complete project overview, setup instructions, features, tech stack, and usage guide.',
    recommended: true,
  },
  {
    id: 'api',
    title: 'API Documentation',
    iconName: 'Webhook',
    description: 'Detailed REST endpoints, request parameters, headers, response schemas, and authentication.',
    recommended: false,
  },
  {
    id: 'architecture',
    title: 'Architecture Guide',
    iconName: 'Network',
    description: 'System architecture breakdown, MVC design patterns, layer interactions, and data flow.',
    recommended: false,
  },
  {
    id: 'setup',
    title: 'Setup & Deployment',
    iconName: 'Settings',
    description: 'Step-by-step installation, environment configuration, database seeding, and production deployment.',
    recommended: false,
  },
  {
    id: 'code',
    title: 'Code Documentation',
    iconName: 'Code',
    description: 'JSDoc specification for functions, classes, controllers, models, and utility modules.',
    recommended: false,
  },
  {
    id: 'contribution',
    title: 'Contribution Guide',
    iconName: 'Users',
    description: 'Development workflow, branch strategies, pull request guidelines, and coding standards.',
    recommended: false,
  },
];

export const mockDocumentationData = {
  id: 'doc-001',
  repositoryId: 'ecommerce-platform',
  repositoryName: 'ecommerce-platform',
  owner: 'facebook',
  type: 'readme',
  title: 'Ecommerce Platform README',
  status: 'completed', // 'idle' | 'generating' | 'completed' | 'failed'
  lastGenerated: '2 minutes ago',

  metadata: {
    version: 3,
    language: 'English',
    tone: 'Professional',
    detailLevel: 'Detailed',
    scope: 'Entire Repository',
    generatedAt: '2026-08-31T11:20:00Z',
  },

  content: `# Ecommerce Platform

A modern, high-performance full-stack e-commerce application built with React, Vite, Node.js, Express, and MongoDB.

## Features

- **User Authentication**: JWT-based login, registration, password hashing with bcrypt, and protected routes.
- **Product Management**: Category browsing, product search, filtering, and inventory tracking.
- **Shopping Cart**: Real-time cart calculations, coupon discount application, and state persistence.
- **Order Processing**: Multi-step checkout, payment gateway integration, and automated invoice generation.
- **Security Audit**: Integrated CORS, IP rate-limiting on sensitive auth routes, and environment secret encryption.

## Tech Stack

| Layer | Technology |
| --- | --- |
| **Frontend** | React 18, Vite, Tailwind CSS v4, shadcn/ui |
| **Backend** | Node.js, Express.js REST API |
| **Database** | MongoDB, Mongoose ODM |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs |

## Architecture

The application follows a **Layered Model-View-Controller (MVC)** architectural pattern:

1. **Client Layer**: React SPA communicating with backend REST endpoints via Axios/Fetch.
2. **Controller Layer** (\`src/controllers/\`): Handles HTTP requests, parameter validation, and response formatting.
3. **Service Layer** (\`src/services/\`): Encapsulates business logic, third-party integrations, and calculations.
4. **Data Access Layer** (\`src/models/\`): Mongoose schemas defining MongoDB document structures and indices.

## Installation & Setup

### Prerequisites

- Node.js (v18.0 or higher)
- npm or yarn
- Local or Cloud MongoDB Instance

### Step-by-Step Guide

1. **Clone the repository**:
   \`\`\`bash
   git clone https://github.com/facebook/ecommerce-platform.git
   cd ecommerce-platform
   \`\`\`

2. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

3. **Configure Environment Variables**:
   Create a \`.env\` file in the root directory:
   \`\`\`env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/ecommerce
   JWT_SECRET=your_super_secret_jwt_key
   NODE_ENV=development
   \`\`\`

4. **Run Local Development Server**:
   \`\`\`bash
   npm run dev
   \`\`\`

## API Usage

### Authentication Endpoints

#### POST /api/auth/login
Authenticates user credentials and returns a signed JWT token.

**Request Payload**:
\`\`\`json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
\`\`\`

**Response (200 OK)**:
\`\`\`json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "usr_123",
    "name": "Aniket Gawade",
    "email": "user@example.com"
  }
}
\`\`\`

## Contributing

We welcome community contributions! Please read our contribution guidelines before submitting pull requests.

## License

Distributed under the MIT License. See \`LICENSE\` for more information.
`,

  sections: [
    {
      id: 'introduction',
      title: 'Introduction',
      content: 'A modern, high-performance full-stack e-commerce application built with React, Vite, Node.js, Express, and MongoDB.',
    },
    {
      id: 'features',
      title: 'Features',
      content: `- **User Authentication**: JWT-based login, registration, password hashing with bcrypt, and protected routes.\n- **Product Management**: Category browsing, product search, filtering, and inventory tracking.\n- **Shopping Cart**: Real-time cart calculations, coupon discount application, and state persistence.\n- **Order Processing**: Multi-step checkout, payment gateway integration, and automated invoice generation.`,
    },
    {
      id: 'tech-stack',
      title: 'Tech Stack',
      content: `| Layer | Technology |\n| --- | --- |\n| **Frontend** | React 18, Vite, Tailwind CSS v4 |\n| **Backend** | Node.js, Express.js REST API |\n| **Database** | MongoDB, Mongoose ODM |`,
    },
    {
      id: 'architecture',
      title: 'Architecture',
      content: `The application follows a **Layered Model-View-Controller (MVC)** architectural pattern:\n\n1. **Client Layer**: React SPA communicating with backend REST endpoints via Axios/Fetch.\n2. **Controller Layer** (\`src/controllers/\`): Handles HTTP requests, parameter validation, and response formatting.`,
    },
    {
      id: 'installation',
      title: 'Installation & Setup',
      content: `1. **Clone repo**: \`git clone https://github.com/facebook/ecommerce-platform.git\`\n2. **Install deps**: \`npm install\`\n3. **Start Server**: \`npm run dev\``,
    },
    {
      id: 'api',
      title: 'API Usage',
      content: `#### POST /api/auth/login\nAuthenticates user credentials and returns a signed JWT token.`,
    },
  ],

  history: [
    {
      version: 3,
      type: 'README',
      date: 'Aug 31, 2026',
      time: '11:20 AM',
      author: 'AI Generator (v3)',
      status: 'Current',
    },
    {
      version: 2,
      type: 'README',
      date: 'Aug 28, 2026',
      time: '04:15 PM',
      author: 'AI Generator (v2)',
      status: 'Archived',
    },
    {
      version: 1,
      type: 'README',
      date: 'Aug 22, 2026',
      time: '09:30 AM',
      author: 'AI Generator (v1)',
      status: 'Archived',
    },
  ],
};
