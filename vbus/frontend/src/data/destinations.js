// City content for the destination detail pages.
// Keyed by slug (lowercase city name).

const IMG = (id) => `https://images.unsplash.com/${id}?w=1600&q=80&auto=format&fit=crop`

export const DESTINATIONS = {
  hyderabad: {
    name: 'Hyderabad',
    state: 'Telangana',
    img: IMG('photo-1696941515998-d83f24967aca'),
    about: [
      'Hyderabad is the capital of Telangana, also known as Cyberabad and the “City of Pearls.” Established in 1591 by Muhammad Quli Qutb Shah, the city blends ancient heritage with contemporary growth.',
      'It is renowned for architectural marvels like Charminar, Golconda Fort and Chowmahalla Palace, as well as the IT hub in HITEC City, home to global giants. Its vibrant culture shows in the cuisine, traditional arts and educational institutions.',
    ],
    places: [
      { name: 'Charminar', desc: 'A symbol of Hyderabad, surrounded by bustling markets of pearls and bangles.' },
      { name: 'Golconda Fort', desc: 'A historic fort known for its acoustics and grand architecture.' },
      { name: 'Ramoji Film City', desc: 'One of the largest film cities in the world, offering guided tours.' },
      { name: 'Birla Mandir', desc: 'A serene marble temple offering panoramic views of the city.' },
      { name: 'Hussain Sagar Lake', desc: 'A picturesque spot with a massive Buddha statue at its centre.' },
    ],
    services: ['Vijayawada', 'Guntur', 'Bangalore', 'Eluru', 'Tirupati'],
  },
  bangalore: {
    name: 'Bangalore',
    state: 'Karnataka',
    img: IMG('photo-1708782462555-b3af03b4b3d2'),
    about: [
      'Bangalore, the capital of Karnataka, is India’s “Silicon Valley” — a green, cosmopolitan city famous for its pleasant climate, lush parks and thriving technology scene.',
      'From the grand Vidhana Soudha to leafy Cubbon Park and vibrant nightlife, Bangalore balances heritage with a fast-moving modern lifestyle.',
    ],
    places: [
      { name: 'Vidhana Soudha', desc: 'The imposing seat of the state legislature, a city landmark.' },
      { name: 'Cubbon Park', desc: 'A sprawling green lung in the heart of the city.' },
      { name: 'Lalbagh Botanical Garden', desc: 'Historic gardens with a glasshouse and a thousand-year-old rock.' },
      { name: 'Bangalore Palace', desc: 'A Tudor-style royal residence with manicured grounds.' },
      { name: 'ISKCON Temple', desc: 'A modern temple complex on a hilltop.' },
    ],
    services: ['Chennai', 'Coimbatore', 'Tirupati', 'Salem', 'Pondicherry'],
  },
  chennai: {
    name: 'Chennai',
    state: 'Tamil Nadu',
    img: IMG('photo-1582510003544-4d00b7f74220'),
    about: [
      'Chennai, the capital of Tamil Nadu, is the cultural gateway to South India — known for its temples, classical music and dance, and one of the longest urban beaches in the world.',
      'A blend of colonial history and Dravidian heritage, the city is also a major hub for healthcare, automobiles and IT.',
    ],
    places: [
      { name: 'Marina Beach', desc: 'A vast, lively seafront stretching along the Bay of Bengal.' },
      { name: 'Kapaleeshwarar Temple', desc: 'A colourful Dravidian temple in Mylapore.' },
      { name: 'Fort St. George', desc: 'India’s first British fortress, now housing a museum.' },
      { name: 'Santhome Basilica', desc: 'A neo-Gothic church built over the tomb of St. Thomas.' },
    ],
    services: ['Bangalore', 'Tirupati', 'Pondicherry', 'Coimbatore', 'Salem'],
  },
  tirupati: {
    name: 'Tirupati',
    state: 'Andhra Pradesh',
    img: IMG('photo-1733805569204-41768c7d8c0f'),
    about: [
      'Tirupati, nestled at the foot of the Tirumala hills in Andhra Pradesh, is one of the most visited pilgrimage destinations in the world, home to the revered Sri Venkateswara Temple.',
      'Beyond the temple, the town offers scenic hills, waterfalls and a deep spiritual atmosphere.',
    ],
    places: [
      { name: 'Sri Venkateswara Temple', desc: 'The famed hilltop temple drawing millions of devotees.' },
      { name: 'Tirumala Hills', desc: 'Seven sacred hills with breathtaking views.' },
      { name: 'Chandragiri Fort', desc: 'A historic fort with palaces from the Vijayanagara era.' },
      { name: 'Talakona Waterfall', desc: 'The highest waterfall in Andhra Pradesh, set in a forest.' },
    ],
    services: ['Bangalore', 'Chennai', 'Vijayawada', 'Hyderabad', 'Visakhapatnam'],
  },
  visakhapatnam: {
    name: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    img: IMG('photo-1609854534028-b512f5246abc'),
    about: [
      'Visakhapatnam (Vizag) is the largest city in Andhra Pradesh — a coastal gem framed by the Eastern Ghats and the Bay of Bengal, known for golden beaches and a major port.',
      'It pairs natural beauty with industry, offering beaches, hill viewpoints and nearby valleys and caves.',
    ],
    places: [
      { name: 'RK Beach', desc: 'A popular promenade along the Bay of Bengal.' },
      { name: 'Kailasagiri', desc: 'A hilltop park with panoramic sea and city views.' },
      { name: 'Submarine Museum', desc: 'A real decommissioned submarine turned museum.' },
      { name: 'Araku Valley', desc: 'A scenic hill station famous for coffee plantations.' },
    ],
    services: ['Vijayawada', 'Hyderabad', 'Tirupati', 'Guntur', 'Eluru'],
  },
  mumbai: {
    name: 'Mumbai',
    state: 'Maharashtra',
    img: IMG('photo-1570168007204-dfb528c6958f'),
    about: [
      'Mumbai, the financial capital of India, is a city of dreams — home to Bollywood, colonial-era architecture and an energy that never sleeps.',
      'From the iconic Gateway of India to the sweeping Marine Drive, Mumbai blends commerce, culture and coastline.',
    ],
    places: [
      { name: 'Gateway of India', desc: 'The grand seafront arch and the city’s most famous landmark.' },
      { name: 'Marine Drive', desc: 'A curving promenade nicknamed the “Queen’s Necklace.”' },
      { name: 'Elephanta Caves', desc: 'Ancient rock-cut cave temples on an island.' },
      { name: 'Juhu Beach', desc: 'A lively beach famed for street food and sunsets.' },
    ],
    services: ['Pune', 'Goa', 'Hyderabad', 'Bangalore'],
  },
  goa: {
    name: 'Goa',
    state: 'Goa',
    img: IMG('photo-1512343879784-a960bf40e7f2'),
    about: [
      'Goa is India’s favourite beach destination — a sun-soaked stretch of palm-fringed coast, Portuguese heritage and laid-back charm.',
      'Golden beaches, historic churches and a vibrant nightlife make Goa a year-round getaway.',
    ],
    places: [
      { name: 'Baga Beach', desc: 'A buzzing beach with shacks, water sports and nightlife.' },
      { name: 'Basilica of Bom Jesus', desc: 'A UNESCO World Heritage baroque church.' },
      { name: 'Fort Aguada', desc: 'A 17th-century Portuguese fort overlooking the sea.' },
      { name: 'Dudhsagar Falls', desc: 'A spectacular four-tiered waterfall in the Ghats.' },
    ],
    services: ['Mumbai', 'Pune', 'Bangalore'],
  },
  kerala: {
    name: 'Kerala',
    state: 'Kerala',
    img: IMG('photo-1602216056096-3b40cc0c9944'),
    about: [
      'Kerala, “God’s Own Country,” is a tropical paradise of palm-lined backwaters, misty hill stations and serene beaches.',
      'Cruise the Alleppey backwaters on a houseboat, sip tea in Munnar, or wander the historic lanes of Fort Kochi.',
    ],
    places: [
      { name: 'Alleppey Backwaters', desc: 'A network of canals best explored by houseboat.' },
      { name: 'Munnar', desc: 'Rolling tea plantations and cool mountain air.' },
      { name: 'Fort Kochi', desc: 'Colonial streets, Chinese fishing nets and cafes.' },
      { name: 'Periyar Wildlife Sanctuary', desc: 'A lush reserve famed for elephants.' },
    ],
    services: ['Bangalore', 'Chennai', 'Coimbatore'],
  },
  jaipur: {
    name: 'Jaipur',
    state: 'Rajasthan',
    img: IMG('photo-1599661046289-e31897846e41'),
    about: [
      'Jaipur, the “Pink City” and capital of Rajasthan, dazzles with majestic forts, ornate palaces and vibrant bazaars.',
      'Part of India’s Golden Triangle, it offers a regal glimpse into Rajputana history and culture.',
    ],
    places: [
      { name: 'Hawa Mahal', desc: 'The iconic “Palace of Winds” with its honeycomb façade.' },
      { name: 'Amber Fort', desc: 'A majestic hilltop fort overlooking Maota Lake.' },
      { name: 'City Palace', desc: 'A royal complex blending Rajput and Mughal styles.' },
      { name: 'Jantar Mantar', desc: 'A UNESCO-listed astronomical observatory.' },
    ],
    services: ['Delhi', 'Agra'],
  },
  delhi: {
    name: 'Delhi',
    state: 'Delhi',
    img: IMG('photo-1587474260584-136574528ed5'),
    about: [
      'Delhi, India’s capital, is a sprawling metropolis where ancient monuments stand beside a fast-paced modern city.',
      'From Mughal masterpieces to wide colonial boulevards, Delhi layers centuries of history into one unforgettable destination.',
    ],
    places: [
      { name: 'India Gate', desc: 'A grand war memorial at the heart of the city.' },
      { name: 'Red Fort', desc: 'A vast Mughal fortress of red sandstone.' },
      { name: 'Qutub Minar', desc: 'The world’s tallest brick minaret, a UNESCO site.' },
      { name: 'Lotus Temple', desc: 'A serene, flower-shaped Bahá’í house of worship.' },
    ],
    services: ['Jaipur', 'Agra'],
  },
  agra: {
    name: 'Agra',
    state: 'Uttar Pradesh',
    img: IMG('photo-1564507592333-c60657eea523'),
    about: [
      'Agra, on the banks of the Yamuna, is home to the Taj Mahal — one of the Seven Wonders of the World and the ultimate symbol of love.',
      'A former Mughal capital, the city brims with grand forts, tombs and timeless architecture.',
    ],
    places: [
      { name: 'Taj Mahal', desc: 'The breathtaking white-marble mausoleum at sunrise.' },
      { name: 'Agra Fort', desc: 'A massive red-sandstone Mughal fortress.' },
      { name: 'Fatehpur Sikri', desc: 'A perfectly preserved Mughal ghost city nearby.' },
      { name: 'Mehtab Bagh', desc: 'Riverside gardens with the best Taj sunset views.' },
    ],
    services: ['Delhi', 'Jaipur'],
  },
  amritsar: {
    name: 'Amritsar',
    state: 'Punjab',
    img: IMG('photo-1623059508779-2542c6e83753'),
    about: [
      'Amritsar, the spiritual heart of Sikhism, is home to the radiant Golden Temple and a city steeped in history and warm Punjabi hospitality.',
      'Witness the stirring Wagah border ceremony and savour legendary Amritsari cuisine.',
    ],
    places: [
      { name: 'Golden Temple', desc: 'The gilded Harmandir Sahib shimmering over a sacred pool.' },
      { name: 'Jallianwala Bagh', desc: 'A poignant memorial garden of national importance.' },
      { name: 'Wagah Border', desc: 'The famous flag-lowering ceremony at dusk.' },
    ],
    services: ['Delhi'],
  },
  manali: {
    name: 'Manali',
    state: 'Himachal Pradesh',
    img: IMG('photo-1605649487212-47bdab064df7'),
    about: [
      'Manali, cradled in the Himalayas, is a year-round mountain escape of snow-capped peaks, pine forests and rushing rivers.',
      'A favourite for honeymooners and adventurers alike, it offers everything from paragliding to peaceful riverside cafes.',
    ],
    places: [
      { name: 'Rohtang Pass', desc: 'A high mountain pass with snow and sweeping views.' },
      { name: 'Solang Valley', desc: 'An adventure hub for skiing and paragliding.' },
      { name: 'Hadimba Temple', desc: 'An ancient cedar-wood temple in the forest.' },
      { name: 'Old Manali', desc: 'Charming lanes full of cafes and craft shops.' },
    ],
    services: ['Delhi'],
  },
}

export const getDestination = (slug) => DESTINATIONS[(slug || '').toLowerCase()]
