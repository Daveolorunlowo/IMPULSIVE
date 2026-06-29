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
    price: 8.00,
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
  }
];
