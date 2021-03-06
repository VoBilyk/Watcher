import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { auth, User as FireUser } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { BehaviorSubject, Observable, ReplaySubject, forkJoin } from 'rxjs';
import { UserRegisterRequest } from '../../shared/models/user-register-request';
import { TokenService } from './token.service';
import { UserLoginRequest } from '../../shared/models/user-login-request';
import { UserInfoProfile } from '../../shared/models/user-info-profile';
import { User } from '../../shared/models/user.model';
import { distinctUntilChanged, first } from 'rxjs/operators';
import { Token } from '../../shared/models/token.model';
import { UserProfile} from '../../shared/models/user-profile';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ThemeService } from './theme.service';

@Injectable()
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User>(this.getCurrentUserLS());
  public currentUser: Observable<User> = this.currentUserSubject.asObservable().pipe(distinctUntilChanged());

  private isAuthenticatedSubject = new ReplaySubject<boolean>(1);
  public isAuthenticated: Observable<boolean> = this.isAuthenticatedSubject.asObservable();

  private userDetails: FireUser = null;
  public userRegisterRequest: UserRegisterRequest = null;

  private tokenHelper: JwtHelperService = new JwtHelperService();

  constructor(
    private firebaseAuth: AngularFireAuth,
    private tokenService: TokenService,
    private themeService: ThemeService,
    private router: Router,
  ) {
    firebaseAuth.authState.subscribe((user) => {
      this.userDetails = user ? user : null;
    });
  }

  // Verify JWT in localstorage with server & load user's info.
  // This runs once on application startup.
  async populate() {
    // If JWT detected, attempt to get & store user's info
    const fToken = await this.getFirebaseToken();
    const wToken = await this.getWatcherToken();

    if (!fToken || !wToken) {
      this.purgeAuth();
      return;
    }

    return this.tokenService.getUserByTokens().toPromise()
      .then(currUser => {
        this.setAuth(currUser);
        return currUser;
      })
      .catch(err => {
        console.log(err);
        this.purgeAuth();
      });
  }

  setAuth(token: Token): void {
    // Save User sent from server in localStorage
    localStorage.setItem('currentUser', JSON.stringify(token.user));
    localStorage.setItem('watcherToken', token.watcherJWT);
    // Set current user data into observable
    this.currentUserSubject.next(token.user);
    // Set isAuthenticated to true
    this.isAuthenticatedSubject.next(true);
  }

  purgeAuth(): void {
    // Remove JWT and current User from localstorage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('watcherToken');

    // Set current user to an empty object
    this.currentUserSubject.next({} as User);
    // Set auth status to false
    this.isAuthenticatedSubject.next(false);
  }

  async login(credential: auth.UserCredential, provider: string) {
    let firstName: string;
    let lastName: string;
    const profile = credential.additionalUserInfo.profile as UserProfile;
    switch (provider) {
      case 'Google': {
        firstName = profile.given_name;
        lastName = profile.family_name;
        break;
      }
      case 'Facebook': {
        firstName = profile.first_name;
        lastName = profile.last_name;
        break;
      }
      case 'GitHub': {
        firstName = '';
        lastName = '';
        break;
      }
    }

    this.userRegisterRequest = {
      uid: credential.user.uid,
      email: credential.user.email,
      displayName: credential.user.displayName,
      refreshToken: credential.user.refreshToken,
      photoUrl: credential.user.photoURL,
      isNewUser: credential.additionalUserInfo.isNewUser,
      companyName: '',
      invitedOrganizationId: 0,
      firstName,
      lastName
    };

    if (!this.userRegisterRequest.email) {
      this.userRegisterRequest.email = (credential.additionalUserInfo.profile as UserInfoProfile).email;
    }

    const request: UserLoginRequest = {
      uid: this.userRegisterRequest.uid,
      email: this.userRegisterRequest.email
    };
    const firebaseToken = await credential.user.getIdToken(true);

    localStorage.setItem('firebaseToken', firebaseToken);
    return this.tokenService.login(request).toPromise()
      .then(tokenDto => {
        this.setAuth(tokenDto);
        if (tokenDto.user.lastPickedOrganization) {
          this.themeService.applyThemeById(tokenDto.user.lastPickedOrganization.themeId);
        }
        return true;
      })
      .catch(err => {
        if (err.status === 400) {
          throw err;
        }
        console.error(err);
        return false;
      });
  }

  async register(): Promise<void> {
    await this.tokenService.register(this.userRegisterRequest).toPromise()
      .then(tokenDto => {
        this.setAuth(tokenDto);
      })
      .catch(err => {
        throw err;
      });
  }

  async signInWithGoogle() {
    const provider = new auth.GoogleAuthProvider();
    provider.addScope('email');
    provider.setCustomParameters({ prompt : 'select_account'});

    return this.firebaseAuth.auth.signInWithPopup(provider)
      .then(res => this.login(res, 'Google'));
  }

  async signInWithFacebook(){
    const provider = new auth.FacebookAuthProvider();
    provider.addScope('email');
    provider.setCustomParameters({ auth_type: 'reauthenticate'});

    return this.firebaseAuth.auth.signInWithPopup(provider)
      .then(res => this.login(res, 'Facebook'));
  }

  async signInWithGitHub() {
    return this.firebaseAuth.auth.signInWithPopup(new auth.GithubAuthProvider().addScope('email'))
      .then(res => this.login(res, 'GitHub'));
  }

  async signUpWithProvider(companyName: string, firstName: string, lastName: string, email: string, invitedOrganizationId: number = 0) {
    this.userRegisterRequest.companyName = companyName;
    this.userRegisterRequest.firstName = firstName;
    this.userRegisterRequest.lastName = lastName;
    this.userRegisterRequest.email = email;
    this.userRegisterRequest.invitedOrganizationId = invitedOrganizationId;
    await this.register();
  }

  isLoggedIn() {
    return !!this.userDetails;
  }

  isAuthorized() {
    return !!this.getCurrentUserLS();
  }

  getCurrentUser() {
    return this.currentUserSubject.value;
  }

  getCurrentUserLS() {
    const userStr = localStorage.getItem('currentUser');
    return JSON.parse(userStr) as User;
  }

  updateCurrentUser(user: User) {
    localStorage.setItem('currentUser', JSON.stringify(user));

    this.themeService.applyThemeById(user.lastPickedOrganization.themeId);

    // Set current user data into observable
    this.currentUserSubject.next(user);
  }

  getTokens() {
    return forkJoin([this.getFirebaseToken(), this.getWatcherToken()]);
  }

  async getFirebaseToken() {
    const currentToken =  localStorage.getItem('firebaseToken');
    if (currentToken && this.tokenHelper.isTokenExpired(currentToken)) {
      await this.refreshFirebaseToken();
    }
    return localStorage.getItem('firebaseToken');
  }

  async getWatcherToken(): Promise<string> {
    const currentToken = localStorage.getItem('watcherToken');
    if (currentToken && this.tokenHelper.isTokenExpired(currentToken)) {
      await this.refreshWatcherToken();
    }
    return localStorage.getItem('watcherToken');
  }

  async refreshFirebaseToken() {
    const firebaseToken = this.firebaseAuth.auth.currentUser
      ? await this.firebaseAuth.auth.currentUser.getIdToken(true)
      : await this.firebaseAuth.authState.pipe(first()).toPromise().then(user => user.getIdToken(true));

    localStorage.setItem('firebaseToken', firebaseToken);
  }

  async refreshWatcherToken() {
    const userInfo = this.getCurrentUserLS();
    const req: UserLoginRequest = {
      uid: userInfo.id,
      email: userInfo.email
    };

    const tokenDto = await this.tokenService.login(req).toPromise();
    localStorage.setItem('watcherToken', tokenDto.watcherJWT);
  }

  logout(): boolean {
    this.purgeAuth();
    localStorage.removeItem('firebaseToken');

    this.firebaseAuth.auth.signOut()
      .then(() => this.router.navigate(['/']))
      .catch(err => console.error(err));

    return true;
  }
}
