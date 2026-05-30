export const environments = {
  apiUrl: 'https://se2026-ratebase-php-production.up.railway.app/',
  paddle: {
    environment: 'sandbox' as const,
    clientToken: 'test_cdd3510ccb30f6205222e640a8f',
    prices: [
      {
        amount: 10,
        label: '€10',
        priceId: 'pri_01krtwh6t5gz1dzfe8ajkkgkxb',
      },
      {
        amount: 3,
        label: '€3',
        priceId: 'pri_01krv1yrvvg0mndvt270hwq2m5',
      },
      {
        amount: 5,
        label: '€5',
        priceId: 'pri_01krv1y6ggbes5h79wzcgrvdjd',
      },
    ],
  },
};
