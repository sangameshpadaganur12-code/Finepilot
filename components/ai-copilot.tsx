'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Sparkles, Loader2, Copy, Check, AlertTriangle, MessageSquare, X } from 'lucide-react';
import { formatINR, formatINRShort } from '@/lib/format';
import type { CopilotContext, DecisionAction } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  calculations?: Record<string, number>;
}

interface AICopilotProps {
  context: CopilotContext;
  actions: DecisionAction[];
  enabled?: boolean;
}

const SUGGESTED_QUESTIONS = [
  "Can I afford a ₹20 lakh car?",
  "How much SIP should I invest?",
  "Where am I overspending?",
  "Can I reach my house goal?",
  "Is my portfolio diversified?",
  "What should I change this month?",
  "How much emergency fund do I need?",
  "Should I increase my SIP?",
];

const SYSTEM_PROMPT = `You are FinPilot's AI Financial Copilot. You provide concise, actionable financial guidance based on the user's REAL financial data.

CRITICAL RULES:
1. ONLY use the provided context data - never make up numbers
2. Show calculations explicitly: "₹X + ₹Y = ₹Z"
3. Label all projections as ESTIMATES with assumed returns
4. Never guarantee returns or give personalized investment advice
5. Be concise - 3-5 sentences max per answer
6. Always cite the specific numbers from context
7. If unsure, say "I don't have enough data to answer precisely"

Your tone: Professional, encouraging, analytical. Use Indian Rupee format (₹).`;

export function AICopilot({ context, actions, enabled = true }: AICopilotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const addMessage = (role: 'user' | 'assistant', content: string, calculations?: Record<string, number>) => {
    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      role,
      content,
      timestamp: new Date(),
      calculations,
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const buildContextString = (): string => {
    return `
USER FINANCIAL CONTEXT:
- Monthly Income: ${formatINR(context.income)}
- Monthly Expenses: ${formatINR(context.expenses)} (Fixed: ${formatINR(context.fixedExpenses)}, Variable: ${formatINR(context.variableExpenses)})
- Monthly Investable Surplus: ${formatINR(context.monthlyInvestable)}
- Savings Rate: ${context.savingsRate.toFixed(1)}%
- Net Worth: ${formatINR(context.netWorth)}
- Emergency Fund Coverage: ${context.emergencyMonths.toFixed(1)} months
- Financial Health Score: ${context.financialHealthScore}/100
- Risk Profile: ${context.riskProfile}
- Investment Horizon: ${context.investmentHorizon}
- Primary Goal: ${context.primaryGoal}

GOALS:
${context.goals.map(g => `- ${g.name}: Target ${formatINR(g.target)} by ${g.targetYear}, Current ${formatINR(g.current)}, Monthly SIP ${formatINR(g.monthlyContribution)}`).join('\n')}

PORTFOLIO:
${context.portfolio.map(p => `- ${p.name} (${p.assetClass}): ${formatINR(p.value)} on ${p.platform}`).join('\n')}

PORTFOLIO ALLOCATION:
${context.portfolioAllocation.map(a => `- ${a.assetClass}: ${a.share.toFixed(1)}% (${formatINR(a.value)})`).join('\n')}

BUDGET:
${context.budget.map(b => `- ${b.name}: Budget ${formatINR(b.budgeted)}, Actual ${formatINR(b.actual)}${b.overspent ? ' ⚠️ OVER' : ''}`).join('\n')}

SIP ALLOCATION:
${context.sipAllocation.map(s => `- ${s.category}: ${s.percentage}% (${formatINR(s.monthlyAmount)}/mo) - ${s.rationale}`).join('\n')}

TOP PRIORITY ACTIONS:
${context.topActions.map(a => `- ${a.title} (${a.category}): ${a.action}`).join('\n')}
`.trim();
  };

  const callNemotronAPI = async (userMessage: string): Promise<{ content: string; calculations?: Record<string, number> }> => {
    const contextString = buildContextString();
    
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'system', content: `CURRENT CONTEXT:\n${contextString}` },
      { role: 'user', content: userMessage },
    ];

    try {
      const response = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        content: data.content || 'I apologize, but I couldn\'t generate a response. Please try again.',
        calculations: data.calculations,
      };
    } catch (error) {
      console.error('Nemotron API error:', error);
      return {
        content: 'I\'m having trouble connecting to the AI service. Please try again in a moment.',
        calculations: undefined,
      };
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setShowSuggestions(false);
    addMessage('user', userMessage);
    setIsLoading(true);

    try {
      const { content, calculations } = await callNemotronAPI(userMessage);
      addMessage('assistant', content, calculations);
    } catch (error) {
      addMessage('assistant', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (question: string) => {
    setInput(question);
    handleSend();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!enabled) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">AI Copilot Unavailable</h3>
          <p className="text-muted-foreground mb-4">
            Please sign in to access your personalized AI financial assistant.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Financial Copilot
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {context.financialHealthScore}/100 Health
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 min-h-0">
        {/* Messages */}
        <ScrollArea className="flex-1 pr-2">
          <div className="space-y-4 pb-4">
            {messages.length === 0 && showSuggestions && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground text-center">
                  Ask me anything about your finances
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {SUGGESTED_QUESTIONS.map((q, i) => (
                    <Button
                      key={q}
                      variant="outline"
                      className="h-auto p-3 text-left text-sm justify-start"
                      onClick={() => handleSuggestionClick(q)}
                    >
                      {q}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3',
                  message.role === 'user' && 'flex-row-reverse'
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : message.role === 'assistant'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                  )}
                >
                  {message.role === 'user' ? (
                    <MessageSquare className="h-4 w-4" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                </div>
                <div
                  className={cn(
                    'max-w-[80%] px-4 py-3 rounded-2xl',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-none'
                      : 'bg-muted rounded-tl-none'
                  )}
                >
                  <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                  
                  {message.calculations && Object.keys(message.calculations).length > 0 && (
                    <div className="mt-2 p-2 rounded bg-background/50 text-xs font-mono">
                      <strong>Calculations:</strong>
                      <pre className="mt-1 whitespace-pre-wrap">{JSON.stringify(message.calculations, null, 2)}</pre>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <span>{message.timestamp.toLocaleTimeString()}</span>
                    {message.role === 'assistant' && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 p-0" onClick={() => copyToClipboard(message.content)}>
                              <Copy className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Copy</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Loader2 className="h-4 w-4 text-primary animate-spin" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-muted rounded-tl-none animate-pulse">
                  <div className="h-4 bg-muted-foreground/20 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted-foreground/20 rounded w-1/2" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <Separator />

        {/* Context Summary */}
        <div className="mb-3">
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid w-full grid-cols-3 text-xs">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
              <TabsTrigger value="data">Raw Data</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="mt-3 space-y-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-muted/50">
                  <p className="text-muted-foreground">Income</p>
                  <p className="font-semibold">{formatINRShort(context.income)}</p>
                </div>
                <div className="p-2 rounded bg-muted/50">
                  <p className="text-muted-foreground">Expenses</p>
                  <p className="font-semibold">{formatINRShort(context.expenses)}</p>
                </div>
                <div className="p-2 rounded bg-muted/50">
                  <p className="text-muted-foreground">Investable</p>
                  <p className="font-semibold text-primary">{formatINRShort(context.monthlyInvestable)}</p>
                </div>
                <div className="p-2 rounded bg-muted/50">
                  <p className="text-muted-foreground">Savings Rate</p>
                  <p className="font-semibold">{context.savingsRate.toFixed(1)}%</p>
                </div>
                <div className="p-2 rounded bg-muted/50">
                  <p className="text-muted-foreground">Emergency Fund</p>
                  <p className="font-semibold">{context.emergencyMonths.toFixed(1)} mo</p>
                </div>
                <div className="p-2 rounded bg-muted/50">
                  <p className="text-muted-foreground">Health Score</p>
                  <p className="font-semibold">{context.financialHealthScore}/100</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="actions" className="mt-3 space-y-2">
              {actions.slice(0, 5).map((action, i) => (
                <Button
                  key={action.id}
                  variant="outline"
                  className="w-full justify-start text-left p-2 h-auto gap-2"
                  onClick={() => handleSuggestionClick(`Tell me more about: ${action.title}`)}
                >
                  <Badge variant="secondary" className="text-xs">{action.category}</Badge>
                  <span className="text-sm font-medium truncate">{action.title}</span>
                </Button>
              ))}
            </TabsContent>

            <TabsContent value="data" className="mt-3">
              <div className="p-3 rounded bg-muted/50 max-h-40 overflow-auto">
                <pre className="text-xs font-mono whitespace-pre-wrap">
{JSON.stringify({
  income: context.income,
  expenses: context.expenses,
  monthlyInvestable: context.monthlyInvestable,
  savingsRate: context.savingsRate,
  netWorth: context.netWorth,
  emergencyMonths: context.emergencyMonths,
  healthScore: context.financialHealthScore,
  riskProfile: context.riskProfile,
  goals: context.goals.length,
  portfolioValue: context.portfolio.reduce((s, p) => s + p.value, 0),
}, null, 2)}
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your finances..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="h-10"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>

        <p className="mt-2 text-xs text-muted-foreground text-center">
          Powered by Nemotron • Educational only, not financial advice
        </p>
      </CardContent>
    </Card>
  );
}