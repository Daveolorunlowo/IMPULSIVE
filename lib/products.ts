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
    id: '8',
    slug: 'impulsive-mmle-tee-red',
    name: 'IMPULSIVE MMLE TEE',
    category: 'Archive',
    price: 12000,
    status: 'New Drop',
    description: 'The highly anticipated IMPULSIVE MMLE TEE. Featuring a bold design and premium heavy-weight cotton. Available exclusively in blood red.',
    mainImage: '/images/impulsive-mmle-tee.jpeg',
    hoverImage: '/images/impulsive-mmle-tee-img2.jpeg',
    images: [
      '/images/impulsive-mmle-tee.jpeg',
      '/images/impulsive-mmle-tee-img2.jpeg'
    ],
    details: [
      'Heavy-weight premium cotton',
      'Exclusive MMLE design',
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
    slug: 'impulsive-freedom-man-tee',
    name: 'IMPULSIVE FREEDOM MAN TEE',
    category: 'Signature',
    price: 15000,
    status: 'New Drop',
    description: 'The IMPULSIVE FREEDOM MAN TEE features a vibrant graphic design on a classic black base.',
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
      { name: 'Black', hex: '#000000' }
    ]
  }
];
