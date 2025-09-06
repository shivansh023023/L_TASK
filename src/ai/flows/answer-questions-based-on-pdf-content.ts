'use server';
/**
 * @fileOverview This file defines a Genkit flow for answering questions based on the content of a PDF.
 *
 * - answerQuestionsBasedOnPdfContent - The main function to answer questions based on PDF content.
 * - AnswerQuestionsBasedOnPdfContentInput - The input type for the answerQuestionsBasedOn-pdf-content function.
 * - AnswerQuestionsBasedOnPdfContentOutput - The output type for the answerQuestionsBasedOn-pdf-content function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {gemini15Flash} from '@genkit-ai/googleai';

const AnswerQuestionsBasedOnPdfContentInputSchema = z.object({
  question: z.string().describe('The question to be answered based on the PDF content.'),
  pdfDataUri: z.string().describe("A PDF file as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."),
});
export type AnswerQuestionsBasedOnPdfContentInput = z.infer<typeof AnswerQuestionsBasedOnPdfContentInputSchema>;

const AnswerQuestionsBasedOnPdfContentOutputSchema = z.object({
  answer: z.string().describe('The answer to the question, generated based on the PDF content and potentially augmented with real-time information.'),
});
export type AnswerQuestionsBasedOnPdfContentOutput = z.infer<typeof AnswerQuestionsBasedOnPdfContentOutputSchema>;

export async function answerQuestionsBasedOnPdfContent(
  input: AnswerQuestionsBasedOnPdfContentInput
): Promise<AnswerQuestionsBasedOnPdfContentOutput> {
  return answerQuestionsBasedOnPdfContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerQuestionsBasedOnPdfContentPrompt',
  input: {schema: AnswerQuestionsBasedOnPdfContentInputSchema},
  output: {schema: AnswerQuestionsBasedOnPdfContentOutputSchema},
  model: gemini15Flash,
  prompt: `You are a helpful AI assistant that answers questions based on the content of a document.

First, extract the text from the provided document. Then, based on the extracted content, answer the user's question.

Question: {{{question}}}
Document: {{media url=pdfDataUri}}`,
});

const answerQuestionsBasedOnPdfContentFlow = ai.defineFlow(
  {
    name: 'answerQuestionsBasedOnPdfContentFlow',
    inputSchema: AnswerQuestionsBasedOnPdfContentInputSchema,
    outputSchema: AnswerQuestionsBasedOnPdfContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
