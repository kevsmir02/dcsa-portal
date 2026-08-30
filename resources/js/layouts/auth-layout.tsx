import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { type ReactNode } from 'react';

/**
 * The portal's front door. On a wide screen the school takes the left half --
 * seal, name and what the system is for -- and the form gets a clean panel of
 * its own on the right. On a phone the crimson field becomes a header band and
 * the form sits on a sheet lifted over it.
 */
export default function AuthLayout({
    children,
    title,
    description,
    footer,
}: {
    children: ReactNode;
    title: string;
    description?: string;
    footer?: ReactNode;
}) {
    const { school, auth } = usePage<SharedData>().props;

    return (
        <div className="flex min-h-svh flex-col lg:flex-row">
            <aside
                className="relative isolate overflow-hidden px-6 pt-11 pb-14 lg:flex lg:w-[44%] lg:shrink-0 lg:flex-col lg:justify-between lg:px-14 lg:py-12"
                style={{ background: 'linear-gradient(160deg, hsl(0,70%,25%) 0%, hsl(0,66%,17%) 100%)' }}
            >
                {/* The same laurel-and-crimson wash the portal has always used. */}
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background:
                            'radial-gradient(1100px 620px at 15% 5%, hsl(0,62%,34%) 0%, transparent 62%),' +
                            'radial-gradient(820px 560px at 92% 96%, hsl(240,45%,26%) 0%, transparent 58%)',
                    }}
                />
                <img
                    src="/images/dcsa-crest-watermark.png"
                    alt=""
                    aria-hidden
                    className="pointer-events-none absolute -right-21 -bottom-20 size-[300px] object-contain opacity-[0.08] lg:-right-30 lg:-bottom-22 lg:size-[480px] lg:opacity-[0.07]"
                />
                {/* A little tooth, so the flat crimson does not read as plastic. */}
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-[0.34] mix-blend-overlay"
                    style={{ backgroundImage: 'url(/images/noise.png)', backgroundSize: '128px 128px' }}
                />

                <div className="relative hidden text-[11px] font-semibold tracking-[0.16em] text-white/50 uppercase lg:block">
                    Student &amp; Faculty Portal
                </div>

                <div className="relative flex flex-col items-center gap-4 text-center lg:items-start lg:gap-5 lg:py-10 lg:text-left">
                    <img
                        src="/images/dcsa-logo.png"
                        alt={`${school.short_name} seal`}
                        className="size-[76px] object-contain drop-shadow-[0_4px_14px_rgba(0,0,0,0.35)] lg:size-22"
                    />
                    <div className="flex flex-col gap-1.5">
                        <h1 className="text-[17px] leading-tight font-bold tracking-tight text-white uppercase lg:max-w-[420px] lg:text-[26px] lg:leading-[1.18]">
                            {school.name}
                        </h1>
                        <p className="text-xs text-white/70 lg:text-sm">{school.system_name}</p>
                    </div>
                    <div aria-hidden className="hidden h-px w-14 bg-white/25 lg:block" />
                    <p className="hidden max-w-[400px] text-sm leading-[1.68] text-white/60 lg:block">
                        Written work, performance tasks and quarterly assessment &mdash; weighted, totalled and transmuted the way DepEd Order No. 8,
                        s. 2015 prescribes.
                    </p>
                </div>

                <div className="relative hidden items-center justify-between gap-4 lg:flex">
                    <div className="text-[11px] font-semibold tracking-[0.14em] text-white/45 uppercase">Est. 2010</div>
                    <div className="text-[11px] text-white/45">
                        &copy; {new Date().getFullYear()} {school.name}
                    </div>
                </div>
            </aside>

            <div className="bg-card relative z-10 -mt-[22px] flex flex-1 flex-col rounded-t-[22px] px-6 pt-8 pb-9 lg:mt-0 lg:items-center lg:justify-center lg:rounded-none lg:px-14 lg:py-12">
                <div className="flex w-full flex-col gap-6 lg:max-w-[400px] lg:gap-7">
                    <div className="flex flex-col gap-1.5">
                        <h2 className="text-[21px] font-bold tracking-tight lg:text-2xl">{title}</h2>
                        {description && <p className="text-muted-foreground text-[13px] leading-relaxed lg:text-sm">{description}</p>}
                    </div>

                    {children}

                    {footer && <div className="text-muted-foreground text-center text-xs leading-relaxed lg:text-[13px]">{footer}</div>}
                </div>

                {!auth.user && (
                    <Link
                        href={route('home')}
                        className="text-muted-foreground hover:text-foreground mt-auto inline-flex items-center gap-1.5 self-center pt-8 text-sm transition-colors lg:absolute lg:top-10 lg:right-14 lg:mt-0 lg:pt-0"
                    >
                        <ArrowLeft className="size-4" /> Back to home
                    </Link>
                )}
            </div>
        </div>
    );
}
