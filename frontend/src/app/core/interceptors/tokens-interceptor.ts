import { Injectable } from '@angular/core';
import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { from } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class TokensInterceptor implements HttpInterceptor {
  headersConfig = {
    'Content-Type': 'application/json; charset=utf-8',
    Accept: 'application/json'
  };

  constructor(private auth: AuthService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // check for preventing infinite loop while getting new token from backend
    if (req.url.match(/\/Tokens\/Login/)) {
      console.log('Login...');
      return from(this.auth.getFirebaseToken()).pipe(
        flatMap(firebaseToken => {
          let headers = {};
          if (firebaseToken) {
            headers = {
              'Content-Type': 'application/json; charset=utf-8',
              Accept: 'application/json',
              Authorization: `Bearer ${firebaseToken}`
            };
          } else {
            headers = this.headersConfig;
          }
          const request = req.clone({ setHeaders: headers, responseType: 'json' });
          return next.handle(request);
        }));
    }
    return this.auth.getTokens().pipe(
      flatMap(([firebaseToken, watcherToken]) => {
        if (firebaseToken) {
          this.headersConfig['Authorization'] = `Bearer ${firebaseToken}`;
        }
        if (watcherToken) {
          this.headersConfig['WatcherAuthorization'] = watcherToken;
        }

        if (req.url.match(/\/uploadApp/)) {
          const request = req.clone();
          return next.handle(request);
        } else {
          const request = req.clone({ setHeaders: this.headersConfig, responseType: 'json' });
          return next.handle(request);
        }
      })
    );
  }
}
