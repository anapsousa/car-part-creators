# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/1f05c717-5032-4e33-8db0-cd1f4a64f257

## Features

- Newsletter subscription system with GDPR-compliant consent tracking
- Integration with Resend for email marketing (free tier: 3000 emails/month, 100/day)
- Bilingual support (English/Portuguese)
- Duplicate subscription prevention
- Admin-only access to subscriber data via RLS policies

## Newsletter Setup

To enable the newsletter subscription feature:

1. Create a free account at resend.com
2. Generate an API key
3. Create an audience/list for newsletter subscribers
4. Copy the audience ID and API key to Supabase secrets as described in the Environment Configuration section below

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/1f05c717-5032-4e33-8db0-cd1f4a64f257) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Local Development Setup

### Prerequisites
- Node.js (v18 or higher) and npm - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- Git for version control
- Optional: Supabase CLI for local database development ([installation docs](https://supabase.com/docs/guides/cli/getting-started))
- Optional: Docker Desktop (required if using Supabase CLI locally)

### Initial Setup
1. Clone the repository using the Git URL from the project info section
2. Navigate to the project directory (`cd car-part-creators`)
3. Install dependencies with `npm install`
4. Set up environment variables (see "Environment Configuration" section below)

### Environment Configuration
The project supports dual-environment setup for Supabase:

- **Remote Supabase (Default)**: The `.env` file is used for local development and should contain your production Supabase credentials (URL, publishable key, project ID). This allows you to connect to the hosted Supabase instance during local development and testing. **Note:** The `.env` file is strictly for local development use only and is not used in production deployments.

- **Local Supabase (Optional)**: For offline development or testing migrations locally, create a `.env.local` file with local Supabase credentials:

  ```
  VITE_SUPABASE_URL=http://localhost:54321
  VITE_SUPABASE_PUBLISHABLE_KEY=<local_anon_key>
  VITE_SUPABASE_PROJECT_ID=<local_project_id>
  ```

  Vite prioritizes `.env.local` over `.env` per its environment variable loading order. The `.env.local` file is gitignored (via `*.local` pattern) to prevent accidental commits.

  To start local Supabase:
  - Run `supabase start` (requires Supabase CLI and Docker)
  - Get local credentials with `supabase status` (shows local API URL and anon key)

### Securing Environment Variables

The `.env` file is strictly for local development only. It is included in `.gitignore` and should never be committed to version control. This prevents accidental exposure of sensitive information on GitHub.

**Important:** Production deployments via Lovable do not use the `.env` file. Instead, Supabase credentials for production are configured through Lovable's environment variable management system (accessible via the Lovable project settings). This ensures that production credentials are managed separately from your local development setup.

#### Obtaining Supabase Credentials

For local development, you need to create a `.env` file with your Supabase credentials. These credentials can be obtained from the Supabase Dashboard:

1. Navigate to your project dashboard at https://supabase.com/dashboard/project/[project-id]/settings/api (replace [project-id] with your actual project ID).
2. Under "Project API keys", copy the "anon public" key for `VITE_SUPABASE_PUBLISHABLE_KEY`.
3. Copy the "Project URL" for `VITE_SUPABASE_URL`.
4. Copy the "Project Reference ID" for `VITE_SUPABASE_PROJECT_ID`.

Create a `.env` file in the project root with the following format:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
VITE_SUPABASE_PROJECT_ID=your-project-id-here
```

Note: The **database password** is NOT needed for frontend applications and should never be added to the `.env` file, as it grants full database access and is intended for server-side use only.

#### Edge Function Secrets

For Supabase Edge Functions to work properly, certain secrets need to be configured in the Supabase Dashboard:

- `RESEND_API_KEY` - Your Resend API key (get from resend.com dashboard, format: `re_xxxxxxxxx`)
- `RESEND_AUDIENCE_ID` - The ID of your Resend audience/list where newsletter subscribers will be added (format: UUID)

To set these variables:

1. Navigate to Supabase Dashboard → Project Settings → Edge Functions → Secrets
2. Add both secrets with their respective values
3. These are required for the newsletter subscription feature to work

#### Using GitHub Secrets for CI/CD

If your project uses GitHub Actions or other CI/CD pipelines, store sensitive environment variables as GitHub repository secrets:

- Go to your repository Settings → Secrets and variables → Actions.
- Add secrets for `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and `VITE_SUPABASE_PROJECT_ID`.
- In your workflow files, access them using `${{ secrets.VITE_SUPABASE_URL }}`, etc.

### Running the Development Server
Run `npm run dev` to start the Vite development server on `http://localhost:8080`. This enables hot module replacement (HMR) for instant updates. The server is accessible on all network interfaces (`::`), allowing testing on mobile devices via local IP.

Expect the app to load with the home page, language selector, and navigation working.

### Database Migrations
- **Remote Supabase**: Migrations are automatically applied on deployment via Lovable.
- **Local Supabase**: Run `supabase db reset` to reset the local database and apply all migrations, or `supabase migration up` to apply pending migrations only.
- Migration files are in `supabase/migrations/` and follow a timestamp naming convention.
- When inserting data, consider Row Level Security (RLS) implications; use SECURITY DEFINER functions for RLS-protected tables, as demonstrated in `20251126_add_cms_content_for_all_components.sql`.
- See the "Content Management & Translations" section for translation-specific migrations.

#### Apply Migrations to Remote Supabase (Fix Empty content_translations Table)

1. **Get Service Role Key**:
   - Go to [Supabase Dashboard → Settings → API](https://supabase.com/dashboard/project/YOUR_PROJECT_ID/settings/api)
   - Copy `service_role` secret key

2. **Validate Migrations** (optional):
   ```sh
   npm run validate:migrations
   ```

3. **Apply All Migrations**:
   ```sh
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key npm run migrate:db
   ```

This will create/populate `content_translations` table with all translations. Safe to rerun (idempotent).

After running, refresh the app - console warning disappears, translations load from DB.

#### Migration Guidelines
Comprehensive migration guidelines are available in `supabase/migrations/README.md`. Before creating new migrations, run `npm run validate:migrations` to check for common issues. Always test migrations locally with `supabase db reset` before pushing to ensure they work correctly.

## Content Management & Translations

### Overview
The application uses a database-driven content management system via the `content_translations` table in Supabase. Content is fetched using the `useContent` hook, which returns translations based on the current language (English or Portuguese). This replaces the legacy JSON-based i18n system (`pt.json`, `en.json`), which is kept for reference.

### Accessing the Admin Content Manager
Admins can access the content manager at `/admin/content`. Prerequisites include being logged in with an admin role in the `user_roles` table. The UI features include search, filtering by page tabs, inline editing, and add/delete operations.

### Adding Portuguese Translations
To add translations:
1. Navigate to `/admin/content`.
2. Use the page tabs to filter content by section (home, shop, faq, etc.).
3. Click "Edit" on any content entry.
4. Fill in the Portuguese text field using the existing `pt.json` file as a style reference.
5. Click "Save" to update the translation.

The `pt.json` file in `src/i18n/locales/pt.json` should be used as a reference for translation style, tone, and terminology. A migration file (`20251119_populate_portuguese_translations.sql`) has been created to bulk-populate most translations.

### Running the Translation Migration
To apply the Portuguese translation migration:
- For local development: Run `supabase db reset` or `supabase migration up`.
- For production: The migration will be applied automatically on next deployment.

After running the migration, most content will have Portuguese translations. Any new content added through the admin UI should include both English and Portuguese text.

### Verifying Translations
To test translations:
1. Use the language selector in the header to switch between English and Portuguese.
2. Navigate through all pages to verify translations appear correctly.
3. Check that fallback to English works when Portuguese is missing.

The `useContent` hook automatically falls back to English text if Portuguese is not available.

### Adding New Content Keys
For developers adding new content:
1. Use the "Add Content" button in the admin UI.
2. Fill in all required fields: content_key (dot notation like "page.section.element"), content_type (text/heading/button/placeholder/label), page, section, English text, Portuguese text, and optional description.
3. Follow the existing naming conventions visible in the content manager.

Alternatively, create a new migration file with INSERT statements following the pattern in `20251119_add_missing_content_keys.sql`.

### Content Key Naming Conventions
- Naming pattern: `page.section.element` (e.g., `home.hero.title`, `shop.category.all`).
- Content types: text, heading, button, placeholder, label.
- The page field should match the route name (home, shop, faq, contact, about, generator, cart, wishlist, auth, checkout, dashboard, navigation, footer).

**Reference files:**
- `src/hooks/useContent.ts` - Hook for fetching content translations.
- `src/pages/AdminContentManager.tsx` - Admin UI for managing translations.
- `src/i18n/locales/pt.json` - Reference for Portuguese translation style.
- `supabase/migrations/20251119_populate_portuguese_translations.sql` - Bulk translation migration.

## Admin Access

### How to Access Admin Pages
Admin pages are accessible via the user dropdown menu in the header, which is only visible to users with admin role. The available admin routes are:
- `/admin/dashboard` - Design review and approval system
- `/admin/stats` - Business analytics (revenue, costs, users, designs)
- `/admin/products` - Product management for the shop
- `/admin/content` - CMS content manager for translations

### Current Admin User
The primary admin account is `anapsousa@gmail.com`. Note that the user must sign up and log in first before admin access becomes available, as the admin role is assigned in the database after account creation.

### How to Add More Admins
To grant admin access to additional users in the future, use the `ensure_admin_role()` helper function. This can be done via the Supabase SQL editor or by creating a new migration file. Example SQL command:

```sql
SELECT public.ensure_admin_role('newemail@example.com');
```

This function is idempotent and safe to run multiple times.

### Admin Features Overview
- **Design Review**: Approve or reject user-generated 3D models submitted through the generator
- **Statistics**: View comprehensive business analytics including revenue, costs, user metrics, and AI generation costs
- **Product Management**: Add, edit, or delete products available in the shop
- **Content Manager**: Edit CMS content and manage translations between English and Portuguese

## Build and Deployment

### Building for Production
Run `npm run build` to create an optimized production build. This generates static files in the `dist/` directory, including TypeScript compilation, React optimization, and asset bundling. Use `npm run build:dev` for a development build to debug production issues.

### Local Preview
After building, run `npm run preview` to serve the `dist/` directory on a local server (typically port 4173). This is useful for testing the production build before deployment.

### Publishing via Lovable
The project is hosted on Lovable and automatically deploys when changes are pushed to the repository. For manual deployment:

1. Open the Lovable project at the URL in the "Project info" section
2. Navigate to Share → Publish
3. Click "Publish" to deploy the latest changes

Lovable handles building the application, applying Supabase migrations automatically, deploying Edge Functions, and serving the static site with CDN. Deployment typically takes 2-3 minutes.

### Environment Variables in Production
Production deployments via Lovable do not use the `.env` file from the repository. Instead, Supabase credentials for production must be configured through Lovable's environment variable management system:

1. Open your Lovable project at the URL in the "Project info" section
2. Navigate to Project Settings → Environment Variables
3. Configure the following variables:
   - `VITE_SUPABASE_URL` - Your production Supabase project URL
   - `VITE_SUPABASE_PUBLISHABLE_KEY` - Your production Supabase anon/public key
   - `VITE_SUPABASE_PROJECT_ID` - Your production Supabase project ID

Sensitive variables for Edge Functions (like Stripe keys) should be configured in Supabase's Edge Function secrets through the Supabase Dashboard, not through Lovable's environment variables. Refer to Lovable documentation for managing environment variables and Supabase documentation for Edge Function secrets.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase
- React Router
- i18next for internationalization
- Three.js for 3D model rendering

This project uses Lovable for hosting and deployment.

## Testing the Complete Workflow

### Local Development Testing
- Start the development server with `npm run dev`
- Test language switching (English ↔ Portuguese) using the header language selector
- Navigate through all pages: Home, Shop, FAQ, Contact, About, Generator
- Test authentication: Sign up, sign in, sign out
- Test the 3D model generator (requires credits)
- Test cart and wishlist functionality
- Test admin features (requires admin role): `/admin/content`, `/admin/products`, `/admin/dashboard`
- Verify that content translations load correctly from the database
- Check browser console for errors

### Production Build Testing
- Run `npm run build` to create a production build
- Check for build errors or warnings in the terminal
- Run `npm run preview` to test the production build locally
- Perform the same functional tests as local development
- Verify that all assets load correctly (images, fonts, 3D models)
- Test on different browsers (Chrome, Firefox, Safari, Edge)
- Test responsive design on different screen sizes

### Post-Deployment Verification
- After publishing via Lovable, wait for deployment to complete (2-3 minutes)
- Visit the production URL (from the Lovable project page)
- Verify that the latest changes are live
- Test critical user flows: authentication, model generation, checkout
- Check that Supabase migrations were applied (verify new content keys in `/admin/content`)
- Monitor Supabase logs for any errors
- Test Edge Functions (credit purchase, model generation, checkout)

### Troubleshooting Common Issues
- **Build fails**: Check for TypeScript errors with `npm run lint`, ensure all dependencies are installed
- **Supabase connection errors**: Verify `.env` credentials, check Supabase project status
- **Migrations not applied locally**: Run `supabase db reset` to reset and reapply all migrations
- **Content not loading**: Check that migrations were applied, verify `content_translations` table has data
- **Edge Functions failing**: Check Supabase Edge Function logs, verify environment variables/secrets
- **Hot reload not working**: Restart the dev server, clear browser cache

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/1f05c717-5032-4e33-8db0-cd1f4a64f257) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)