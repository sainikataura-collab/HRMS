import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZoneMasterListComponent } from './zone-master-list.component';

describe('ZoneMasterListComponent', () => {
  let component: ZoneMasterListComponent;
  let fixture: ComponentFixture<ZoneMasterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZoneMasterListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ZoneMasterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
