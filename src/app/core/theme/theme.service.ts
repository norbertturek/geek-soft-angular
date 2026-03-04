import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  computed,
  effect,
  inject,
  Injectable,
  PLATFORM_ID,
  signal,
} from '@angular/core';

const STORAGE_KEY = 'geek-soft-theme';
export type ThemeMode = 'light' | 'dark' | 'system';

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  const media =
    typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-color-scheme: dark)')
      : null;
  return media?.matches ? 'dark' : 'light';
}

function getStoredTheme(): ThemeMode | null {
  if (typeof localStorage === 'undefined') return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  return null;
}

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly doc = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  readonly mode = signal<ThemeMode>(
    isPlatformBrowser(this.platformId) ? getStoredTheme() ?? 'system' : 'system'
  );

  readonly effective = computed<'light' | 'dark'>(() => {
    const m = this.mode();
    if (m === 'light') return 'light';
    if (m === 'dark') return 'dark';
    return isPlatformBrowser(this.platformId) ? getSystemTheme() : 'light';
  });

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      effect(() => {
        this.apply(this.effective());
      });
      const win = this.doc.defaultView;
      const media =
        win && typeof win.matchMedia === 'function'
          ? win.matchMedia('(prefers-color-scheme: dark)')
          : null;
      media?.addEventListener('change', () => {
        if (this.mode() === 'system') {
          this.apply(getSystemTheme());
        }
      });
    }
  }

  setMode(mode: ThemeMode): void {
    this.mode.set(mode);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(STORAGE_KEY, mode);
    }
  }

  toggle(): void {
    const current = this.effective();
    this.setMode(current === 'dark' ? 'light' : 'dark');
  }

  private apply(theme: 'light' | 'dark'): void {
    const html = this.doc.documentElement;
    if (theme === 'dark') {
      html.setAttribute('data-theme', 'dark');
    } else {
      html.removeAttribute('data-theme');
    }
  }
}
