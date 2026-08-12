export interface SizeChartRow {
  size: string;
  chest: string;
  length: string;
  sleeve?: string;
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
    id: '11',
    slug: 'impulsive-worldwide-swagger-long-sleeve',
    name: 'IMPULSIVE WORLDWIDE SWAGGER LONG SLEEVE',
    category: 'Signature',
    price: 25000,
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
    ],
    sizeChart: [
      { size: 'S',   chest: '25"', length: '24"', sleeve: '22"' },
      { size: 'M',   chest: '26.5"', length: '25.5"', sleeve: '23.5"' },
      { size: 'L',   chest: '28"', length: '27"', sleeve: '25"' },
      { size: 'XL',  chest: '29.5"', length: '28.5"', sleeve: '26.5"' },
      { size: '2XL', chest: '31"', length: '30"', sleeve: '28"' },
    ]
  },
  {
    id: '10',
    slug: 'impulsive-swagger-long-sleeve-red',
    name: 'IMPULSIVE SWAGGER LONG SLEEVE RED',
    category: 'Signature',
    price: 25000,
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
    ],
    sizeChart: [
      { size: 'S',   chest: '25"', length: '24"', sleeve: '22"' },
      { size: 'M',   chest: '26.5"', length: '25.5"', sleeve: '23.5"' },
      { size: 'L',   chest: '28"', length: '27"', sleeve: '25"' },
      { size: 'XL',  chest: '29.5"', length: '28.5"', sleeve: '26.5"' },
      { size: '2XL', chest: '31"', length: '30"', sleeve: '28"' },
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
    hoverImage: '/images/freedom-tee-alt1.jpeg',
    images: [
      '/images/freedom-tee-main.jpeg',
      '/images/freedom-tee-hover.jpeg',
      '/images/freedom-tee-alt1.jpeg',
      '/images/freedom-tee-alt2.jpeg'
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
    ],
    sizeChart: [
      { size: 'M',   chest: '40"', length: '29"' },
      { size: 'L',   chest: '42"', length: '29"' },
      { size: 'XL',  chest: '44"', length: '31"' },
      { size: 'XXL', chest: '46"', length: '32"' },
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
    hoverImage: '/images/freedom-tee-black-alt1.jpeg',
    images: [
      '/images/freedom-tee-black-main.jpeg',
      '/images/freedom-tee-black-hover.jpeg',
      '/images/freedom-tee-black-alt1.jpeg',
      '/images/freedom-tee-black-alt2.jpeg'
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
    ],
    sizeChart: [
      { size: 'M',   chest: '40"', length: '29"' },
      { size: 'L',   chest: '42"', length: '29"' },
      { size: 'XL',  chest: '44"', length: '31"' },
      { size: 'XXL', chest: '46"', length: '32"' },
    ]
  }
];
