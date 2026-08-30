import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowDown,
    BookOpen,
    Check,
    ClipboardList,
    FileText,
    GraduationCap,
    LayoutGrid,
    Lock,
    LogIn,
    Printer,
    ShieldCheck,
    Users,
    type LucideIcon,
} from 'lucide-react';

import { ClassRecordPreview } from '@/components/landing/class-record-preview';
import { GradingPipeline } from '@/components/landing/grading-pipeline';
import { SiteFooter } from '@/components/landing/site-footer';
import { SiteHeader } from '@/components/landing/site-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { type SharedData, type WeightPreset } from '@/types';

const tones = {
    crimson: 'bg-[hsl(0,68%,32%)]/10 text-[hsl(0,68%,32%)] dark:bg-[hsl(0,62%,52%)]/15 dark:text-[hsl(0,62%,62%)]',
    navy: 'bg-[hsl(240,43%,29%)]/10 text-[hsl(240,43%,29%)] dark:bg-[hsl(240,55%,66%)]/15 dark:text-[hsl(240,55%,72%)]',
    laurel: 'bg-[hsl(145,56%,27%)]/10 text-[hsl(145,56%,27%)] dark:bg-[hsl(145,45%,50%)]/15 dark:text-[hsl(145,45%,58%)]',
} as const;

type Tone = keyof typeof tones;

const checks = {
    crimson: 'text-[hsl(0,68%,32%)] dark:text-[hsl(0,62%,62%)]',
    navy: 'text-[hsl(240,43%,29%)] dark:text-[hsl(240,55%,72%)]',
    laurel: 'text-[hsl(145,56%,27%)] dark:text-[hsl(145,45%,58%)]',
} as const;

function Tile({ icon: Icon, tone, className }: { icon: LucideIcon; tone: Tone; className?: string }) {
    return (
        <div className={cn('flex size-11 shrink-0 items-center justify-center rounded-xl', tones[tone], className)}>
            <Icon className="size-5" />
        </div>
    );
}

function SectionHeading({ title, description, className }: { title: string; description: string; className?: string }) {
    return (
        <div className={cn('mb-7 grid gap-2 lg:mb-10', className)}>
            <h2 className="text-[25px] leading-tight font-bold tracking-tight lg:text-[34px]">{title}</h2>
            <p className="text-muted-foreground max-w-[640px] text-sm leading-relaxed lg:text-base">{description}</p>
        </div>
    );
}

const roles: { name: string; sub: string; tone: Tone; icon: LucideIcon; blurb: string; items: string[] }[] = [
    {
        name: 'Administrator',
        sub: 'The registrar’s side',
        tone: 'crimson',
        icon: Users,
        blurb: 'Keeps the registry straight and decides when a quarter is finished.',
        items: ['Learners, teachers, subjects and sections', 'Enrollment into sections and classes', 'Locking a quarter to freeze its grades'],
    },
    {
        name: 'Teacher',
        sub: 'Their own teaching load',
        tone: 'navy',
        icon: ClipboardList,
        blurb: 'Opens a class record, adds assessments and types raw scores. Nothing else.',
        items: [
            'Written work, performance tasks, quarterly assessment',
            'Percentages and weights recomputed as they type',
            'A quarter only earns a final grade once all three are in',
        ],
    },
    {
        name: 'Learner',
        sub: 'Their own grades only',
        tone: 'laurel',
        icon: GraduationCap,
        blurb: 'Sees where they stand the moment a quarter closes — no queue at the faculty room.',
        items: ['Every subject, quarter by quarter', 'The DepEd descriptor behind each mark', 'A printable report card of their own'],
    },
];

const proof: { tone: Tone; icon: LucideIcon; title: string; blurb: string }[] = [
    {
        tone: 'crimson',
        icon: ShieldCheck,
        title: 'One policy, no house rules',
        blurb: 'Weights, transmutation and descriptors are taken from DepEd Order No. 8, s. 2015.',
    },
    {
        tone: 'navy',
        icon: BookOpen,
        title: 'STEM · HUMSS · ABM · GAS',
        blurb: 'Component weights follow the track and subject type, and a subject can override them.',
    },
    {
        tone: 'laurel',
        icon: Printer,
        title: 'Forms print from the same records',
        blurb: 'Report card, class record and section master list — no re-typing into a spreadsheet.',
    },
];

const forms: { tone: Tone; icon: LucideIcon; title: string; blurb: string }[] = [
    {
        tone: 'crimson',
        icon: FileText,
        title: 'Report card',
        blurb: 'One learner, every subject and quarter, with the general average and its descriptor.',
    },
    {
        tone: 'navy',
        icon: LayoutGrid,
        title: 'Class record',
        blurb: 'One class and quarter, every assessment column, with the component totals worked out.',
    },
    {
        tone: 'laurel',
        icon: Users,
        title: 'Section master list',
        blurb: 'One section, every enrolled learner with their LRN, in the order the registrar needs it.',
    },
];

export default function Welcome({ defaultWeights }: { defaultWeights: WeightPreset[] }) {
    const { school } = usePage<SharedData>().props;

    return (
        <div className="bg-background flex min-h-svh flex-col">
            <Head title={school.system_name} />

            <SiteHeader />

            <main className="flex-1">
                {/* Hero */}
                <section
                    className="relative isolate overflow-hidden"
                    style={{ background: 'radial-gradient(920px 420px at 88% -12%, var(--accent) 0%, transparent 68%)' }}
                >
                    <img
                        src="/images/dcsa-crest-watermark.png"
                        alt=""
                        aria-hidden
                        className="pointer-events-none absolute top-1/2 -right-[150px] -z-10 hidden size-[580px] -translate-y-1/2 object-contain opacity-[0.05] invert lg:block dark:opacity-[0.04] dark:invert-0"
                    />

                    <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 pt-9 pb-10 lg:grid-cols-[1.02fr_1fr] lg:gap-16 lg:px-8 lg:pt-22 lg:pb-24">
                        <div className="flex flex-col items-start gap-4 lg:gap-5.5">
                            <div className="text-accent-foreground border-primary/20 bg-accent inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold lg:text-xs">
                                <ShieldCheck className="size-3.5" />
                                Built on DepEd Order No. 8, s. 2015
                            </div>

                            <h1 className="text-[34px] leading-[1.09] font-bold tracking-tight text-pretty lg:text-[56px] lg:leading-[1.04]">
                                Enter the scores.
                                <br className="hidden lg:inline" /> The portal does the DepEd math.
                            </h1>

                            <p className="text-muted-foreground max-w-[512px] text-[15px] leading-relaxed text-pretty lg:text-[17px]">
                                Teachers record raw scores in a class record. {school.name}’s Grade 12 portal carries every score through percentage,
                                weighted and initial grades to the transmuted mark on the 60–100 scale — then prints the forms the registrar has to
                                file.
                            </p>

                            <div className="flex w-full flex-col gap-2.5 lg:w-auto lg:flex-row lg:gap-3">
                                <Button asChild className="h-12 lg:h-11 lg:px-8">
                                    <Link href={route('login')}>
                                        <LogIn className="size-4" /> Sign in to the portal
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="h-12 lg:h-11">
                                    <a href="#grading">
                                        See how a grade is computed <ArrowDown className="size-4" />
                                    </a>
                                </Button>
                            </div>

                            <div className="text-muted-foreground flex items-start gap-1.5 text-xs lg:text-[13px]">
                                <Lock className="mt-px size-3.5 shrink-0" />
                                Accounts are issued by the registrar — there is no public sign-up.
                            </div>
                        </div>

                        <ClassRecordPreview />
                    </div>
                </section>

                {/* Proof */}
                <section className="bg-card border-border border-y">
                    <div className="mx-auto grid max-w-7xl gap-5 px-5 py-6 lg:grid-cols-3 lg:gap-10 lg:px-8 lg:py-7">
                        {proof.map((item) => (
                            <div key={item.title} className="flex items-start gap-3">
                                <Tile icon={item.icon} tone={item.tone} className="size-9 rounded-lg [&_svg]:size-[18px]" />
                                <div className="grid gap-0.5">
                                    <div className="text-sm font-semibold">{item.title}</div>
                                    <div className="text-muted-foreground text-[13px] leading-relaxed">{item.blurb}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Roles */}
                <section id="roles" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-13 lg:px-8 lg:py-24">
                    <SectionHeading
                        title="Three doors into one record"
                        description="Everyone signs in to the same portal and sees exactly the part of it their role owns. Nobody sees a grade that is not theirs to see."
                    />

                    <div className="grid gap-4 lg:grid-cols-3 lg:gap-5">
                        {roles.map((role) => (
                            <Card key={role.name} className="flex flex-col gap-4 p-5 lg:p-6">
                                <div className="flex items-center gap-3">
                                    <Tile icon={role.icon} tone={role.tone} />
                                    <div className="grid gap-px">
                                        <div className="font-semibold tracking-tight">{role.name}</div>
                                        <div className="text-muted-foreground text-xs">{role.sub}</div>
                                    </div>
                                </div>
                                <p className="text-muted-foreground text-sm leading-relaxed">{role.blurb}</p>
                                <ul className="flex flex-col gap-2.5">
                                    {role.items.map((item) => (
                                        <li key={item} className="flex items-start gap-2 text-[13px] leading-snug lg:text-sm">
                                            <Check className={cn('mt-0.5 size-4 shrink-0 stroke-[2.5]', checks[role.tone])} />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* How grading works */}
                <section id="grading" className="bg-card border-border scroll-mt-20 border-y">
                    <div className="mx-auto max-w-7xl px-5 py-13 lg:px-8 lg:py-24">
                        <SectionHeading
                            title="How a grade is computed"
                            description="The same five steps every teacher does by hand, run on every learner in the class each time a score changes. Following one learner in written work:"
                        />
                        <GradingPipeline weights={defaultWeights} />
                    </div>
                </section>

                {/* Printable forms */}
                <section id="forms" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-13 lg:px-8 lg:py-24">
                    <SectionHeading
                        title="The paperwork, already filled in"
                        description="Every printable form is generated from the records that are already in the portal, so what is filed matches what the teacher encoded."
                    />

                    <div className="grid gap-4 lg:grid-cols-3 lg:gap-5">
                        {forms.map((form) => (
                            <Card key={form.title} className="flex items-start gap-3.5 p-5 lg:flex-col lg:gap-3 lg:p-6">
                                <Tile icon={form.icon} tone={form.tone} />
                                <div className="grid gap-1">
                                    <div className="font-semibold tracking-tight">{form.title}</div>
                                    <p className="text-muted-foreground text-[13px] leading-relaxed lg:text-sm">{form.blurb}</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Sign-in band */}
                <section
                    className="relative isolate overflow-hidden"
                    style={{ background: 'linear-gradient(160deg, hsl(0,70%,25%) 0%, hsl(0,66%,17%) 100%)' }}
                >
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0"
                        style={{
                            background:
                                'radial-gradient(900px 460px at 12% 0%, hsl(0,62%,34%) 0%, transparent 62%),' +
                                'radial-gradient(700px 420px at 94% 100%, hsl(240,45%,26%) 0%, transparent 58%)',
                        }}
                    />
                    <img
                        src="/images/dcsa-crest-watermark.png"
                        alt=""
                        aria-hidden
                        className="pointer-events-none absolute top-1/2 -right-[70px] size-[260px] -translate-y-1/2 object-contain opacity-[0.09] lg:right-10 lg:size-[320px] lg:opacity-[0.10]"
                    />
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 opacity-[0.34] mix-blend-overlay"
                        style={{ backgroundImage: 'url(/images/noise.png)', backgroundSize: '128px 128px' }}
                    />

                    <div className="relative mx-auto flex max-w-7xl flex-col gap-4 px-5 py-11 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:px-8 lg:py-18">
                        <div className="grid max-w-[640px] gap-2.5">
                            <h2 className="text-2xl leading-tight font-bold tracking-tight text-white lg:text-[30px]">Already have an account?</h2>
                            <p className="text-sm leading-relaxed text-white/70 lg:text-[15px]">
                                Sign in with the email address the registrar issued you. If you have never signed in, or your password has been reset,
                                use the one-time password you were given and set your own on the way in.
                            </p>
                        </div>

                        <div className="flex shrink-0 flex-col gap-2.5 lg:items-end">
                            <Button asChild className="h-12 bg-white font-semibold text-[hsl(0,68%,26%)] hover:bg-white/90 lg:h-11 lg:px-8">
                                <Link href={route('login')}>
                                    <LogIn className="size-4" /> Sign in to the portal
                                </Link>
                            </Button>
                            <div className="text-xs whitespace-nowrap text-white/65">Registrar’s office · {school.email ?? '[REGISTRAR EMAIL]'}</div>
                        </div>
                    </div>
                </section>
            </main>

            <SiteFooter />
        </div>
    );
}
