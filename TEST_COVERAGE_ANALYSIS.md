# Test Coverage Analysis

This document analyzes the current test coverage and proposes areas for improvement.

## Current Coverage Summary

| Package | Statement Coverage | Files Tested | Files Untested |
|---------|-------------------|--------------|----------------|
| `@repo/api` | 72.97% | 3 files | 13 files |
| `@repo/core` | 45.45% | 1 file | 6 files |
| `@repo/testing` | 100% | 1 file | 0 files |
| `@repo/web` | 100% (1 component) | 1 file | 11+ files |

### Existing Tests

```
apps/api/src/
├── index.test.ts           # App-level tests (2 tests)
├── routes/
│   ├── health.test.ts      # Health endpoint (2 tests)
│   └── users.test.ts       # User CRUD endpoints (12 tests)

apps/web/src/components/__tests__/
└── auth-status.test.tsx    # Auth status component (9 tests)

packages/core/src/
└── index.test.ts           # Core utilities (5 tests)

packages/testing/src/
└── index.test.ts           # Testing utilities (5 tests)
```

---

## Priority 1: Critical Security & Auth Testing

### 1.1 Auth Middleware (`apps/api/src/middleware/auth.ts`)

**Why critical:** Security-critical code that handles authentication, authorization, and ban enforcement.

**Recommended tests:**

```typescript
// apps/api/src/middleware/auth.test.ts
describe("auth middleware", () => {
    describe("authMiddleware", () => {
        it("sets user and session when valid session exists")
        it("sets null user/session when no session exists")
    })

    describe("requireAuth", () => {
        it("returns 401 when user is not authenticated")
        it("returns 403 when user is banned")
        it("returns 403 with ban details when ban has reason and expiry")
        it("allows request when user is authenticated and not banned")
        it("allows request when ban has expired")
    })

    describe("requireRole", () => {
        it("returns 401 when not authenticated")
        it("returns 403 when user role does not match")
        it("returns 403 when user is banned")
        it("allows request when user has correct role")
    })

    describe("requirePermission", () => {
        it("returns 401 when not authenticated")
        it("returns 403 when user lacks permission")
        it("allows request when user has permission")
    })

    describe("requireDocsAccess", () => {
        it("returns 401 when not authenticated")
        it("returns 403 when email not in allowed list")
        it("allows all authenticated users when DOCS_ALLOWED_EMAILS is empty")
        it("allows users with email in allowed list (case insensitive)")
    })

    describe("isUserBanned helper", () => {
        it("returns false when user.banned is false")
        it("returns true when banned with no expiry")
        it("returns false when ban has expired")
        it("returns true when ban has not yet expired")
    })
})
```

**Estimated impact:** High - prevents auth bypass vulnerabilities

### 1.2 Custom Error Classes (`apps/api/src/lib/errors.ts`)

**Why critical:** Foundation for error handling throughout the API.

**Recommended tests:**

```typescript
// apps/api/src/lib/errors.test.ts
describe("error classes", () => {
    describe("AppError", () => {
        it("has correct default statusCode (500)")
        it("accepts custom statusCode")
        it("accepts custom code")
        it("sets name to 'AppError'")
    })

    describe("NotFoundError", () => {
        it("has statusCode 404")
        it("has code 'NOT_FOUND'")
        it("uses default message when none provided")
        it("uses custom message when provided")
    })

    describe("ValidationError", () => {
        it("has statusCode 400")
        it("has code 'VALIDATION_ERROR'")
    })

    describe("ConflictError", () => {
        it("has statusCode 409")
        it("has code 'CONFLICT'")
    })
})
```

**Estimated impact:** Medium - ensures consistent error responses

---

## Priority 2: Business Logic Testing

### 2.1 User Service (`apps/api/src/services/user.service.ts`)

**Why important:** Contains business rules and orchestrates data access.

**Recommended tests:**

```typescript
// apps/api/src/services/user.service.test.ts
describe("userService", () => {
    describe("getUserById", () => {
        it("returns user when found")
        it("throws NotFoundError when user does not exist")
    })

    describe("createUser", () => {
        it("creates user with valid data")
        it("throws ConflictError when email already exists")
    })

    describe("updateUser", () => {
        it("updates user when found")
        it("throws NotFoundError when user does not exist")
        it("throws ConflictError when changing to existing email")
        it("allows keeping the same email")
    })

    describe("deleteUser", () => {
        it("deletes user when found")
        it("throws NotFoundError when user does not exist")
    })

    describe("getUsers (paginated)", () => {
        it("passes pagination options to repository")
        it("returns paginated result with cursor")
    })
})
```

**Test approach:** Mock `userRepository` to isolate business logic from database.

### 2.2 User Repository (`apps/api/src/repositories/user.repository.ts`)

**Why important:** Complex cursor-based pagination logic that's error-prone.

**Recommended tests:**

```typescript
// apps/api/src/repositories/user.repository.test.ts
describe("userRepository", () => {
    describe("findPaginated", () => {
        it("returns correct items with limit")
        it("sets hasMore=true when more items exist")
        it("sets hasMore=false when no more items")
        it("generates correct nextCursor from last item")
        it("handles ascending sort order correctly")
        it("handles descending sort order correctly")
        it("applies search filter to name and email")
        it("applies emailVerified filter")
        it("handles date field cursors (createdAt, updatedAt)")
        it("handles string field cursors (id, email, name)")
        it("combines multiple conditions correctly")
    })

    describe("create", () => {
        it("generates valid UUID without hyphens")
        it("uses email prefix as default name when name not provided")
    })
})
```

**Test approach:** Use test database or mock Drizzle for unit tests.

---

## Priority 3: Frontend Component Testing

### 3.1 Auth Pages (`apps/web/src/app/(auth)/`)

**Why important:** User-facing auth flows are critical for security and UX.

**Recommended tests for each page:**

```typescript
// sign-in page
describe("SignInPage", () => {
    it("renders email and password fields")
    it("shows validation errors for invalid email")
    it("shows validation errors for short password")
    it("submits form with valid credentials")
    it("displays error message on failed login")
    it("redirects to dashboard on successful login")
    it("disables submit button while loading")
})

// sign-up page
describe("SignUpPage", () => {
    it("renders name, email, password, and confirm password fields")
    it("validates password confirmation matches")
    it("shows minimum password length error")
    it("redirects after successful registration")
})

// forgot-password page
describe("ForgotPasswordPage", () => {
    it("renders email input")
    it("shows success message after submission")
    it("handles API errors gracefully")
})

// reset-password page
describe("ResetPasswordPage", () => {
    it("extracts token from URL")
    it("validates password confirmation")
    it("shows error for invalid/expired token")
    it("redirects to sign-in on success")
})

// verify-email page
describe("VerifyEmailPage", () => {
    it("shows loading state while verifying")
    it("shows success message on valid token")
    it("shows error message on invalid token")
})
```

### 3.2 Email Verification Banner (`apps/web/src/components/email-verification-banner.tsx`)

```typescript
describe("EmailVerificationBanner", () => {
    it("shows banner when email is not verified")
    it("hides banner when email is verified")
    it("handles resend email click")
    it("shows loading state while resending")
    it("shows success message after resend")
    it("handles resend errors")
})
```

---

## Priority 4: Core Package Testing

### 4.1 Email Service (`packages/core/src/email.ts`)

**Currently at 7.69% coverage.**

```typescript
describe("sendEmail", () => {
    describe("development mode (no SES_FROM_EMAIL)", () => {
        it("logs email content instead of sending")
        it("includes all email fields in log")
    })

    describe("production mode (with SES_FROM_EMAIL)", () => {
        it("sends email via SES with correct parameters")
        it("logs success with message ID")
        it("logs error details on failure")
        it("re-throws error for caller to handle")
        it("includes HTML body when provided")
        it("uses correct AWS region")
    })
})
```

**Test approach:** Mock `SESClient` from AWS SDK.

### 4.2 Email Templates (`packages/core/src/email-templates.ts`)

**Currently at 0% coverage.**

```typescript
describe("email templates", () => {
    describe("verificationEmailTemplate", () => {
        it("includes verification URL in HTML and text")
        it("includes app name in subject and body")
        it("generates valid HTML")
    })

    describe("passwordResetEmailTemplate", () => {
        it("includes reset URL in HTML and text")
        it("includes expiry time warning")
    })
})
```

### 4.3 Logger (`packages/core/src/logger.ts`)

**Currently at 59.09% coverage.**

```typescript
describe("logger", () => {
    describe("createLogger", () => {
        it("creates logger with custom name")
        it("uses pino-pretty in development")
        it("uses JSON format in production")
        it("respects LOG_LEVEL environment variable")
    })

    describe("error serialization", () => {
        it("serializes Error objects correctly")
        it("handles non-Error objects")
    })
})
```

### 4.4 Auth Schemas (`packages/core/src/schemas/auth.ts`)

**Currently at 88.88% coverage** (line 65 uncovered).

```typescript
describe("auth schemas", () => {
    describe("passwordSchema", () => {
        it("rejects passwords shorter than MIN_PASSWORD_LENGTH")
        it("rejects passwords longer than MAX_PASSWORD_LENGTH")
        it("accepts valid passwords")
    })

    describe("signUpSchema", () => {
        it("requires email, password, name")
        it("validates email format")
    })

    describe("resetPasswordSchema", () => {
        it("requires password and confirmPassword")
        it("validates passwords match via refine")  // line 65
    })
})
```

---

## Priority 5: API Proxy & Infrastructure

### 5.1 Hono API Proxy (`apps/web/src/app/api/v1/[[...path]]/route.ts`)

```typescript
describe("API proxy", () => {
    it("rewrites /api/v1/* to /api/*")
    it("forwards all HTTP methods (GET, POST, PUT, DELETE, PATCH)")
    it("preserves request headers")
    it("preserves request body")
    it("uses lazy-loaded Hono app")
})
```

### 5.2 Protected Route (`apps/api/src/routes/me.ts`)

```typescript
describe("me routes", () => {
    it("returns current user profile")
    it("returns 401 when not authenticated")
})
```

---

## Testing Strategy Recommendations

### 1. Mock Strategy for Database Tests

Create shared mock factories in `packages/testing`:

```typescript
// packages/testing/src/mocks/user.ts
export function createMockUser(overrides?: Partial<AuthUser>): AuthUser {
    return {
        id: "test-user-id",
        email: "test@example.com",
        name: "Test User",
        role: "user",
        banned: false,
        banReason: null,
        banExpires: null,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    }
}
```

### 2. Integration Test Strategy

For the repository layer, consider:

1. **Option A:** Test against a real test database (Neon branch or local Postgres)
2. **Option B:** Mock Drizzle at the query level
3. **Option C:** Use an in-memory SQLite database with Drizzle

### 3. React Testing Library Patterns

For auth pages, create a wrapper that provides necessary context:

```typescript
// packages/testing/src/react.tsx
export function renderWithAuth(
    ui: React.ReactElement,
    options?: { session?: Session | null }
) {
    // Mock auth context/hooks
    return render(ui, { wrapper: AuthTestProvider })
}
```

### 4. Coverage Thresholds

Consider adding coverage thresholds to `vitest.config.ts`:

```typescript
coverage: {
    thresholds: {
        statements: 70,
        branches: 70,
        functions: 70,
        lines: 70,
    },
}
```

---

## Estimated Effort

| Priority | Area | Estimated Tests | Complexity |
|----------|------|-----------------|------------|
| P1 | Auth Middleware | ~20 tests | Medium |
| P1 | Error Classes | ~12 tests | Low |
| P2 | User Service | ~10 tests | Medium |
| P2 | User Repository | ~15 tests | High |
| P3 | Auth Pages (5) | ~30 tests | Medium |
| P3 | Email Banner | ~6 tests | Low |
| P4 | Email Service | ~8 tests | Medium |
| P4 | Email Templates | ~6 tests | Low |
| P4 | Logger | ~8 tests | Low |
| P4 | Auth Schemas | ~10 tests | Low |
| P5 | API Proxy | ~5 tests | Medium |
| P5 | Me Route | ~2 tests | Low |

**Total: ~130 new tests**

---

## Quick Wins (Highest ROI)

1. **Error classes** - Simple unit tests, high confidence gain
2. **Auth schemas** - Already at 88%, just need refinement tests
3. **Me route** - Simple protected endpoint test
4. **Email templates** - Pure functions, easy to test

## High Impact

1. **Auth middleware** - Security-critical, complex logic
2. **User service** - Business logic validation
3. **Sign-in/Sign-up pages** - User-facing auth flows
