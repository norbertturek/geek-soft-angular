---
name: angular-unit-tests
description: Write unit tests for Angular components, services, pipes, and directives using TestBed. Use when the user asks for tests, unit tests, spec file, or when adding coverage for new or modified code.
---

# Angular Unit Tests

## When to Use

- User asks to "add tests", "write unit tests", "create spec", or "add coverage"
- New component/service/pipe/directive was added and needs tests
- Bug fix or refactor should be verified with tests

## Tooling

This project uses Angular's unit-test builder (`@angular/build:unit-test`). Run tests with `npm run test` or `ng test`. Test files: `*.spec.ts` next to the source file.

## Component Testing

```typescript
import { TestBed } from '@angular/core/testing';
import { MyComponent } from './my.component';

describe('MyComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(MyComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(MyComponent);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Expected');
  });
});
```

## Service Testing

```typescript
import { TestBed } from '@angular/core/testing';
import { MyService } from './my.service';

describe('MyService', () => {
  let service: MyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
```

## Guidelines

- Use `TestBed.configureTestingModule` for components with dependencies
- For standalone components: `imports: [MyComponent]`
- Mock HTTP with `provideHttpClient()` + `HttpTestingController` when needed
- Use `fixture.detectChanges()` to trigger change detection
- Prefer `fixture.nativeElement as HTMLElement` for DOM queries
- Use `TestBed.inject()` for services, not constructor injection in tests

## Coverage

Aim for meaningful tests: behavior and edge cases over line-count. Test:
- Component creation and rendering
- User interactions and output emissions
- Service logic and error handling
- Pipe transformations
