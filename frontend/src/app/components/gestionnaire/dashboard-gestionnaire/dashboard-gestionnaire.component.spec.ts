import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardGestionnaireComponent } from './dashboard-gestionnaire.component';

describe('DashboardResponsableComponent', () => {
  let component: DashboardGestionnaireComponent;
  let fixture: ComponentFixture<DashboardGestionnaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardGestionnaireComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardGestionnaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
