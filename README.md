# Plataforma Colaborativa

A collaborative platform with social networking features that allows users to create profiles, share posts, comment, vote, and manage friendships.

## 🚀 Tech Stack

### Backend
- **Framework**: Express.js (TypeScript)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT, bcrypt, Google Auth, Supabase
- **Testing**: Jest
- **API Documentation**: Swagger

### Frontend
- **Framework**: React 19 with TypeScript
- **UI Library**: Material-UI v7
- **Routing**: React Router v7
- **HTTP Client**: Axios

## 📋 Project Structure

### Backend
```
backend/
├── src/
│   ├── config/       # Configuration files
│   ├── controllers/  # Request handlers
│   ├── middlewares/  # Express middlewares
│   ├── models/       # Data models
│   ├── repositories/ # Database access layer
│   ├── routes/       # API routes
│   ├── services/     # Business logic
│   └── index.ts      # Application entry point
├── prisma/          # Prisma schema and migrations
└── tests/           # Unit tests
```

### Frontend
```
frontend/
├── src/
│   ├── components/   # Reusable UI components
│   ├── contexts/     # React contexts
│   ├── models/       # TypeScript interfaces
│   ├── pages/        # Application pages
│   ├── services/     # API services
│   └── theme/        # UI theme configuration
└── public/          # Static assets
```

## 🔧 Setup & Installation

### Prerequisites
- Node.js (v18+)
- PostgreSQL
- npm or yarn

### Environment Variables
Create a `.env` file in the backend directory with the following variables:
```
DATABASE_URL=postgresql://username:password@localhost:5432/dbname
DIRECT_URL=postgresql://username:password@localhost:5432/dbname
JWT_SECRET=your_jwt_secret
PORT=3000
```

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

## 📚 Available Scripts

### Backend
- `npm run dev` - Start development server with hot-reload
- `npm run build` - Build for production
- `npm start` - Run production build
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report

### Frontend
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## 📝 API Documentation

API documentation is available via Swagger UI at `/api-docs` when the backend server is running.

## 🧪 Testing

The project includes unit tests for backend services. Run tests with coverage reporting:

```bash
cd backend
npm run test:coverage
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
