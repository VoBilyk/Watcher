import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormBuilder, Validators } from '@angular/forms';
import { ImageCropperComponent, CropperSettings } from 'ngx-img-cropper';
import { UserService, AuthService, PathService, ToastrService } from '../../core/services';
import { User } from '../../shared/models/user.model';
import { UserDto } from '../../shared/models/user-dto.model';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.sass']
})
export class UserProfileComponent implements OnInit {
  data: any = {};
  photoUrl: string;
  photoType: string;
  isUpdating = false;

  @ViewChild('cropper') cropper: ImageCropperComponent;
  cropperSettings: CropperSettings;
  display = false;
  user: User;

  private userId: string;

  userForm = this.fb.group({
    displayName: new FormControl({ value: '', disabled: true }, Validators.required),
    firstName: new FormControl({ value: '', disabled: true }, Validators.required),
    emailForNotifications: new FormControl({ value: '', disabled: true }, Validators.email),
    lastName: new FormControl({ value: '', disabled: true }, Validators.required),
    bio: new FormControl({ value: '', disabled: true })
  });

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private toastrService: ToastrService,
    private pathService: PathService
  ) {

    this.cropperSettings = new CropperSettings({
      width: 200,
      height: 200,
      minHeight: 100,
      minWidth: 100,
      croppedWidth: 70,
      croppedHeight: 70,
      canvasWidth: 400,
      canvasHeight: 400,
      noFileInput: true,
      preserveSize: true
    });
  }

  ngOnInit() {
    this.authService.currentUser.subscribe(
      (userData) => {
        this.user = { ...userData };
        this.userId = userData.id;
        this.setUserData();
      }
    );
  }

  setUserData(): void {
    Object.keys(this.userForm.controls).forEach(field => {
      const control = this.userForm.get(field);
      control.setValue(this.user[field]);
      control.enable();
      this.photoUrl = this.pathService.convertToUrl(this.user.photoURL);
    });

    this.userForm.valueChanges.subscribe(value => {
      Object.keys(this.userForm.controls).forEach(field => {
        this.user[field] = this.userForm.get(field).value;
      });
    });
  }

  onImageSelected(upload) {
    const image: any = new Image();
    const reader: FileReader = new FileReader();
    const that = this;
    this.photoType = upload[0].type;
    reader.onloadend = (eventLoad: any) => {
      image.src = eventLoad.target.result;
      that.cropper.setImage(image);
      this.display = true;
    };
    reader.readAsDataURL(upload[0]);
    upload.splice(0, upload.length);
  }

  onCropCancel() {
    this.photoType = '';
    this.display = false;
  }

  onCropSave() {
    this.user.photoURL = this.data.image;
    this.user.photoType = this.photoType;
    this.photoUrl = this.data.image;
    this.display = false;
  }

  onSubmit() {
    if (this.userForm.valid) {
      this.isUpdating = true;
      const userDto: UserDto = {
        id: this.user.id,
        email: this.user.email,
        emailForNotifications: this.user.emailForNotifications,
        displayName: this.user.displayName,
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        bio: this.user.bio,
        photoURL: this.user.photoURL,
        photoType: this.user.photoType
      };

      this.userService.update(this.userId, userDto).subscribe(
        () => {
          this.authService.updateCurrentUser(this.user);
          this.toastrService.success('Profile was updated');
          this.isUpdating = false;
        },
        () => {
          this.toastrService.error('Profile was not updated');
          this.isUpdating = false;
        });
    } else {
      Object.keys(this.userForm.controls).forEach(field => {
        const control = this.userForm.get(field);
        control.markAsDirty({ onlySelf: true });
      });
    }
  }
}
