/**
 * SharePlate Donations Logic
 * Post food validation, live countdown timer updates, filter & search, claims, stepper status, and ratings
 */

const SharePlateDonations = {
  countdownInterval: null,

  init() {
    this.startCountdownLoop();
    this.initPostFoodForm();
  },

  /* ------------------------------------------------------------------------
     Live Countdown Timers (Auto-updates every second)
     ------------------------------------------------------------------------ */
  startCountdownLoop() {
    if (this.countdownInterval) clearInterval(this.countdownInterval);

    const updateAllTimers = () => {
      const timerElements = document.querySelectorAll('[data-countdown-until]');
      const now = Date.now();

      timerElements.forEach(el => {
        const untilStr = el.getAttribute('data-countdown-until');
        if (!untilStr) return;

        const until = new Date(untilStr).getTime();
        const diffMs = until - now;

        if (diffMs <= 0) {
          el.textContent = 'Expired';
          el.classList.add('badge-urgent');
          el.classList.remove('expiring-soon', 'badge-safe');
          return;
        }

        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

        if (hours > 0) {
          el.textContent = `Safe for ${hours}h ${minutes}m`;
        } else {
          el.textContent = `Safe for ${minutes}m ${seconds}s`;
        }

        // Apply urgency glow if under 1 hour
        if (diffMs < 60 * 60 * 1000) {
          el.classList.add('expiring-soon');
        } else {
          el.classList.remove('expiring-soon');
        }
      });
    };

    updateAllTimers();
    this.countdownInterval = setInterval(updateAllTimers, 1000);
  },

  /* ------------------------------------------------------------------------
     Post Food Form Handler & Validation
     ------------------------------------------------------------------------ */
  initPostFoodForm() {
    const form = document.getElementById('post-food-form');
    if (!form) return;

    const fileInput = document.getElementById('food-photo-input');
    const previewContainer = document.getElementById('photo-preview-wrap');
    const previewImg = document.getElementById('photo-preview-img');
    const removePhotoBtn = document.getElementById('remove-photo-btn');
    let uploadedPhotoUrl = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';

    // Image preview handling
    if (fileInput && previewContainer && previewImg) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            uploadedPhotoUrl = event.target.result;
            previewImg.src = uploadedPhotoUrl;
            previewContainer.style.display = 'block';
          };
          reader.readAsDataURL(file);
        }
      });

      if (removePhotoBtn) {
        removePhotoBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          fileInput.value = '';
          previewContainer.style.display = 'none';
          uploadedPhotoUrl = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
        });
      }
    }

    // Quick safe-until helper buttons
    const quickHoursBtns = document.querySelectorAll('.quick-hour-btn');
    const safeUntilInput = document.getElementById('safe-until-input');
    if (quickHoursBtns && safeUntilInput) {
      quickHoursBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          quickHoursBtns.forEach(b => b.classList.remove('btn-green'));
          btn.classList.add('btn-green');
          const hours = parseFloat(btn.dataset.hours || 3);
          const targetDate = new Date(Date.now() + hours * 60 * 60 * 1000);
          // Format for datetime-local input: YYYY-MM-DDTHH:mm
          const localIso = new Date(targetDate.getTime() - targetDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
          safeUntilInput.value = localIso;
        });
      });
    }

    // Form Submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      const clearError = (fieldId, errId) => {
        const field = document.getElementById(fieldId);
        const err = document.getElementById(errId);
        if (field) field.classList.remove('is-invalid');
        if (err) err.classList.remove('visible');
      };

      const setError = (fieldId, errId, msg) => {
        const field = document.getElementById(fieldId);
        const err = document.getElementById(errId);
        if (field) field.classList.add('is-invalid');
        if (err) {
          err.textContent = msg;
          err.classList.add('visible');
        }
        isValid = false;
      };

      // Title validation
      const title = document.getElementById('food-title')?.value.trim();
      clearError('food-title', 'title-error');
      if (!title || title.length < 5) {
        setError('food-title', 'title-error', 'Please provide a clear dish or food title (at least 5 characters).');
      }

      // Quantity validation
      const quantity = document.getElementById('food-quantity')?.value.trim();
      clearError('food-quantity', 'quantity-error');
      if (!quantity) {
        setError('food-quantity', 'quantity-error', 'Please specify the quantity or number of servings.');
      }

      // Address validation
      const address = document.getElementById('food-address')?.value.trim();
      clearError('food-address', 'address-error');
      if (!address) {
        setError('food-address', 'address-error', 'Please provide a pickup address or landmark.');
      }

      // Safe until validation
      const safeUntil = document.getElementById('safe-until-input')?.value;
      clearError('safe-until-input', 'time-error');
      if (!safeUntil) {
        setError('safe-until-input', 'time-error', 'Please select when this food must be consumed by.');
      } else if (new Date(safeUntil).getTime() <= Date.now()) {
        setError('safe-until-input', 'time-error', 'Safe-until time must be in the future.');
      }

      // Safety certification checkbox
      const safetyCheck = document.getElementById('safety-cert-check')?.checked;
      clearError('safety-cert-check', 'safety-error');
      if (!safetyCheck) {
        setError('safety-cert-check', 'safety-error', 'You must certify food safety and hygienic preparation.');
      }

      if (!isValid) return;

      const category = document.getElementById('food-category')?.value || 'Cooked Meals';
      const isWedding = document.getElementById('wedding-mode-toggle')?.checked || false;
      const notes = document.getElementById('food-notes')?.value.trim() || '';

      const currentUser = SharePlateAuth.getCurrentUser() || {
        name: 'Good Samaritan Donor',
        organization: 'Community Donor',
        rating: 5.0
      };

      const newPost = SharePlateData.addDonation({
        title,
        quantity,
        category,
        type: ({ 'Cooked Meals': 'cooked', 'Bakery & Bread': 'bakery', 'Raw Produce': 'produce', 'Packaged Snacks': 'packaged', 'Dairy': 'dairy' })[category] || 'cooked',
        photo: uploadedPhotoUrl,
        address,
        safeUntil: new Date(safeUntil).toISOString(),
        isWeddingSurplus: isWedding,
        foodSafetyVerified: true,
        notes,
        // Lahore city centre (the app's service area). The old values were for
        // Noida, India, so every newly posted donation was pinned ~400 km away
        // and never visible on the Lahore maps.
        lat: 31.5204 + (Math.random() - 0.5) * 0.05,
        lng: 74.3587 + (Math.random() - 0.5) * 0.05,
        distance: (0.5 + Math.random() * 3.5).toFixed(1) + ' km',
        donor: {
          name: currentUser.organization || currentUser.name,
          type: isWedding ? 'Wedding Hall / Caterer' : 'Restaurant / Donor',
          rating: 4.9,
          phone: currentUser.phone || '+92 42 3575 8899'
        }
      });

      SharePlateUI.toast('Food donation posted successfully! It is now live.', 'success', 3000);

      // Redirect to donor dashboard or tracking view after brief delay
      setTimeout(() => {
        window.location.href = './dashboard.html';
      }, 1000);
    });
  },

  /* ------------------------------------------------------------------------
     Card Renderer Utility
     ------------------------------------------------------------------------ */
  renderDonationCard(donation, options = {}) {
    const isAvailable = donation.status === 'available';
    const showClaimBtn = options.showClaimBtn && isAvailable;
    const showTrackBtn = options.showTrackBtn;

    let badgeClass = 'badge-safe';
    let badgeLabel = 'Available Now';

    if (donation.status === 'claimed') {
      badgeClass = 'badge-saffron';
      badgeLabel = 'Claimed (Preparing)';
    } else if (donation.status === 'assigned') {
      badgeClass = 'badge-primary';
      badgeLabel = 'Volunteer En Route';
    } else if (donation.status === 'picked_up') {
      badgeClass = 'badge-primary';
      badgeLabel = 'In Transit';
    } else if (donation.status === 'delivered') {
      badgeClass = 'badge-safe';
      badgeLabel = 'Delivered & Saved';
    }

    return `
      <article class="card ${options.extraClass || ''}" data-id="${donation.id}" data-category="${donation.category}">
        <div class="card-img-wrap">
          <span class="badge ${badgeClass} badge-overlay">${badgeLabel}</span>
          ${donation.isWeddingSurplus ? '<span class="badge badge-saffron" style="position:absolute;top:8px;right:8px;z-index:2;">💍 Wedding Surplus</span>' : ''}
          <img src="${donation.photo}" alt="${donation.title}" loading="lazy">
        </div>
        <div class="card-body">
          <h3 class="card-title">${donation.title}</h3>
          <div class="card-meta">
            <span>📦 ${donation.quantity}</span>
            <span>📍 ${donation.distance || 'Near you'}</span>
            <span>🏢 ${donation.donor ? donation.donor.name : 'Donor'}</span>
          </div>
          <div style="margin-top:auto;padding-top:var(--space-xs);">
            <div class="countdown-chip" data-countdown-until="${donation.safeUntil}">
              Calculating...
            </div>
          </div>
        </div>
        <div class="card-footer">
          <span style="font-size:var(--font-size-xs);color:var(--color-text-secondary);font-weight:500;">
            ${donation.donor ? '⭐ ' + donation.donor.rating : 'Verified'}
          </span>
          <div class="flex-center" style="gap:var(--space-xs);">
            ${showClaimBtn ? `
              <button class="btn btn-primary btn-sm claim-btn" data-donation-id="${donation.id}">
                Claim Food
              </button>
            ` : ''}
            ${showTrackBtn ? `
              <a href="${options.trackUrl || './track.html'}?id=${donation.id}" class="btn btn-outline btn-sm">
                Track Status
              </a>
            ` : ''}
          </div>
        </div>
      </article>
    `;
  },

  /* ------------------------------------------------------------------------
     Stepper Status Tracker Visualizer
     ------------------------------------------------------------------------ */
  updateStepperUI(status) {
    const steps = ['available', 'claimed', 'assigned', 'picked_up', 'delivered'];
    const currentIdx = steps.indexOf(status);

    const stepElements = document.querySelectorAll('.stepper .step-item');
    const progressBar = document.querySelector('.stepper-progress');

    stepElements.forEach((el, idx) => {
      el.classList.remove('active', 'completed');
      if (idx < currentIdx) {
        el.classList.add('completed');
      } else if (idx === currentIdx) {
        el.classList.add('active');
      }
    });

    if (progressBar && stepElements.length > 1) {
      const percentage = (Math.max(0, currentIdx) / (stepElements.length - 1)) * 100;
      progressBar.style.width = `calc(${percentage}% - 40px)`;
    }
  }
};

// Initialize donations handlers on DOM load or immediately if already ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => SharePlateDonations.init());
} else {
  SharePlateDonations.init();
}

// Expose on window: top-level `const` does not create a window property,
// so feature checks like `window.SharePlateDonations` would otherwise always be false.
window.SharePlateDonations = SharePlateDonations;
