import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CategoriesComponent } from './categories';
import { AuthStore } from '../../core/services/authStore';
import { CategoriesStore } from './store/categoriesStore';
import { CategoriesService } from './services/categoriesService';

describe('CategoriesComponent', () => {
  let fixture: ComponentFixture<CategoriesComponent>;
  let component: CategoriesComponent;

  let authStoreMock: any;
  let categoriesStoreMock: any;
  let categoriesServiceMock: any;

  beforeEach(async () => {
    authStoreMock = {
      logout: vi.fn(),
    };

    categoriesStoreMock = {
      loadCategories: vi.fn(),
      searchCategories: vi.fn(),
      addCategory: vi.fn(),
      deleteCategory: vi.fn(),
      editCategory: vi.fn(),
    };

    categoriesServiceMock = {
      uploadUrl: 'https://se2026-ratebase-php-production.up.railway.app/uploads/',
    };

    await TestBed.configureTestingModule({
      imports: [CategoriesComponent],
      providers: [
        {
          provide: AuthStore,
          useValue: authStoreMock,
        },
        {
          provide: CategoriesStore,
          useValue: categoriesStoreMock,
        },
        {
          provide: CategoriesService,
          useValue: categoriesServiceMock,
        },
      ],
    })
      .overrideComponent(CategoriesComponent, {
        set: {
          template: '',
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(CategoriesComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load categories on init', () => {
    fixture.detectChanges();

    expect(categoriesStoreMock.loadCategories).toHaveBeenCalledTimes(1);
  });

  it('should set image base url from categories service', () => {
    expect(component.imgBase).toBe(
      'https://se2026-ratebase-php-production.up.railway.app/uploads/',
    );
  });

  it('should search categories when search value changes', () => {
    component.onSearchChange('electronics');

    expect(categoriesStoreMock.searchCategories).toHaveBeenCalledWith('electronics');
  });

  it('should call logout from auth store', () => {
    component.onLogout();

    expect(authStoreMock.logout).toHaveBeenCalledTimes(1);
  });

  it('should set selected file when file is selected', () => {
    const file = new File(['image-content'], 'category.png', {
      type: 'image/png',
    });

    const event = {
      target: {
        files: [file],
      },
    };

    component.onFileSelect(event);

    expect(component.selectedFile).toBe(file);
  });

  it('should not add category when form is invalid', () => {
    component.categoryForm.patchValue({
      name: '',
      description: '',
    });

    component.onSubmit();

    expect(categoriesStoreMock.addCategory).not.toHaveBeenCalled();
  });

  it('should add category when form is valid', () => {
    component.categoryForm.patchValue({
      name: 'Electronics',
      description: 'Electronic products category',
    });

    component.onSubmit();

    expect(categoriesStoreMock.addCategory).toHaveBeenCalledTimes(1);

    const formData = categoriesStoreMock.addCategory.mock.calls[0][0] as FormData;

    expect(formData.get('name')).toBe('Electronics');
    expect(formData.get('description')).toBe('Electronic products category');
    expect(component.showModal).toBe(false);
    expect(component.selectedFile).toBeNull();
  });

  it('should open and close delete modal', () => {
    component.openDeleteModal(5, 'Books');

    expect(component.showDeleteModal).toBe(true);
    expect(component.categoryToDelete).toEqual({
      id: 5,
      name: 'Books',
    });

    component.closeDeleteModal();

    expect(component.showDeleteModal).toBe(false);
    expect(component.categoryToDelete).toBeNull();
  });

  it('should delete selected category when confirm delete is called', () => {
    component.categoryToDelete = {
      id: 7,
      name: 'Clothes',
    };

    component.showDeleteModal = true;

    component.confirmDelete();

    expect(categoriesStoreMock.deleteCategory).toHaveBeenCalledWith(7);
    expect(component.showDeleteModal).toBe(false);
    expect(component.categoryToDelete).toBeNull();
  });

  it('should open edit modal and patch category form', () => {
    const category = {
      category_id: 9,
      name: 'Sports',
      description: 'Sports products',
    };

    component.openEditModal(category);

    expect(component.showEditModal).toBe(true);
    expect(component.selectedCategoryId).toBe(9);
    expect(component.categoryForm.value.name).toBe('Sports');
    expect(component.categoryForm.value.description).toBe('Sports products');
  });
});
