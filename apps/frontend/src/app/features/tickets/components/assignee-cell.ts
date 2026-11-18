import { Component, input } from '@angular/core';

@Component({
  selector: 'app-assignee-cell',
  templateUrl: './assignee-cell.html',
})
export class AssigneeCell {
  protected readonly assignee = input.required<string | null>();
}
