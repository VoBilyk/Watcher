import { NgModule } from '@angular/core';

import { DashboardRoutingModule } from './dashboards-routing.module';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { SharedModule } from '../shared/shared.module';

import { DashboardComponent } from './dashboard/dashboard.component';
import { EditDashboardComponent } from './editDashboard/editDashboard.component';
import { ChartDashboardComponent } from './charts/chart-dashboard/chart-dashboard.component';
import { ChartComponent } from './charts/chart/chart.component';
import { EditInstanceComponent } from './edit-instance/edit-instance.component';
import { EditChartComponent } from './charts/edit-chart/edit-chart.component';
import { InstanceActivityComponent } from './instance-activity/instance-activity.component';
import { ReportComponent } from './report/report.component';
import { ResourceTableComponent } from './charts/resource-table/resource-table.component';
import { EditReportChartComponent } from './report/edit-report-chart/edit-report-chart.component';
import { AnomalyReportComponent } from './anomaly-report/anomaly-report.component';

@NgModule({
  imports: [
    SharedModule,
    NgxChartsModule,
    DashboardRoutingModule
  ],
  declarations: [
    DashboardComponent,
    EditDashboardComponent,
    EditInstanceComponent,

    ChartComponent,
    ChartDashboardComponent,
    EditChartComponent,
    EditChartComponent,
    ReportComponent,
    InstanceActivityComponent,
    ResourceTableComponent,
    EditReportChartComponent,
    AnomalyReportComponent
  ]
})
export class DashboardsModule {
}
