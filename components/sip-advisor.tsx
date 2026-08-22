'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Target, Shield, AlertTriangle, Info, RotateCcw, Calculator } from 'lucide-react';
import { formatINR, formatINRShort } from '@/lib/format';
import type { SIPAllocation, SIPProjection, FinancialProfile } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { DEFAULT_ANNUAL_RETURNS } from '@/lib/finance';

const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
];

interface SIPAdvisorProps {
  monthlyInvestable: number;
  financialProfile: FinancialProfile;
  projections?: SIPProjection[];
  onRefresh?: () => void;
}

export function SIPAdvisor({ monthlyInvestable, financialProfile, projections, onRefresh }: SIPAdvisorProps) {
  const [allocation, setAllocation] = useState<SIPAllocation[]>([]);
  const [customReturns, setCustomReturns] = useState<Record<string, number>>({});
  const [projectionYears, setProjectionYears] = useState(10);
  const [showCustomReturns, setShowCustomReturns] = useState(false);

  // Initialize allocation based on financial profile
  const initializeAllocation = () => {
    if (allocation.length === 0 && monthlyInvestable > 0) {
      // This would normally come from the finance.ts generateSipAllocation
      // For now, create a default based on risk profile
      const baseAllocations: Record<string, SIPAllocation[]> = {
        Conservative: [
          { category: 'Debt Funds', percentage: 50, monthlyAmount: 0, rationale: 'Capital preservation with stable returns' },
          { category: 'Large Cap Index Funds', percentage: 30, monthlyAmount: 0, rationale: 'Low volatility equity exposure' },
          { category: 'Gold ETF', percentage: 10, monthlyAmount: 0, rationale: 'Hedge against inflation' },
          { category: 'Liquid Funds', percentage: 10, monthlyAmount: 0, rationale: 'Emergency buffer and liquidity' },
        ],
        Moderate: [
          { category: 'Flexi Cap Funds', percentage: 35, monthlyAmount: 0, rationale: 'Dynamic allocation across market caps' },
          { category: 'Large Cap Index Funds', percentage: 25, monthlyAmount: 0, rationale: 'Core stable equity foundation' },
          { category: 'Mid Cap Funds', percentage: 15, monthlyAmount: 0, rationale: 'Growth potential with moderate risk' },
          { category: 'Debt Funds', percentage: 15, monthlyAmount: 0, rationale: 'Stability and downside protection' },
          { category: 'Gold ETF', percentage: 10, monthlyAmount: 0, rationale: 'Portfolio diversifier' },
        ],
        Aggressive: [
          { category: 'Small Cap Funds', percentage: 25, monthlyAmount: 0, rationale: 'High growth potential for long horizon' },
          { category: 'Mid Cap Funds', percentage: 25, monthlyAmount: 0, rationale: 'Strong growth with reasonable liquidity' },
          { category: 'Flexi Cap Funds', percentage: 25, monthlyAmount: 0, rationale: 'Adaptive allocation across caps' },
          { category: 'Large Cap Index Funds', percentage: 15, monthlyAmount: 0, rationale: 'Core stability anchor' },
          { category: 'Gold ETF', percentage: 5, monthlyAmount: 0, rationale: 'Minimal hedge' },
          { category: 'Debt Funds', percentage: 5, monthlyAmount: 0, rationale: 'Minimal stability' },
        ],
      };

      const base = baseAllocations[financialProfile.riskProfile] || baseAllocations.Moderate;
      const withAmounts = base.map(a => ({
        ...a,
        monthlyAmount: Math.round(monthlyInvestable * a.percentage / 100),
      }));
      setAllocation(withAmounts);
      
      // Initialize custom returns with defaults
      const returns: Record<string, number> = {};
      withAmounts.forEach(a => {
        returns[a.category] = DEFAULT_ANNUAL_RETURNS[a.category] || 0.12;
      });
      setCustomReturns(returns);
    }
  };

  initializeAllocation();

  const totalPercentage = allocation.reduce((sum, a) => sum + a.percentage, 0);
  const totalMonthly = allocation.reduce((sum, a) => sum + a.monthlyAmount, 0);
  const isValid = totalPercentage === 100 && totalMonthly === monthlyInvestable;

  const handlePercentageChange = (index: number, percentage: number) => {
    const newAllocation = [...allocation];
    newAllocation[index] = { ...newAllocation[index], percentage: Math.max(0, percentage) };
    
    // Normalize to 100%
    const total = newAllocation.reduce((sum, a) => sum + a.percentage, 0);
    if (total > 0) {
      newAllocation.forEach(a => {
        a.percentage = Math.round((a.percentage / total) * 100);
        a.monthlyAmount = Math.round(monthlyInvestable * a.percentage / 100);
      });
      // Fix rounding errors
      const diff = monthlyInvestable - newAllocation.reduce((sum, a) => sum + a.monthlyAmount, 0);
      if (diff !== 0 && newAllocation.length > 0) {
        newAllocation[0].monthlyAmount += diff;
        newAllocation[0].percentage = Math.round((newAllocation[0].monthlyAmount / monthlyInvestable) * 100);
      }
    }
    setAllocation(newAllocation);
  };

  const handleMonthlyChange = (index: number, monthlyAmount: number) => {
    const newAllocation = [...allocation];
    newAllocation[index] = { ...newAllocation[index], monthlyAmount: Math.max(0, monthlyAmount) };
    
    const total = newAllocation.reduce((sum, a) => sum + a.monthlyAmount, 0);
    if (total > 0) {
      newAllocation.forEach(a => {
        a.monthlyAmount = Math.round(monthlyInvestable * a.monthlyAmount / total);
        a.percentage = Math.round((a.monthlyAmount / monthlyInvestable) * 100);
      });
      const diff = monthlyInvestable - newAllocation.reduce((sum, a) => sum + a.monthlyAmount, 0);
      if (diff !== 0 && newAllocation.length > 0) {
        newAllocation[0].monthlyAmount += diff;
        newAllocation[0].percentage = Math.round((newAllocation[0].monthlyAmount / monthlyInvestable) * 100);
      }
    }
    setAllocation(newAllocation);
  };

  const handleReturnChange = (category: string, value: number) => {
    setCustomReturns(prev => ({ ...prev, [category]: Math.max(0, Math.min(0.3, value)) }));
  };

  const generateProjections = () => {
    if (!projections && monthlyInvestable > 0) {
      const years = projectionYears;
      const newProjections: SIPProjection[] = [];
      
      for (let year = 1; year <= years; year++) {
        let yearValue = 0;
        const breakdown: Record<string, number> = {};
        
        for (const alloc of allocation) {
          const ret = customReturns[alloc.category] || DEFAULT_ANNUAL_RETURNS[alloc.category] || 0.12;
          const value = alloc.monthlyAmount * ((Math.pow(1 + ret/12, year*12) - 1) / (ret/12)) * (1 + ret/12);
          breakdown[alloc.category] = Math.round(value);
          yearValue += value;
        }
        
        newProjections.push({
          year,
          totalValue: Math.round(yearValue),
          breakdown,
          totalInvested: monthlyInvestable * 12 * year,
        });
      }
      
      return newProjections;
    }
    return projections || [];
  };

  const currentProjections = generateProjections();
  const finalProjection = currentProjections[currentProjections.length - 1];
  const totalInvested = finalProjection?.totalInvested || 0;
  const totalReturns = (finalProjection?.totalValue || 0) - totalInvested;

  const handleReset = () => {
    initializeAllocation();
    setCustomReturns({});
    setProjectionYears(10);
    onRefresh?.();
  };

  if (monthlyInvestable <= 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Investable Surplus</h3>
          <p className="text-muted-foreground mb-4">
            Your monthly expenses exceed your income. Focus on building an emergency fund and reducing expenses first.
          </p>
          <Button onClick={onRefresh} variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <Target className="h-5 w-5 text-primary" />
            SIP Investment Advisor
          </h2>
          <p className="text-sm text-muted-foreground">
            Recommended allocation based on your {financialProfile.riskProfile} risk profile & {financialProfile.investmentHorizon} horizon
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            Monthly: {formatINRShort(monthlyInvestable)}
          </Badge>
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>
      </div>

      <Alert className="border-primary/30 bg-primary/5">
        <Info className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>Educational purposes only.</strong> These are model allocations based on your risk profile, not personalized financial advice. 
          Past performance ≠ future returns. Consult a SEBI-registered advisor before investing.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="allocation" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="allocation">Allocation</TabsTrigger>
          <TabsTrigger value="projection">Projections</TabsTrigger>
          <TabsTrigger value="returns">Return Assumptions</TabsTrigger>
        </TabsList>

        {/* Allocation Tab */}
        <TabsContent value="allocation">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Allocation Breakdown</CardTitle>
                <CardDescription>Monthly SIP: {formatINR(monthlyInvestable)}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={allocation.map((a, i) => ({
                          name: a.category,
                          value: a.monthlyAmount,
                          fill: COLORS[i % COLORS.length],
                        }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {allocation.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [formatINR(value), 'Monthly Amount']}
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Allocation Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Category Details
                  <Badge variant={isValid ? 'default' : 'destructive'} className={isValid ? 'bg-success text-success-foreground' : ''}>
                    {isValid ? 'Valid' : `Total: ${totalPercentage}%`}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-64">
                  <div className="space-y-3">
                    {allocation.map((item, index) => (
                      <div key={item.category} className="space-y-2 p-3 rounded-lg bg-muted/30 border-l-4" style={{ borderColor: COLORS[index % COLORS.length] }}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{item.category}</span>
                            <Badge variant="outline" className="text-xs">{item.percentage}%</Badge>
                          </div>
                          <span className="font-semibold text-primary">{formatINR(item.monthlyAmount)}/mo</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs text-muted-foreground">Percentage</Label>
                            <Input
                              type="number"
                              value={item.percentage}
                              onChange={(e) => handlePercentageChange(index, Number(e.target.value))}
                              min={0}
                              max={100}
                              step={1}
                              className="text-center"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Monthly ₹</Label>
                            <Input
                              type="number"
                              value={item.monthlyAmount}
                              onChange={(e) => handleMonthlyChange(index, Number(e.target.value))}
                              min={0}
                              max={monthlyInvestable}
                              step={500}
                              className="text-center"
                            />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground italic">{item.rationale}</p>
                      </div>
                    ))}
                    {allocation.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">No allocation data available</p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Rationale Cards */}
          <Card>
            <CardHeader>
              <CardTitle>Why These Categories?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {allocation.map((item, index) => (
                  <div key={item.category} className="p-3 rounded-lg bg-muted/30 border-l-4" style={{ borderColor: COLORS[index % COLORS.length] }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{item.category}</span>
                      <Badge variant="secondary" className="text-xs">{item.percentage}%</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.rationale}</p>
                    <p className="text-xs text-primary mt-1">Assumed return: {(customReturns[item.category] || DEFAULT_ANNUAL_RETURNS[item.category] || 0.12) * 100}% p.a.</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Projections Tab */}
        <TabsContent value="projection">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>SIP Growth Projection</CardTitle>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Years: </Label>
                    <Input
                      type="number"
                      value={projectionYears}
                      onChange={(e) => setProjectionYears(Math.max(1, Math.min(30, Number(e.target.value))))}
                      min={1}
                      max={30}
                      className="w-20 text-center"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={currentProjections} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tickFormatter={(v) => formatINRShort(v)} />
                      <YAxis type="category" dataKey="year" tickFormatter={(y) => `Year ${y}`} width={60} />
                      <Tooltip
                        formatter={(value: number, name: string) => [
                          formatINR(value),
                          name === 'totalValue' ? 'Portfolio Value' : name === 'totalInvested' ? 'Total Invested' : name,
                        ]}
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                      />
                      <Legend />
                      <Bar dataKey="totalInvested" name="Total Invested" fill="hsl(var(--muted-foreground))" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="totalValue" name="Portfolio Value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded-lg bg-primary/5">
                  <p className="text-sm text-muted-foreground">Total Invested</p>
                  <p className="font-display text-2xl font-bold">{formatINR(totalInvested)}</p>
                </div>
                <div className="p-3 rounded-lg bg-success/5">
                  <p className="text-sm text-muted-foreground">Estimated Returns</p>
                  <p className="font-display text-2xl font-bold text-success">{formatINR(totalReturns)}</p>
                </div>
                <div className="p-3 rounded-lg bg-card border">
                  <p className="text-sm text-muted-foreground">Final Portfolio Value</p>
                  <p className="font-display text-2xl font-bold text-primary">{formatINR(finalProjection?.totalValue || 0)}</p>
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly SIP</span>
                    <span className="font-medium">{formatINR(monthlyInvestable)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Investment Period</span>
                    <span className="font-medium">{projectionYears} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Weighted Avg Return</span>
                    <span className="font-medium">
                      {allocation.length > 0
                        ? (allocation.reduce((sum, a) => sum + (customReturns[a.category] || DEFAULT_ANNUAL_RETURNS[a.category] || 0.12) * a.percentage, 0) / 100).toFixed(1) + '%'
                        : '—'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Year-by-year table */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Year-by-Year Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-64">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-2 pr-4">Year</th>
                        <th className="pb-2 pr-4 text-right">Invested</th>
                        <th className="pb-2 pr-4 text-right">Value</th>
                        <th className="pb-2 pr-4 text-right">Returns</th>
                        <th className="pb-2 pr-4 text-right">Annualized</th>
                        {allocation.map((a, i) => (
                          <th key={a.category} className="pb-2 pr-4 text-right" style={{ color: COLORS[i % COLORS.length] }}>
                            {a.category}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {currentProjections.map((p, i) => (
                        <tr key={p.year} className={cn('border-b', i % 2 === 0 && 'bg-muted/30')}>
                          <td className="py-2 pr-4 font-medium">Year {p.year}</td>
                          <td className="py-2 pr-4 text-right">{formatINRShort(p.totalInvested)}</td>
                          <td className="py-2 pr-4 text-right font-semibold">{formatINRShort(p.totalValue)}</td>
                          <td className="py-2 pr-4 text-right text-success">{formatINRShort(p.totalValue - p.totalInvested)}</td>
                          <td className="py-2 pr-4 text-right">
                            {p.totalInvested > 0
                              ? ((Math.pow(p.totalValue / p.totalInvested, 1 / p.year) - 1) * 100).toFixed(1) + '%'
                              : '—'}
                          </td>
                          {allocation.map((a, j) => (
                            <td key={a.category} className="py-2 pr-4 text-right" style={{ color: COLORS[j % COLORS.length] }}>
                              {formatINRShort(p.breakdown[a.category] || 0)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Return Assumptions Tab */}
        <TabsContent value="returns">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Return Assumptions
                <Button variant="ghost" size="sm" onClick={() => setShowCustomReturns(!showCustomReturns)}>
                  {showCustomReturns ? 'Hide' : 'Edit'} Returns
                </Button>
              </CardTitle>
              <CardDescription>
                Adjust expected annual returns for each category. Defaults are based on historical Indian market averages.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {allocation.map((item, index) => (
                  <div key={item.category} className="p-4 rounded-lg bg-muted/30 border-l-4" style={{ borderColor: COLORS[index % COLORS.length] }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{item.category}</span>
                      <Badge variant="outline" className="text-xs">
                        {(customReturns[item.category] || DEFAULT_ANNUAL_RETURNS[item.category] || 0.12) * 100}%
                      </Badge>
                    </div>
                    {showCustomReturns ? (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Expected Return %</Label>
                        <div className="flex items-center gap-2">
                          <Slider
                            value={[Math.round((customReturns[item.category] || DEFAULT_ANNUAL_RETURNS[item.category] || 0.12) * 100)]}
                            onValueChange={([v]) => handleReturnChange(item.category, v / 100)}
                            min={0}
                            max={30}
                            step={1}
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            value={Math.round((customReturns[item.category] || DEFAULT_ANNUAL_RETURNS[item.category] || 0.12) * 100)}
                            onChange={(e) => handleReturnChange(item.category, Number(e.target.value) / 100)}
                            min={0}
                            max={30}
                            step={1}
                            className="w-20 text-center"
                          />
                          <span className="text-xs text-muted-foreground">%</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Default: {((DEFAULT_ANNUAL_RETURNS[item.category] || 0.12) * 100).toFixed(1)}%
                        </p>
                      </div>
                    ) : (
                      <div className="text-sm">
                        <p className="text-muted-foreground">Default: {((DEFAULT_ANNUAL_RETURNS[item.category] || 0.12) * 100).toFixed(1)}% p.a.</p>
                        <p className="text-xs text-muted-foreground mt-1">Click &ldquo;Edit Returns&rdquo; to customize</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}