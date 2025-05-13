# ParentPrompt

ParentPrompt is a web application designed to help parents engage with their children through AI-generated conversation starters, activities, and educational prompts tailored to their children's ages and interests.

This project is built with [Next.js](https://nextjs.org) and bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Features

- **Personalized Prompts**: AI-generated conversation starters and activities tailored to your child's age and interests
- **Scheduling**: Set up prompts to be delivered at specific times that fit your family routine
- **Multiple Children**: Manage profiles for all your children with age-appropriate content for each
- **Favorites**: Save your favorite prompts for easy access later
- **Mobile Responsive**: Access ParentPrompt from any device

## Project Structure

```
src/
├── app/               # Next.js App Router pages
│   ├── about/         # About page
│   ├── auth/          # Authentication pages (sign-in, sign-up)
│   ├── dashboard/     # User dashboard
│   └── profile/       # User profile management
├── components/        # Reusable React components
├── context/           # React context providers
├── hooks/             # Custom React hooks
├── lib/               # Shared libraries and configurations
├── styles/            # CSS and style-related files
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/parentprompt.git
   cd parentprompt/web
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env.local
   # Then edit .env.local with your configuration
   ```

4. Run the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a custom font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Technology Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS 3
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Styling**: TailwindCSS
- **Deployment**: Vercel
- **Code Quality**: ESLint, Prettier
- **Version Control**: Git, GitHub

## Contributing

We welcome contributions to ParentPrompt! Please follow these steps to contribute:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`npm run lint`)
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style

This project uses ESLint and Prettier to enforce code style. Before committing, make sure your code passes all linting checks:

```bash
npm run lint
npm run format:check
```

You can automatically fix most issues with:

```bash
npm run format
```

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
