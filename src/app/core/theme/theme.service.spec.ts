import { DOCUMENT } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;
  const calls = { setAttribute: null as [string, string] | null, removeAttribute: null as string | null };

  beforeEach(() => {
    calls.setAttribute = null;
    calls.removeAttribute = null;
    localStorage.clear();
    const doc = {
      documentElement: {
        setAttribute: (name: string, value: string) => { calls.setAttribute = [name, value]; },
        removeAttribute: (name: string) => { calls.removeAttribute = name; },
      },
      defaultView: null,
    } as unknown as Document;

    TestBed.configureTestingModule({
      providers: [
        ThemeService,
        { provide: DOCUMENT, useValue: doc },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    service = TestBed.inject(ThemeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set dark mode and apply data-theme', () => {
    service.setMode('dark');
    TestBed.flushEffects();

    expect(service.mode()).toBe('dark');
    expect(service.effective()).toBe('dark');
    expect(calls.setAttribute).toEqual(['data-theme', 'dark']);
  });

  it('should set light mode and remove data-theme', () => {
    service.setMode('light');
    TestBed.flushEffects();

    expect(service.mode()).toBe('light');
    expect(service.effective()).toBe('light');
    expect(calls.removeAttribute).toBe('data-theme');
  });

  it('should toggle from light to dark', () => {
    service.setMode('light');
    TestBed.flushEffects();
    calls.setAttribute = null;

    service.toggle();
    TestBed.flushEffects();

    expect(service.mode()).toBe('dark');
    expect(calls.setAttribute).toEqual(['data-theme', 'dark']);
  });

  it('should toggle from dark to light', () => {
    service.setMode('dark');
    TestBed.flushEffects();
    calls.removeAttribute = null;

    service.toggle();
    TestBed.flushEffects();

    expect(service.mode()).toBe('light');
    expect(calls.removeAttribute).toBe('data-theme');
  });
});
