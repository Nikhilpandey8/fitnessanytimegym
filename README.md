# FitnessAnytime Gym Management System

A premium admin-only gym management web application built with Next.js, Supabase, and modern UI components. Ready for deployment on Vercel, Netlify, or any hosting platform.

## Features

- **Admin Authentication**: Secure login system for gym administrators
- **Member Management**: Add, view, and manage gym members
- **Membership Activation**: Flexible membership plans (1 month, 3 months, 1 year)
- **Status Management**: Active, Hold, Resume, and Deactivate memberships
- **Fee Slip Generation**: Professional receipts with print and PDF download
- **Automatic Calculations**: Smart date calculations and expiry tracking
- **Premium UI**: Dark theme with glassmorphism design and smooth animations

## Quick Deployment Guide

### Deploy to Vercel (Recommended)
1. Fork this repository to your GitHub account
2. Connect your GitHub repo to Vercel
3. Add environment variables in Vercel dashboard:
   - `ADMIN_USERNAME=fitnessanytime`
   - `ADMIN_PASSWORD=Suraj@001`
4. Deploy!

### Deploy to Netlify
1. Fork this repository to your GitHub account
2. Connect your GitHub repo to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `.next`
5. Add environment variables in Netlify dashboard:
   - `ADMIN_USERNAME=fitnessanytime`
   - `ADMIN_PASSWORD=Suraj@001`
6. Deploy!

## Local Development Setup

1. **Database Setup**
   - Create a new Supabase project at https://supabase.com
   - Go to your Supabase dashboard → SQL Editor
   - Navigate to SQL Editor
   - Run all migration scripts from `supabase/migrations/` folder in order

2. **Environment Variables** 
   - Create `.env.local` file in root directory
   - Add your Supabase credentials:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ADMIN_USERNAME=fitnessanytime
     ADMIN_PASSWORD=Suraj@001
     ```
   - Admin credentials:
     - Username: `fitnessanytime`
     - Password: `Suraj@001`

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Access the Application** 
   - Navigate to the development URL
   - Login with admin credentials
   - Start managing your gym!

## Environment Variables Required

For deployment, you need to set these environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ADMIN_USERNAME=fitnessanytime
ADMIN_PASSWORD=Suraj@001
```

## Database Schema

The application uses the following tables:
- `members`: Store member information
- `memberships`: Track membership periods and status
- `payments`: Record payment transactions
- `fee_slips`: Generated receipts and invoices

## Admin Features

- **Dashboard Overview**: View active members, expiring memberships, and alerts
- **Member Management**: Add new members with contact details
- **Membership Activation**: Create new memberships with automatic fee slip generation
- **Status Control**: Hold, resume, or deactivate memberships as needed
- **Fee Slip Management**: Generate, print, and download professional receipts

## Technology Stack

- **Frontend**: Next.js 13+ (App Router), React, TypeScript
- **Styling**: TailwindCSS, Framer Motion, Custom CSS
- **Database**: Supabase with Row Level Security
- **Authentication**: Custom admin session management
- **Validation**: Zod schema validation
- **Date Handling**: Day.js for date calculations
- **PDF Generation**: jsPDF and html2canvas

## Deployment Notes

- The application is optimized for serverless deployment
- Works perfectly with Vercel, Netlify, and other modern hosting platforms
- No server-side dependencies - fully client-side with Supabase backend
- Responsive design works on all devices

Built with ❤️ for FitnessAnytime Gym