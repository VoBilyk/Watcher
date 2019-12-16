import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CollectorLog } from '../../shared/models/collector-log.model';
import { CollectorLogService } from '../../core/services/collector-log.service';
import { CollectorLogLevel } from '../../shared/models/log-level.enum';

@Component({
  selector: 'app-instance-activity',
  templateUrl: './instance-activity.component.html',
  styleUrls: ['./instance-activity.component.sass']
})
export class InstanceActivityComponent implements OnInit {

  logs: CollectorLog[] = [];
  instanceId: string;

  constructor(
    private activateRoute: ActivatedRoute,
    private collectorLogService: CollectorLogService
  ) { }

  ngOnInit() {
    this.activateRoute.params.subscribe(params => {
      this.instanceId = params['insId'];
      console.log(this.instanceId);
      if (this.instanceId) {
        this.collectorLogService.getAllLogs(this.instanceId).subscribe((data: CollectorLog[]) => {
          if (data && data.length) {
            this.logs = data.map(log =>
              Object.assign({}, log, { logLevelName: CollectorLogLevel[log.logLevel] }));
          }
        });
      }
    });
  }

  getLogs() {
    if (this.instanceId) {
      this.collectorLogService.getAllLogs(this.instanceId).subscribe((data: CollectorLog[]) => {
        if (data) {
          this.logs = data.map(log =>
            Object.assign({}, log, { logLevelName: CollectorLogLevel[log.logLevel] }));
        }
      });
    }
  }
}
