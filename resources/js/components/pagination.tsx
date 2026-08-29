import { cn } from '@/lib/utils';
import { type Paginated } from '@/types';
import { Link } from '@inertiajs/react';

export function Pagination<T>({ meta, label = 'records' }: { meta: Paginated<T>; label?: string }) {
    if (meta.last_page <= 1) {
        return (
            <div className="text-muted-foreground px-1 py-2 text-sm">
                Showing {meta.total} {label}
            </div>
        );
    }

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 px-1 py-2">
            <div className="text-muted-foreground text-sm">
                Showing {meta.from ?? 0}–{meta.to ?? 0} of {meta.total} {label}
            </div>
            <div className="flex flex-wrap gap-1">
                {meta.links.map((link, index) =>
                    link.url ? (
                        <Link
                            key={index}
                            href={link.url}
                            preserveScroll
                            preserveState
                            className={cn(
                                'rounded-md border px-3 py-1.5 text-sm transition-colors',
                                link.active ? 'border-primary bg-primary text-primary-foreground font-semibold' : 'hover:bg-muted border-border',
                            )}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ) : (
                        <span
                            key={index}
                            className="text-muted-foreground border-border rounded-md border px-3 py-1.5 text-sm opacity-50"
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ),
                )}
            </div>
        </div>
    );
}
