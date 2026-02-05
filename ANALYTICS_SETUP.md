# Google Analytics Setup Guide

## Quick Setup (5 minutes)

### Step 1: Create Google Analytics Account
1. Go to https://analytics.google.com
2. Click "Start measuring"
3. Create an account (name it "Media4U")
4. Create a property (name it "Media4U Website")
5. Select your timezone and currency

### Step 2: Set Up Data Stream
1. Choose "Web" platform
2. Enter your website URL: `https://media4u.fun`
3. Enter stream name: "Media4U Production"
4. Click "Create stream"

### Step 3: Get Your Measurement ID
1. After creating the stream, you'll see a **Measurement ID**
2. It looks like: `G-XXXXXXXXXX`
3. Copy this ID

### Step 4: Add to Your Environment Variables
1. Open your `.env.local` file (create it if it doesn't exist)
2. Add this line:
   ```
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```
   (Replace with your actual Measurement ID)

### Step 5: Deploy
1. If deploying to Vercel:
   - Go to your Vercel project settings
   - Add Environment Variable:
     - Name: `NEXT_PUBLIC_GA_MEASUREMENT_ID`
     - Value: `G-XXXXXXXXXX`
   - Redeploy

### Step 6: Verify It's Working
1. Visit your website
2. Go back to Google Analytics
3. Click "Realtime" in the left sidebar
4. You should see yourself as an active user!

## What Gets Tracked

Google Analytics will automatically track:
- ✅ Page views
- ✅ User sessions
- ✅ Traffic sources (where visitors come from)
- ✅ Geographic location
- ✅ Device type (desktop, mobile, tablet)
- ✅ Browser and OS
- ✅ Bounce rate
- ✅ Session duration

## Useful Reports

**Acquisition Reports:**
- See where your visitors come from (Google, social media, direct, etc.)

**Engagement Reports:**
- Most popular pages
- Average time on site
- Pages per session

**User Reports:**
- Demographics (age, gender, location)
- Technology (devices, browsers)

**Realtime Reports:**
- See current active users
- What pages they're viewing right now

## Need Help?

If Google Analytics isn't working:
1. Make sure the Measurement ID is correct
2. Make sure it starts with `G-` (not `UA-`)
3. Clear your browser cache and try again
4. Check the browser console for errors
5. Wait 24 hours for data to start showing (realtime works immediately)

## Privacy Note

Google Analytics is:
- ✅ GDPR compliant (when configured correctly)
- ✅ Free forever
- ✅ Industry standard
- ✅ Required by most marketing teams

Your site now has Analytics ready - just add your Measurement ID!
