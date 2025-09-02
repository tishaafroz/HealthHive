# HealthHive 🐝

HealthHive is a comprehensive health and wellness platform designed to help users achieve their fitness goals through personalized tracking, meal planning, and wellness analytics. Our modern web application provides an intuitive interface for managing your health journey with advanced features and real-time insights.

![HealthHive Logo](client/public/logo192.png)

## ✨ Features

### User Experience

- **Smart Profile Setup**
  - Multi-step onboarding process
  - Personalized health assessment
  - Dietary preferences configuration
  - Activity level evaluation

### Health Tracking

- **Comprehensive Goal Management**
  - Custom goal setting and tracking
  - Progress visualization
  - Achievement milestones
  - Regular progress updates

### Nutrition Management

- **Advanced Meal Planning**
  - Intelligent meal scheduler
  - Nutritional information tracking
  - Recipe recommendations
  - Food database integration
  - Dietary restriction handling

### Fitness Tools

- **Workout Management**
  - Custom workout plans
  - Exercise tracking
  - Session logging
  - Progress metrics

### Analytics & Insights

- **Health Analytics Dashboard**
  - BMI tracking and history
  - Progress visualization
  - Nutrition analytics
  - Workout statistics

### Additional Features

- **Smart Notifications**
  - Meal reminders
  - Workout schedules
  - Goal achievements
  - Progress updates

## 🛠️ Tech Stack

### Frontend

- **Core:** React 18
- **State Management:** Context API
- **Styling:** Custom CSS with modern design principles
- **UI Components:** Custom components for optimal performance

### Backend

- **Server:** Node.js with Express
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT with bcrypt encryption
- **API:** RESTful architecture

### DevOps

- **Version Control:** Git
- **Deployment:** Ready for deployment on various platforms
- **Environment:** Docker support (coming soon)

## 🚀 Getting Started

### Prerequisites

- Node.js (v16.x or higher)
- npm (v8.x or higher) or yarn (v1.22.x or higher)
- MongoDB (v5.x or higher)
- Git

### Installation

1. **Clone and Setup:**

   ```bash
   # Clone the repository
   git clone https://github.com/tishaafroz/HealthHive.git
   cd HealthHive

   # Install root dependencies (if any)
   npm install
   ```

2. **Frontend Setup:**

   ```bash
   # Navigate to client directory
   cd client
   
   # Install dependencies
   npm install
   
   # Create environment file
   cp .env.example .env.local
   ```

3. **Backend Setup:**

   ```bash
   # Navigate to server directory
   cd ../server
   
   # Install dependencies
   npm install
   
   # Create environment file
   cp .env.example .env
   ```

4. **Environment Configuration:**
   
   Server `.env` configuration:

   ```plaintext
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   ```

5. **Database Setup:**
   - Set up a MongoDB database (local or Atlas)
   - Update the `MONGO_URI` in server `.env`
   - The system will initialize required collections on first run

### Running the Application

1. **Development Mode:**

   ```bash
   # Start backend server (from server directory)
   npm run dev

   # Start frontend (from client directory)
   npm start
   ```

2. **Access Points:**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:5000](http://localhost:5000)
   - API Documentation: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

## 📁 Project Structure

```plaintext
HealthHive/
├── client/                 # Frontend React application
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/      # React Context providers
│   │   ├── pages/        # Page components
│   │   ├── styles/       # CSS styles
│   │   └── utils/        # Utility functions
│   └── package.json
│
├── server/                # Backend Node.js/Express application
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   └── package.json
│
└── README.md             # Project documentation
```

## 🧪 Testing

```bash
# Run frontend tests
cd client && npm test

# Run backend tests
cd server && npm test

# Run E2E tests (coming soon)
npm run test:e2e
```

## 🚀 Deployment

Detailed deployment guides for various platforms:

- [Deploy to Heroku](docs/deploy-heroku.md)
- [Deploy to AWS](docs/deploy-aws.md)
- [Deploy with Docker](docs/deploy-docker.md)

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

For major changes, please open an issue first to discuss what you would like to change.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

