import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuoteHistoryComponent } from './quote-history.component';

describe('QuoteHistoryComponent', () => {
  let component: QuoteHistoryComponent;
  let fixture: ComponentFixture<QuoteHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuoteHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuoteHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
