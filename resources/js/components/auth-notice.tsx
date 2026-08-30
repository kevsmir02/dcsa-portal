import { cn } from '@/lib/utils';
import { type LucideIcon } from 'lucide-react';
import { type ReactNode } from 'react';

/**
 * The status band on the auth screens -- a reset link sent, a verification email
 * resent, a reminder of who is signed in. Laurel reports something that went
 * through; navy just explains where the visitor is.
 */
const tones = {
    laurel: 'border-[hsl(145,56%,27%)]/25 bg-[hsl(145,56%,27%)]/8 text-[hsl(145,56%,24%)] dark:border-[hsl(145,45%,50%)]/25 dark:bg-[hsl(145,45%,50%)]/10 dark:text-[hsl(145,45%,62%)]',
    navy: 'border-[hsl(240,43%,29%)]/22 bg-[hsl(240,43%,29%)]/7 text-[hsl(240,43%,32%)] dark:border-[hsl(240,55%,66%)]/25 dark:bg-[hsl(240,55%,66%)]/10 dark:text-[hsl(240,55%,74%)]',
} as const;

export function AuthNotice({
    icon: Icon,
    tone = 'laurel',
    children,
    className,
}: {
    icon: LucideIcon;
    tone?: keyof typeof tones;
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={cn('flex items-start gap-2.5 rounded-md border px-3 py-2.5 text-[13px] leading-relaxed font-medium', tones[tone], className)}>
            <Icon className="mt-px size-4 shrink-0" />
            <span>{children}</span>
        </div>
    );
}
