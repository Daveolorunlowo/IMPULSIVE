export interface SizeChartRow {
  size: string;
  chest?: string;
  length?: string;
  sleeve?: string;
  waist?: string;
  frontRise?: string;
  thigh?: string;
  hem?: string;
}

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
  sizeChart?: SizeChartRow[];
}

export const products: Product[] = [
  {
    id: '13',
    slug: 'impulsive-b-ball-shorts-black',
    name: 'IMPULSIVE B-BALL SHORTS(BLACK)',
    category: 'Signature',
    price: 30000,
    status: 'New Drop',
    description: 'The IMPULSIVE B-BALL SHORTS(BLACK). Premium cut and sewn silk with custom details.',
    mainImage: '/images/bbshorts_black_mockup.jpg',
    hoverImage: '/images/bbshorts_black_hover1.jpg',
    images: [
      '/images/bbshorts_black_mockup.jpg',
      '/images/bbshorts_black_hover1.jpg',
      '/images/bbshorts_black_hover2.jpg',
      '/images/bbshorts_black_piece1.jpg',
      '/images/bbshorts_black_piece2.jpg'
    ],
    details: [
      'PREMIUM SILK FABRIC',
      'IMPULSIVE CUT AND SEWN',
      'RELAXED FIT',
      'IMMEDIATE DELIVERY'
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Black', hex: '#000000' }
    ],
    sizeChart: [
      { size: 'XS',  length: '28.9"', waist: '13.6"', frontRise: '16.0"', thigh: '16.2"', hem: '14.3"' },
      { size: 'S',   length: '29.7"', waist: '14.4"', frontRise: '16.4"', thigh: '17.0"', hem: '15.1"' },
      { size: 'M',   length: '30.5"', waist: '15.2"', frontRise: '16.8"', thigh: '17.8"', hem: '15.9"' },
      { size: 'L',   length: '31.3"', waist: '16.0"', frontRise: '17.2"', thigh: '18.2"', hem: '16.3"' },
      { size: 'XL',  length: '32.1"', waist: '16.8"', frontRise: '17.6"', thigh: '18.6"', hem: '16.7"' },
      { size: 'XXL', length: '32.9"', waist: '17.6"', frontRise: '18.0"', thigh: '19.0"', hem: '17.1"' },
    ]
  },
  {
    id: '14',
    slug: 'impulsive-b-ball-shorts-silver',
    name: 'IMPULSIVE B-BALL SHORTS(SILVER)',
    category: 'Signature',
    price: 30000,
    status: 'New Drop',
    description: 'The IMPULSIVE B-BALL SHORTS(SILVER). Premium cut and sewn silk with custom details.',
    mainImage: '/images/bbshorts_white_mockup.jpg',
    hoverImage: '/images/bbshorts_white_hover1.jpg',
    images: [
      '/images/bbshorts_white_mockup.jpg',
      '/images/bbshorts_white_hover1.jpg',
      '/images/bbshorts_white_hover2.jpg',
      '/images/bbshorts_white_piece.jpg'
    ],
    details: [
      'PREMIUM SILK FABRIC',
      'IMPULSIVE CUT AND SEWN',
      'RELAXED FIT',
      'IMMEDIATE DELIVERY'
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Silver', hex: '#C0C0C0' }
    ],
    sizeChart: [
      { size: 'XS',  length: '28.9"', waist: '13.6"', frontRise: '16.0"', thigh: '16.2"', hem: '14.3"' },
      { size: 'S',   length: '29.7"', waist: '14.4"', frontRise: '16.4"', thigh: '17.0"', hem: '15.1"' },
      { size: 'M',   length: '30.5"', waist: '15.2"', frontRise: '16.8"', thigh: '17.8"', hem: '15.9"' },
      { size: 'L',   length: '31.3"', waist: '16.0"', frontRise: '17.2"', thigh: '18.2"', hem: '16.3"' },
      { size: 'XL',  length: '32.1"', waist: '16.8"', frontRise: '17.6"', thigh: '18.6"', hem: '16.7"' },
      { size: 'XXL', length: '32.9"', waist: '17.6"', frontRise: '18.0"', thigh: '19.0"', hem: '17.1"' },
    ]
  }
];
