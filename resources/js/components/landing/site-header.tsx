import { Button } from '@/components/ui/button';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { LogIn, Menu, X } from 'lucide-react';
import { useState } from 'react';

const sections = [
    { href: '#roles', label: 'Who it is for' },
    { href: '#grading', label: 'How grading works' },
    { href: '#forms', label: 'Forms' },
];

export function SiteHeader() {
    const { school } = usePage<SharedData>().props;
    const [open, setOpen] = useState(false);

    return (
        <header className="bg-card border-border sticky top-0 z-50 border-b">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 lg:h-18 lg:px-8">
                <Link href={route('home')} className="flex min-w-0 items-center gap-2.5">
                    <img src="/images/dcsa-logo.png" alt={`${school.short_name} seal`} className="size-9 shrink-0 object-contain lg:size-10" />
                    <div className="grid leading-tight">
                        <span className="text-primary text-[11px] font-bold tracking-tight uppercase lg:text-[13px]">{school.name}</span>
                        <span className="text-muted-foreground mt-0.5 text-[9px] lg:text-[11px]">{school.system_name}</span>
                    </div>
                </Link>

                <div className="hidden items-center gap-7 lg:flex">
                    <nav className="flex items-center gap-6">
                        {sections.map((section) => (
                            <a
                                key={section.href}
                                href={section.href}
                                className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
                            >
                                {section.label}
                            </a>
                        ))}
                    </nav>
                    <Button asChild>
                        <Link href={route('login')}>
                            <LogIn className="size-4" /> Sign in
                        </Link>
                    </Button>
                </div>

                <button
                    type="button"
                    onClick={() => setOpen((shown) => !shown)}
                    aria-expanded={open}
                    aria-label={open ? 'Close menu' : 'Open menu'}
                    className="text-foreground -mr-2 flex size-11 shrink-0 items-center justify-center lg:hidden"
                >
                    {open ? <X className="size-[22px]" /> : <Menu className="size-[22px]" />}
                </button>
            </div>

            {open && (
                <div className="border-border bg-card border-t px-5 pt-2 pb-4 lg:hidden">
                    <nav className="flex flex-col">
                        {sections.map((section) => (
                            <a
                                key={section.href}
                                href={section.href}
                                onClick={() => setOpen(false)}
                                className="text-foreground flex min-h-11 items-center text-sm font-medium"
                            >
                                {section.label}
                            </a>
                        ))}
                    </nav>
                    <Button asChild className="mt-2 h-12 w-full">
                        <Link href={route('login')}>
                            <LogIn className="size-4" /> Sign in
                        </Link>
                    </Button>
                </div>
            )}
        </header>
    );
}
