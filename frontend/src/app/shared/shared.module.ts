import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { RadioButtonModule } from 'primeng/radiobutton';
import { TabMenuModule } from 'primeng/tabmenu';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { TabViewModule } from 'primeng/tabview';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ButtonModule } from 'primeng/button';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { PanelMenuModule } from 'primeng/panelmenu';
import { AccordionModule } from 'primeng/accordion';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FileUploadModule } from 'primeng/fileupload';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { TableModule } from 'primeng/table';
import { SliderModule } from 'primeng/slider';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { CalendarModule } from 'primeng/calendar';
import { ListboxModule } from 'primeng/listbox';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { DataViewModule } from 'primeng/dataview';
import { DropdownModule } from 'primeng/dropdown';
import { SpinnerModule } from 'primeng/spinner';
import { MultiSelectModule } from 'primeng/multiselect';
import { PaginatorModule } from 'primeng/paginator';
import { InputSwitchModule } from 'primeng/inputswitch';
import { CheckboxModule } from 'primeng/checkbox';
import { InputMaskModule } from 'primeng/inputmask';

import { SafePipe } from './pipes/safe.pipe';
import { ClickOutsideDirective } from './directives/click-outside.directive';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RadioButtonModule,
    ConfirmDialogModule,
    AccordionModule,
    PanelModule,
    InputTextareaModule,
    InputTextModule,
    ButtonModule,
    ProgressSpinnerModule,
    TabViewModule,
    ToastModule,
    DialogModule,
    PanelMenuModule,
    FileUploadModule,
    AutoCompleteModule,
    TableModule,
    SliderModule,
    TieredMenuModule,
    CalendarModule,
    ListboxModule,
    OverlayPanelModule,
    ScrollPanelModule,
    DataViewModule,
    DropdownModule,
    SpinnerModule,
    MultiSelectModule,
    TabMenuModule,
    PaginatorModule,
    InputSwitchModule,
    CheckboxModule,
    InputMaskModule,
  ],
  declarations: [
    SafePipe,
    ClickOutsideDirective
  ],
  exports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,

    RadioButtonModule,
    ConfirmDialogModule,
    AccordionModule,
    PanelModule,
    InputTextareaModule,
    InputTextModule,
    ButtonModule,
    ProgressSpinnerModule,
    TabViewModule,
    ToastModule,
    DialogModule,
    PanelMenuModule,
    FileUploadModule,
    AutoCompleteModule,
    TableModule,
    SliderModule,
    TieredMenuModule,
    CalendarModule,
    ListboxModule,
    OverlayPanelModule,
    ScrollPanelModule,
    DataViewModule,
    DropdownModule,
    SpinnerModule,
    MultiSelectModule,
    TabMenuModule,
    PaginatorModule,
    InputSwitchModule,
    CheckboxModule,
    InputMaskModule,

    SafePipe,
    ClickOutsideDirective
  ]
})
export class SharedModule { }
