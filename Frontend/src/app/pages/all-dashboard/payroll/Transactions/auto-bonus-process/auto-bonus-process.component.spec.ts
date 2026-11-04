import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoBonusProcessComponent } from './auto-bonus-process.component';

describe('AutoBonusProcessComponent', () => {
  let component: AutoBonusProcessComponent;
  let fixture: ComponentFixture<AutoBonusProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutoBonusProcessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AutoBonusProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
