import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafePipe } from './pipes/safe.pipe';
import { ClickOutsideDirective } from './directives/click-outside.directive';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    SafePipe,
    ClickOutsideDirective
  ],
  exports: [
    CommonModule,
    SafePipe,
    ClickOutsideDirective
  ]
})
export class SharedModule { }
