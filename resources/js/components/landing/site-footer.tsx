import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function SiteFooter() {
    const { school } = usePage<SharedData>().props;

    /*
     * The registrar fills these in under Settings -> School profile. Until they
     * do, the placeholder says so rather than inventing an address.
     */
    const address = school.address ?? '[SCHOOL ADDRESS]';
    const contact = [school.contact_number ?? '[CONTACT NUMBER]', school.email ?? '[SCHOOL EMAIL]'].join(' · ');

    return (
        <footer className="bg-card border-border border-t">
            <div className="mx-auto max-w-7xl px-5 py-9 lg:px-8 lg:py-11">
                <div className="flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
                    <div className="flex max-w-md items-start gap-3">
                        <img src="/images/dcsa-logo.png" alt={`${school.short_name} seal`} className="size-10 shrink-0 object-contain lg:size-11" />
                        <div className="grid gap-1.5">
                            <div className="text-primary text-xs leading-snug font-bold tracking-tight uppercase lg:text-[13px]">{school.name}</div>
                            <div className="text-muted-foreground text-[13px] leading-relaxed">
                                {address}
                                <br />
                                {contact}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-12 lg:gap-16">
                        <div className="flex flex-col gap-2.5">
                            <div className="text-muted-foreground text-[10px] font-semibold tracking-[0.06em] uppercase lg:text-[11px]">Portal</div>
                            <Link href={route('login')} className="hover:text-primary text-sm transition-colors">
                                Sign in
                            </Link>
                            <Link href={route('password.request')} className="hover:text-primary text-sm transition-colors">
                                Forgot password
                            </Link>
                        </div>
                        <div className="flex flex-col gap-2.5">
                            <div className="text-muted-foreground text-[10px] font-semibold tracking-[0.06em] uppercase lg:text-[11px]">
                                Reference
                            </div>
                            <a href="#grading" className="hover:text-primary text-sm transition-colors">
                                How grading works
                            </a>
                            <span className="text-muted-foreground text-sm">DepEd Order No. 8, s. 2015</span>
                        </div>
                    </div>
                </div>

                <div className="border-border text-muted-foreground mt-8 flex flex-col gap-1 border-t pt-5 text-xs lg:mt-9 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        &copy; {new Date().getFullYear()} {school.name}. All rights reserved.
                    </div>
                    <div>{school.system_name} · Est. 2010</div>
                </div>
            </div>
        </footer>
    );
}
