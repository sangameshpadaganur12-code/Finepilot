'use client';

import { useState } from 'react';
import { AlertCircle, TrendingUp, Save, RotateCcw, Calculator } from 'lucide-react';
import { formatINR } from '@/lib/format';
import type { Budget, BudgetCategory } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SmartBudgetProps {
  budget: Budget;
  onUpdate?: (categories: BudgetCategory[]) => void;
  editable?: boolean;
}

export function SmartBudget({ budget, onUpdate, editable = true }: SmartBudgetProps) {
  const [localCategories, setLocalCategories] = useState<BudgetCategory[]>(budget.categories);
  const [showReset, setShowReset] = useState(false);

  const expenseCategories = localCategories.filter(c => c.type === 'expense');
  const investmentCategories = localCategories.filter(c => c.type === 'investment');
  const savingsCategories = localCategories.filter(c => c.type === 'savings');
  const incomeCategory = localCategories.find(c => c.type === 'income');

  const totalExpenses = expenseCategories.reduce((sum, c) => sum + c.actual, 0);
  const totalInvestments = investmentCategories.reduce((sum, c) => sum + c.actual, 0);
  const totalSavings = savingsCategories.reduce((sum, c) => sum + c.actual, 0);
  const totalOutflow = totalExpenses + totalInvestments + totalSavings;
  const remaining = (incomeCategory?.actual || 0) - totalOutflow;

  const handleCategoryChange = (index: number, field: 'budgeted' | 'actual', value: number) => {
    if (!editable) return;
    const newCategories = [...localCategories];
    newCategories[index] = { ...newCategories[index], [field]: Math.max(0, value) };
    setLocalCategories(newCategories);
    onUpdate?.(newCategories);
  };

  const handleReset = () => {
    setLocalCategories(budget.categories);
    onUpdate?.(budget.categories);
    setShowReset(false);
  };

  const getProgressColor = (category: BudgetCategory) => {
    if (category.type !== 'expense') return 'bg-primary';
    const pct = category.budgeted > 0 ? (category.actual / category.budgeted) * 100 : 0;
    if (pct >= 100) return 'bg-destructive';
    if (pct >= 80) return 'bg-warning';
    return 'bg-primary';
  };

  const getProgressValue = (category: BudgetCategory) => {
    if (category.budgeted <= 0) return 0;
    return Math.min(100, (category.actual / category.budgeted) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Income Card */}
      {incomeCategory && (
        <Card className="bg-success/5 border-success/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-success">
              Monthly Income
              <Badge variant="outline" className="text-success border-success">
                {editable ? 'Editable' : 'View Only'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="income-actual" className="text-sm text-muted-foreground">
                  Actual Income
                </Label>
                <Input
                  id="income-actual"
                  type="number"
                  value={incomeCategory.actual}
                  onChange={(e) => handleCategoryChange(
                    localCategories.indexOf(incomeCategory),
                    'actual',
                    Number(e.target.value)
                  )}
                  disabled={!editable}
                  className="text-2xl font-bold text-success font-display"
                />
              </div>
              {editable && (
                <div className="flex-1">
                  <Label htmlFor="income-budgeted" className="text-sm text-muted-foreground">
                    Budgeted
                  </Label>
                  <Input
                    id="income-budgeted"
                    type="number"
                    value={incomeCategory.budgeted}
                    onChange={(e) => handleCategoryChange(
                      localCategories.indexOf(incomeCategory),
                      'budgeted',
                      Number(e.target.value)
                    )}
                    className="text-xl font-semibold font-display"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expenses Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Expenses & Needs</CardTitle>
            {budget.overspendingAlerts.length > 0 && (
              <AlertCircle className="h-5 w-5 text-destructive" />
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {budget.overspendingAlerts.length > 0 && (
            <Alert variant="destructive" className="border-destructive/30 bg-destructive/5">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex flex-col gap-1">
                <span className="font-medium">Overspending Alert:</span>
                {budget.overspendingAlerts.map((alert, i) => (
                  <span key={i} className="text-sm">{alert}</span>
                ))}
              </AlertDescription>
            </Alert>
          )}

          {expenseCategories.map((category, idx) => {
            const globalIdx = localCategories.indexOf(category);
            const progress = getProgressValue(category);
            return (
              <div key={category.name} className="space-y-2 p-3 rounded-lg bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{category.name}</span>
                    {category.essential && (
                      <Badge variant="secondary" className="text-xs">Essential</Badge>
                    )}
                    {category.overspent && (
                      <Badge variant="destructive" className="text-xs">Over Budget</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">
                      Budget: {formatINR(category.budgeted)}
                    </span>
                    <span className={cn(
                      'font-semibold',
                      category.overspent ? 'text-destructive' : 'text-foreground'
                    )}>
                      Actual: {formatINR(category.actual)}
                    </span>
                  </div>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{progress.toFixed(0)}% of budget used</span>
                  {editable && (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={category.actual}
                        onChange={(e) => handleCategoryChange(globalIdx, 'actual', Number(e.target.value))}
                        className="w-28 text-right"
                        placeholder="Actual"
                      />
                      <Input
                        type="number"
                        value={category.budgeted}
                        onChange={(e) => handleCategoryChange(globalIdx, 'budgeted', Number(e.target.value))}
                        className="w-28 text-right"
                        placeholder="Budget"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <Separator />
          <div className="flex justify-between text-lg font-semibold">
            <span>Total Expenses</span>
            <span>{formatINR(totalExpenses)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Investments Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Investments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {investmentCategories.map((category, idx) => {
            const globalIdx = localCategories.indexOf(category);
            return (
              <div key={category.name} className="space-y-2 p-3 rounded-lg bg-muted/30">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{category.name}</span>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">
                      Target: {formatINR(category.budgeted)}
                    </span>
                    <span className="font-semibold text-primary">
                      Actual: {formatINR(category.actual)}
                    </span>
                  </div>
                </div>
                {editable && (
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`inv-actual-${idx}`} className="text-xs text-muted-foreground w-20">
                      Actual
                    </Label>
                    <Input
                      id={`inv-actual-${idx}`}
                      type="number"
                      value={category.actual}
                      onChange={(e) => handleCategoryChange(globalIdx, 'actual', Number(e.target.value))}
                      className="w-32 text-right"
                    />
                    <Label htmlFor={`inv-budgeted-${idx}`} className="text-xs text-muted-foreground w-20">
                      Target
                    </Label>
                    <Input
                      id={`inv-budgeted-${idx}`}
                      type="number"
                      value={category.budgeted}
                      onChange={(e) => handleCategoryChange(globalIdx, 'budgeted', Number(e.target.value))}
                      className="w-32 text-right"
                    />
                  </div>
                )}
              </div>
            );
          })}

          <Separator />
          <div className="flex justify-between text-lg font-semibold">
            <span>Total Investments</span>
            <span className="text-primary">{formatINR(totalInvestments)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Savings Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-success" />
            Savings & Emergency Fund
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {savingsCategories.map((category, idx) => {
            const globalIdx = localCategories.indexOf(category);
            return (
              <div key={category.name} className="space-y-2 p-3 rounded-lg bg-muted/30">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{category.name}</span>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">
                      Target: {formatINR(category.budgeted)}
                    </span>
                    <span className="font-semibold text-success">
                      Actual: {formatINR(category.actual)}
                    </span>
                  </div>
                </div>
                {editable && (
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`sav-actual-${idx}`} className="text-xs text-muted-foreground w-20">
                      Actual
                    </Label>
                    <Input
                      id={`sav-actual-${idx}`}
                      type="number"
                      value={category.actual}
                      onChange={(e) => handleCategoryChange(globalIdx, 'actual', Number(e.target.value))}
                      className="w-32 text-right"
                    />
                    <Label htmlFor={`sav-budgeted-${idx}`} className="text-xs text-muted-foreground w-20">
                      Target
                    </Label>
                    <Input
                      id={`sav-budgeted-${idx}`}
                      type="number"
                      value={category.budgeted}
                      onChange={(e) => handleCategoryChange(globalIdx, 'budgeted', Number(e.target.value))}
                      className="w-32 text-right"
                    />
                  </div>
                )}
              </div>
            );
          })}

          <Separator />
          <div className="flex justify-between text-lg font-semibold">
            <span>Total Savings</span>
            <span className="text-success">{formatINR(totalSavings)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            Monthly Summary
            {editable && (
              <Button variant="ghost" size="sm" onClick={() => setShowReset(true)}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-background">
              <p className="text-sm text-muted-foreground">Income</p>
              <p className="font-display text-xl font-bold text-success">{formatINR(incomeCategory?.actual || 0)}</p>
            </div>
            <div className="p-3 rounded-lg bg-background">
              <p className="text-sm text-muted-foreground">Total Outflow</p>
              <p className="font-display text-xl font-bold">{formatINR(totalOutflow)}</p>
            </div>
            <div className="p-3 rounded-lg bg-background">
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className={cn(
                'font-display text-xl font-bold',
                remaining >= 0 ? 'text-success' : 'text-destructive'
              )}>
                {formatINR(remaining)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-background">
              <p className="text-sm text-muted-foreground">Savings Rate</p>
              <p className="font-display text-xl font-bold text-primary">
                {budget.savingsRate.toFixed(1)}%
              </p>
            </div>
          </div>

          {remaining < 0 && (
            <Alert variant="destructive" className="border-destructive/30 bg-destructive/5">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You&apos;re spending ₹{formatINR(Math.abs(remaining))} more than you earn. Review your budget immediately.
              </AlertDescription>
            </Alert>
          )}

          {remaining > 0 && remaining < incomeCategory!.actual * 0.1 && (
            <Alert className="border-warning/30 bg-warning/5">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Only ₹{formatINR(remaining)} remaining. Consider increasing savings or investments.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      {editable && (
        <div className="flex gap-3">
          <Button onClick={() => onUpdate?.(localCategories)} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Save Budget
          </Button>
          <Button variant="outline" onClick={() => setShowReset(true)}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
        </div>
      )}

      {showReset && (
        <Alert variant="default" className="border-warning/30 bg-warning/5">
          <AlertDescription className="flex items-center justify-between">
            <span>Reset all values to recommended defaults?</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowReset(false)}>Cancel</Button>
              <Button size="sm" onClick={handleReset}>Yes, Reset</Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}