import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CategoryProducts } from './category-products';
import { CategoryProductStore } from './store/category-products-store';
import { CategoriesService } from '../categories/services/categoriesService';

describe('CategoryProducts', () => {
  let fixture: ComponentFixture<CategoryProducts>;
  let component: CategoryProducts;

  let routeParams$: ReplaySubject<Record<string, string>>;
  let storeMock: any;

  beforeEach(async () => {
    routeParams$ = new ReplaySubject<Record<string, string>>(1);

    storeMock = {
      loadProducts: vi.fn(),
      searchProducts: vi.fn(),
      createProduct: vi.fn(),
      deleteProduct: vi.fn(),
      updateProduct: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [CategoryProducts],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: routeParams$.asObservable(),
          },
        },
        {
          provide: CategoryProductStore,
          useValue: storeMock,
        },
        {
          provide: CategoriesService,
          useValue: {
            uploadUrl: 'https://se2026-ratebase-php-production.up.railway.app/uploads/',
          },
        },
      ],
    })
      .overrideComponent(CategoryProducts, {
        set: {
          template: '',
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(CategoryProducts);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    routeParams$.next({ catId: '1' });
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should load products from route category id', () => {
    routeParams$.next({ catId: '5' });
    fixture.detectChanges();

    expect(component.categoryId).toBe(5);
    expect(storeMock.loadProducts).toHaveBeenCalledWith(5);
  });

  it('should not load products when route category id is 0', () => {
    routeParams$.next({ catId: '0' });
    fixture.detectChanges();

    expect(component.categoryId).toBe(0);
    expect(storeMock.loadProducts).not.toHaveBeenCalled();
  });

  it('should open create modal', () => {
    component.openCreateModal();

    expect(component.showCreateModal).toBe(true);
  });

  it('should close create modal and reset form', () => {
    component.showCreateModal = true;
    component.selectedFile = new File(['test'], 'test.png');

    component.productForm.patchValue({
      name: 'Product',
      description: 'Description',
    });

    component.closeCreateModal();

    expect(component.showCreateModal).toBe(false);
    expect(component.selectedFile).toBeNull();
    expect(component.productForm.value.name).toBeNull();
    expect(component.productForm.value.description).toBeNull();
  });

  it('should search products when search value is not empty', () => {
    component.categoryId = 3;

    component.onSearchChange('phone');

    expect(storeMock.searchProducts).toHaveBeenCalledWith({
      categoryId: 3,
      query: 'phone',
    });
  });

  it('should reload products when search value is empty', () => {
    component.categoryId = 3;

    component.onSearchChange('');

    expect(storeMock.loadProducts).toHaveBeenCalledWith(3);
    expect(storeMock.searchProducts).not.toHaveBeenCalled();
  });

  it('should not create product when form is invalid', () => {
    component.productForm.patchValue({
      name: '',
      description: '',
    });

    component.onCreateSubmit();

    expect(storeMock.createProduct).not.toHaveBeenCalled();
  });

  it('should create product when form is valid', () => {
    component.categoryId = 7;

    component.productForm.patchValue({
      name: 'New Product',
      description: 'New Description',
    });

    component.onCreateSubmit();

    expect(storeMock.createProduct).toHaveBeenCalled();

    const formData = storeMock.createProduct.mock.calls[0][0] as FormData;

    expect(formData.get('name')).toBe('New Product');
    expect(formData.get('description')).toBe('New Description');
    expect(formData.get('category_id')).toBe('7');
  });

  it('should open delete modal with product data', () => {
    component.openDeleteModal(10, 'Product Name');

    expect(component.showDeleteModal).toBe(true);
    expect(component.productToDelete).toEqual({
      id: 10,
      name: 'Product Name',
    });
  });
});
