import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  inject,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AuthStore } from '../../core/services/authStore';

@Directive({
  selector: '[appAdminOrOwner]',
})
export class AdminOrOwnerDirective implements OnInit, OnDestroy {
  private authStore = inject(AuthStore);
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private destroy$ = new Subject<void>();

  @Input('appAdminOrOwner') ownerId: number | null = null;

  ngOnInit() {
    this.authStore.user$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      const isAdmin = user?.role === 'admin';
      const isOwner = this.ownerId !== null && user?.user_id === this.ownerId;

      if (isAdmin || isOwner) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      } else {
        this.viewContainer.clear();
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
