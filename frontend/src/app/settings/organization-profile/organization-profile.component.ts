import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { OrganizationService } from '../../core/services/organization.service';
import { ToastrService } from '../../core/services/toastr.service';
import { AuthService } from '../../core/services/auth.service';
import { Organization } from '../../shared/models/organization.model';
import { OrganizationInvitesService } from '../../core/services/organization-invites.service';
import { OrganizationInvite } from '../../shared/models/organization-invite.model';
import { OrganizationInviteState } from '../../shared/models/organization-invite-state.enum';
import { environment } from '../../../environments/environment';
import { ImageCropperComponent, CropperSettings } from 'ngx-img-cropper';
import { User } from '../../shared/models/user.model';
import { UserOrganizationService } from '../../core/services/user-organization.service';
import { SelectItem } from 'primeng/api';
import { Theme } from '../../shared/models/theme.model';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-organization-profile',
  templateUrl: './organization-profile.component.html',
  styleUrls: ['./organization-profile.component.sass']
})
export class OrganizationProfileComponent implements OnInit {

  constructor(
    private organizationService: OrganizationService,
    private organizationInvitesService: OrganizationInvitesService,
    private authService: AuthService,
    private userOrganizationService: UserOrganizationService,
    private toastrService: ToastrService,
    private themeService: ThemeService,
    private router: Router
  ) {
    this.cropperSettings = new CropperSettings({
      width: 400,
      height: 200,
      minWidth: 200,
      minHeight: 100,
      croppedWidth: 150,
      croppedHeight: 75,
      canvasWidth: 800,
      canvasHeight: 400,
      noFileInput: true,
      preserveSize: true
    });

    this.data = {};

    this.router.events.forEach((event) => {
      if (event instanceof NavigationStart) {
        this.currentThemeCheck();
      }
    });
  }

  editable: boolean;
  organization: Organization;
  name: string;

  inviteLink = '';
  inviteEmail: string;
  invite: OrganizationInvite;

  @ViewChild('cropper') cropper: ImageCropperComponent;
  cropperSettings: CropperSettings;
  display: boolean;
  imageUrl = '';
  imageType: string;
  data: any;
  themes: Theme[] = [];
  themeDropdown: SelectItem[] = [];
  selectedTheme: Theme;
  selectedThemeName: string;

  user: User;

  isUpdating: boolean;
  isInviting: boolean;
  isSending: boolean;

  ngOnInit() {
    if (this.themeDropdown.length === 0) {
      this.fillDropdown();
    }

    this.authService.currentUser.subscribe(user => {
      this.user = user;

      if (!this.user.lastPickedOrganization) {
        return;
      }

      this.organizationService.get(this.user.lastPickedOrganizationId).subscribe(async (org) => {
        this.organization = org;
        this.name = this.organization.name;
        this.selectedTheme = this.organization.theme;
        this.selectedThemeName = this.selectedTheme.name;
        this.imageUrl = org.imageURL;
        const role = await this.userOrganizationService.getOrganizationRole();
        this.editable = role.name === 'Manager' ? true : false;
      });
    });

    this.themeService.getAll().subscribe(
      (data) => {
        if (data.length > 0) {
          this.themes = data;
        }
      }
    );


  }

  onSubmit() {
    if (this.editable) {
      // Update Organization
      this.isUpdating = true;
      this.organization.name = this.name;
      this.organization.themeId = this.selectedTheme.id;
      this.organizationService.update(this.organization.id, this.organization).subscribe(
        value => {

          this.organization.theme = this.selectedTheme;

          // Update lastPickedOrganization in User on frontend
          this.user.lastPickedOrganization = this.organization;

          // TODO: Update Organization in User.organizations on frontend
          this.user.organizations = this.user.organizations.map(item => {
            return item.id === this.organization.id ? this.organization : item;
          });

          // Update user in localStorage and notify all subscribers
          this.authService.updateCurrentUser(this.user);

          this.toastrService.success('Organization was updated');
          this.isUpdating = false;
        },
        err => {
          this.toastrService.error('Organization was not updated');
          this.isUpdating = false;
        }
      );
    } else {
      this.toastrService.error('You do not have the right to change this organization.');
    }
  }

  onInvite() {
    const invite: OrganizationInvite = {
      id: 0,
      organizationId: this.organization.id,
      createdByUserId: this.authService.getCurrentUser().id,
      inviteEmail: null,
      invitedUserId: null,
      createdByUser: null,
      organization: null,
      createdDate: null,
      experationDate: null,
      link: null,
      state: OrganizationInviteState.Pending
    };
    this.isInviting = true;
    this.organizationInvitesService.create(invite).subscribe(
      value => {
        this.toastrService.success('Organization Invite was created');
        this.invite = value;
        this.inviteLink =  `${window.location.origin}/invite/${value.link}`;
      },
      () => {
        this.toastrService.error('Organization Invite was not created');
      },
      () => this.isInviting = false);
  }

  onSentInviteToEmail() {
    if (!this.inviteEmail) { return; }
    this.invite.inviteEmail = this.inviteEmail;
    this.isSending = true;
    this.organizationInvitesService.update(this.invite.id, this.invite).subscribe(
      value => {
        this.toastrService.success('Organization Invite was updated and sends to email.');
        this.isSending = false;
      },
      err => {
        this.toastrService.error('Organization Invite was not updated');
        this.isSending = false;
      });
  }

  onCopy() {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = this.inviteLink;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
    this.toastrService.info('Invitation link was copied to clipboard');
  }

  onImageSelected(uploads: File[]) {
    const image = new Image();
    const reader = new FileReader();
    this.imageType = uploads[0].type;
    reader.onloadend = (eventLoad: ProgressEvent<FileReader>) => {
      image.src = eventLoad.target.result as string;
      this.cropper.setImage(image);
      this.display = true;
    };

    reader.readAsDataURL(uploads[0]);
    uploads.splice(0, uploads.length);
  }

  onCropCancel() {
    this.imageType = '';
    this.display = false;
  }

  onCropSave() {
    this.organization.imageURL = this.data.image;
    this.organization.imageType = this.imageType;
    this.imageUrl = this.data.image;
    this.display = false;
  }

  onChange(value: string): void {
    this.selectedTheme = this.themes.find(t => t.name === value);
    if (this.selectedTheme) {
      this.themeService.applyTheme(this.selectedTheme);
    }
  }

  private currentThemeCheck(): void {
    if (this.user.lastPickedOrganization) {
      this.themeService.applyTheme(this.organization.theme);
    }
  }

  private fillDropdown(): void {
    this.themeDropdown.push(
      { label: 'Default', value: 'Default' },
      { label: 'Orange', value: 'Darkness' },
      { label: 'Lightness', value: 'Lightness' },
      { label: 'Voclain', value: 'Voclain' }
    );
  }
}
