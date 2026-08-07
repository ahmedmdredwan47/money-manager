import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  Wallet,
  Tags,
  PieChart,
  Target,
  BarChart3,
  Settings,
  User,
  LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  category?: "main" | "management" | "system";
}

export const navigationConfig: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    category: "main",
  },
  {
    title: "Income",
    href: "/income",
    icon: TrendingUp,
    category: "main",
  },
  {
    title: "Expenses",
    href: "/expenses",
    icon: TrendingDown,
    category: "main",
  },
  {
    title: "Transactions",
    href: "/transactions",
    icon: ArrowLeftRight,
    category: "main",
  },
  {
    title: "Accounts",
    href: "/accounts",
    icon: Wallet,
    category: "management",
  },
  {
    title: "Categories",
    href: "/categories",
    icon: Tags,
    category: "management",
  },
  {
    title: "Budget",
    href: "/budget",
    icon: PieChart,
    category: "management",
  },
  {
    title: "Savings Goals",
    href: "/savings-goals",
    icon: Target,
    category: "management",
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
    category: "management",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    category: "system",
  },
  {
    title: "Profile",
    href: "/profile",
    icon: User,
    category: "system",
  },
];
