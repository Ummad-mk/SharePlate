/**
 * SharePlate Role-Based Auth Simulation
 * Manages front-end role switching, login, logout, and protected route redirection
 */

const ROLES = {
  DONOR: 'donor',
  RECEIVER: 'receiver',
  VOLUNTEER: 'volunteer',
  ADMIN: 'admin'
};

const DEFAULT_USERS = {
  donor: {
    name: 'Chef Usman Tariq',
    organization: 'Nishat Banquet & Royal Hall',
    email: 'usman@nishatbanquets.pk',
    role: 'donor',
    avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=200&q=80',
    verified: true,
    badges: ['PFA A-Grade Certified', 'Lahore Food Hero', 'Gold Donor']
  },
  receiver: {
    name: 'Fatima Begum & Team',
    organization: 'Edhi Foundation Shelter Home Lahore',
    email: 'care@edhilahore.org',
    role: 'receiver',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    verified: true,
    badges: ['Verified Shelter', 'Edhi Foundation Chapter']
  },
  volunteer: {
    name: 'Hamza Malik',
    organization: 'Swift Wheels Lahore Rescue',
    email: 'hamza.malik@volunteer.pk',
    role: 'volunteer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    verified: true,
    badges: ['Speedy Deliverer', 'Level 4 Rescue Hero']
  },
  admin: {
    name: 'Zainab Siddiqui',
    organization: 'SharePlate Lahore Operations',
    email: 'zainab.siddiqui@shareplate.pk',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    verified: true,
    badges: ['Super Admin', 'Punjab Food Safety Auditor']
  }
};

const ROLE_DASHBOARD_ROUTES = {
  donor: '/donor/dashboard.html',
  receiver: '/receiver/feed.html',
  volunteer: '/volunteer/tasks.html',
  admin: '/admin/dashboard.html'
};

const SharePlateAuth = {
  getCurrentUser() {
    try {
      const stored = localStorage.getItem('shareplate_current_user_v2');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  getCurrentRole() {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  },

  loginAs(roleKey, customData = {}) {
    const baseUser = DEFAULT_USERS[roleKey] || DEFAULT_USERS.donor;
    const user = { ...baseUser, ...customData, role: roleKey, loggedInAt: new Date().toISOString() };
    localStorage.setItem('shareplate_current_user_v2', JSON.stringify(user));

    // Determine target redirect path (handling relative roots)
    const isSubdir = window.location.pathname.includes('/donor/') ||
                     window.location.pathname.includes('/receiver/') ||
                     window.location.pathname.includes('/volunteer/') ||
                     window.location.pathname.includes('/admin/');

    const prefix = isSubdir ? '../' : './';
    const target = ROLE_DASHBOARD_ROUTES[roleKey].replace(/^\//, prefix);
    window.location.href = target;
  },

  logout() {
    localStorage.removeItem('shareplate_current_user_v2');
    const isSubdir = window.location.pathname.includes('/donor/') ||
                     window.location.pathname.includes('/receiver/') ||
                     window.location.pathname.includes('/volunteer/') ||
                     window.location.pathname.includes('/admin/');
    const target = isSubdir ? '../login.html' : './login.html';
    window.location.href = target;
  },

  requireAuth(allowedRoles = []) {
    const user = this.getCurrentUser();
    const isSubdir = window.location.pathname.includes('/donor/') ||
                     window.location.pathname.includes('/receiver/') ||
                     window.location.pathname.includes('/volunteer/') ||
                     window.location.pathname.includes('/admin/');
    const loginPath = isSubdir ? '../login.html' : './login.html';

    if (!user || !user.role) {
      window.location.href = loginPath + '?redirect=' + encodeURIComponent(window.location.pathname);
      return false;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      // Redirect to their assigned dashboard
      const target = ROLE_DASHBOARD_ROUTES[user.role].replace(/^\//, isSubdir ? '../' : './');
      window.location.href = target;
      return false;
    }

    return true;
  },

  renderUserNav() {
    const user = this.getCurrentUser();
    const container = document.getElementById('user-nav-profile');
    if (!container) return;

    if (user) {
      container.innerHTML = `
        <div class="flex-center user-nav-wrapper" style="gap: var(--space-2xs);">
          <img src="${user.avatar}" alt="${user.name}" class="user-nav-avatar" style="width:32px;height:32px;border-radius:50%;object-fit:cover;border:1.5px solid var(--color-saffron);flex-shrink:0;">
          <div class="user-info-text hide-mobile" style="display:none; text-align:left; line-height:1.2;">
            <div style="font-size:12px;font-weight:700;">${user.name}</div>
            <span class="role-badge role-badge-${user.role}">${user.role}</span>
          </div>
          <button id="logout-btn" class="btn btn-outline btn-sm logout-nav-btn" title="Log out" aria-label="Log out">
            <span class="logout-label">Log out</span>
          </button>
        </div>
      `;
      const logoutBtn = document.getElementById('logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => this.logout());
      }
    }
  }
};

// Auto-run user nav render when DOM is ready or immediately if already ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => SharePlateAuth.renderUserNav());
} else {
  SharePlateAuth.renderUserNav();
}
