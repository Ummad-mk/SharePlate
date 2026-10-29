/**
 * SharePlate Main Landing Page Logic
 * Live strip scroller, animated impact counters on scroll, testimonial carousel, and mini map preview
 */

function initMainPage() {
  initLiveFoodStrip();
  initImpactCounters();
  initStoriesCarousel();
  initHomeMapPreview();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMainPage);
} else {
  // DOM is already ready
  initMainPage();
}

/* --------------------------------------------------------------------------
   Live Availability Strip Generator
   -------------------------------------------------------------------------- */
function initLiveFoodStrip() {
  const track = document.getElementById('live-strip-track');
  if (!track) return;

  const donations = SharePlateData.getDonations().filter(d => d.status === 'available');

  if (donations.length === 0) {
    track.innerHTML = '<div style="padding:var(--space-md);color:var(--color-text-secondary);">No surplus food currently posted. Check back in a few minutes!</div>';
    return;
  }

  track.innerHTML = donations.map(item => `
    <div class="scroller-card">
      <div class="card" style="height: 100%;">
        <div class="card-img-wrap" style="height: 160px;">
          <span class="badge badge-safe badge-overlay">Fresh & Safe</span>
          <img src="${item.photo}" alt="${item.title}" loading="lazy">
        </div>
        <div class="card-body">
          <h4 class="card-title" style="font-size: 14px; min-height: 38px;">${item.title}</h4>
          <div class="card-meta" style="margin-top: 4px;">
            <span>🍲 ${item.quantity}</span>
            <span>📍 ${item.distance}</span>
          </div>
          <div style="margin-top: 10px;">
            <div class="countdown-chip" data-countdown-until="${item.safeUntil}">
              Safe for 2h 15m
            </div>
          </div>
        </div>
        <div class="card-footer">
          <span style="font-size: 12px; color: var(--color-text-muted); font-weight: 600;">
            ${item.donor ? item.donor.name.split(' ')[0] : 'Partner'}
          </span>
          <a href="./login.html" class="btn btn-primary btn-sm">
            Claim
          </a>
        </div>
      </div>
    </div>
  `).join('');

  if (window.SharePlateDonations) {
    SharePlateDonations.startCountdownLoop();
  }
}

/* --------------------------------------------------------------------------
   Impact Band Animated Count-Up Counters
   -------------------------------------------------------------------------- */
function initImpactCounters() {
  const counterElements = document.querySelectorAll('.count-up');
  if (counterElements.length === 0) return;

  let hasAnimated = false;

  const animateCount = (el) => {
    const target = parseInt(el.getAttribute('data-target'), 10) || 0;
    const duration = 2000; // ms
    const startTime = performance.now();

    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.floor(easeProgress * target);

      el.textContent = currentVal.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target.toLocaleString();
      }
    };

    requestAnimationFrame(update);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasAnimated) {
        hasAnimated = true;
        counterElements.forEach(animateCount);
      }
    });
  }, { threshold: 0.3 });

  const impactSection = document.getElementById('impact-section');
  if (impactSection) {
    observer.observe(impactSection);
  }
}

/* --------------------------------------------------------------------------
   Stories of Hope Testimonial Carousel
   -------------------------------------------------------------------------- */
function initStoriesCarousel() {
  const track = document.getElementById('testimonial-track');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  if (!track || !prevBtn || !nextBtn) return;

  const slides = track.querySelectorAll('.testimonial-slide');
  let currentIndex = 0;
  const totalSlides = slides.length;

  const updateCarousel = () => {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
  };

  prevBtn.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
    updateCarousel();
  });

  nextBtn.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % totalSlides;
    updateCarousel();
  });

  // Auto rotate every 7 seconds
  setInterval(() => {
    currentIndex = (currentIndex + 1) % totalSlides;
    updateCarousel();
  }, 7000);
}

/* --------------------------------------------------------------------------
   Home Map Preview
   -------------------------------------------------------------------------- */
function initHomeMapPreview() {
  const mapElement = document.getElementById('home-map-preview');
  if (!mapElement) return;

  let retries = 0;
  const maxRetries = 35; // wait up to 3.5s for Leaflet CDN if delayed

  const attemptInit = () => {
    if (typeof L !== 'undefined' && window.SharePlateMap) {
      SharePlateMap.init('home-map-preview', { isMini: true, zoom: 12 });

      // Invalidate size when user scrolls map into view
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && SharePlateMap.mapInstance) {
              SharePlateMap.mapInstance.invalidateSize();
            }
          });
        }, { threshold: 0.1 });
        observer.observe(mapElement);
      }
    } else if (retries < maxRetries) {
      retries++;
      setTimeout(attemptInit, 100);
    } else {
      // Offline / blocked CDN fallback UI
      renderMapFallback(mapElement);
    }
  };

  attemptInit();
}

function renderMapFallback(container) {
  const donations = (window.SharePlateData ? SharePlateData.getDonations() : []).slice(0, 4);
  container.innerHTML = `
    <div style="height:100%; display:flex; flex-direction:column; justify-content:center; align-items:center; background:var(--color-surface); padding:var(--space-lg); text-align:center;">
      <div style="font-size:2.2rem; margin-bottom:var(--space-xs);">📍</div>
      <h3 style="font-size:var(--font-size-md); margin-bottom:var(--space-xs); color:var(--color-primary);">Lahore Food Rescue Hub</h3>
      <p style="font-size:var(--font-size-xs); color:var(--color-text-secondary); max-width:420px; margin-bottom:var(--space-md);">
        ${donations.length}+ active donation pins ready for pickup across Gulberg, DHA, Johar Town, and Model Town.
      </p>
      <div style="display:flex; flex-wrap:wrap; gap:var(--space-xs); justify-content:center;">
        ${donations.map(d => `<span class="badge badge-safe" style="font-size:11px;">${d.title.split(' ')[0]} ${d.title.split(' ')[1]} (${d.distance})</span>`).join('')}
      </div>
    </div>
  `;
}
