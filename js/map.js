/**
 * SharePlate Map Integration (Leaflet + OpenStreetMap)
 * Custom pins, interactive popups, geolocation, and fallback area locator
 */

const SharePlateMap = {
  mapInstance: null,
  markersLayer: null,
  userLocationMarker: null,

  // Default coordinate center (Lahore, Pakistan)
  defaultCenter: [31.5204, 74.3587],
  defaultZoom: 13,

  init(containerId = 'shareplate-map', options = {}) {
    const container = document.getElementById(containerId);
    if (!container || typeof L === 'undefined') return;

    // Check if map is already initialized on this container
    if (this.mapInstance) {
      this.mapInstance.remove();
      this.mapInstance = null;
    }

    const zoom = options.zoom || this.defaultZoom;
    const center = options.center || this.defaultCenter;

    this.mapInstance = L.map(containerId, {
      zoomControl: !options.isMini,
      scrollWheelZoom: !options.isMini
    }).setView(center, zoom);

    // Add OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a>'
    }).addTo(this.mapInstance);

    this.markersLayer = L.layerGroup().addTo(this.mapInstance);

    this.renderDonationPins();
    this.initLocationControls();

    // Invalidate size after layout completes
    setTimeout(() => {
      if (this.mapInstance) this.mapInstance.invalidateSize();
    }, 300);
  },

  renderDonationPins() {
    if (!this.markersLayer) return;
    this.markersLayer.clearLayers();

    const donations = SharePlateData.getDonations();

    // Create custom pin icon HTML
    const createPin = (color, emoji) => {
      return L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="background-color:${color}; width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 3px 10px rgba(0,0,0,0.3); border:2px solid white; font-size:16px;">
            ${emoji}
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -34]
      });
    };

    const foodPin = createPin('#F59E0B', '🍲');
    const bakeryPin = createPin('#D95D39', '🥖');
    const claimPin = createPin('#1F5C4A', '📦');

    donations.forEach(item => {
      if (!item.lat || !item.lng) return;

      let icon = foodPin;
      if (item.type === 'bakery') icon = bakeryPin;
      if (item.status === 'claimed' || item.status === 'assigned') icon = claimPin;

      const popupContent = `
        <div style="font-family:var(--font-body); max-width:220px; font-size:13px; line-height:1.4;">
          <img src="${item.photo}" alt="${item.title}" style="width:100%; height:90px; object-fit:cover; border-radius:8px; margin-bottom:6px;">
          <div style="font-weight:700; color:#1F5C4A; margin-bottom:2px;">${item.title}</div>
          <div style="color:#5C5549; font-size:11px; margin-bottom:4px;">📍 ${item.address}</div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
            <span style="font-weight:700; color:#F59E0B;">${item.quantity}</span>
            ${item.status === 'available' ? `
              <button onclick="window.location.href='../receiver/feed.html?highlight=${item.id}'" style="background:#1F5C4A; color:white; border:none; padding:4px 10px; border-radius:12px; font-size:11px; font-weight:600; cursor:pointer;">
                View
              </button>
            ` : `<span style="font-size:10px; color:#15803D; font-weight:600;">${item.status}</span>`}
          </div>
        </div>
      `;

      const marker = L.marker([item.lat, item.lng], { icon }).bindPopup(popupContent);
      this.markersLayer.addLayer(marker);
    });
  },

  initLocationControls() {
    const geoBtn = document.getElementById('btn-use-location');
    const fallbackForm = document.getElementById('area-search-form');
    const areaInput = document.getElementById('area-search-input');

    if (geoBtn) {
      geoBtn.addEventListener('click', () => {
        if (!navigator.geolocation) {
          SharePlateUI.toast('Geolocation is not supported by your browser.', 'warning');
          return;
        }

        geoBtn.textContent = 'Locating...';
        geoBtn.disabled = true;

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            geoBtn.textContent = '📍 Near You';
            geoBtn.disabled = false;

            this.mapInstance.setView([latitude, longitude], 14);

            if (this.userLocationMarker) {
              this.userLocationMarker.setLatLng([latitude, longitude]);
            } else {
              const userIcon = L.divIcon({
                className: 'user-location-pin',
                html: `
                  <div style="background:#0284C7; width:22px; height:22px; border-radius:50%; border:3px solid white; box-shadow:0 0 12px rgba(2,132,199,0.7);"></div>
                `,
                iconSize: [22, 22],
                iconAnchor: [11, 11]
              });
              this.userLocationMarker = L.marker([latitude, longitude], { icon: userIcon })
                .bindPopup('<b>You are here</b>')
                .addTo(this.mapInstance);
            }
            this.userLocationMarker.openPopup();
            SharePlateUI.toast('Location detected! Showing surplus food near you.', 'success');
          },
          (error) => {
            geoBtn.textContent = '📍 Use My Location';
            geoBtn.disabled = false;
            SharePlateUI.toast('Location permission denied. Please enter your neighborhood below.', 'warning');
            if (areaInput) areaInput.focus();
          },
          { timeout: 7000 }
        );
      });
    }

    if (fallbackForm && areaInput) {
      fallbackForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = areaInput.value.trim().toLowerCase();
        if (!query) return;

        // Demo coordinates map for quick fallback across Lahore neighborhoods
        const demoGeoDatabase = {
          'gulberg': [31.5120, 74.3480],
          'mm alam': [31.5135, 74.3512],
          'dha': [31.4700, 74.4100],
          'johar town': [31.4697, 74.2728],
          'model town': [31.4880, 74.3210],
          'mall road': [31.5580, 74.3200],
          'anarkali': [31.5690, 74.3140],
          'walled city': [31.5880, 74.3120],
          'fort road': [31.5880, 74.3120],
          'bahria town': [31.3650, 74.1850],
          'lahore': [31.5204, 74.3587]
        };

        const match = Object.keys(demoGeoDatabase).find(key => query.includes(key));
        if (match) {
          const coords = demoGeoDatabase[match];
          this.mapInstance.setView(coords, 14);
          SharePlateUI.toast(`Centered on ${query.toUpperCase()}`, 'info');
        } else {
          // Approximate jump with subtle offset
          this.mapInstance.setView(this.defaultCenter, 13);
          SharePlateUI.toast(`Showing surplus food around ${query}`, 'info');
        }
      });
    }
  }
};
