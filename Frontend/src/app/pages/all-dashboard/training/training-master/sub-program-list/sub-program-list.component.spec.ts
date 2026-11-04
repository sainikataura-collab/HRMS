import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubProgramListComponent } from './sub-program-list.component';

describe('SubProgramListComponent', () => {
  let component: SubProgramListComponent;
  let fixture: ComponentFixture<SubProgramListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubProgramListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubProgramListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
