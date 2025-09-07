"use client";

import { useState } from 'react';
import { generateDsaQuestion } from '@/ai/flows/generate-dsa-question';
import type { GenerateDsaQuestionOutput } from '@/ai/flows/generate-dsa-question';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Wand2 } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

interface AIQuestionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuestionGenerated: (question: GenerateDsaQuestionOutput) => void;
}

export function AIQuestionModal({ open, onOpenChange, onQuestionGenerated }: AIQuestionModalProps) {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic) {
      toast({
        variant: 'destructive',
        title: 'Topic is required',
        description: 'Please enter a topic for the question.',
      });
      return;
    }
    setLoading(true);
    try {
      const question = await generateDsaQuestion({ topic, difficulty });
      onQuestionGenerated(question);
      toast({
        title: 'Question Generated!',
        description: 'The new question has been added to the form.',
      });
      onOpenChange(false);
      setTopic('');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'Could not generate a question. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            Generate Question with AI
          </DialogTitle>
          <DialogDescription>
            Describe the topic and difficulty, and let AI create a new DSA question for your event.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="topic" className="text-right">
              Topic
            </Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Arrays, Graphs, Dynamic Programming"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="difficulty" className="text-right">
              Difficulty
            </Label>
            <Select
              onValueChange={(value: 'Easy' | 'Medium' | 'Hard') => setDifficulty(value)}
              defaultValue={difficulty}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {loading && (
            <div className='space-y-2'>
                <Skeleton className='h-4 w-1/3' />
                <Skeleton className='h-10 w-full' />
                <Skeleton className='h-4 w-1/4' />
                <Skeleton className='h-20 w-full' />
            </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? 'Generating...' : 'Generate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
