import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Review {
  id: string;
  productSlug: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewsStore {
  reviews: Review[];
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;
  getReviewsForProduct: (slug: string) => Review[];
  getAverageRating: (slug: string) => number;
}

const initialMockReviews: Review[] = [
  {
    id: 'm1',
    productSlug: 'signature-face-tee-red',
    userName: 'Kaelen O.',
    rating: 5,
    comment: 'The heavy 300GSM fabric hangs beautifully. It holds a structural boxy shape exactly as advertised. The crimson hue is deep and rich.',
    createdAt: '2026-05-18T10:30:00Z',
  },
  {
    id: 'm2',
    productSlug: 'signature-face-tee-red',
    userName: 'Amara W.',
    rating: 4,
    comment: 'Great texture and print quality. It fits very oversized, so I would suggest sizing down if you prefer a traditional fit. Love the design.',
    createdAt: '2026-05-19T14:20:00Z',
  },
  {
    id: 'm3',
    productSlug: 'hotgirl-edition-tee-red',
    userName: 'Tomi S.',
    rating: 5,
    comment: 'Absolutely love the typography detail. The fabric feels premium and sits perfectly. A standout piece in my collection.',
    createdAt: '2026-05-17T09:15:00Z',
  },
  {
    id: 'm4',
    productSlug: 'signature-face-tee-black',
    userName: 'Marcus Y.',
    rating: 5,
    comment: 'The obsidian finish is incredible. Highly detailed screen print that does not fade after washes. Heavy fabric is perfect for layering.',
    createdAt: '2026-05-16T16:45:00Z',
  },
  {
    id: 'm5',
    productSlug: 'worldwide-instinct-tee-black',
    userName: 'Devin C.',
    rating: 5,
    comment: 'Super heavy cotton, standard streetwear aesthetic. The graphics on the back are crisp and the stealth black is stunning.',
    createdAt: '2026-05-15T11:00:00Z',
  }
];

export const useReviews = create<ReviewsStore>()(
  persist(
    (set, get) => ({
      reviews: initialMockReviews,
      addReview: (reviewData) => {
        const newReview: Review = {
          ...reviewData,
          id: `rev-${Math.random().toString(36).substring(2, 9)}`,
          createdAt: new Date().toISOString(),
        };
        set({ reviews: [newReview, ...get().reviews] });
      },
      getReviewsForProduct: (slug) => {
        return get().reviews.filter(r => r.productSlug === slug);
      },
      getAverageRating: (slug) => {
        const productReviews = get().reviews.filter(r => r.productSlug === slug);
        if (productReviews.length === 0) return 5; // Default rating
        const sum = productReviews.reduce((acc, r) => acc + r.rating, 0);
        return parseFloat((sum / productReviews.length).toFixed(1));
      }
    }),
    {
      name: 'impulsive-reviews-storage',
    }
  )
);
