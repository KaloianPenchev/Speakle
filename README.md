# Speakle - Smart Glove

Speakle is an innovative application designed to assist individuals who are deaf or hard of hearing. It integrates with a smart glove device to translate sign language into text and speech, facilitating better communication.

## Project Structure

The project consists of two main components:

1. **Backend (Node.js Server)**
   - Located in the `mobile-app/backend` directory
   - Handles API requests, user authentication, and text-to-speech functionality

2. **Frontend (React Native)**
   - Located in the `mobile-app/frontend` directory
   - User interface for sign-up, login, settings, and live conversations

## API Service Structure

The frontend API interaction is organized into a clean, modular structure:

### Services Organization

- `services/apiClient.js` - Base axios client setup with configuration
- `services/authService.js` - Authentication-related API functions (login, signup, logout)
- `services/profileService.js` - User profile management functions
- `services/ttsService.js` - Text-to-speech API functions
- `services/index.js` - Central export point for all services

### Usage Example

```javascript
// Import specific services
import { authService, profileService, ttsService } from '../services';

// For authentication
const login = async () => {
  try {
    const userData = await authService.login(email, password);
    // Handle successful login
  } catch (error) {
    // Handle error
  }
};

// For profile operations
const loadProfile = async () => {
  try {
    const profileData = await profileService.getProfile();
    // Use profile data
  } catch (error) {
    // Handle error
  }
};

// For text-to-speech
const speakText = async (text) => {
  try {
    await ttsService.convertTextToSpeech(text, voiceId);
  } catch (error) {
    // Handle error
  }
};
```

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Supabase account for database and authentication
- OpenAI API key for text-to-speech functionality

## Setup Instructions

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd mobile-app/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=3000
   OPENAI_API_KEY=your_openai_api_key
   JWT_SECRET=your_jwt_secret
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. Set up Supabase:
   - Create a new Supabase project
   - Run the SQL scripts in `mobile-app/backend/config/` to set up the database schema and policies
   - Get your API keys from the Supabase dashboard

5. Start the server:
   ```bash
   npm start
   ```

### 2. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd mobile-app/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend directory with:
   ```
   API_URL=http://your-backend-ip:3000
   ```

4. Start the React Native development server:
   ```bash
   npm start
   ```

## Troubleshooting

### Supabase Row-Level Security (RLS) Issues

If you encounter RLS policy errors:

1. Ensure the `SUPABASE_SERVICE_ROLE_KEY` is correctly set in your backend `.env` file
2. Run the SQL scripts in `mobile-app/backend/config/profiles_rls_policy.sql` to set up proper RLS policies
3. Make sure the service role key has the necessary permissions

### Voice Selection Issues

If you encounter issues with the voice selection:

1. Check that the `voice` column in your Supabase `profiles` table is defined as an integer with a default value (0)
2. Verify that the voice parameter is correctly passed from the frontend to the backend

## API Endpoints

### Authentication

- `POST /auth/signup` - Create a new user account
- `POST /auth/login` - Authenticate a user
- `GET /auth/logout` - Log out a user

### Profiles

- `GET /profile` - Get the current user's profile
- `PUT /profile` - Update the current user's profile

### Text-to-Speech

- `POST /tts` - Convert text to speech

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
