import React, { useState, useMemo } from 'react';
import {
  MENU_ITEMS,
  ADDON_OPTIONS,
  RESTAURANT_INFO,
  TESTIMONIALS,
  MenuItem,
  MenuCategory,
} from './data/menuData';
import { ResilientImage } from './components/ResilientImage';

interface CartItem {
  uid: string;
  id: string;
  name: string;
  price: number;
  quantity: number;
  portion: string;
  spice: string;
  addons: string[];
  image: string;
}

type OrderType = 'delivery' | 'takeaway' | 'dinein';

interface ToastState {
  visible: boolean;
  title: string;
  message: string;
  isError: boolean;
}

interface ConfirmedOrderReceipt {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  orderType: OrderType;
  paymentMethod: string;
  total: number;
  items: CartItem[];
  whatsappUrl: string;
}

interface ConfirmedReservation {
  reservationId: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: string;
  seating: string;
  notes: string;
  whatsappUrl: string;
}

const CATEGORIES: { id: MenuCategory; label: string }[] = [
  { id: 'all', label: 'All Blockbusters' },
  { id: 'mutton', label: 'Mutton Mandi' },
  { id: 'chicken', label: 'Chicken Mandi' },
  { id: 'starters', label: 'Starters & Tikka' },
  { id: 'veg', label: 'Veg Mandi & Starters' },
  { id: 'desserts', label: 'Desserts & Goli Soda' },
];

export default function App() {
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  // Navigation & Drawer state
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  // Menu Filter & Search state
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory>('all');
  const [dietFilter, setDietFilter] = useState<'all' | 'nonveg' | 'veg'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Cart & Order state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>('delivery');
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    rate: number;
  } | null>(null);
  const [couponFeedback, setCouponFeedback] = useState<{
    text: string;
    isSuccess: boolean;
  } | null>(null);

  // Dish Customization Modal state
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [portionExtra, setPortionExtra] = useState<number>(0);
  const [spiceLevel, setSpiceLevel] = useState<string>('Medium');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  // Payment / UPI Modal state
  const [upiModalOpen, setUpiModalOpen] = useState(false);
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [confirmedReceipt, setConfirmedReceipt] =
    useState<ConfirmedOrderReceipt | null>(null);

  // Reservation Form state
  const [resName, setResName] = useState('');
  const [resPhone, setResPhone] = useState('');
  const [resDate, setResDate] = useState(todayStr);
  const [resTime, setResTime] = useState('08:30 PM - Dinner');
  const [resGuests, setResGuests] = useState('3-4 Guests');
  const [resSeating, setResSeating] = useState('Arabian Majlis Floor Seating');
  const [resNotes, setResNotes] = useState('');
  const [confirmedReservation, setConfirmedReservation] =
    useState<ConfirmedReservation | null>(null);

  // Toast Notification state
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    title: '',
    message: '',
    isError: false,
  });

  const showNotification = (
    title: string,
    message: string,
    isError = false
  ) => {
    setToast({ visible: true, title, message, isError });
    window.setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3600);
  };

  // Giant platters for the showcase section
  const platterItems = useMemo(
    () => MENU_ITEMS.filter((item) => item.category === 'platters'),
    []
  );

  // Filtered menu items
  const filteredMenuItems = useMemo(() => {
    return MENU_ITEMS.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (dietFilter === 'veg' && !item.isVeg) return false;
      if (dietFilter === 'nonveg' && item.isVeg) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.desc.toLowerCase().includes(q) ||
          item.serves.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedCategory, dietFilter, searchQuery]);

  // Cart Calculations
  const totalCartItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const discountAmount = useMemo(
    () => (appliedCoupon ? Math.round(subtotal * appliedCoupon.rate) : 0),
    [subtotal, appliedCoupon]
  );

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const gstAmount = Math.round(taxableAmount * 0.05);
  const packagingFee =
    cart.length === 0
      ? 0
      : orderType === 'delivery'
      ? 35
      : orderType === 'takeaway'
      ? 25
      : 0;
  const grandTotal = taxableAmount + gstAmount + packagingFee;

  // Open Customize Modal
  const openCustomizeModal = (item: MenuItem) => {
    setCustomizingItem(item);
    setPortionExtra(0);
    setSpiceLevel('Medium');
    setSelectedAddons([]);
  };

  const closeCustomizeModal = () => {
    setCustomizingItem(null);
  };

  const toggleAddon = (addonId: string) => {
    setSelectedAddons((prev) =>
      prev.includes(addonId)
        ? prev.filter((id) => id !== addonId)
        : [...prev, addonId]
    );
  };

  const customizedItemTotal = useMemo(() => {
    if (!customizingItem) return 0;
    const addonsTotal = selectedAddons.reduce((sum, id) => {
      const found = ADDON_OPTIONS.find((a) => a.id === id);
      return sum + (found ? found.price : 0);
    }, 0);
    return customizingItem.price + portionExtra + addonsTotal;
  }, [customizingItem, portionExtra, selectedAddons]);

  const handleConfirmCustomizedItem = () => {
    if (!customizingItem) return;
    const isPlatterOrDessert =
      customizingItem.category === 'platters' ||
      customizingItem.category === 'desserts';
    const portionLabel = isPlatterOrDessert
      ? 'Standard Portion'
      : portionExtra > 0
      ? 'Double Portion'
      : 'Single Portion';

    const addonShortLabels = selectedAddons
      .map((id) => ADDON_OPTIONS.find((a) => a.id === id)?.shortLabel)
      .filter((v): v is string => Boolean(v));

    const uid = `${customizingItem.id}_${portionLabel}_${spiceLevel}_${addonShortLabels.join('-')}`;

    setCart((prev) => {
      const existing = prev.find((i) => i.uid === uid);
      if (existing) {
        return prev.map((i) =>
          i.uid === uid ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          uid,
          id: customizingItem.id,
          name: customizingItem.name,
          price: customizedItemTotal,
          quantity: 1,
          portion: portionLabel,
          spice: spiceLevel,
          addons: addonShortLabels,
          image: customizingItem.image,
        },
      ];
    });

    showNotification(
      'Added to Feast Plate',
      `${customizingItem.name} (${portionLabel}) added to your order.`
    );
    closeCustomizeModal();
    setCartOpen(true);
  };

  const changeItemQty = (uid: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.uid === uid
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleApplyCoupon = (overrideCode?: string) => {
    const code = (overrideCode ?? couponInput).trim().toUpperCase();
    setCouponInput(code);
    if (code === 'TOLLYWOOD15') {
      setAppliedCoupon({ code: 'TOLLYWOOD15', rate: 0.15 });
      setCouponFeedback({
        text: 'Blockbuster 15% discount (TOLLYWOOD15) applied!',
        isSuccess: true,
      });
      showNotification(
        'Coupon Applied',
        '15% movie feast discount applied to your cart.'
      );
    } else {
      setAppliedCoupon(null);
      setCouponFeedback({
        text: 'Invalid coupon code. Try TOLLYWOOD15 for 15% off.',
        isSuccess: false,
      });
    }
  };

  // Build WhatsApp Order URL
  const buildWhatsAppOrderUrl = (
    customHeader?: string,
    extraCustomerLines?: string
  ) => {
    const lines: string[] = [];
    lines.push(
      customHeader || `*NEW ORDER - TOLLYWOOD MANDI (SR NAGAR)*`
    );
    lines.push(`*Type:* ${orderType.toUpperCase()}`);
    if (extraCustomerLines) {
      lines.push(extraCustomerLines);
    }
    lines.push('');

    cart.forEach((item, idx) => {
      const cost = item.price * item.quantity;
      lines.push(`${idx + 1}. *${item.name}* (${item.portion})`);
      lines.push(
        `   • Spice: ${item.spice}${
          item.addons.length ? ' | Extras: ' + item.addons.join(', ') : ''
        }`
      );
      lines.push(`   • Qty: ${item.quantity} x ₹${item.price} = *₹${cost}*`);
      lines.push('');
    });

    lines.push('----------------------------');
    lines.push(`*Subtotal:* ₹${subtotal}`);
    if (discountAmount > 0) {
      lines.push(`*Discount (TOLLYWOOD15):* -₹${discountAmount}`);
    }
    lines.push(`*GST (5%):* ₹${gstAmount}`);
    lines.push(`*Packaging / Delivery:* ₹${packagingFee}`);
    lines.push(`*Total Payable:* *₹${grandTotal}*`);
    lines.push('----------------------------');
    lines.push(
      `*Outlet:* Venkat's Building, 1st Floor, SR Nagar, Ameerpet, Hyderabad`
    );
    lines.push('Please confirm order preparation and dispatch time!');

    return `https://wa.me/${RESTAURANT_INFO.whatsappNumber}?text=${encodeURIComponent(
      lines.join('\n')
    )}`;
  };

  const handleOpenUpiModal = () => {
    if (cart.length === 0) {
      showNotification(
        'Plate is Empty',
        'Add your favorite Mandi items before proceeding to checkout.',
        true
      );
      return;
    }
    setUpiModalOpen(true);
  };

  const handleCompletePayment = (
    method: 'UPI_ONLINE' | 'CASH_ON_DELIVERY'
  ) => {
    const cleanPhone = custPhone.trim();
    if (!cleanPhone) {
      showNotification(
        'Phone Number Required',
        'Please enter your mobile or WhatsApp number so we can reach you.',
        true
      );
      return;
    }

    const orderId = 'TM-' + Math.floor(100000 + Math.random() * 900000);
    const guestName = custName.trim() || 'Valued Guest';
    const addressText = custAddress.trim();

    const customerMeta = [
      `*Order ID:* ${orderId}`,
      `*Customer:* ${guestName} (${cleanPhone})`,
      ...(orderType === 'delivery' && addressText
        ? [`*Delivery Address:* ${addressText}`]
        : []),
      `*Payment Method:* ${
        method === 'UPI_ONLINE' ? 'Paid via UPI QR' : 'Cash / COD'
      }`,
    ].join('\n');

    const waUrl = buildWhatsAppOrderUrl(
      `*ORDER CONFIRMATION - TOLLYWOOD MANDI*`,
      customerMeta
    );

    setConfirmedReceipt({
      orderId,
      customerName: guestName,
      customerPhone: cleanPhone,
      customerAddress: addressText,
      orderType,
      paymentMethod:
        method === 'UPI_ONLINE'
          ? 'UPI QR Online'
          : 'Cash on Delivery / Pay at Desk',
      total: grandTotal,
      items: [...cart],
      whatsappUrl: waUrl,
    });

    setUpiModalOpen(false);
    setCartOpen(false);
    setCart([]);
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponFeedback(null);

    showNotification(
      'Order Confirmed!',
      `Order ${orderId} recorded. Click "Send Receipt on WhatsApp" to notify the SR Nagar kitchen.`
    );
  };

  const handleReservationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resName.trim() || !resPhone.trim()) {
      showNotification(
        'Missing Details',
        'Please provide your name and phone number to reserve a cabin.',
        true
      );
      return;
    }

    const reservationId = 'MAJLIS-' + Math.floor(1000 + Math.random() * 9000);
    const lines = [
      `*NEW MAJLIS RESERVATION - TOLLYWOOD MANDI*`,
      `*Booking Ref:* ${reservationId}`,
      `*Guest Name:* ${resName.trim()}`,
      `*Phone:* ${resPhone.trim()}`,
      `*Date:* ${resDate}`,
      `*Time Slot:* ${resTime}`,
      `*Guests:* ${resGuests}`,
      `*Seating:* ${resSeating}`,
      ...(resNotes.trim() ? [`*Special Request:* ${resNotes.trim()}`] : []),
      '',
      `*Outlet:* Venkat's Building, 1st Floor, SR Nagar, Ameerpet, Hyderabad`,
      `Please reserve and confirm our cabin!`,
    ];

    const whatsappUrl = `https://wa.me/${
      RESTAURANT_INFO.whatsappNumber
    }?text=${encodeURIComponent(lines.join('\n'))}`;

    setConfirmedReservation({
      reservationId,
      name: resName.trim(),
      phone: resPhone.trim(),
      date: resDate,
      time: resTime,
      guests: resGuests,
      seating: resSeating,
      notes: resNotes.trim(),
      whatsappUrl,
    });

    showNotification(
      'Majlis Cabin Reserved!',
      `Booking ${reservationId} ready for ${resName.trim()}.`
    );
  };

  const upiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    `upi://pay?pa=${RESTAURANT_INFO.upiId}&pn=TollywoodMandi&am=${grandTotal}&cu=INR`
  )}`;

  return (
    <div className="min-h-screen bg-[#F5EFE3] text-[#39332D] font-sans overflow-x-hidden">
      {/* Main Navigation Header (#F5EFE3 Warm Cream, Strict 3-Zone Top Bar Contract) */}
      <header className="sticky top-0 z-40 bg-[#F5EFE3]/95 backdrop-blur-md border-b border-[#D8C9AF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <a
            href="#home"
            className="font-cinzel text-xl sm:text-2xl font-bold tracking-wider text-[#171717] hover:text-[#B58A3A] transition-colors whitespace-nowrap shrink-0"
          >
            Tollywood Mandi
          </a>

          {/* Zone 2: 5 Concise Single-Line Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#39332D]">
            <a
              href="#platters"
              className="hover:text-[#171717] hover:underline underline-offset-4 decoration-[#B58A3A] transition-colors whitespace-nowrap shrink-0"
            >
              Giant Trays
            </a>
            <a
              href="#menu"
              className="hover:text-[#171717] hover:underline underline-offset-4 decoration-[#B58A3A] transition-colors whitespace-nowrap shrink-0"
            >
              Movie Menu
            </a>
            <a
              href="#ambience"
              className="hover:text-[#171717] hover:underline underline-offset-4 decoration-[#B58A3A] transition-colors whitespace-nowrap shrink-0"
            >
              Majlis Cabins
            </a>
            <a
              href="#booking"
              className="hover:text-[#171717] hover:underline underline-offset-4 decoration-[#B58A3A] transition-colors whitespace-nowrap shrink-0"
            >
              Book Table
            </a>
            <a
              href="#contact"
              className="hover:text-[#171717] hover:underline underline-offset-4 decoration-[#B58A3A] transition-colors whitespace-nowrap shrink-0"
            >
              Location
            </a>
          </nav>

          {/* Zone 3: Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setCartOpen(true)}
              className="min-h-[44px] bg-[#B58A3A] hover:bg-[#9f772e] text-[#171717] text-xs font-bold px-4 py-2.5 rounded-lg shadow-xs transition flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
              aria-label="Open Feast Plate Cart"
            >
              <i className="fa-solid fa-basket-shopping" />
              <span>Feast Plate ({totalCartItems})</span>
            </button>
            <button
              onClick={() => setMobileNavOpen((prev) => !prev)}
              className="lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center text-[#171717] hover:text-[#B58A3A] p-2 text-xl cursor-pointer"
              aria-label="Toggle Navigation"
            >
              <i
                className={`fa-solid ${mobileNavOpen ? 'fa-xmark' : 'fa-bars'}`}
              />
            </button>
          </div>
        </div>

        {/* Mobile Drawer Navigation */}
        {mobileNavOpen && (
          <div className="lg:hidden bg-[#F5EFE3] border-b border-[#D8C9AF] px-6 py-5 space-y-2 text-sm">
            <a
              href="#platters"
              onClick={() => setMobileNavOpen(false)}
              className="block py-2.5 text-[#171717] font-medium hover:text-[#B58A3A]"
            >
              Bahubali Giant Trays
            </a>
            <a
              href="#menu"
              onClick={() => setMobileNavOpen(false)}
              className="block py-2.5 text-[#171717] font-medium hover:text-[#B58A3A]"
            >
              Tollywood Blockbuster Menu
            </a>
            <a
              href="#ambience"
              onClick={() => setMobileNavOpen(false)}
              className="block py-2.5 text-[#171717] font-medium hover:text-[#B58A3A]"
            >
              Majlis Floor Cabins
            </a>
            <a
              href="#booking"
              onClick={() => setMobileNavOpen(false)}
              className="block py-2.5 text-[#171717] font-medium hover:text-[#B58A3A]"
            >
              Book Majlis Cabin
            </a>
            <a
              href="#contact"
              onClick={() => setMobileNavOpen(false)}
              className="block py-2.5 text-[#171717] font-medium hover:text-[#B58A3A]"
            >
              Location &amp; Directions
            </a>
            <div className="pt-3 border-t border-[#D8C9AF] flex flex-col gap-2.5">
              <a
                href={`tel:${RESTAURANT_INFO.phone.replace(/\s+/g, '')}`}
                className="min-h-[44px] bg-[#EDE3D2] border border-[#D8C9AF] text-[#171717] py-2.5 rounded-lg text-center font-semibold flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-phone text-[#B58A3A]" />
                <span>Call {RESTAURANT_INFO.phone}</span>
              </a>
              <a
                href={`https://wa.me/${RESTAURANT_INFO.whatsappNumber}?text=${encodeURIComponent(
                  'Hello Tollywood Mandi, I want to order food'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] bg-[#6B2525] text-[#F5EFE3] py-2.5 rounded-lg text-center font-bold flex items-center justify-center gap-2"
              >
                <i className="fa-brands fa-whatsapp" />
                <span>WhatsApp Order</span>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section (Warm Cream #F5EFE3 Background with Editorial Split Showcase) */}
      <section
        id="home"
        className="bg-[#F5EFE3] border-b border-[#D8C9AF] py-12 sm:py-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            {/* Left Column: Hero Editorial Copy */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-6 text-left">
              {/* Unboxed Regional & Operating Metadata */}
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-[#39332D] font-medium">
                <span>SR Nagar, Ameerpet, Hyderabad</span>
                <span aria-hidden="true" className="text-[#B58A3A]">
                  ·
                </span>
                <span>Open Daily 12:30 PM to 01:00 AM</span>
                <span aria-hidden="true" className="text-[#B58A3A]">
                  ·
                </span>
                <a
                  href="tel:+919866615115"
                  className="text-[#171717] font-semibold hover:text-[#B58A3A] underline underline-offset-4"
                >
                  +91 98666 15115
                </a>
              </div>

              <h1
                className="font-cinzel text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#171717] leading-[1.12]"
                style={{ textWrap: 'balance' }}
              >
                Blockbuster Flavors,{' '}
                <span className="text-[#6B2525]">Mass Maharajah Feasts</span>
              </h1>

              <p className="text-base sm:text-lg text-[#39332D] max-w-2xl font-normal leading-relaxed">
                Relish Hyderabad&apos;s signature{' '}
                <strong className="text-[#171717] font-semibold">
                  Bahubali Giant Mandi
                </strong>
                ,{' '}
                <strong className="text-[#171717] font-semibold">
                  Kushi Mutton Juicy
                </strong>
                , and{' '}
                <strong className="text-[#171717] font-semibold">
                  RRR Chicken Mandi
                </strong>{' '}
                in authentic Arabian Majlis private floor cabins at SR Nagar.
              </p>

              {/* CTA Actions */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <a
                  href="#menu"
                  className="min-h-[46px] bg-[#B58A3A] hover:bg-[#9f772e] text-[#171717] font-bold px-7 py-3.5 rounded-xl shadow-xs transform hover:-translate-y-0.5 transition flex items-center gap-2 whitespace-nowrap shrink-0"
                >
                  <i className="fa-solid fa-utensils" />
                  <span>Explore Blockbuster Menu</span>
                </a>
                <a
                  href="#booking"
                  className="min-h-[46px] bg-[#6B2525] hover:bg-[#561d1d] text-[#F5EFE3] font-semibold px-7 py-3.5 rounded-xl shadow-xs hover:-translate-y-0.5 transition flex items-center gap-2 whitespace-nowrap shrink-0"
                >
                  <i className="fa-solid fa-couch" />
                  <span>Book Majlis Cabin</span>
                </a>
                <a
                  href={`https://wa.me/${RESTAURANT_INFO.whatsappNumber}?text=${encodeURIComponent(
                    'Hello Tollywood Mandi, I want to order food or reserve a table'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[46px] bg-[#EDE3D2] hover:bg-[#e3d5be] border border-[#D8C9AF] text-[#171717] font-semibold px-6 py-3.5 rounded-xl flex items-center gap-2 hover:-translate-y-0.5 transition whitespace-nowrap shrink-0"
                >
                  <i className="fa-brands fa-whatsapp text-lg text-[#6B2525]" />
                  <span>Direct WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Right Column: Rich Food Photography Frame */}
            <div className="lg:col-span-5">
              <div className="h-full min-h-[320px] sm:min-h-[380px] rounded-2xl overflow-hidden border border-[#D8C9AF] bg-[#EDE3D2] relative shadow-md">
                <ResilientImage
                  src="https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop"
                  alt="Tollywood Mandi Royal Platter"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-[#F5EFE3] flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs text-[#F5EFE3]/85">
                      Signature Group Platter
                    </p>
                    <p className="font-cinzel text-lg font-bold">
                      Bahubali Giant Mandi Tray
                    </p>
                  </div>
                  <span className="text-sm font-bold bg-[#B58A3A] text-[#171717] px-3 py-1 rounded-md tabular-nums">
                    ₹3,299
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Full-Width 4-Column Quick Metrics Row (#EDE3D2 Panels) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
            <div className="bg-[#EDE3D2] p-4 rounded-xl border border-[#D8C9AF]">
              <p className="text-xs text-[#39332D]">Signature Cuts</p>
              <p className="text-sm font-bold text-[#171717] mt-0.5">
                Juicy &amp; Charcoal Faham
              </p>
            </div>
            <div className="bg-[#EDE3D2] p-4 rounded-xl border border-[#D8C9AF]">
              <p className="text-xs text-[#39332D]">Giant Family Trays</p>
              <p className="text-sm font-bold text-[#171717] mt-0.5 tabular-nums">
                Bahubali (7–8 Pax)
              </p>
            </div>
            <div className="bg-[#EDE3D2] p-4 rounded-xl border border-[#D8C9AF]">
              <p className="text-xs text-[#39332D]">Diner Rating</p>
              <p className="text-sm font-bold text-[#171717] mt-0.5 tabular-nums">
                4.1★ · SR Nagar
              </p>
            </div>
            <div className="bg-[#EDE3D2] p-4 rounded-xl border border-[#D8C9AF]">
              <p className="text-xs text-[#39332D]">Midnight Dining</p>
              <p className="text-sm font-bold text-[#171717] mt-0.5 tabular-nums">
                Open Till 1:00 AM
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Giant Platters Showcase Section (#F5EFE3 Section Background, #EDE3D2 Cards) */}
      <section
        id="platters"
        className="py-16 bg-[#F5EFE3] border-b border-[#D8C9AF]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <p className="text-xs text-[#6B2525] font-semibold tracking-wider">
              Mega Family &amp; Gang Feasts
            </p>
            <h2
              className="font-cinzel text-3xl sm:text-4xl font-bold text-[#171717] mt-1"
              style={{ textWrap: 'balance' }}
            >
              Tollywood Giant Mandi Trays
            </h2>
            <div className="w-16 h-0.5 bg-[#B58A3A] mx-auto my-3" />
            <p className="text-[#39332D] text-sm leading-relaxed">
              Slow-cooked fragrant Yemeni basmati rice topped with hand-roasted
              meats, roasted cashews, golden raisins, unlimited Arabic Mandi
              shorba soup, and house-blended garlic toum mayonnaise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {platterItems.map((platter) => (
              <div
                key={platter.id}
                className="bg-[#EDE3D2] rounded-2xl overflow-hidden border border-[#D8C9AF] hover:border-[#B58A3A] transition duration-200 flex flex-col justify-between group"
              >
                <div className="h-60 overflow-hidden relative bg-[#E3D5BE]">
                  <ResilientImage
                    src={platter.image}
                    alt={platter.name}
                    fallbackLabel={platter.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                  <div>
                    {/* Clean unboxed metadata kicker */}
                    <div className="flex items-center gap-2 text-xs text-[#39332D] mb-1.5">
                      <span className="text-[#6B2525] font-semibold">
                        {platter.filmTag || 'Family Platter'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{platter.serves}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums font-medium">
                        <span className="text-[#B58A3A]">★</span>{' '}
                        {platter.rating}
                      </span>
                    </div>

                    <div className="flex justify-between items-baseline gap-3">
                      <h3 className="font-cinzel text-xl font-bold text-[#171717]">
                        {platter.name.replace(/\s*\([^)]*\)/, '')}
                      </h3>
                      <span className="text-[#171717] font-bold text-xl tabular-nums shrink-0">
                        ₹{platter.price.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <p className="text-[#39332D] text-xs leading-relaxed mt-2.5">
                      {platter.desc}
                    </p>
                  </div>

                  <button
                    onClick={() => openCustomizeModal(platter)}
                    className="min-h-[44px] w-full bg-[#B58A3A] hover:bg-[#9f772e] text-[#171717] font-bold py-2.5 px-4 rounded-lg text-xs tracking-wide flex items-center justify-center gap-2 transition cursor-pointer whitespace-nowrap"
                  >
                    <i className="fa-solid fa-cart-plus" />
                    <span>
                      Add {platter.name.replace(/\s*\([^)]*\)/, '')}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Full Interactive Menu (#F5EFE3 Background, #EDE3D2 Dish Cards) */}
      <section
        id="menu"
        className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto arabic-pattern"
      >
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs text-[#6B2525] font-semibold tracking-wider">
            SR Nagar Official Menu · Coupon: TOLLYWOOD15 for 15% Off
          </p>
          <h2
            className="font-cinzel text-3xl sm:text-5xl font-bold mt-1 text-[#171717]"
            style={{ textWrap: 'balance' }}
          >
            Tollywood Blockbuster Menu
          </h2>
          <div className="w-16 h-0.5 bg-[#B58A3A] mx-auto my-3" />
          <p className="text-[#39332D] text-sm leading-relaxed">
            Every dish is christened with Telugu cinematic folklore and
            perfected with slow-steamed Mandi basmati rice, charred tandoori
            cuts, and Hyderabadi desi ghee roasts.
          </p>
        </div>

        {/* Search & Interactive Filter Controls */}
        <div className="space-y-4 mb-10">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 max-w-4xl mx-auto">
            {/* Search Input */}
            <div className="relative flex-1">
              <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-[#39332D] text-sm" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search RRR Chicken, Pushpa Drumsticks, Salaar Mutton, Apricot Delight..."
                className="w-full min-h-[44px] bg-[#EDE3D2] border border-[#D8C9AF] rounded-lg pl-11 pr-9 py-2.5 text-sm text-[#171717] placeholder-[#39332D]/60 focus:outline-none focus:border-[#B58A3A]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#39332D] hover:text-[#171717] p-1 text-xs cursor-pointer"
                  aria-label="Clear search"
                >
                  <i className="fa-solid fa-xmark" />
                </button>
              )}
            </div>

            {/* Diet Segmented Control */}
            <div className="flex items-center gap-1 p-1 bg-[#EDE3D2] border border-[#D8C9AF] rounded-lg self-center sm:self-auto shrink-0">
              <button
                onClick={() => setDietFilter('all')}
                className={`min-h-[36px] px-3.5 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer whitespace-nowrap ${
                  dietFilter === 'all'
                    ? 'bg-[#B58A3A] text-[#171717]'
                    : 'text-[#39332D] hover:text-[#171717]'
                }`}
              >
                All ({MENU_ITEMS.length})
              </button>
              <button
                onClick={() => setDietFilter('nonveg')}
                className={`min-h-[36px] px-3.5 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer whitespace-nowrap ${
                  dietFilter === 'nonveg'
                    ? 'bg-[#B58A3A] text-[#171717]'
                    : 'text-[#39332D] hover:text-[#171717]'
                }`}
              >
                Non-Veg
              </button>
              <button
                onClick={() => setDietFilter('veg')}
                className={`min-h-[36px] px-3.5 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer whitespace-nowrap ${
                  dietFilter === 'veg'
                    ? 'bg-[#B58A3A] text-[#171717]'
                    : 'text-[#39332D] hover:text-[#171717]'
                }`}
              >
                Pure Veg
              </button>
            </div>
          </div>

          {/* Interactive Category Filter Bar */}
          <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 hide-scrollbar">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`min-h-[42px] px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold border transition cursor-pointer whitespace-nowrap shrink-0 ${
                    active
                      ? 'border-[#B58A3A] bg-[#B58A3A] text-[#171717] shadow-xs'
                      : 'border-[#D8C9AF] bg-[#EDE3D2] text-[#39332D] hover:border-[#B58A3A] hover:text-[#171717]'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Menu Grid */}
        {filteredMenuItems.length === 0 ? (
          <div className="text-center py-14 bg-[#EDE3D2] rounded-2xl border border-[#D8C9AF] space-y-3 max-w-lg mx-auto">
            <p className="text-[#39332D] text-sm">
              No dishes matched &ldquo;{searchQuery}&rdquo; in this filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setDietFilter('all');
              }}
              className="text-[#6B2525] text-xs font-semibold hover:underline cursor-pointer"
            >
              Reset Filters &amp; Show All Dishes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredMenuItems.map((item) => (
              <div
                key={item.id}
                className="bg-[#EDE3D2] rounded-2xl overflow-hidden border border-[#D8C9AF] flex flex-col justify-between group hover:border-[#B58A3A] hover:-translate-y-0.5 transition duration-200"
              >
                <div className="relative h-56 overflow-hidden bg-[#E3D5BE]">
                  <ResilientImage
                    src={item.image}
                    alt={item.name}
                    fallbackLabel={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-[#F5EFE3]">
                    <span>
                      {item.isVeg ? 'Vegetarian' : 'Non-Veg'} · {item.serves}
                    </span>
                    <span className="text-[#F5EFE3] font-semibold tabular-nums">
                      <span className="text-[#B58A3A]">★</span> {item.rating}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    {item.bestseller && (
                      <p className="text-[11px] font-semibold text-[#6B2525] mb-1">
                        Signature Bestseller
                      </p>
                    )}
                    <h3 className="font-cinzel font-bold text-lg text-[#171717] leading-snug">
                      {item.name}
                    </h3>
                    <p className="text-[#39332D] text-xs leading-relaxed font-normal mt-1.5 line-clamp-2">
                      {item.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#D8C9AF] flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[11px] text-[#39332D] block">
                        Price
                      </span>
                      <span className="text-xl font-bold text-[#171717] tabular-nums">
                        ₹{item.price.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <button
                      onClick={() => openCustomizeModal(item)}
                      className="min-h-[42px] bg-[#B58A3A] hover:bg-[#9f772e] active:scale-95 text-[#171717] font-bold text-xs px-4 py-2.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <i className="fa-solid fa-plus" />
                      <span>Customize &amp; Add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Our Story, Ambience & Gallery Section (#F5EFE3 Background, #EDE3D2 Panels) */}
      <section
        id="ambience"
        className="py-16 bg-[#F5EFE3] border-y border-[#D8C9AF]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
            <div className="flex flex-col justify-center space-y-5">
              <p className="text-xs text-[#6B2525] font-semibold tracking-wider">
                Our Story &amp; Authentic Arabian Majlis Ambience
              </p>
              <h2
                className="font-cinzel text-3xl sm:text-4xl font-bold text-[#171717]"
                style={{ textWrap: 'balance' }}
              >
                Floor Seating Meets Telugu Film Nostalgia
              </h2>
              <p className="text-[#39332D] text-sm leading-relaxed">
                Step into Hyderabad&apos;s grandest cinematic dining venue. At
                Tollywood Mandi SR Nagar, we blend traditional Persian carpet
                floor-seating (Majlis) with iconic Telugu cinema posters, warm
                brass chandeliers, and curtained private family dining cabins.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                <div className="bg-[#EDE3D2] p-4 rounded-xl border border-[#D8C9AF] space-y-1">
                  <h4 className="font-semibold text-[#171717] text-sm">
                    01. Family Majlis Cabins
                  </h4>
                  <p className="text-[#39332D] text-xs leading-relaxed">
                    Private curtained cabins with low wooden dastarkhwan tables
                    and plush floor cushions.
                  </p>
                </div>
                <div className="bg-[#EDE3D2] p-4 rounded-xl border border-[#D8C9AF] space-y-1">
                  <h4 className="font-semibold text-[#171717] text-sm">
                    02. Blockbuster Soundtracks
                  </h4>
                  <p className="text-[#39332D] text-xs leading-relaxed">
                    Enjoy evergreen and chartbuster Telugu cinema melodies while
                    feasting with your gang.
                  </p>
                </div>
                <div className="bg-[#EDE3D2] p-4 rounded-xl border border-[#D8C9AF] space-y-1">
                  <h4 className="font-semibold text-[#171717] text-sm">
                    03. Group Celebrations
                  </h4>
                  <p className="text-[#39332D] text-xs leading-relaxed">
                    Spacious 8 to 15-person cabins tailored for birthdays,
                    college treats, and team dinners.
                  </p>
                </div>
                <div className="bg-[#EDE3D2] p-4 rounded-xl border border-[#D8C9AF] space-y-1">
                  <h4 className="font-semibold text-[#171717] text-sm">
                    04. Unlimited Hot Shorba
                  </h4>
                  <p className="text-[#39332D] text-xs leading-relaxed">
                    Complimentary spiced Arabic bone broth served piping hot at
                    every table before your Mandi arrives.
                  </p>
                </div>
              </div>
            </div>

            {/* Gallery Photo Collage */}
            <div className="grid grid-cols-2 gap-3">
              <ResilientImage
                src="https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop"
                alt="Royal Mandi Platter Presentation"
                className="rounded-xl object-cover h-48 sm:h-56 w-full border border-[#D8C9AF]"
              />
              <ResilientImage
                src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=600&auto=format&fit=crop"
                alt="Tollywood Mandi Dining Interior"
                className="rounded-xl object-cover h-48 sm:h-56 w-full border border-[#D8C9AF]"
              />
              <ResilientImage
                src="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=600&auto=format&fit=crop"
                alt="Spiced Yemeni Basmati Rice and Roast"
                className="rounded-xl object-cover h-48 sm:h-56 w-full border border-[#D8C9AF]"
              />
              <ResilientImage
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&auto=format&fit=crop"
                alt="Warm Chandelier Majlis Seating"
                className="rounded-xl object-cover h-48 sm:h-56 w-full border border-[#D8C9AF]"
              />
            </div>
          </div>

          {/* Adjacent Diner Testimonials */}
          <div className="pt-8 border-t border-[#D8C9AF]">
            <div className="text-center max-w-xl mx-auto mb-8">
              <p className="text-xs text-[#6B2525] font-semibold tracking-wider">
                Verified Hyderabadi Diners
              </p>
              <h3 className="font-cinzel text-2xl sm:text-3xl font-bold text-[#171717] mt-1">
                What SR Nagar Foodies Say
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#EDE3D2] p-6 rounded-2xl border border-[#D8C9AF] flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#B58A3A] font-bold">★★★★★</span>
                      <span className="text-[#39332D] font-medium">
                        {item.dishOrdered}
                      </span>
                    </div>
                    <p className="text-[#171717] text-xs sm:text-sm leading-relaxed">
                      &ldquo;{item.quote}&rdquo;
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#D8C9AF] flex items-center justify-between text-xs">
                    <span className="font-bold text-[#171717]">
                      {item.author}
                    </span>
                    <span className="text-[#39332D]">{item.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Table & Majlis Reservation Section (#F5EFE3 Page Canvas, #EDE3D2 Panel) */}
      <section
        id="booking"
        className="py-16 bg-[#F5EFE3] max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="bg-[#EDE3D2] rounded-3xl p-6 sm:p-10 border border-[#D8C9AF] royal-glow">
          <div className="text-center max-w-xl mx-auto mb-8">
            <p className="text-xs text-[#6B2525] font-semibold tracking-wider">
              Zero Waiting Time at SR Nagar
            </p>
            <h2
              className="font-cinzel text-2xl sm:text-4xl font-bold text-[#171717] mt-1"
              style={{ textWrap: 'balance' }}
            >
              Reserve Your Majlis Cabin
            </h2>
            <div className="w-16 h-0.5 bg-[#B58A3A] mx-auto my-2.5" />
            <p className="text-[#39332D] text-xs sm:text-sm">
              Skip weekend queues. Reserve a private curtained Arabian Majlis
              floor cabin or standard AC table in advance.
            </p>
          </div>

          {confirmedReservation ? (
            <div className="bg-[#F5EFE3] border border-[#D8C9AF] rounded-2xl p-6 max-w-xl mx-auto space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-[#6B2525] text-[#F5EFE3] flex items-center justify-center mx-auto text-xl">
                <i className="fa-solid fa-check" />
              </div>
              <h3 className="font-cinzel text-xl font-bold text-[#171717]">
                Reservation Pass Ready ({confirmedReservation.reservationId})
              </h3>
              <p className="text-xs text-[#39332D]">
                Reserved for{' '}
                <strong className="text-[#171717]">
                  {confirmedReservation.name}
                </strong>{' '}
                ({confirmedReservation.phone}) on{' '}
                <strong className="text-[#6B2525]">
                  {confirmedReservation.date}
                </strong>{' '}
                at{' '}
                <strong className="text-[#6B2525]">
                  {confirmedReservation.time}
                </strong>
              </p>
              <div className="text-xs text-[#39332D] space-y-1 bg-[#EDE3D2] p-3.5 rounded-xl border border-[#D8C9AF]">
                <p>
                  Seating:{' '}
                  <span className="text-[#171717] font-semibold">
                    {confirmedReservation.seating}
                  </span>{' '}
                  · Guests:{' '}
                  <span className="text-[#171717] font-semibold">
                    {confirmedReservation.guests}
                  </span>
                </p>
                {confirmedReservation.notes && (
                  <p>
                    Notes:{' '}
                    <span className="text-[#171717]">
                      {confirmedReservation.notes}
                    </span>
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <a
                  href={confirmedReservation.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] bg-[#B58A3A] hover:bg-[#9f772e] text-[#171717] font-bold px-6 py-3 rounded-xl text-xs flex items-center gap-2 shadow-xs transition"
                >
                  <i className="fa-brands fa-whatsapp text-base" />
                  <span>Send Booking to SR Nagar Desk on WhatsApp</span>
                </a>
                <button
                  onClick={() => {
                    setConfirmedReservation(null);
                    setResName('');
                    setResPhone('');
                    setResNotes('');
                  }}
                  className="min-h-[44px] bg-[#EDE3D2] hover:bg-[#e3d5be] border border-[#D8C9AF] text-[#171717] font-semibold px-4 py-3 rounded-xl text-xs transition cursor-pointer"
                >
                  Book Another Cabin
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleReservationSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={resName}
                    onChange={(e) => setResName(e.target.value)}
                    placeholder="e.g. Sravan Reddy"
                    className="w-full min-h-[44px] bg-[#F5EFE3] border border-[#D8C9AF] rounded-lg px-4 py-2.5 text-xs sm:text-sm text-[#171717] placeholder-[#39332D]/55 focus:outline-none focus:border-[#B58A3A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1">
                    Phone / WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={resPhone}
                    onChange={(e) => setResPhone(e.target.value)}
                    placeholder="e.g. 98666 15115"
                    className="w-full min-h-[44px] bg-[#F5EFE3] border border-[#D8C9AF] rounded-lg px-4 py-2.5 text-xs sm:text-sm text-[#171717] placeholder-[#39332D]/55 focus:outline-none focus:border-[#B58A3A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1">
                    Reservation Date *
                  </label>
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={resDate}
                    onChange={(e) => setResDate(e.target.value)}
                    className="w-full min-h-[44px] bg-[#F5EFE3] border border-[#D8C9AF] rounded-lg px-4 py-2.5 text-xs sm:text-sm text-[#171717] focus:outline-none focus:border-[#B58A3A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1">
                    Time Slot *
                  </label>
                  <select
                    value={resTime}
                    onChange={(e) => setResTime(e.target.value)}
                    className="w-full min-h-[44px] bg-[#F5EFE3] border border-[#D8C9AF] rounded-lg px-4 py-2.5 text-xs sm:text-sm text-[#171717] focus:outline-none focus:border-[#B58A3A]"
                  >
                    <option value="12:30 PM - Lunch">12:30 PM (Lunch)</option>
                    <option value="01:30 PM - Lunch">01:30 PM (Lunch)</option>
                    <option value="02:30 PM - Lunch">02:30 PM (Lunch)</option>
                    <option value="07:00 PM - Dinner">07:00 PM (Dinner)</option>
                    <option value="08:30 PM - Dinner">
                      08:30 PM (Prime Dinner)
                    </option>
                    <option value="09:30 PM - Dinner">
                      09:30 PM (Late Dinner)
                    </option>
                    <option value="11:00 PM - Midnight">
                      11:00 PM (Midnight Feast)
                    </option>
                    <option value="12:00 AM - Midnight">
                      12:00 AM (Midnight Special)
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1">
                    Number of Guests *
                  </label>
                  <select
                    value={resGuests}
                    onChange={(e) => setResGuests(e.target.value)}
                    className="w-full min-h-[44px] bg-[#F5EFE3] border border-[#D8C9AF] rounded-lg px-4 py-2.5 text-xs sm:text-sm text-[#171717] focus:outline-none focus:border-[#B58A3A]"
                  >
                    <option value="2 Guests">2 Persons (Couple)</option>
                    <option value="3-4 Guests">3 – 4 Persons</option>
                    <option value="5-7 Guests">5 – 7 Persons</option>
                    <option value="8-12 Guests (Bahubali Feast)">
                      8 – 12 Persons (Bahubali Feast)
                    </option>
                    <option value="15+ Guests (Party)">
                      15+ Persons (Private Party)
                    </option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1">
                    Preferred Seating Style
                  </label>
                  <select
                    value={resSeating}
                    onChange={(e) => setResSeating(e.target.value)}
                    className="w-full min-h-[44px] bg-[#F5EFE3] border border-[#D8C9AF] rounded-lg px-4 py-2.5 text-xs sm:text-sm text-[#171717] focus:outline-none focus:border-[#B58A3A]"
                  >
                    <option value="Arabian Majlis Floor Seating">
                      Arabian Majlis Floor Seating (Carpet &amp; Cushions)
                    </option>
                    <option value="Private Family Cabin">
                      Private Family Cabin (Curtained)
                    </option>
                    <option value="Standard AC Table Seating">
                      Standard AC Table Seating (Chairs)
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1">
                    Special Occasion / Requests
                  </label>
                  <input
                    type="text"
                    value={resNotes}
                    onChange={(e) => setResNotes(e.target.value)}
                    placeholder="e.g. Birthday celebration, extra spicy mandi"
                    className="w-full min-h-[44px] bg-[#F5EFE3] border border-[#D8C9AF] rounded-lg px-4 py-2.5 text-xs sm:text-sm text-[#171717] placeholder-[#39332D]/55 focus:outline-none focus:border-[#B58A3A]"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="min-h-[46px] w-full bg-[#B58A3A] hover:bg-[#9f772e] text-[#171717] font-bold py-3.5 rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <i className="fa-solid fa-calendar-check" />
                  <span>
                    Generate Reservation Pass &amp; Confirm via WhatsApp
                  </span>
                </button>
                <p className="text-center text-[11px] text-[#39332D] mt-2">
                  Instant confirmation sent directly to our SR Nagar front desk
                  phone ({RESTAURANT_INFO.phone}).
                </p>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* Contact & Verified Location Section (#F5EFE3 Background) */}
      <section
        id="contact"
        className="py-16 bg-[#F5EFE3] border-t border-[#D8C9AF]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Location Info */}
            <div className="space-y-6">
              <div>
                <p className="text-xs text-[#6B2525] font-semibold tracking-wider">
                  Reach Our SR Nagar Outlet
                </p>
                <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-[#171717] mt-1">
                  Visit Tollywood Mandi
                </h2>
                <div className="w-16 h-0.5 bg-[#B58A3A] my-2.5" />
              </div>

              <div className="space-y-4 text-[#39332D] text-xs sm:text-sm">
                <div className="bg-[#EDE3D2] p-4 rounded-xl border border-[#D8C9AF] space-y-1">
                  <h4 className="font-semibold text-[#171717]">Full Address</h4>
                  <p className="text-[#39332D] leading-relaxed">
                    {RESTAURANT_INFO.address}
                  </p>
                </div>

                <div className="bg-[#EDE3D2] p-4 rounded-xl border border-[#D8C9AF] space-y-1">
                  <h4 className="font-semibold text-[#171717]">
                    Operating Hours
                  </h4>
                  <p className="text-[#39332D]">
                    Monday – Sunday: 12:30 PM to 01:00 AM (Midnight dining,
                    takeaway &amp; home delivery)
                  </p>
                </div>

                <div className="bg-[#EDE3D2] p-4 rounded-xl border border-[#D8C9AF] space-y-1">
                  <h4 className="font-semibold text-[#171717]">
                    Direct Phone &amp; WhatsApp
                  </h4>
                  <p>
                    <a
                      href="tel:+919866615115"
                      className="hover:underline font-bold text-[#6B2525] tabular-nums"
                    >
                      {RESTAURANT_INFO.phone}
                    </a>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href={RESTAURANT_INFO.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] bg-[#B58A3A] hover:bg-[#9f772e] text-[#171717] font-bold px-6 py-3 rounded-xl text-xs flex items-center gap-2 shadow-xs transition whitespace-nowrap"
                >
                  <i className="fa-solid fa-diamond-turn-right text-base" />
                  <span>Open GPS in Google Maps</span>
                </a>
                <a
                  href={`https://wa.me/${RESTAURANT_INFO.whatsappNumber}?text=${encodeURIComponent(
                    'Hello Tollywood Mandi, I would like to order food or reserve a table'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] bg-[#6B2525] hover:bg-[#561d1d] text-[#F5EFE3] font-semibold px-6 py-3 rounded-xl text-xs flex items-center gap-2 shadow-xs transition whitespace-nowrap"
                >
                  <i className="fa-brands fa-whatsapp text-base" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Live Google Maps Embed */}
            <div className="rounded-2xl overflow-hidden border border-[#D8C9AF] h-80 sm:h-96 relative shadow-md bg-[#EDE3D2]">
              <iframe
                title="Tollywood Mandi Location Map"
                src={RESTAURANT_INFO.embedMapUrl}
                className="w-full h-full border-0"
                allowFullScreen
                loading="lazy"
              />
              <div className="absolute bottom-3 left-3 right-3 bg-[#F5EFE3]/95 backdrop-blur-md p-3 rounded-xl border border-[#D8C9AF] text-xs text-[#39332D] flex items-center justify-between">
                <span className="font-medium text-[#171717]">
                  Venkat&apos;s Building, 1st Floor, SR Nagar
                </span>
                <span className="text-[#6B2525] font-semibold tabular-nums">
                  Open till 1:00 AM
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer (#F5EFE3 Warm Cream Background, #D8C9AF Divider) */}
      <footer className="bg-[#F5EFE3] border-t border-[#D8C9AF] text-[#39332D] py-12 px-4 sm:px-6 lg:px-8 text-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <span className="font-cinzel text-lg font-bold text-[#171717] tracking-wider block">
              Tollywood Mandi
            </span>
            <p className="leading-relaxed text-[#39332D]">
              Hyderabad&apos;s cinema-themed royal Mandi destination. Serving
              authentic slow-roasted chicken, mutton juicy, and giant family
              trays in SR Nagar.
            </p>
            <div className="flex gap-4 text-[#B58A3A] text-base pt-1">
              <a
                href={RESTAURANT_INFO.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#6B2525] transition-colors"
                aria-label="Google Maps Location"
              >
                <i className="fa-solid fa-location-dot" />
              </a>
              <a
                href={`https://wa.me/${RESTAURANT_INFO.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#6B2525] transition-colors"
                aria-label="WhatsApp"
              >
                <i className="fa-brands fa-whatsapp" />
              </a>
              <a
                href="tel:+919866615115"
                className="hover:text-[#6B2525] transition-colors"
                aria-label="Phone"
              >
                <i className="fa-solid fa-phone" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-cinzel font-bold text-[#171717] text-sm mb-3">
              Quick Navigation
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#menu" className="hover:text-[#B58A3A] transition">
                  Tollywood Movie Menu
                </a>
              </li>
              <li>
                <a href="#platters" className="hover:text-[#B58A3A] transition">
                  Bahubali Giant Platter
                </a>
              </li>
              <li>
                <a href="#ambience" className="hover:text-[#B58A3A] transition">
                  Majlis Floor Cabins
                </a>
              </li>
              <li>
                <a href="#booking" className="hover:text-[#B58A3A] transition">
                  Table Reservation
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-[#B58A3A] transition">
                  Directions to SR Nagar
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-cinzel font-bold text-[#171717] text-sm mb-3">
              Popular Movie Feasts
            </h4>
            <ul className="space-y-2 tabular-nums">
              <li>Kushi Mutton Juicy Mandi (₹479)</li>
              <li>RRR Chicken Mandi (₹359)</li>
              <li>Simhadri Fry Piece Mandi (₹349)</li>
              <li>Pushpa Chicken Drumsticks (₹319)</li>
              <li>Adhipathi Apricot Delight (₹120)</li>
            </ul>
          </div>

          <div>
            <h4 className="font-cinzel font-bold text-[#171717] text-sm mb-3">
              Direct Contact
            </h4>
            <p className="mb-1 text-[#171717] font-semibold">
              1st Floor, Venkat&apos;s Building,
            </p>
            <p className="mb-2">
              Sanjeeva Reddy Nagar, Ameerpet, Hyderabad 500038
            </p>
            <p className="text-[#6B2525] font-bold mb-1 tabular-nums">
              {RESTAURANT_INFO.phone}
            </p>
            <p className="tabular-nums">12:30 PM – 01:00 AM Daily</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-[#D8C9AF] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#39332D] gap-3">
          <p>
            © {currentYear} Tollywood Mandi. All rights reserved. SR Nagar,
            Hyderabad.
          </p>
          <p className="text-[#6B2525] font-semibold">
            Authentic Arabian Mandi · Telugu Cinema Soul
          </p>
        </div>
      </footer>

      {/* Cart Sidebar Backdrop & Drawer */}
      {cartOpen && (
        <div
          onClick={() => setCartOpen(false)}
          className="fixed inset-0 bg-[#171717]/40 backdrop-blur-xs z-40"
        />
      )}
      <aside
        aria-label="Shopping Cart Drawer"
        className={`fixed inset-y-0 right-0 w-full sm:w-[430px] bg-[#F5EFE3] border-l border-[#D8C9AF] z-50 transform transition-transform duration-200 flex flex-col justify-between shadow-2xl ${
          cartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#D8C9AF] flex items-center justify-between bg-[#EDE3D2]">
          <div className="flex items-center gap-2.5">
            <i className="fa-solid fa-basket-shopping text-[#B58A3A] text-lg" />
            <h3 className="font-cinzel font-bold text-[#171717] text-base">
              Your Tollywood Feast Plate
            </h3>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center text-[#39332D] hover:text-[#171717] p-1.5 rounded-lg cursor-pointer"
            aria-label="Close Cart"
          >
            <i className="fa-solid fa-xmark text-lg" />
          </button>
        </div>

        {/* Order Type Selector */}
        <div className="p-4 bg-[#F5EFE3] border-b border-[#D8C9AF]">
          <div className="grid grid-cols-3 gap-1 bg-[#EDE3D2] p-1 rounded-xl border border-[#D8C9AF] text-xs font-semibold text-[#39332D] text-center">
            {(['delivery', 'takeaway', 'dinein'] as OrderType[]).map((type) => (
              <button
                key={type}
                onClick={() => setOrderType(type)}
                className={`min-h-[38px] py-1.5 rounded-lg transition cursor-pointer capitalize ${
                  orderType === type
                    ? 'bg-[#B58A3A] text-[#171717] font-bold'
                    : 'hover:text-[#171717]'
                }`}
              >
                {type === 'dinein' ? 'Dine-In' : type}
              </button>
            ))}
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F5EFE3]">
          {cart.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <i className="fa-solid fa-utensils text-4xl text-[#39332D]/40" />
              <p className="text-[#39332D] text-xs">
                Your royal feast plate is currently empty.
              </p>
              <a
                href="#menu"
                onClick={() => setCartOpen(false)}
                className="inline-block text-[#6B2525] text-xs font-semibold hover:underline"
              >
                Explore Blockbuster Menu
              </a>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.uid}
                className="flex items-center justify-between bg-[#EDE3D2] p-3 rounded-xl border border-[#D8C9AF] gap-3"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <ResilientImage
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover shrink-0"
                  />
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-[#171717] truncate">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-[#39332D] truncate">
                      {item.portion} · {item.spice}
                      {item.addons.length
                        ? ' · ' + item.addons.join(' + ')
                        : ''}
                    </p>
                    <span className="text-xs text-[#6B2525] font-bold tabular-nums">
                      ₹{item.price} each
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => changeItemQty(item.uid, -1)}
                    className="w-8 h-8 rounded bg-[#F5EFE3] border border-[#D8C9AF] text-[#171717] hover:bg-[#B58A3A] text-xs font-bold transition flex items-center justify-center cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="text-xs font-bold text-[#171717] px-1 tabular-nums">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => changeItemQty(item.uid, 1)}
                    className="w-8 h-8 rounded bg-[#F5EFE3] border border-[#D8C9AF] text-[#171717] hover:bg-[#B58A3A] text-xs font-bold transition flex items-center justify-center cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Footer */}
        <div className="p-5 border-t border-[#D8C9AF] bg-[#EDE3D2] space-y-3">
          {/* Coupon Code */}
          <div className="flex gap-2">
            <input
              type="text"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              placeholder="Try coupon TOLLYWOOD15"
              className="flex-1 min-h-[40px] bg-[#F5EFE3] border border-[#D8C9AF] rounded-lg px-3 py-1.5 text-xs text-[#171717] placeholder-[#39332D]/60 uppercase focus:outline-none focus:border-[#B58A3A]"
            />
            <button
              onClick={() => handleApplyCoupon()}
              className="min-h-[40px] bg-[#B58A3A] text-[#171717] font-bold text-xs px-4 py-1.5 rounded-lg hover:bg-[#9f772e] transition cursor-pointer"
            >
              Apply
            </button>
          </div>
          {!appliedCoupon && cart.length > 0 && (
            <button
              onClick={() => handleApplyCoupon('TOLLYWOOD15')}
              className="text-[11px] text-[#6B2525] font-medium hover:underline cursor-pointer block text-left"
            >
              Tap to apply TOLLYWOOD15 for 15% Movie Feast Discount
            </button>
          )}
          {couponFeedback && (
            <div
              className={`text-[11px] font-semibold ${
                couponFeedback.isSuccess ? 'text-[#6B2525]' : 'text-red-700'
              }`}
            >
              {couponFeedback.text}
            </div>
          )}

          {/* Price Breakdown */}
          <div className="space-y-1 text-xs text-[#39332D] pt-1 tabular-nums">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-[#171717] font-medium">₹{subtotal}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-[#6B2525] font-semibold">
                <span>Movie Discount (15%)</span>
                <span>-₹{discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>GST (5%)</span>
              <span className="text-[#171717] font-medium">₹{gstAmount}</span>
            </div>
            <div className="flex justify-between">
              <span>
                {orderType === 'delivery'
                  ? 'Delivery & Packaging Fee'
                  : orderType === 'takeaway'
                  ? 'Eco Takeaway Box Fee'
                  : 'Table Service'}
              </span>
              <span className="text-[#171717] font-medium">
                ₹{packagingFee}
              </span>
            </div>
            <div className="border-t border-[#D8C9AF] pt-2 flex justify-between font-bold text-[#171717] text-base">
              <span>Total Amount</span>
              <span className="text-[#6B2525]">₹{grandTotal}</span>
            </div>
          </div>

          {/* Checkout Buttons */}
          <div className="pt-2 space-y-2">
            {cart.length > 0 ? (
              <a
                href={buildWhatsAppOrderUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] w-full bg-[#6B2525] hover:bg-[#561d1d] text-[#F5EFE3] font-bold py-3 rounded-xl text-xs tracking-wide flex items-center justify-center gap-2 shadow-xs transition"
              >
                <i className="fa-brands fa-whatsapp text-base" />
                <span>Send Order to WhatsApp ({RESTAURANT_INFO.phone})</span>
              </a>
            ) : (
              <button
                onClick={() =>
                  showNotification(
                    'Plate is Empty',
                    'Please select and add some items to your feast plate first!',
                    true
                  )
                }
                className="min-h-[44px] w-full bg-[#F5EFE3] border border-[#D8C9AF] text-[#39332D] font-bold py-3 rounded-xl text-xs tracking-wide flex items-center justify-center gap-2 cursor-pointer"
              >
                <i className="fa-brands fa-whatsapp text-base" />
                <span>Send Order to WhatsApp ({RESTAURANT_INFO.phone})</span>
              </button>
            )}
            <button
              onClick={handleOpenUpiModal}
              className="min-h-[44px] w-full bg-[#B58A3A] hover:bg-[#9f772e] text-[#171717] font-bold py-3 rounded-xl text-xs tracking-wide flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
            >
              <i className="fa-solid fa-qrcode text-sm" />
              <span>Pay via UPI QR / Cards / Cash</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Dish Customization Modal */}
      {customizingItem && (
        <div className="fixed inset-0 bg-[#171717]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#EDE3D2] rounded-2xl max-w-md w-full border border-[#D8C9AF] p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-start gap-3">
              <div>
                <h3 className="font-cinzel text-xl font-bold text-[#171717]">
                  {customizingItem.name}
                </h3>
                <p className="text-xs text-[#39332D] mt-1">
                  {customizingItem.desc}
                </p>
              </div>
              <button
                onClick={closeCustomizeModal}
                className="min-h-[36px] min-w-[36px] text-[#39332D] hover:text-[#171717] p-1 cursor-pointer"
                aria-label="Close modal"
              >
                <i className="fa-solid fa-xmark text-lg" />
              </button>
            </div>

            {/* Portion Size */}
            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-2">
                Choose Portion
              </label>
              <div className="space-y-2 text-xs">
                {customizingItem.category === 'platters' ||
                customizingItem.category === 'desserts' ? (
                  <label className="flex justify-between items-center bg-[#F5EFE3] p-3 rounded-lg border border-[#B58A3A] cursor-pointer">
                    <span className="flex items-center gap-2 text-[#171717] font-medium">
                      <input
                        type="radio"
                        name="portionOpt"
                        checked={portionExtra === 0}
                        onChange={() => setPortionExtra(0)}
                        className="accent-[#B58A3A]"
                      />
                      Standard Portion ({customizingItem.serves})
                    </span>
                    <span className="font-bold text-[#171717] tabular-nums">
                      ₹{customizingItem.price}
                    </span>
                  </label>
                ) : (
                  <>
                    <label
                      className={`flex justify-between items-center bg-[#F5EFE3] p-3 rounded-lg border cursor-pointer ${
                        portionExtra === 0
                          ? 'border-[#B58A3A]'
                          : 'border-[#D8C9AF]'
                      }`}
                    >
                      <span className="flex items-center gap-2 text-[#171717] font-medium">
                        <input
                          type="radio"
                          name="portionOpt"
                          checked={portionExtra === 0}
                          onChange={() => setPortionExtra(0)}
                          className="accent-[#B58A3A]"
                        />
                        Single Portion ({customizingItem.serves})
                      </span>
                      <span className="font-bold text-[#171717] tabular-nums">
                        ₹{customizingItem.price}
                      </span>
                    </label>
                    <label
                      className={`flex justify-between items-center bg-[#F5EFE3] p-3 rounded-lg border cursor-pointer ${
                        portionExtra === 280
                          ? 'border-[#B58A3A]'
                          : 'border-[#D8C9AF]'
                      }`}
                    >
                      <span className="flex items-center gap-2 text-[#171717] font-medium">
                        <input
                          type="radio"
                          name="portionOpt"
                          checked={portionExtra === 280}
                          onChange={() => setPortionExtra(280)}
                          className="accent-[#B58A3A]"
                        />
                        Double Feast (Extra meat + rice)
                      </span>
                      <span className="font-bold text-[#171717] tabular-nums">
                        ₹{customizingItem.price + 280}
                      </span>
                    </label>
                  </>
                )}
              </div>
            </div>

            {/* Spice Level */}
            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-2">
                Select Spice Level
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {['Mild', 'Medium', 'Andhra Spicy'].map((level) => (
                  <label
                    key={level}
                    className={`min-h-[42px] border bg-[#F5EFE3] p-2.5 rounded-lg flex items-center gap-2 cursor-pointer transition ${
                      spiceLevel === level
                        ? 'border-[#B58A3A] text-[#171717] font-semibold'
                        : 'border-[#D8C9AF] text-[#39332D] hover:border-[#B58A3A]/60'
                    }`}
                  >
                    <input
                      type="radio"
                      name="modalSpice"
                      value={level}
                      checked={spiceLevel === level}
                      onChange={() => setSpiceLevel(level)}
                      className="accent-[#B58A3A]"
                    />
                    <span className="truncate">{level}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Add-ons */}
            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-2">
                Tasty Add-Ons
              </label>
              <div className="space-y-2 text-xs">
                {ADDON_OPTIONS.map((addon) => {
                  const checked = selectedAddons.includes(addon.id);
                  return (
                    <label
                      key={addon.id}
                      className={`flex justify-between items-center bg-[#F5EFE3] p-3 rounded-lg border cursor-pointer transition ${
                        checked ? 'border-[#B58A3A]' : 'border-[#D8C9AF]'
                      }`}
                    >
                      <span className="flex items-center gap-2 text-[#171717] font-medium">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleAddon(addon.id)}
                          className="accent-[#B58A3A]"
                        />
                        {addon.label}
                      </span>
                      <span className="text-[#6B2525] font-bold tabular-nums">
                        +₹{addon.price}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-[#D8C9AF]">
              <div>
                <span className="text-[11px] text-[#39332D] block">
                  Total Item Cost
                </span>
                <span className="text-xl font-bold text-[#171717] tabular-nums">
                  ₹{customizedItemTotal}
                </span>
              </div>
              <button
                onClick={handleConfirmCustomizedItem}
                className="min-h-[44px] bg-[#B58A3A] hover:bg-[#9f772e] text-[#171717] font-bold px-6 py-2.5 rounded-lg text-xs tracking-wide shadow-xs cursor-pointer"
              >
                Add to Feast Plate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instant UPI QR & Payment Modal */}
      {upiModalOpen && (
        <div className="fixed inset-0 bg-[#171717]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#EDE3D2] rounded-3xl max-w-md w-full border border-[#D8C9AF] p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-start border-b border-[#D8C9AF] pb-3">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-qrcode text-[#B58A3A] text-lg" />
                <h3 className="font-cinzel text-lg font-bold text-[#171717]">
                  Payment &amp; Order Verification
                </h3>
              </div>
              <button
                onClick={() => setUpiModalOpen(false)}
                className="min-h-[36px] min-w-[36px] text-[#39332D] hover:text-[#171717] p-1 cursor-pointer"
                aria-label="Close payment modal"
              >
                <i className="fa-solid fa-xmark text-lg" />
              </button>
            </div>

            {/* Customer Details Form */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#171717] font-medium mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  placeholder="e.g. Ramesh Varma"
                  className="w-full min-h-[42px] bg-[#F5EFE3] border border-[#D8C9AF] rounded-lg p-2.5 text-[#171717] placeholder-[#39332D]/55 focus:outline-none focus:border-[#B58A3A]"
                />
              </div>
              <div>
                <label className="block text-[#171717] font-medium mb-1">
                  Your Mobile / WhatsApp Number *
                </label>
                <input
                  type="tel"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  placeholder="e.g. 98666 15115"
                  className="w-full min-h-[42px] bg-[#F5EFE3] border border-[#D8C9AF] rounded-lg p-2.5 text-[#171717] placeholder-[#39332D]/55 focus:outline-none focus:border-[#B58A3A]"
                />
              </div>
              {orderType === 'delivery' && (
                <div>
                  <label className="block text-[#171717] font-medium mb-1">
                    Delivery Address &amp; Landmark
                  </label>
                  <textarea
                    rows={2}
                    value={custAddress}
                    onChange={(e) => setCustAddress(e.target.value)}
                    placeholder="House/Flat No, Landmark, SR Nagar / Ameerpet"
                    className="w-full bg-[#F5EFE3] border border-[#D8C9AF] rounded-lg p-2.5 text-[#171717] placeholder-[#39332D]/55 focus:outline-none focus:border-[#B58A3A]"
                  />
                </div>
              )}
            </div>

            {/* Dynamic UPI QR Display */}
            <div className="bg-[#F5EFE3] border border-[#D8C9AF] p-4 rounded-2xl text-center space-y-2">
              <p className="text-[#171717] font-bold text-xs tracking-wide">
                Scan to Pay via GPay / PhonePe / Paytm
              </p>
              <div className="flex justify-center py-1">
                <ResilientImage
                  src={upiQrUrl}
                  alt="UPI QR Code"
                  fallbackLabel="UPI ID: 9866615115@ybl"
                  className="w-40 h-40 border border-[#D8C9AF] rounded-lg p-1 bg-white"
                />
              </div>
              <div className="text-[#171717] font-black text-lg tabular-nums">
                Total Payable: ₹{grandTotal}
              </div>
              <p className="text-[11px] text-[#39332D] font-mono">
                UPI ID: {RESTAURANT_INFO.upiId} (Tollywood Mandi)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => handleCompletePayment('UPI_ONLINE')}
                className="min-h-[44px] bg-[#B58A3A] hover:bg-[#9f772e] text-[#171717] font-bold py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <i className="fa-solid fa-circle-check" />
                <span>I Have Paid Online</span>
              </button>
              <button
                onClick={() => handleCompletePayment('CASH_ON_DELIVERY')}
                className="min-h-[44px] bg-[#F5EFE3] hover:bg-[#e5d9c5] border border-[#D8C9AF] text-[#171717] font-bold py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <i className="fa-solid fa-money-bill-wave text-[#6B2525]" />
                <span>Pay via Cash / COD</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post-Order Confirmation & Receipt Modal */}
      {confirmedReceipt && (
        <div className="fixed inset-0 bg-[#171717]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#EDE3D2] rounded-3xl max-w-md w-full border border-[#D8C9AF] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#D8C9AF] pb-3">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-circle-check text-[#6B2525] text-lg" />
                <h3 className="font-cinzel text-lg font-bold text-[#171717]">
                  Order {confirmedReceipt.orderId} Confirmed
                </h3>
              </div>
              <button
                onClick={() => setConfirmedReceipt(null)}
                className="min-h-[36px] min-w-[36px] text-[#39332D] hover:text-[#171717] p-1 cursor-pointer"
                aria-label="Close receipt"
              >
                <i className="fa-solid fa-xmark text-lg" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-[#39332D]">
              <p>
                Guest:{' '}
                <strong className="text-[#171717]">
                  {confirmedReceipt.customerName}
                </strong>{' '}
                ({confirmedReceipt.customerPhone})
              </p>
              <p>
                Mode:{' '}
                <strong className="text-[#6B2525] uppercase">
                  {confirmedReceipt.orderType}
                </strong>{' '}
                · Payment:{' '}
                <strong className="text-[#171717]">
                  {confirmedReceipt.paymentMethod}
                </strong>
              </p>
              {confirmedReceipt.customerAddress && (
                <p>Address: {confirmedReceipt.customerAddress}</p>
              )}
            </div>

            <div className="bg-[#F5EFE3] p-3.5 rounded-xl border border-[#D8C9AF] space-y-1.5 max-h-40 overflow-y-auto text-xs">
              {confirmedReceipt.items.map((item) => (
                <div
                  key={item.uid}
                  className="flex justify-between text-[#171717] tabular-nums"
                >
                  <span className="truncate pr-2">
                    {item.quantity}x {item.name} ({item.portion})
                  </span>
                  <span className="text-[#6B2525] font-semibold shrink-0">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
              <div className="border-t border-[#D8C9AF] pt-2 flex justify-between font-bold text-[#171717] text-sm tabular-nums">
                <span>Total</span>
                <span className="text-[#6B2525]">
                  ₹{confirmedReceipt.total}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <a
                href={confirmedReceipt.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] w-full bg-[#B58A3A] hover:bg-[#9f772e] text-[#171717] font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition"
              >
                <i className="fa-brands fa-whatsapp text-base" />
                <span>Send Order Receipt to Kitchen on WhatsApp</span>
              </a>
              <button
                onClick={() => setConfirmedReceipt(null)}
                className="min-h-[42px] w-full bg-[#F5EFE3] hover:bg-[#e5d9c5] border border-[#D8C9AF] text-[#171717] font-semibold py-2.5 rounded-xl text-xs transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Toast Notification */}
      <div
        className={`fixed bottom-6 right-6 z-50 transform transition-all duration-200 bg-[#EDE3D2] border ${
          toast.isError ? 'border-[#6B2525]' : 'border-[#B58A3A]'
        } shadow-xl rounded-2xl px-5 py-4 flex items-center gap-3 text-xs text-[#171717] max-w-sm ${
          toast.visible
            ? 'translate-y-0 opacity-100'
            : 'translate-y-16 opacity-0 pointer-events-none'
        }`}
      >
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm ${
            toast.isError
              ? 'bg-[#6B2525] text-[#F5EFE3]'
              : 'bg-[#B58A3A] text-[#171717]'
          }`}
        >
          <i
            className={`fa-solid ${
              toast.isError ? 'fa-circle-exclamation' : 'fa-circle-check'
            }`}
          />
        </div>
        <div className="flex-1">
          <h5 className="font-cinzel font-bold text-[#171717] text-xs">
            {toast.title}
          </h5>
          <p className="text-[#39332D] text-[11px] leading-snug">
            {toast.message}
          </p>
        </div>
      </div>
    </div>
  );
}
