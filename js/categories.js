/**
 * Categories Module for Library Management Portal
 * Handles Categories listing, dynamic volume counting, and CRUD modifications.
 */

function initCategories() {
  const btnAddCategory = document.getElementById('btn-add-category');
  const categoryForm = document.getElementById('category-form');

  // Open modal in "Add Category" mode
  if (btnAddCategory) {
    btnAddCategory.addEventListener('click', () => {
      resetCategoryForm();
      document.getElementById('category-modal-title').textContent = 'Add Category';
      window.openModal('category-modal');
    });
  }

  // Handle Form Submit
  if (categoryForm) {
    categoryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleCategorySubmit();
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCategories);
} else {
  initCategories();
}

// Clears form fields
function resetCategoryForm() {
  const form = document.getElementById('category-form');
  if (form) form.reset();
  document.getElementById('category-edit-id').value = '';

  const err = document.getElementById('error-category-name');
  if (err) err.classList.add('hidden');
}

// Submits Category form
function handleCategorySubmit() {
  const editId = document.getElementById('category-edit-id').value;
  const nameInput = document.getElementById('category-name');
  const descInput = document.getElementById('category-description');

  let isValid = true;

  if (!nameInput.value.trim()) {
    document.getElementById('error-category-name').classList.remove('hidden');
    isValid = false;
  } else {
    document.getElementById('error-category-name').classList.add('hidden');
  }

  if (!isValid) return;

  const categoryData = {
    name: nameInput.value.trim(),
    description: descInput.value.trim()
  };

  if (editId) {
    window.LibraryApp.updateCategory(editId, categoryData);
  } else {
    window.LibraryApp.addCategory(categoryData);
  }
}

// ----------------------------------------------------
// Placeholder CRUD Functions (Firebase-Ready Setup)
// ----------------------------------------------------

window.LibraryApp.loadCategories = function() {
  // --- Firebase Integration Here ---
  // Subscriptions or server queries for categories collection:
  // db.collection("categories").onSnapshot(snapshot => { ... })

  const categories = window.LibraryApp.categories || [];
  const books = window.LibraryApp.books || [];

  const tbody = document.getElementById('categories-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (categories.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="px-6 py-10 text-center text-slate-400 font-medium">
          No categories registered yet.
        </td>
      </tr>
    `;
    return;
  }

  categories.forEach(cat => {
    // Dynamically calculate total volumes currently categorized here
    const matchedBooks = books.filter(b => b.category.toLowerCase() === cat.name.toLowerCase());
    const totalVolumes = matchedBooks.reduce((sum, b) => sum + parseInt(b.quantity || 0), 0);

    // Sync total count with state object for consistency
    cat.totalBooks = totalVolumes;

    const row = document.createElement('tr');
    row.className = "hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0 text-sm";

    row.innerHTML = `
      <td class="px-6 py-4.5 font-bold text-slate-900 whitespace-nowrap">${escapeHTML(cat.name)}</td>
      <td class="px-6 py-4.5 text-slate-500 max-w-sm leading-relaxed">${escapeHTML(cat.description || 'No description provided.')}</td>
      <td class="px-6 py-4.5 font-mono text-xs font-bold text-slate-600 whitespace-nowrap">
        <span class="bg-slate-100 border border-slate-200 text-slate-700 rounded-md px-2.5 py-1">
          ${totalVolumes} Books
        </span>
      </td>
      <td class="px-6 py-4.5 whitespace-nowrap text-right">
        <div class="flex items-center justify-end gap-2">
          <!-- Edit button -->
          <button id="btn-edit-cat-${cat.id}" class="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 p-2 rounded-lg transition-colors cursor-pointer" title="Edit Category">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
          </button>
          <!-- Delete button -->
          <button id="btn-delete-cat-${cat.id}" class="text-rose-600 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 p-2 rounded-lg transition-colors cursor-pointer" title="Delete Category">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(row);

    // Event listeners
    document.getElementById(`btn-edit-cat-${cat.id}`).addEventListener('click', () => {
      openEditCategoryModal(cat);
    });

    document.getElementById(`btn-delete-cat-${cat.id}`).addEventListener('click', () => {
      window.LibraryApp.deleteCategory(cat.id);
    });
  });
};

import { 
  db, 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  handleFirestoreError, 
  OperationType 
} from './firebase.js';

window.LibraryApp.addCategory = async function(category) {
  const isDuplicate = window.LibraryApp.categories.some(c => c.name.toLowerCase() === category.name.toLowerCase());
  if (isDuplicate) {
    alert(`Category "${category.name}" already exists.`);
    return;
  }

  try {
    const categoryId = 'cat-' + Date.now();
    await setDoc(doc(db, 'categories', categoryId), {
      name: category.name,
      description: category.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    await window.LibraryApp.logActivity('category_add', `Added book category "${category.name}".`);
    alert("Added Successfully");

    window.closeModal('category-modal');
    resetCategoryForm();
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'categories');
  }
};

window.LibraryApp.updateCategory = async function(id, category) {
  const index = window.LibraryApp.categories.findIndex(c => c.id === id);
  if (index === -1) return;

  const isDuplicate = window.LibraryApp.categories.some(c => c.id !== id && c.name.toLowerCase() === category.name.toLowerCase());
  if (isDuplicate) {
    alert(`Another category named "${category.name}" already exists.`);
    return;
  }

  try {
    const categoryRef = doc(db, 'categories', id);
    await updateDoc(categoryRef, {
      name: category.name,
      description: category.description,
      updatedAt: new Date().toISOString()
    });

    await window.LibraryApp.logActivity('category_edit', `Updated description and title for category "${category.name}".`);
    alert("Updated Successfully");

    window.closeModal('category-modal');
    resetCategoryForm();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `categories/${id}`);
  }
};

window.LibraryApp.deleteCategory = async function(id) {
  const cat = window.LibraryApp.categories.find(c => c.id === id);
  if (!cat) return;

  const booksInCat = window.LibraryApp.books.some(b => b.category.toLowerCase() === cat.name.toLowerCase());
  if (booksInCat) {
    alert(`Cannot delete category "${cat.name}" because there are books currently assigned to it. Re-assign or delete those books first.`);
    return;
  }

  if (confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
    try {
      await deleteDoc(doc(db, 'categories', id));
      await window.LibraryApp.logActivity('category_delete', `Deleted category "${cat.name}".`);
      alert("Deleted Successfully");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `categories/${id}`);
    }
  }
};

// Prefills and displays Edit Category Modal
function openEditCategoryModal(cat) {
  resetCategoryForm();
  document.getElementById('category-edit-id').value = cat.id;
  document.getElementById('category-name').value = cat.name;
  document.getElementById('category-description').value = cat.description;

  document.getElementById('category-modal-title').textContent = 'Edit Category Details';
  window.openModal('category-modal');
}

// Escape utilities
function escapeHTML(str) {
  if (!str) return '';
  return str.toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
