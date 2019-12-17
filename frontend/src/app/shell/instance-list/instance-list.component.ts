import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { timer, Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MenuItem } from 'primeng/api';

import { InstanceService, ToastrService, AuthService, DataService, CollectedDataService, UserOrganizationService } from '../../core/services';
import { User } from '../../shared/models/user.model';
import { Instance } from '../../shared/models/instance.model';
import { DashboardsHub } from '../../core/hubs/dashboards.hub';
import { InstanceMenuItem } from '../models/instance-menu-item';


@Component({
  selector: 'app-instance-list',
  templateUrl: './instance-list.component.html',
  styleUrls: ['./instance-list.component.sass']
})
export class InstanceListComponent implements OnInit, OnDestroy {
  constructor(
    private instanceService: InstanceService,
    private collectedDataService: CollectedDataService,
    private dataService: DataService,
    private toastrService: ToastrService,
    private authService: AuthService,
    private dashboardsHub: DashboardsHub,
    private userOrganizationService: UserOrganizationService,
    private router: Router
  ) { }

  private destroyed$ = new Subject<void>();

  menuItems: InstanceMenuItem[];
  user: User;
  currentGuidId: string;
  showDownloadModal: boolean;
  popupMessage: string;
  isLoading: boolean;
  isDeleting: boolean;
  isManager: boolean;
  currentQuery = '';

  ngOnInit() {
    if (!this.router.url.match(/user\/instances/)) {
      return;
    }

    this.user = this.authService.getCurrentUserLS();

    this.collectedDataService.getBuilderData()
      .subscribe(value => this.dataService.fakeCollectedData = value);

    this.configureInstances(this.user.lastPickedOrganizationId);

    this.dashboardsHub.connectionEstablished$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(established => {
        if (established) {
          this.dashboardsHub.subscribeToOrganizationById(this.user.lastPickedOrganizationId);
        }
      });

    this.instanceService.instanceAdded
      .pipe(takeUntil(this.destroyed$))
      .subscribe(instance => this.onInstanceAdded(instance));

    this.instanceService.instanceEdited
      .pipe(takeUntil(this.destroyed$))
      .subscribe(instance => this.onInstanceEdited(instance));

    this.dashboardsHub.instanceStatusCheck$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(value => {
        const instanceMenuItem = this.menuItems.find(value1 => value1.guidId === value.instanceGuidId);
        instanceMenuItem.statusCheckedAt = value.statusCheckedAt;
        this.instanceService.calculateStyle(instanceMenuItem);
      });
  }

  ngOnDestroy() {
    this.destroyed$.next(null);
    this.destroyed$.complete();
  }

  checkInstancesStatus() {
    if (this.menuItems && this.menuItems.length > 1) {
      this.menuItems.slice(1, this.menuItems.length).map(item => {
        this.instanceService.calculateStyle(item);
      });
    }
  }

  configureInstances(organizationId: number): void {
    this.menuItems = [{
      guidId: '',
      statusCheckedAt: new Date(),
      label: 'Create Instance',
      title: 'Create Instance',
      icon: 'pi pi-pw pi-plus',
      routerLink: ['instances/create'],
      visible: this.isManager
    }];

    this.isLoading = true;
    forkJoin([
      this.instanceService.getAllByOrganization(organizationId),
      this.userOrganizationService.getOrganizationRole()
    ])
    .subscribe(([instances, role]) => {
      if (role) {
        this.isManager = role.name === 'Manager';
      }

      if (instances) {
        const items = instances.map(inst => this.instanceToMenuItem(inst));
        this.menuItems = this.menuItems.concat(items);
        this.toastrService.success('Get instances from server');
      }
      this.isLoading = false;

      timer(1, 5000)
        .pipe(takeUntil(this.destroyed$))
        .subscribe(() => this.checkInstancesStatus());
    });
  }

  instanceToMenuItem(instance: Instance): InstanceMenuItem {
    const item: InstanceMenuItem = {
      guidId: instance.guidId,
      statusCheckedAt: instance.statusCheckedAt,
      id: instance.id.toString(),
      icon: 'fa fa-circle',
      label: instance.title,
      routerLink: [`/user/instances/${instance.id}/${instance.guidId}/dashboards`],
      command: () => {
        this.currentGuidId = instance.guidId;
        this.instanceService.instanceChecked.next(instance);
      },
      items: [{
        label: 'Edit',
        icon: 'fa fa-pencil',
        routerLink: [`/user/instances/${instance.id}/edit`],
        styleClass: 'instance-options',
        visible: this.isManager
      }, {
        label: 'Activities',
        icon: 'fa fa fa-history',
        routerLink: [`/user/instances/${instance.guidId}/activities`],
        styleClass: 'instance-options',
        command: () => this.highlightCurrent(item)
      }, {
        label: 'Download app',
        icon: 'fa fa-download',
        styleClass: 'instance-options',
        visible: this.isManager,
        command: () => {
          this.showDownloadModal = true;
          this.currentGuidId = instance.guidId;
          this.highlightCurrent(item);
        }
      }, {
        label: 'Report',
        icon: 'fa fa-stack-exchange',
        routerLink: [`/user/instances/${instance.id}/${instance.guidId}/report`],
        styleClass: 'instance-options',
        command: () => this.highlightCurrent(item)
      }, {
        label: 'Anomaly Report',
        icon: 'fa fa-bug',
        routerLink: [`/user/instances/${instance.id}/${instance.guidId}/anomaly-report`],
        styleClass: 'instance-options',
        command: () => this.highlightCurrent(item)
      }, {
        label: 'Delete',
        icon: 'fa fa-close',
        command: () => {
          const index = this.menuItems.findIndex(i => i === item);
          this.deleteInstance(instance.id, index);
          this.highlightCurrent(item);
          this.dataService.hourlyCollectedData = [];
        },
        styleClass: 'instance-options',
        visible: this.isManager
      }]
    };
    this.instanceService.calculateStyle(item);

    return item;
  }

  async deleteInstance(id: number, index: number) {
    if (await this.toastrService.confirm('You sure you want to delete this instance? ')) {
      this.isDeleting = true;
      this.popupMessage = 'Deleting instance';

      this.instanceService.delete(id).subscribe(() => {
        this.instanceService.instanceRemoved.next(id);
        this.toastrService.success('Deleted instance');
        this.menuItems.splice(index, 1);
        this.router.navigate([`instances`]);
        this.onSearchChange(this.currentQuery);

        this.isDeleting = false;
      });
    }
  }

  onInstanceAdded(instance: Instance): void {
    const item: InstanceMenuItem = this.instanceToMenuItem(instance);
    this.menuItems.push(item);
    this.onSearchChange(this.currentQuery);
    this.highlightCurrent(item);
  }

  onInstanceEdited(instance: Instance): void {
    const item: InstanceMenuItem = this.instanceToMenuItem(instance);
    const index: number = this.menuItems.findIndex(inst => inst.id === instance.id.toString());
    this.menuItems[index] = item;
    this.onSearchChange(this.currentQuery);
    this.highlightCurrent(item);
  }

  onSearchChange(searchQuery: string): void {
    this.currentQuery = searchQuery;
    this.menuItems = this.menuItems.map((instanceMenuItem: InstanceMenuItem) => {
      instanceMenuItem.visible = instanceMenuItem.label.toLowerCase().startsWith(searchQuery.toLowerCase());
      return instanceMenuItem;
    });

    // [0] element of menuItems is Create button
    this.menuItems[0].visible = this.isManager;
  }

  onClose(): void {
    this.showDownloadModal = false;
  }


  highlightCurrent(menuitem: MenuItem) {
    this.menuItems.forEach(i => i.expanded = false);
    menuitem.expanded = true;
  }
}
