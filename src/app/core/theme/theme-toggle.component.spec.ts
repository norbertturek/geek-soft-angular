import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ThemeService } from '@core/theme/theme.service';
import { ThemeToggleComponent } from '@core/theme/theme-toggle.component';

describe('ThemeToggleComponent', () => {
  let toggleCalled: boolean;

  beforeEach(async () => {
    toggleCalled = false;
    const fakeTheme: Partial<ThemeService> = {
      toggle: () => { toggleCalled = true; },
      effective: signal('light'),
    };

    await TestBed.configureTestingModule({
      imports: [ThemeToggleComponent],
      providers: [{ provide: ThemeService, useValue: fakeTheme }],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ThemeToggleComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should call theme.toggle() on button click', () => {
    const fixture = TestBed.createComponent(ThemeToggleComponent);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    button?.click();

    expect(toggleCalled).toBe(true);
  });

  it('should have aria-label for accessibility', () => {
    const fixture = TestBed.createComponent(ThemeToggleComponent);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    expect(button?.getAttribute('aria-label')).toBeTruthy();
  });
});
