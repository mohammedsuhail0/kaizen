export interface ServiceDeliverable {
  label: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  price: string;
  numericPrice: number;
  type: 'one-time' | 'monthly';
  turnaround: string;
  description: string;
  deliverables: string[];
  category: string;
  categoryLabel: string;
  popular?: boolean;
}

export interface ServiceCategory {
  id: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  iconName: 'globe' | 'calendar' | 'barChart' | 'messageSquare' | 'trendingUp';
  items: ServiceItem[];
}

export interface BundleItem {
  id: string;
  name: string;
  tagline: string;
  price: string;
  numericPrice: number;
  advance: string;
  numericAdvance: number;
  timeline: string;
  popular?: boolean;
  bestFor: string;
  included: string[];
  iconName: 'zap' | 'store' | 'rocket';
}

export interface ProjectItem {
  index: string;
  name: string;
  type: 'WEBSITE' | 'MOBILE WEBAPP';
  category: string;
  summary: string;
  businessValue: string;
  features: string[];
  liveUrl: string;
  accent: string;
}

export const AGENCY_PHONE = '916301633463';

/**
 * Generates an accelerated direct WhatsApp API link (skips the wa.me 302 redirect roundtrip).
 * Also supports native mobile deep-linking (whatsapp://) for instant 0-second opening.
 */
export const getWhatsAppUrl = (text?: string): string => {
  const encoded = text ? `&text=${encodeURIComponent(text)}` : '';
  return `https://api.whatsapp.com/send/?phone=${AGENCY_PHONE}${encoded}`;
};

/**
 * Triggers instant native WhatsApp opening on mobile devices, bypassing browser lag entirely.
 */
export const handleWhatsAppInstantClick = (e: React.MouseEvent<HTMLAnchorElement>, text?: string) => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return;
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (isMobile) {
    e.preventDefault();
    const encoded = text ? `&text=${encodeURIComponent(text)}` : '';
    // Instant OS-level deep-link directly to WhatsApp app
    window.location.href = `whatsapp://send?phone=${AGENCY_PHONE}${encoded}`;
    // Fallback if WhatsApp is somehow not installed
    setTimeout(() => {
      if (document.visibilityState === 'visible') {
        window.location.href = `https://api.whatsapp.com/send/?phone=${AGENCY_PHONE}${encoded}`;
      }
    }, 1500);
  }
};

export const AGENCY_METRICS = {
  starterPrice: '₹4,999',
  advancePercent: '30%',
  balancePercent: '70%',
  revisions: '2 Rounds Included',
  supportDays: '15 Days Free Support',
  ownership: '100% Code & Asset Ownership',
  location: 'India',
};

export const BUNDLES: BundleItem[] = [
  {
    id: 'bundle-starter',
    name: 'Starter Bundle',
    tagline: 'Best for a new local business getting online.',
    price: 'Rs. 4,999',
    numericPrice: 4999,
    advance: 'Rs. 1,500',
    numericAdvance: 1500,
    timeline: '3 to 5 Days',
    bestFor: 'Local shops, professionals & independent consultants',
    iconName: 'zap',
    included: [
      'High-impact Landing Page with your offer & photos',
      'Google Business Profile setup to appear on Google Maps',
      'Google 5-Star Review QR stand & direct link asset',
      'WhatsApp Click-to-Chat button integration',
      '15 Days free post-delivery technical support',
    ],
  },
  {
    id: 'bundle-shop',
    name: 'Shop & Cafe Bundle',
    tagline: 'Everything a retail store, cafe, or restaurant needs.',
    price: 'Rs. 6,999',
    numericPrice: 6999,
    advance: 'Rs. 2,100',
    numericAdvance: 2100,
    popular: true,
    timeline: '4 to 6 Days',
    bestFor: 'Cafes, restaurants, retail shops & boutiques',
    iconName: 'store',
    included: [
      'Mobile-optimized One-Page Business Website',
      'Digital Menu / Product Catalogue with scan QR code',
      'Google Business Profile verification & Maps pin',
      'Review QR code for counter display',
      'Lead capture order form connected to WhatsApp',
      '15 Days free support & 2 rounds of changes',
    ],
  },
  {
    id: 'bundle-growth',
    name: 'Growth & Scale Bundle',
    tagline: 'Complete automated system for clinics, gyms, & academies.',
    price: 'Rs. 14,999',
    numericPrice: 14999,
    advance: 'Rs. 4,500',
    numericAdvance: 4500,
    timeline: '7 to 10 Days',
    bestFor: 'Clinics, salons, gyms, academies & service businesses',
    iconName: 'rocket',
    included: [
      'Multi-Page Website (Up to 6 custom pages)',
      'Online Booking & Appointment Scheduling engine',
      'WhatsApp automated appointment reminders & auto-replies',
      'Owner Executive Dashboard (Daily sales, dues & bookings)',
      '15 Days free hypercare & 100% code ownership',
    ],
  },
];

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'websites',
    title: 'Websites & Landing Pages',
    shortTitle: 'Websites',
    subtitle: 'High-converting, mobile-friendly websites that turn visitors into paying customers.',
    iconName: 'globe',
    items: [
      {
        id: 'landing-page',
        name: 'Single Landing Page',
        price: 'Rs. 2,000',
        numericPrice: 2000,
        type: 'one-time',
        turnaround: '2–3 Days',
        category: 'websites',
        categoryLabel: 'Websites & Landing Pages',
        description: 'Single high-impact page with your offer, photos, lead contact form and direct WhatsApp chat button.',
        deliverables: ['Custom Mobile Layout', 'WhatsApp Click-to-Chat', 'Lead Capture Form', 'Fast Page Load'],
      },
      {
        id: 'website-1page',
        name: 'Business Website (1 Page)',
        price: 'Rs. 3,500',
        numericPrice: 3500,
        type: 'one-time',
        turnaround: '3–4 Days',
        category: 'websites',
        categoryLabel: 'Websites & Landing Pages',
        description: 'Mobile-friendly complete presence with services breakdown, photo gallery, Google Maps location, and contact.',
        deliverables: ['Full Service Showcase', 'Photo Gallery', 'Google Maps Embed', 'Click-to-Call Buttons'],
      },
      {
        id: 'website-multipage',
        name: 'Business Website (Multi-Page)',
        price: 'Rs. 7,000',
        numericPrice: 7000,
        type: 'one-time',
        turnaround: '5–7 Days',
        category: 'websites',
        categoryLabel: 'Websites & Landing Pages',
        description: 'Up to 6 dedicated pages: Home, About Us, Services, Portfolio/Gallery, Testimonials, and Contact.',
        deliverables: ['Up to 6 Custom Pages', 'SEO Fundamentals', 'Inquiry Forms', 'Free 15-Day Support'],
      },
      {
        id: 'portfolio-web',
        name: 'Portfolio Website',
        price: 'Rs. 3,000',
        numericPrice: 3000,
        type: 'one-time',
        turnaround: '3–5 Days',
        category: 'websites',
        categoryLabel: 'Websites & Landing Pages',
        description: 'Personal or professional showcase with fluid animations, case studies, and resume/contact links.',
        deliverables: ['Project Showcase Grid', 'Smooth Micro-Animations', 'Direct Inquiry Form', 'Custom Domain Ready'],
      },
      {
        id: 'digital-menu',
        name: 'Digital Menu / Catalogue + QR',
        price: 'Rs. 1,500',
        numericPrice: 1500,
        type: 'one-time',
        turnaround: '1–2 Days',
        category: 'websites',
        categoryLabel: 'Websites & Landing Pages',
        description: 'Online menu or product catalogue your customers open instantly on their phone by scanning a QR code.',
        deliverables: ['Instant Scan QR Code', 'Mobile Food/Product Menu', 'Category Filtering', 'Print-Ready QR Asset'],
      },
    ],
  },
  {
    id: 'booking',
    title: 'Booking & Operations Tools',
    shortTitle: 'Booking Tools',
    subtitle: 'Automated booking and scheduling engines that eliminate double-bookings and no-shows.',
    iconName: 'calendar',
    items: [
      {
        id: 'online-booking',
        name: 'Online Booking & Slot System',
        price: 'Rs. 8,000',
        numericPrice: 8000,
        type: 'one-time',
        turnaround: '1–2 Weeks',
        category: 'booking',
        categoryLabel: 'Booking & Operations Tools',
        description: 'Customers pick date and time on their phone; you see all bookings in one unified real-time dashboard.',
        deliverables: ['Interactive Slot Picker', 'Admin Calendar View', 'WhatsApp Booking Alerts', 'Overbooking Guard'],
      },
      {
        id: 'clinic-scheduling',
        name: 'Clinic & Salon Appointment System',
        price: 'Rs. 8,000',
        numericPrice: 8000,
        type: 'one-time',
        turnaround: '1–2 Weeks',
        category: 'booking',
        categoryLabel: 'Booking & Operations Tools',
        description: 'Patient and client queue management, doctor/stylist allocations, and automated reminder alerts that slash no-shows.',
        deliverables: ['Digital Waiting Queue', 'Automated 2h Reminders', 'Multi-Doctor Schedules', 'Client History'],
      },
      {
        id: 'membership-system',
        name: 'Membership & Renewal Tracker',
        price: 'Rs. 10,000',
        numericPrice: 10000,
        type: 'one-time',
        turnaround: '1–2 Weeks',
        category: 'booking',
        categoryLabel: 'Booking & Operations Tools',
        description: 'Track gym, academy or studio members, expiry dates, and automatically dispatch renewal alerts on WhatsApp.',
        deliverables: ['Expiry Countdown Ledger', 'Automated WhatsApp Triggers', 'Payment Status Tracking', 'Member Check-In List'],
      },
      {
        id: 'turf-timer',
        name: 'Usage & Time Tracker (Cafes / Turfs)',
        price: 'Rs. 8,000',
        numericPrice: 8000,
        type: 'one-time',
        turnaround: '1–2 Weeks',
        category: 'booking',
        categoryLabel: 'Booking & Operations Tools',
        description: 'Calculate hourly slot fees, overtime minutes, and bill customers with instant accuracy.',
        deliverables: ['Real-time Timer Grid', 'Overtime Fee Calculator', 'Direct WhatsApp Bill', 'Daily Revenue Summary'],
      },
    ],
  },
  {
    id: 'billing-crm',
    title: 'Billing, CRM & Dashboards',
    shortTitle: 'Billing & CRM',
    subtitle: 'Keep your business organized with easy invoicing, customer tracking, and revenue screens.',
    iconName: 'barChart',
    items: [
      {
        id: 'crm-system',
        name: 'Customer & Lead Tracker (CRM)',
        price: 'Rs. 8,000',
        numericPrice: 8000,
        type: 'one-time',
        turnaround: '1–2 Weeks',
        category: 'billing-crm',
        categoryLabel: 'Billing, CRM & Dashboards',
        description: 'Never lose another lead. Keep customer details, follow-up dates, inquiry status, and notes in one place.',
        deliverables: ['Lead Pipeline Status', 'Follow-Up Reminders', 'Customer Contact Log', 'WhatsApp Quick-Chat'],
      },
      {
        id: 'billing-system',
        name: 'Billing & Invoicing System',
        price: 'Rs. 6,000',
        numericPrice: 6000,
        type: 'one-time',
        turnaround: '1–2 Weeks',
        category: 'billing-crm',
        categoryLabel: 'Billing, CRM & Dashboards',
        description: 'Create clean GST/non-GST bills, download PDF invoices, and track who has paid and who owes money.',
        deliverables: ['1-Click PDF Invoices', 'Paid vs Due Tracking', 'Customer Ledger Records', 'WhatsApp Invoice Share'],
      },
      {
        id: 'owner-dashboard',
        name: 'Owner Executive Dashboard',
        price: 'Rs. 5,000',
        numericPrice: 5000,
        type: 'one-time',
        turnaround: '3–5 Days',
        category: 'billing-crm',
        categoryLabel: 'Billing, CRM & Dashboards',
        description: 'One single screen on your phone or laptop showing total sales, daily payments, and pending dues.',
        deliverables: ['Daily/Monthly Revenue', 'Pending Dues Counter', 'Simple Visual Graphs', 'Password Protected'],
      },
    ],
  },
  {
    id: 'whatsapp-automation',
    title: 'WhatsApp Automation & Google',
    shortTitle: 'WhatsApp & Google',
    subtitle: 'Automate customer support and bring in high-intent local customers from Google.',
    iconName: 'messageSquare',
    items: [
      {
        id: 'whatsapp-bot',
        name: 'WhatsApp Auto-Replies & Reminders',
        price: 'Rs. 4,000',
        numericPrice: 4000,
        type: 'one-time',
        turnaround: '2–3 Days',
        category: 'whatsapp-automation',
        categoryLabel: 'WhatsApp Automation & Google',
        description: 'Automatic instant replies to common customer questions, prices, timings, and automated appointment reminders.',
        deliverables: ['FAQ Auto-Response Bot', 'Greeting & Catalog Share', 'Appointment Reminders', 'Keyword Triggers'],
      },
      {
        id: 'google-profile',
        name: 'Google Business Profile Setup',
        price: 'Rs. 1,000',
        numericPrice: 1000,
        type: 'one-time',
        turnaround: '1–2 Days',
        category: 'whatsapp-automation',
        categoryLabel: 'WhatsApp Automation & Google',
        description: 'Create or optimize your verified Google listing so local customers easily find your business on Google Maps.',
        deliverables: ['Google Maps Verification', 'Category & Timings Setup', 'Photos & Menu Upload', 'Search Optimization'],
      },
      {
        id: 'google-review-qr',
        name: 'Google Review QR Stand / Link',
        price: 'Rs. 500',
        numericPrice: 500,
        type: 'one-time',
        turnaround: '24 Hours',
        category: 'whatsapp-automation',
        categoryLabel: 'WhatsApp Automation & Google',
        description: 'A dedicated QR code and smart link that takes happy customers directly to your 5-star Google review box.',
        deliverables: ['Direct 5-Star Review Link', 'Print-Ready QR Graphic', 'Counter Display Design', 'WhatsApp Review Link'],
      },
    ],
  },
  {
    id: 'monthly-plans',
    title: 'Monthly Care & Growth Plans',
    shortTitle: 'Care & Growth',
    subtitle: 'Ongoing hosting, security updates, and marketing to keep your software running flawlessly.',
    iconName: 'trendingUp',
    items: [
      {
        id: 'hosting-support',
        name: 'Hosting, Maintenance & Support',
        price: 'Rs. 500 / mo',
        numericPrice: 500,
        type: 'monthly',
        turnaround: 'Continuous',
        category: 'monthly-plans',
        categoryLabel: 'Monthly Care & Growth Plans',
        description: 'Fast cloud hosting, SSL certificates, security checks, and free minor text/photo updates whenever you need.',
        deliverables: ['High-Speed Hosting', 'Free SSL Encryption', 'Small Monthly Changes', 'Zero Downtime Guard'],
      },
      {
        id: 'review-growth',
        name: 'Google Review Growth & Upkeep',
        price: 'Rs. 1,500 / mo',
        numericPrice: 1500,
        type: 'monthly',
        turnaround: 'Continuous',
        category: 'monthly-plans',
        categoryLabel: 'Monthly Care & Growth Plans',
        description: 'Active review requests to recent customers, professional replies to all reviews, and monthly Google profile posts.',
        deliverables: ['Review Response Manager', 'Monthly Profile Posts', 'Ranking Optimization', 'Reputation Shield'],
      },
      {
        id: 'instagram-mgmt',
        name: 'Instagram Business Management',
        price: 'Rs. 3,000 / mo',
        numericPrice: 3000,
        type: 'monthly',
        turnaround: 'Continuous',
        category: 'monthly-plans',
        categoryLabel: 'Monthly Care & Growth Plans',
        description: 'Professional posters, captions, and reels created and published to grow your local brand on Instagram.',
        deliverables: ['Custom Branded Posters', 'Engaging Captions & Tags', 'Story Promotions', 'Monthly Growth Report'],
      },
    ],
  },
];

// Flat list of all individual services
export const ALL_SERVICES: ServiceItem[] = SERVICE_CATEGORIES.flatMap((c) => c.items);

export const PROJECTS: ProjectItem[] = [
  {
    index: '01',
    name: 'Suhail — Interactive Portfolio & Studio',
    type: 'WEBSITE',
    category: 'Brand Identity & Studio Portfolio',
    summary: 'Ultra-modern interactive portfolio with fluid animations, dynamic work showcase, and client conversion links.',
    businessValue: 'Commands premium positioning for agencies and creatives, turning passive visitors into high-paying client inquiries.',
    features: [
      '60fps GPU-accelerated interactive animations & transitions',
      'Fluid responsive typography that scales across mobile and desktop',
      'Direct WhatsApp and email consultation triggers',
    ],
    liveUrl: 'https://mohammed-suhail.vercel.app/',
    accent: '#00e5ff',
  },
  {
    index: '02',
    name: 'C3 Platform — Event & Pass Registration Hub',
    type: 'WEBSITE',
    category: 'Events & Community Registration',
    summary: 'High-speed participant registration portal and live organizer command center engineered for conferences, college fests, and workshops.',
    businessValue: 'Handled high-traffic ticket registrations with zero crashes. Delivers instant digital passes directly to attendee smartphones.',
    features: [
      'Instant digital QR entry pass & attendee badge generation',
      'Live organizer check-in scanner for fast gate entry',
      'High-conversion registration form with instant confirmation',
    ],
    liveUrl: 'https://c3club.vercel.app',
    accent: '#f59e0b',
  },
  {
    index: '03',
    name: 'NRCHS — New Rosary Convent High School',
    type: 'WEBSITE',
    category: 'Education & Institutional Website',
    summary: 'Complete multi-page school web portal featuring academic programs, admissions desk, campus facilities, and parent contact hub.',
    businessValue: 'Elevates school credibility, automates student admission inquiries, and eliminates manual front-office phone queries.',
    features: [
      'Multi-page architecture (Academics, Facilities, Careers, Gallery)',
      'Digital student admission inquiry & parent contact desk',
      'Optimized for rapid smartphone loading for parents on mobile',
    ],
    liveUrl: '/nrchs/index.html',
    accent: '#10b981',
  },
  {
    index: '04',
    name: 'MahaHealth Connect — Medical Directory Portal',
    type: 'WEBSITE',
    category: 'Healthcare & Public Health Portal',
    summary: 'Unified digital health service hub with doctor discovery, bed availability tracking, medical emergency contacts, and citizen service directory.',
    businessValue: 'Connects patients with verified healthcare facilities and critical hospital resources in real time.',
    features: [
      'Real-time hospital directory & emergency helpline navigation',
      'Specialist doctor directory with department filtering',
      'High-contrast accessible interface engineered for emergency lookup',
    ],
    liveUrl: 'https://mahahealthconnect.vercel.app',
    accent: '#06b6d4',
  },
  {
    index: '05',
    name: '0Queue — Real-Time Appointment & Queue Webapp',
    type: 'MOBILE WEBAPP',
    category: 'Healthcare, Clinics & Salons',
    summary: 'Mobile-first patient waiting room queue workflow, doctor appointment scheduling, and automated waiting token assignment.',
    businessValue: 'Slashes clinic waiting room congestion and reduces appointment no-shows by over 40% with automated reminders.',
    features: [
      'Live waiting room token dispatch engine on mobile',
      'Doctor schedule allocation & emergency slot management',
      'Automated confirmation messages and estimated wait times',
    ],
    liveUrl: 'https://0queue.vercel.app',
    accent: '#3b82f6',
  },
  {
    index: '06',
    name: 'Smart Token Attendance & Client Webapp',
    type: 'MOBILE WEBAPP',
    category: 'Campus & Corporate Mobile Webapp',
    summary: 'Cloud-based QR token attendance tracking with segregated role portals for administrators, staff, and clients with real-time verification.',
    businessValue: 'Eliminates proxy attendance and manual paper registers. Saves 15+ hours of administrative overhead every month.',
    features: [
      'Sub-second rotating QR code mobile scanner',
      'Role-based mobile dashboards (Admin, Faculty, Student)',
      'Instant attendance percentage calculation & exportable reports',
    ],
    liveUrl: 'https://smart-attendance-ecru-nu.vercel.app',
    accent: '#a855f7',
  },
  {
    index: '07',
    name: 'AuraFit — Gym & Membership Webapp',
    type: 'MOBILE WEBAPP',
    category: 'Fitness Studios & Gyms',
    summary: 'Progressive workout and membership tracking portal with subscription management, dues tracker, and mobile offline support.',
    businessValue: 'Automates fee renewals and member tracking. Replaces messy WhatsApp payment chasing with clean automated alerts.',
    features: [
      'Member expiry dates and renewal countdown tracker',
      '1-Click payment reminder dispatch on WhatsApp',
      'Mobile-first layout works like a native app on iOS & Android',
    ],
    liveUrl: 'https://excersise-iota.vercel.app',
    accent: '#ec4899',
  },
];
