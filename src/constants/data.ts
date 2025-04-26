import { NavItem } from '@/types';

export type Product = {
  photo_url: string;
  name: string;
  description: string;
  created_at: string;
  price: number;
  id: number;
  category: string;
  updated_at: string;
};

//Info: The following data is used for the sidebar navigation and Cmd K bar.
export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard/overview',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['⌘', 'd'],
    items: [] // Empty array as there are no child items for Dashboard
  },
  {
    title: 'Telegram Bots',
    url: '/dashboard/telegram-bot',
    icon: 'robot',
    shortcut: ['⌘', 'p'],
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'Custom Users',
    url: '/dashboard/custom-users',
    icon: 'user2',
    shortcut: ['⌘', 'u'],
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'Wallet',
    url: '/dashboard/wallet',
    icon: 'billing',
    shortcut: ['⌘', 'w'],
    isActive: false,
    items: []
  },
  {
    title: 'Profile',
    url: '/dashboard/profile',
    icon: 'userPen',
    isActive: false,
    items: []
  }
];
