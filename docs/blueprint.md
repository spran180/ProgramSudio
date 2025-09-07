# **App Name**: CodeArena

## Core Features:

- User Authentication: Implement user registration and login using Firebase Authentication (Email/Password), and assign user roles (organizer/participant).
- Event Management: Organizers can create, view, update, and delete coding events, including setting event details (name, dates, description).
- AI Question Generation: Use AI to generate DSA questions based on topic and difficulty.  The tool will generate title, problem description, and starter code in Javascript, Python and C++.
- Code Submission: Participants can submit code solutions for coding challenges through a simple integrated code editor with language selection (JS, Python, C++).
- AI Code Evaluation: Employ an AI code judge to evaluate submitted code for correctness.  The tool should return a status (Accepted/Wrong Answer) and feedback.
- Leaderboard: Display a real-time leaderboard showing rank, name, and score for each event using data fetched via onSnapshot listener from Firestore.
- Event Participation: Participants can view a list of all available coding events and join specific events.

## Style Guidelines:

- Primary color: Vibrant purple (#9F5BBD) to reflect the blend of creativity and technology.
- Background color: Dark gray (#282A3A) for a modern, developer-friendly aesthetic. This will make other elements pop.
- Accent color: Electric blue (#8BE9FD) for interactive elements and highlights, drawing attention without overwhelming the user.
- Body and headline font: 'Inter', a grotesque-style sans-serif font for a modern, machined, objective, neutral look.  Suited for both headers and body text.
- Use simple, line-based icons from a library like 'Feather Icons' to maintain a clean, consistent aesthetic.
- Utilize a three-panel layout on the coding page to provide a dedicated space for the question description, code editor, and feedback display.
- Incorporate subtle animations, such as a loading animation during code evaluation and a celebratory animation upon code acceptance.