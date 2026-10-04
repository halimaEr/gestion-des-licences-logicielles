import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EtatLicenceComponent } from './etat-licence.component';

describe('EtatLicenceComponent', () => {
  let component: EtatLicenceComponent;
  let fixture: ComponentFixture<EtatLicenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EtatLicenceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EtatLicenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
