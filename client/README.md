# HealthHive

HealthHive is a modern web application for tracking, managing, and improving your health and wellness. It features a professional multi-step profile setup, activity and goal tracking, meal planning, and dietary preferences management—all with a clean, accessible UI.

## Features

- **Profile Setup:** Multi-step onboarding for personal details, activity level, health goals, and dietary preferences.
- **Activity & Goal Tracking:** Select and review your activity level and health goals.
- **Meal Planner & Food Search:** Plan meals and search for foods with nutritional information.
- **BMI Calculator:** Calculate and track your BMI history.
- **User Authentication:** Secure login and registration.
- **Professional UI:** Responsive, accessible, and visually appealing design.

## Tech Stack

- **Frontend:** React, CSS (custom styles)
- **Backend:** Node.js, Express
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT, bcrypt

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/tishaafroz/HealthHive.git
   cd HealthHive
   ```

2. **Install dependencies:**
   ```bash
   cd client
   npm install
   cd ../server
   npm install
   ```

3. **Configure environment variables:**
   - Create a `.env` file in the `server` directory.
   - Add your MongoDB URI and any other required secrets:
     ```
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     ```

4. **Run the application:**
   - Start the backend:
     ```bash
     cd server
     npm start
     ```
   - Start the frontend:
     ```bash
     cd ../client
     npm start
     ```

5. **Access the app:**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:5000](http://localhost:5000)

## Folder Structure

```
client/
  src/
    components/
    context/
    pages/
    styles/
    utils/
  public/
  package.json

server/
  controllers/
  middleware/
  models/
  routes/
  config/
  package.json
```

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

