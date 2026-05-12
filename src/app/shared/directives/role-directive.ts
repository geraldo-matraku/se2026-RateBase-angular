import { Directive } from '@angular/core';
import { Input, TemplateRef, ViewContainerRef, inject, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AuthStore } from '../../core/services/authStore';
@Directive({
  selector: '[appRoleDirective]',
})
export class RoleDirective implements OnInit, OnDestroy {
  constructor() {}

  private authStore = inject(AuthStore);
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private destroy$ = new Subject<void>();

  @Input('appHasRole') allowedRole: string = 'admin';

  ngOnInit() {
    this.authStore.user$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (user?.role === this.allowedRole) {
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
