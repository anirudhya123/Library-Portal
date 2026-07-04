/**
 * Issue Books Module for Library Management Portal
 * Handles lending forms, dynamic dropdowns, return transactions, and loan detail views.
 */

function initIssue() {
  const issueForm = document.getElementById('issue-form');
  const btnReset = document.getElementById('btn-issue-reset');

  // Handle Book Issuing Form Submission
  if (issueForm) {
    issueForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleIssueSubmit();
    });
  }

  // Handle Form Reset
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      resetIssueForm();
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initIssue);
} else {
  initIssue();
}

// Sets default date limits and clears values
function resetIssueForm() {
  const form = document.getElementById('issue-form');
  if (form) form.reset();

  // Set default loan dates
  const issueDateInput = document.getElementById('issue-date');
  const returnDateInput = document.getElementById('issue-return-date');

  if (issueDateInput && returnDateInput) {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Default return limit to exactly 14 days later (standard library loan)
    const returnLimit = new Date();
    returnLimit.setDate(today.getDate() + 14);
    const returnLimitStr = returnLimit.toISOString().split('T')[0];

    issueDateInput.value = todayStr;
    returnDateInput.value = returnLimitStr;
  }

  // Hide validation errors
  const errors = ['error-issue-student', 'error-issue-book', 'error-issue-date', 'error-return-date'];
  errors.forEach(errId => {
    const elem = document.getElementById(errId);
    if (elem) elem.classList.add('hidden');
  });
}

// Submits the book issuing transaction
function handleIssueSubmit() {
  const studentSelect = document.getElementById('issue-student');
  const bookSelect = document.getElementById('issue-book');
  const issueDateInput = document.getElementById('issue-date');
  const returnDateInput = document.getElementById('issue-return-date');
  const remarksInput = document.getElementById('issue-remarks');

  let isValid = true;

  if (!studentSelect.value) {
    document.getElementById('error-issue-student').classList.remove('hidden');
    isValid = false;
  } else {
    document.getElementById('error-issue-student').classList.add('hidden');
  }

  if (!bookSelect.value) {
    document.getElementById('error-issue-book').classList.remove('hidden');
    isValid = false;
  } else {
    document.getElementById('error-issue-book').classList.add('hidden');
  }

  if (!issueDateInput.value) {
    document.getElementById('error-issue-date').classList.remove('hidden');
    isValid = false;
  } else {
    document.getElementById('error-issue-date').classList.add('hidden');
  }

  if (!returnDateInput.value) {
    document.getElementById('error-return-date').classList.remove('hidden');
    isValid = false;
  } else {
    document.getElementById('error-return-date').classList.add('hidden');
  }

  // Cross-date checking (Return cannot be before Issue)
  if (issueDateInput.value && returnDateInput.value) {
    const issueDate = new Date(issueDateInput.value);
    const returnDate = new Date(returnDateInput.value);
    if (returnDate < issueDate) {
      alert("Error: Return date cannot be prior to the issue date!");
      isValid = false;
    }
  }

  if (!isValid) return;

  const loanData = {
    studentId: studentSelect.value,
    bookId: bookSelect.value,
    issueDate: issueDateInput.value,
    returnDate: returnDateInput.value,
    remarks: remarksInput.value.trim()
  };

  window.LibraryApp.issueBook(loanData);
  resetIssueForm();
}

// ----------------------------------------------------
// Placeholder CRUD Functions (Firebase-Ready Setup)
// ----------------------------------------------------

window.LibraryApp.loadIssuePage = function() {
  // --- Firebase Integration Here ---
  // Subscriptions or queries to load books, students, and active loans
  // db.collection("loans").onSnapshot(snapshot => { ... })

  const students = window.LibraryApp.students || [];
  const books = window.LibraryApp.books || [];
  const issuedBooks = window.LibraryApp.issuedBooks || [];

  const studentSelect = document.getElementById('issue-student');
  const bookSelect = document.getElementById('issue-book');
  const tbody = document.getElementById('issued-books-tbody');

  // 1. Populate Active Students select
  if (studentSelect) {
    const currentStudentVal = studentSelect.value;
    studentSelect.innerHTML = '<option value="">-- Choose a Student --</option>';

    // Load only Active students to prevent inactive accounts from issuing books
    const activeStudents = students.filter(s => s.status === 'Active');
    activeStudents.forEach(stu => {
      studentSelect.insertAdjacentHTML('beforeend', `<option value="${stu.id}">${escapeHTML(stu.name)} (${stu.id})</option>`);
    });
    studentSelect.value = currentStudentVal;
  }

  // 2. Populate Available Books select
  if (bookSelect) {
    const currentBookVal = bookSelect.value;
    bookSelect.innerHTML = '<option value="">-- Choose a Book --</option>';

    // Display only books with at least 1 available copy in stock
    const availableBooks = books.filter(b => b.available > 0);
    availableBooks.forEach(b => {
      bookSelect.insertAdjacentHTML('beforeend', `<option value="${b.id}">${escapeHTML(b.title)} (${b.available} copies available)</option>`);
    });
    bookSelect.value = currentBookVal;
  }

  // 3. Populate Issued Books Table
  if (tbody) {
    tbody.innerHTML = '';

    if (issuedBooks.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="px-6 py-10 text-center text-slate-400 font-medium">
            No library books currently issued out.
          </td>
        </tr>
      `;
      return;
    }

    issuedBooks.forEach(loan => {
      const row = document.createElement('tr');
      row.className = "hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0 text-sm";

      const isIssued = loan.status === 'Issued';
      const statusBadge = isIssued
        ? `<span class="bg-amber-50 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-md border border-amber-100 flex items-center gap-1 w-fit">● Borrowed</span>`
        : `<span class="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-md border border-emerald-100 flex items-center gap-1 w-fit">✓ Returned</span>`;

      // Determine return button visibility
      const returnBtnHTML = isIssued
        ? `<button id="btn-return-loan-${loan.id}" class="text-emerald-600 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer" title="Return Book">
             Return
           </button>`
        : `<span class="text-xs text-slate-400 font-semibold px-2.5 py-1.5">Completed</span>`;

      row.innerHTML = `
        <td class="px-6 py-4">
          <p class="font-bold text-slate-900">${escapeHTML(loan.studentName)}</p>
          <p class="text-xs font-mono text-slate-400 mt-0.5">${loan.studentId}</p>
        </td>
        <td class="px-6 py-4 font-semibold text-slate-700 leading-tight">${escapeHTML(loan.bookTitle)}</td>
        <td class="px-6 py-4 text-slate-500 whitespace-nowrap">${loan.issueDate}</td>
        <td class="px-6 py-4 text-slate-500 whitespace-nowrap">${loan.returnDate}</td>
        <td class="px-6 py-4 whitespace-nowrap">${statusBadge}</td>
        <td class="px-6 py-4 whitespace-nowrap text-right">
          <div class="flex items-center justify-end gap-2.5">
            ${returnBtnHTML}
            <button id="btn-view-loan-${loan.id}" class="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer" title="View details">
              View
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(row);

      // Event listeners
      if (isIssued) {
        document.getElementById(`btn-return-loan-${loan.id}`).addEventListener('click', () => {
          window.LibraryApp.returnBook(loan.id);
        });
      }

      document.getElementById(`btn-view-loan-${loan.id}`).addEventListener('click', () => {
        openLoanDetailsModal(loan);
      });
    });
  }
};

import { 
  db, 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  handleFirestoreError, 
  OperationType 
} from './firebase.js';

window.LibraryApp.issueBook = async function(loan) {
  const student = window.LibraryApp.students.find(s => s.id === loan.studentId);
  const book = window.LibraryApp.books.find(b => b.id === loan.bookId);

  if (!student || !book) {
    alert("Error: Invalid student or book selection.");
    return;
  }

  if (book.available < 1) {
    alert(`Error: No copies of "${book.title}" are currently available in library stock.`);
    return;
  }

  try {
    const loanId = 'LOAN-' + Date.now();
    
    // Update book available copies in Firestore
    const bookRef = doc(db, 'books', book.id);
    await updateDoc(bookRef, {
      available: parseInt(book.available) - 1,
      updatedAt: new Date().toISOString()
    });

    // Write issuedBook document
    await setDoc(doc(db, 'issuedBooks', loanId), {
      studentId: student.id,
      studentName: student.name,
      bookId: book.id,
      bookTitle: book.title,
      issueDate: loan.issueDate,
      returnDate: loan.returnDate,
      status: 'Issued',
      remarks: loan.remarks || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    await window.LibraryApp.logActivity('issue', `Issued "${book.title}" to student ${student.name} (${student.id}).`);
    alert("Added Successfully");

    resetIssueForm();
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'issuedBooks');
  }
};

window.LibraryApp.returnBook = async function(id) {
  const loan = window.LibraryApp.issuedBooks.find(l => l.id === id);
  if (!loan) return;

  const book = window.LibraryApp.books.find(b => b.id === loan.bookId);

  try {
    // Update loan status in Firestore
    const loanRef = doc(db, 'issuedBooks', id);
    await updateDoc(loanRef, {
      status: 'Returned',
      updatedAt: new Date().toISOString()
    });

    // Increment available stock of the book in Firestore
    if (book) {
      const bookRef = doc(db, 'books', book.id);
      const newAvailable = parseInt(book.available) < parseInt(book.quantity) 
        ? parseInt(book.available) + 1 
        : parseInt(book.quantity);

      await updateDoc(bookRef, {
        available: newAvailable,
        updatedAt: new Date().toISOString()
      });
    }

    await window.LibraryApp.logActivity('return', `${loan.studentName} returned borrowing of "${loan.bookTitle}".`);
    alert("Updated Successfully");
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `issuedBooks/${id}`);
  }
};

// Open detailed loan model view
function openLoanDetailsModal(loan) {
  const content = document.getElementById('view-issued-content');
  if (!content) return;

  const student = window.LibraryApp.students.find(s => s.id === loan.studentId) || {};
  const book = window.LibraryApp.books.find(b => b.id === loan.bookId) || {};

  // Formulate dynamic HTML to present nice details
  content.innerHTML = `
    <div class="space-y-4">
      <!-- Student info card -->
      <div class="bg-slate-50 p-4 rounded-xl border border-slate-100">
        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">Student Profile</h4>
        <div class="flex items-center gap-3 mt-2.5">
          <div class="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-sm">
            ${student.name ? student.name.substring(0, 2).toUpperCase() : 'ST'}
          </div>
          <div>
            <p class="font-bold text-slate-900">${escapeHTML(loan.studentName)}</p>
            <p class="text-xs text-slate-400 font-mono">${loan.studentId}</p>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2 mt-3.5 text-xs text-slate-500 pt-3 border-t border-slate-200/50">
          <p><strong>Email:</strong> ${escapeHTML(student.email || 'N/A')}</p>
          <p><strong>Phone:</strong> ${escapeHTML(student.phone || 'N/A')}</p>
        </div>
      </div>

      <!-- Book info card -->
      <div class="bg-slate-50 p-4 rounded-xl border border-slate-100">
        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">Book Information</h4>
        <div class="flex items-start gap-3 mt-2.5">
          <img src="${escapeHTML(book.cover)}" class="w-8 h-12 object-cover rounded bg-slate-200" onerror="this.src='https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=120&auto=format&fit=crop&q=80'"/>
          <div>
            <p class="font-bold text-slate-900 leading-tight">${escapeHTML(loan.bookTitle)}</p>
            <p class="text-xs text-slate-400 mt-0.5">Author: ${escapeHTML(book.author || 'N/A')}</p>
            <p class="text-xs text-slate-400">Category: ${escapeHTML(book.category || 'N/A')}</p>
          </div>
        </div>
      </div>

      <!-- Loan dates and status -->
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-indigo-50/50 border border-indigo-100 p-3 rounded-xl">
          <p class="text-xs text-indigo-500 font-semibold">Issued On</p>
          <p class="text-sm font-bold text-indigo-900 mt-0.5">${loan.issueDate}</p>
        </div>
        <div class="bg-rose-50/50 border border-rose-100 p-3 rounded-xl">
          <p class="text-xs text-rose-500 font-semibold">Expected Return</p>
          <p class="text-sm font-bold text-rose-900 mt-0.5">${loan.returnDate}</p>
        </div>
      </div>

      <!-- Remarks section -->
      <div class="space-y-1">
        <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Remarks & Special Notes</p>
        <p class="text-xs text-slate-600 bg-slate-100 p-3 rounded-lg leading-relaxed italic border border-slate-200/50">
          ${escapeHTML(loan.remarks || 'No remarks recorded for this transaction.')}
        </p>
      </div>
    </div>
  `;

  window.openModal('view-issued-modal');
}

// Trigger initial setup on script load to keep default dates in-sync
resetIssueForm();

// Escape values
function escapeHTML(str) {
  if (!str) return '';
  return str.toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
