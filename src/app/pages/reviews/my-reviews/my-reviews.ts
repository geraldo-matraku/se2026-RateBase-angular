// my-reviews.ts
import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { Spinner } from '../../../shared/spinner/spinner';
import { MyReviewsStore } from '../store/myReviews-store';

@Component({
  selector: 'app-my-reviews',
  standalone: true,
  imports: [DatePipe, Spinner, AsyncPipe],
  templateUrl: './my-reviews.html',
  styleUrl: './my-reviews.scss',
})
export class MyReviews implements OnInit {
  store = inject(MyReviewsStore);

  ngOnInit() {
    this.store.loadMyReviews();
  }
}
