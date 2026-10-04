import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemandeComponentt } from './demande.component';

describe('DemandeComponent', () => {
  let component: DemandeComponentt;
  let fixture: ComponentFixture<DemandeComponentt>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemandeComponentt]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DemandeComponentt);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
