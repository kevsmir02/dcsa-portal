import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export default function AppLogo() {
    const { school } = usePage<SharedData>().props;

    return (
        <>
            <img src="/images/dcsa-logo.png" alt={`${school.short_name} seal`} className="size-9 shrink-0 object-contain" />
            <div className="ml-1.5 grid flex-1 text-left leading-tight">
                <span className="text-primary line-clamp-2 text-[11px] leading-tight font-bold tracking-tight uppercase">{school.name}</span>
                <span className="text-muted-foreground mt-0.5 truncate text-[10px]">{school.system_name}</span>
            </div>
        </>
    );
}
