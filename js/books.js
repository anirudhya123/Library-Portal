/**
 * Books Module for Library Management Portal
 * Handles Books list rendering, search, category filtering, and Add/Edit CRUD.
 */

// Initialize Module Event Listeners on Load
function initBooks() {
  const btnAddBook = document.getElementById('btn-add-book');
  const bookForm = document.getElementById('book-form');
  const bookSearch = document.getElementById('book-search');
  const bookFilter = document.getElementById('book-category-filter');

  // Open modal in "Add" mode
  if (btnAddBook) {
    btnAddBook.addEventListener('click', () => {
      resetBookForm();
      document.getElementById('book-modal-title').textContent = 'Add New Book';
      window.openModal('book-modal');
    });
  }

  // Handle book form submit (Add / Edit)
  if (bookForm) {
    bookForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleBookSubmit();
    });
  }

  // Live Search Filter
  if (bookSearch) {
    bookSearch.addEventListener('input', () => {
      window.LibraryApp.loadBooks();
    });
  }

  // Category Filter
  if (bookFilter) {
    bookFilter.addEventListener('change', () => {
      window.LibraryApp.loadBooks();
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBooks);
} else {
  initBooks();
}

// Resets form inputs and error messages
function resetBookForm() {
  const form = document.getElementById('book-form');
  if (form) form.reset();
  document.getElementById('book-edit-id').value = '';

  // Hide any validation errors
  const errors = ['error-book-title', 'error-book-author', 'error-book-category', 'error-book-quantity', 'error-book-cover'];
  errors.forEach(errId => {
    const errElem = document.getElementById(errId);
    if (errElem) errElem.classList.add('hidden');
  });
}

// Form Submission (Add or Update)
function handleBookSubmit() {
  const editId = document.getElementById('book-edit-id').value;
  const titleInput = document.getElementById('book-title');
  const authorInput = document.getElementById('book-author');
  const categorySelect = document.getElementById('book-category');
  const qtyInput = document.getElementById('book-quantity');
  const coverInput = document.getElementById('book-cover');

  let isValid = true;

  // Perform Validations
  if (!titleInput.value.trim()) {
    document.getElementById('error-book-title').classList.remove('hidden');
    isValid = false;
  } else {
    document.getElementById('error-book-title').classList.add('hidden');
  }

  if (!authorInput.value.trim()) {
    document.getElementById('error-book-author').classList.remove('hidden');
    isValid = false;
  } else {
    document.getElementById('error-book-author').classList.add('hidden');
  }

  if (!categorySelect.value) {
    document.getElementById('error-book-category').classList.remove('hidden');
    isValid = false;
  } else {
    document.getElementById('error-book-category').classList.add('hidden');
  }

  const qty = parseInt(qtyInput.value);
  if (isNaN(qty) || qty < 1) {
    document.getElementById('error-book-quantity').classList.remove('hidden');
    isValid = false;
  } else {
    document.getElementById('error-book-quantity').classList.add('hidden');
  }

  // Cover image fallback
  let coverUrl = coverInput.value.trim();
  if (!coverUrl) {
    coverUrl = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=120&auto=format&fit=crop&q=80'; // Default library cover
  }

  if (!isValid) return;

  const bookData = {
    title: titleInput.value.trim(),
    author: authorInput.value.trim(),
    category: categorySelect.value,
    quantity: qty,
    cover: coverUrl
  };

  if (editId) {
    // Edit mode
    window.LibraryApp.updateBook(editId, bookData);
  } else {
    // Add mode
    window.LibraryApp.addBook(bookData);
  }
}

// ----------------------------------------------------
// Placeholder CRUD Functions (Firebase-Ready Setup)
// ----------------------------------------------------

window.LibraryApp.loadBooks = function() {
  // --- Firebase Integration Here ---
  // Subscriptions or server queries for books collection would be added here:
  // db.collection("books").onSnapshot(snapshot => { ... })

  const books = (window.LibraryApp.books || []).map(b => ({
    ...b,
    cover: b.coverUrl || b.cover || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=120&auto=format&fit=crop&q=80'
  }));
  const categories = window.LibraryApp.categories || [];
  const searchVal = (document.getElementById('book-search')?.value || '').toLowerCase();
  const catFilter = document.getElementById('book-category-filter')?.value || 'All';

  // 1. Refresh Dynamic Category Select Dropdowns
  refreshCategoryDropdowns(categories);

  // 2. Filter Books Array
  const filteredBooks = books.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchVal) || 
                          b.author.toLowerCase().includes(searchVal) ||
                          b.category.toLowerCase().includes(searchVal);
    
    const matchesCategory = catFilter === 'All' || b.category === catFilter;

    return matchesSearch && matchesCategory;
  });

  // 3. Render Table
  const tbody = document.getElementById('books-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (filteredBooks.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="px-6 py-10 text-center text-slate-400 font-medium">
          No books found matching the search criteria.
        </td>
      </tr>
    `;
    return;
  }

  filteredBooks.forEach(book => {
    const row = document.createElement('tr');
    row.className = "hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0";
    
    row.innerHTML = `
      <td class="px-6 py-3.5 whitespace-nowrap">
        <img src="${escapeHTML(book.cover)}" alt="Cover" class="w-10 h-14 object-cover rounded-md shadow-xs bg-slate-100 border border-slate-100" onerror="this.src='https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=120&auto=format&fit=crop&q=80'"/>
      </td>
      <td class="px-6 py-3.5 font-semibold text-slate-900 leading-tight">${escapeHTML(book.title)}</td>
      <td class="px-6 py-3.5 text-slate-600 font-medium">${escapeHTML(book.author)}</td>
      <td class="px-6 py-3.5 whitespace-nowrap">
        <span class="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-indigo-100">${escapeHTML(book.category)}</span>
      </td>
      <td class="px-6 py-3.5 font-mono text-slate-600 font-medium text-center whitespace-nowrap">${book.quantity}</td>
      <td class="px-6 py-3.5 whitespace-nowrap text-center">
        <span class="${book.available > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'} text-xs font-bold px-2.5 py-1 rounded-md border">
          ${book.available} Available
        </span>
      </td>
      <td class="px-6 py-3.5 whitespace-nowrap text-right">
        <div class="flex items-center justify-end gap-2">
          <!-- Edit Button -->
          <button id="btn-edit-book-${book.id}" class="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 p-2 rounded-lg transition-colors cursor-pointer" title="Edit Book">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
          </button>
          <!-- Delete Button -->
          <button id="btn-delete-book-${book.id}" class="text-rose-600 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 p-2 rounded-lg transition-colors cursor-pointer" title="Delete Book">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(row);

    // Bind row action listeners
    document.getElementById(`btn-edit-book-${book.id}`).addEventListener('click', () => {
      openEditModal(book);
    });

    document.getElementById(`btn-delete-book-${book.id}`).addEventListener('click', () => {
      window.LibraryApp.deleteBook(book.id);
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

window.LibraryApp.addBook = async function(book) {
  try {
    const bookId = 'book-' + Date.now();
    await setDoc(doc(db, 'books', bookId), {
      title: book.title,
      author: book.author,
      category: book.category,
      quantity: parseInt(book.quantity),
      available: parseInt(book.quantity),
      coverUrl: book.cover || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    await window.LibraryApp.logActivity('book_add', `Added book "${book.title}" by ${book.author} to inventory.`);
    alert("Added Successfully");

    window.closeModal('book-modal');
    resetBookForm();
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'books');
  }
};

window.LibraryApp.updateBook = async function(id, book) {
  try {
    const bookRef = doc(db, 'books', id);
    const existing = window.LibraryApp.books.find(b => b.id === id);
    let newAvailable = parseInt(book.quantity);
    if (existing) {
      const qtyDiff = parseInt(book.quantity) - parseInt(existing.quantity || 0);
      newAvailable = parseInt(existing.available || 0) + qtyDiff;
      if (newAvailable < 0) newAvailable = 0;
    }

    await updateDoc(bookRef, {
      title: book.title,
      author: book.author,
      category: book.category,
      quantity: parseInt(book.quantity),
      available: newAvailable,
      coverUrl: book.cover || '',
      updatedAt: new Date().toISOString()
    });

    await window.LibraryApp.logActivity('book_edit', `Updated inventory book "${book.title}" details.`);
    alert("Updated Successfully");

    window.closeModal('book-modal');
    resetBookForm();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `books/${id}`);
  }
};

window.LibraryApp.deleteBook = async function(id) {
  const book = window.LibraryApp.books.find(b => b.id === id);
  if (!book) return;

  const activeLoans = window.LibraryApp.issuedBooks.some(loan => loan.bookId === id && loan.status === 'Issued');
  if (activeLoans) {
    alert(`Cannot delete book "${book.title}" because it has active outstanding loans. Please return issued copies first.`);
    return;
  }

  if (confirm(`Are you absolutely sure you want to delete "${book.title}" from the library?`)) {
    try {
      await deleteDoc(doc(db, 'books', id));
      await window.LibraryApp.logActivity('book_delete', `Removed book "${book.title}" from inventory.`);
      alert("Deleted Successfully");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `books/${id}`);
    }
  }
};

// Opens Edit Book Modal prefilled with data
function openEditModal(book) {
  resetBookForm();
  document.getElementById('book-edit-id').value = book.id;
  document.getElementById('book-title').value = book.title;
  document.getElementById('book-author').value = book.author;
  document.getElementById('book-category').value = book.category;
  document.getElementById('book-quantity').value = book.quantity;
  document.getElementById('book-cover').value = book.cover;

  document.getElementById('book-modal-title').textContent = 'Edit Book Details';
  window.openModal('book-modal');
}

// Synchronizes the category selects
function refreshCategoryDropdowns(categories) {
  const filterSelect = document.getElementById('book-category-filter');
  const modalSelect = document.getElementById('book-category');

  if (!filterSelect || !modalSelect) return;

  // Preserve current selections
  const currentFilter = filterSelect.value;
  const currentModalVal = modalSelect.value;

  // Clear selections
  filterSelect.innerHTML = '<option value="All">All Categories</option>';
  modalSelect.innerHTML = '<option value="">-- Select Category --</option>';

  categories.forEach(cat => {
    const optionHTML = `<option value="${escapeHTML(cat.name)}">${escapeHTML(cat.name)}</option>`;
    filterSelect.insertAdjacentHTML('beforeend', optionHTML);
    modalSelect.insertAdjacentHTML('beforeend', optionHTML);
  });

  // Re-apply values if they still exist
  if (categories.some(c => c.name === currentFilter)) {
    filterSelect.value = currentFilter;
  }
  if (categories.some(c => c.name === currentModalVal)) {
    modalSelect.value = currentModalVal;
  }
}

// Escapes values for safe UI output
function escapeHTML(str) {
  if (!str) return '';
  return str.toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
