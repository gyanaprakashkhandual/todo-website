# todo-website

A web-based todo application built with React, TypeScript, and Vite. Styled with Tailwind CSS, animated with Framer Motion, and built on Primer UI components.

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Primer UI

## Requirements

- Node.js v18 or higher
- npm v9 or higher

## Getting Started

Clone the repository:

```bash
git clone https://github.com/gyanaprakashkhandual/todo-website.git
cd todo-website
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The app runs at `http://localhost:3000`.

## Build

```bash
# Production build
npm run build

# Preview production build locally
npm run preview
```

Output is in the `dist/` directory.

## Project Structure

```
todo-website/
├── src/
│   ├── components/
│   │   ├── TodoForm.tsx
│   │   ├── TodoItem.tsx
│   │   └── TodoList.tsx
│   ├── hooks/
│   │   └── useTodos.ts
│   ├── types/
│   │   └── todo.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

## Scripts

| Command           | Description       |
| ----------------- | ----------------- |
| `npm run dev`     | Start dev server  |
| `npm run build`   | Production build  |
| `npm run preview` | Preview built app |
| `npm run lint`    | Run ESLint        |

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Security

See [SECURITY.md](./SECURITY.md).

## License

MIT — see [LICENSE.md](./LICENSE.md).
