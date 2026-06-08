---
name: angular-conventions
description: Angular Standalone Components 通用開發慣例。TRIGGER when 使用者進行 Angular 開發、建立新元件、討論元件架構。提供元件結構、生命週期、依賴注入等通用模式。
---

# Angular Standalone Components Conventions

## Component Structure

```typescript
@Component({
  selector: 'app-feature-name',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, /* ... */],
  templateUrl: './feature-name.component.html',
  styleUrl: './feature-name.component.scss',
  providers: [/* component-level services */],
})
export class FeatureNameComponent implements OnInit, OnDestroy {
  // 1. Injected services
  // 2. Public properties
  // 3. Private properties
  // 4. Constructor
  // 5. Lifecycle hooks (alphabetical: ngOnDestroy, ngOnInit)
  // 6. Public methods
  // 7. Private methods
}
```

## Decorator Order

`selector` → `standalone` → `imports` → `templateUrl` → `styleUrl` → `providers`

## Dependency Injection

See [component-patterns.md](component-patterns.md) for Injector pattern and service injection.

## Key Conventions

- All components are **Standalone** — no NgModule
- Use `ReactiveFormsModule` for forms, not template-driven
- TypeScript strict mode — no `any` type
- 2-space indentation, max 120 characters per line
- camelCase for variables, PascalCase for classes, UPPER_SNAKE_CASE for constants
