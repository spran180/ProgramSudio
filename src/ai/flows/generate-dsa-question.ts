'use server';

/**
 * @fileOverview A flow for generating DSA questions with AI.
 *
 * - generateDsaQuestion - A function that generates a DSA question based on topic and difficulty.
 * - GenerateDsaQuestionInput - The input type for the generateDsaQuestion function.
 * - GenerateDsaQuestionOutput - The return type for the generateDsaQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDsaQuestionInputSchema = z.object({
  topic: z.string().describe('The topic of the DSA question (e.g., Arrays, Graphs).'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).describe('The difficulty level of the DSA question.'),
});
export type GenerateDsaQuestionInput = z.infer<typeof GenerateDsaQuestionInputSchema>;

const GenerateDsaQuestionOutputSchema = z.object({
  title: z.string().describe('The title of the DSA question.'),
  description: z.string().describe('A detailed problem description for the DSA question.'),
  starterCode: z.object({
    javascript: z.string().describe('Starter code snippet for JavaScript.'),
    python: z.string().describe('Starter code snippet for Python.'),
    cpp: z.string().describe('Starter code snippet for C++.'),
  }).describe('Starter code snippets for different languages.'),
});
export type GenerateDsaQuestionOutput = z.infer<typeof GenerateDsaQuestionOutputSchema>;

export async function generateDsaQuestion(input: GenerateDsaQuestionInput): Promise<GenerateDsaQuestionOutput> {
  return generateDsaQuestionFlow(input);
}

const generateDsaQuestionPrompt = ai.definePrompt({
  name: 'generateDsaQuestionPrompt',
  input: {schema: GenerateDsaQuestionInputSchema},
  output: {schema: GenerateDsaQuestionOutputSchema},
  prompt: `Generate a DSA coding question about {{topic}} with {{difficulty}} difficulty. 
Provide a title, a detailed problem description, and starter code snippets for JavaScript, Python, and C++.
Return the response as a single, clean JSON object with keys: 'title', 'description', and 'starterCode' (which itself is an object with language keys).`,
});

const generateDsaQuestionFlow = ai.defineFlow(
  {
    name: 'generateDsaQuestionFlow',
    inputSchema: GenerateDsaQuestionInputSchema,
    outputSchema: GenerateDsaQuestionOutputSchema,
  },
  async input => {
    const {output} = await generateDsaQuestionPrompt(input);
    return output!;
  }
);
