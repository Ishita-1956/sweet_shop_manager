# Sweet Shop Management System

A comprehensive sweet shop management system built with Next.js, TypeScript, Supabase, and Tailwind CSS.

## Features

- **Authentication**: Email/password authentication with role-based access (Admin/User)
- **Dashboard**: Overview with statistics and sweets catalog
- **Inventory Management**: Full CRUD operations for sweet products with image upload
- **Orders**: Purchase tracking with role-based views
- **Users**: Admin-only user management
- **Settings**: Profile management, shop configuration, and theme toggle (light/dark mode)

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project

### Installation Steps

1. **Clone or download the project**
   \`\`\`bash
   # If downloaded as ZIP, extract it first
   cd sweet-shop-management
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Configure Environment Variables**
   
   The environment variables are already configured in your Vercel project. For local development, create a `.env.local` file:
   
   \`\`\`env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   \`\`\`

4. **Run Database Migrations**
   
   The SQL scripts in the `scripts` folder need to be run in your Supabase project:
   
   - Go to your Supabase Dashboard
   - Navigate to SQL Editor
   - Run each script in order:
     1. `001_create_tables.sql` - Creates tables and RLS policies
     2. `002_seed_data.sql` - Seeds initial sweet products
     3. `003_add_theme_column.sql` - Adds theme support
     4. `004_create_storage_bucket.sql` - Sets up image storage

5. **Disable Email Confirmation** (Already done, but for reference)
   
   - Go to Supabase Dashboard → Authentication → Providers → Email
   - Turn OFF "Confirm email"

6. **Start the Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`

7. **Open in Browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### First Time Setup

1. **Create an Admin Account**
   - Go to `/auth/sign-up`
   - Fill in your details
   - Select "Admin" as your role
   - Sign up

2. **Add Products**
   - Navigate to Dashboard → Inventory
   - Use the "Quick Add Sweet" panel
   - Upload images via drag & drop or file selection

3. **Manage Orders**
   - Users can purchase from the main dashboard
   - Orders appear in the Orders tab
   - Admins can update order status

## Project Structure

\`\`\`
├── app/
│   ├── auth/          # Authentication pages
│   ├── dashboard/     # Dashboard pages (inventory, orders, users, settings)
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Landing page
├── components/        # Reusable components
├── lib/              # Utilities and Supabase clients
├── scripts/          # Database migration scripts
└── public/           # Static assets
\`\`\`

## Key Technologies

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui

## Features Breakdown

### Authentication
- Email/password sign up and login
- Role-based access (Admin/User)
- Automatic profile creation
- Toast notifications for success/error

### Dark Mode
- System-wide theme toggle
- Persists across sessions
- Applies to all dashboard pages

### Inventory
- Add/Edit/Delete sweets
- Drag & drop image upload
- Stock management with visual indicators
- Category organization
- CSV export

### Orders
- Purchase functionality
- Automatic stock deduction
- Order status tracking
- Role-based views (users see only their orders, admins see all)

### Settings
- Profile management
- Shop configuration
- Theme preferences
- Currency selection

## Troubleshooting

### Images not uploading
- Ensure the storage bucket is created (run `004_create_storage_bucket.sql`)
- Check storage policies in Supabase Dashboard

### Authentication not working
- Verify environment variables are set correctly
- Ensure email confirmation is disabled in Supabase
- Check browser console for errors

### Dark mode not persisting
- Clear localStorage and try again
- Ensure theme is saved in settings

## Support

For issues or questions, check the browser console for error messages and verify all database scripts have been run successfully.
