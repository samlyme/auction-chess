# Testing Guide

This project uses **Bun's built-in test runner** for all tests - no additional dependencies required!

## Running Tests

```bash
# Run all tests across the entire project
bun test

# Run tests in watch mode (reruns on file changes)
bun test --watch

# Run tests in a specific package
cd shared && bun test
cd server && bun test
cd clients/web && bun test

# Run a specific test file
bun test shared/game/auctionChess.test.ts

# Run tests matching a pattern
bun test --test-name-pattern "makeBid"
```

## Test Coverage

### ✅ Implemented Tests (44 passing tests)

#### Game Logic (`shared/game/auctionChess.test.ts`)
- **20 tests** covering the core Auction Chess game mechanics:
  - `createGame()` - Initial game state validation
  - `makeBid()` - All bidding scenarios (validation, folding, balance management, phase transitions)
  - `movePiece()` - Chess move execution, phase transitions, broke player auto-fold
  - Helper functions (`getCurrentBidStack`, `getLastBid`)

#### Utilities (`shared/index.test.ts`)
- **8 tests** for Result type helpers:
  - `Ok()` and `Err()` constructors
  - `match()` pattern matching
  - Type safety verification

#### Lobby State Management (`server/state/lobbies.test.ts`)
- **16 tests** for in-memory lobby management:
  - Creating and deleting lobbies
  - Joining and leaving lobbies
  - Starting and ending games
  - Unique code generation
  - User-to-lobby mappings

#### Integration Tests (`server/routes/lobbies.test.ts`)
- **16 TODO tests** for API route testing
- Includes example setup for future implementation

### 🔜 Recommended Future Tests

1. **PseudoChess Engine** (`shared/game/pseudoChess.ts`)
   - Legal move generation
   - Castling and en passant
   - Pawn promotion
   - Check detection
   - FEN parsing/serialization

2. **API Middleware** (`server/middleware/`)
   - Auth middleware JWT validation
   - Lobby validation
   - Game validation
   - Profile validation

3. **Frontend Components**
   - Consider using React Testing Library if needed
   - Test critical UI flows (bidding, moving pieces)

4. **E2E Tests**
   - Full game flow (create lobby → join → bid → move → win)
   - Consider Playwright or similar

## Test Organization

Tests follow the convention of placing `.test.ts` files alongside the code they test:

```
shared/
  game/
    auctionChess.ts
    auctionChess.test.ts    ← Tests for auctionChess.ts
  index.ts
  index.test.ts             ← Tests for index.ts

server/
  state/
    lobbies.ts
    lobbies.test.ts         ← Tests for lobbies.ts
  routes/
    lobbies.ts
    lobbies.test.ts         ← Tests for lobbies.ts routes
```

## Writing Tests

Bun's test runner uses a familiar Jest-like API:

```typescript
import { describe, test, expect, beforeEach } from "bun:test";

describe("Feature name", () => {
  beforeEach(() => {
    // Setup before each test
  });

  test("should do something", () => {
    const result = someFunction();
    expect(result).toBe(expected);
  });

  test.todo("feature to implement later");
});
```

### Common Assertions

```typescript
expect(value).toBe(expected);              // Strict equality (===)
expect(value).toEqual(expected);           // Deep equality
expect(value).toBeTruthy();                // Truthy check
expect(value).toBeUndefined();             // Undefined check
expect(value).toMatch(/pattern/);          // Regex match
expect(value).toContain(item);             // Array/string contains
expect(() => fn()).toThrow();              // Function throws
```

## Integration Testing Challenges

Full API integration tests require mocking several components:

1. **Supabase Authentication** - JWT validation via JWKS
2. **Supabase Realtime** - Broadcast channels for lobby updates
3. **Environment Variables** - Supabase URL and keys

For now, we focus on **unit testing** the core logic (game state, lobby state) which provides excellent coverage of critical functionality without complex mocking.

## CI/CD Integration

Add to your CI pipeline:

```yaml
# Example GitHub Actions
- name: Run tests
  run: bun test

# With coverage (when needed)
- name: Run tests with coverage
  run: bun test --coverage
```

## Performance

Bun's test runner is **extremely fast**:
- Current test suite (44 tests): ~45ms
- No transpilation needed (native TypeScript support)
- Parallel test execution by default

## Tips

1. **Keep tests fast** - Avoid unnecessary I/O or network calls
2. **Test behavior, not implementation** - Tests should survive refactoring
3. **Use descriptive test names** - They serve as documentation
4. **Clean up state** - Use `beforeEach`/`afterEach` for test isolation
5. **Test edge cases** - Empty arrays, null values, boundary conditions
6. **Use `.todo()` for planned tests** - Document what still needs coverage
