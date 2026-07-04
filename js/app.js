/**
 * Core Application Coordinator for Library Management Portal
 * Handles SPA navigation, Firestore real-time collection streams, and database seeding.
 */

import { 
  db, 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  addDoc,
  getDocs, 
  handleFirestoreError, 
  OperationType 
} from './firebase.js';

// Global App namespace for state management and Firebase synchronization
window.LibraryApp = {
  // Real-time replicated databases
  books: [],
  students: [],
  categories: [],
  issuedBooks: [],
  notices: [],
  activities: [],

  currentTab: 'nav-dashboard',

  // Log new recent activity to Firestore
  async logActivity(type, text) {
    try {
      await addDoc(collection(db, 'activities'), {
        type: type, // 'book_add', 'book_edit', 'book_delete', 'student_add', 'issue', 'return', etc.
        text: text,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Failed to log activity to Firestore:", error);
    }
  }
};

// Seeding Initial Realistic Data directly to Firestore if collections are empty
async function seedDatabase() {
  try {
    const booksSnap = await getDocs(collection(db, 'books'));
    if (booksSnap.empty) {
      console.log("Firestore collections are empty. Beginning one-time seeding...");

      const seededCategories = [
        { id: 'cat-1', name: 'Fiction', description: 'Novels, literature and creative storytelling narratives.' },
        { id: 'cat-2', name: 'Science & Math', description: 'Scientific journals, physics, chemistry, biology and mathematical guides.' },
        { id: 'cat-3', name: 'History & Biography', description: 'World history records, historical event accounts and personal memoirs.' },
        { id: 'cat-4', name: 'Technology & Programming', description: 'Software engineering, design patterns, computer architecture and programming handbooks.' }
      ];

      const seededBooks = [
        { id: 'book-1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', category: 'Fiction', quantity: 5, available: 4, coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=120&auto=format&fit=crop&q=80' },
        { id: 'book-2', title: 'A Brief History of Time', author: 'Stephen Hawking', category: 'Science & Math', quantity: 3, available: 3, coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=120&auto=format&fit=crop&q=80' },
        { id: 'book-3', title: 'Sapiens: A Brief History of Humankind', author: 'Yuval Noah Harari', category: 'History & Biography', quantity: 4, available: 2, coverUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=120&auto=format&fit=crop&q=80' },
        { id: 'book-4', title: 'Clean Code: A Handbook of Agile Software Craftsmanship', author: 'Robert C. Martin', category: 'Technology & Programming', quantity: 6, available: 6, coverUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=120&auto=format&fit=crop&q=80' }
      ];

      const seededStudents = [
        { id: 'STU-101', name: 'Alice Johnson', email: 'alice.j@university.edu', phone: '+1 555-0145', membershipDate: '2025-01-15', status: 'Active' },
        { id: 'STU-102', name: 'Bob Smith', email: 'bob.smith@university.edu', phone: '+1 555-0182', membershipDate: '2025-02-20', status: 'Active' },
        { id: 'STU-103', name: 'Charlie Brown', email: 'charlie.b@university.edu', phone: '+1 555-0199', membershipDate: '2025-03-10', status: 'Inactive' }
      ];

      const seededIssuedBooks = [
        { id: 'LOAN-1', studentId: 'STU-101', studentName: 'Alice Johnson', bookId: 'book-1', bookTitle: 'The Great Gatsby', issueDate: '2026-06-25', returnDate: '2026-07-10', status: 'Issued', remarks: 'Needs to be returned prior to summer holidays.' },
        { id: 'LOAN-2', studentId: 'STU-102', studentName: 'Bob Smith', bookId: 'book-3', bookTitle: 'Sapiens: A Brief History of Humankind', issueDate: '2026-06-20', returnDate: '2026-07-05', status: 'Issued', remarks: 'Using for World Civilizations term paper.' },
        { id: 'LOAN-3', studentId: 'STU-102', studentName: 'Bob Smith', bookId: 'book-3', bookTitle: 'Sapiens: A Brief History of Humankind', issueDate: '2026-06-01', returnDate: '2026-06-15', status: 'Returned', remarks: 'Returned on-time in pristine condition.' }
      ];

      const seededNotices = [
        { id: 'not-1', title: 'Annual Library Inventory Auditing', date: '2026-07-10', priority: 'High', status: 'Active', description: 'The central archive and library floor will be closed to students on July 15th for our annual library inventory audit. Please ensure all outstanding overdue books are returned before this date.' },
        { id: 'not-2', title: 'New Programming Collection Now Available', date: '2026-06-28', priority: 'Medium', status: 'Active', description: 'We have added more than 50 new books focusing on full-stack development, distributed databases, cloud architecture, and modern Artificial Intelligence libraries. Visit the Technology aisle to check them out!' }
      ];

      const seededActivities = [
        { id: 'ACT-1', type: 'issue', text: "Issued 'The Great Gatsby' to Alice Johnson", timestamp: '2026-06-25T14:30:00.000Z' },
        { id: 'ACT-2', type: 'issue', text: "Issued 'Sapiens: A Brief History of Humankind' to Bob Smith", timestamp: '2026-06-20T10:15:00.000Z' },
        { id: 'ACT-3', type: 'return', text: "Bob Smith returned 'Sapiens: A Brief History of Humankind'", timestamp: '2026-06-15T09:00:00.000Z' },
        { id: 'ACT-4', type: 'student_add', text: 'Registered student Bob Smith', timestamp: '2025-02-20T11:45:00.000Z' },
        { id: 'ACT-5', type: 'student_add', text: 'Registered student Alice Johnson', timestamp: '2025-01-15T15:20:00.000Z' }
      ];

      for (const cat of seededCategories) {
        await setDoc(doc(db, 'categories', cat.id), {
          name: cat.name,
          description: cat.description,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      for (const book of seededBooks) {
        await setDoc(doc(db, 'books', book.id), {
          title: book.title,
          author: book.author,
          category: book.category,
          quantity: book.quantity,
          available: book.available,
          coverUrl: book.coverUrl,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      for (const student of seededStudents) {
        await setDoc(doc(db, 'students', student.id), {
          name: student.name,
          email: student.email,
          phone: student.phone,
          membershipDate: student.membershipDate,
          status: student.status,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      for (const notice of seededNotices) {
        await setDoc(doc(db, 'notices', notice.id), {
          title: notice.title,
          description: notice.description,
          priority: notice.priority,
          status: notice.status,
          date: notice.date,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      for (const loan of seededIssuedBooks) {
        await setDoc(doc(db, 'issuedBooks', loan.id), {
          studentId: loan.studentId,
          studentName: loan.studentName,
          bookId: loan.bookId,
          bookTitle: loan.bookTitle,
          issueDate: loan.issueDate,
          returnDate: loan.returnDate,
          status: loan.status,
          remarks: loan.remarks || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      for (const act of seededActivities) {
        await setDoc(doc(db, 'activities', act.id), {
          type: act.type,
          text: act.text,
          timestamp: act.timestamp,
          createdAt: act.timestamp
        });
      }

      console.log("Firestore seeding successfully finished.");
    }
  } catch (error) {
    console.error("Seeding operation failed:", error);
  }
}

// Set up single-page routing
function setupNavigation() {
  const navLinks = {
    'nav-dashboard': 'dashboard-section',
    'nav-books': 'books-section',
    'nav-students': 'students-section',
    'nav-categories': 'categories-section',
    'nav-issue': 'issue-section',
    'nav-notices': 'notices-section'
  };

  const navMenu = document.getElementById('nav-menu');
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  const pageTitle = document.getElementById('page-title');

  Object.keys(navLinks).forEach(linkId => {
    const linkElement = document.getElementById(linkId);
    if (linkElement) {
      linkElement.addEventListener('click', (e) => {
        e.preventDefault();

        // 1. Update Navigation Links Styling
        navMenu.querySelectorAll('a').forEach(lnk => {
          lnk.className = "flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-sm";
        });
        linkElement.className = "flex items-center gap-3 px-4 py-3 bg-indigo-600 text-white rounded-lg transition-colors text-sm font-medium";

        // 2. Hide all sections and show active one
        Object.values(navLinks).forEach(sectionId => {
          const section = document.getElementById(sectionId);
          if (section) section.classList.add('hidden');
        });
        const activeSection = document.getElementById(navLinks[linkId]);
        if (activeSection) activeSection.classList.remove('hidden');

        // 3. Update top page title
        const textLabel = linkElement.querySelector('span').textContent;
        pageTitle.textContent = textLabel;

        // 4. Update the tracker and trigger relative data loading functions
        window.LibraryApp.currentTab = linkId;
        triggerPageLoad(linkId);

        // 5. Hide sidebar on mobile if open
        sidebar.classList.add('-translate-x-full');
        backdrop.classList.add('hidden');
      });
    }
  });

  // Mobile Hamburger Toggle
  const sidebarToggle = document.getElementById('sidebar-toggle');
  if (sidebarToggle && sidebar && backdrop) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.remove('-translate-x-full');
      backdrop.classList.remove('hidden');
    });

    backdrop.addEventListener('click', () => {
      sidebar.classList.add('-translate-x-full');
      backdrop.classList.add('hidden');
    });
  }
}

// Triggers the respective load functions for active views
function triggerPageLoad(linkId) {
  switch (linkId) {
    case 'nav-dashboard':
      if (typeof window.LibraryApp.loadDashboard === 'function') {
        window.LibraryApp.loadDashboard();
      }
      break;
    case 'nav-books':
      if (typeof window.LibraryApp.loadBooks === 'function') {
        window.LibraryApp.loadBooks();
      }
      break;
    case 'nav-students':
      if (typeof window.LibraryApp.loadStudents === 'function') {
        window.LibraryApp.loadStudents();
      }
      break;
    case 'nav-categories':
      if (typeof window.LibraryApp.loadCategories === 'function') {
        window.LibraryApp.loadCategories();
      }
      break;
    case 'nav-issue':
      if (typeof window.LibraryApp.loadIssuePage === 'function') {
        window.LibraryApp.loadIssuePage();
      }
      break;
    case 'nav-notices':
      if (typeof window.LibraryApp.loadNotices === 'function') {
        window.LibraryApp.loadNotices();
      }
      break;
  }
}

// Global modal helpers attached to window for easy inline access (e.g., Close button onclick)
window.openModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
    document.body.classList.add('modal-active');
  }
};

window.closeModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('hidden');
    document.body.classList.remove('modal-active');
  }
};

// Application Bootstrap
document.addEventListener('DOMContentLoaded', async () => {
  // Ensure we seed Firestore first if it's empty
  await seedDatabase();

  // Setup SPA Routing Navigation
  setupNavigation();

  // Load the modules asynchronously to register the page-specific functions
  await Promise.all([
    import('./dashboard.js'),
    import('./books.js'),
    import('./students.js'),
    import('./categories.js'),
    import('./issue.js'),
    import('./notices.js')
  ]);

  // Set up listeners to auto-populate window.LibraryApp and reload the UI reactively
  const collections = ['books', 'students', 'categories', 'issuedBooks', 'notices', 'activities'];
  collections.forEach(colName => {
    onSnapshot(collection(db, colName), (snapshot) => {
      const list = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        list.push({ id: docSnap.id, ...data });
      });

      // Maintain specific orderings if necessary
      if (colName === 'activities') {
        list.sort((a, b) => new Date(b.createdAt || b.timestamp) - new Date(a.createdAt || a.timestamp));
      }

      window.LibraryApp[colName] = list;

      // Reload active view automatically
      triggerPageLoad(window.LibraryApp.currentTab);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, colName);
    });
  });

  // Initial load of the dashboard
  if (typeof window.LibraryApp.loadDashboard === 'function') {
    window.LibraryApp.loadDashboard();
  }
});
