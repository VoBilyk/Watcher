import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable()
export class PathService {
  public convertToUrl(filePath: string): string {
    if (!filePath) {
      return '';
    }

    return filePath.slice(0, 7) === 'images/'
      ? `${environment.server_url}/${filePath}`
      : filePath;
  }
}
