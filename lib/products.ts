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
    id: '9',
    slug: 'impulsive-freedom-man-tee',
    name: 'IMPULSIVE FREEDOM MAN TEE',
    category: 'Signature',
    price: 15000,
    status: 'New Drop',
    description: 'The IMPULSIVE FREEDOM MAN TEE features a vibrant graphic design. Available in classic black and white bases.',
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
      { name: 'Black', hex: '#000000' },
      { name: 'White', hex: '#FFFFFF' }
    ]
  }
];
