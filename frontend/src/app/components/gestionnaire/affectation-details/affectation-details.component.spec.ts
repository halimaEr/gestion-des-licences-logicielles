import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AffectationDetailsComponent } from './affectation-details.component';

describe('AffectationDetailsComponent', () => {
  let component: AffectationDetailsComponent;
  let fixture: ComponentFixture<AffectationDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AffectationDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AffectationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
