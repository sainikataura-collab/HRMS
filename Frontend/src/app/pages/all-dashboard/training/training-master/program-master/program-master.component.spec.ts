import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramMasterComponent } from './program-master.component';

describe('ProgramMasterComponent', () => {
  let component: ProgramMasterComponent;
  let fixture: ComponentFixture<ProgramMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgramMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgramMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
