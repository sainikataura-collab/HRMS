import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterlistComponent } from './masterlist.component';

describe('MasterlistComponent', () => {
  let component: MasterlistComponent;
  let fixture: ComponentFixture<MasterlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MasterlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MasterlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
