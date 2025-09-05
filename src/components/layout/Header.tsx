"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const pathNameMap: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/leads": "Leads",
  "/campaigns": "Campaigns",
  "/settings": "Settings",
};

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const HomeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6a2 2 0 01-2 2H10a2 2 0 01-2-2V5z" />
  </svg>
);

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Home", href: "/dashboard" }
  ];

  let currentPath = "";
  for (const segment of pathSegments) {
    currentPath += `/${segment}`;
    const label = pathNameMap[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1);
    
    breadcrumbs.push({
      label,
      href: currentPath
    });
  }

  return breadcrumbs;
}

interface HeaderProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  onMobileMenuClick?: () => void;
}

export function Header({ title, subtitle, actions, onMobileMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);
  
  // Don't show breadcrumbs on auth pages
  if (pathname.startsWith("/auth")) {
    return null;
  }

  const currentPage = breadcrumbs[breadcrumbs.length - 1];
  const displayTitle = title || currentPage?.label || "Page";

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1 flex items-center">
          {/* Mobile Menu Button */}
          {onMobileMenuClick && (
            <button
              onClick={onMobileMenuClick}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 mr-2"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}

          <div className="min-w-0">
            {/* Breadcrumbs */}
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                {breadcrumbs.map((breadcrumb, index) => {
                  const isLast = index === breadcrumbs.length - 1;
                  
                  return (
                    <li key={`${index}-${breadcrumb.label}`} className="flex items-center">
                      {index > 0 && (
                        <ChevronRightIcon className="flex-shrink-0 h-4 w-4 text-gray-400 mx-2" />
                      )}
                      {isLast ? (
                        <span className="text-sm font-medium text-gray-500">
                          {index === 0 && <HomeIcon className="inline w-4 h-4 mr-1" />}
                          {breadcrumb.label}
                        </span>
                      ) : (
                        <Link
                          href={breadcrumb.href!}
                          className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {index === 0 && <HomeIcon className="inline w-4 h-4 mr-1" />}
                          {breadcrumb.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>

            {/* Page Title */}
            <div className="mt-2">
              <h1 className="text-2xl font-bold text-gray-900">{displayTitle}</h1>
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex items-center space-x-3">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
