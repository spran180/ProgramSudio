import type { Timestamp } from 'firebase/firestore';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'organizer' | 'participant';
}

export interface Event {
  id: string;
  name: string;
  description: string;
  startTime: Timestamp;
  endTime: Timestamp;
  organizerId: string;
}

export interface Question {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  starterCode: {
    javascript: string;
    python: string;
    cpp: string;
  };
}

export interface Submission {
  id: string;
  eventId: string;
  questionId: string;
  userId: string;
  code: string;
  language: string;
  status: 'Pending' | 'Accepted' | 'Wrong Answer';
  feedback: string;
  submittedAt: Timestamp;
}

export interface Leaderboard {
  id: string;
  eventId: string;
  scores: {
    userId: string;
    displayName: string;
    score: number;
  }[];
}
