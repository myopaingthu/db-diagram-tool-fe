# DB Diagram Tool

A real-time, AI-assisted visual database schema designer — draw tables, wire up relationships, and edit DBML side-by-side, in the spirit of [dbdiagram.io](https://dbdiagram.io/).

**Live app:** https://db-diagram-tool-fe-ruddy.vercel.app
**Backend API:** https://db-diagram-tool-bk.onrender.com
**Backend repo:** https://github.com/myopaingthu/db-diagram-tool-bk

> The backend is on Render's free tier, so it spins down after 15 minutes idle — the first request after a quiet period can take 30-60s to wake up.

## Features

- **Drag-and-drop ER canvas** — add tables and drag between columns to create relationships (one-to-one, one-to-many, many-to-many)
- **DBML editor** — write or paste DBML and see it parsed into the visual diagram, and back, in real time
- **Properties panel** — edit table names, columns, types, and primary key / unique / not-null constraints per column
- **AI chat assistant** — describe a schema in plain language and have it generated or modified for you, streamed live as it's written
- **Real-time sync** — edits sync to the backend over a WebSocket as you work, so nothing is lost on refresh
- **Auth & saved diagrams** — register/login, and a dashboard of your own saved diagrams

## Tech stack

- React 19 + TypeScript + [Vite 7](https://vite.dev/)
- [@xyflow/react](https://reactflow.dev/) (React Flow) — the diagram canvas
- [Zustand](https://github.com/pmndrs/zustand) — state management
- Tailwind CSS 4 + [shadcn/ui](https://ui.shadcn.com/) (Radix primitives)
- [CodeMirror](https://codemirror.net/) — the DBML text editor
- `socket.io-client` — real-time sync with the backend
- React Router, `react-resizable-panels`, Framer Motion

## Setup

### Prerequisites

- Node.js 22.x
- The [backend](https://github.com/myopaingthu/db-diagram-tool-bk) running locally or deployed

### Install & run

```bash
npm install
```

Create a `.env` file in the project root:

```bash
VITE_API_HOST=http://localhost:3000
VITE_WS_HOST=ws://localhost:3000
```

```bash
npm run dev
```

### Environment variables

| Variable | Description |
|---|---|
| `VITE_API_HOST` | Backend REST API base URL |
| `VITE_WS_HOST` | Backend WebSocket URL |

### Build

```bash
npm run build     # tsc -b && vite build, output in dist/
npm run preview   # preview the production build locally
```

## Deployment

Deployed on [Vercel](https://vercel.com) (`vercel.json` handles SPA routing). `VITE_API_HOST`/`VITE_WS_HOST` are set as Vercel project environment variables, pointed at the deployed backend's `https://`/`wss://` URL.
