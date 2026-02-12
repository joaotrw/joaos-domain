import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CryptoHub } from './crypto-hub';

describe('CryptoHub', () => {
  let component: CryptoHub;
  let fixture: ComponentFixture<CryptoHub>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CryptoHub]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CryptoHub);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
