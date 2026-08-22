'use client';

import { useMemo } from 'react';
import { AlertTriangle, TrendingUp, Target, Shield, DollarSign, RotateCcw, CheckCircle, Clock, AlertCircle, X } from 'lucide-react';
import { formatINR, formatINRShort } from '@/lib/format';
import type { DecisionAction, HealthScoreBreakdown, Goal } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface DecisionEngineProps {
  actions: DecisionAction[];
  health: HealthScoreBreakdown;
  goals: Goal[];
  onDismiss?: (actionId: string) => void;
  onActionClick?: (action: DecisionAction) => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Safety: <Shield className="h-4 w-4" />,
  Investing: <TrendingUp className="h-4 w-4" />,
  Goals: <Target className="h-4 w-4" />,
  Cashflow: <DollarSign className="h-4 w-4" />,
  Overall: <AlertTriangle className="h-4 w-4" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  Safety: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
  Investing: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
  Goals: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400',
  Cashflow: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400',
  Overall: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400',
};

const IMPACT_COLORS: Record<string, string> = {
  High: 'text-destructive',
  Medium: 'text-warning',
  Low: 'text-muted-foreground',
};

const EFFORT_COLORS: Record<string, string> = {
  High: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

export function DecisionEngine({ actions, health, goals, onDismiss, onActionClick }: DecisionEngineProps) {
  const [dismissedActions, setDismissedActions] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const filteredActions = useMemo(() => {
    let filtered = actions.filter(a => !dismissedActions.includes(a.id));
    if (activeTab !== 'all') {
      filtered = filtered.filter(a => a.impact === activeTab.charAt(0).toUpperCase() + activeTab.slice(1));
    }
    return filtered;
  }, [actions, dismissedActions, activeTab]);

  const handleDismiss = (id: string) => {
    setDismissedActions(prev => [...prev, id]);
    onDismiss?.(id);
  };

  const getPriorityColor = (priority: number) => {
    if (priority <= 2) return 'bg-destructive/10 text-destructive border-destructive/20';
    if (priority <= 4) return 'bg-warning/10 text-warning border-warning/20';
    return 'bg-primary/10 text-primary border-primary/20';
  };

  const healthBars = [
    { label: 'Cashflow', value: health.cashflow, color: 'bg-orange-500' },
    { label: 'Safety', value: health.safety, color: 'bg-blue-500' },
    { label: 'Investing', value: health.investing, color: 'bg-green-500' },
    { label: 'Goals', value: health.goals, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Health Score Overview */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Financial Health Score
            </CardTitle>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {health.total}/100
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {healthBars.map((bar) => (
              <div key={bar.label} className="p-3 rounded-lg bg-background/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{bar.label}</span>
                  <span className="text-sm font-bold">{bar.value}</span>
                </div>
                <Progress value={bar.value} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Priority Actions
            </CardTitle>
            <div className="flex items-center gap-1">
              {(['all', 'High', 'Medium', 'Low'] as const).map((tab) => {
                const tabValue = tab.toLowerCase() as 'all' | 'high' | 'medium' | 'low';
                return (
                  <Button
                    key={tab}
                    variant={activeTab === tabValue ? 'default' : 'ghost'}
                    size="sm"
                    className="text-xs h-7 px-2"
                    onClick={() => setActiveTab(tabValue)}
                  >
                    {tab === 'all' ? 'All' : tab}
                    <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-muted">
                      {actions.filter(a => tab === 'all' || a.impact === tab).length}
                    </span>
                  </Button>
                );
              })}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredActions.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 mx-auto text-success mb-4" />
              <h3 className="text-lg font-semibold mb-1">All Caught Up!</h3>
              <p className="text-muted-foreground">
                No priority actions at the moment. Your financial plan is on track.
              </p>
              <Button variant="outline" className="mt-4" onClick={() => setDismissedActions([])}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Show Dismissed
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredActions.map((action) => (
                <div
                  key={action.id}
                  className={cn(
                    'relative p-4 rounded-xl border transition-all hover:shadow-md',
                    getPriorityColor(action.priority)
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
                      CATEGORY_COLORS[action.category]
                    )}>
                      {CATEGORY_ICONS[action.category]}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{action.title}</h4>
                          <Badge variant="secondary" className={CATEGORY_COLORS[action.category]}>
                            {action.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            P{action.priority}
                          </Badge>
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                onClick={() => handleDismiss(action.id)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">Dismiss</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>

                      <p className="mt-1 text-sm text-muted-foreground">{action.description}</p>

                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                        <span className={cn('px-2 py-0.5 rounded', IMPACT_COLORS[action.impact])}>
                          Impact: {action.impact}
                        </span>
                        <span className={cn('px-2 py-0.5 rounded', EFFORT_COLORS[action.effort])}>
                          Effort: {action.effort}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground">
                          {action.metric}
                        </span>
                      </div>

                      <div className="mt-3 p-3 rounded-lg bg-background/50 border">
                        <p className="text-sm font-medium">Recommended Action:</p>
                        <p className="mt-1 text-sm">{action.action}</p>
                      </div>

                      {onActionClick && (
                        <Button
                          variant="link"
                          size="sm"
                          className="mt-3 h-auto p-0 text-primary"
                          onClick={() => onActionClick(action)}
                        >
                          View details →
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Stats */}
          <Separator className="my-4" />
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="p-3 rounded-lg bg-success/5 border-success/20">
              <p className="text-xs text-muted-foreground">Actions Completed</p>
              <p className="font-display text-2xl font-bold text-success">{dismissedActions.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-primary/5 border-primary/20">
              <p className="text-xs text-muted-foreground">Pending High Impact</p>
              <p className="font-display text-2xl font-bold text-primary">
                {actions.filter(a => a.impact === 'High' && !dismissedActions.includes(a.id)).length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-warning/5 border-warning/20">
              <p className="text-xs text-muted-foreground">Total Actions</p>
              <p className="font-display text-2xl font-bold text-warning">{actions.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goal Tracker */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            Goal Progress Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          {goals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No goals set yet. Go to Goals to create your first goal.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map((goal) => {
                const progress = goal.targetAmount > 0 
                  ? Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)
                  : 0;
                const yearsLeft = goal.targetYear - new Date().getFullYear();
                const monthlyNeeded = yearsLeft > 0 
                  ? (goal.targetAmount - goal.currentAmount) / (yearsLeft * 12)
                  : 0;

                return (
                  <div key={goal.id} className="p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{goal.name}</span>
                        <Badge variant="outline" className="text-xs">
                          Target: {goal.targetYear}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                          {formatINRShort(goal.currentAmount)} / {formatINRShort(goal.targetAmount)}
                        </span>
                        <span className="font-semibold text-primary">{progress.toFixed(0)}%</span>
                      </div>
                      <Progress value={progress} className="h-2 mb-2" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{yearsLeft > 0 ? `${yearsLeft} years left` : 'Target year reached'}</span>
                        <span>Need {formatINRShort(monthlyNeeded)}/mo</span>
                        <span>SIP: {formatINRShort(goal.monthlyContribution)}/mo</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Action Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            This Month&apos;s Action Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <ActionPlanItem
              title="Review Budget"
              description="Compare actual vs budgeted spending. Adjust categories where you overspent."
              icon={DollarSign}
              color="text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400"
              frequency="Weekly"
            />
            <ActionPlanItem
              title="Check SIP Investments"
              description="Verify SIPs executed successfully. Increase if you have surplus."
              icon={TrendingUp}
              color="text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400"
              frequency="Monthly"
            />
            <ActionPlanItem
              title="Emergency Fund Top-up"
              description="Redirect any surplus to liquid funds until 6-month target reached."
              icon={Shield}
              color="text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"
              frequency="Monthly"
            />
            <ActionPlanItem
              title="Goal Progress Review"
              description="Check if goals are on track. Increase SIP for off-track goals."
              icon={Target}
              color="text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400"
              frequency="Quarterly"
            />
            <ActionPlanItem
              title="Portfolio Rebalance Check"
              description="Review allocation drift. Redirect new investments to underweight categories."
              icon={RotateCcw}
              color="text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400"
              frequency="Semi-annually"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ActionPlanItem({ title, description, icon: Icon, color, frequency }: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  frequency: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
      <div className={cn('flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center', color)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Badge variant="outline" className="text-xs whitespace-nowrap">{frequency}</Badge>
    </div>
  );
}

import { useState } from 'react';