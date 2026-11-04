import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ITProcessComponent } from './itprocess.component';

describe('ITProcessComponent', () => {
  let component: ITProcessComponent;
  let fixture: ComponentFixture<ITProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ITProcessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ITProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
