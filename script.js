
/*Login

/* ── DEMO CREDENTIALS ─────────────────── */
const USERS = [
  { email: 'visit@gmail.com',   password: 'visit1909',  name: 'vist' },
  { email: 'admin@shop.com',  password: 'admin123', name: 'Admin Shop' },
];

let cartCount = 0;  // Cart counter

/* ════════════════════════════════════════
   INIT — Cek session saat halaman load
   ════════════════════════════════════════ */
window.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initParticles();
  initBgGlow();

  const session = sessionStorage.getItem('fv_user');
  if (session) {
    // Sudah login → langsung tampilkan shop
    showShop(JSON.parse(session), false);
  } else {
    // Belum login → tampilkan halaman login
    showLoginPage();
    // Auto-fill email jika ada remember me
    const saved = localStorage.getItem('fv_remember');
    if (saved) {
      const el = document.getElementById('loginEmail');
      if (el) el.value = saved;
    }
  }

  // Enter key support
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const loginForm = document.getElementById('formLogin');
    const regForm   = document.getElementById('formRegister');
    if (loginForm && loginForm.style.display !== 'none') doLogin();
    else if (regForm && regForm.style.display !== 'none') doRegister();
  });
});


/* ════════════════════════════════════════
   PAGE SWITCH — Login ↔ Shop
   ════════════════════════════════════════ */
function showLoginPage() {
  const pageLogin = document.getElementById('pageLogin');
  const pageShop  = document.getElementById('pageShop');
  pageShop.style.display  = 'none';
  pageLogin.style.display = 'block';
  pageLogin.classList.add('page-enter');
  setTimeout(() => pageLogin.classList.remove('page-enter'), 500);
  document.body.style.overflow = 'hidden';
  window.scrollTo(0, 0);
}

function showShop(user, animate = true) {
  const pageLogin = document.getElementById('pageLogin');
  const pageShop  = document.getElementById('pageShop');

  if (animate) {
    // Animasi keluar login dulu
    pageLogin.classList.add('page-leave');
    setTimeout(() => {
      pageLogin.style.display = 'none';
      pageLogin.classList.remove('page-leave');
      _mountShop(user);
    }, 380);
  } else {
    pageLogin.style.display = 'none';
    _mountShop(user);
  }
}

function _mountShop(user) {
  const pageShop = document.getElementById('pageShop');
  pageShop.style.display = 'block';
  pageShop.classList.add('page-enter');
  setTimeout(() => pageShop.classList.remove('page-enter'), 500);
  document.body.style.overflow = '';

  // Set nama user di navbar
  const nameEl = document.getElementById('userName');
  if (nameEl && user?.name) nameEl.textContent = user.name.split(' ')[0];

  // Init scroll & interactions setelah shop muncul
  setTimeout(() => {
    initNavbarScroll();
    initScrollReveal();
    initFilterTabs();
    initWishlist();
    initAddToCart();
    window.scrollTo(0, 0);
  }, 100);
}


/* ════════════════════════════════════════
   AUTH — TAB SWITCH
   ════════════════════════════════════════ */
function switchTab(tab) {
  const tabLogin    = document.getElementById('tabLogin');
  const tabRegister = document.getElementById('tabRegister');
  const formLogin   = document.getElementById('formLogin');
  const formReg     = document.getElementById('formRegister');

  if (tab === 'login') {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    formLogin.style.display = 'block';
    formReg.style.display   = 'none';
    document.getElementById('loginError').style.display = 'none';
  } else {
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    formReg.style.display   = 'block';
    formLogin.style.display = 'none';
    document.getElementById('registerSuccess').style.display = 'none';
  }
}


/* ════════════════════════════════════════
   AUTH — LOGIN
   ════════════════════════════════════════ */
function doLogin() {
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPass').value;
  const remember = document.getElementById('rememberMe').checked;
  const errBox   = document.getElementById('loginError');

  // Reset state
  ['loginEmail','loginPass'].forEach(id => document.getElementById(id).classList.remove('invalid'));
  errBox.style.display = 'none';

  // Validasi
  if (!email || !isValidEmail(email)) {
    document.getElementById('loginEmail').classList.add('invalid');
    errBox.textContent   = '⚠ Please enter a valid email address.';
    errBox.style.display = 'flex';
    return;
  }
  if (!password) {
    document.getElementById('loginPass').classList.add('invalid');
    errBox.textContent   = '⚠ Please enter your password.';
    errBox.style.display = 'flex';
    return;
  }

  // Loading state
  setBtnState('loginBtn', 'loginBtnText', 'Signing in...', true);

  setTimeout(() => {
    const user = USERS.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (user) {
      // Sukses
      setBtnState('loginBtn', 'loginBtnText', '✓ Welcome!', false, true);

      const sessionData = { name: user.name, email: user.email, loginAt: new Date().toISOString() };
      sessionStorage.setItem('fv_user', JSON.stringify(sessionData));
      if (remember) localStorage.setItem('fv_remember', email);
      else          localStorage.removeItem('fv_remember');

      // Transition ke shop
      setTimeout(() => showShop(sessionData, true), 700);

    } else {
      // Gagal
      setBtnState('loginBtn', 'loginBtnText', 'Sign In');
      ['loginEmail','loginPass'].forEach(id => document.getElementById(id).classList.add('invalid'));
      errBox.textContent   = '⚠ Incorrect email or password. Try user@demo.com / demo123';
      errBox.style.display = 'flex';
    }
  }, 1200);
}


/* ════════════════════════════════════════
   AUTH — REGISTER
   ════════════════════════════════════════ */
function doRegister() {
  const firstName  = document.getElementById('regFirstName').value.trim();
  const lastName   = document.getElementById('regLastName').value.trim();
  const email      = document.getElementById('regEmail').value.trim();
  const pass       = document.getElementById('regPass').value;
  const passConf   = document.getElementById('regPassConfirm').value;
  const agree      = document.getElementById('agreeTerms').checked;
  const successBox = document.getElementById('registerSuccess');

  successBox.style.display = 'none';
  ['regFirstName','regLastName','regEmail','regPass','regPassConfirm'].forEach(id => {
    document.getElementById(id).classList.remove('invalid');
  });

  let errors = [];
  if (!firstName) { document.getElementById('regFirstName').classList.add('invalid'); errors.push('first name'); }
  if (!lastName)  { document.getElementById('regLastName').classList.add('invalid');  errors.push('last name'); }
  if (!email || !isValidEmail(email)) { document.getElementById('regEmail').classList.add('invalid'); errors.push('valid email'); }
  if (pass.length < 6) { document.getElementById('regPass').classList.add('invalid'); errors.push('password (min 6)'); }
  if (pass !== passConf) { document.getElementById('regPassConfirm').classList.add('invalid'); errors.push('matching passwords'); }
  if (!agree) errors.push('terms agreement');

  if (errors.length > 0) {
    showToast('⚠ Please fill: ' + errors.join(', '));
    return;
  }

  setBtnState('registerBtn', 'registerBtnText', 'Creating account...', true);

  setTimeout(() => {
    USERS.push({ email, password: pass, name: firstName + ' ' + lastName });
    setBtnState('registerBtn', 'registerBtnText', '✓ Account Created!', false, true);
    successBox.style.display = 'flex';
    setTimeout(() => {
      switchTab('login');
      document.getElementById('loginEmail').value = email;
      setBtnState('registerBtn', 'registerBtnText', 'Create Account');
    }, 2000);
  }, 1400);
}


/* ════════════════════════════════════════
   AUTH — LOGOUT
   ════════════════════════════════════════ */
function doLogout() {
  showToast('&#127807; Logging out...');
  setTimeout(() => {
    sessionStorage.removeItem('fv_user');
    cartCount = 0;
    showLoginPage();
    // Reset login form
    const btn = document.getElementById('loginBtn');
    if (btn) setBtnState('loginBtn', 'loginBtnText', 'Sign In');
  }, 1000);
}


/* ════════════════════════════════════════
   TOGGLE PASSWORD
   ════════════════════════════════════════ */
function togglePass(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = '🙈';
  } else {
    input.type = 'password';
    btn.textContent = '👁';
  }
}


/* ════════════════════════════════════════
   SHOP — NAVBAR SCROLL
   ════════════════════════════════════════ */
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  const handler = () => navbar.classList.toggle('scrolled', window.scrollY > 60);
  window.removeEventListener('scroll', window._navScrollHandler);
  window._navScrollHandler = handler;
  window.addEventListener('scroll', handler);
}


/* ════════════════════════════════════════
   SHOP — SCROLL REVEAL
   ════════════════════════════════════════ */
function initScrollReveal() {
  const els = document.querySelectorAll('#pageShop .reveal');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('revealed'); });
  }, { threshold: 0.08 });
  els.forEach(el => { el.classList.remove('revealed'); obs.observe(el); });
}


/* ════════════════════════════════════════
   SHOP — FILTER TABS
   ════════════════════════════════════════ */
function initFilterTabs() {
  const tabs  = document.querySelectorAll('#pageShop .tab');
  const cards = document.querySelectorAll('#productsGrid .product-card');
  tabs.forEach(tab => {
    tab.onclick = () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.dataset.filter;
      cards.forEach(card => {
        const match = filter === 'all' || card.dataset.cat === filter;
        card.classList.toggle('hidden', !match);
        if (match) {
          card.classList.remove('revealed');
          setTimeout(() => card.classList.add('revealed'), 50);
        }
      });
      showToast('&#127807; Showing: ' + tab.textContent);
    };
  });
}


/* ════════════════════════════════════════
   SHOP — WISHLIST
   ════════════════════════════════════════ */
function initWishlist() {
  document.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const active = btn.dataset.active === 'true';
      btn.dataset.active    = !active;
      btn.textContent       = active ? '♡' : '♥';
      btn.style.color       = active ? '' : '#ff6b8a';
      btn.style.borderColor = active ? '' : '#ff6b8a';
      const name = btn.closest('.product-card')?.querySelector('.product-name')?.textContent || 'Plant';
      showToast(active ? '&#9825; Removed: ' + name : '&#9829; Wishlisted: ' + name);
    };
  });
}


/* ════════════════════════════════════════
   SHOP — ADD TO CART
   ════════════════════════════════════════ */
function initAddToCart() {
  document.querySelectorAll('.product-arrow').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const card  = btn.closest('.product-card, .best-card');
      const name  = card?.querySelector('.product-name, .best-name')?.textContent  || 'Item';
      const price = card?.querySelector('.product-price, .best-price')?.textContent || '';
      cartCount++;
      const badge = document.getElementById('cartBadge');
      if (badge) badge.textContent = cartCount;
      showToast('&#127873; Added: ' + name + ' ' + price);
    };
  });
}


/* ════════════════════════════════════════
   SMOOTH SCROLL
   ════════════════════════════════════════ */
function smoothScroll(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}


/* ════════════════════════════════════════
   TOAST NOTIFICATION
   ════════════════════════════════════════ */
let toastTimer;
function showToast(msg, duration = 2500) {
  const toast = document.getElementById('toastEl');
  if (!toast) return;
  clearTimeout(toastTimer);
  toast.innerHTML = msg;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
}


/* ════════════════════════════════════════
   BUTTON STATE HELPER
   ════════════════════════════════════════ */
function setBtnState(btnId, textId, text, loading = false, success = false) {
  const btn  = document.getElementById(btnId);
  const span = document.getElementById(textId);
  if (!btn || !span) return;
  span.textContent = text;
  btn.disabled     = loading;
  btn.style.background = loading  ? 'linear-gradient(135deg,rgba(15,66,126,.8),rgba(8,22,53,.9))'
                       : success  ? 'linear-gradient(135deg,#1a9d5a,#0f7a44)'
                       : '';
  btn.style.boxShadow  = success  ? '0 0 40px rgba(26,157,90,.55)' : '';
}


/* ════════════════════════════════════════
   VALIDATE EMAIL
   ════════════════════════════════════════ */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


/* ════════════════════════════════════════
   CURSOR
   ════════════════════════════════════════ */
function initCursor() {
  const cursor = document.getElementById('cursor');
  const ring   = document.getElementById('cursorRing');
  let cx=0,cy=0,rx=0,ry=0;

  document.addEventListener('mousemove', e => {
    cx = e.clientX; cy = e.clientY;
    cursor.style.left = cx+'px'; cursor.style.top = cy+'px';
  });

  (function animateRing() {
    rx += (cx-rx)*.1; ry += (cy-ry)*.1;
    ring.style.left = rx+'px'; ring.style.top = ry+'px';
    requestAnimationFrame(animateRing);
  })();

  document.addEventListener('mouseover', e => {
    const tag = e.target.tagName.toLowerCase();
    const isInteractive = ['button','a','input','label','select'].includes(tag)
      || e.target.classList.contains('product-card')
      || e.target.classList.contains('guide-card')
      || e.target.classList.contains('best-card');
    cursor.style.width  = isInteractive ? '18px' : '10px';
    cursor.style.height = isInteractive ? '18px' : '10px';
    ring.style.width    = isInteractive ? '52px' : '36px';
    ring.style.height   = isInteractive ? '52px' : '36px';
  });
}


/* ════════════════════════════════════════
   FLOATING PARTICLES
   ════════════════════════════════════════ */
function initParticles() {
  const container = document.getElementById('dotsBg');
  if (!container) return;
  for (let i = 0; i < 28; i++) {
    const dot = document.createElement('div');
    dot.className = 'dot';
    dot.style.left              = Math.random() * 100 + '%';
    dot.style.animationDuration = (12 + Math.random() * 18) + 's';
    dot.style.animationDelay    = (Math.random() * 20) + 's';
    const size = (1 + Math.random() * 2.5) + 'px';
    dot.style.width = size; dot.style.height = size;
    container.appendChild(dot);
  }
}


/* ════════════════════════════════════════
   INTERACTIVE BG GLOW
   ════════════════════════════════════════ */
function initBgGlow() {
  const canvas = document.querySelector('.bg-canvas');
  const orbs   = document.querySelectorAll('.orb');
  if (!canvas) return;

  document.addEventListener('mousemove', e => {
    const x = (e.clientX / window.innerWidth)  * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    canvas.style.background = `
      radial-gradient(ellipse at ${x}% ${y}%, rgba(26,127,212,.15) 0%, transparent 38%),
      radial-gradient(ellipse at 15% 50%, rgba(15,66,126,.45) 0%, transparent 55%),
      radial-gradient(ellipse at 85% 20%, rgba(3,44,79,.6) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 90%, rgba(2,32,60,.8) 0%, transparent 60%),
      #081635
    `;
    // Parallax pada orbs
    orbs.forEach((orb, i) => {
      const f = (i+1) * 0.007;
      orb.style.transform = `translate(${(x-50)*f}px,${(y-50)*f}px)`;
    });
  });
}