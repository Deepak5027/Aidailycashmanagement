# Deployment Guide for FinanceAI

## Quick Start

Your app is now fully connected to Supabase and ready for deployment!

## What's Been Set Up

✅ **Supabase Client**: Configured in `src/lib/supabase.ts`
✅ **Environment Variables**: Using `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
✅ **Authentication**: Supabase Auth with signup/login/logout
✅ **Database**: All CRUD operations connected to Supabase tables
✅ **Real-time Data**: Transactions, budgets, goals, receipts all persist in Supabase
✅ **Security**: Row Level Security (RLS) policies protect user data
✅ **Fraud Detection**: AI-powered risk scoring on transactions
✅ **Receipt OCR**: Tesseract.js saves to Supabase
✅ **Voice Entry**: Speech recognition saves to Supabase

## Environment Setup

Your `.env` file should contain:

```env
VITE_SUPABASE_URL=https://zjzwrjtefacptghosbtm.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_T_AnCaPE1wSp2yxpQL-O5A_cEGUXjoc
```

## Database Setup

Run this SQL in your Supabase SQL Editor to create all required tables and policies:

[See complete SQL schema in README.md]

## Testing Locally

1. Make sure your `.env` file has the correct Supabase credentials
2. Run the dev server (it's already running in Figma Make)
3. Sign up for a new account
4. Add some transactions
5. Refresh the page - data should persist!

## Deploy to Vercel

### Via Vercel Dashboard

1. Push code to GitHub
2. Import repository in Vercel
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

### Via Vercel CLI

```bash
vercel
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel --prod
```

## Verifying Deployment

After deployment, test these features:

1. ✅ Sign up with a new account
2. ✅ Add a transaction (Transactions page)
3. ✅ Refresh the page - transaction should still be there
4. ✅ Create a budget
5. ✅ Scan a receipt (if on HTTPS)
6. ✅ View dashboard charts
7. ✅ Check fraud alerts
8. ✅ Create a goal
9. ✅ Log out and log back in - all data should persist

## Data Flow

1. **User signs up** → Supabase Auth creates user
2. **User adds transaction** → Saved to `transactions` table with `user_id`
3. **Fraud analysis** → Risk score calculated and saved
4. **Budget tracking** → Spent amounts calculated from transactions
5. **Dashboard loads** → Fetches all user's data via RLS policies
6. **Browser refresh** → Data loads from Supabase (no mock data!)

## Security Notes

- ✅ Only using `anon` key (safe for frontend)
- ✅ Never using `service_role` key in client
- ✅ All tables have RLS enabled
- ✅ Users can only access their own data
- ✅ Environment variables not committed to git

## Troubleshooting

**Issue**: "User not authenticated"
- **Fix**: Make sure you're logged in, check Supabase credentials

**Issue**: Data not persisting
- **Fix**: Verify RLS policies are created, check browser console

**Issue**: Transactions not showing
- **Fix**: Make sure user_id is being set correctly, check Supabase table editor

## Next Steps

- ✅ Your app is production-ready!
- ✅ Deploy to Vercel
- ✅ Share with users
- ✅ Monitor via Supabase dashboard

## Support

- Check browser console for errors
- View Supabase logs in dashboard
- Check Vercel deployment logs if issues arise
