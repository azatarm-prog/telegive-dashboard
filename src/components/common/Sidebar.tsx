import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Plus, 
  History, 
  Users,
  Gift,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/utils/constants';
import { useGiveaway } from '@/hooks/useGiveaway';

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { activeGiveaway } = useGiveaway();

  const sidebarItems: SidebarItem[] = [
    {
      title: 'Dashboard',
      href: ROUTES.DASHBOARD,
      icon: LayoutDashboard,
    },
    {
      title: 'Create Giveaway',
      href: ROUTES.CREATE_GIVEAWAY,
      icon: Plus,
    },
    {
      title: 'History',
      href: ROUTES.HISTORY,
      icon: History,
    },
  ];

  // Add active giveaway stats to sidebar if there's an active giveaway
  const statsItems: SidebarItem[] = activeGiveaway ? [
    {
      title: 'Active Giveaway',
      href: ROUTES.DASHBOARD,
      icon: Gift,
    },
    {
      title: 'Participants',
      href: ROUTES.DASHBOARD,
      icon: Users,
      badge: activeGiveaway.participant_count,
    },
    {
      title: 'Analytics',
      href: ROUTES.DASHBOARD,
      icon: BarChart3,
    },
  ] : [];

  return (
    <div className="pb-12 w-64">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Navigation
          </h2>
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors',
                    isActive || location.pathname === item.href
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground'
                  )
                }
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
                {item.badge && (
                  <span className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        </div>

        {statsItems.length > 0 && (
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              Current Giveaway
            </h2>
            <div className="space-y-1">
              {statsItems.map((item, index) => (
                <div
                  key={`${item.href}-${index}`}
                  className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground"
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                  {item.badge !== undefined && (
                    <span className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs">
                      {item.badge}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;

