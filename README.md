# Steply - Smart Budget Tracker

A modern budget tracking application built with Next.js, Firebase, and TypeScript. Track your finances in Ghana Cedis (₵) with built-in calculator and currency converter.

## Features

- 🔐 **Authentication** - Email/Password and Google Sign-In
- 💰 **Ghana Cedi Support** - Native GHS currency formatting
- 📊 **Dashboard** - Real-time financial overview
- 🧮 **Calculator** - Built-in calculator tool
- 💱 **Currency Converter** - Live exchange rates
- 📱 **Mobile Responsive** - Works on all devices
- 🌙 **Dark Mode** - Light and dark themes
- 🔒 **PIN Lock** - Optional PIN protection
- 📈 **Analytics** - Track spending patterns
- 💳 **Budget Management** - Set and monitor budgets

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Firebase (Auth + Firestore)
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Nejijay/steply.git
cd steply
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. Set up Firebase:
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication (Email/Password and Google)
   - Create a Firestore database
   - Copy your config values to `.env.local`

5. Deploy Firestore rules and indexes:
```bash
firebase login
firebase use your-project-id
firebase deploy --only firestore:rules,firestore:indexes
```

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Deployment to Vercel

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Nejijay/steply)

### Manual Deployment

1. Push your code to GitHub (already done!)

2. Go to [Vercel](https://vercel.com) and sign in

3. Click "Add New Project"

4. Import your GitHub repository: `Nejijay/steply`

5. **Configure Environment Variables** (IMPORTANT):
   - Click "Environment Variables"
   - Add each variable from your `.env.local`:
     - `NEXT_PUBLIC_FIREBASE_API_KEY`
     - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
     - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
     - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
     - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
     - `NEXT_PUBLIC_FIREBASE_APP_ID`

6. Click "Deploy"

7. Your app will be live at `https://your-project.vercel.app`

### Environment Variables for Vercel

You need to add these in Vercel Dashboard → Project Settings → Environment Variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBlUXU62LmCYl9vY7MFVMiDoPFB4ixiQX0
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=stephly-66329.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=stephly-66329
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=stephly-66329.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=991913334923
NEXT_PUBLIC_FIREBASE_APP_ID=1:991913334923:web:573fcb3e8a955f682f5c8e
```

## Firebase Security Rules

The app uses secure Firestore rules that ensure:
- Users can only access their own data
- All operations require authentication
- Data is validated before writing

Rules are in `firestore.rules` and can be deployed with:
```bash
firebase deploy --only firestore:rules
```

## Project Structure

```
steply/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   │   ├── ui/          # shadcn/ui components
│   │   ├── Calculator.tsx
│   │   ├── CurrencyConverter.tsx
│   │   └── Sidebar.tsx
│   ├── contexts/        # React contexts
│   ├── lib/             # Utilities and services
│   │   ├── firebase.ts
│   │   ├── currency.ts
│   │   └── types.ts
├── public/              # Static files
├── firestore.rules      # Firestore security rules
├── firestore.indexes.json
└── firebase.json
```

## Features in Detail

### Calculator
- Basic arithmetic operations
- Clean, modern interface
- Accessible from sidebar

### Currency Converter
- Real-time exchange rates
- Supports GHS, USD, EUR, GBP, NGN, ZAR
- Quick conversion buttons
- Auto-refresh rates

### Dashboard
- Total balance, income, and expenses
- Budget progress tracking
- Recent transactions
- Monthly overview charts

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ by Nejijay
