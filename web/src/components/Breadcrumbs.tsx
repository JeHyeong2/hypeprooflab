import Link from 'next/link';

export interface Crumb {
  name: string;
  href?: string;
}

interface BreadcrumbsProps {
  crumbs: Crumb[];
  className?: string;
}

export default function Breadcrumbs({ crumbs, className = '' }: BreadcrumbsProps) {
  if (!crumbs || crumbs.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`text-sm text-zinc-500 ${className}`}
    >
      <ol className="flex items-center flex-wrap gap-x-2 gap-y-1">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <li key={`${crumb.name}-${i}`} className="flex items-center gap-2">
              {crumb.href && !isLast ? (
                <Link
                  href={crumb.href}
                  className="hover:text-white transition-colors"
                >
                  {crumb.name}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className={isLast ? 'text-zinc-300 truncate max-w-[70vw] sm:max-w-[420px]' : ''}
                >
                  {crumb.name}
                </span>
              )}
              {!isLast && <span className="text-zinc-600" aria-hidden>›</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
