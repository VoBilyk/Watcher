import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import { Router } from '@angular/router';
import { ReplaySubject, Observable } from 'rxjs';
import { Organization } from '../shared/models/organization.model';

@Component({
  selector: 'app-authorization',
  templateUrl: './authorization.component.html',
  styleUrls: ['./authorization.component.sass']
})
export class AuthorizationComponent implements OnInit {

  @ViewChild('signInTemplate') signInTemplate;
  @ViewChild('signUpTemplate') signUpTemplate;
  @ViewChild('userDetailsTemplate') userDetailsTemplate;
  @ViewChild('notRegisteredSignInTemplate') notRegisteredSignInTemplate;

  @Input() display = false; // two-way binding
  @Output() displayChange = new EventEmitter<boolean>();

  @Input() showSignInOutBtn = true;
  @Input() invitedOrganization: Organization = null;

  @Output() successfulSignIn = new EventEmitter();

  isDisabledCompanyName = false;

  isSignIn = true;
  isSuccessSignUp = false;
  isNotRegisteredSignIn = false;
  isFetching = false;
  isSaving: Boolean = false;
  emailExists = false;

  companyName = '';
  lastName = '';
  firstName = '';
  userEmail = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {

  }

  ngOnInit() {

  }

  loadTemplate() {
    if (this.isSignIn) {
      return this.signInTemplate;
    } else if (this.isSuccessSignUp) {
      if (this.invitedOrganization !== null) { // data from invitr
        this.companyName = this.invitedOrganization.name;
        this.isDisabledCompanyName = true;
      }
      return this.userDetailsTemplate;
    } else if (this.isNotRegisteredSignIn) {
      return this.notRegisteredSignInTemplate;
    } else {
      return this.signUpTemplate;
    }
  }

  showSignUp(): void {
    this.isSignIn = false;
    this.isSuccessSignUp = false;
  }

  showSignIn(): void {
    this.isSignIn = true;
    this.isSuccessSignUp = false;
  }

  showDialogSignUp(): void {
    this.display = true;
    this.isSignIn = false;
  }

  closeDialog(): void {
    this.isSuccessSignUp = false;
    this.isSignIn = true;
    this.display = false;
    this.displayChange.emit(this.display);
  }

  noRegistration(): void {
    this.display = false;
    this.router.navigate(['/']);
  }

  async signInWithGoogle(): Promise<void> {
    this.isFetching = true;
    await this.authService.signInWithGoogle()
      .then(result => {
        if (result) {
          this.closeDialog();
          this.signInPostProcessing(result);
          this.successfulSignIn.emit(); // for invite
        }
        this.isFetching = false;
        this.fetchExistingData();
      })
      .catch(err => {
        if (err) {
          if (err.status === 400) {
            this.isSignIn = false;
            this.isSuccessSignUp = true;
          }
        }
        this.isFetching = false;
        this.fetchExistingData();
      });
  }

  async signInWithFacebook(): Promise<void> {
    this.isFetching = true;
    await this.authService.signInWithFacebook()
      .then(result => {
        if (result) {
          this.closeDialog();
          this.signInPostProcessing(result);
          this.successfulSignIn.emit(); // for invite
        }
        this.isFetching = false;
        this.fetchExistingData();
      })
      .catch(err => {
        console.log(err);
        if (err) {
          if (err.status === 400) {
            this.isSignIn = false;
            this.isSuccessSignUp = true;
          }
        }
        this.isFetching = false;
        this.fetchExistingData();
      });
  }

  async signInWithGitHub(): Promise<any> {
    this.isFetching = true;
    await this.authService.signInWithGitHub()
      .then(result => {
        if (result) {
          this.closeDialog();
          this.signInPostProcessing(result);
          this.successfulSignIn.emit(); // for invite
        }
        this.isFetching = false;
        this.fetchExistingData();
      })
      .catch(err => {
        if (err) {
          if (err.status === 400) {
            this.isSignIn = false;
            this.isSuccessSignUp = true;
          }
        }
        this.isFetching = false;
        this.fetchExistingData();
      });
  }

  async saveUserDetails(): Promise<void> {
    this.isSaving = true;
    let invitedOrganizationid = 0;
    if (this.invitedOrganization !== null) {
      invitedOrganizationid = this.invitedOrganization.id;
    }

    await this.authService.signUpWithProvider(this.companyName, this.firstName, this.lastName,
                                               this.userEmail, invitedOrganizationid)
      .then(res => {
        this.isSaving = false;
        this.closeDialog();
        this.signInPostProcessing(true);
      })
      .catch(err => {
        if (err) {
          this.isSaving = false;
          this.closeDialog();
          console.log(err);
        }
      });
  }

  onContinueLaterClick(): void {
    // default data
    this.companyName = 'MyCompany';
    if (this.firstName === '') {
      this.firstName = 'MyFirstName';
    }
    if (this.lastName === '') {
      this.lastName = 'MyLastName';
    }
    this.saveUserDetails();
  }

  signInPostProcessing(result: boolean): Promise<boolean> {
    if (result) {
      return this.router.navigate(['/user/instances']);
    } else {
      return this.router.navigate(['/']);
    }
  }

  fetchExistingData() {
    this.firstName = this.authService.userRegisterRequest.firstName;
    this.lastName = this.authService.userRegisterRequest.lastName;
    this.userEmail = this.authService.userRegisterRequest.email;
    if (this.userEmail !== null) {
      this.emailExists = true;
    }
  }
}
