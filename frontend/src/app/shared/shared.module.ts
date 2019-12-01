import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SafePipe } from './pipes/safe.pipe';
import { ClickOutsideDirective } from './directives/click-outside.directive';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    SafePipe,
    ClickOutsideDirective
  ],
  exports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    SafePipe,
    ClickOutsideDirective
  ]
})
export class SharedModule { }
