import { Component, OnInit } from '@angular/core';
import { ThemeService, AuthService } from './core/services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  constructor(private authService: AuthService, private themeService: ThemeService) { }

  async ngOnInit() {
    if (!this.authService.isAuthorized()) {
      await this.authService.populate();
    }

    const user = this.authService.getCurrentUserLS();
    if (user && user.lastPickedOrganization && user.lastPickedOrganization.themeId) {
      this.themeService.applyThemeById(user.lastPickedOrganization.themeId);
    }
  }
}
