import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YearlyReturnsComponent } from './yearly-returns.component';

describe('YearlyReturnsComponent', () => {
  let component: YearlyReturnsComponent;
  let fixture: ComponentFixture<YearlyReturnsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YearlyReturnsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(YearlyReturnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
