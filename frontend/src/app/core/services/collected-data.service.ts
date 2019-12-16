import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {ApiService} from './api.service';
import {CollectedData} from '../../shared/models/collected-data.model';
import {CollectedDataType} from '../../shared/models/collected-data-type.enum';

@Injectable()
export class CollectedDataService {
  private readonly ctrlUrl = '/CollectedData';
  private builderCache$: Observable<CollectedData[]>;

  constructor(private apiService: ApiService) { }

  getBuilderData(): Observable<CollectedData[]> {
    if (!this.builderCache$) {
      this.builderCache$ = this.apiService.get(`${this.ctrlUrl}/Builder`) as Observable<CollectedData[]>;
    }

    return this.builderCache$;
  }

  public getCollectedDataByInstanceId(guidId: string, dataType: CollectedDataType): Observable<CollectedData[]> {
    return this.apiService.get(`${this.ctrlUrl}/Data/${guidId}?dataType=${dataType}`)
      .pipe(map(this.extractData));
  }

  private extractData(res: CollectedData[]): CollectedData[] {
    const data = res || [];
    data.forEach((d) => {
      d.time = new Date(d.time);
    });
    return data;
  }
}
