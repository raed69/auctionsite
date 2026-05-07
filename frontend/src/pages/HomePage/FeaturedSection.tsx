import AuctionCard from '../../components/AuctionCard';
import type { Auction } from '../../types/auction';

const MOCK_AUCTIONS: Auction[] = [
  {
    id: '1',
    title: "Vacheron Constantin Overseas Dual Time 'Everest' Edition",
    description:
      'A limited edition piece commemorating extreme exploration, featuring a distinctive textured grey dial and orange accents.',
    category: 'Timepieces',
    subCategory: 'Rare Luxury',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBp_VF0MIwTdbFst-iaPlMsUyWS4mvmP_DAoJgg4IUEW3SpuyPXJtNl6eb2bccFm8JYN1-RKmVGvi32IKxmsEskUUJhLWfjHTmhZ0SYZCZfX_mq1tgUesNsP3lzuBxFV_QyzjDzLrTBNuyTZO0wlH63mfu_cOydaALnh3c15NhFKNnvmx1f4T5-J0Fx2Zq64RHE3gVQAJ76KE3csqFJfihCWYAj5uqTCNgi76mhcRXuBy3PzgjFAntbO36ZsFIIMu5GKXrRUNyAKw',
    currentBid: 54200,
    startingBid: 40000,
    bidCount: 22,
    bidderCount: 18,
    status: 'ending_soon',
    endsAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
    hasReserve: true,
    isHotLot: false,
    sellerId: 'seller-1',
  },
  {
    id: '2',
    title: 'Neon Resonance #402',
    description: 'Abstract neon light installation with vibrant magenta and cyan glows.',
    category: 'Fine Art',
    subCategory: 'Digital Art',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuClVHMySnEdqoCVuYJOl2N9iUiV7AnHMlCoMuYboPKb4kl8spsrA3FQv0JsmfCTEA9eQhnpin-CxvxMa0Z9hnItWX7LPzBnp8HXIjVXIWSR9sVa5hZ3hVcRhgHqvvndi7tpCLT4L3YRctibYUrRWDgGmlUtn0vGKPZp1IuH4Wl-25f9SdiRVefisszJPXyvawY1S7WEpEIRGKEIaNqYHEYe9JN0ooRKO9J6x-j6AmyS7okydoAeAjGBQOhwg53wxOxjWQhDPwpVjQ',
    currentBid: 1200,
    startingBid: 1200,
    bidCount: 0,
    bidderCount: 0,
    status: 'active',
    endsAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    hasReserve: true,
    isHotLot: false,
    sellerId: 'seller-2',
  },
  {
    id: '3',
    title: '1988 Porsche 911 Carrera',
    description:
      'The ultimate classic air-cooled 911, matching numbers and pristine restoration.',
    category: 'Automobiles',
    subCategory: 'Classics',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBNTOIh8-uhh0mrgPEw_HH6wv3CxQFUEX3hTWEZYObW_lF8Lq7Z5vDQNZRlg3oKY15hAbVrJe8cqqE7kjtKEqpfNz4zfEotOjya5GZql6fxPkdUgmCLaA3RnB_kWt51OF4wO9zRapQ8eZgFx8JzR0V4solgM8UOVw00xsPyZQQxrya112oMnXuDMssHxcdjGCAxRsO9qbuYBS88IawPSu79dL8KKz9wvHp_V2acQneG43WxQ_JhaVq4JBCEC2nnPB6vjpp2-KfrUA',
    currentBid: 142500,
    startingBid: 100000,
    bidCount: 12,
    bidderCount: 9,
    status: 'ending_soon',
    endsAt: new Date(Date.now() + 42 * 60 * 1000),
    hasReserve: true,
    isHotLot: true,
    sellerId: 'seller-3',
  },
  {
    id: '4',
    title: 'Liquid Gold Study #12',
    description: 'Abstract fluid shapes in gold and marble texture flowing against deep obsidian.',
    category: 'Fine Art',
    subCategory: 'Abstract',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDLTl1vOOCaOEJSqCIQiwtbwYJDihvslXTlCIS4rGMUxvd5Q_poemcsihAviPZMjYmTpqkR5AE0E_bJCcxypV1ACfi7MDgq2eWso2TK6BXxYBa8Iicf_kRV8-2xTogS5zPY4VkQmklgugXNtBuoepPKqZkK8n3WBRwQlaZVOs2xhtcIYUn8qV3j3iD8xeg7W33v1ib_Dbuaexj2PENdDU5TkxVKGuYd4R5DUtpagxNvFSV0nCNnHONzcZmaFyho8sRn6ag7fD56xQ',
    currentBid: 3450,
    startingBid: 500,
    bidCount: 34,
    bidderCount: 20,
    status: 'active',
    endsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    hasReserve: false,
    isHotLot: false,
    sellerId: 'seller-4',
  },
  {
    id: '5',
    title: "Omega Speedmaster 'Moonwatch'",
    description: 'Heritage chronometer with legendary NASA certification and original bracelet.',
    category: 'Timepieces',
    subCategory: 'Heritage',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCM37vV_vbUQtgxMhuAOh0wUlK0DQrpGnQnV-3RXl7o1WXDwbxbRUgIHDUOG_7CrucRs4sfJc1aTJPPnH2XolpSzlAfMEnD9lnBhgd6X8MZmlhQgc2xwhfXpqGk7JUmU0HutsVjyYvzTlwhHRJgZuj_YgoHNqkoDvi8yP5ZUx6m-kx7pHM8NdbysyTvHlwrh6KRIWbxAllTY-Uvf2UxQgwEYd-7yjWX_d3kRFKBx0UYDkLo8QfI9sv7-5vnMkzChOkh0BmdrD42gA',
    currentBid: 6800,
    startingBid: 4000,
    bidCount: 8,
    bidderCount: 6,
    status: 'active',
    endsAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
    hasReserve: true,
    isHotLot: false,
    sellerId: 'seller-5',
  },
];

export default function FeaturedSection() {
  const [featured, ...rest] = MOCK_AUCTIONS;

  return (
    <>
      {/* Section Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="font-headline text-3xl font-bold tracking-tight">Featured Lots</h2>
          <p className="text-on-surface-variant font-label text-sm mt-1">
            Exclusively curated masterpieces with active bidding
          </p>
        </div>
        <button className="text-primary font-bold font-body text-sm border-b-2 border-surface-tint pb-0.5">
          View all featured
        </button>
      </div>

      {/* 12-Column Grid */}
      <div className="grid grid-cols-12 gap-8">
        {/* Large featured card */}
        <AuctionCard auction={featured} variant="featured" />

        {/* Standard cards */}
        {rest.map((auction) => (
          <AuctionCard key={auction.id} auction={auction} variant="standard" />
        ))}
      </div>
    </>
  );
}