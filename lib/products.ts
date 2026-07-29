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
  stock?: number;
}

export const products: Product[] = [
  {
    id: '11',
    slug: 'impulsive-worldwide-swagger-long-sleeve',
    name: 'IMPULSIVE WORLDWIDE SWAGGER LONG SLEEVE',
    category: 'Signature',
    price: 20000,
    status: 'In Stock',
    description: 'The IMPULSIVE WORLDWIDE SWAGGER LONG SLEEVE features an eye-catching graphic and custom typography.',
    mainImage: '/images/worldwide-swagger-main.jpeg',
    hoverImage: '/images/worldwide-swagger-hover.jpeg',
    images: [
      '/images/worldwide-swagger-main.jpeg',
      '/images/worldwide-swagger-hover.jpeg'
    ],
    details: [
      '100% COTTON',
      'DTF DESIGN PRINT',
      'IMPULSIVE CUT AND SEWN BLANKS',
      'TRUE TO SIZE',
      'IMMEDIATE DELIVERY'
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Black/White', hex: '#0A0A0A' }
    ]
  },
  {
    id: '10',
    slug: 'impulsive-swagger-long-sleeve-red',
    name: 'IMPULSIVE SWAGGER LONG SLEEVE RED',
    category: 'Signature',
    price: 20000,
    status: 'In Stock',
    description: 'The definitive IMPULSIVE SWAGGER LONG SLEEVE in red. Engineered for a bold, structural fit.',
    mainImage: '/images/impulsive-swagger-main.jpeg',
    hoverImage: '/images/impulsive-swagger-hover.jpeg',
    images: [
      '/images/impulsive-swagger-main.jpeg',
      '/images/impulsive-swagger-hover.jpeg'
    ],
    details: [
      'Heavy-weight premium cotton',
      'Relaxed oversized fit',
      'Durable finish'
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Red', hex: '#800000' }
    ]
  },
  {
    id: '9',
    slug: 'impulsive-freedom-man-tee-white',
    name: 'IMPULSIVE FREEDOM MAN TEE WHITE',
    category: 'Signature',
    price: 15000,
    status: 'New Drop',
    description: 'The IMPULSIVE FREEDOM MAN TEE WHITE features a vibrant graphic design.',
    mainImage: '/images/freedom-tee-main.jpeg',
    hoverImage: '/images/freedom-tee-hover.jpeg',
    images: [
      '/images/freedom-tee-main.jpeg',
      '/images/freedom-tee-hover.jpeg'
    ],
    details: [
      '100% COTTON',
      'DTF DESIGN PRINT',
      'IMPULSIVE CUT AND SEWN BLANKS',
      'TRUE TO SIZE',
      'IMMEDIATE DELIVERY'
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'White', hex: '#FFFFFF' }
    ]
  },
  {
    id: '12',
    slug: 'impulsive-freedom-man-tee-black',
    name: 'IMPULSIVE FREEDOM MAN TEE BLACK',
    category: 'Signature',
    price: 15000,
    status: 'New Drop',
    description: 'The IMPULSIVE FREEDOM MAN TEE BLACK features a vibrant graphic design.',
    mainImage: '/images/freedom-tee-black-main.jpeg',
    hoverImage: '/images/freedom-tee-black-hover.jpeg',
    images: [
      '/images/freedom-tee-black-main.jpeg',
      '/images/freedom-tee-black-hover.jpeg'
    ],
    details: [
      '100% COTTON',
      'DTF DESIGN PRINT',
      'IMPULSIVE CUT AND SEWN BLANKS',
      'TRUE TO SIZE',
      'IMMEDIATE DELIVERY'
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Black', hex: '#000000' }
    ]
  }
];
