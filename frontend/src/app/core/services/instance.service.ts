import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { InstanceRequest } from '../../dashboards/models/instance-request.model';
import { Instance } from '../../shared/models/instance.model';
import { ApiService } from './api.service';
import { InstanceMenuItem } from '../../shell/models/instance-menu-item';

@Injectable()
export class InstanceService {
  private ctrlUrl = 'instances';
  public instanceAdded = new Subject<Instance>();
  public instanceEdited = new Subject<Instance>();
  public instanceRemoved = new Subject<number>();
  public instanceChecked = new Subject<Instance>();

  constructor(private apiService: ApiService) { }

  getOne(id: number): Observable<Instance> {
    return this.apiService.get(`/${this.ctrlUrl}/single/${id}`)
      .pipe(map(value => this.extractSingleData(value)));
  }

  getAllByOrganization(id: number): Observable<Instance[]> {
    return this.apiService.get(`/${this.ctrlUrl}/${id}`)
      .pipe(map(value => this.extractData(value)));
  }

  create(instance: InstanceRequest): Observable<Instance> {
    return this.apiService.post(`/${this.ctrlUrl}`, instance)
      .pipe(map(value => this.extractSingleData(value)));
  }

  update(instance: InstanceRequest, id: number): Observable<object> {
    return this.apiService.put(`/${this.ctrlUrl}/${id}`, instance);
  }

  delete(id: number): Observable<object> {
    return this.apiService.delete(`/${this.ctrlUrl}/${id}`);
  }

  private extractData(res: Instance[]): Instance[] {
    const data = res || [];
    data.forEach((d) => {
      d.statusCheckedAt = new Date(d.statusCheckedAt);
    });
    return data;
  }

  private extractSingleData(res: Instance): Instance {
    if (!res) {
      return null;
    }
    res.statusCheckedAt = new Date(res.statusCheckedAt);
    return res;
  }

  calculateStyle(item: InstanceMenuItem): void {
    const secondsDifference = (Date.now() - item.statusCheckedAt.getTime()) / 1000;
    if (secondsDifference <= 10) {
      item.styleClass = 'active-instance';
    } else if (secondsDifference > 10 && secondsDifference < 20) {
      item.styleClass = 'semi-active-instance';
    } else if (secondsDifference >= 20) {
      item.styleClass = 'non-active-instance';
    }
  }
}

