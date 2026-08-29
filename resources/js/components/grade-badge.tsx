import { cn } from '@/lib/utils';

/**
 * A transmuted grade, coloured by its DepEd descriptor band.
 * 75 is the passing mark, so anything below it reads as crimson.
 */
export function GradeBadge({ grade, className }: { grade: number | null | undefined; className?: string }) {
    if (grade === null || grade === undefined) {
        return <span className={cn('text-muted-foreground tabular text-sm', className)}>—</span>;
    }

    const tone =
        grade >= 90
            ? 'bg-[hsl(145,56%,27%)]/12 text-[hsl(145,56%,24%)] dark:bg-[hsl(145,45%,50%)]/15 dark:text-[hsl(145,45%,60%)]'
            : grade >= 85
              ? 'bg-[hsl(240,43%,29%)]/10 text-[hsl(240,43%,32%)] dark:bg-[hsl(240,55%,66%)]/15 dark:text-[hsl(240,55%,74%)]'
              : grade >= 80
                ? 'bg-[hsl(200,60%,35%)]/10 text-[hsl(200,60%,30%)] dark:bg-[hsl(200,60%,55%)]/15 dark:text-[hsl(200,60%,65%)]'
                : grade >= 75
                  ? 'bg-[hsl(35,82%,50%)]/14 text-[hsl(35,82%,34%)] dark:bg-[hsl(35,85%,58%)]/15 dark:text-[hsl(35,85%,62%)]'
                  : 'bg-destructive/12 text-destructive dark:text-[hsl(0,70%,68%)]';

    return (
        <span className={cn('tabular inline-flex min-w-9 justify-center rounded-md px-2 py-0.5 text-sm font-bold', tone, className)}>{grade}</span>
    );
}

export function descriptorFor(grade: number | null | undefined): string {
    if (grade === null || grade === undefined) return 'No grade yet';
    if (grade >= 90) return 'Outstanding';
    if (grade >= 85) return 'Very Satisfactory';
    if (grade >= 80) return 'Satisfactory';
    if (grade >= 75) return 'Fairly Satisfactory';
    return 'Did Not Meet Expectations';
}
