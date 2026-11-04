import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerquisiteMasterListComponent } from './perquisite-master-list.component';

describe('PerquisiteMasterListComponent', () => {
  let component: PerquisiteMasterListComponent;
  let fixture: ComponentFixture<PerquisiteMasterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerquisiteMasterListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerquisiteMasterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
