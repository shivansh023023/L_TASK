'use client';

import { answerQuestionsBasedOnPdfContent } from '@/ai/flows/answer-questions-based-on-pdf-content';
import { PdfInsightsIcon } from '@/components/pdf-insights-icon';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Bot, FileText, Loader2, Send, Upload } from 'lucide-react';
import { useRef, useState } from 'react';

export default function Home() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setError('');
    } else {
      setPdfFile(null);
      setError('Please select a valid PDF file.');
    }
  };

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      setError('Please enter a question.');
      return;
    }
    if (!pdfFile) {
      setError('Please upload a PDF file first.');
      return;
    }

    setError('');
    setIsLoading(true);
    setAnswer('');

    try {
      const pdfDataUri = await fileToDataUri(pdfFile);
      const result = await answerQuestionsBasedOnPdfContent({
        question: question,
        pdfDataUri: pdfDataUri,
      });
      setAnswer(result.answer);
    } catch (e) {
      setError('Failed to get an answer. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const isQueryDisabled = !pdfFile;

  return (
    <div className="flex min-h-screen w-full flex-col bg-background font-body">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <div className="flex items-center gap-2">
          <PdfInsightsIcon className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            PDF Insights
          </h1>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="mx-auto grid max-w-4xl gap-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Upload PDF</CardTitle>
              <CardDescription>
                Select a PDF file from your device.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="application/pdf"
                className="hidden"
                id="pdf-upload"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload PDF
              </Button>
              {pdfFile && (
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-5 w-5" />
                  <span>{pdfFile.name}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Ask a Question</CardTitle>
              <CardDescription>
                Ask anything about the document you provided. This section is
                enabled once you provide a file above.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAskQuestion();
                }}
                className="flex items-center gap-4"
              >
                <Input
                  placeholder="e.g., What is the main conclusion?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  disabled={isQueryDisabled}
                  aria-label="Question Input"
                />
                <Button
                  type="submit"
                  disabled={isQueryDisabled || isLoading || !question.trim()}
                  size="icon"
                  aria-label="Ask question"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {(isLoading || answer || error) && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Bot className="h-6 w-6 text-primary" />
                  <CardTitle>3. Answer</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4" aria-live="polite">
                {isLoading && !answer && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                )}
                {error && <p className="text-destructive">{error}</p>}
                {answer && (
                  <p className="whitespace-pre-wrap text-foreground">
                    {answer}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
