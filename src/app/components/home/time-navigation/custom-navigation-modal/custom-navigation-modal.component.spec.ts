import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomNavigationModalComponent } from './custom-navigation-modal.component';

describe('CustomNavigationModalComponent', () => {
  let component: CustomNavigationModalComponent;
  let fixture: ComponentFixture<CustomNavigationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomNavigationModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomNavigationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
