import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../shared/models/user.model';
import { ApiService } from './api.service';
import { UserDto } from '../../shared/models/user-dto.model';

@Injectable()
export class UserService {
  private readonly ctrlUrl = 'Users';

  constructor(private apiService: ApiService) { }

  public update(id: string, user: UserDto): Observable<Object> {
    return this.apiService.put(`/${this.ctrlUrl}/UpdateProfile/${id}`, user);
  }

  public get(id: string): Observable<User> {
    return this.apiService.get(`/${this.ctrlUrl}/${id}`) as Observable<User>;
  }

  getRange(page: number, pageSize: number): Observable<User[]> {
    return this.apiService.get(`/${this.ctrlUrl}/table?page=${page}&pageSize=${pageSize}`);
  }

  getNumber(): Observable<number> {
    return this.apiService.get(`/${this.ctrlUrl}/number`);
  }

  public find(query: string): Observable<User[]> {
    return this.apiService.get(`/${this.ctrlUrl}/find/${query}`) as Observable<User[]>;
  }

  public getAll(): Observable<User[]> {
    return this.apiService.get(`/${this.ctrlUrl}`) as Observable<User[]>;
  }

  public updateLastPickedOrganization(userId: string, organizationId: number): Observable<object> {
    return this.apiService.put(`/${this.ctrlUrl}/UpdateLastPickedOrganization/${userId}/${organizationId}`);
  }
}
