import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { type ReactNode } from 'react';

/**
 * The portal's front door: the school seal on a crimson field, with the sign-in
 * card sitting on top of it.
 */
export default function AuthLayout({ children, title, description }: { children: ReactNode; title: string; description: string }) {
    const { school } = usePage<SharedData>().props;

    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-[hsl(0,68%,22%)] px-4 py-10">
            {/* A soft laurel-and-crimson wash so the card has something to sit on. */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-90"
                style={{
                    background:
                        'radial-gradient(1100px 620px at 15% 5%, hsl(0,62%,34%) 0%, transparent 62%),' +
                        'radial-gradient(820px 560px at 92% 96%, hsl(240,45%,26%) 0%, transparent 58%),' +
                        'linear-gradient(160deg, hsl(0,70%,25%) 0%, hsl(0,66%,17%) 100%)',
                }}
            />
            <div
                aria-hidden
                className="pointer-events-none absolute -top-24 -left-24 size-[420px] rounded-full opacity-[0.07]"
                style={{ background: 'radial-gradient(circle, #fff 0%, transparent 68%)' }}
            />

            <div className="relative w-full max-w-[400px]">
                <div className="mb-6 flex flex-col items-center text-center">
                    <img
                        src="/images/dcsa-logo.png"
                        alt={`${school.short_name} seal`}
                        className="size-24 object-contain drop-shadow-[0_4px_14px_rgba(0,0,0,0.35)]"
                    />
                    <h1 className="mt-3 text-lg leading-tight font-bold tracking-tight text-white uppercase">{school.name}</h1>
                    <p className="mt-1 text-[13px] text-white/70">{school.system_name}</p>
                </div>

                <div className="bg-card rounded-2xl border border-white/10 p-6 shadow-2xl">
                    <div className="mb-5 text-center">
                        <h2 className="text-base font-semibold">{title}</h2>
                        {description && <p className="text-muted-foreground mt-0.5 text-[13px]">{description}</p>}
                    </div>
                    {children}
                </div>

                <p className="mt-6 text-center text-[11px] text-white/50">
                    &copy; {new Date().getFullYear()} {school.name}. All rights reserved.
                </p>
            </div>
        </div>
    );
}
