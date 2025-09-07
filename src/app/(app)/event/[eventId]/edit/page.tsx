"use client";

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Event } from '@/lib/types';
import { EventForm } from '@/components/events/EventForm';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditEventPage({ params }: { params: { eventId: string } }) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const { eventId } = params;

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
            <Skeleton className="h-10 w-1/4" />
            <Skeleton className="h-6 w-1/2" />
            <div className="space-y-4 pt-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-24 w-full" />
                <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </div>
        </div>
    )
  }

  if (!event) {
    return <div>Event not found.</div>;
  }

  return (
    <div>
      <EventForm event={event} />
    </div>
  );
}
