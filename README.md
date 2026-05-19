# AI Daily Cash Management - FinanceAI

A production-ready AI-powered personal finance web application built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

- 🔐 **Authentication**: Secure user authentication with Supabase Auth
- 💰 **Transaction Management**: Add, edit, delete, and track all your transactions
- 📊 **Budget Planning**: Set budget limits and track spending with AI predictions
- 🎯 **Goals Tracking**: Create and monitor savings goals with progress tracking
- 🔍 **Fraud Detection**: AI-powered fraud detection and risk scoring
- 📱 **Receipt Scanner**: OCR-based receipt scanning with Tesseract.js
- 🎤 **Voice Entry**: Add transactions via voice input using Web Speech API
- 📈 **Analytics Dashboard**: Comprehensive financial insights and visualizations
- 💳 **Bank Import**: Import transactions from CSV bank statements
- 📄 **PDF Reports**: Generate detailed financial reports
- 🚨 **Smart Alerts**: Get notified about suspicious transactions
- 💬 **AI Insights**: Get personalized financial recommendations

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **UI Components**: Radix UI, Shadcn/ui
- **Charts**: Recharts
- **OCR**: Tesseract.js
- **Voice**: Web Speech API
- **Build Tool**: Vite
- **Deployment**: Vercel

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)
- A Supabase account ([Sign up here](https://supabase.com))
- A Vercel account (for deployment, optional)

## Setup Instructions

### 1. Clone the Repository

\`\`\`bash
git clone <your-repo-url>
cd code
\`\`\`

### 2. Install Dependencies

\`\`\`bash
pnpm install
\`\`\`

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key from Settings → API
3. Run the following SQL in the Supabase SQL Editor to create the required tables:

\`\`\`sql
-- Create transactions table
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  merchant TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  payment_mode TEXT NOT NULL,
  risk_score DECIMAL(3, 2) DEFAULT 0,
  status TEXT DEFAULT 'normal' CHECK (status IN ('normal', 'suspicious')),
  notes TEXT,
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create budgets table
CREATE TABLE budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  limit DECIMAL(10, 2) NOT NULL,
  spent DECIMAL(10, 2) DEFAULT 0,
  period TEXT DEFAULT 'monthly' CHECK (period IN ('monthly', 'weekly', 'yearly')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category)
);

-- Create goals table
CREATE TABLE goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  target_amount DECIMAL(10, 2) NOT NULL,
  current_amount DECIMAL(10, 2) DEFAULT 0,
  deadline TIMESTAMPTZ NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create investments table
CREATE TABLE investments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('stock', 'mutual_fund', 'sip', 'fd', 'gold')),
  amount DECIMAL(10, 2) NOT NULL,
  current_value DECIMAL(10, 2) NOT NULL,
  purchase_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create bills table
CREATE TABLE bills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create receipts table
CREATE TABLE receipts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  merchant TEXT NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create receipt_items table
CREATE TABLE receipt_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  receipt_id UUID REFERENCES receipts(id) ON DELETE CASCADE NOT NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipt_items ENABLE ROW LEVEL SECURITY;

-- Create policies for transactions
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions" ON transactions FOR DELETE USING (auth.uid() = user_id);

-- Create policies for budgets
CREATE POLICY "Users can view own budgets" ON budgets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own budgets" ON budgets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own budgets" ON budgets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own budgets" ON budgets FOR DELETE USING (auth.uid() = user_id);

-- Create policies for goals
CREATE POLICY "Users can view own goals" ON goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own goals" ON goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals" ON goals FOR DELETE USING (auth.uid() = user_id);

-- Create policies for investments
CREATE POLICY "Users can view own investments" ON investments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own investments" ON investments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own investments" ON investments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own investments" ON investments FOR DELETE USING (auth.uid() = user_id);

-- Create policies for bills
CREATE POLICY "Users can view own bills" ON bills FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bills" ON bills FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own bills" ON bills FOR DELETE USING (auth.uid() = user_id);

-- Create policies for receipts
CREATE POLICY "Users can view own receipts" ON receipts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own receipts" ON receipts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for receipt_items
CREATE POLICY "Users can view receipt items" ON receipt_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM receipts WHERE receipts.id = receipt_items.receipt_id AND receipts.user_id = auth.uid())
);
CREATE POLICY "Users can insert receipt items" ON receipt_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM receipts WHERE receipts.id = receipt_items.receipt_id AND receipts.user_id = auth.uid())
);
\`\`\`

### 4. Configure Environment Variables

1. Copy the example environment file:

\`\`\`bash
cp .env.example .env
\`\`\`

2. Update `.env` with your Supabase credentials:

\`\`\`env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_public_anon_key_here
\`\`\`

### 5. Start Development Server

\`\`\`bash
pnpm run dev
\`\`\`

The app will be available at the URL shown in your Figma Make preview.

## Deployment to Vercel

### Option 1: Deploy via Vercel Dashboard

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and click "New Project"
3. Import your GitHub repository
4. Configure environment variables:
   - Add `VITE_SUPABASE_URL`
   - Add `VITE_SUPABASE_ANON_KEY`
5. Click "Deploy"

### Option 2: Deploy via Vercel CLI

\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# Deploy to production
vercel --prod
\`\`\`

## Usage

1. **Sign Up**: Create a new account or sign in
2. **Add Transactions**: Use the Transactions page, Voice Entry, or Receipt Scanner
3. **Set Budgets**: Create budgets for different categories
4. **Create Goals**: Set financial goals and track progress
5. **View Analytics**: Check the Dashboard and Analytics pages for insights
6. **Monitor Fraud**: Review the Alerts page for suspicious transactions
7. **Import Data**: Use the Bank Import feature to import CSV statements

## Security Notes

- ✅ Uses Supabase Row Level Security (RLS) for data protection
- ✅ Only uses the public `anon` key in frontend (safe for client-side)
- ✅ Never uses `service_role` key in frontend code
- ✅ All database operations are scoped to the authenticated user
- ✅ Environment variables are not committed to version control

## Data Persistence

All data is automatically saved to your Supabase database and will persist across:
- Browser refreshes
- Device changes
- Session restarts

Simply log in from any device to access your data.

## Troubleshooting

### "User not authenticated" error
- Make sure you're logged in
- Check that your Supabase credentials in `.env` are correct

### Transactions not saving
- Verify Row Level Security policies are created in Supabase
- Check browser console for error messages
- Ensure you're logged in with a valid session

### Voice input not working
- Voice recognition requires HTTPS or localhost
- Check browser compatibility (Chrome/Edge recommended)
- Allow microphone permissions when prompted

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
