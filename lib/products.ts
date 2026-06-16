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
    description: 'Our classic brand t-shirt. Features a bold red faces graphic. Made from thick, heavy-weight cotton for a comfortable, boxy fit.',
    mainImage: '/images/impulsiveboy1red.jpeg',
    hoverImage: '/images/impulsiveboyblack.jpeg',
    images: [
      '/images/impulsiveboy1red.jpeg',
      '/images/impulsiveboyblack.jpeg'
    ],
    details: [
      'Heavy-weight cotton',
      'Clear faces graphic',
      'Comfortable boxy fit',
      'Won\'t shrink in wash'
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
    description: 'A fun and bold t-shirt. Features a cool "Hotgirl Shit" text design and silhouette outline. Designed to look clean and stand out.',
    mainImage: '/images/impulsive-girlred.jpeg',
    hoverImage: '/images/impulsivegirl1black.jpeg',
    images: [
      '/images/impulsive-girlred.jpeg',
      '/images/impulsivegirl1black.jpeg'
    ],
    details: [
      'Soft premium cotton',
      'Clean text print',
      'Unisex fit for everyone',
      'Side brand tag'
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
    description: 'Our classic brand t-shirt in solid black. Features our faces graphic in a simple black-and-white color style.',
    mainImage: '/images/impulsiveboyblack.jpeg',
    hoverImage: '/images/impulsiveboywhite.jpeg',
    images: [
      '/images/impulsiveboyblack.jpeg',
      '/images/impulsiveboywhite.jpeg'
    ],
    details: [
      'Black cotton knit',
      'Thick screen print',
      'Durable collar',
      'Classic brand tag'
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
    description: 'The black edition of our Hotgirl graphic t-shirt. A clean and stylish dark design made for everyday street wear.',
    mainImage: '/images/impulsivegirl1black.jpeg',
    hoverImage: '/images/impulsiveboyblack.jpeg',
    images: [
      '/images/impulsivegirl1black.jpeg',
      '/images/impulsiveboyblack.jpeg'
    ],
    details: [
      'Durable rib collar',
      'Double-stitched edges',
      'Premium black dye',
      'Comfortable boxy fit'
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
    description: 'A clean white faces t-shirt. Shows off our multi-face graphic in a simple, crisp style.',
    mainImage: '/images/impulsiveboywhite.jpeg',
    hoverImage: '/images/impulsiveboy1red.jpeg',
    images: [
      '/images/impulsiveboywhite.jpeg',
      '/images/impulsiveboy1red.jpeg'
    ],
    details: [
      'Off-white cotton knit',
      'Comfortable boxy fit',
      'Breathable thick cotton',
      'Easy wash care labels'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Bone', hex: '#F9F9F7' }
    ]
  },
  {
    id: '6',
    slug: 'worldwide-instinct-tee-red',
    name: 'Worldwide Instinct Tee',
    category: 'Archive',
    price: 95.00,
    status: 'Global Drop',
    description: 'A world-map edition t-shirt. Features a large network graphic on the back and a small "IMPULSIVE" logo on the chest. Made with heavy-weight cotton.',
    mainImage: '/images/impulsiveworldwider.jpeg',
    hoverImage: '/images/impulsiveworldwideb.jpeg',
    images: [
      '/images/impulsiveworldwider.jpeg',
      '/images/impulsiveworldwideb.jpeg'
    ],
    details: [
      'Extra-thick heavy cotton',
      'World network print on back',
      'Relaxed oversized fit',
      'Internal brand tag'
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Maroon', hex: '#800000' }
    ]
  },
  {
    id: '7',
    slug: 'worldwide-instinct-tee-black',
    name: 'Worldwide Instinct Tee',
    category: 'Archive',
    price: 95.00,
    status: 'Global Drop',
    description: 'The black edition of our world-map t-shirt. Made with high-quality, heavy-weight cotton and a clean grey-toned print.',
    mainImage: '/images/impulsiveworldwideb.jpeg',
    hoverImage: '/images/impulsiveworldwider.jpeg',
    images: [
      '/images/impulsiveworldwideb.jpeg',
      '/images/impulsiveworldwider.jpeg'
    ],
    details: [
      'Extra-thick heavy cotton',
      'Grey-toned desaturated print',
      'Relaxed oversized fit',
      'Durable finish'
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Obsidian', hex: '#0A0A0A' }
    ]
  }
];
