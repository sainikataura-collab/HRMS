import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubProgramComponent } from './sub-program.component';

describe('SubProgramComponent', () => {
  let component: SubProgramComponent;
  let fixture: ComponentFixture<SubProgramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubProgramComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubProgramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
