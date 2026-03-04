import { TestBed } from '@angular/core/testing';
import { HomePage } from './home.page';

describe('HomePage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(HomePage);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render title in h1', async () => {
    const fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const h1 = compiled.querySelector('h1');
    expect(h1?.textContent).toContain('geek-soft-angular');
  });

  it('should render congratulations message', async () => {
    const fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Congratulations!');
  });

  it('should render doc links', async () => {
    const fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const links = compiled.querySelectorAll('a[href*="angular.dev"]');
    expect(links.length).toBeGreaterThanOrEqual(1);
  });
});
