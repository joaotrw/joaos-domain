import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectTracker } from './project-tracker';

describe('ProjectTracker', () => {
  let component: ProjectTracker;
  let fixture: ComponentFixture<ProjectTracker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectTracker]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectTracker);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
