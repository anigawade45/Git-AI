export const mockAIChatData = {
  suggestedQuestions: [
    "How does authentication work in this repository?",
    "Explain the overall project architecture and data flow.",
    "Where is user registration implemented?",
    "Find all REST API endpoints and controllers.",
    "Explain the database structure and Mongoose schemas.",
    "Generate documentation for the authentication module.",
  ],

  conversations: [
    {
      id: 'conv_1',
      title: 'Authentication Flow & JWT',
      timestamp: 'TODAY',
      updatedAt: '10 minutes ago',
      repoId: 'ecommerce-platform',
      messages: [
        {
          id: 'msg_1',
          role: 'user',
          content: 'How does authentication work in this repository?',
          timestamp: '10:42 AM',
        },
        {
          id: 'msg_2',
          role: 'assistant',
          content: `Authentication in **ecommerce-platform** is implemented using **JSON Web Tokens (JWT)** and **bcryptjs** password hashing.

### Authentication Flow Stages:
1. **User Credentials Submission**: The client sends email & password via \`POST /api/auth/login\`.
2. **User Lookup & Password Comparison**: \`authController.js\` queries the User model and verifies the password hash using \`bcrypt.compare()\`.
3. **JWT Token Generation**: Upon successful authentication, a JWT payload signed with \`JWT_SECRET\` (valid for 7 days) is returned to the client.
4. **Client Token Storage**: The client service \`authService.js\` stores the token in \`localStorage\` for authorization in subsequent requests.

### Core Implementation Files:
Below are the exact source files and line ranges responsible for this workflow:`,
          timestamp: '10:42 AM',
          sources: [
            {
              fileName: 'authController.js',
              filePath: 'src/controllers/authController.js',
              startLine: 12,
              endLine: 45,
              language: 'javascript',
            },
            {
              fileName: 'authService.js',
              filePath: 'src/services/authService.js',
              startLine: 6,
              endLine: 24,
              language: 'javascript',
            },
            {
              fileName: 'User.js',
              filePath: 'src/models/User.js',
              startLine: 3,
              endLine: 28,
              language: 'javascript',
            },
          ],
        },
      ],
    },
    {
      id: 'conv_2',
      title: 'API Architecture & Controllers',
      timestamp: 'TODAY',
      updatedAt: '2 hours ago',
      repoId: 'ecommerce-platform',
      messages: [
        {
          id: 'msg_3',
          role: 'user',
          content: 'Explain the overall project architecture and data flow.',
          timestamp: '8:15 AM',
        },
        {
          id: 'msg_4',
          role: 'assistant',
          content: `The repository follows a clean **MERN Layered Architecture** with distinct separations of concerns:

- **Models (\`src/models/\`)**: Mongoose schemas defining data entities (User, Product, Order).
- **Controllers (\`src/controllers/\`)**: Request handlers encapsulating business logic and HTTP responses.
- **Services (\`src/services/\`)**: Modular frontend API clients for HTTP requests.
- **Components (\`src/components/\`)**: Reusable React UI view components.`,
          timestamp: '8:15 AM',
          sources: [
            {
              fileName: 'App.jsx',
              filePath: 'src/App.jsx',
              startLine: 1,
              endLine: 15,
              language: 'javascript',
            },
            {
              fileName: 'package.json',
              filePath: 'package.json',
              startLine: 1,
              endLine: 25,
              language: 'json',
            },
          ],
        },
      ],
    },
    {
      id: 'conv_3',
      title: 'Database Schema & Models',
      timestamp: 'YESTERDAY',
      updatedAt: 'Yesterday',
      repoId: 'ecommerce-platform',
      messages: [
        {
          id: 'msg_5',
          role: 'user',
          content: 'Explain the database structure and Mongoose schemas.',
          timestamp: 'Yesterday 4:30 PM',
        },
        {
          id: 'msg_6',
          role: 'assistant',
          content: `The database uses MongoDB with Mongoose object modeling. The **User** schema includes fields for \`name\`, \`email\` (unique), \`password\` (hashed), and \`role\` (\`user\` | \`admin\`) with timestamps enabled.`,
          timestamp: 'Yesterday 4:30 PM',
          sources: [
            {
              fileName: 'User.js',
              filePath: 'src/models/User.js',
              startLine: 3,
              endLine: 28,
              language: 'javascript',
            },
          ],
        },
      ],
    },
  ],
};
