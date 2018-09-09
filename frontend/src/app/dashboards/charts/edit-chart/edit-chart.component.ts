import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {SelectItem, SelectItemGroup} from 'primeng/api';
import {colorSets} from '@swimlane/ngx-charts/release/utils';

import {DataService} from '../../../core/services/data.service';
import {ChartService} from '../../../core/services/chart.service';
import {ToastrService} from '../../../core/services/toastr.service';

import {Chart} from '../../../shared/models/chart.model';
import {ChartRequest} from '../../../shared/requests/chart-request.model';
import {ChartType, chartTypeLabels} from '../../../shared/models/chart-type.enum';
import {DataProperty, dataPropertyLables} from '../../../shared/models/data-property.enum';

import {DashboardChart} from '../../models/dashboard-chart';


@Component({
  selector: 'app-edit-chart',
  templateUrl: './edit-chart.component.html',
  styleUrls: ['./edit-chart.component.sass']
})
export class EditChartComponent implements OnInit {
  @Output() editChart = new EventEmitter<DashboardChart>();
  @Output() closed = new EventEmitter();
  @Output() dashboardChartChange = new EventEmitter();

  visible: boolean;

  @Input() onDisplay: EventEmitter<boolean>;
  @Input() dashboardId: number;
  @Input() dashboardChart: DashboardChart;

  dropdownTypes: SelectItem[] = [];
  dropdownSources: SelectItem[];
  dropdownGroupSources: SelectItemGroup[];

  type = ChartType;
  colorSchemes = colorSets;

  historyTime: number;
  isPreviewAvailable: boolean;
  isTimeAvailable: boolean;
  isXAxisAvailable: boolean;
  isYAxisAvailable: boolean;

  get dialogTitle() {
    return (this.dashboardChart && this.dashboardChart.id) ? 'Edit chart' : 'Create chart';
  }

  get spinnerDisabled() {
    return this.dashboardChart && this.dashboardChart.showCommon;
  }

  get isValid(): boolean {
    return !!this.dashboardChart.dataSources.length;
  }

  constructor(private dataService: DataService,
              private chartService: ChartService,
              private toastrService: ToastrService) {
  }

  ngOnInit() {
    this.onDisplay.subscribe((isShow: boolean) => this.visible = isShow);
    this.dashboardChart.showCommon = false;

    // Fill dropdawn with sources
    Object.keys(ChartType).forEach(type => {
      const number = Number(type);
      if (!isNaN(number)) {
        this.dropdownTypes.push({label: chartTypeLabels[number], value: number });
      }
    });

    this.resetBuilderForm();
  }

  getMultiSelectNumber() {
    return this.dashboardChart.type === ChartType.Pie ? 1 : null;
  }

  updtateReviewAllowing() {
    this.isPreviewAvailable = this.dashboardChart.showCommon;
  }

  dropDownSelect(event) {
    this.dashboardChart.dataSources = [event.value];
    this.processData();
  }

  multiSelect(event) {
    if (event.value.length === 0) {
      this.dropdownSources.forEach(item => item.disabled = false);
      return;
    }

    switch (this.dashboardChart.type) {
      case ChartType.ResourcesTable:
        break;
      default:
        // Disabling another groups
        if (dataPropertyLables[event.itemValue].includes('%')) {
          this.dashboardChart.dataSources = this.dashboardChart.dataSources.filter(s => dataPropertyLables[s].includes('%'));
          this.dropdownSources.forEach(item => !item.label.includes('%') ? item.disabled = true : item.disabled = false);
        } else {
          this.dashboardChart.dataSources = this.dashboardChart.dataSources.filter(s => !dataPropertyLables[s].includes('%'));
          this.dropdownSources.forEach(item => item.label.includes('%') ? item.disabled = true : item.disabled = false);
        }
        break;
    }
    this.processData();
  }

  resetBuilderForm() {
    this.dashboardChart.dataSources = [];
    this.createSourceItems();
    this.updtateReviewAllowing();
    this.dropdownSources.forEach(item => item.disabled = false);

    switch (this.dashboardChart.type) {
      case ChartType.ResourcesTable:
        this.dashboardChart.showCommon = true; //TODO: change
        this.dashboardChart.dataSources = [
          DataProperty.name,
          DataProperty.pCpu,
          DataProperty.ramMBytes,
          DataProperty.pRam
        ];
        break;
      case ChartType.LineChart:
        this.isTimeAvailable = true;
        this.isXAxisAvailable = true;
        this.dashboardChart.xAxisLabel = 'Time';
        this.isYAxisAvailable = true;
        this.dashboardChart.yAxisLabel = 'Percentage %';
        break;
      case ChartType.BarVertical:
        this.isTimeAvailable = false;
        this.isXAxisAvailable = true;
        this.dashboardChart.xAxisLabel = 'Parameters';
        this.isYAxisAvailable = true;
        this.dashboardChart.yAxisLabel = 'Percentage %';
        break;
      case ChartType.Guage:
        this.isTimeAvailable = false;
        this.isYAxisAvailable = true;
        this.dashboardChart.yAxisLabel = 'Process';
        this.isXAxisAvailable = false;
        this.dashboardChart.xAxisLabel = '';
      break;
      default:
        this.isYAxisAvailable = false;
        this.isXAxisAvailable = false;
        break;
    }
  }

  createSourceItems() {
    switch (this.dashboardChart.type) {
      case ChartType.ResourcesTable: {
        this.dropdownSources = [
          {label: dataPropertyLables[DataProperty.name], value: DataProperty.name},
          {label: dataPropertyLables[DataProperty.pCpu], value: DataProperty.pCpu},
          {label: dataPropertyLables[DataProperty.pRam], value: DataProperty.pRam},
          {label: dataPropertyLables[DataProperty.ramMBytes], value: DataProperty.ramMBytes}
        ];
        return;
      }
      case ChartType.Pie:
        if (this.dashboardChart.showCommon) {
          this.dropdownGroupSources = [{
            label: 'Percentage',
            items: [
              { label: dataPropertyLables[DataProperty.cpuUsagePercentage], value: DataProperty.cpuUsagePercentage },
              { label: dataPropertyLables[DataProperty.ramUsagePercentage], value: DataProperty.ramUsagePercentage },
              { label: dataPropertyLables[DataProperty.localDiskUsagePercentage], value: DataProperty.localDiskUsagePercentage },
            ]
          }, {
            label: 'Memory',
            items: [
              { label: dataPropertyLables[DataProperty.usageRamMBytes], value: DataProperty.usageRamMBytes },
              { label: dataPropertyLables[DataProperty.localDiskUsageMBytes], value: DataProperty.localDiskUsageMBytes }
            ]
          }];
          return;
        }
    }

    // Default for all another types
    this.dropdownGroupSources = [{
      label: 'Percentage',
      items: [
        { label: dataPropertyLables[DataProperty.pCpu], value: DataProperty.pCpu },
        { label: dataPropertyLables[DataProperty.pRam], value: DataProperty.pRam },
      ]
    }, {
      label: 'Memory',
      items: [
        { label: dataPropertyLables[DataProperty.ramMBytes], value: DataProperty.ramMBytes }
      ]
    }];

    this.dropdownSources = [
      {label: dataPropertyLables[DataProperty.cpuUsagePercentage], value: DataProperty.cpuUsagePercentage},
      {label: dataPropertyLables[DataProperty.ramUsagePercentage], value: DataProperty.ramUsagePercentage},
      {label: dataPropertyLables[DataProperty.localDiskUsagePercentage], value: DataProperty.localDiskUsagePercentage},
      {label: dataPropertyLables[DataProperty.processesCount], value: DataProperty.processesCount},
      {label: dataPropertyLables[DataProperty.usageRamMBytes], value: DataProperty.usageRamMBytes},
      {label: dataPropertyLables[DataProperty.interruptsPerSeconds], value: DataProperty.interruptsPerSeconds},
      {label: dataPropertyLables[DataProperty.localDiskUsageMBytes], value: DataProperty.localDiskUsageMBytes}
    ];
  }

  processChartType() {
    this.resetBuilderForm();
    this.processData();
  }

  showPreview() {
    this.isPreviewAvailable = true;
    this.processData();
  }

  processData(): void {
    if (this.dashboardChart.type === ChartType.ResourcesTable) {
      this.dashboardChart.colectedData = this.dataService.fakeCollectedData[0];
      this.dashboardChart.data = [ {} ]; // If data undefine than it not appeared
      this.isPreviewAvailable = true;
      return;
    }

    this.isPreviewAvailable = this.dataService.fulfillChart(this.dataService.fakeCollectedData, this.dashboardChart);
  }

  closeDialog() {
    this.visible = false;
    this.closed.emit();
  }

  onEditChart() {
    const chartRequest = this.createChartRequest();
    if (!this.dashboardChart.id) {
      this.chartService.create(chartRequest).subscribe((val) => {
        this.handleSuccessfulCreate(val);
      }, (err) => {
        this.handleFailedEdit(err);
      });
    } else {
      this.chartService.update(chartRequest, this.dashboardChart.id).subscribe(() => {
        this.handleSuccessfulEdit(chartRequest, this.dashboardChart.id);
      }, (err) => {
        this.handleFailedEdit(err);
      });
    }
  }

  handleSuccessfulCreate(chart: Chart): void {
    const dashboardChart: DashboardChart = this.dataService.instantiateDashboardChart(chart);
    this.editChart.emit(dashboardChart);
    this.closeDialog();
  }

  handleSuccessfulEdit(request: ChartRequest, id: number): void {
    const dashboardChart: DashboardChart = this.dataService.instantiateDashboardChartFromRequest(request, id);
    this.editChart.emit(dashboardChart);
    this.closeDialog();
  }

  handleFailedEdit(error) {
    this.toastrService.error(`Error occurred status: ${error.message}`);
  }

  createChartRequest(): ChartRequest {
    return {
      showCommon: this.dashboardChart.showCommon,
      threshold: this.dashboardChart.threshold,
      mostLoaded: this.dashboardChart.mostLoaded,
      schemeType: this.dashboardChart.colorScheme.name,
      dashboardId: this.dashboardId,
      showLegend: this.dashboardChart.showLegend,
      legendTitle: this.dashboardChart.legendTitle,
      gradient: this.dashboardChart.gradient,
      showXAxis: this.dashboardChart.showXAxis,
      showYAxis: this.dashboardChart.showYAxis,
      showXAxisLabel: this.dashboardChart.showXAxisLabel,
      showYAxisLabel: this.dashboardChart.showYAxisLabel,
      yAxisLabel: this.dashboardChart.yAxisLabel,
      xAxisLabel: this.dashboardChart.xAxisLabel,
      autoScale: this.dashboardChart.autoScale,
      showGridLines: this.dashboardChart.showGridLines,
      rangeFillOpacity: this.dashboardChart.rangeFillOpacity,
      roundDomains: this.dashboardChart.roundDomains,
      isTooltipDisabled: this.dashboardChart.tooltipDisabled,
      isShowSeriesOnHover: this.dashboardChart.showSeriesOnHover,
      title: this.dashboardChart.title,
      type: this.dashboardChart.type,
      sources: this.dashboardChart.dataSources.join(),
      isLightTheme: this.dashboardChart.theme === 'light',
    };
  }
}
