/**
 * Dashboard Module for Library Management Portal
 * Displays statistic cards and populates the Recent Activity table.
 */

window.LibraryApp.loadDashboard = function() {
  // --- Firebase Integration Here ---
  // In a production environment, you would subscribe to Firestore collection streams (onSnapshot)
  // or run asynchronous queries to retrieve aggregated metrics and logs.
  //
  // Example:
  // db.collection("books").get().then(snap => { ... });

  const books = window.LibraryApp.books || [];
  const students = window.LibraryApp.students || [];
  const issuedBooks = window.LibraryApp.issuedBooks || [];
  const categories = window.LibraryApp.categories || [];
  const activities = (window.LibraryApp.activities || []).slice(0, 10);

  // 1. Calculate and update stats
  // Summing up total quantities for total volumes in library
  const totalVolumes = books.reduce((sum, b) => sum + parseInt(b.quantity || 0), 0);
  const totalStudents = students.length;
  const activeLoans = issuedBooks.filter(loan => loan.status === 'Issued').length;
  const totalCategories = categories.length;

  // Render stats to DOM with proper fallback checks
  const statBooks = document.getElementById('stat-total-books');
  const statStudents = document.getElementById('stat-total-students');
  const statLoans = document.getElementById('stat-active-loans');
  const statCategories = document.getElementById('stat-total-categories');

  if (statBooks) statBooks.textContent = totalVolumes;
  if (statStudents) statStudents.textContent = totalStudents;
  if (statLoans) statLoans.textContent = activeLoans;
  if (statCategories) statCategories.textContent = totalCategories;

  // 2. Populate Recent Activity Table
  const tbody = document.getElementById('recent-activity-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (activities.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="3" class="px-6 py-8 text-center text-slate-400 font-medium">
          No recent activity logged yet.
        </td>
      </tr>
    `;
    return;
  }

  activities.forEach(act => {
    const row = document.createElement('tr');
    row.className = "hover:bg-slate-50/50 transition-colors";

    // Format badge based on action type
    let badgeHTML = '';
    const type = act.type || 'info';

    if (type.includes('issue')) {
      badgeHTML = `<span class="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-amber-100 flex items-center justify-center gap-1 w-fit">Lent Book</span>`;
    } else if (type.includes('return')) {
      badgeHTML = `<span class="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-emerald-100 flex items-center justify-center gap-1 w-fit">Returned</span>`;
    } else if (type.includes('student')) {
      badgeHTML = `<span class="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-blue-100 flex items-center justify-center gap-1 w-fit">Student</span>`;
    } else if (type.includes('book')) {
      badgeHTML = `<span class="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-indigo-100 flex items-center justify-center gap-1 w-fit">Inventory</span>`;
    } else if (type.includes('category')) {
      badgeHTML = `<span class="bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-rose-100 flex items-center justify-center gap-1 w-fit">Category</span>`;
    } else {
      badgeHTML = `<span class="bg-slate-50 text-slate-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-slate-100 flex items-center justify-center gap-1 w-fit">Notice</span>`;
    }

    // Format relative time or standard date
    const dateStr = formatDateTime(act.timestamp);

    row.innerHTML = `
      <td class="px-6 py-4.5 font-medium text-slate-900 whitespace-nowrap">${badgeHTML}</td>
      <td class="px-6 py-4.5 text-slate-600 font-medium">${escapeHTML(act.text)}</td>
      <td class="px-6 py-4.5 text-slate-400 font-mono text-xs whitespace-nowrap">${dateStr}</td>
    `;
    tbody.appendChild(row);
  });
};

// Simple datetime formatter
function formatDateTime(isoString) {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Just now';
    
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return 'Just now';
  }
}

// Utility to escape HTML and guard against XSS
function escapeHTML(str) {
  if (!str) return '';
  return str.toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
