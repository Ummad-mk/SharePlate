/**
 * SharePlate Mock Data Store & Persistence
 * Manages sample donations, users, claims, tasks, and localStorage synchronization
 */

const STORAGE_KEYS = {
  DONATIONS: 'shareplate_donations_v2',
  CLAIMS: 'shareplate_claims_v2',
  TASKS: 'shareplate_tasks_v2',
  USER: 'shareplate_current_user_v2',
  THEME: 'shareplate_theme_v1',
  NOTIFICATIONS: 'shareplate_notifications_v2',
  IMPACT: 'shareplate_impact_stats_v2',
  REPORTS: 'shareplate_reports_v2'
};

// Initial realistic dataset for Lahore, Pakistan
const INITIAL_DONATIONS = [
  {
    id: 'food-101',
    title: '60 Servings Chicken Dum Biryani & Mint Raita',
    type: 'cooked',
    category: 'Cooked Meals',
    quantity: '60 servings (~25 kg)',
    photo: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    donor: {
      name: 'Nishat Banquet & Royal Hall',
      type: 'Wedding Hall',
      rating: 4.95,
      phone: '+92 42 3575 8899'
    },
    address: 'MM Alam Road, Gulberg III, Lahore',
    lat: 31.5135,
    lng: 74.3512,
    distance: '1.4 km',
    safeUntil: new Date(Date.now() + 3.5 * 60 * 60 * 1000).toISOString(),
    status: 'available',
    isWeddingSurplus: true,
    foodSafetyVerified: true,
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    notes: 'Cooked fresh for valima reception. Held in thermal insulated stainless containers at 68°C. PFA Certified.'
  },
  {
    id: 'food-102',
    title: 'Artisan Sourdough & Croissant Crates',
    type: 'bakery',
    category: 'Bakery & Bread',
    quantity: '40 loaves & 25 pastries',
    photo: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    donor: {
      name: 'Jalal Sons Bakery & Deli',
      type: 'Bakery',
      rating: 4.85,
      phone: '+92 42 3571 2233'
    },
    address: 'Main Market, Gulberg II, Lahore',
    lat: 31.5240,
    lng: 74.3465,
    distance: '2.1 km',
    safeUntil: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    status: 'available',
    isWeddingSurplus: false,
    foodSafetyVerified: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    notes: 'Fresh morning artisan bake. Packed in paper bags ready for immediate pickup.'
  },
  {
    id: 'food-103',
    title: '80 Plates Chicken Karahi, Daal Makhani & Roghni Naan',
    type: 'cooked',
    category: 'Cooked Meals',
    quantity: '80 meals',
    photo: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
    donor: {
      name: 'Haveli Heritage Banquet',
      type: 'Wedding Hall',
      rating: 4.9,
      phone: '+92 42 3765 4433'
    },
    address: 'Fort Road Heritage Enclave, Walled City, Lahore',
    lat: 31.5880,
    lng: 74.3120,
    distance: '3.8 km',
    safeUntil: new Date(Date.now() + 1.75 * 60 * 60 * 1000).toISOString(),
    status: 'available',
    isWeddingSurplus: true,
    foodSafetyVerified: true,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    notes: 'Wedding reception surplus, segregated hygienically in heat-sealed containers.'
  },
  {
    id: 'food-104',
    title: 'Fresh Farm Produce: Apples, Tomatoes & Oranges',
    type: 'produce',
    category: 'Raw Produce',
    quantity: '50 kg assorted crates',
    photo: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=800&q=80',
    donor: {
      name: 'GreenValley Hypermarket',
      type: 'Grocery Store',
      rating: 4.8,
      phone: '+92 42 3588 9911'
    },
    address: 'Mall of Lahore, Cantonment, Lahore',
    lat: 31.5360,
    lng: 74.3720,
    distance: '4.2 km',
    safeUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    status: 'claimed',
    claimedBy: 'SOS Children\'s Village Lahore',
    claimedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    isWeddingSurplus: false,
    foodSafetyVerified: true,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    notes: 'Grade-A fresh produce, ripe and nutritious.'
  },
  {
    id: 'food-105',
    title: '65 Boxed Club Sandwiches & Fresh Juices',
    type: 'packaged',
    category: 'Packaged Snacks',
    quantity: '65 meal boxes',
    photo: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
    donor: {
      name: 'Arfa Tower Tech Cafeteria',
      type: 'Corporate Cafeteria',
      rating: 4.9,
      phone: '+92 42 3591 0022'
    },
    address: 'Arfa Software Technology Park, Ferozepur Road, Lahore',
    lat: 31.4755,
    lng: 74.3420,
    distance: '3.4 km',
    safeUntil: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    status: 'assigned',
    claimedBy: 'Edhi Foundation Shelter Home',
    assignedVolunteer: 'Hamza Malik',
    isWeddingSurplus: false,
    foodSafetyVerified: true,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    notes: 'Individually boxed in eco-friendly biodegradable cartons.'
  },
  {
    id: 'food-106',
    title: '45 L Fresh Whole Milk & Dairy Pails',
    type: 'packaged',
    category: 'Dairy',
    quantity: '45 Litres',
    photo: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
    donor: {
      name: 'Punjab Pure Dairy Co.',
      type: 'Dairy Supplier',
      rating: 4.92,
      phone: '+92 42 3511 6677'
    },
    address: 'Model Town Link Road Warehouse, Lahore',
    lat: 31.4880,
    lng: 74.3210,
    distance: '2.7 km',
    safeUntil: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    status: 'available',
    isWeddingSurplus: false,
    foodSafetyVerified: true,
    createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    notes: 'PFA pasteurized, stored in insulated chilled canisters.'
  }
];

const INITIAL_NOTIFICATIONS = [
  { id: 'notif-1', title: 'New food surplus nearby!', message: 'Nishat Banquets posted 60 servings of Biryani (1.4 km away in Gulberg)', time: '10m ago', unread: true },
  { id: 'notif-2', title: 'Claim confirmed!', message: 'Your claim for Arfa Tower boxed lunches has been matched with volunteer Hamza Malik.', time: '45m ago', unread: true },
  { id: 'notif-3', title: 'Volunteer Rescue Success', message: 'Jalal Sons bakery delivery to Saylani Shelter completed. 40 meals saved!', time: '2h ago', unread: false }
];

const INITIAL_IMPACT = {
  mealsSaved: 14850,
  kgDiverted: 6920,
  activeDonors: 165,
  partnerNGOs: 74,
  co2SavedKg: 17300
};

// Data Store API
const SharePlateData = {
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.DONATIONS)) {
      localStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify(INITIAL_DONATIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.IMPACT)) {
      localStorage.setItem(STORAGE_KEYS.IMPACT, JSON.stringify(INITIAL_IMPACT));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CLAIMS)) {
      localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify([
        {
          claimId: 'CLM-8821',
          donationId: 'food-104',
          receiverName: 'SOS Children\'s Village Lahore',
          status: 'Claimed',
          claimedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
          otpCode: '4928'
        }
      ]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify([
        {
          taskId: 'TSK-301',
          donationId: 'food-105',
          title: '65 Boxed Club Sandwiches & Fresh Juices',
          pickup: 'Arfa Tower Tech Cafeteria, Ferozepur Road, Lahore',
          dropoff: 'Edhi Foundation Shelter Home, Allama Iqbal Town, Lahore',
          distance: '3.4 km route',
          status: 'assigned',
          volunteerName: 'Hamza Malik',
          safeUntil: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
        }
      ]));
    }
  },

  getDonations() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.DONATIONS)) || [];
    } catch {
      return INITIAL_DONATIONS;
    }
  },

  getDonationById(id) {
    const list = this.getDonations();
    return list.find(d => d.id === id) || null;
  },

  addDonation(donationData) {
    const donations = this.getDonations();
    const newDonation = {
      id: 'food-' + Date.now(),
      createdAt: new Date().toISOString(),
      status: 'available',
      ...donationData
    };
    donations.unshift(newDonation);
    localStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify(donations));

    // Update impact counters
    const impact = this.getImpact();
    impact.mealsSaved += parseInt(donationData.quantity) || 25;
    localStorage.setItem(STORAGE_KEYS.IMPACT, JSON.stringify(impact));

    // Add notification
    this.addNotification({
      title: 'New Donation Posted',
      message: `${newDonation.title} is now available on the live receiver feed.`,
      time: 'Just now'
    });

    return newDonation;
  },

  updateDonation(id, updates) {
    const donations = this.getDonations();
    const index = donations.findIndex(d => d.id === id);
    if (index !== -1) {
      donations[index] = { ...donations[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify(donations));
      return donations[index];
    }
    return null;
  },

  claimDonation(donationId, receiverName = 'Edhi Foundation Shelter Home') {
    const donation = this.getDonationById(donationId);
    if (!donation) return false;

    // Generate 4-digit verification code
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    this.updateDonation(donationId, {
      status: 'claimed',
      claimedBy: receiverName,
      claimedAt: new Date().toISOString(),
      claimOtp: otp
    });

    // Save into claims list
    const claims = this.getClaims();
    const newClaim = {
      claimId: 'CLM-' + Math.floor(1000 + Math.random() * 9000),
      donationId,
      receiverName,
      status: 'Claimed',
      claimedAt: new Date().toISOString(),
      otpCode: otp,
      title: donation.title,
      donor: donation.donor.name,
      address: donation.address
    };
    claims.unshift(newClaim);
    localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(claims));

    // Also automatically create a volunteer rescue task
    const tasks = this.getTasks();
    tasks.unshift({
      taskId: 'TSK-' + Math.floor(100 + Math.random() * 900),
      donationId,
      title: donation.title,
      pickup: donation.address,
      dropoff: receiverName + ' Center',
      distance: donation.distance || '2.8 km',
      status: 'available',
      volunteerName: null,
      safeUntil: donation.safeUntil
    });
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));

    this.addNotification({
      title: 'Food Claimed Successfully',
      message: `You claimed "${donation.title}". Verification OTP is ${otp}.`,
      time: 'Just now'
    });

    return newClaim;
  },

  getClaims() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CLAIMS)) || [];
    } catch {
      return [];
    }
  },

  getTasks() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS)) || [];
    } catch {
      return [];
    }
  },

  acceptTask(taskId, volunteerName = 'Volunteer Partner') {
    const tasks = this.getTasks();
    const task = tasks.find(t => t.taskId === taskId);
    if (task) {
      task.status = 'assigned';
      task.volunteerName = volunteerName;
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));

      if (task.donationId) {
        this.updateDonation(task.donationId, {
          status: 'assigned',
          assignedVolunteer: volunteerName
        });
      }
      return task;
    }
    return null;
  },

  updateTaskStatus(taskId, newStatus) {
    const tasks = this.getTasks();
    const task = tasks.find(t => t.taskId === taskId);
    if (task) {
      task.status = newStatus;
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));

      if (task.donationId) {
        this.updateDonation(task.donationId, { status: newStatus });
      }
      return task;
    }
    return null;
  },

  getImpact() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.IMPACT)) || INITIAL_IMPACT;
    } catch {
      return INITIAL_IMPACT;
    }
  },

  getNotifications() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) || [];
    } catch {
      return [];
    }
  },

  addNotification(notif) {
    const list = this.getNotifications();
    list.unshift({
      id: 'notif-' + Date.now(),
      unread: true,
      ...notif
    });
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
  },

  markNotificationsRead() {
    const list = this.getNotifications().map(n => ({ ...n, unread: false }));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
  },

  saveReport(report) {
    const reports = JSON.parse(localStorage.getItem(STORAGE_KEYS.REPORTS) || '[]');
    reports.unshift({
      id: 'REP-' + Date.now(),
      date: new Date().toISOString(),
      ...report
    });
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
  },

  getReports() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.REPORTS) || '[]');
  },

  resetDemoData() {
    localStorage.removeItem(STORAGE_KEYS.DONATIONS);
    localStorage.removeItem(STORAGE_KEYS.CLAIMS);
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.IMPACT);
    this.init();
  }
};

// Initialize on script load
SharePlateData.init();
