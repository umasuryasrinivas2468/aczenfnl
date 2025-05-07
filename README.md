# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/d3e274db-dbf0-4510-b86b-54765d204ad4

## Environment Setup

Before running the application, you need to set up your environment:

1. **Create Environment Files**:
   - Copy `.env.example` to `.env` in the root directory
   - Copy `server/config/cashfree.example.js` to `server/config/cashfree.js`

2. **Add Your Cashfree Credentials**:
   - Update `.env` with your Cashfree App ID:
     ```
     VITE_CASHFREE_APP_ID=your_app_id_here
     ```
   - Update `server/config/cashfree.js` with your Cashfree credentials:
     ```js
     export const cashfreeConfig = {
       appId: 'your_app_id_here',
       secretKey: 'your_secret_key_here',
       mode: 'PRODUCTION', // Or 'TEST' for sandbox
       apiBase: 'https://api.cashfree.com/pg'
     };
     ```

3. **Important Security Note**:
   - Never commit files containing real API credentials to version control
   - Make sure `.env` and `server/config/cashfree.js` are in your `.gitignore`

## Development

Follow these steps to start the development server:

1. Install dependencies:
   ```
   npm install
   ```

2. Start the frontend development server:
   ```
   npm run dev
   ```

3. Start the backend server (in a separate terminal):
   ```
   cd server
   npm install
   npm run dev
   ```

## Building for Production

To build the application for production:

```
npm run build
```

The build output will be in the `dist` folder.

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/d3e274db-dbf0-4510-b86b-54765d204ad4) and start prompting.

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

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/d3e274db-dbf0-4510-b86b-54765d204ad4) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
