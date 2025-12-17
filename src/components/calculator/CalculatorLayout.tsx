import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Calculator, Printer, Palette, FileText, Settings, LayoutDashboard } from 'lucide-react';

interface CalculatorLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: '/calculator', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/calculator/prints', label: 'Prints', icon: Calculator },
  { path: '/calculator/printers', label: 'Printers', icon: Printer },
  { path: '/calculator/filaments', label: 'Filaments', icon: Palette },
  { path: '/calculator/settings', label: 'Settings', icon: Settings },
];

export function CalculatorLayout({ children }: CalculatorLayoutProps) {
  const location = useLocation();

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar Navigation */}
      <nav className="lg:w-64 flex-shrink-0">
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Price Calculator
          </h2>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                      isActive
                        ? 'bg-primary/20 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}
