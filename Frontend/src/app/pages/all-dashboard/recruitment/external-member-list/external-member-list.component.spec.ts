import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternalMemberListComponent } from './external-member-list.component';

describe('ExternalMemberListComponent', () => {
  let component: ExternalMemberListComponent;
  let fixture: ComponentFixture<ExternalMemberListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExternalMemberListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExternalMemberListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
