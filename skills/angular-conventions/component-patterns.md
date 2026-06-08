# Angular Component Patterns

## Injector Pattern

For components with many dependencies, use the Injector pattern:

```typescript
export class MyComponent {
  private readonly fb: FormBuilder;
  private readonly router: Router;
  private readonly utils: UtilsService;

  constructor(injector: Injector) {
    this.fb = injector.get(FormBuilder);
    this.router = injector.get(Router);
    this.utils = injector.get(UtilsService);
  }
}
```

## Base Class Inheritance

When extending a base class:

```typescript
export class ChildComponent extends BaseComponent {
  constructor(
    injector: Injector,
    private myService: MyService, // child-specific services
  ) {
    super(injector);
  }

  // Abstract methods: no override keyword
  abstractMethod(): void { /* ... */ }

  // Overridable methods: require override keyword
  override optionalMethod(): void { /* ... */ }

  // Lifecycle hooks: require override keyword
  override ngOnInit(): void {
    super.ngOnInit();
    // ...
  }
}
```

## Override Rules

| Scenario | Needs `override`? |
|----------|------------------|
| Abstract property/method | No |
| Overridable protected method | Yes |
| Lifecycle hook (ngOnInit, etc.) | Yes |

## RxJS Patterns

```typescript
// Sequential dependent calls
this.route.params.pipe(
  concatMap(({ id }) => this.fetchData(id)),
  concatMap((data) => this.fetchRelated(data)),
).subscribe();

// Parallel independent calls
forkJoin([this.fetchA(), this.fetchB()]).subscribe(([a, b]) => {
  this.dataA = a;
  this.dataB = b;
});

// Switch to latest (search/typeahead)
this.searchInput.valueChanges.pipe(
  debounceTime(300),
  switchMap((term) => this.search(term)),
).subscribe();
```

## Session Cleanup

```typescript
ngOnDestroy(): void {
  // Clean up session data, subscriptions
  sessionStorage.removeItem('TEMP_DATA');
  this.destroy$.next();
  this.destroy$.complete();
}
```
