# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
# Install dependencies
pnpm install

# Development (runs all apps in parallel)
pnpm dev

# Build all packages
pnpm build

# Type checking
pnpm typecheck

# Clean build artifacts
pnpm clean

# Testing
pnpm test           # Run all tests
pnpm test:coverage  # Run tests with coverage report

# Database commands (requires DATABASE_URL in .env)
pnpm db:generate    # Generate migrations from schema changes
pnpm db:push        # Push schema directly to DB (dev only)
pnpm db:migrate     # Run migrations
pnpm db:studio      # Open Drizzle Studio

# CDK commands (run from /infra)
cd infra
pnpm cdk bootstrap  # First-time AWS account setup
pnpm cdk synth      # Synthesize CloudFormation
pnpm cdk deploy     # Deploy to AWS
pnpm cdk diff       # Show pending changes
```

## Architecture

This is a **Lambdalith** monorepo using pnpm workspaces + Turborepo.

### Workspace Structure

```
ts-serverless-starter/
├── apps/
│   ├── api/          # Hono Lambdalith API
│   └── web/          # Next.js 16 frontend (App Router, Turbopack)
├── packages/
│   ├── db/           # Drizzle ORM + Neon
│   ├── core/         # Shared utilities
│   ├── testing/      # Shared test utilities (Vitest, Testing Library)
│   └── tsconfig/     # Shared TS configs
└── infra/            # AWS CDK
```

### Package Dependencies

```
@repo/api  →  @repo/core, @repo/db
@repo/web  →  @repo/core, @repo/db, @repo/api (proxied)
@repo/db   →  (standalone, includes Better Auth config)
@repo/core →  (standalone)
infra      →  (standalone, deploys @repo/web via OpenNext)
```

### Unified Deployment Architecture

Hono API runs inside Next.js API Routes for single-deployment simplicity:

```
Next.js (Lambda via OpenNext)
├── /api/auth/*              → Better Auth handler
├── /api/v1/*                → Hono API (proxied)
│   ├── /api/v1/health       → Health check
│   ├── /api/v1/users        → User CRUD
│   └── /api/v1/me           → Current user (protected)
└── /*                       → Next.js pages
```

Cookie-based auth works seamlessly since everything runs on the same origin.

## API Layer

### Structure

```
apps/api/src/
├── index.ts              # Main Hono app, middleware, error handler
├── lambda.ts             # AWS Lambda handler
├── local.ts              # Local dev server (PORT=3001)
├── routes/               # Route definitions
│   ├── health.ts
│   ├── users.ts
│   └── me.ts             # Current user (protected)
├── services/             # Business logic
│   └── user.service.ts
├── repositories/         # Data access
│   └── user.repository.ts
├── middleware/
│   └── auth.ts           # Auth middleware (authMiddleware, requireAuth)
└── lib/
    ├── db.ts             # DB connection singleton
    ├── errors.ts         # Custom errors (NotFoundError, etc.)
    └── openapi.ts        # OpenAPI spec for Scalar
```

### Layered Architecture

```
Route (Hono + Zod Validator)
  ↓
Service (business logic, error handling)
  ↓
Repository (DB operations)
  ↓
Database (Drizzle + Neon)
```

### Adding a New Endpoint

1. Define Zod schema in `apps/api/src/validators/`
2. Create repository in `apps/api/src/repositories/`
3. Create service in `apps/api/src/services/`
4. Add route in `apps/api/src/routes/`
5. Register route in `apps/api/src/index.ts`
6. Update OpenAPI spec in `apps/api/src/lib/openapi.ts`

### Validation

Uses `@hono/zod-validator` for request validation:

```typescript
import { zValidator } from "@hono/zod-validator";
import { userIdParamSchema } from "../validators";

route.get("/:id", zValidator("param", userIdParamSchema), async (c) => {
  const { id } = c.req.valid("param");
  // ...
});
```

### Error Handling

Custom errors in `lib/errors.ts`:
- `NotFoundError` → 404
- `ValidationError` → 400
- `ConflictError` → 409

Global error handler in `index.ts` catches and formats all errors.

### API Documentation

Scalar UI available at `/api/v1/docs` when running through Next.js proxy.
For standalone API development: `http://localhost:3001/api/docs`

## Database

### Neon (PostgreSQL)

- **Connection**: Neon HTTP driver (serverless-optimized, no connection pool needed)
- **Region**: Singapore (ap-southeast-1)

### Drizzle ORM

Schema location: `packages/db/src/schema/`

```typescript
// Define table
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  // ...
});

// Infer types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

### DB Operations

```typescript
import { eq, users, createDb } from "@repo/db";

const db = createDb(process.env.DATABASE_URL);

// Select
const user = await db.select().from(users).where(eq(users.id, id));

// Insert
const newUser = await db.insert(users).values(data).returning();

// Update
await db.update(users).set(data).where(eq(users.id, id));

// Delete
await db.delete(users).where(eq(users.id, id));
```

### Migration Workflow

```bash
# 1. Edit schema in packages/db/src/schema/

# 2. Generate migration
pnpm db:generate

# 3. Review generated SQL
cat packages/db/drizzle/XXXX_*.sql

# 4. Apply migration (production)
pnpm db:migrate

# 5. Commit migration files
git add packages/db/drizzle/
```

**Note**: `db:push` is for development only. Use `db:migrate` for production.

## Infrastructure (AWS CDK + OpenNext)

### Stack Overview

`infra/lib/nextjs-stack.ts` (uses `cdk-nextjs-standalone`):
- CloudFront Distribution
- Lambda functions (server, image optimization, revalidation, warmer)
- S3 bucket for static assets
- Secrets Manager integration for DATABASE_URL and BETTER_AUTH_SECRET

### OpenNext

[OpenNext](https://open-next.js.org/) converts Next.js build output for AWS Lambda deployment:

```bash
# Build Next.js for Lambda
cd apps/web
pnpm build:open-next    # Generates .open-next/ directory
```

### Deployment

```bash
# Prerequisites
# 1. AWS CLI configured
# 2. Create secrets in AWS Secrets Manager:
#    - ts-serverless-starter/database-url (DATABASE_URL value)
#    - ts-serverless-starter/auth-secret (BETTER_AUTH_SECRET value)

cd infra
pnpm cdk bootstrap   # First time only
pnpm cdk deploy
```

### After Deployment

Update environment variables with the deployed URL:
1. Get CloudFront domain from CDK output
2. Update `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` in secrets or redeploy

## Authentication (Better Auth)

### Overview

Authentication is handled by [Better Auth](https://www.better-auth.com/) with email/password support.

```
Next.js (Single Deployment)
     │
     ├─ /api/auth/* ─────────> Better Auth handler
     │                              │
     │                              ▼
     │                          Neon DB (sessions)
     │                              │
     │                        Cookie (Session)
     │                              │
     └─ /api/v1/* ───────────> Hono API (proxied)
                                    │
                               Auth Middleware
                                    │
                               c.get("user")
```

With the unified deployment, auth cookies work seamlessly across all routes.

### Auth Tables

Schema in `packages/db/src/schema/auth.ts`:
- `user` - User accounts
- `session` - Active sessions
- `account` - OAuth accounts & passwords
- `verification` - Email verification tokens

### Frontend Auth Client

```typescript
// apps/web/src/lib/auth-client.ts
import { signIn, signUp, signOut, useSession } from "@/lib/auth-client";

// Sign up
await signUp.email({ email, password, name });

// Sign in
await signIn.email({ email, password });

// Sign out
await signOut();

// Get session (React hook)
const { data: session, isPending } = useSession();
```

### API Route Convention

| Path | Auth | Description |
|------|------|-------------|
| `/api/me/*` | **Required** | Current user's resources |
| `/api/*` (others) | Optional | Public endpoints |

```typescript
// index.ts
// ===== Public Routes =====
app.route("/api/health", healthRoutes)
app.route("/api/users", userRoutes)

// ===== Protected Routes (/api/me/*) =====
app.use("/api/me/*", requireAuth)  // Applied to entire group
app.route("/api/me", meRoutes)
```

```typescript
// routes/me.ts - No need for requireAuth (auto-applied)
meRoutes.get("/", (c) => {
  const user = c.get("user")!  // Guaranteed to exist
  return c.json({ user })
})

// routes/users.ts - Public, but can check auth
app.get("/", (c) => {
  const user = c.get("user")  // May be null
  return c.json({ users })
})
```

### Protected Pages (Next.js)

```typescript
// Server Component
import { getAuth } from "@repo/db/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const session = await getAuth().api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  return <div>Welcome, {session.user.name}!</div>;
}
```

### Environment Variables

```bash
# Required for Better Auth
BETTER_AUTH_SECRET=<random-32-char-string>
BETTER_AUTH_URL=http://localhost:3000

# For frontend
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Frontend (PandaCSS)

### Overview

Frontend uses [PandaCSS](https://panda-css.com/) for styling with a "Terminal Neon Aesthetic" theme.

### Setup

PandaCSS generates `styled-system/` directory (gitignored). It's auto-generated by:
- `pnpm install` (via `prepare` script)
- `pnpm dev`, `pnpm build`, `pnpm typecheck`, `pnpm lint`

### Usage

```typescript
import { css } from "../../styled-system/css";

<div className={css({
  background: "void",
  color: "neonCyan",
  fontFamily: "mono",
  _hover: {
    boxShadow: "0 0 20px rgba(0, 255, 255, 0.4)",
  },
})}>
  Content
</div>
```

### Design Tokens

```typescript
// panda.config.ts
colors: {
  void: "#0a0a0f",      // Background
  neonCyan: "#00ffff",  // Primary accent
  neonGreen: "#39ff14", // Secondary accent
}

fonts: {
  mono: "'JetBrains Mono', monospace",
  display: "'Space Grotesk', sans-serif",
}
```

### Global CSS Classes

Available in `globals.css`:
- `.grid-bg` - Grid pattern background
- `.gradient-text` - Cyan→Green→Purple gradient text
- `.glass-card` - Glassmorphism card effect

## Form Validation

### Stack

- `react-hook-form` - Form state management
- `zod` - Schema validation
- `@hookform/resolvers` - Zod integration

### Usage

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Zod v4 syntax (z.email() instead of z.string().email())
const schema = z.object({
  email: z.email({ error: "Invalid email" }),
  password: z.string().min(8, "Min 8 characters"),
});

type FormData = z.infer<typeof schema>;

function MyForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    // data is typed and validated
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("email")} />
      {errors.email && <span>{errors.email.message}</span>}
      <button disabled={isSubmitting}>Submit</button>
    </form>
  );
}
```

### Zod v4 Note

Use new Zod v4 syntax for emails:
```typescript
// Old (deprecated)
z.string().email("Invalid email")

// New (Zod v4)
z.email({ error: "Invalid email" })
```

## Key Patterns

### Imports

```typescript
// Monorepo packages
import { createDb, users, eq } from "@repo/db";
import { formatDate } from "@repo/core";

// Zod validators (in apps/api)
import { userIdParamSchema, createUserSchema } from "../validators";

// Auth
import { auth, getAuth } from "@repo/db/auth";
```

### TypeScript

- Extend from `@repo/tsconfig/node.json` or `@repo/tsconfig/nextjs.json`
- All packages use ESM (`"type": "module"`)

### Environment Variables

Required in `.env`:
```
DATABASE_URL=postgresql://...@....neon.tech/neondb?sslmode=require
BETTER_AUTH_SECRET=<random-32-char-string>
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For AWS deployment, store in Secrets Manager.

## Testing (Vitest + Testing Library)

### Overview

Testing infrastructure uses Vitest with monorepo workspace configuration and Testing Library for React components.

### Structure

```
vitest.workspace.ts           # Monorepo workspace config
packages/testing/             # Shared test utilities
├── src/
│   ├── index.ts              # Common utilities (createSpy, sleep, etc.)
│   ├── hono.ts               # Hono API test helpers
│   └── react.tsx             # React Testing Library wrappers
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode (per package)
cd apps/api && pnpm test:watch
```

### Writing API Tests

```typescript
import { describe, it, expect, beforeEach } from "vitest"
import { Hono } from "hono"
import { healthRoutes } from "./routes/health"

describe("health routes", () => {
    let app: Hono

    beforeEach(() => {
        app = new Hono()
        app.route("/api/health", healthRoutes)
    })

    it("returns status ok", async () => {
        const res = await app.request("/api/health")

        expect(res.status).toBe(200)

        const json = await res.json()
        expect(json.status).toBe("ok")
    })
})
```

### Writing React Component Tests

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { MyComponent } from "./my-component"

// Mock dependencies
vi.mock("next/link", () => ({
    default: ({ children, href }: { children: React.ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    ),
}))

describe("MyComponent", () => {
    it("renders correctly", () => {
        render(<MyComponent />)
        expect(screen.getByText("Hello")).toBeInTheDocument()
    })
})
```

### Test File Locations

| Package | Test Location | Pattern |
|---------|--------------|---------|
| `apps/api` | `src/**/*.test.ts` | Unit tests for routes, services |
| `apps/web` | `src/**/__tests__/*.test.tsx` | Component tests |
| `packages/core` | `src/**/*.test.ts` | Utility function tests |
| `packages/testing` | `src/**/*.test.ts` | Self-tests for utilities |

### Using @repo/testing

```typescript
// Import test utilities
import { createSpy, sleep, createMockDate } from "@repo/testing"

// Hono helpers
import { createTestClient, expectJsonResponse } from "@repo/testing/hono"

// React helpers (includes cleanup)
import { renderWithProviders, userEvent } from "@repo/testing/react"
```

### Notes

- API tests avoid importing the full app with auth middleware (requires DATABASE_URL)
- Use `vi.mock()` to mock external dependencies (next/link, auth-client, etc.)
- PandaCSS `css` function should be mocked in component tests

## CI/CD (GitHub Actions)

### Workflows

| Workflow | File | Trigger | Description |
|----------|------|---------|-------------|
| CI | `.github/workflows/ci.yml` | Push/PR to `main` | Lint, Format, Typecheck, Test |
| Deploy | `.github/workflows/deploy.yml` | Push to `main` | CI + CDK Deploy |

### Local Checks (same as CI)

```bash
pnpm lint           # Biome lint
pnpm format:check   # Biome format check
pnpm typecheck      # TypeScript check
pnpm test           # Run all tests
```

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `AWS_ROLE_ARN` | IAM Role ARN for OIDC authentication |

### AWS OIDC Setup

Deploy workflow uses OIDC authentication (no long-lived credentials):

1. Create IAM Identity Provider for `token.actions.githubusercontent.com`
2. Create IAM Role with trust policy for GitHub Actions
3. Set `AWS_ROLE_ARN` secret in GitHub repository

See README.md for detailed setup instructions.
