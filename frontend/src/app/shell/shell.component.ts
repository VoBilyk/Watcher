import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.sass']
})

export class ShellComponent implements OnInit {
  constructor(private router: Router) {  }

  private regexInstances: RegExp = /\/user\/instances/;
  showInstanceList: boolean;

  ngOnInit() {
    this.checkRoute();
    this.subscribeRouteChanges();
  }

  private subscribeRouteChanges() {
    this.router.events.subscribe(() => this.checkRoute());
  }

  private checkRoute() {
    this.showInstanceList = !!(this.router.url.match(this.regexInstances));
  }
}
