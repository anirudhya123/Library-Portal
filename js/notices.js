/**
 * Notices Module for Library Management Portal
 * Handles Notice board announcements, priority formatting, and CRUD bulletin editing.
 */

function initNotices() {
  const btnAddNotice = document.getElementById('btn-add-notice');
  const noticeForm = document.getElementById('notice-form');

  // Open Notice modal in "Add Notice" mode
  if (btnAddNotice) {
    btnAddNotice.addEventListener('click', () => {
      resetNoticeForm();
      document.getElementById('notice-modal-title').textContent = 'Add Notice Bulletin';
      window.openModal('notice-modal');
    });
  }

  // Handle Form Submission
  if (noticeForm) {
    noticeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleNoticeSubmit();
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNotices);
} else {
  initNotices();
}

// Clears notice form inputs and hides validation messages
function resetNoticeForm() {
  const form = document.getElementById('notice-form');
  if (form) form.reset();
  document.getElementById('notice-edit-id').value = '';

  const errors = ['error-notice-title', 'error-notice-description'];
  errors.forEach(errId => {
    const elem = document.getElementById(errId);
    if (elem) elem.classList.add('hidden');
  });
}

// Submits the Notice Bulletin form
function handleNoticeSubmit() {
  const editId = document.getElementById('notice-edit-id').value;
  const titleInput = document.getElementById('notice-title');
  const descInput = document.getElementById('notice-description');
  const prioritySelect = document.getElementById('notice-priority');
  const statusSelect = document.getElementById('notice-status');

  let isValid = true;

  if (!titleInput.value.trim()) {
    document.getElementById('error-notice-title').classList.remove('hidden');
    isValid = false;
  } else {
    document.getElementById('error-notice-title').classList.add('hidden');
  }

  if (!descInput.value.trim()) {
    document.getElementById('error-notice-description').classList.remove('hidden');
    isValid = false;
  } else {
    document.getElementById('error-notice-description').classList.add('hidden');
  }

  if (!isValid) return;

  const noticeData = {
    title: titleInput.value.trim(),
    description: descInput.value.trim(),
    priority: prioritySelect.value,
    status: statusSelect.value,
    date: new Date().toISOString().split('T')[0] // Automatically stamp with current date
  };

  if (editId) {
    window.LibraryApp.updateNotice(editId, noticeData);
  } else {
    window.LibraryApp.addNotice(noticeData);
  }
}

// ----------------------------------------------------
// Placeholder CRUD Functions (Firebase-Ready Setup)
// ----------------------------------------------------

window.LibraryApp.loadNotices = function() {
  // --- Firebase Integration Here ---
  // Subscriptions or queries to load active notice bulletin collections:
  // db.collection("notices").orderBy("date", "desc").onSnapshot(snapshot => { ... })

  const notices = window.LibraryApp.notices || [];
  const tbody = document.getElementById('notices-tbody');

  if (!tbody) return;

  tbody.innerHTML = '';

  if (notices.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="px-6 py-10 text-center text-slate-400 font-medium">
          No announcements listed on the notice board.
        </td>
      </tr>
    `;
    return;
  }

  notices.forEach(not => {
    const row = document.createElement('tr');
    row.className = "hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0 text-sm";

    // Dynamic priority styling
    let priorityBadge = '';
    const pri = not.priority || 'Low';
    if (pri === 'High') {
      priorityBadge = `<span class="bg-rose-50 text-rose-700 text-xs font-bold px-2.5 py-1 rounded-md border border-rose-100">High Priority</span>`;
    } else if (pri === 'Medium') {
      priorityBadge = `<span class="bg-amber-50 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-md border border-amber-100">Medium</span>`;
    } else {
      priorityBadge = `<span class="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-md border border-slate-200">Low</span>`;
    }

    // Dynamic status styling
    const isActive = not.status === 'Active';
    const statusBadge = isActive
      ? `<span class="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-md border border-emerald-100">Active</span>`
      : `<span class="bg-slate-50 text-slate-400 text-xs font-bold px-2.5 py-1 rounded-md border border-slate-100">Expired</span>`;

    row.innerHTML = `
      <td class="px-6 py-4.5">
        <p class="font-bold text-slate-900 leading-tight">${escapeHTML(not.title)}</p>
        <p class="text-xs text-slate-500 mt-1 leading-relaxed max-w-xl">${escapeHTML(not.description)}</p>
      </td>
      <td class="px-6 py-4.5 text-slate-500 font-medium whitespace-nowrap">${not.date}</td>
      <td class="px-6 py-4.5 whitespace-nowrap">${priorityBadge}</td>
      <td class="px-6 py-4.5 whitespace-nowrap">${statusBadge}</td>
      <td class="px-6 py-4.5 whitespace-nowrap text-right">
        <div class="flex items-center justify-end gap-2">
          <!-- Edit button -->
          <button id="btn-edit-notice-${not.id}" class="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 p-2 rounded-lg transition-colors cursor-pointer" title="Edit Announcement">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
          </button>
          <!-- Delete button -->
          <button id="btn-delete-notice-${not.id}" class="text-rose-600 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 p-2 rounded-lg transition-colors cursor-pointer" title="Delete Announcement">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(row);

    // Event hooks
    document.getElementById(`btn-edit-notice-${not.id}`).addEventListener('click', () => {
      openEditNoticeModal(not);
    });

    document.getElementById(`btn-delete-notice-${not.id}`).addEventListener('click', () => {
      window.LibraryApp.deleteNotice(not.id);
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

window.LibraryApp.addNotice = async function(notice) {
  try {
    const noticeId = 'not-' + Date.now();
    await setDoc(doc(db, 'notices', noticeId), {
      title: notice.title,
      description: notice.description,
      priority: notice.priority,
      status: notice.status,
      date: notice.date,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    await window.LibraryApp.logActivity('notice_add', `Published new notice "${notice.title}".`);
    alert("Added Successfully");

    window.closeModal('notice-modal');
    resetNoticeForm();
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'notices');
  }
};

window.LibraryApp.updateNotice = async function(id, notice) {
  try {
    const noticeRef = doc(db, 'notices', id);
    await updateDoc(noticeRef, {
      title: notice.title,
      description: notice.description,
      priority: notice.priority,
      status: notice.status,
      updatedAt: new Date().toISOString()
    });

    await window.LibraryApp.logActivity('notice_edit', `Modified notice board announcement "${notice.title}".`);
    alert("Updated Successfully");

    window.closeModal('notice-modal');
    resetNoticeForm();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `notices/${id}`);
  }
};

window.LibraryApp.deleteNotice = async function(id) {
  const notice = window.LibraryApp.notices.find(n => n.id === id);
  if (!notice) return;

  if (confirm(`Are you sure you want to remove notice "${notice.title}" from the board?`)) {
    try {
      await deleteDoc(doc(db, 'notices', id));
      await window.LibraryApp.logActivity('notice_delete', `Removed notice bulletin "${notice.title}".`);
      alert("Deleted Successfully");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `notices/${id}`);
    }
  }
};

// Prefills and displays Edit Notice Modal
function openEditNoticeModal(not) {
  resetNoticeForm();
  document.getElementById('notice-edit-id').value = not.id;
  document.getElementById('notice-title').value = not.title;
  document.getElementById('notice-description').value = not.description;
  document.getElementById('notice-priority').value = not.priority;
  document.getElementById('notice-status').value = not.status;

  document.getElementById('notice-modal-title').textContent = 'Edit Notice Bulletin';
  window.openModal('notice-modal');
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
