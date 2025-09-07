"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  doc,
  getDoc,
  collection,
  onSnapshot,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Event, Question, Submission } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function EventPage({ params }: { params: { eventId: string } }) {
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [solvedQuestions, setSolvedQuestions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const eventId = params.eventId;

  useEffect(() => {
    if (!eventId) return;
    const fetchEventData = async () => {
      const eventDocRef = doc(db, 'events', eventId);
      const eventSnap = await getDoc(eventDocRef);
      if (eventSnap.exists()) {
        setEvent({ id: eventSnap.id, ...eventSnap.data() } as Event);
      }

      const questionsQuery = collection(db, 'events', eventId, 'questions');
      const unsubscribeQuestions = onSnapshot(questionsQuery, (snapshot) => {
        const fetchedQuestions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
        setQuestions(fetchedQuestions);
        setLoading(false);
      });
      
      return () => unsubscribeQuestions();
    };

    fetchEventData();
  }, [eventId]);
  
  useEffect(() => {
    if (user && questions.length > 0 && eventId) {
      const fetchSubmissions = async () => {
        const q = query(
            collection(db, 'submissions'),
            where('userId', '==', user.uid),
            where('eventId', '==', eventId),
            where('status', '==', 'Accepted')
        );
        const submissionSnap = await getDocs(q);
        const solved = new Set(submissionSnap.docs.map(doc => doc.data().questionId));
        setSolvedQuestions(solved);
      }
      fetchSubmissions();
    }
  }, [user, questions, eventId]);

  if (loading) {
    return (
        <div className='space-y-8'>
            <div className='space-y-2'>
                <Skeleton className='h-8 w-1/3' />
                <Skeleton className='h-5 w-2/3' />
            </div>
            <div className='space-y-4'>
                <Skeleton className='h-24 w-full' />
                <Skeleton className='h-24 w-full' />
                <Skeleton className='h-24 w-full' />
            </div>
        </div>
    )
  }

  if (!event) {
    return <div>Event not found</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">{event.name}</h1>
        <p className="text-muted-foreground mt-2">{event.description}</p>
      </div>
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold font-headline">Challenges</h2>
        {questions.length === 0 ? (
          <p>No challenges have been added to this event yet.</p>
        ) : (
          questions.map(question => {
            const isSolved = solvedQuestions.has(question.id);
            return (
              <Card key={question.id} className="transition-all hover:border-primary">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{question.title}</CardTitle>
                      <CardDescription className="mt-2 flex items-center gap-2">
                        <Badge variant={question.difficulty === 'Easy' ? 'secondary' : question.difficulty === 'Medium' ? 'default' : 'destructive'}>{question.difficulty}</Badge>
                         {isSolved && (
                          <span className="flex items-center gap-1 text-green-400">
                            <CheckCircle2 className="h-4 w-4" /> Solved
                          </span>
                        )}
                      </CardDescription>
                    </div>
                     <Button asChild variant="secondary">
                       <Link href={`/event/${eventId}/solve/${question.id}`}>
                         {isSolved ? 'Review' : 'Solve'} <ArrowRight className="ml-2 h-4 w-4" />
                       </Link>
                     </Button>
                  </div>
                </CardHeader>
              </Card>
            )
          })
        )}
      </div>
    </div>
  );
}
