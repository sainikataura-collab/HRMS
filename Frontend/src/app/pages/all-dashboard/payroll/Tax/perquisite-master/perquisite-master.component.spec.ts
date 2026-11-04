import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerquisiteMasterComponent } from './perquisite-master.component';

describe('PerquisiteMasterComponent', () => {
  let component: PerquisiteMasterComponent;
  let fixture: ComponentFixture<PerquisiteMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerquisiteMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerquisiteMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
