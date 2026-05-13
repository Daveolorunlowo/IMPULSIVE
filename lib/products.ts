export interface Product {
  id: string;
  slug: string;
  name: string;
  category: 'Signature' | 'Archive' | 'Essentials';
  price: number;
  description: string;
  mainImage: string;
  hoverImage: string;
  images: string[];
  details: string[];
  sizes: string[];
  colors: { name: string; hex: string }[];
  status?: string;
}

export const products: Product[] = [
  {
    id: '1',
    slug: 'signature-face-tee-red',
    name: 'Signature Face Tee',
    category: 'Signature',
    price: 85.00,
    status: 'New Release',
    description: 'The definitive IMPULSIVE statement. Featuring our iconic multi-face graphic in a bold crimson execution. Crafted from 300GSM heavy-weight cotton for a structural, boxy fit.',
    mainImage: '/images/impulsiveboy1red.jpeg',
    hoverImage: '/images/impulsiveboyblack.jpeg',
    images: [
      '/images/impulsiveboy1red.jpeg',
      '/images/impulsiveboyblack.jpeg'
    ],
    details: [
      '300GSM Heavy-weight cotton',
      'High-definition face graphic',
      'Structural boxy fit',
      'Pre-shrunk'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Maroon', hex: '#800000' }
    ]
  },
  {
    id: '2',
    slug: 'hotgirl-edition-tee-red',
    name: 'Hotgirl Edition Tee',
    category: 'Signature',
    price: 85.00,
    status: 'Trending',
    description: 'A tribute to spontaneity. The Hotgirl Edition features our kinetic "Hotgirl Shit" typography and silhouette graphic. Engineered for a bold, architectural presence.',
    mainImage: '/images/impulsive-girlred.jpeg',
    hoverImage: '/images/impulsivegirl1black.jpeg',
    images: [
      '/images/impulsive-girlred.jpeg',
      '/images/impulsivegirl1black.jpeg'
    ],
    details: [
      'Soft-touch premium cotton',
      'Kinetic typography print',
      'Universal unisex silhouette',
      'Side-seam branding'
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [
      { name: 'Maroon', hex: '#800000' }
    ]
  },
  {
    id: '3',
    slug: 'signature-face-tee-black',
    name: 'Signature Face Tee',
    category: 'Signature',
    price: 85.00,
    status: 'Classic',
    description: 'The face graphic rendered in stark monochrome. A deep obsidian base provides a sophisticated canvas for our brutalist visual documentation.',
    mainImage: '/images/impulsiveboyblack.jpeg',
    hoverImage: '/images/impulsiveboywhite.jpeg',
    images: [
      '/images/impulsiveboyblack.jpeg',
      '/images/impulsiveboywhite.jpeg'
    ],
    details: [
      'Obsidian technical knit',
      'High-density screen print',
      'Reinforced collar',
      'Archive series tag'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Obsidian', hex: '#0A0A0A' }
    ]
  },
  {
    id: '4',
    slug: 'hotgirl-edition-tee-black',
    name: 'Hotgirl Edition Tee',
    category: 'Signature',
    price: 85.00,
    status: 'In Stock',
    description: 'The noir edition of our Hotgirl graphic. A study in form and shadow, blending architectural precision with the energy of the urban night.',
    mainImage: '/images/impulsivegirl1black.jpeg',
    hoverImage: '/images/impulsiveboyblack.jpeg',
    images: [
      '/images/impulsivegirl1black.jpeg',
      '/images/impulsiveboyblack.jpeg'
    ],
    details: [
      'Heavy-duty rib collar',
      'Double-stitched hems',
      'Premium noir pigment',
      'Boxy architectural fit'
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [
      { name: 'Obsidian', hex: '#0A0A0A' }
    ]
  },
  {
    id: '5',
    slug: 'manifesto-tee-white',
    name: 'Manifesto Face Tee',
    category: 'Signature',
    price: 85.00,
    status: 'Pure White',
    description: 'Purity meets brutalism. The Manifesto Face Tee in bone white showcases our multi-face graphic in a clean, high-velocity execution.',
    mainImage: '/images/impulsiveboywhite.jpeg',
    hoverImage: '/images/impulsiveboy1red.jpeg',
    images: [
      '/images/impulsiveboywhite.jpeg',
      '/images/impulsiveboy1red.jpeg'
    ],
    details: [
      'Off-white technical knit',
      'Structural boxy silhouette',
      'Breathable heavy cotton',
      'Internal care labels'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Bone', hex: '#F9F9F7' }
    ]
  },
  {
    id: '6',
    slug: 'worldwide-syndicate-tee-red',
    name: 'Worldwide Syndicate Tee',
    category: 'Archive',
    price: 95.00,
    status: 'Global Drop',
    description: 'A global statement of spontaneity. The Worldwide Syndicate Tee features our expanded network graphic across the back with technical "IMPULSIVE" branding on the chest.',
    mainImage: '/images/impulsiveworldwider.jpeg',
    hoverImage: '/images/impulsiveworldwideb.jpeg',
    images: [
      '/images/impulsiveworldwider.jpeg',
      '/images/impulsiveworldwideb.jpeg'
    ],
    details: [
      '350GSM Ultra-heavy cotton',
      'Global network screen print',
      'Relaxed oversized fit',
      'Internal syndicate tag'
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Maroon', hex: '#800000' }
    ]
  },
  {
    id: '7',
    slug: 'worldwide-syndicate-tee-black',
    name: 'Worldwide Syndicate Tee',
    category: 'Archive',
    price: 95.00,
    status: 'Global Drop',
    description: 'The obsidian edition of our global statement. Engineered for the midnight collective, featuring desaturated technical prints and a structural, heavyweight finish.',
    mainImage: '/images/impulsiveworldwideb.jpeg',
    hoverImage: '/images/impulsiveworldwider.jpeg',
    images: [
      '/images/impulsiveworldwideb.jpeg',
      '/images/impulsiveworldwider.jpeg'
    ],
    details: [
      '350GSM Ultra-heavy cotton',
      'Stealth desaturated print',
      'Relaxed oversized fit',
      'Industrial finish'
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Obsidian', hex: '#0A0A0A' }
    ]
  }
];
