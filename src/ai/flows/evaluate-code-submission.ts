'use server';

/**
 * @fileOverview This file defines a Genkit flow for evaluating code submissions using AI.
 *
 * - evaluateCode - An exported function that triggers the code evaluation flow.
 * - EvaluateCodeInput - The input type for the evaluateCode function, defining the structure for code, language, and question details.
 * - EvaluateCodeOutput - The output type for the evaluateCode function, defining the structure for the evaluation result, including status and feedback.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EvaluateCodeInputSchema = z.object({
  code: z.string().describe('The code submitted by the user.'),
  language: z.string().describe('The programming language of the code (e.g., JavaScript, Python, C++).'),
  questionDescription: z.string().describe('The description of the coding question.'),
});

export type EvaluateCodeInput = z.infer<typeof EvaluateCodeInputSchema>;

const EvaluateCodeOutputSchema = z.object({
  status: z.enum(['Accepted', 'Wrong Answer']).describe('The evaluation status of the code.'),
  feedback: z.string().describe('Feedback from the AI on the code submission.'),
});

export type EvaluateCodeOutput = z.infer<typeof EvaluateCodeOutputSchema>;

export async function evaluateCode(input: EvaluateCodeInput): Promise<EvaluateCodeOutput> {
  return evaluateCodeFlow(input);
}

const evaluateCodePrompt = ai.definePrompt({
  name: 'evaluateCodePrompt',
  input: {schema: EvaluateCodeInputSchema},
  output: {schema: EvaluateCodeOutputSchema},
  prompt: `You are a code judge. Evaluate the following {{{language}}} code to solve the problem: '{{{questionDescription}}}'. The user's code is: '{{{code}}}'. Check for correctness, but not for performance or edge cases. Respond with a single, clean JSON object with two keys: 'status' (either 'Accepted' or 'Wrong Answer') and 'feedback' (a one-sentence explanation of what is good or what might be wrong, e.g., 'Your logic correctly solves the main test case.' or 'Your solution doesn't seem to handle empty arrays correctly.').`,
});

const evaluateCodeFlow = ai.defineFlow(
  {
    name: 'evaluateCodeFlow',
    inputSchema: EvaluateCodeInputSchema,
    outputSchema: EvaluateCodeOutputSchema,
  },
  async input => {
    const {output} = await evaluateCodePrompt(input);
    return output!;
  }
);
