# Authentication Bypass Patterns

## SessionStorage Injection

For apps that store auth tokens in SessionStorage (no encryption):

```typescript
const MOCK_TOKEN_INFO = {
  empNo: 'TEST001',
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  expiration: 9999999999,
  accessFunctionList: ['Feature1', 'Feature2'],
  // Add project-specific fields as needed
};

test.beforeEach(async ({ page }) => {
  // Inject auth before page loads
  await page.addInitScript((tokenInfo) => {
    sessionStorage.setItem('AUTH_KEY', JSON.stringify(tokenInfo));
  }, MOCK_TOKEN_INFO);

  await page.goto('/target-route');
  await page.waitForLoadState('networkidle');
});
```

## LocalStorage Injection

```typescript
await page.addInitScript((token) => {
  localStorage.setItem('auth_token', token);
}, 'mock-jwt-token');
```

## Cookie-based Auth

```typescript
await page.context().addCookies([{
  name: 'session_id',
  value: 'mock-session-id',
  domain: 'localhost',
  path: '/',
}]);
```

## Route-based Auth Bypass

For apps with auth interceptors:

```typescript
// Intercept auth check API
await page.route('**/auth/verify', (route) =>
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ valid: true, user: { id: 'TEST001' } }),
  }),
);
```
