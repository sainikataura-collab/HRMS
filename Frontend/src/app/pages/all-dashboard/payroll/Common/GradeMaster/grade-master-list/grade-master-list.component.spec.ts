import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GradeMasterListComponent } from './grade-master-list.component';

describe('GradeMasterListComponent', () => {
  let component: GradeMasterListComponent;
  let fixture: ComponentFixture<GradeMasterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GradeMasterListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GradeMasterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
