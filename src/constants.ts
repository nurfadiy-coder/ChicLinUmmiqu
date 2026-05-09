import { MenuItem, Ingredient } from './types';

export const MAIN_MENU: MenuItem[] = [
  {
    id: 'chicken-large',
    name: 'Chicken Large',
    price: 20000,
    cost: 12000,
    category: 'Main',
    stock: 50
  },
  {
    id: 'chicken-small',
    name: 'Chicken Small',
    price: 18000,
    cost: 10000,
    category: 'Main',
    stock: 50
  },
  {
    id: 'kentang-large',
    name: 'Kentang Goreng Large',
    price: 12000,
    cost: 6000,
    category: 'Main',
    stock: 30
  },
  {
    id: 'kentang-small',
    name: 'Kentang Goreng Small',
    price: 10000,
    cost: 5000,
    category: 'Main',
    stock: 30
  }
];

export const INITIAL_INGREDIENTS: Ingredient[] = [
  { id: '1', name: 'Ayam Fillet', stock: 10, unit: 'kg', minStock: 2 },
  { id: '2', name: 'Tepung Bumbu', stock: 5, unit: 'kg', minStock: 1 },
  { id: '3', name: 'Minyak Goreng', stock: 10, unit: 'L', minStock: 3 },
  { id: '4', name: 'Kentang', stock: 15, unit: 'kg', minStock: 5 },
  { id: '5', name: 'Bumbu Tabur', stock: 2, unit: 'kg', minStock: 0.5 },
];

export const COLORS = {
  primary: '#E11D48', // Red-600
  secondary: '#FACC15', // Yellow-400
  accent: '#FFFFFF', // White
  dark: '#1F2937', // Gray-800
};
