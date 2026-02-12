import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-project-tracker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project-tracker.component.html',
  styleUrls: ['./project-tracker.component.css']
})
export class ProjectTrackerComponent {
  // Data coming from the Boss (app.component)
  @Input() allProjects: any[] = [];
  @Input() userRole: string = '';
  @Input() allUsers: any[] = [];        // <--- Added
  @Input() serverMessage: string = '';  // <--- Added

  // Events to tell the Boss what to do
  @Output() addProjectEvent = new EventEmitter<{title: string, desc: string}>();
  @Output() deleteProjectEvent = new EventEmitter<string>();
  @Output() toggleStatusEvent = new EventEmitter<string>();
  @Output() addTaskEvent = new EventEmitter<{id: string, text: string}>();
  @Output() refreshEvent = new EventEmitter<void>(); // <--- Added
  @Output() checkServerEvent = new EventEmitter<void>(); // <--- Added

  selectedProject: any = null;

  selectProject(project: any) {
    this.selectedProject = project;
  }

  // Wrapper functions to handle emitting
  onAddProject(title: string, desc: string) {
    this.addProjectEvent.emit({ title, desc });
  }

  onDeleteProject(id: string) {
    this.deleteProjectEvent.emit(id);
  }

  onToggleStatus(id: string) {
    this.toggleStatusEvent.emit(id);
  }

  onAddTask(id: string, text: string) {
    this.addTaskEvent.emit({ id, text });
  }

  onRefresh() {
    this.refreshEvent.emit();
  }

  onCheckServer() {
    this.checkServerEvent.emit();
  }
}