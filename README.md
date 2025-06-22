# Nsiod Auth System

A modern user authentication system built with Hono.js, Drizzle ORM, and SQLite.

## ✨ Features

- 🔐 User registration, login, logout
- 📧 Email verification and password reset
- 👤 User profile management
- 🛡️ Role-based access control
- 📱 Admin panel
- 🔒 Secure session management

## 🚀 Tech Stack

- **Runtime**: Bun
- **Framework**: Hono.js
- **Database**: SQLite + Drizzle ORM
- **Templates**: Pug
- **Styling**: Tailwind CSS
- **Email**: Resend

## 🛠️ Quick Start

1. **Install dependencies**
   ```bash
   bun install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   ```

3. **Setup database**
   ```bash
   bun run db:gen
   bun run db:push
   bun run db:seed
   ```

4. **Start server**
   ```bash
   bun run dev
   ```

Visit `http://localhost:3000` to get started.

## 📦 Environment Variables

```env
# IM (Instant Messaging) Configuration
IM_PORT=3000
IM_HOST=0.0.0.0
IM_SERVER_NAME=localhost
IM_MAIL_URL=localhost

ADMIN_TOKEN=your-secure-admin-token

# Configuration
# The runtime preset to use for deployment.
# Options include:
# - 'cloudflare-module': For deploying to Cloudflare worker.
# - 'vercel': For deploying to Vercel.
# - 'node': For using the Node.js runtime.
# - 'node_cluster': For deploying with Node.js in a clustered setup.
# This variable allows you to dynamically select the appropriate runtime environment
# based on your deployment target.
DEPLOY_RUNTIME=node

# LibSQL Configuration
# The URL for connecting to the LibSQL database. Default is a local SQLite file.
LIBSQL_URL=libsql://your-libsql-database-url

# The authentication token for accessing the LibSQL database.
LIBSQL_AUTH_TOKEN=your-libsql-auth-token

# Database Type
# Specify the type of database being used. Choose 'libsql' for LibSQL or 'd1' for Cloudflare D1.
# This determines which credentials and driver will be used in the configuration.
DB_TYPE=libsql

# Email Configuration (Resend)
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@resend.dev

```

## 📝 Routes

- `/` - Homepage
- `/account/login` - User login
- `/account/register` - User registration
- `/account/setting` - User settings
- `/account/forgot-password` - Forgot password
- `/admin` - Admin panel

## 🗄️ Database Tables

- `users` - User basic information
- `user_groups` - User role groups
- `user_details` - Extended user details
- `sessions` - User sessions
- `email_verification_tokens` - Email verification tokens
- `password_reset_tokens` - Password reset tokens
