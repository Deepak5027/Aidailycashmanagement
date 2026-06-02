import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Brain, TrendingUp, AlertTriangle, DollarSign, Target, Activity, Sparkles } from 'lucide-react';
import { Progress } from '../components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { mlPredictionService, PredictionResult } from '../../services/mlPredictions';
import { transactionsAPI } from '../../services/api';
import { Button } from '../components/ui/button';

export default function AIPredictions() {
  const { t } = useTranslation();
  const [predictions, setPredictions] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPredictions();
  }, []);

  const loadPredictions = async () => {
    setLoading(true);
    try {
      const { transactions } = await transactionsAPI.getAll();
      const result = await mlPredictionService.predict(transactions);
      setPredictions(result);
    } catch (error) {
      console.error('Failed to load predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-center space-y-4">
          <Brain className="size-12 animate-pulse mx-auto text-primary" />
          <p className="text-muted-foreground">{t('loading')} AI Predictions...</p>
        </div>
      </div>
    );
  }

  if (!predictions) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-center space-y-4">
          <AlertTriangle className="size-12 mx-auto text-destructive" />
          <p className="text-muted-foreground">Failed to load predictions</p>
          <Button onClick={loadPredictions}>Retry</Button>
        </div>
      </div>
    );
  }

  const riskColor = predictions.overspendingRisk > 0.7 ? 'text-destructive' :
                    predictions.overspendingRisk > 0.4 ? 'text-yellow-600' : 'text-green-600';

  const riskBgColor = predictions.overspendingRisk > 0.7 ? 'bg-red-50' :
                      predictions.overspendingRisk > 0.4 ? 'bg-yellow-50' : 'bg-green-50';

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <Brain className="size-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">{t('aiPredictions')}</h1>
          <p className="text-muted-foreground">Machine Learning powered financial insights</p>
        </div>
      </div>

      {/* AI Insights */}
      {predictions.insights.length > 0 && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {predictions.insights.map((insight, idx) => (
              <div key={idx} className="p-3 bg-muted rounded-lg">
                <p className="text-sm">{insight}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('nextMonthExpense')}</CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{predictions.nextMonthExpense.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Predicted for next month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('expectedSavings')}</CardTitle>
            <DollarSign className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${predictions.expectedSavings < 0 ? 'text-destructive' : 'text-green-600'}`}>
              ₹{predictions.expectedSavings.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Projected savings</p>
          </CardContent>
        </Card>

        <Card className={riskBgColor}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('overspendingRisk')}</CardTitle>
            <AlertTriangle className={`size-4 ${riskColor}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${riskColor}`}>
              {(predictions.overspendingRisk * 100).toFixed(0)}%
            </div>
            <Progress value={predictions.overspendingRisk * 100} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('budgetRecommendation')}</CardTitle>
            <Target className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{predictions.budgetRecommendation.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Recommended monthly budget</p>
          </CardContent>
        </Card>
      </div>

      {/* Model Performance */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="size-5" />
              {t('predictionAccuracy')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold text-primary">
              {(predictions.predictionAccuracy * 100).toFixed(1)}%
            </div>
            <Progress value={predictions.predictionAccuracy * 100} className="h-3" />
            <p className="text-xs text-muted-foreground">
              Model accuracy based on historical data analysis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="size-5" />
              {t('confidenceScore')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold text-blue-600">
              {(predictions.confidenceScore * 100).toFixed(1)}%
            </div>
            <Progress value={predictions.confidenceScore * 100} className="h-3" />
            <p className="text-xs text-muted-foreground">
              Confidence level in the predictions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow Forecast */}
      <Card>
        <CardHeader>
          <CardTitle>{t('cashFlowForecast')}</CardTitle>
          <CardDescription>Projected cash flow for the next 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={predictions.cashFlowForecast.map((item, idx) => ({ ...item, id: idx }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value: number) => `₹${value.toFixed(2)}`}
                labelStyle={{ color: '#000' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#8884d8"
                strokeWidth={2}
                name="Projected Balance"
                dot={{ fill: '#8884d8', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Forecast Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Forecast Breakdown</CardTitle>
          <CardDescription>Expected income vs expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={predictions.cashFlowForecast.map((item, idx) => ({
              ...item,
              id: `forecast-${idx}`,
              expense: predictions.nextMonthExpense,
              income: predictions.nextMonthExpense + item.amount
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => `₹${value.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="income" fill="#82ca9d" name="Expected Income" />
              <Bar dataKey="expense" fill="#ff8042" name="Expected Expense" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button onClick={loadPredictions} size="lg">
          <Brain className="size-4 mr-2" />
          Refresh Predictions
        </Button>
      </div>
    </div>
  );
}
