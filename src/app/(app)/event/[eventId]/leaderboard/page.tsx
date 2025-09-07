"use client";

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Event } from '@/lib/types';
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable';
import { Skeleton } from '@/components/ui/skeleton';

export default function LeaderboardPage({ params }: { params: { eventId: string } }) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const eventId = params.eventId;

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;
      const docRef = doc(db, 'events', eventId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setEvent({ id: docSnap.id, ...docSnap.data() } as Event);
      }
      setLoading(false);
    };
    fetchEvent();
  }, [eventId]);

  if (loading) {
    return (
        <div className="space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-6 w-1/2" />
            <div className="mt-8 space-y-2">
                 <Skeleton className="h-12 w-full" />
                 <Skeleton className="h-12 w-full" />
                 <Skeleton className="h-12 w-full" />
            </div>
        </div>
    );
  }

  if (!event) {
    return <div>Event not found.</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-primary font-semibold">Leaderboard</p>
        <h1 className="text-3xl font-bold font-headline">{event.name}</h1>
      </div>
      <LeaderboardTable eventId={eventId} />
    </div>
  );
}
