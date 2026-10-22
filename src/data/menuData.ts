export type MenuCategory =
  | 'all'
  | 'platters'
  | 'mutton'
  | 'chicken'
  | 'starters'
  | 'veg'
  | 'desserts';

export interface MenuItem {
  id: string;
  name: string;
  category: Exclude<MenuCategory, 'all'>;
  price: number;
  serves: string;
  rating: string;
  isVeg: boolean;
  desc: string;
  image: string;
  bestseller: boolean;
  filmTag?: string;
}

export interface AddonOption {
  id: string;
  label: string;
  shortLabel: string;
  price: number;
}

export const ADDON_OPTIONS: AddonOption[] = [
  {
    id: 'addonMayo',
    label: 'Extra Arabian Garlic Toum Mayo',
    shortLabel: 'Mayo',
    price: 30,
  },
  {
    id: 'addonSoup',
    label: 'Extra Hot Mandi Shorba Soup',
    shortLabel: 'Shorba',
    price: 40,
  },
  {
    id: 'addonRice',
    label: 'Extra Spiced Basmati Mandi Rice',
    shortLabel: 'Extra Rice',
    price: 90,
  },
];

export const RESTAURANT_INFO = {
  name: 'Tollywood Mandi',
  tagline: 'Authentic Arabian Mandi with Telugu Cinema Soul',
  phone: '+91 98666 15115',
  whatsappNumber: '919866615115',
  upiId: '9866615115@ybl',
  address:
    "1st Floor, Venkat's Building, H.No. 7-1-397/126 (B-92 MIGH), Sanjeeva Reddy Nagar, Ameerpet, Hyderabad, Telangana 500038",
  shortAddress: "Venkat's Building, 1st Floor, SR Nagar, Hyderabad",
  hours: '12:30 PM – 01:00 AM Daily (Midnight Dining)',
  googleMapsUrl: 'https://maps.app.goo.gl/fPqZxUEgb39VZA488',
  embedMapUrl:
    "https://maps.google.com/maps?q=Tollywood+Mandi+Venkat's+Sanjeeva+Reddy+Nagar+Hyderabad&t=&z=16&ie=UTF8&iwloc=&output=embed",
  rating: '4.1★ (SR Nagar)',
};

export const MENU_ITEMS: MenuItem[] = [
  // GIANT TRAYS
  {
    id: 'g1',
    name: 'Bahubali Mandi (7-8 Persons)',
    category: 'platters',
    price: 3299,
    serves: 'Serves 7-8',
    rating: '4.9',
    isVeg: false,
    desc: 'Chicken fry [2 pcs], Faham chicken [1 pc], Barbeque [1 pc], Broasted [1 pc], Juicy Mutton [1 pc], Fish Fry [1 pc], 1 Starter & 2 Cool Beverages with limitless soup & dips.',
    image:
      'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=800&auto=format&fit=crop',
    bestseller: true,
    filmTag: 'Grand Blockbuster',
  },
  {
    id: 'g2',
    name: 'Maya Bazar Mandi (4-5 Persons)',
    category: 'platters',
    price: 2299,
    serves: 'Serves 4-5',
    rating: '4.8',
    isVeg: false,
    desc: 'Chicken juicy [1 pc], Faham chicken [1 pc], Mutton fry [1 pc], Barbeque [1 pc], Fish fry [1 pc], Double Ka Meetha and Kaddu Ka Kheer.',
    image:
      'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop',
    bestseller: true,
    filmTag: 'Evergreen Classic',
  },
  {
    id: 'g3',
    name: "Tollywood's Special Mandi (3-4 Persons)",
    category: 'platters',
    price: 1799,
    serves: 'Serves 3-4',
    rating: '4.9',
    isVeg: false,
    desc: 'Mutton Turkish Mandi, RRR Chicken Mandi, Crispy Fried Fish, Chicken Mongolian starter & 2 Cool Beverages.',
    image:
      'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?q=80&w=800&auto=format&fit=crop',
    bestseller: true,
    filmTag: 'Family Hit',
  },

  // MUTTON MANDIS
  {
    id: 'm1',
    name: 'Kushi Mutton Juicy Mandi',
    category: 'mutton',
    price: 479,
    serves: 'Serves 1-2',
    rating: '4.9',
    isVeg: false,
    desc: 'Slow-cooked succulent tender mutton pieces infused with mild aromatic spices over spiced basmati Mandi rice.',
    image:
      'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=700&auto=format&fit=crop',
    bestseller: true,
  },
  {
    id: 'm2',
    name: 'Salaar Mutton Mandi',
    category: 'mutton',
    price: 489,
    serves: 'Serves 1-2',
    rating: '4.9',
    isVeg: false,
    desc: 'Violent and intense flavor! Slow-braised dark mutton roast tossed in pepper masala atop fragrant mandi rice.',
    image:
      'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=700&auto=format&fit=crop',
    bestseller: true,
  },
  {
    id: 'm3',
    name: 'Dasara Mutton Ghee Roast Mandi',
    category: 'mutton',
    price: 499,
    serves: 'Serves 1-2',
    rating: '4.8',
    isVeg: false,
    desc: 'Desi ghee tempered spicy bone-in mutton tossed in red Byadgi chilli paste over long grain mandi rice.',
    image:
      'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=700&auto=format&fit=crop',
    bestseller: false,
  },
  {
    id: 'm4',
    name: 'Badri Mutton Fry Mandi',
    category: 'mutton',
    price: 449,
    serves: 'Serves 1-2',
    rating: '4.8',
    isVeg: false,
    desc: 'Direct and powerful. Crispy deep-fried mutton boti pieces with curry leaves, cashews and green chilies.',
    image:
      'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?q=80&w=700&auto=format&fit=crop',
    bestseller: false,
  },

  // CHICKEN MANDIS
  {
    id: 'c1',
    name: 'RRR Chicken Mandi',
    category: 'chicken',
    price: 359,
    serves: 'Serves 1-2',
    rating: '4.9',
    isVeg: false,
    desc: 'The ultimate blockbuster combo of slow-charred chicken with dry-fruit mandi rice, garlic toum and soup.',
    image:
      'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?q=80&w=700&auto=format&fit=crop',
    bestseller: true,
  },
  {
    id: 'c2',
    name: 'Simhadri Fry Piece Chicken Mandi',
    category: 'chicken',
    price: 349,
    serves: 'Serves 1-2',
    rating: '4.8',
    isVeg: false,
    desc: 'The aura of original spicy Andhra chicken fry tossed in curry leaf masala served atop scented Mandi rice.',
    image:
      'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?q=80&w=700&auto=format&fit=crop',
    bestseller: true,
  },
  {
    id: 'c3',
    name: 'Arjun Reddy Chicken Juicy Mandi',
    category: 'chicken',
    price: 359,
    serves: 'Serves 1-2',
    rating: '4.8',
    isVeg: false,
    desc: 'Intense and rich flavor profile. Tender chicken drenched in special mutton-infused broth atop butter rice.',
    image:
      'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?q=80&w=700&auto=format&fit=crop',
    bestseller: false,
  },
  {
    id: 'c4',
    name: 'Aha Turkish Chicken Mandi',
    category: 'chicken',
    price: 359,
    serves: 'Serves 1-2',
    rating: '4.7',
    isVeg: false,
    desc: 'Turkish marinade with sumac, olive oil, and Arabic spices slow-grilled over charcoal embers.',
    image:
      'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=700&auto=format&fit=crop',
    bestseller: false,
  },
  {
    id: 'c5',
    name: 'Leader Chicken Faham Mandi',
    category: 'chicken',
    price: 359,
    serves: 'Serves 1-2',
    rating: '4.8',
    isVeg: false,
    desc: 'Charcoal coal-smoked whole chicken quarter served with tangy tomato shatta salsa and garlic dip.',
    image:
      'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=700&auto=format&fit=crop',
    bestseller: false,
  },

  // STARTERS
  {
    id: 's1',
    name: 'Pushpa Chicken Drumsticks',
    category: 'starters',
    price: 319,
    serves: 'Thaggede Le!',
    rating: '4.9',
    isVeg: false,
    desc: 'Spicy crusted succulent chicken drumsticks glazed in fire tandoori spices. An all-time favorite hit.',
    image:
      'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=700&auto=format&fit=crop',
    bestseller: true,
  },
  {
    id: 's2',
    name: 'Chicken Laila Lollipop',
    category: 'starters',
    price: 319,
    serves: 'A Classical Hit',
    rating: '4.8',
    isVeg: false,
    desc: 'Crispy fried chicken winglets tossed with garlic, ginger, spring onion, and Tollywood Indo-Chinese sauce.',
    image:
      'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?q=80&w=700&auto=format&fit=crop',
    bestseller: true,
  },
  {
    id: 's3',
    name: 'Manmadhudu Chicken Creamy Tikka',
    category: 'starters',
    price: 349,
    serves: 'Smooth & Classy',
    rating: '4.8',
    isVeg: false,
    desc: 'Melt-in-mouth chicken chunks marinated in cashew cream, hung curd, and fragrant cardamom.',
    image:
      'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?q=80&w=700&auto=format&fit=crop',
    bestseller: false,
  },
  {
    id: 's4',
    name: 'Saaho Spicy Fry Chicken',
    category: 'starters',
    price: 349,
    serves: 'Feel the Fire',
    rating: '4.8',
    isVeg: false,
    desc: 'Boneless tender chicken cubes tossed in high-heat wok with green chillies, crushed peppercorns and curry leaves.',
    image:
      'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?q=80&w=700&auto=format&fit=crop',
    bestseller: false,
  },

  // VEG SPECIALS
  {
    id: 'v1',
    name: 'Premam Paneer Mandi',
    category: 'veg',
    price: 349,
    serves: 'Serves 1-2',
    rating: '4.8',
    isVeg: true,
    desc: 'Fall in love with every bite. Ghee-scented Mandi rice paired with roasted cottage cheese cubes & cashews.',
    image:
      'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?q=80&w=700&auto=format&fit=crop',
    bestseller: true,
  },
  {
    id: 'v2',
    name: 'Malliswari Mushroom Mandi',
    category: 'veg',
    price: 359,
    serves: 'Serves 1-2',
    rating: '4.7',
    isVeg: true,
    desc: 'Classic taste worth the name. Plump button mushrooms simmered in aromatic Mandi seasonings.',
    image:
      'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=700&auto=format&fit=crop',
    bestseller: false,
  },
  {
    id: 'v3',
    name: 'Gamyam Gobi Mandi',
    category: 'veg',
    price: 329,
    serves: 'Serves 1-2',
    rating: '4.7',
    isVeg: true,
    desc: 'Flavorful vegetarian journey. Crispy spiced cauliflower florets over seasoned Arabic rice.',
    image:
      'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?q=80&w=700&auto=format&fit=crop',
    bestseller: false,
  },
  {
    id: 'v4',
    name: 'Akhanda Chilli Paneer',
    category: 'veg',
    price: 299,
    serves: 'Veg Starter',
    rating: '4.7',
    isVeg: true,
    desc: 'Powerful mass flavor! Crisp paneer cubes wok-tossed with green chilies, onions, and spicy soy garlic.',
    image:
      'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?q=80&w=700&auto=format&fit=crop',
    bestseller: false,
  },
  {
    id: 'v5',
    name: 'Bullabbai Baby Corn 65',
    category: 'veg',
    price: 299,
    serves: 'Veg Starter',
    rating: '4.7',
    isVeg: true,
    desc: 'Has a bit of spicy tikka. Crunchy golden baby corn tossed in hot red 65 yogurt masala.',
    image:
      'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?q=80&w=700&auto=format&fit=crop',
    bestseller: false,
  },

  // DESSERTS & DRINKS
  {
    id: 'd1',
    name: 'Adhipathi Apricot Delight',
    category: 'desserts',
    price: 120,
    serves: 'Pure Happiness',
    rating: '4.9',
    isVeg: true,
    desc: 'Classic Hyderabadi stewed sweet apricots topped with thick fresh cream and velvety custard layers.',
    image:
      'https://images.unsplash.com/photo-1589119908995-c6837fa14d48?q=80&w=700&auto=format&fit=crop',
    bestseller: true,
  },
  {
    id: 'd2',
    name: 'Krishna Kaddu Ka Kheer',
    category: 'desserts',
    price: 60,
    serves: 'Sweet Note',
    rating: '4.8',
    isVeg: true,
    desc: 'Rich bottle-gourd pudding cooked slowly in whole buffalo milk, sago pearls, khoya, and pistachios.',
    image:
      'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=700&auto=format&fit=crop',
    bestseller: false,
  },
  {
    id: 'd3',
    name: 'Dhee Double Ka Meetha',
    category: 'desserts',
    price: 60,
    serves: 'Royal Sweet',
    rating: '4.8',
    isVeg: true,
    desc: 'Traditional Hyderabadi delicacy made with ghee-fried bread soaked in saffron cardamom condensed milk.',
    image:
      'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=700&auto=format&fit=crop',
    bestseller: false,
  },
  {
    id: 'd4',
    name: 'Temper Goli Soda',
    category: 'desserts',
    price: 60,
    serves: 'Pop the Goli',
    rating: '4.8',
    isVeg: true,
    desc: 'Vintage pop-the-marble glass bottle soda. Choice of Lemon, Paneer Soda, or Jeera masala.',
    image:
      'https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=700&auto=format&fit=crop',
    bestseller: true,
  },
  {
    id: 'd5',
    name: 'Kick Cool Drinks',
    category: 'desserts',
    price: 24,
    serves: 'Chilled',
    rating: '4.6',
    isVeg: true,
    desc: 'Stay cool and refreshed with Thums Up, Sprite, or Coca Cola 250ml can.',
    image:
      'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=700&auto=format&fit=crop',
    bestseller: false,
  },
];

export const TESTIMONIALS = [
  {
    id: 't1',
    author: 'Sai Teja K.',
    role: 'SR Nagar Regular · Group of 8 Diners',
    quote:
      'The Bahubali Mandi here is unmatched for groups! We came as a gang of 8 friends. The mutton juicy piece melted off the bone, and the chicken Faham had that authentic smoky charcoal flavor.',
    dishOrdered: 'Bahubali Mandi Tray',
  },
  {
    id: 't2',
    author: 'Pooja Sharma',
    role: 'Family Dine-In · Private Majlis Cabin',
    quote:
      "Pushpa Chicken Drumsticks are an absolute blast — super fiery and crusted nicely. Plus the Arabic Majlis floor seating is clean and comfortable for families. Don't miss their Adhipathi Apricot Delight!",
    dishOrdered: 'Pushpa Chicken Drumsticks & Apricot Delight',
  },
  {
    id: 't3',
    author: 'Vikramaditya V.',
    role: 'Midnight Foodie · 11:30 PM Order',
    quote:
      'Open till 1:00 AM! Best midnight craving spot in Ameerpet and SR Nagar. We ordered Kushi Mutton Juicy Mandi at 11:30 PM on WhatsApp, and it arrived piping hot with flavorful spiced rice and extra shorba.',
    dishOrdered: 'Kushi Mutton Juicy Mandi',
  },
];
