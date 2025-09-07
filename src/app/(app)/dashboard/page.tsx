"use client";

import { useAuth } from '@/hooks/use-auth';
import type { Event, User } from '@/lib/types';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  deleteDoc,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle, Trash2, Pencil, BarChart, Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

function OrganizerDashboard({ user }: { user: User }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const q = query(collection(db, 'events'), where('organizerId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const eventsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Event));
      setEvents(eventsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user.uid]);

  const handleDeleteEvent = async () => {
    if (!selectedEventId) return;

    try {
      const batch = writeBatch(db);
      
      const questionsSnapshot = await getDocs(collection(db, 'events', selectedEventId, 'questions'));
      questionsSnapshot.forEach(doc => batch.delete(doc.ref));

      const submissionsSnapshot = await getDocs(query(collection(db, 'submissions'), where('eventId', '==', selectedEventId)));
      submissionsSnapshot.forEach(doc => batch.delete(doc.ref));

      const leaderboardRef = doc(db, 'leaderboards', selectedEventId);
      batch.delete(leaderboardRef);

      const eventRef = doc(db, 'events', selectedEventId);
      batch.delete(eventRef);

      await batch.commit();

      toast({ title: 'Success', description: 'Event and all related data deleted.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete event.' });
    } finally {
      setShowDeleteDialog(false);
      setSelectedEventId(null);
    }
  };
  
  const openDeleteDialog = (eventId: string) => {
    setSelectedEventId(eventId);
    setShowDeleteDialog(true);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold font-headline">My Events</h1>
        <Button asChild>
          <Link href="/event/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Event
          </Link>
        </Button>
      </div>

      {loading ? (
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48" />)}
         </div>
      ) : events.length === 0 ? (
        <p>You haven&apos;t created any events yet.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{event.name}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                         <Link href={`/event/${event.id}/edit`} className="cursor-pointer">
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                         </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openDeleteDialog(event.id)} className="text-red-500 focus:text-red-500 cursor-pointer">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription>{event.description}</CardDescription>
              </CardHeader>
               <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm" asChild>
                    <Link href={`/event/${event.id}/leaderboard`}><BarChart className="mr-2 h-4 w-4"/>Leaderboard</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href={`/event/${event.id}/edit`}>Manage Event</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
       <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the event and all its questions, submissions, and leaderboard data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEvent} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ParticipantDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'events'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const eventsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Event));
      setEvents(eventsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 font-headline">Available Events</h1>
       {loading ? (
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48" />)}
         </div>
      ) : events.length === 0 ? (
        <p>There are no available events at the moment.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <CardTitle>{event.name}</CardTitle>
                <CardDescription>{event.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  <p>Starts: {event.startTime.toDate().toLocaleString()}</p>
                  <p>Ends: {event.endTime.toDate().toLocaleString()}</p>
                </div>
              </CardContent>
              <CardFooter>
                 <Button className="w-full" asChild>
                  <Link href={`/event/${event.id}`}><Eye className="mr-2 h-4 w-4"/> View Event</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return (
       <div className="flex items-center justify-center h-full">
         <Skeleton className="w-full h-64" />
       </div>
    )
  }

  return user.role === 'organizer' ? <OrganizerDashboard user={user} /> : <ParticipantDashboard />;
}
