import {ChangeDetectionStrategy, Component, EventEmitter, HostBinding, Input, OnInit, Output, ViewEncapsulation} from '@angular/core';
import * as SvgSaver from 'svgsaver';
import {CustomData} from '../models';
import {DashboardChart} from '../../models/dashboard-chart';
import { ChartType } from '../../../shared/models/chart-type.enum';

const EMPTY = [];

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.sass'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default
})
export class ChartComponent implements OnInit {
  @Output() select: EventEmitter<{ chart: DashboardChart, value?: any }> = new EventEmitter();

  @Input() chart: DashboardChart;
  @Input() data: CustomData[];
  @Input() showDownload = false;

  type = ChartType;
  svgSaver = new SvgSaver();

  @Input() set activeEntries(value: CustomData[]) {
    this._activeEntries = value;
  }

  get activeEntries(): CustomData[] {
    return this.hasActiveEntries ? this._activeEntries : EMPTY;
  }

  private _activeEntries: CustomData[];

  @HostBinding('class.has-active-entries')
  get hasActiveEntries() {
    return this._activeEntries && this._activeEntries.length > 0;
  }

  constructor() {
  }

  ngOnInit() {
  }
}
