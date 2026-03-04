import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from '@app/app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([
          {
            path: '',
            loadComponent: () =>
              import('@app/features/home/home.page').then((m) => m.HomePage),
          },
        ]),
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render nav with Home and Orders links', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const links = compiled.querySelectorAll('nav a');
    expect(links.length).toBeGreaterThanOrEqual(2);
    const text = Array.from(links).map((a) => a.textContent?.trim());
    expect(text).toContain('Home');
    expect(text).toContain('Orders');
  });
});
