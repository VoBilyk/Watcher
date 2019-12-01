import {Injectable} from '@angular/core';
import {HubConnection, HubConnectionBuilder, LogLevel} from '@microsoft/signalr';
import {environment} from '../../../environments/environment';
import {Subject} from 'rxjs';
import {AuthService} from '../services/auth.service';
import {CollectedData} from '../../shared/models/collected-data.model';
import {InstanceChecked} from '../../shared/models/instance-checked';

@Injectable()
export class DashboardsHub {
  private hubName = 'dashboards';
  private hubConnection: HubConnection;
  public connectionEstablished$ = new Subject<boolean>();
  public isConnect: boolean;

  public infoSubObservable = new Subject<CollectedData>(); // from(this.infoSub);
  public instanceCheckedSubObservable = new Subject<InstanceChecked>();

  constructor(private authService: AuthService) {
    this.startConnection();
  }

  private startConnection() {
    if (this.isConnect || !this.authService.getCurrentUserLS()) {
      return;
    }

    this.authService.getTokens().subscribe(([firebaseToken, watcherToken]) => {
      this.buildConnection(firebaseToken, watcherToken);
      console.log('Dashboards Hub trying to connect');
      this.hubConnection
        .start()
        .then(() => {
          console.log('Dashboards Hub connected');
          this.isConnect = true;
          this.connectionEstablished$.next(true);
          this.registerOnEvents();
        })
        .catch(() => console.log('Error while establishing connection (Dashboards Hub)'));
    });
  }

  private buildConnection(firebaseToken: string, watcherToken: string) {
    const connPath = `${environment.server_url}/${this.hubName}?Authorization=${firebaseToken}&WatcherAuthorization=${watcherToken}`;

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(connPath)
      .configureLogging(LogLevel.None)
      .build();
  }

  private registerOnEvents() {
    this.hubConnection.on('InstanceDataTick', (info: CollectedData) => {
        info.time = new Date(info.time);
        this.infoSubObservable.next(info);
      });

    this.hubConnection.on('InstanceStatusCheck', (info: InstanceChecked) => {
      info.statusCheckedAt = new Date(info.statusCheckedAt);
      this.instanceCheckedSubObservable.next(info);
    });

    // On Close open connection again
    this.hubConnection.onclose((error: Error) => {
      this.isConnect = false;
      this.connectionEstablished$.next(false);
      console.log('Dashboard Hub connection closed');
      console.error(error);
      this.startConnection();
    });
  }

  subscribeToInstanceById(instanceGuidId: string): void {
    if (this.hubConnection) {
      this.hubConnection.invoke('SubscribeToInstanceById', instanceGuidId)
        .catch(err => console.error(err));
    }
  }

  subscribeToOrganizationById(id: number): void {
    if (this.hubConnection) {
      this.hubConnection.invoke('SubscribeToOrganizationById', id)
        .catch(err => console.error(err));
    }
  }

  unSubscribeFromInstanceById(instanceGuidId: string): void {
    if (this.hubConnection) {
      this.hubConnection.invoke('UnSubscribeFromInstanceById', instanceGuidId)
        .catch(err => console.error(err));
    }
  }

  unSubscribeFromOrganizationById(id: number): void {
    if (this.hubConnection) {
      this.hubConnection.invoke('UnSubscribeFromOrganizationById', id)
        .catch(err => console.error(err));
    }
  }

  send(userId: string, item: string): string {
    if (this.hubConnection) {
      this.hubConnection.invoke('Send', userId, item)
        .catch(err => console.error(err));
    }
    return item;
  }

  public disconnect() {
    this.connectionEstablished$ = new Subject<boolean>();
    this.infoSubObservable = new Subject<CollectedData>();
    this.instanceCheckedSubObservable = new Subject<InstanceChecked>();
  }
}
