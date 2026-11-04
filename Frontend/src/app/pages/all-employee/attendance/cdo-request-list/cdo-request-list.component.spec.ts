import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdoRequestListComponent } from './cdo-request-list.component';

describe('CdoRequestListComponent', () => {
  let component: CdoRequestListComponent;
  let fixture: ComponentFixture<CdoRequestListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CdoRequestListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CdoRequestListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
