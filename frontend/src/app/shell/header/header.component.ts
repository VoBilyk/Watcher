import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MenuItem } from 'primeng/api';
import { OverlayPanel } from 'primeng/overlaypanel';
import {
  PathService,
  AuthService,
  UserService,
  ToastrService,
  TokenService,
  OrganizationService,
  ThemeService
} from '../../core/services';

import { Organization } from '../../shared/models/organization.model';
import { User } from '../../shared/models/user.model';
import { DashboardsHub } from '../../core/hubs/dashboards.hub';
import { ChatHub } from 'src/app/core/hubs/chat.hub';
import { OrganizationInvitesHub } from '../../core/hubs/organization-invites.hub';
import { NotificationsHubService } from '../../core/hubs/notifications.hub';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.sass']
})
export class HeaderComponent implements OnInit {
  notificationCounter = 0;

  currentUser: User;
  currentOrganizationName: string;
  userSubscription: Subscription;
  private regexInstancesdUrl: RegExp = /\/user\/instances/;

  userItems: MenuItem[];
  adminItems: MenuItem[];
  cogItems: MenuItem[];
  orgItems: MenuItem[];
  displayAddNewOrganization: boolean;
  isChangingOrganization: boolean;
  popupMessage = 'Loading';

  constructor(
    private tokenService: TokenService,
    private userService: UserService,
    private toastrService: ToastrService,
    private organizationService: OrganizationService,
    private router: Router,
    private authService: AuthService,
    private pathService: PathService,
    private themeService: ThemeService,
    private chatHub: ChatHub,
    private dashboardsHub: DashboardsHub,
    private invitesHub: OrganizationInvitesHub,
    private notificationsHub: NotificationsHubService) { }

  onFeedback() {
    this.router.navigate(['/user/feedback']);
  }

  changeCounter(amount: number) {
    this.notificationCounter = amount;
  }

  logout(): void {
    this.userSubscription.unsubscribe();
    this.currentUser = null;
    this.themeService.setDefaultTheme();
    if (this.authService.isLoggedIn()) {
      this.authService.logout();
    }
    this.chatHub.disconnect();
    this.dashboardsHub.disconnect();
    this.notificationsHub.disconnect();
    this.invitesHub.disconnect();
  }

  openUserProfile(panel: OverlayPanel): void {
    this.router.navigate(['/user/settings/user-profile']);
    panel.hide();
  }

  ngOnInit() {
    this.adminItems = [{
      label: 'Organizations',
      icon: 'fa fa-fw fa-list',
      routerLink: ['/admin/organization-list']
    },
    {
      label: 'Users',
      icon: 'fa fa-fw fa-group',
      routerLink: ['/admin/user-list']
    }, {
      label: 'Feedbacks',
      icon: 'fa fa-fw fa-bullhorn',
      routerLink: ['/admin/feedback-list']
    }, {
      label: 'DataCollector',
      icon: 'fa fa-fw fa-download',
      routerLink: ['/admin/data-collector-apps']
    }];

    this.cogItems = [{
      label: 'Profile',
      icon: 'fa fa-fw fa-user',
      routerLink: ['/user/settings/user-profile'],
    },
    {
      label: 'Organization',
      icon: 'fa fa-fw fa-building',
      routerLink: ['/user/settings/organization-profile'],
    },
    {
      label: 'Members',
      icon: 'fa fa-fw fa-users',
      routerLink: [`/user/settings/organization-members`],
    },
    {
      label: 'Notifications',
      icon: 'fa fa-fw fa-send',
      routerLink: ['/user/settings/notification-settings'],
    }
    ];

    this.userSubscription = this.authService.currentUser.subscribe(
      userData => {
        this.currentUser = { ...userData };
        this.currentUser.photoURL = this.pathService.convertToUrl(this.currentUser.photoURL);
        this.fillOrganizations();
      }
    );
  }

  private fillOrganizations(): void {
    this.orgItems = new Array<MenuItem>();

    this.currentUser.organizations.forEach(element => {
      this.orgItems.push({
        label: element.name,
        id: element.id.toString(),
        icon: 'fa fa-fw fa-building',
        command: (onclick) => {
          this.changeLastPicOrganizations(element);
          if (this.isInstancesRoute()) {
            this.router.navigate(['/user/instances']);
          }
        },
        styleClass: (element.id === this.currentUser.lastPickedOrganizationId) ? 'selectedMenuItem' : '',
        disabled: (element.id === this.currentUser.lastPickedOrganizationId)
      });
    });
    this.orgItems.push({
      label: 'Add new',
      icon: 'fa fa-fw fa-plus',
      command: (onclick) => {
        this.addNewOrganization();
      },
    });
  }

  isInstancesRoute() {
    return !!this.router.url.match(this.regexInstancesdUrl);
  }

  isAdmin() {
    return this.currentUser && this.currentUser.role.name === 'Admin';
  }

  onDisplayChange(event: boolean) {
    this.displayAddNewOrganization = event;
  }

  addNewOrganization() {
    this.displayAddNewOrganization = true;
  }

  private changeLastPicOrganizations(item: Organization): void {
    this.popupMessage = 'Current organization is changing';
    this.isChangingOrganization = true;

    // update user in beckend
    this.userService.updateLastPickedOrganization(this.currentUser.id, item.id)
      .subscribe(value => {
        // update user in frontend
        const previousOrganizationId = this.currentUser.lastPickedOrganizationId;

        this.currentUser.lastPickedOrganizationId = item.id;
        this.currentUser.lastPickedOrganization = item;
        this.authService.updateCurrentUser(this.currentUser); // update user in localStorage

        this.organizationService.organizationChanged.emit({ from: previousOrganizationId, to: item.id });

        // notify user about changes
        this.toastrService.success(`Organization by default was updated. Current organization: "${item.name}"`);
        this.isChangingOrganization = false;
      },
        err => {
          this.toastrService.error('Organization by default was not updated.');
          this.isChangingOrganization = false;
        });
  }
}
