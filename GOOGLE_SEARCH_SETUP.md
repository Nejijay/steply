# 🔍 Google Custom Search API Setup Guide

## Step 1: Get Your API Key

1. Go to [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
2. Make sure you're in your project: **stephly (991913334923)**
3. Click **"+ CREATE CREDENTIALS"** → **"API key"**
4. Copy the API key that appears
5. (Optional but recommended) Click **"RESTRICT KEY"** and:
   - Under "API restrictions", select **"Restrict key"**
   - Choose **"Custom Search API"**
   - Click **"Save"**

## Step 2: Create a Custom Search Engine

1. Go to [Programmable Search Engine](https://programmablesearchengine.google.com/controlpanel/all)
2. Click **"Add"** to create a new search engine
3. Configure it:
   - **Search engine name**: "Steply Budget Assistant Search"
   - **What to search**: Select **"Search the entire web"**
   - Click **"Create"**
4. After creation, click on your search engine
5. Go to **"Setup" → "Basic"**
6. Copy the **Search engine ID** (looks like: `0123456789abcdef:example`)

## Step 3: Enable the API

1. Go to [Google Custom Search API](https://console.cloud.google.com/apis/library/customsearch.googleapis.com)
2. Make sure you're in project: **stephly**
3. Click **"ENABLE"** (if not already enabled)

## Step 4: Add Keys to Your App

Open `.env.local` and replace:

```env
NEXT_PUBLIC_GOOGLE_SEARCH_API_KEY=YOUR_SEARCH_API_KEY_HERE
NEXT_PUBLIC_GOOGLE_SEARCH_ENGINE_ID=YOUR_SEARCH_ENGINE_ID_HERE
```

With your actual keys:

```env
NEXT_PUBLIC_GOOGLE_SEARCH_API_KEY=AIzaSy...your_actual_key
NEXT_PUBLIC_GOOGLE_SEARCH_ENGINE_ID=0123456789abcdef:example
```

## Step 5: Restart Your Server

```bash
npm run dev
```

---

## 🎯 How It Works

Steply now uses a **3-tier search system**:

1. **Google Custom Search** (primary) - Most accurate, comprehensive results
2. **DuckDuckGo** (fallback) - Free, no API key needed
3. **Wikipedia** (final fallback) - For factual queries

When you ask questions like:
- "What is Bitcoin?"
- "Who is the president of Ghana?"
- "What's the weather in Accra?"

Steply will:
1. ✅ Try Google Custom Search first (best results)
2. ✅ If no results, try DuckDuckGo
3. ✅ If still no results, try Wikipedia
4. ✅ Use the results to answer your question accurately

---

## 💡 Free Tier Limits

Google Custom Search API free tier includes:
- **100 searches per day** - FREE
- After that: $5 per 1000 queries

For a personal budget app, 100/day is plenty! 🚀

---

## ✅ Test It

After setup, restart and ask Steply:
- "What is Bitcoin?"
- "Who is Nana Akufo-Addo?"
- "What's the capital of Ghana?"

You should see: `✅ Search: Google Custom Search` in the console! 🎉
