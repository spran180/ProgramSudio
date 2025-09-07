"use client";

import { useEffect, useState, useCallback } from 'react';
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  onSnapshot,
  runTransaction,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { evaluateCode } from '@/ai/flows/evaluate-code-submission';
import type { Question, Submission } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, XCircle, Loader } from "lucide-react"
import { Confetti } from '@/components/coding/Confetti';
import { Separator } from '@/components/ui/separator';

type Language = 'javascript' | 'python' | 'cpp';

export default function CodingPage({ params }: { params: { eventId: string; questionId: string } }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<Language>('javascript');
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  const handleLanguageChange = useCallback((value: Language) => {
    setLanguage(value);
    if (question) {
      setCode(question.starterCode[value]);
    }
  }, [question]);

  useEffect(() => {
    const fetchQuestion = async () => {
      setLoading(true);
      const docRef = doc(db, 'events', params.eventId, 'questions', params.questionId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const qData = { id: docSnap.id, ...docSnap.data() } as Question;
        setQuestion(qData);
        setCode(qData.starterCode[language]);
      }
      setLoading(false);
    };
    fetchQuestion();
  }, [params.eventId, params.questionId, language]);

  useEffect(() => {
    if(user) {
        const q = query(
            collection(db, "submissions"), 
            where("userId", "==", user.uid),
            where("eventId", "==", params.eventId),
            where("questionId", "==", params.questionId)
        );
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const subs = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data() } as Submission)).sort((a,b) => b.submittedAt.toMillis() - a.submittedAt.toMillis());
            setSubmissions(subs);
        });
        return () => unsubscribe();
    }
  }, [user, params.eventId, params.questionId]);


  const handleSubmit = async () => {
    if (!user || !question) return;
    setIsSubmitting(true);
    try {
      const evaluation = await evaluateCode({
        code,
        language,
        questionDescription: question.description,
      });

      await addDoc(collection(db, 'submissions'), {
        eventId: params.eventId,
        questionId: params.questionId,
        userId: user.uid,
        code,
        language,
        status: evaluation.status,
        feedback: evaluation.feedback,
        submittedAt: serverTimestamp(),
      });
      
      if (evaluation.status === 'Accepted') {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
        
        // Update leaderboard
        const leaderboardRef = doc(db, 'leaderboards', params.eventId);
        await runTransaction(db, async (transaction) => {
          const leaderboardDoc = await transaction.get(leaderboardRef);
          if (!leaderboardDoc.exists()) { return; }
          const scores = leaderboardDoc.data().scores || [];
          const userScoreIndex = scores.findIndex((s:any) => s.userId === user.uid);

          if (userScoreIndex > -1) {
            scores[userScoreIndex].score += 10; // Assuming 10 points per correct answer
          } else {
            scores.push({ userId: user.uid, displayName: user.displayName, score: 10 });
          }
          transaction.update(leaderboardRef, { scores });
        });

        toast({
          title: 'Accepted!',
          description: evaluation.feedback,
          className: 'bg-green-600 border-green-600 text-white'
        });
      } else {
         toast({
          variant: 'destructive',
          title: 'Wrong Answer',
          description: evaluation.feedback,
        });
      }

    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to submit code.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="grid md:grid-cols-3 gap-8 h-[calc(100vh-10rem)]">
        <Skeleton className="md:col-span-1 h-full" />
        <div className="md:col-span-2 h-full flex flex-col gap-4">
            <Skeleton className="h-full" />
            <Skeleton className="h-full" />
        </div>
    </div>;
  }

  if (!question) return <div>Question not found.</div>;

  return (
    <div className="grid lg:grid-cols-5 gap-8 h-[calc(100vh-8rem)]">
      {showConfetti && <Confetti />}
      {/* Left Panel: Question Description */}
      <ScrollArea className="lg:col-span-2 h-full">
         <div className="pr-4 space-y-4">
            <h1 className="text-2xl font-bold font-headline">{question.title}</h1>
            <Badge variant={question.difficulty === 'Easy' ? 'secondary' : question.difficulty === 'Medium' ? 'default' : 'destructive'}>
                {question.difficulty}
            </Badge>
            <p className="text-muted-foreground whitespace-pre-wrap">{question.description}</p>
        </div>
      </ScrollArea>

      {/* Right side: Editor and Submissions */}
      <div className="lg:col-span-3 h-full flex flex-col gap-4">
        {/* Top: Editor */}
        <div className="flex flex-col flex-grow h-1/2">
            <div className="flex justify-between items-center mb-2">
            <Select onValueChange={handleLanguageChange} defaultValue={language}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="cpp">C++</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? <><Loader className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : 'Submit'}
            </Button>
          </div>
          <Textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-grow h-full resize-none font-code text-base"
            placeholder="Write your code here..."
          />
        </div>
        
        {/* Bottom: Submissions */}
        <Card className="flex-grow h-1/2 flex flex-col">
          <CardHeader>
            <CardTitle>My Submissions</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden">
            <ScrollArea className="h-full">
              <div className="space-y-4">
                {submissions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No submissions yet.</p>
                ) : (
                  submissions.map(sub => (
                    <Alert key={sub.id} variant={sub.status === 'Accepted' ? 'default' : 'destructive'} className={sub.status === 'Accepted' ? 'border-green-500' : ''}>
                      {sub.status === 'Accepted' ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                      <AlertTitle className='flex justify-between'>
                        <span>{sub.status}</span>
                        <span className="text-xs text-muted-foreground font-normal">
                          {sub.submittedAt instanceof Timestamp ? sub.submittedAt.toDate().toLocaleString() : 'Just now'}
                        </span>
                      </AlertTitle>
                      <AlertDescription>
                        {sub.feedback}
                      </AlertDescription>
                    </Alert>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
