import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { ArrowRight, type LucideIcon } from 'lucide-react';

const tones = {
    crimson: 'bg-[hsl(0,68%,32%)]/10 text-[hsl(0,68%,32%)] dark:bg-[hsl(0,62%,52%)]/15 dark:text-[hsl(0,62%,62%)]',
    navy: 'bg-[hsl(240,43%,29%)]/10 text-[hsl(240,43%,29%)] dark:bg-[hsl(240,55%,66%)]/15 dark:text-[hsl(240,55%,72%)]',
    laurel: 'bg-[hsl(145,56%,27%)]/10 text-[hsl(145,56%,27%)] dark:bg-[hsl(145,45%,50%)]/15 dark:text-[hsl(145,45%,58%)]',
    ochre: 'bg-[hsl(35,82%,50%)]/12 text-[hsl(35,82%,38%)] dark:bg-[hsl(35,85%,58%)]/15 dark:text-[hsl(35,85%,62%)]',
} as const;

export function StatCard({
    label,
    value,
    icon: Icon,
    tone = 'crimson',
    href,
    hint,
}: {
    label: string;
    value: number | string;
    icon: LucideIcon;
    tone?: keyof typeof tones;
    href?: string;
    hint?: string;
}) {
    return (
        <Card className="flex flex-col gap-3 p-4">
            <div className="flex items-center gap-3">
                <div className={cn('flex size-11 shrink-0 items-center justify-center rounded-xl', tones[tone])}>
                    <Icon className="size-5" />
                </div>
                <div className="min-w-0">
                    <div className="text-muted-foreground truncate text-xs font-medium tracking-wide uppercase">{label}</div>
                    <div className="tabular text-2xl leading-tight font-bold">{value}</div>
                </div>
            </div>
            {href ? (
                <Link href={href} className="text-primary inline-flex items-center gap-1 text-xs font-semibold hover:underline">
                    {hint ?? 'View all'} <ArrowRight className="size-3" />
                </Link>
            ) : (
                hint && <div className="text-muted-foreground text-xs">{hint}</div>
            )}
        </Card>
    );
}
