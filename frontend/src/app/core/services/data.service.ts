import { Injectable } from '@angular/core';
import { colorSets } from '@swimlane/ngx-charts';

import { CustomData } from '../../dashboards/charts/models';
import { CollectedData, defaultCollectedData } from '../../shared/models/collected-data.model';
import { NumberSeriesItem, SeriesItem } from '../../dashboards/models/series-item';
import { MultiChartItem } from '../../dashboards/models/multi-chart-item';
import { DataProperty, dataPropertyLables } from '../../shared/models/data-property.enum';
import { ChartType } from '../../shared/models/chart-type.enum';
import { Chart } from '../../shared/models/chart.model';
import { DashboardChart } from '../../dashboards/models/dashboard-chart';
import { defaultOptions } from '../../dashboards/charts/models/chart-options';
import { ChartRequest } from '../../shared/requests/chart-request.model';

@Injectable()
export class DataService {
  // Collected data with interval of 10-15 seconds for last hour
  private _hourlyCollectedData: CollectedData[] = [];
  private _fakeCollectedData: CollectedData[] = [];

  set fakeCollectedData(data: CollectedData[]) {
    this._fakeCollectedData = data || [];
  }

  get fakeCollectedData(): CollectedData[] {
    return this._fakeCollectedData;
  }

  set hourlyCollectedData(data: CollectedData[]) {
    this._hourlyCollectedData = data || [];
  }

  get hourlyCollectedData(): CollectedData[] {
    return this._hourlyCollectedData;
  }

  getLastCollectedData(dataArr: CollectedData[]): CollectedData {
    return dataArr && dataArr.length
      ? dataArr[dataArr.length - 1]
      : defaultCollectedData;
  }

  fulfillChart(dataArr: CollectedData[], chart: DashboardChart, isFake = false): boolean {
    let chartData: CustomData[] = [];

    if (!chart.dataSources || chart.dataSources.length < 1) {
      chart.data = chartData;
      return false;
    }

    if (chart.showCommon) {
      switch (chart.type) {
        case ChartType.LineChart:
        case ChartType.BarHorizontal2D:
        case ChartType.BarHorizontalNormalized:
        case ChartType.BarHorizontalStacked:
        case ChartType.BarVertical2D:
        case ChartType.BarVerticalNormalized:
        case ChartType.BarVerticalStacked:
        case ChartType.PolarChart:
        case ChartType.AreaChart:
        case ChartType.AreaChartNormalized:
        case ChartType.AreaChartStacked:
        case ChartType.HeatMap:
          const filteredData = isFake ? dataArr : this.getDataByMinutes(dataArr, chart.historyTime);
          chartData = this.mapToMultiData(filteredData, chart.dataSources);
          break;
        case ChartType.Pie:
          chartData = this.mapToPieSeriesItem(this.getLastCollectedData(dataArr), this.getFirstSource(chart.dataSources));
          break;
        default:
          chartData = this.mapToSeriesItem(this.getLastCollectedData(dataArr), chart.dataSources);
          break;
      }
    } else {
      switch (chart.type) {
        case ChartType.LineChart:
        case ChartType.BarHorizontal2D:
        case ChartType.BarHorizontalNormalized:
        case ChartType.BarHorizontalStacked:
        case ChartType.BarVertical2D:
        case ChartType.BarVerticalNormalized:
        case ChartType.BarVerticalStacked:
        case ChartType.PolarChart:
        case ChartType.AreaChart:
        case ChartType.AreaChartNormalized:
        case ChartType.AreaChartStacked:
        case ChartType.HeatMap:
          let filteredData: CollectedData[] = [];
          if (isFake) {
            filteredData = dataArr;
          } else {
            filteredData = this.getDataByMinutes(dataArr, chart.historyTime);
          }
          chartData = this.mapToProcessMultiData(filteredData, this.getFirstSource(chart.dataSources), chart.mostLoaded);
          break;
        case ChartType.Pie:
          chartData = this.mapToProcessesSeriesItem(this.getLastCollectedData(dataArr),
            this.getFirstSource(chart.dataSources), chart.mostLoaded);
          break;
        default:
          chartData = this.mapToProcessesSeriesItem(this.getLastCollectedData(dataArr),
            this.getFirstSource(chart.dataSources), chart.mostLoaded);
          break;
      }
    }

    chart.data = chartData || [];

    return true;
  }

  mapToMultiData(dataArr: CollectedData[], properties: DataProperty[]): MultiChartItem[] {
    return properties.map(prop => ({
      name: dataPropertyLables[prop],
      series: dataArr.map(data => this.mapToLineChartSeriesItem(data, prop))
    }));
  }


  mapToProcessMultiData(dataArr: CollectedData[], property: DataProperty, processesAmount: number = 1) {
    const items: MultiChartItem[] = [];
    const stringProperty = DataProperty[property];
    const latestData = this.getLastCollectedData(dataArr);
    latestData.processes.sort((a, b) => b[stringProperty] - a[stringProperty]); // sort by descending
    for (let i = 0; i < Math.min(processesAmount, latestData.processes.length); i++) {
      const pName = latestData.processes[i].name;
      const item: MultiChartItem = { name: pName, series: [] };
      item.series = dataArr.map(d => this.mapToProcessesLineChartSeriesItem(d, pName, stringProperty));
      items.push(item);
    }

    return items;
  }

  getDataByMinutes(dataArr: CollectedData[], minutes: number = 5) {
    const minutesAgo = new Date(Date.now() - minutes * 60000);
    return dataArr.filter(value => value.time > minutesAgo);
  }

  mapToProcessesSeriesItem(data: CollectedData, property: DataProperty, processesAmount: number = 1): NumberSeriesItem[] {
    const stringProperty = DataProperty[property];
    const items: NumberSeriesItem[] = data.processes
      .sort((a, b) => b[stringProperty] - a[stringProperty])
      .map(proc => ({
        name: proc.name,
        value: proc[stringProperty]
      }));

    const free = data.processes.reduce((freeSpace, process) => freeSpace - process[stringProperty], 100);
    const othersSum = data.processes
      .slice(0, processesAmount - 1)
      .reduce((sum, process) => sum + process[stringProperty], 0);

    return items.concat([{
      name: 'Others',
      value: othersSum
    }, {
      name: 'Free',
      value: free < 0 ? 0 : free
    }]);
  }

  mapToSeriesItem(data: CollectedData, properties: DataProperty[]): NumberSeriesItem[] {
    return properties.map(prop => ({
      name: dataPropertyLables[prop],
      value: data[DataProperty[prop]]
    }));
  }

  mapToProcessesLineChartSeriesItem(data: CollectedData, processName: string, property: string): SeriesItem {
    const process = data.processes.find(value => value.name === processName);

    return {
      value: process ? process[property] : 0,
      name: new Date(data.time)
    };
  }

  // PIE
  mapToPieSeriesItem(data: CollectedData, prop: DataProperty): NumberSeriesItem[] {
    const propStr = DataProperty[prop];
    const items = [{
      name: dataPropertyLables[prop],
      value: data[propStr]
    }];

    let itemName = '';
    let itemValue = 0;
    switch (prop) {
      case DataProperty.cpuUsagePercentage:
      case DataProperty.ramUsagePercentage:
      case DataProperty.localDiskUsagePercentage:
        itemName = 'Available';
        itemValue = 100;
        break;
      case DataProperty.usageRamMBytes:
        itemName = 'Free Ram MegaBytes';
        itemValue = data[DataProperty[DataProperty.totalRamMBytes]];
        break;
      case DataProperty.localDiskUsageMBytes:
        itemName = 'Free Local Disc MegaBytes';
        itemValue = data[DataProperty[DataProperty.localDiskTotalMBytes]];
        break;
      default:
    }

    items.push({
      name: itemName,
      value: itemValue - data[propStr]
    });

    return items;
  }

  instantiateDashboardChart(value: Chart): DashboardChart {
    const dataProps = this.convertStringToArrEnum(value.sources);
    const dashChart: DashboardChart = {
      view: [600, 300],
      id: value.id,
      showCommon: value.showCommon,
      threshold: value.threshold,
      mostLoaded: value.mostLoaded,
      historyTime: value.historyTime,
      colorScheme: { ...colorSets.find(s => s.name === value.schemeType) },
      schemeType: defaultOptions.schemeType,
      showLegend: value.showLegend,
      legendTitle: value.legendTitle,
      gradient: value.gradient,
      showXAxis: value.showXAxis,
      showYAxis: value.showYAxis,
      showXAxisLabel: value.showXAxisLabel,
      showYAxisLabel: value.showYAxisLabel,
      yAxisLabel: value.yAxisLabel,
      xAxisLabel: value.xAxisLabel,
      yScaleMin: defaultOptions.yScaleMin,
      yScaleMax: defaultOptions.yScaleMax,
      autoScale: value.autoScale,
      showGridLines: value.showGridLines,
      rangeFillOpacity: value.rangeFillOpacity,
      roundDomains: value.roundDomains,
      tooltipDisabled: value.isTooltipDisabled,
      showSeriesOnHover: value.isShowSeriesOnHover,
      curve: defaultOptions.curve,
      curveClosed: defaultOptions.curveClosed,
      title: value.title,
      dataSources: dataProps,
      data: [],
      activeEntries: [],
      colectedData: {} as CollectedData,
      type: value.type,
      theme: value.isLightTheme ? 'light' : 'dark',
      isIncluded: false,
      dateTickFormatting: null
    };

    this.fulfillChart(this._hourlyCollectedData, dashChart);
    return dashChart;
  }

  instantiateDashboardChartFromRequest(value: ChartRequest, chartId: number): DashboardChart {
    const chart: Chart = {
      id: chartId,
      ...value,
      scheme: { ...colorSets.find(s => s.name === value.schemeType) }
    };

    return this.instantiateDashboardChart(chart);
  }

  mapToLineChartSeriesItem(data: CollectedData, property: DataProperty): SeriesItem {
    return {
      value: data[DataProperty[property]],
      name: new Date(data.time)
    };
  }

  getFirstSource(sources: DataProperty[]): DataProperty {
    return sources && sources.length > 0
      ? sources[0]
      : DataProperty.id;
  }

  pushLatestCollectedData(latestData: CollectedData) {
    // Filter all data that younger than 1 hour and push there this data
    const hourAgo = new Date(Date.now() - 60 * 60000);
    this._hourlyCollectedData = [...this._hourlyCollectedData.filter(value => value.time > hourAgo), latestData];
  }

  convertStringToArrEnum(sources: string): DataProperty[] {
    return sources.split(',').map(num => +num);
  }
}
