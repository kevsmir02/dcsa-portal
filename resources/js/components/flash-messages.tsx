import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { CheckCircle2, X, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

/** Surfaces the session flash from the last request, then fades itself out. */
export function FlashMessages() {
    const { flash } = usePage<SharedData>().props;
    const [dismissed, setDismissed] = useState<string | null>(null);
    const message = flash.success ?? flash.error;
    const isError = Boolean(flash.error);

    useEffect(() => {
        if (!message) return;
        setDismissed(null);
        const timer = setTimeout(() => setDismissed(message), 6000);
        return () => clearTimeout(timer);
    }, [message]);

    if (!message || dismissed === message) return null;

    return (
        <div
            role="status"
            className={cn(
                'flex items-start gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm shadow-sm',
                isError
                    ? 'border-destructive/25 bg-destructive/8 text-destructive'
                    : 'border-[hsl(145,56%,27%)]/25 bg-[hsl(145,56%,27%)]/8 text-[hsl(145,56%,24%)] dark:text-[hsl(145,45%,62%)]',
            )}
        >
            {isError ? <XCircle className="mt-0.5 size-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 size-4 shrink-0" />}
            <span className="flex-1">{message}</span>
            <button type="button" onClick={() => setDismissed(message)} className="opacity-60 transition-opacity hover:opacity-100">
                <X className="size-4" />
            </button>
        </div>
    );
}
