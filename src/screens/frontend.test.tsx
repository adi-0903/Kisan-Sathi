import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HomeScreen } from './HomeScreen';
import { ConsumerHomeScreen } from './ConsumerHomeScreen';

// --- MOCKS ---

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
    i18n: { language: 'en', changeLanguage: vi.fn() }
  })
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/' })
  };
});

// Mock framer-motion/motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, onClick }: any) => <div className={className} onClick={onClick}>{children}</div>,
    section: ({ children, className, onClick }: any) => <section className={className} onClick={onClick}>{children}</section>,
    header: ({ children, className }: any) => <header className={className}>{children}</header>,
    button: ({ children, className, onClick }: any) => <button className={className} onClick={onClick}>{children}</button>
  },
  AnimatePresence: ({ children }: any) => <>{children}</>
}));

// Mock Firebase
vi.mock('../lib/firebase', () => ({
  db: {},
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  onSnapshot: () => vi.fn(), // returns unsubscribe fn
  addDoc: vi.fn(),
  serverTimestamp: () => new Date().toISOString(),
  doc: vi.fn()
}));

// Mock AuthContext
let mockUserRole: 'supplier' | 'consumer' = 'supplier';
let mockUserName = 'Test Farmer';

vi.mock('../lib/AuthContext', () => ({
  useAuth: () => ({
    user: {
      get uid() { return 'test-user-uid'; },
      get name() { return mockUserName; },
      get role() { return mockUserRole; },
      phone: '9876543210',
      village: 'Green Village',
      state: 'Punjab'
    },
    loading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn()
  })
}));

// Mock Subscriptions
vi.mock('../lib/subscription', () => ({
  useSubscription: () => ({
    isExpired: false,
    daysLeft: 25
  })
}));

// Mock Custom Sync State Store
vi.mock('../lib/store', () => ({
  useSyncState: (key: string, initial: any) => {
    if (key === 'ks_crops') return [[{ id: '1', name: 'Wheat' }], vi.fn()];
    if (key === 'ks_tasks') return [[{ id: '1', title: 'Water wheat', completed: false }], vi.fn()];
    return [initial, vi.fn()];
  }
}));

// Mock API calls
vi.mock('../lib/api', () => ({
  fetchWeather: vi.fn().mockResolvedValue({ temp: 30, condition: 'Sunny', forecast: [] }),
  fetchSprayRecommendation: vi.fn().mockResolvedValue({ recommendation: 'Spray Now', reasoning: 'Optimal', isGood: true })
}));

// --- TESTS ---

describe('Kisan Sathi Frontend Component Tests', () => {
  
  test('renders HomeScreen (Supplier Dashboard) correctly', async () => {
    mockUserRole = 'supplier';
    mockUserName = 'Jaspreet Singh';

    render(
      <MemoryRouter>
        <HomeScreen />
      </MemoryRouter>
    );

    // Verify Greeting displays the farmer's name
    expect(screen.getByText(/Jaspreet/i)).toBeDefined();
    
    // Verify "KisanSaathi" title displays in the logo/header
    expect(screen.getAllByText(/KisanSaathi/i).length).toBeGreaterThan(0);

    // Verify critical buttons/shortcuts exist
    expect(screen.getByText(/Unlock KisanSaathi Pro/i)).toBeDefined();
    
    // Verify tasks block renders
    expect(screen.getByText(/Water wheat/i)).toBeDefined();
  });

  test('renders ConsumerHomeScreen (Consumer Hub) correctly', async () => {
    mockUserRole = 'consumer';
    mockUserName = 'Ananya Sharma';

    render(
      <MemoryRouter>
        <ConsumerHomeScreen />
      </MemoryRouter>
    );

    // Verify storefront header is loaded
    expect(screen.getByText(/Consumer Storefront/i)).toBeDefined();
    expect(screen.getByText(/KisanSaathi Fresh/i)).toBeDefined();

    // Verify navigation tabs (Shop and My Orders) are rendered
    expect(screen.getByText(/Browse Shop/i)).toBeDefined();
    expect(screen.getByText(/My Orders/i)).toBeDefined();
    
    // Check that search filter placeholder or search icon exists
    expect(screen.getByPlaceholderText(/tomatoes, fresh cow milk/i)).toBeDefined();
    
    // Verify categories are represented in selection filter bar
    expect(screen.getByText(/Fruits/i)).toBeDefined();
    expect(screen.getByText(/Vegetables/i)).toBeDefined();
    expect(screen.getByText(/Grains/i)).toBeDefined();
    expect(screen.getByText(/Dairy/i)).toBeDefined();
  });
});
