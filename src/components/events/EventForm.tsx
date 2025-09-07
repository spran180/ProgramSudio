"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  doc,
  collection,
  addDoc,
  updateDoc,
  Timestamp,
  onSnapshot,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import type { Event, Question } from '@/lib/types';
import type { GenerateDsaQuestionOutput } from '@/ai/flows/generate-dsa-question';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Plus, Trash2, Wand2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { AIQuestionModal } from './AIQuestionModal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '../ui/skeleton';

interface EventFormProps {
  event?: Event;
}

export function EventForm({ event }: EventFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState(event?.name || '');
  const [description, setDescription] = useState(event?.description || '');
  const [startTime, setStartTime] = useState<Date | undefined>(event?.startTime.toDate());
  const [endTime, setEndTime] = useState<Date | undefined>(event?.endTime.toDate());

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [showNewQuestionForm, setShowNewQuestionForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({ difficulty: 'Easy' });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (event) {
      const q = collection(db, 'events', event.id, 'questions');
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedQuestions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
        setQuestions(fetchedQuestions);
        setLoadingQuestions(false);
      });
      return () => unsubscribe();
    } else {
      setLoadingQuestions(false);
    }
  }, [event]);

  const handleAiQuestionGenerated = (generatedQuestion: GenerateDsaQuestionOutput) => {
    setNewQuestion({
      ...newQuestion,
      title: generatedQuestion.title,
      description: generatedQuestion.description,
      starterCode: generatedQuestion.starterCode,
    });
    setShowNewQuestionForm(true);
  };
  
  const handleAddQuestion = async () => {
    if (!event || !newQuestion.title || !newQuestion.description || !newQuestion.starterCode) {
      toast({ variant: 'destructive', title: 'Missing fields', description: 'Please fill all question fields.' });
      return;
    }
    await addDoc(collection(db, 'events', event.id, 'questions'), newQuestion);
    setNewQuestion({ difficulty: 'Easy' });
    setShowNewQuestionForm(false);
    toast({ title: 'Success', description: 'Question added to the event.' });
  };
  
  const handleDeleteQuestion = async (questionId: string) => {
    if (!event) return;
    await deleteDoc(doc(db, 'events', event.id, 'questions', questionId));
    toast({ title: 'Success', description: 'Question removed from the event.' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name || !description || !startTime || !endTime) {
      toast({ variant: 'destructive', title: 'Missing fields', description: 'Please fill all event details.' });
      return;
    }
    setLoading(true);

    const eventData = {
      name,
      description,
      startTime: Timestamp.fromDate(startTime),
      endTime: Timestamp.fromDate(endTime),
      organizerId: user.uid,
    };

    try {
      if (event) {
        await updateDoc(doc(db, 'events', event.id), eventData);
        toast({ title: 'Success', description: 'Event updated successfully.' });
        router.push('/dashboard');
      } else {
        const newEventRef = await addDoc(collection(db, 'events'), eventData);
        // Create an empty leaderboard document
        await addDoc(collection(db, 'leaderboards'), {
            eventId: newEventRef.id,
            scores: []
        });

        toast({ title: 'Success', description: 'Event created successfully.' });
        router.push(`/event/${newEventRef.id}/edit`);
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save event.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">{event ? 'Edit Event' : 'Create Event'}</CardTitle>
          <CardDescription>Fill in the details for your coding event.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Event Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startTime && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startTime ? format(startTime, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={startTime} onSelect={setStartTime} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endTime && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endTime ? format(endTime, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={endTime} onSelect={setEndTime} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          {event && (
            <div>
              <h3 className="text-lg font-semibold mb-4 font-headline">Questions</h3>
              {loadingQuestions ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.map(q => (
                    <div key={q.id} className="flex items-center justify-between p-3 bg-muted rounded-md">
                      <p className="font-medium">{q.title} <span className="text-xs text-muted-foreground ml-2">({q.difficulty})</span></p>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteQuestion(q.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {showNewQuestionForm ? (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>New Question</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input placeholder="Question Title" value={newQuestion.title || ''} onChange={(e) => setNewQuestion({...newQuestion, title: e.target.value})} />
                    <Textarea placeholder="Question Description" value={newQuestion.description || ''} onChange={(e) => setNewQuestion({...newQuestion, description: e.target.value})} rows={5} />
                     <Select onValueChange={(v: 'Easy' | 'Medium' | 'Hard') => setNewQuestion({...newQuestion, difficulty: v})} defaultValue={newQuestion.difficulty}>
                        <SelectTrigger><SelectValue placeholder="Select difficulty" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Easy">Easy</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Hard">Hard</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="space-y-2">
                        <Label>Starter Code (Javascript)</Label>
                        <Textarea className="font-code" placeholder="JS starter code" value={newQuestion.starterCode?.javascript || ''} onChange={(e) => setNewQuestion({...newQuestion, starterCode: {...newQuestion.starterCode!, javascript: e.target.value}})} />
                        <Label>Starter Code (Python)</Label>
                        <Textarea className="font-code" placeholder="Python starter code" value={newQuestion.starterCode?.python || ''} onChange={(e) => setNewQuestion({...newQuestion, starterCode: {...newQuestion.starterCode!, python: e.target.value}})} />
                        <Label>Starter Code (C++)</Label>
                        <Textarea className="font-code" placeholder="C++ starter code" value={newQuestion.starterCode?.cpp || ''} onChange={(e) => setNewQuestion({...newQuestion, starterCode: {...newQuestion.starterCode!, cpp: e.target.value}})} />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowNewQuestionForm(false)}>Cancel</Button>
                      <Button onClick={handleAddQuestion}>Add Question</Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="mt-6 flex gap-2">
                    <Button type="button" variant="outline" onClick={() => {setShowNewQuestionForm(true); setNewQuestion({ difficulty: 'Easy' });}}>
                      <Plus className="mr-2 h-4 w-4" /> Add Question Manually
                    </Button>
                    <Button type="button" onClick={() => setIsAiModalOpen(true)}>
                      <Wand2 className="mr-2 h-4 w-4" /> Generate with AI
                    </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      <div className="mt-6 flex justify-end">
        <Button type="submit" size="lg" disabled={loading}>
          {loading ? 'Saving...' : (event ? 'Save Changes' : 'Create Event')}
        </Button>
      </div>

      <AIQuestionModal
        open={isAiModalOpen}
        onOpenChange={setIsAiModalOpen}
        onQuestionGenerated={handleAiQuestionGenerated}
      />
    </form>
  );
}
