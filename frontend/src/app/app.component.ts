import { Component, OnInit } from '@angular/core';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  constructor(private authService: AuthService) { }

  async ngOnInit() {
    if (!this.authService.isAuthorized()) {
      await this.authService.populate();
    }

    // const user = this.authService.getCurrentUserLS();
    // if (user) {
    //   const themeId = user.lastPickedOrganization.themeId;
    //   if (themeId) {
    //     this.themeService.applyThemeById(themeId);
    //   }
    // }
  }
}
