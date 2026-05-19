import { useState, useRef, useEffect } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Send, Bot, User, Loader2, TrendingUp } from "lucide-react";
import { ScrollArea } from "../components/ui/scroll-area";
import { transactionsAPI, aiAPI } from "../../services/api";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI financial assistant. I can help you understand your spending patterns, budget recommendations, and answer questions about your finances. What would you like to know?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Get user's financial data
      const [txResponse, insightsResponse] = await Promise.all([
        transactionsAPI.getAll(),
        aiAPI.getInsights(),
      ]);

      const transactions = txResponse.transactions || [];
      const insights = insightsResponse.insights || [];

      // Generate AI response based on user question
      const response = await generateResponse(input, transactions, insights);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateResponse = async (question: string, transactions: any[], insights: any[]) => {
    const lowerQuestion = question.toLowerCase();

    // Calculate basic stats
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const categorySpending: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
    });

    const topCategory = Object.entries(categorySpending)
      .sort(([, a], [, b]) => b - a)[0];

    // Pattern matching for common questions
    if (lowerQuestion.includes('spend') || lowerQuestion.includes('spending')) {
      if (lowerQuestion.includes('today') || lowerQuestion.includes('yesterday')) {
        const todaySpending = transactions
          .filter(t => t.type === 'expense' &&
            new Date(t.date).toDateString() === new Date().toDateString())
          .reduce((sum, t) => sum + t.amount, 0);
        return `Today, you've spent $${todaySpending.toFixed(2)} across ${transactions.filter(t => t.type === 'expense' && new Date(t.date).toDateString() === new Date().toDateString()).length} transactions.`;
      }

      if (lowerQuestion.includes('most') || lowerQuestion.includes('top')) {
        return `Your top spending category is ${topCategory?.[0] || 'none'} with $${topCategory?.[1]?.toFixed(2) || '0.00'} spent this month. This represents ${((topCategory?.[1] || 0) / totalExpenses * 100).toFixed(1)}% of your total expenses.`;
      }

      return `This month, you've spent $${totalExpenses.toFixed(2)} in total. Your average daily spending is $${(totalExpenses / 30).toFixed(2)}.`;
    }

    if (lowerQuestion.includes('income') || lowerQuestion.includes('earn')) {
      return `Your total income this month is $${totalIncome.toFixed(2)}. Your net balance is $${(totalIncome - totalExpenses).toFixed(2)}.`;
    }

    if (lowerQuestion.includes('budget') || lowerQuestion.includes('save')) {
      const savingsRate = ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1);
      return `Based on your current spending, you're saving ${savingsRate}% of your income. Financial experts recommend saving at least 20%. Consider reducing discretionary spending in categories like ${topCategory?.[0] || 'entertainment'} to increase your savings rate.`;
    }

    if (lowerQuestion.includes('category') || lowerQuestion.includes('categories')) {
      const categoryList = Object.entries(categorySpending)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([cat, amount]) => `${cat}: $${amount.toFixed(2)}`)
        .join(', ');
      return `Your top spending categories are: ${categoryList}.`;
    }

    if (lowerQuestion.includes('fraud') || lowerQuestion.includes('suspicious')) {
      const suspicious = transactions.filter(t => (t.risk_score || 0) > 0.7);
      if (suspicious.length > 0) {
        return `I've detected ${suspicious.length} potentially suspicious transaction(s). Please review them in the Alerts section. High-risk transactions include unusual amounts or merchants.`;
      }
      return 'Good news! No suspicious transactions detected. All your transactions appear normal.';
    }

    if (lowerQuestion.includes('tip') || lowerQuestion.includes('advice') || lowerQuestion.includes('recommend')) {
      const recommendations = [
        `Your spending on ${topCategory?.[0]} is quite high. Consider setting a monthly budget limit.`,
        `Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings. You're currently at ${savingsRate}% savings.`,
        `Automate your savings by setting up a recurring transfer right after payday.`,
      ];
      return recommendations.join(' ');
    }

    // Default response with insights
    if (insights.length > 0) {
      const insight = insights[0];
      return `${insight.description}\n\nYour total expenses are $${totalExpenses.toFixed(2)} this month, with most spending on ${topCategory?.[0]}. Is there anything specific you'd like to know?`;
    }

    return `I can help you with questions about your spending, income, budgets, savings recommendations, and fraud alerts. Try asking: "How much did I spend this month?" or "What's my top spending category?"`;
  };

  const quickQuestions = [
    "How much did I spend this month?",
    "What's my top spending category?",
    "How much can I save?",
    "Any suspicious transactions?",
  ];

  return (
    <div className="h-[calc(100vh-8rem)] max-w-4xl mx-auto flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl lg:text-3xl font-bold">AI Financial Assistant</h1>
        <p className="text-gray-600 mt-1">Ask me anything about your finances</p>
      </div>

      {/* Chat Container */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-4 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                  <p className="text-xs opacity-70 mt-2">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-gray-700" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Quick Questions */}
        {messages.length === 1 && (
          <div className="p-4 border-t">
            <p className="text-sm text-gray-600 mb-2">Quick questions:</p>
            <div className="grid grid-cols-2 gap-2">
              {quickQuestions.map((q, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setInput(q);
                    setTimeout(() => handleSend(), 100);
                  }}
                  className="text-xs h-auto py-2 px-3"
                >
                  {q}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about your spending, budgets, or get financial advice..."
              disabled={isLoading}
            />
            <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
