import { Component, HostBinding, Input, ViewEncapsulation } from '@angular/core';
import { CustomData } from '../models';
import { DashboardChart } from '../../models/dashboard-chart';
import { ChartType } from '../../../shared/models/chart-type.enum';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.sass'],
  encapsulation: ViewEncapsulation.None
})
export class ChartComponent {
  @Input() chart: DashboardChart;
  @Input() data: CustomData[];
  type = ChartType;

  @Input() set activeEntries(value: CustomData[]) {
    this._activeEntries = value;
  }

  get activeEntries(): CustomData[] {
    return this.hasActiveEntries ? this._activeEntries : [];
  }

  private _activeEntries: CustomData[];

  @HostBinding('class.has-active-entries')
  get hasActiveEntries() {
    return this._activeEntries && this._activeEntries.length > 0;
  }
}
