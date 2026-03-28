# Contributing

Contributions are welcome. Please read this guide before submitting.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork:

```bash
git clone https://github.com/your-username/todo-website.git
cd todo-website
```

3. Install dependencies:

```bash
npm install
```

4. Start the development server:

```bash
npm run dev
```

## Making Changes

Create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

Keep each branch focused on a single change. Do not mix unrelated changes in one pull request.

## Commit Messages

Write clear, concise commit messages in the imperative mood:

```
Add priority filter to todo list
Fix animation not triggering on item delete
Update Tailwind config to extend theme colours
```

## Pull Requests

Before submitting a pull request:

- Ensure the app builds without errors — `npm run build`
- Test your changes in a browser
- Keep the PR description brief but clear — explain what changed and why

Submit pull requests against the `main` branch.

## Reporting Issues

When opening a bug report, include:

- Browser and operating system
- Node.js version — `node -v`
- Steps to reproduce the issue
- What you expected versus what happened

## Code Style

- All code must be written in TypeScript
- React components go in `src/components/` and use the `.tsx` extension
- Custom hooks go in `src/hooks/`
- Shared types go in `src/types/`
- Use Tailwind for layout and page-level styling
- Use Primer's `sx` prop for styling inside Primer components
- Keep components small and focused on a single responsibility

## Questions

Open a GitHub Discussion or comment on the relevant issue before starting
larger changes to align with the project direction.
