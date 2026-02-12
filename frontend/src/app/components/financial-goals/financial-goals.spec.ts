import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancialGoals } from './financial-goals';

describe('FinancialGoals', () => {
  let component: FinancialGoals;
  let fixture: ComponentFixture<FinancialGoals>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinancialGoals]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinancialGoals);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
