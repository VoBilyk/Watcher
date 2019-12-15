import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-spinner-popup',
  templateUrl: './spinner-popup.component.html',
  styleUrls: ['./spinner-popup.component.sass']
})
export class SpinnerPopupComponent {
  @Input() header: string;
  @Input() display: boolean;
}
