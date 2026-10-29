/**
 * SharePlate UI Utilities
 * Theme switching, toasts, modals, notifications dropdown, and mobile navigation
 */

const SharePlateUI = {
  init() {
    this.initTheme();
    this.initMobileNav();
    this.initNotifications();
    this.initModals();
  },

  /* ------------------------------------------------------------------------
     Theme Management (Light / Dark Mode)
     ------------------------------------------------------------------------ */
  initTheme() {
    const savedTheme = localStorage.getItem('shareplate_theme_v1') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateThemeToggleIcons(savedTheme);

    const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
    toggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('shareplate_theme_v1', next);
        this.updateThemeToggleIcons(next);
        this.toast(`Switched to ${next} theme`, 'info', 2000);
      });
    });
  },

  updateThemeToggleIcons(theme) {
    const sunIcons = document.querySelectorAll('.theme-icon-sun');
    const moonIcons = document.querySelectorAll('.theme-icon-moon');
    if (theme === 'dark') {
      sunIcons.forEach(i => i.style.display = 'inline-block');
      moonIcons.forEach(i => i.style.display = 'none');
    } else {
      sunIcons.forEach(i => i.style.display = 'none');
      moonIcons.forEach(i => i.style.display = 'inline-block');
    }
  },

  /* ------------------------------------------------------------------------
     Toast Notifications
     ------------------------------------------------------------------------ */
  toast(message, type = 'info', duration = 3500) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      container.setAttribute('aria-live', 'polite');
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = '🔔';
    if (type === 'success') icon = '✅';
    if (type === 'warning') icon = '⚠️';
    if (type === 'danger') icon = '❌';

    toast.innerHTML = `
      <span>${icon}</span>
      <div style="flex:1;">${message}</div>
      <button style="color:var(--color-text-muted);font-size:16px;line-height:1;" aria-label="Close">&times;</button>
    `;

    const closeBtn = toast.querySelector('button');
    closeBtn.addEventListener('click', () => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 250);
    });

    container.appendChild(toast);

    setTimeout(() => {
      if (toast.isConnected) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 250);
      }
    }, duration);
  },

  /* ------------------------------------------------------------------------
     Native <dialog> Modals
     ------------------------------------------------------------------------ */
  initModals() {
    // Backdrop click dismiss for dialogs
    document.querySelectorAll('dialog.modal').forEach(dialog => {
      dialog.addEventListener('click', (e) => {
        const rect = dialog.getBoundingClientRect();
        const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
          rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
        if (!isInDialog) {
          dialog.close();
        }
      });

      // Close buttons
      dialog.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', () => dialog.close());
      });
    });
  },

  openModal(dialogId) {
    const dialog = document.getElementById(dialogId);
    if (dialog && typeof dialog.showModal === 'function') {
      dialog.showModal();
    }
  },

  closeModal(dialogId) {
    const dialog = document.getElementById(dialogId);
    if (dialog && typeof dialog.close === 'function') {
      dialog.close();
    }
  },

  /* ------------------------------------------------------------------------
     Mobile Navigation Drawer
     ------------------------------------------------------------------------ */
  initMobileNav() {
    const hamburger = document.querySelector('.hamburger-btn');
    const drawer = document.querySelector('.mobile-nav-drawer');
    if (!drawer) return;

    // Ensure backdrop element exists
    let backdrop = document.querySelector('.mobile-nav-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'mobile-nav-backdrop';
      backdrop.setAttribute('aria-hidden', 'true');
      document.body.appendChild(backdrop);
    }

    const openDrawer = () => {
      drawer.classList.add('open');
      backdrop.classList.add('open');
      if (hamburger) {
        hamburger.classList.add('is-active');
        hamburger.setAttribute('aria-expanded', 'true');
      }
    };

    const closeDrawer = () => {
      drawer.classList.remove('open');
      backdrop.classList.remove('open');
      if (hamburger) {
        hamburger.classList.remove('is-active');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    };

    if (hamburger) {
      hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = drawer.classList.contains('open');
        if (isOpen) {
          closeDrawer();
        } else {
          openDrawer();
        }
      });
    }

    // Close on click anywhere outside the drawer (screen or backdrop)
    document.addEventListener('click', (e) => {
      if (!drawer.classList.contains('open')) return;
      // If clicking inside the drawer itself, ignore unless clicking a link
      if (drawer.contains(e.target)) {
        if (e.target.closest('a') || e.target.closest('.mobile-drawer-close-btn')) {
          closeDrawer();
        }
        return;
      }
      // If clicking the hamburger itself, let the hamburger toggle handle it
      if (hamburger && hamburger.contains(e.target)) return;

      // Clicked anywhere on screen apart from the navbar drawer -> close!
      closeDrawer();
    });

    // Close on backdrop touch/click
    backdrop.addEventListener('click', () => {
      closeDrawer();
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('open')) {
        closeDrawer();
      }
    });

    // Close on link click
    drawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => closeDrawer());
    });

    // ------------------------------------------------------------------------
    // Smart Auto-Hide Top Navigation Bar on Scroll (Mobile, Tablet & Desktop)
    // ------------------------------------------------------------------------
    const navbar = document.querySelector('.navbar');
    if (navbar && !navbar.dataset.autohideBound) {
      navbar.dataset.autohideBound = 'true';
      let lastScrollY = window.pageYOffset || document.documentElement.scrollTop;
      let ticking = false;
      const scrollThreshold = 10; // delta threshold in px

      window.addEventListener('scroll', () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;

            // Never hide navbar if mobile drawer is currently open
            if (drawer && drawer.classList.contains('open')) {
              navbar.classList.remove('nav-hidden');
              lastScrollY = currentScrollY;
              ticking = false;
              return;
            }

            // Always show navbar near the top of the page
            if (currentScrollY <= 40) {
              navbar.classList.remove('nav-hidden');
              navbar.classList.remove('nav-scrolled');
            } else {
              navbar.classList.add('nav-scrolled');
              const delta = currentScrollY - lastScrollY;

              if (delta > scrollThreshold) {
                // Scrolling down -> Auto hide smoothly
                navbar.classList.add('nav-hidden');
              } else if (delta < -scrollThreshold) {
                // Scrolling up -> Reveal immediately
                navbar.classList.remove('nav-hidden');
              }
            }

            lastScrollY = Math.max(0, currentScrollY);
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
    }
  },

  /* ------------------------------------------------------------------------
     Notification Bell & Dropdown
     ------------------------------------------------------------------------ */
  initNotifications() {
    const bellBtn = document.querySelector('.notification-bell-btn');
    const dropdown = document.querySelector('.notification-dropdown');
    if (!bellBtn || !dropdown) return;

    const renderList = () => {
      const notifs = SharePlateData.getNotifications();
      const unreadCount = notifs.filter(n => n.unread).length;
      const badge = bellBtn.querySelector('.notification-badge');
      if (badge) {
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'flex' : 'none';
      }

      const listContainer = dropdown.querySelector('.notification-list');
      if (listContainer) {
        if (notifs.length === 0) {
          listContainer.innerHTML = '<div style="padding:var(--space-md);text-align:center;color:var(--color-text-muted);">No new notifications</div>';
        } else {
          listContainer.innerHTML = notifs.map(n => `
            <div class="notification-item ${n.unread ? 'unread' : ''}">
              <div style="font-weight:600;color:var(--color-text-main);">${n.title}</div>
              <div style="color:var(--color-text-secondary);font-size:12px;">${n.message}</div>
              <div class="notification-time">${n.time}</div>
            </div>
          `).join('');
        }
      }
    };

    renderList();

    bellBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = dropdown.classList.contains('show');
      if (isVisible) {
        dropdown.classList.remove('show');
      } else {
        dropdown.classList.add('show');
        SharePlateData.markNotificationsRead();
        renderList();
      }
    });

    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target) && !bellBtn.contains(e.target)) {
        dropdown.classList.remove('show');
      }
    });
  },

  /* ------------------------------------------------------------------------
     Interactive Star Rating
     ------------------------------------------------------------------------ */
  initStarRating(containerElement, onSelect) {
    if (!containerElement) return;
    const stars = containerElement.querySelectorAll('.star');
    stars.forEach((star, idx) => {
      star.addEventListener('click', () => {
        const rating = idx + 1;
        stars.forEach((s, sIdx) => {
          s.classList.toggle('filled', sIdx < rating);
        });
        if (typeof onSelect === 'function') onSelect(rating);
      });
    });
  }
};

// Initialize UI behaviors on DOM load or immediately if already ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => SharePlateUI.init());
} else {
  SharePlateUI.init();
}
