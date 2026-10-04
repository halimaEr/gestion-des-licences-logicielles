import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatisticGestionaireComponent } from './statistic-gestionaire.component';

describe('StatisticGestionaireComponent', () => {
  let component: StatisticGestionaireComponent;
  let fixture: ComponentFixture<StatisticGestionaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatisticGestionaireComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(StatisticGestionaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
