import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LicenceFiltersComponent } from './licence-filters.component';

describe('LicenceFiltersComponent', () => {
  let component: LicenceFiltersComponent;
  let fixture: ComponentFixture<LicenceFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LicenceFiltersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LicenceFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
