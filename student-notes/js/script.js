/* =========================================================
   STUDENT NOTES SHARING — MAIN SCRIPT
   ========================================================= */

/* ── Page Loader ── */
window.addEventListener('load', () => {
  const loader = document.getElementById('page-loader');
  if (loader) {
    setTimeout(() => loader.classList.add('hidden'), 500);
  }
});

/* ── Toast System ── */
const ToastManager = {
  container: null,
  init() {
    this.container = document.getElementById('toast-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      document.body.appendChild(this.container);
    }
  },
  show(message, type = 'info', duration = 3500) {
    const icons = { success: '✓', error: '✕', info: 'ℹ' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span class="toast-icon">${icons[type]}</span><span class="toast-text">${message}</span>`;
    this.container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 350);
    }, duration);
  }
};

/* ── Local Storage helpers ── */
const Storage = {
  get: (key, fallback = null) => { try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : fallback; } catch { return fallback; } },
  set: (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} },
  remove: (key) => localStorage.removeItem(key)
};

/* ── Session helpers ── */
const Session = {
  key: 'sn_user',
  get: ()  => Storage.get('sn_user'),
  set: (u) => Storage.set('sn_user', u),
  clear: () => Storage.remove('sn_user'),
  isLoggedIn: () => !!Storage.get('sn_user')
};

/* ── Sample Data ── */
const SampleNotes = [
  { id:1, title:'Introduction to Calculus', subject:'Mathematics', author:'Aarav Sharma', authorInitial:'A', excerpt:'Covers limits, derivatives, and integrals with solved examples and practice problems.', content:'Calculus is the mathematical study of continuous change.\n\n**Limits**: The value a function approaches.\n**Derivatives**: The rate of change of a function.\n**Integrals**: The area under a curve.\n\nFormulas:\n- d/dx(xⁿ) = nxⁿ⁻¹\n- ∫xⁿ dx = xⁿ⁺¹/(n+1) + C\n\nExamples and practice problems follow...', tags:['calculus','math','derivatives'], likes:48, views:312, downloads:28, type:'📄', date:'2 hours ago', fileType:'PDF' },
  { id:2, title:'Organic Chemistry Reactions', subject:'Chemistry', author:'Priya Patel',  authorInitial:'P', excerpt:'Named reactions summary with mechanisms, reagents and conditions for boards and competitive exams.', content:'Key Organic Reactions:\n\n1. Aldol Condensation\n2. Grignard Reaction\n3. Cannizzaro Reaction\n4. Friedel-Crafts Alkylation\n\nEach reaction includes mechanism, reagents, conditions, and product.', tags:['chemistry','organic','reactions'], likes:72, views:489, downloads:41, type:'📊', date:'5 hours ago', fileType:'PDF' },
  { id:3, title:'World War II Timeline', subject:'History', author:'Rohan Singh',   authorInitial:'R', excerpt:'Chronological events from 1939-1945 with key battles, treaties, and turning points.', content:'World War II (1939-1945)\n\nKey Events:\n- Sept 1939: Germany invades Poland\n- June 1941: Operation Barbarossa\n- Dec 1941: Pearl Harbor\n- June 1944: D-Day\n- May 1945: VE Day\n- Aug 1945: Atomic bombs, VJ Day\n\nDetailed analysis of each event...', tags:['history','wwii','timeline'], likes:35, views:198, downloads:19, type:'📝', date:'1 day ago', fileType:'DOCX' },
  { id:4, title:'Python Programming Basics', subject:'Computer Science', author:'Neha Gupta',   authorInitial:'N', excerpt:'Variables, data types, loops, functions, and OOP concepts with code examples for beginners.', content:'Python Fundamentals\n\n# Variables\nname = "Alice"\nage = 20\n\n# Loops\nfor i in range(10):\n    print(i)\n\n# Functions\ndef greet(name):\n    return f"Hello, {name}!"\n\n# Classes\nclass Student:\n    def __init__(self, name):\n        self.name = name', tags:['python','programming','cs'], likes:91, views:674, downloads:63, type:'💻', date:'2 days ago', fileType:'PDF' },
  { id:5, title:'Human Anatomy — Skeletal System', subject:'Biology', author:'Aarav Sharma',  authorInitial:'A', excerpt:'Detailed diagram notes covering 206 bones, joints, and functions of the human skeletal system.', content:'The Human Skeletal System\n\nTotal bones: 206 (adult)\nDivisions:\n- Axial Skeleton: 80 bones (skull, spine, ribs)\n- Appendicular: 126 bones (limbs, girdles)\n\nKey Functions:\n1. Support\n2. Protection\n3. Movement\n4. Mineral storage\n5. Blood cell production', tags:['biology','anatomy','skeletal'], likes:56, views:341, downloads:33, type:'🔬', date:'3 days ago', fileType:'PDF' },
  { id:6, title:'Macroeconomics — GDP & Growth', subject:'Economics', author:'Priya Patel', authorInitial:'P', excerpt:'National income accounting, GDP calculation methods, and economic growth theories explained.', content:'GDP = C + I + G + (X - M)\n\nMethods:\n1. Expenditure Approach\n2. Income Approach\n3. Production Approach\n\nGrowth Theories:\n- Classical Theory\n- Keynesian Theory\n- Solow Model\n\nInflation, unemployment, and fiscal policy...', tags:['economics','gdp','macro'], likes:29, views:187, downloads:15, type:'📈', date:'4 days ago', fileType:'PPT' },
];

const Users = Storage.get('sn_users', [
  { id:1, name:'Aarav Sharma', email:'aarav@example.com', password:'password123', role:'Student', bio:'Engineering student passionate about math & science.', notes:12, likes:340, followers:89 }
]);

/* ── Password strength ── */
function checkPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', '#ff5f57', '#febc2e', '#43a8f0', '#28c840'];
  return { score, label: labels[score] || '', color: colors[score] || '' };
}

/* ═══════════════════════════════════════════════
   PAGE: HOME (index.html)
   ═══════════════════════════════════════════════ */
function initHomePage() {
  /* Animate hero stats */
  const statEls = document.querySelectorAll('.hero-stat-num[data-count]');
  statEls.forEach(el => {
    const target = +el.dataset.count;
    let current = 0;
    const increment = target / 60;
    const timer = setInterval(() => {
      current = Math.min(current + increment, target);
      el.textContent = Math.floor(current).toLocaleString() + (el.dataset.suffix || '');
      if (current >= target) clearInterval(timer);
    }, 20);
  });

  /* Smooth scroll for anchor links */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
    });
  });

  /* Mobile nav */
  const burger = document.querySelector('.burger');
  const mobileMenu = document.querySelector('.mobile-nav');
  if (burger && mobileMenu) {
    burger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
  }

  /* Scroll reveal */
  const reveal = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); reveal.unobserve(e.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.feature-card, .subject-card').forEach(el => {
    el.style.opacity = '0'; el.style.transform = 'translateY(30px)'; el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    reveal.observe(el);
  });
  document.addEventListener('animationstart', (e) => {
    if (e.animationName === 'reveal') e.target.style.opacity = '1';
  });
  // Manual reveal on intersection
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.feature-card, .subject-card').forEach(el => revealObs.observe(el));

  /* Subject card click */
  document.querySelectorAll('.subject-card').forEach(card => {
    card.addEventListener('click', () => {
      const subj = card.querySelector('.subject-name')?.textContent;
      window.location.href = `view.html?subject=${encodeURIComponent(subj)}`;
    });
  });

  /* Check login state for nav */
  updateNavForSession();
}

function updateNavForSession() {
  const user = Session.get();
  const loginBtn = document.getElementById('nav-login-btn');
  const signupBtn = document.getElementById('nav-signup-btn');
  const dashBtn  = document.getElementById('nav-dash-btn');
  if (user) {
    if (loginBtn)  loginBtn.style.display  = 'none';
    if (signupBtn) signupBtn.style.display = 'none';
    if (dashBtn)   dashBtn.style.display   = 'inline-flex';
  }
}

/* ═══════════════════════════════════════════════
   PAGE: LOGIN
   ═══════════════════════════════════════════════ */
function initLoginPage() {
  if (Session.isLoggedIn()) { window.location.href = 'dashboard.html'; return; }
  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email    = form.querySelector('#email').value.trim();
    const password = form.querySelector('#password').value;
    const btn      = form.querySelector('button[type="submit"]');

    if (!email || !password) { ToastManager.show('Please fill in all fields', 'error'); return; }

    btn.disabled = true; btn.textContent = 'Signing in…';

    setTimeout(() => {
      const users = Storage.get('sn_users', []);
      // Include default demo account
      const allUsers = [...Users, ...users.filter(u => !Users.find(d => d.email === u.email))];
      const user = allUsers.find(u => u.email === email && u.password === password);

      if (user) {
        Session.set(user);
        ToastManager.show(`Welcome back, ${user.name}! 🎉`, 'success');
        setTimeout(() => window.location.href = 'dashboard.html', 800);
      } else {
        ToastManager.show('Invalid email or password', 'error');
        btn.disabled = false; btn.textContent = 'Sign In';
      }
    }, 1000);
  });

  /* Demo login shortcut */
  const demoBtn = document.getElementById('demo-login');
  if (demoBtn) {
    demoBtn.addEventListener('click', () => {
      form.querySelector('#email').value    = 'aarav@example.com';
      form.querySelector('#password').value = 'password123';
      ToastManager.show('Demo credentials filled!', 'info');
    });
  }

  /* Toggle password visibility */
  const togglePwd = document.getElementById('toggle-password');
  const pwdInput  = document.getElementById('password');
  if (togglePwd && pwdInput) {
    togglePwd.addEventListener('click', () => {
      const isText = pwdInput.type === 'text';
      pwdInput.type = isText ? 'password' : 'text';
      togglePwd.textContent = isText ? '👁' : '🙈';
    });
  }
}

/* ═══════════════════════════════════════════════
   PAGE: SIGNUP
   ═══════════════════════════════════════════════ */
function initSignupPage() {
  if (Session.isLoggedIn()) { window.location.href = 'dashboard.html'; return; }
  const form = document.getElementById('signup-form');
  if (!form) return;

  /* Password strength meter */
  const pwdInput      = form.querySelector('#password');
  const strengthBars  = document.querySelectorAll('.strength-bar span');
  const strengthText  = document.querySelector('.strength-text');
  if (pwdInput) {
    pwdInput.addEventListener('input', () => {
      const { score, label, color } = checkPasswordStrength(pwdInput.value);
      strengthBars.forEach((bar, i) => { bar.style.background = i < score ? color : ''; });
      if (strengthText) { strengthText.textContent = label; strengthText.style.color = color; }
    });
  }

  /* Toggle password */
  const togglePwd = document.getElementById('toggle-password');
  if (togglePwd && pwdInput) {
    togglePwd.addEventListener('click', () => {
      pwdInput.type = pwdInput.type === 'text' ? 'password' : 'text';
      togglePwd.textContent = pwdInput.type === 'text' ? '🙈' : '👁';
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name     = form.querySelector('#name').value.trim();
    const email    = form.querySelector('#email').value.trim();
    const password = form.querySelector('#password').value;
    const confirm  = form.querySelector('#confirm-password').value;
    const agree    = form.querySelector('#terms')?.checked;
    const btn      = form.querySelector('button[type="submit"]');

    if (!name || !email || !password || !confirm) { ToastManager.show('Please fill all fields', 'error'); return; }
    if (password !== confirm) { ToastManager.show('Passwords do not match', 'error'); return; }
    if (password.length < 6) { ToastManager.show('Password must be at least 6 characters', 'error'); return; }
    if (!agree) { ToastManager.show('Please accept the terms', 'error'); return; }

    btn.disabled = true; btn.textContent = 'Creating Account…';

    setTimeout(() => {
      const users = Storage.get('sn_users', []);
      if (users.find(u => u.email === email) || Users.find(u => u.email === email)) {
        ToastManager.show('Email already registered', 'error');
        btn.disabled = false; btn.textContent = 'Create Account';
        return;
      }
      const newUser = { id: Date.now(), name, email, password, role:'Student', bio:'', notes:0, likes:0, followers:0 };
      users.push(newUser);
      Storage.set('sn_users', users);
      Session.set(newUser);
      ToastManager.show('Account created! Welcome 🎉', 'success');
      setTimeout(() => window.location.href = 'dashboard.html', 900);
    }, 1000);
  });
}

/* ═══════════════════════════════════════════════
   PAGE: DASHBOARD
   ═══════════════════════════════════════════════ */
function initDashboardPage() {
  requireAuth();
  const user  = Session.get();
  const notes = Storage.get('sn_notes', SampleNotes);

  /* Populate user info */
  setTextAll('.user-greeting-name', user.name.split(' ')[0]);
  setTextAll('.sidebar-user-name', user.name);
  setTextAll('.sidebar-user-role', user.role || 'Student');
  setTextAll('.user-avatar-initials', user.name[0].toUpperCase());

  /* Stats */
  animateCount('.stat-total-notes',    notes.length, '');
  animateCount('.stat-my-notes',       user.notes || 3, '');
  animateCount('.stat-total-likes',    notes.reduce((s,n) => s + n.likes, 0), '');
  animateCount('.stat-total-views',    notes.reduce((s,n) => s + n.views, 0), '');

  /* Recent notes */
  const recentGrid = document.getElementById('recent-notes-grid');
  if (recentGrid) {
    const recent = notes.slice(0, 4);
    recentGrid.innerHTML = recent.map(n => noteCardHTML(n)).join('');
    attachNoteCardEvents(recentGrid);
  }

  /* Sidebar + logout */
  initSidebar();
}

/* ═══════════════════════════════════════════════
   PAGE: UPLOAD
   ═══════════════════════════════════════════════ */
function initUploadPage() {
  requireAuth();
  initSidebar();

  const dropzone   = document.getElementById('dropzone');
  const fileInput  = document.getElementById('file-input');
  const previewList = document.getElementById('upload-preview-list');
  const uploadForm = document.getElementById('upload-form');
  const tagInput   = document.getElementById('tag-input-real');
  const tagsWrap   = document.getElementById('tags-wrap');
  let uploadedFiles = [];
  let tags = [];

  /* Dropzone events */
  if (dropzone) {
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault(); dropzone.classList.remove('dragover');
      handleFiles([...e.dataTransfer.files]);
    });
    dropzone.addEventListener('click', () => fileInput?.click());
  }
  if (fileInput) {
    fileInput.addEventListener('change', () => handleFiles([...fileInput.files]));
  }

  function handleFiles(files) {
    files.forEach(file => {
      if (uploadedFiles.find(f => f.name === file.name)) return;
      uploadedFiles.push(file);
      renderFilePreview(file);
    });
  }

  function renderFilePreview(file) {
    if (!previewList) return;
    const ext  = file.name.split('.').pop().toUpperCase();
    const size = (file.size / 1024 / 1024).toFixed(2) + ' MB';
    const icons = { PDF:'📄', DOCX:'📝', DOC:'📝', PPT:'📊', PPTX:'📊', XLS:'📈', XLSX:'📈', TXT:'📋' };
    const icon  = icons[ext] || '📎';
    const id    = 'file-' + Date.now() + Math.random();
    const item  = document.createElement('div');
    item.className = 'upload-file-item'; item.id = id;
    item.innerHTML = `
      <span class="file-icon">${icon}</span>
      <div class="file-info">
        <div class="file-name">${file.name}</div>
        <div class="file-size">${size} · ${ext}</div>
        <div class="file-progress"><div class="progress-bar-wrap"><div class="progress-bar" style="width:0%" id="prog-${id}"></div></div></div>
      </div>
      <button class="file-remove" data-file="${file.name}" title="Remove">✕</button>
    `;
    previewList.appendChild(item);

    /* Simulate upload progress */
    let progress = 0;
    const bar = document.getElementById('prog-' + id);
    const timer = setInterval(() => {
      progress = Math.min(progress + Math.random() * 18, 100);
      if (bar) bar.style.width = progress + '%';
      if (progress >= 100) clearInterval(timer);
    }, 120);

    item.querySelector('.file-remove').addEventListener('click', (e) => {
      const fname = e.target.dataset.file;
      uploadedFiles = uploadedFiles.filter(f => f.name !== fname);
      item.remove();
    });
  }

  /* Tags input */
  if (tagInput) {
    tagInput.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ',') && tagInput.value.trim()) {
        e.preventDefault();
        const val = tagInput.value.trim().replace(/,/g, '');
        if (!tags.includes(val) && tags.length < 8) {
          tags.push(val);
          renderTag(val);
        }
        tagInput.value = '';
      }
      if (e.key === 'Backspace' && !tagInput.value && tags.length) {
        tags.pop();
        tagsWrap?.querySelector('.tag-item:last-of-type')?.remove();
      }
    });
  }

  function renderTag(val) {
    if (!tagsWrap) return;
    const tagEl = document.createElement('span');
    tagEl.className = 'tag-item';
    tagEl.innerHTML = `${val}<button type="button">×</button>`;
    tagEl.querySelector('button').addEventListener('click', () => {
      tags = tags.filter(t => t !== val);
      tagEl.remove();
    });
    tagsWrap.insertBefore(tagEl, tagInput);
  }

  /* Form submit */
  if (uploadForm) {
    uploadForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title   = uploadForm.querySelector('#note-title').value.trim();
      const subject = uploadForm.querySelector('#note-subject').value;
      const content = uploadForm.querySelector('#note-content').value.trim();

      if (!title) { ToastManager.show('Please enter a title', 'error'); return; }
      if (!subject) { ToastManager.show('Please select a subject', 'error'); return; }
      if (!content && uploadedFiles.length === 0) { ToastManager.show('Please add content or upload a file', 'error'); return; }

      const user  = Session.get();
      const notes = Storage.get('sn_notes', SampleNotes);
      const subjectIcons = { Mathematics:'📄', Chemistry:'📊', Physics:'⚛️', Biology:'🔬', History:'📜', 'Computer Science':'💻', Economics:'📈', Literature:'📖', Geography:'🌍' };
      const newNote = {
        id: Date.now(), title, subject, content,
        author: user.name, authorInitial: user.name[0].toUpperCase(),
        excerpt: content.slice(0, 100) + '...',
        tags: tags.length ? tags : [subject.toLowerCase()],
        likes: 0, views: 0, downloads: 0,
        type: subjectIcons[subject] || '📝',
        date: 'Just now', fileType: uploadedFiles.length ? uploadedFiles[0].name.split('.').pop().toUpperCase() : 'TXT'
      };
      notes.unshift(newNote);
      Storage.set('sn_notes', notes);

      ToastManager.show('Notes uploaded successfully! 🎉', 'success');
      setTimeout(() => window.location.href = 'view.html', 1200);
    });
  }
}

/* ═══════════════════════════════════════════════
   PAGE: VIEW NOTES
   ═══════════════════════════════════════════════ */
function initViewPage() {
  requireAuth();
  initSidebar();

  const notes = Storage.get('sn_notes', SampleNotes);
  const grid  = document.getElementById('all-notes-grid');
  let filtered = [...notes];
  let likedNotes = Storage.get('sn_liked', []);

  /* URL params subject filter */
  const params  = new URLSearchParams(window.location.search);
  const subjParam = params.get('subject');
  if (subjParam) {
    const filterTag = document.querySelector(`[data-filter="${subjParam}"]`);
    if (filterTag) filterTag.click();
  }

  function renderNotes(list) {
    if (!grid) return;
    if (!list.length) {
      grid.innerHTML = `<div class="text-center text-muted" style="grid-column:1/-1;padding:60px 0;"><div style="font-size:3rem;margin-bottom:16px;">📭</div><p>No notes found. Try a different search or filter.</p></div>`;
      return;
    }
    grid.innerHTML = list.map(n => fullNoteCardHTML(n, likedNotes.includes(n.id))).join('');

    grid.querySelectorAll('.full-note-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.like-btn-view')) return;
        const id = +card.dataset.id;
        const note = notes.find(n => n.id === id);
        if (note) { note.views++; Storage.set('sn_notes', notes); openModal(note); }
      });
    });

    grid.querySelectorAll('.like-btn-view').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = +btn.dataset.id;
        const note = notes.find(n => n.id === id);
        if (!note) return;
        if (likedNotes.includes(id)) {
          likedNotes = likedNotes.filter(l => l !== id);
          note.likes = Math.max(0, note.likes - 1);
          btn.classList.remove('liked');
        } else {
          likedNotes.push(id);
          note.likes++;
          btn.classList.add('liked');
        }
        btn.querySelector('.like-count').textContent = note.likes;
        Storage.set('sn_liked', likedNotes);
        Storage.set('sn_notes', notes);
      });
    });
  }

  renderNotes(filtered);

  /* Search */
  const searchInput = document.getElementById('notes-search');
  if (searchInput) {
    if (subjParam) searchInput.value = '';
    searchInput.addEventListener('input', applyFilters);
  }

  /* Filter tags */
  document.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilters();
    });
  });

  /* Sort */
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) sortSelect.addEventListener('change', applyFilters);

  function applyFilters() {
    const query   = (searchInput?.value || '').toLowerCase();
    const subject = document.querySelector('[data-filter].active')?.dataset.filter || 'all';
    const sort    = sortSelect?.value || 'newest';

    filtered = notes.filter(n => {
      const matchQ = !query || n.title.toLowerCase().includes(query) || n.subject.toLowerCase().includes(query) || n.tags.some(t => t.includes(query));
      const matchS = subject === 'all' || n.subject === subject;
      return matchQ && matchS;
    });

    if (sort === 'popular') filtered.sort((a,b) => b.likes  - a.likes);
    else if (sort === 'viewed') filtered.sort((a,b) => b.views  - a.views);
    else filtered.sort((a,b) => b.id - a.id);

    renderNotes(filtered);
  }

  /* Modal */
  const modalOverlay = document.getElementById('note-modal');
  const modalClose   = document.getElementById('modal-close');
  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalOverlay) modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });

  function openModal(note) {
    if (!modalOverlay) return;
    document.getElementById('modal-note-title').textContent   = note.title;
    document.getElementById('modal-note-subject').textContent = note.subject;
    document.getElementById('modal-note-author').textContent  = note.author;
    document.getElementById('modal-note-date').textContent    = note.date;
    document.getElementById('modal-note-content').textContent = note.content || note.excerpt;
    const tagsEl = document.getElementById('modal-note-tags');
    if (tagsEl) tagsEl.innerHTML = note.tags.map(t => `<span class="tag">#${t}</span>`).join('');
    const likeBtn = document.getElementById('modal-like-btn');
    if (likeBtn) {
      likeBtn.dataset.id = note.id;
      likeBtn.innerHTML  = `♥ ${note.likes}`;
      likeBtn.className  = 'btn btn-ghost btn-sm' + (likedNotes.includes(note.id) ? ' liked' : '');
      likeBtn.onclick = () => {
        if (likedNotes.includes(note.id)) { likedNotes = likedNotes.filter(l=>l!==note.id); note.likes--; likeBtn.classList.remove('liked'); }
        else { likedNotes.push(note.id); note.likes++; likeBtn.classList.add('liked'); }
        likeBtn.innerHTML = `♥ ${note.likes}`;
        Storage.set('sn_liked', likedNotes);
        Storage.set('sn_notes', notes);
      };
    }
    const dlBtn = document.getElementById('modal-download-btn');
    if (dlBtn) { dlBtn.onclick = () => { note.downloads++; Storage.set('sn_notes', notes); ToastManager.show('Download started!', 'success'); }; }
    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (modalOverlay) modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
}

/* ═══════════════════════════════════════════════
   PAGE: PROFILE
   ═══════════════════════════════════════════════ */
function initProfilePage() {
  requireAuth();
  initSidebar();
  const user  = Session.get();
  const notes = Storage.get('sn_notes', SampleNotes);
  const likedNotes = Storage.get('sn_liked', []);

  setTextAll('.profile-display-name', user.name);
  setTextAll('.profile-display-email', user.email);
  setTextAll('.profile-display-bio', user.bio || 'No bio yet.');
  setTextAll('.profile-avatar-init', user.name[0].toUpperCase());
  setTextAll('.user-avatar-initials', user.name[0].toUpperCase());
  setTextAll('.sidebar-user-name', user.name);
  setTextAll('.sidebar-user-role', user.role || 'Student');

  const myNotes = notes.filter(n => n.author === user.name);
  const statNotes     = document.getElementById('stat-my-notes');
  const statLikes     = document.getElementById('stat-my-likes');
  const statFollowers = document.getElementById('stat-my-followers');
  if (statNotes)     statNotes.textContent     = myNotes.length;
  if (statLikes)     statLikes.textContent     = myNotes.reduce((s,n) => s + n.likes, 0);
  if (statFollowers) statFollowers.textContent = user.followers || 0;

  /* Liked notes tab */
  const likedGrid = document.getElementById('liked-notes-grid');
  if (likedGrid && likedNotes.length) {
    const likedData = notes.filter(n => likedNotes.includes(n.id));
    if (likedData.length) likedGrid.innerHTML = likedData.map(n => fullNoteCardHTML(n, true)).join('');
  }

  const myGrid  = document.getElementById('my-notes-grid');
  if (myGrid) {
    if (!myNotes.length) {
      myGrid.innerHTML = `<div class="text-center text-muted" style="grid-column:1/-1;padding:40px 0;"><div style="font-size:3rem;margin-bottom:12px;">📭</div><p>You haven't uploaded any notes yet.</p><br><a href="upload.html" class="btn btn-primary">Upload Notes</a></div>`;
    } else {
      myGrid.innerHTML = myNotes.map(n => fullNoteCardHTML(n, false)).join('');
    }
  }

  /* Edit profile */
  const editForm = document.getElementById('edit-profile-form');
  if (editForm) {
    editForm.querySelector('#edit-name').value  = user.name;
    editForm.querySelector('#edit-email').value = user.email;
    editForm.querySelector('#edit-bio').value   = user.bio || '';

    editForm.addEventListener('submit', (e) => {
      e.preventDefault();
      user.name  = editForm.querySelector('#edit-name').value.trim() || user.name;
      user.email = editForm.querySelector('#edit-email').value.trim() || user.email;
      user.bio   = editForm.querySelector('#edit-bio').value.trim();
      Session.set(user);
      ToastManager.show('Profile updated!', 'success');
      setTextAll('.profile-display-name', user.name);
      setTextAll('.profile-display-email', user.email);
      setTextAll('.profile-display-bio', user.bio || 'No bio yet.');
    });
  }
}

/* ═══════════════════════════════════════════════
   SHARED HELPERS
   ═══════════════════════════════════════════════ */
function requireAuth() {
  if (!Session.isLoggedIn()) {
    window.location.href = 'login.html';
  }
}

function initSidebar() {
  /* Logout */
  document.querySelectorAll('.logout-btn, #logout-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      Session.clear();
      ToastManager.show('Logged out successfully', 'info');
      setTimeout(() => window.location.href = 'index.html', 700);
    });
  });

  /* Mobile sidebar toggle */
  const menuToggle = document.getElementById('menu-toggle');
  const sidebar    = document.querySelector('.sidebar');
  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
    document.addEventListener('click', (e) => {
      if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) sidebar.classList.remove('open');
    });
  }

  /* Mark active link */
  const current = window.location.pathname.split('/').pop();
  document.querySelectorAll('.sidebar-nav a').forEach(a => {
    if (a.getAttribute('href') === current) a.classList.add('active');
  });
}

function setTextAll(selector, value) {
  document.querySelectorAll(selector).forEach(el => el.textContent = value);
}

function animateCount(selector, target, suffix) {
  const els = document.querySelectorAll(selector);
  if (!els.length) return;
  let current = 0;
  const increment = target / 55;
  const timer = setInterval(() => {
    current = Math.min(current + increment, target);
    els.forEach(el => el.textContent = Math.floor(current).toLocaleString() + suffix);
    if (current >= target) clearInterval(timer);
  }, 18);
}

function noteCardHTML(note) {
  return `
    <div class="note-card card" data-id="${note.id}">
      <div class="note-card-header">
        <div class="note-card-title">${note.type} ${note.title}</div>
        <span class="note-card-subject">${note.subject}</span>
      </div>
      <div class="note-card-excerpt">${note.excerpt}</div>
      <div class="note-card-footer">
        <div class="note-card-author">
          <div class="mini-avatar">${note.authorInitial}</div>
          <span class="meta-author-name">${note.author}</span>
        </div>
        <div class="note-card-actions">
          <button class="icon-btn like-btn${note.likes > 40 ? ' liked' : ''}" data-id="${note.id}" title="Like">♥</button>
          <button class="icon-btn" title="Views">👁 ${note.views}</button>
        </div>
      </div>
    </div>`;
}

function fullNoteCardHTML(note, isLiked) {
  return `
    <div class="full-note-card card" data-id="${note.id}">
      <div class="note-type-icon">${note.type}</div>
      <div class="full-note-title">${note.title}</div>
      <div class="full-note-subject">${note.subject}</div>
      <div class="full-note-excerpt">${note.excerpt}</div>
      <div class="full-note-footer">
        <div class="note-author-row">
          <div class="mini-avatar">${note.authorInitial}</div>
          <span class="text-sm text-muted">${note.author}</span>
        </div>
        <div class="note-stats">
          <button class="icon-btn like-btn-view${isLiked ? ' liked' : ''}" data-id="${note.id}" title="Like">
            ♥ <span class="like-count">${note.likes}</span>
          </button>
          <span>👁 ${note.views}</span>
        </div>
      </div>
    </div>`;
}

function attachNoteCardEvents(container) {
  container.querySelectorAll('.note-card').forEach(card => {
    card.addEventListener('click', () => {
      window.location.href = `view.html?id=${card.dataset.id}`;
    });
  });
}

/* ═══════════════════════════════════════════════
   INIT — detect page and run
   ═══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  ToastManager.init();

  const page = window.location.pathname.split('/').pop() || 'index.html';
  const pageMap = {
    'index.html':     initHomePage,
    '':               initHomePage,
    'login.html':     initLoginPage,
    'signup.html':    initSignupPage,
    'dashboard.html': initDashboardPage,
    'upload.html':    initUploadPage,
    'view.html':      initViewPage,
    'profile.html':   initProfilePage,
  };

  const fn = pageMap[page];
  if (fn) fn();
});
