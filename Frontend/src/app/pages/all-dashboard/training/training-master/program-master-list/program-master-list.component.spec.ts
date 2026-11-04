import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramMasterListComponent } from './program-master-list.component';

describe('ProgramMasterListComponent', () => {
  let component: ProgramMasterListComponent;
  let fixture: ComponentFixture<ProgramMasterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgramMasterListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgramMasterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
