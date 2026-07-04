/**
 * Students Module for Library Management Portal
 * Handles Student lists, live search, student CRUD, and registration.
 */

// Initialize Student Page Events
function initStudents() {
  const btnAddStudent = document.getElementById('btn-add-student');
  const studentForm = document.getElementById('student-form');
  const studentSearch = document.getElementById('student-search');

  // Open modal in "Add Student" mode
  if (btnAddStudent) {
    btnAddStudent.addEventListener('click', () => {
      resetStudentForm();
      document.getElementById('student-modal-title').textContent = 'Add New Student';
      
      // Auto-set membership date to current date for ease of use
      const dateInput = document.getElementById('student-member-date');
      if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
      }
      
      window.openModal('student-modal');
    });
  }

  // Handle Form Submission (Add / Edit)
  if (studentForm) {
    studentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleStudentSubmit();
    });
  }

  // Live search keypress
  if (studentSearch) {
    studentSearch.addEventListener('input', () => {
      window.LibraryApp.loadStudents();
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStudents);
} else {
  initStudents();
}

// Clears form fields and resets error highlights
function resetStudentForm() {
  const form = document.getElementById('student-form');
  if (form) form.reset();
  document.getElementById('student-edit-id').value = '';

  const errors = ['error-student-name', 'error-student-email', 'error-student-phone', 'error-student-date'];
  errors.forEach(errId => {
    const elem = document.getElementById(errId);
    if (elem) elem.classList.add('hidden');
  });
}

// Submits the Student form
function handleStudentSubmit() {
  const editId = document.getElementById('student-edit-id').value;
  const nameInput = document.getElementById('student-name');
  const emailInput = document.getElementById('student-email');
  const phoneInput = document.getElementById('student-phone');
  const dateInput = document.getElementById('student-member-date');
  const statusSelect = document.getElementById('student-status');

  let isValid = true;

  if (!nameInput.value.trim()) {
    document.getElementById('error-student-name').classList.remove('hidden');
    isValid = false;
  } else {
    document.getElementById('error-student-name').classList.add('hidden');
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailInput.value.trim() || !emailPattern.test(emailInput.value.trim())) {
    document.getElementById('error-student-email').classList.remove('hidden');
    isValid = false;
  } else {
    document.getElementById('error-student-email').classList.add('hidden');
  }

  if (!phoneInput.value.trim()) {
    document.getElementById('error-student-phone').classList.remove('hidden');
    isValid = false;
  } else {
    document.getElementById('error-student-phone').classList.add('hidden');
  }

  if (!dateInput.value) {
    document.getElementById('error-student-date').classList.remove('hidden');
    isValid = false;
  } else {
    document.getElementById('error-student-date').classList.add('hidden');
  }

  if (!isValid) return;

  const studentData = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    phone: phoneInput.value.trim(),
    membershipDate: dateInput.value,
    status: statusSelect.value
  };

  if (editId) {
    // Edit Mode
    window.LibraryApp.updateStudent(editId, studentData);
  } else {
    // Add Mode
    window.LibraryApp.addStudent(studentData);
  }
}

// Generates next incremental student ID
function generateStudentID() {
  const students = window.LibraryApp.students || [];
  let maxIdNum = 100;
  
  students.forEach(s => {
    const match = s.id.match(/^STU-(\d+)$/);
    if (match) {
      const num = parseInt(match[1]);
      if (num > maxIdNum) maxIdNum = num;
    }
  });

  return `STU-${maxIdNum + 1}`;
}

// ----------------------------------------------------
// Placeholder CRUD Functions (Firebase-Ready Setup)
// ----------------------------------------------------

window.LibraryApp.loadStudents = function() {
  // --- Firebase Integration Here ---
  // Subscriptions or server queries for students collection would be added here:
  // db.collection("students").onSnapshot(snapshot => { ... })

  const students = window.LibraryApp.students || [];
  const searchVal = (document.getElementById('student-search')?.value || '').toLowerCase();

  const filteredStudents = students.filter(s => {
    return s.id.toLowerCase().includes(searchVal) ||
           s.name.toLowerCase().includes(searchVal) ||
           s.email.toLowerCase().includes(searchVal) ||
           s.phone.includes(searchVal);
  });

  const tbody = document.getElementById('students-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (filteredStudents.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="px-6 py-10 text-center text-slate-400 font-medium">
          No students found matching search.
        </td>
      </tr>
    `;
    return;
  }

  filteredStudents.forEach(stu => {
    const row = document.createElement('tr');
    row.className = "hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0 text-sm";

    const isAmtActive = stu.status === 'Active';
    const statusBadge = isAmtActive
      ? `<span class="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-md border border-emerald-100">Active</span>`
      : `<span class="bg-rose-50 text-rose-700 text-xs font-bold px-2.5 py-1 rounded-md border border-rose-100">Inactive</span>`;

    row.innerHTML = `
      <td class="px-6 py-4.5 font-mono text-xs font-bold text-slate-500 whitespace-nowrap">${stu.id}</td>
      <td class="px-6 py-4.5 font-semibold text-slate-900">${escapeHTML(stu.name)}</td>
      <td class="px-6 py-4.5 text-slate-600 font-medium whitespace-nowrap">${escapeHTML(stu.email)}</td>
      <td class="px-6 py-4.5 text-slate-600 font-medium whitespace-nowrap">${escapeHTML(stu.phone)}</td>
      <td class="px-6 py-4.5 text-slate-500 whitespace-nowrap">${stu.membershipDate}</td>
      <td class="px-6 py-4.5 whitespace-nowrap">${statusBadge}</td>
      <td class="px-6 py-4.5 whitespace-nowrap text-right">
        <div class="flex items-center justify-end gap-2">
          <!-- Edit button -->
          <button id="btn-edit-student-${stu.id}" class="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 p-2 rounded-lg transition-colors cursor-pointer" title="Edit Student">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
          </button>
          <!-- Delete button -->
          <button id="btn-delete-student-${stu.id}" class="text-rose-600 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 p-2 rounded-lg transition-colors cursor-pointer" title="Delete Student">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(row);

    // Click events
    document.getElementById(`btn-edit-student-${stu.id}`).addEventListener('click', () => {
      openEditStudentModal(stu);
    });

    document.getElementById(`btn-delete-student-${stu.id}`).addEventListener('click', () => {
      window.LibraryApp.deleteStudent(stu.id);
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

window.LibraryApp.addStudent = async function(student) {
  try {
    const studentId = generateStudentID();
    await setDoc(doc(db, 'students', studentId), {
      name: student.name,
      email: student.email,
      phone: student.phone,
      membershipDate: student.membershipDate,
      status: student.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    await window.LibraryApp.logActivity('student_add', `Registered new student "${student.name}" (ID: ${studentId}).`);
    alert("Added Successfully");

    window.closeModal('student-modal');
    resetStudentForm();
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'students');
  }
};

window.LibraryApp.updateStudent = async function(id, student) {
  try {
    const studentRef = doc(db, 'students', id);
    await updateDoc(studentRef, {
      name: student.name,
      email: student.email,
      phone: student.phone,
      membershipDate: student.membershipDate,
      status: student.status,
      updatedAt: new Date().toISOString()
    });

    await window.LibraryApp.logActivity('student_edit', `Updated details for student "${student.name}" (${id}).`);
    alert("Updated Successfully");

    window.closeModal('student-modal');
    resetStudentForm();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `students/${id}`);
  }
};

window.LibraryApp.deleteStudent = async function(id) {
  const student = window.LibraryApp.students.find(s => s.id === id);
  if (!student) return;

  const activeLoans = window.LibraryApp.issuedBooks.some(loan => loan.studentId === id && loan.status === 'Issued');
  if (activeLoans) {
    alert(`Cannot remove student "${student.name}" because they currently have books issued out. All books must be returned first.`);
    return;
  }

  if (confirm(`Are you sure you want to delete the profile for student "${student.name}" (${id})?`)) {
    try {
      await deleteDoc(doc(db, 'students', id));
      await window.LibraryApp.logActivity('student_delete', `Deleted student profile for "${student.name}" (${id}).`);
      alert("Deleted Successfully");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `students/${id}`);
    }
  }
};

// Prefills and displays Edit Student Modal
function openEditStudentModal(stu) {
  resetStudentForm();
  document.getElementById('student-edit-id').value = stu.id;
  document.getElementById('student-name').value = stu.name;
  document.getElementById('student-email').value = stu.email;
  document.getElementById('student-phone').value = stu.phone;
  document.getElementById('student-member-date').value = stu.membershipDate;
  document.getElementById('student-status').value = stu.status;

  document.getElementById('student-modal-title').textContent = 'Edit Student Profile';
  window.openModal('student-modal');
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
