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
  originalPrice?: number;
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
    name: 'IMPULSIVE B-BALL SHORTS (BLACK)',
    category: 'Signature',
    price: 25500,
    originalPrice: 30000,
    status: 'Restocked',
    stock: 20,
    description: 'The IMPULSIVE B-BALL SHORTS(BLACK). Premium cut and sewn silk with custom details and luxury heavyweight drawstrings.',
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
      'RELAXED FIT'
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
    name: 'IMPULSIVE B-BALL SHORTS (SILVER)',
    category: 'Signature',
    price: 25500,
    originalPrice: 30000,
    status: 'Restocked',
    stock: 18,
    description: 'The IMPULSIVE B-BALL SHORTS(SILVER). Premium cut and sewn silk with custom details and luxury heavyweight drawstrings.',
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
      'RELAXED FIT'
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
  },
  {
    id: '15',
    slug: 'impulsive-b-ball-shorts-wine',
    name: 'IMPULSIVE B-BALL SHORTS (WINE)',
    category: 'Signature',
    price: 25500,
    originalPrice: 30000,
    status: 'Restocked',
    stock: 20,
    description: 'The IMPULSIVE B-BALL SHORTS (WINE). Premium cut and sewn silk with custom details and luxury heavyweight drawstrings.',
    mainImage: '/images/IMPULSIVE B-BALL SHORTS (WINE).jpeg',
    hoverImage: '/images/bbshorts_wine_mockup.jpeg',
    images: [
      '/images/IMPULSIVE B-BALL SHORTS (WINE).jpeg',
      '/images/bbshorts_wine_mockup.jpeg'
    ],
    details: [
      'PREMIUM SILK FABRIC',
      'IMPULSIVE CUT AND SEWN',
      'RELAXED FIT'
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Wine', hex: '#58111A' }
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
    id: '11',
    slug: 'impulsive-worldwide-swagger-long-sleeve',
    name: 'IMPULSIVE SWAGGER LONG SLEEVE (BLACK/WHITE)',
    category: 'Signature',
    price: 20000,
    originalPrice: 25000,
    status: 'Black Friday Deal',
    stock: 20,
    description: 'The IMPULSIVE SWAGGER LONG SLEEVE features an eye-catching graphic and custom typography crafted on heavy-weight cotton blanks.',
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
      'TRUE TO SIZE'
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
    name: 'IMPULSIVE SWAGGER LONG SLEEVE (RED)',
    category: 'Signature',
    price: 20000,
    originalPrice: 25000,
    status: 'Black Friday Deal',
    stock: 20,
    description: 'The definitive IMPULSIVE SWAGGER LONG SLEEVE in bold red. Engineered for a distinct, oversized structural fit.',
    mainImage: '/images/impulsive-swagger-main.jpeg',
    hoverImage: '/images/impulsive-swagger-hover.jpeg',
    images: [
      '/images/impulsive-swagger-main.jpeg',
      '/images/impulsive-swagger-hover.jpeg'
    ],
    details: [
      'HEAVY-WEIGHT PREMIUM COTTON',
      'RELAXED OVERSIZED FIT',
      'DTF DESIGN PRINT',
      'DURABLE LUXURY FINISH'
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
    name: 'IMPULSIVE FREEDOM MAN TEE (WHITE)',
    category: 'Signature',
    price: 12000,
    originalPrice: 15000,
    status: 'Black Friday Deal',
    stock: 25,
    description: 'The IMPULSIVE FREEDOM MAN TEE WHITE features high-definition archival graphics on heavyweight cut & sewn cotton blanks.',
    mainImage: '/images/freedom-tee-main.jpeg',
    hoverImage: '/images/freedom-tee-alt1.jpeg',
    images: [
      '/images/freedom-tee-main.jpeg',
      '/images/freedom-tee-alt1.jpeg',
      '/images/freedom-tee-alt2.jpeg'
    ],
    details: [
      '100% COTTON',
      'DTF DESIGN PRINT',
      'IMPULSIVE CUT AND SEWN BLANKS',
      'TRUE TO SIZE'
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
    name: 'IMPULSIVE FREEDOM MAN TEE (BLACK)',
    category: 'Signature',
    price: 12000,
    originalPrice: 15000,
    status: 'Black Friday Deal',
    stock: 25,
    description: 'The IMPULSIVE FREEDOM MAN TEE BLACK features high-definition archival graphics on premium jet black cotton blanks.',
    mainImage: '/images/freedom-tee-black-main.jpeg',
    hoverImage: '/images/freedom-tee-black-alt1.jpeg',
    images: [
      '/images/freedom-tee-black-main.jpeg',
      '/images/freedom-tee-black-alt1.jpeg',
      '/images/freedom-tee-black-alt2.jpeg'
    ],
    details: [
      '100% COTTON',
      'DTF DESIGN PRINT',
      'IMPULSIVE CUT AND SEWN BLANKS',
      'TRUE TO SIZE'
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
  },
  {
    id: '16',
    slug: 'impulsive-glacier-boy-tee',
    name: 'IMPULSIVE GLACIER BOY TEE',
    category: 'Signature',
    price: 12000,
    originalPrice: 15000,
    status: 'Black Friday Deal',
    stock: 25,
    description: 'The IMPULSIVE GLACIER BOY TEE features icy crystalline typography on premium heavyweight jet black cotton blanks.',
    mainImage: '/images/glacier_boy_tee.jpeg',
    hoverImage: '/images/Glacier boy tee.jpeg',
    images: [
      '/images/glacier_boy_tee.jpeg',
      '/images/Glacier boy tee.jpeg'
    ],
    details: [
      '100% HEAVYWEIGHT COTTON',
      'ICED-OUT GLACIER GRAPHIC PRINT',
      'IMPULSIVE CUT AND SEWN BLANKS',
      'TRUE TO SIZE / RELAXED FIT'
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Black / Ice Blue', hex: '#000000' }
    ],
    sizeChart: [
      { size: 'M',   chest: '40"', length: '29"' },
      { size: 'L',   chest: '42"', length: '29"' },
      { size: 'XL',  chest: '44"', length: '31"' },
      { size: 'XXL', chest: '46"', length: '32"' },
    ]
  }
];
