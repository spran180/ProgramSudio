"use client";

import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Leaderboard } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy } from 'lucide-react';

interface LeaderboardTableProps {
  eventId: string;
}

export function LeaderboardTable({ eventId }: LeaderboardTableProps) {
  const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const leaderboardRef = doc(db, 'leaderboards', eventId);
    const unsubscribe = onSnapshot(leaderboardRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() } as Leaderboard;
        data.scores.sort((a, b) => b.score - a.score);
        setLeaderboard(data);
      } else {
        // Handle case where leaderboard doc might not exist yet
         setLeaderboard({ id: eventId, eventId, scores: [] });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [eventId]);

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-yellow-600';
    return 'text-foreground';
  }

  if (loading) {
    return (
        <div className="space-y-2">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
    );
  }

  return (
    <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Rank</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboard && leaderboard.scores.length > 0 ? (
              leaderboard.scores.map((entry, index) => (
                <TableRow key={entry.userId}>
                  <TableCell className={`font-medium text-lg ${getRankColor(index + 1)}`}>
                    <div className="flex items-center gap-2">
                       {index < 3 && <Trophy className="h-5 w-5" />}
                       <span>{index + 1}</span>
                    </div>
                  </TableCell>
                  <TableCell>{entry.displayName}</TableCell>
                  <TableCell className="text-right font-semibold">{entry.score}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  No scores yet. Be the first to solve a challenge!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
    </div>
  );
}
