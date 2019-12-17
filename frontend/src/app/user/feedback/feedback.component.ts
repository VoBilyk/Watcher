import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormBuilder } from '@angular/forms';
import { FeedbackService, ToastrService, AuthService } from '../../core/services';
import { Feedback } from '../../shared/models/feedback.model';
import { User } from '../../shared/models/user.model';
import { LongAnswerType } from '../../shared/models/long-answer-type.enum';
import { ShortAnswerType } from '../../shared/models/short-answer-type.enum';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.sass'],
})
export class FeedbackComponent implements OnInit {
  feedback: Feedback;
  user: User;
  isSubmiting: boolean;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private feedbackService: FeedbackService,
    private toastrService: ToastrService,
    private router: Router
  ) { }

  feedbackForm = this.fb.group({
    suggestions: new FormControl({ value: ' ', disabled: false }),
    willUse: new FormControl({ value: ShortAnswerType[ShortAnswerType.Abstain], disabled: false }),
    informatively: new FormControl({ value: LongAnswerType[LongAnswerType.Abstain], disabled: false }),
    friendliness: new FormControl({ value: LongAnswerType[LongAnswerType.Abstain], disabled: false }),
    quickness: new FormControl({ value: LongAnswerType[LongAnswerType.Abstain], disabled: false })
  });

  restForm() {
    this.feedbackForm.reset({
      suggestions: { value: ' ', disabled: false },
      willUse: { value: ShortAnswerType[ShortAnswerType.Abstain], disabled: false },
      informatively: { value: LongAnswerType[LongAnswerType.Abstain], disabled: false },
      friendliness: { value: LongAnswerType[LongAnswerType.Abstain], disabled: false },
      quickness: { value: LongAnswerType[LongAnswerType.Abstain], disabled: false }
    });
  }

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    if (this.user == null) {
      return;
    }
  }

  async onSubmit() {
    this.isSubmiting = true;
    const text =  this.feedbackForm.get('suggestions').value;
    const willUse = this.feedbackForm.get('willUse').value;
    const informatively = this.feedbackForm.get('informatively').value;
    const friendliness = this.feedbackForm.get('friendliness').value;
    const quickness = this.feedbackForm.get('quickness').value;
    if (!willUse && !informatively && !friendliness && !quickness && (!text || text === ' ')) {
      this.toastrService.warning('All fields are empty.');
      this.isSubmiting = false;
      return;
    }
    const newFeedback = {
      createdAt: new Date(),
      user: this.user,
      text,
      willUse,
      informatively,
      friendliness,
      quickness,
      name: this.user.displayName,
      email: this.user.email
    } as Feedback;

    this.feedbackService.create(newFeedback).
      subscribe(
        () => {
          this.toastrService.success('Added new feedback');
          if (!this.user.email) {
            this.toastrService.info('If you want to receive emails, fill out the email field in Settings.');
          }
          this.isSubmiting = false;
        },
        error => {
          this.toastrService.error(`Error ocured status: ${error.message}`);
          this.isSubmiting = false;
        });
    if (await this.toastrService.question('Would you want to enter one more feedback?')) {
      this.restForm();
    } else {
      this.router.navigate(['/user']);
    }
  }

}
