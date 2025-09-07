# Firebase Studio

A Next.js application with Firebase integration and AI capabilities using Google's Genkit framework.

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Google AI API key
- Firebase project

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd ProgramSudio-Firebase
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the environment template and configure your API keys:

```bash
cp .env.example .env
```

Edit `.env` file with your actual API keys:

#### Google AI API Key (Required for AI features)

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create an API key
3. Add it to your `.env` file:

```env
GOOGLE_API_KEY=your_google_ai_api_key_here
```

#### Firebase Configuration (Required for Firebase features)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create or select your project
3. Go to **Project Settings** > **General** > **Your apps**
4. Click **Firebase SDK snippet** > **Config**
5. Copy the values to your `.env` file:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id_here
```

### 4. Run the Application

#### Development Server (Main App)

```bash
npm run dev
```

The app will be available at [http://localhost:9002](http://localhost:9002)

#### AI Development Server (Genkit)

```bash
npm run genkit:dev
```

The Genkit Developer UI will be available at [http://localhost:4000](http://localhost:4000)

#### AI Development with Auto-reload

```bash
npm run genkit:watch
```

## 📝 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run genkit:dev` - Start Genkit AI development server
- `npm run genkit:watch` - Start Genkit with file watching
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## 🛠️ Tech Stack

- **Framework**: Next.js 15.3.3 with Turbopack
- **AI**: Google Genkit with Gemini 2.5 Flash
- **Backend**: Firebase (Auth, Firestore)
- **UI**: Radix UI components with Tailwind CSS
- **Language**: TypeScript
- **Forms**: React Hook Form with Zod validation

## 📁 Project Structure

```
src/
├── ai/                 # AI flows and Genkit configuration
│   ├── flows/         # AI flow definitions
│   ├── genkit.ts      # Genkit setup
│   └── dev.ts         # Development entry point
├── app/               # Next.js app directory
├── components/        # React components
└── lib/               # Utility functions and configurations
    └── firebase.ts    # Firebase configuration
```

## 🔧 Troubleshooting

### Common Issues

1. **Module not found errors after cloning**

   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Genkit API key error**

   - Ensure `GOOGLE_API_KEY` is set in your `.env` file
   - Verify the API key is valid at [Google AI Studio](https://aistudio.google.com/app/apikey)

3. **Firebase connection issues**
   - Check all Firebase environment variables are correctly set
   - Verify your Firebase project is active and properly configured

### Getting Help

- Check the [Next.js documentation](https://nextjs.org/docs)
- Review [Firebase documentation](https://firebase.google.com/docs)
- Explore [Genkit documentation](https://genkit.dev/docs)

## 🚀 Getting Started with Development

1. Start with `src/app/page.tsx` for the main application
2. Explore AI flows in `src/ai/flows/`
3. Configure Firebase rules and security settings
4. Customize UI components in `src/components/`

Happy coding! 🎉
