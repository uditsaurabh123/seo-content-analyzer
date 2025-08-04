import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, CheckCircle, AlertCircle, Info } from 'lucide-react';

// SEO analysis functions
function calculateReadability(text: string): number {
  // Basic readability calculation based on sentence and word length
  const words = text.trim().split(/\s+/).length;
  const sentences = text.split(/[.!?]+/).length;
  const characters = text.replace(/\s+/g, '').length;
  
  if (sentences === 0 || words === 0) return 0;
  
  // Simplified Flesch-Kincaid readability score
  const avgWordsPerSentence = words / sentences;
  const avgCharsPerWord = characters / words;
  
  // Map to a 0-100 score where lower avgWordsPerSentence and avgCharsPerWord are better
  const readabilityScore = 100 - (avgWordsPerSentence * 1.8) - (avgCharsPerWord * 8);
  return Math.max(0, Math.min(100, readabilityScore));
}

function analyzeKeywords(text: string): { score: number; keywords: string[] } {
  // Basic keyword density analysis
  const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
  const totalWords = words.length;
  
  if (totalWords === 0) return { score: 0, keywords: [] };
  
  const keywordCounts: Record<string, number> = {};
  words.forEach(word => {
    keywordCounts[word] = (keywordCounts[word] || 0) + 1;
  });
  
  // Sort by frequency
  const sortedKeywords = Object.entries(keywordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([keyword]) => keyword);
  
  // Calculate keyword diversity score
  const uniqueWordRatio = Object.keys(keywordCounts).length / totalWords;
  const keywordScore = Math.min(100, uniqueWordRatio * 150);
  
  return { score: keywordScore, keywords: sortedKeywords };
}

function analyzeHeadings(text: string): { score: number; hasH1: boolean; hasSubheadings: boolean } {
  // Check for heading patterns (simplified version that checks for # markdown or HTML headings)
  const h1Pattern = /^#\s.+|<h1[^>]*>.+<\/h1>/im;
  const subheadingPattern = /^#{2,}\s.+|<h[2-6][^>]*>.+<\/h[2-6]>/gim;
  
  const hasH1 = h1Pattern.test(text);
  const subheadingsMatch = text.match(subheadingPattern);
  const hasSubheadings = subheadingsMatch !== null && subheadingsMatch.length > 0;
  
  let score = 0;
  if (hasH1) score += 50;
  if (hasSubheadings) score += 50;
  
  return { score, hasH1, hasSubheadings };
}

function calculateWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function getSEOSuggestions(text: string): {
  readability: string[];
  keywords: string[];
  structure: string[];
  general: string[];
} {
  const wordCount = calculateWordCount(text);
  const { score: readabilityScore } = { score: calculateReadability(text) };
  const { keywords } = analyzeKeywords(text);
  const { hasH1, hasSubheadings } = analyzeHeadings(text);

  const suggestions = {
    readability: [] as string[],
    keywords: [] as string[],
    structure: [] as string[],
    general: [] as string[],
  };

  // Readability suggestions
  if (readabilityScore < 50) {
    suggestions.readability.push('Use shorter sentences to improve readability.');
    suggestions.readability.push('Break up long paragraphs into smaller ones.');
  }
  if (text.includes('very') || text.includes('really')) {
    suggestions.readability.push('Replace generic intensifiers like "very" and "really" with more specific words.');
  }

  // Keyword suggestions
  if (keywords.length < 3) {
    suggestions.keywords.push('Include more relevant keywords throughout your content.');
  } else {
    suggestions.keywords.push(`Consider focusing on these keywords: ${keywords.slice(0, 3).join(', ')}.`);
  }
  
  // Structure suggestions
  if (!hasH1) {
    suggestions.structure.push('Add a clear H1 title to your content.');
  }
  if (!hasSubheadings) {
    suggestions.structure.push('Add subheadings (H2, H3) to break up your content and improve structure.');
  }
  
  // General suggestions
  if (wordCount < 300) {
    suggestions.general.push('Consider adding more content. Articles with 1000+ words tend to perform better in search results.');
  }
  suggestions.general.push('Include external links to authoritative sources to improve credibility.');
  suggestions.general.push('Add internal links to other relevant content on your site.');
  
  return suggestions;
}

export default function SEOAnalyzer() {
  const [content, setContent] = useState('');
  const [analyzed, setAnalyzed] = useState(false);
  const [readabilityScore, setReadabilityScore] = useState(0);
  const [keywordScore, setKeywordScore] = useState(0);
  const [structureScore, setStructureScore] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [suggestions, setSuggestions] = useState({
    readability: [] as string[],
    keywords: [] as string[],
    structure: [] as string[],
    general: [] as string[],
  });

  const handleAnalyze = () => {
    if (!content.trim()) return;
    
    // Calculate scores
    const readability = calculateReadability(content);
    const keywords = analyzeKeywords(content);
    const headings = analyzeHeadings(content);
    const words = calculateWordCount(content);
    
    // Update state
    setReadabilityScore(readability);
    setKeywordScore(keywords.score);
    setStructureScore(headings.score);
    setWordCount(words);
    setSuggestions(getSEOSuggestions(content));
    setAnalyzed(true);
  };

  const overallScore = analyzed 
    ? Math.round((readabilityScore + keywordScore + structureScore) / 3) 
    : 0;

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-500";
    if (score >= 40) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
          SEO Content Analyzer
        </h1>
        <p className="text-lg text-muted-foreground">
          Paste your article below and get actionable SEO suggestions
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Content</CardTitle>
          <CardDescription>Paste your article or blog post here</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea 
            placeholder="Paste your content here..." 
            className="min-h-[200px] mb-4"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="flex justify-end">
            <Button 
              onClick={handleAnalyze}
              disabled={!content.trim()}
              className="flex items-center gap-2"
            >
              Analyze Content <ArrowRight size={16} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {analyzed && (
        <>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>SEO Score</CardTitle>
              <CardDescription>Overall analysis of your content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center justify-center">
                <div className={`text-6xl font-bold mb-2 ${getScoreColor(overallScore)}`}>
                  {overallScore}
                </div>
                <Progress value={overallScore} className="h-2 w-64" />
                <div className="text-sm text-muted-foreground mt-2">
                  {wordCount} words analyzed
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex flex-col items-center p-4 border rounded-lg">
                  <span className="text-sm font-medium mb-1">Readability</span>
                  <span className={`text-3xl font-bold ${getScoreColor(readabilityScore)}`}>{Math.round(readabilityScore)}</span>
                </div>
                <div className="flex flex-col items-center p-4 border rounded-lg">
                  <span className="text-sm font-medium mb-1">Keywords</span>
                  <span className={`text-3xl font-bold ${getScoreColor(keywordScore)}`}>{Math.round(keywordScore)}</span>
                </div>
                <div className="flex flex-col items-center p-4 border rounded-lg">
                  <span className="text-sm font-medium mb-1">Structure</span>
                  <span className={`text-3xl font-bold ${getScoreColor(structureScore)}`}>{Math.round(structureScore)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Improvement Suggestions</CardTitle>
              <CardDescription>Actionable steps to improve your content</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="readability" className="w-full">
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="readability">Readability</TabsTrigger>
                  <TabsTrigger value="keywords">Keywords</TabsTrigger>
                  <TabsTrigger value="structure">Structure</TabsTrigger>
                  <TabsTrigger value="general">General</TabsTrigger>
                </TabsList>
                
                <TabsContent value="readability" className="space-y-4">
                  {suggestions.readability.length > 0 ? (
                    suggestions.readability.map((suggestion, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg">
                        <AlertCircle className="text-yellow-500 h-5 w-5 mt-0.5 shrink-0" />
                        <p>{suggestion}</p>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <CheckCircle className="text-green-500 h-5 w-5 mt-0.5 shrink-0" />
                      <p>Great job! Your content is easy to read.</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="keywords" className="space-y-4">
                  {suggestions.keywords.length > 0 ? (
                    suggestions.keywords.map((suggestion, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg">
                        <Info className="text-blue-500 h-5 w-5 mt-0.5 shrink-0" />
                        <p>{suggestion}</p>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <CheckCircle className="text-green-500 h-5 w-5 mt-0.5 shrink-0" />
                      <p>Your keyword usage is well-optimized!</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="structure" className="space-y-4">
                  {suggestions.structure.length > 0 ? (
                    suggestions.structure.map((suggestion, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg">
                        <AlertCircle className="text-yellow-500 h-5 w-5 mt-0.5 shrink-0" />
                        <p>{suggestion}</p>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <CheckCircle className="text-green-500 h-5 w-5 mt-0.5 shrink-0" />
                      <p>Your content structure is well-organized!</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="general" className="space-y-4">
                  {suggestions.general.map((suggestion, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg">
                      <Info className="text-blue-500 h-5 w-5 mt-0.5 shrink-0" />
                      <p>{suggestion}</p>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="outline" onClick={() => setAnalyzed(false)}>
                Analyze New Content
              </Button>
            </CardFooter>
          </Card>
        </>
      )}
    </div>
  );
}