import { descriptorFor } from '@/components/grade-badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type WeightPreset } from '@/types';
import { ChevronRight } from 'lucide-react';

/**
 * One learner's written work followed from the teacher's keyboard to the mark on
 * the report card. The figures are a single consistent example: 38/40 is 95.00%,
 * a quarter of which is 23.75; with 46.00 from performance tasks and 21.65 from
 * the quarterly assessment that is an initial grade of 91.40, which Appendix B
 * transmutes to 94.
 */
const steps = [
    { label: 'Raw score', formula: 'What the teacher types in', value: '38 / 40' },
    { label: 'Percentage score', formula: 'raw ÷ highest possible × 100', value: '95.00' },
    { label: 'Weighted score', formula: '95.00 × 25% written work', value: '23.75' },
    { label: 'Initial grade', formula: '23.75 + 46.00 + 21.65', value: '91.40' },
    { label: 'Transmuted grade', formula: 'Appendix B, 60–100 scale', value: '94' },
];

export function GradingPipeline({ weights }: { weights: WeightPreset[] }) {
    return (
        <>
            <div className="flex flex-col items-stretch gap-2 lg:flex-row lg:gap-3">
                {steps.map((step, index) => {
                    const final = index === steps.length - 1;

                    return (
                        <div key={step.label} className="contents">
                            {index > 0 && (
                                <div className="text-border flex justify-center lg:items-center">
                                    <ChevronRight className="size-4 rotate-90 lg:rotate-0" />
                                </div>
                            )}
                            <div
                                className={
                                    final
                                        ? 'border-primary/25 bg-accent flex items-center justify-between gap-4 rounded-lg border p-4 lg:flex-1 lg:flex-col lg:items-start lg:gap-1.5 lg:px-[18px] lg:pt-[18px] lg:pb-4'
                                        : 'border-border flex items-center justify-between gap-4 rounded-lg border p-4 lg:flex-1 lg:flex-col lg:items-start lg:gap-1.5 lg:px-[18px] lg:pt-[18px] lg:pb-4'
                                }
                            >
                                <div className="flex min-w-0 flex-col gap-0.5 lg:contents">
                                    <div
                                        className={`text-[10px] font-semibold tracking-[0.06em] uppercase lg:text-[11px] ${final ? 'text-accent-foreground' : 'text-muted-foreground'}`}
                                    >
                                        Step {index + 1}
                                    </div>
                                    <div
                                        className={`text-sm font-semibold tracking-tight lg:text-[15px] ${final ? 'text-[hsl(0,68%,26%)] dark:text-[hsl(0,60%,82%)]' : ''}`}
                                    >
                                        {step.label}
                                    </div>
                                    <div className={`text-xs leading-snug ${final ? 'text-accent-foreground' : 'text-muted-foreground'} lg:min-h-8`}>
                                        {step.formula}
                                    </div>
                                </div>
                                {final ? (
                                    <div className="flex shrink-0 items-baseline gap-2 lg:mt-1.5">
                                        <div className="tabular text-xl font-bold tracking-tight text-[hsl(0,68%,26%)] lg:text-[22px] dark:text-[hsl(0,60%,82%)]">
                                            {step.value}
                                        </div>
                                        <div className="text-xs font-semibold text-[hsl(145,56%,24%)] dark:text-[hsl(145,45%,60%)]">
                                            {descriptorFor(Number(step.value))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="tabular shrink-0 text-xl font-bold tracking-tight lg:mt-1.5 lg:text-[22px]">{step.value}</div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="border-border mt-7 overflow-hidden rounded-lg border lg:mt-10">
                <div className="border-border border-b px-4 py-3.5 lg:px-5">
                    <div className="text-sm font-semibold tracking-tight lg:text-[15px]">The weights behind step 3</div>
                    <p className="text-muted-foreground mt-0.5 text-[13px] leading-relaxed">
                        Set by the subject type and the section&rsquo;s track. A subject may override them, as long as the three total 100%.
                    </p>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted hover:bg-muted">
                            <TableHead className="px-4 lg:px-5">Applies to</TableHead>
                            {/* The class record calls these WW / PT / QA; spell them out where there is room. */}
                            <TableHead className="w-16 text-center lg:w-48">
                                <span className="lg:hidden">WW</span>
                                <span className="hidden lg:inline">Written work</span>
                            </TableHead>
                            <TableHead className="w-16 text-center lg:w-52">
                                <span className="lg:hidden">PT</span>
                                <span className="hidden lg:inline">Performance tasks</span>
                            </TableHead>
                            <TableHead className="w-16 text-center lg:w-56">
                                <span className="lg:hidden">QA</span>
                                <span className="hidden lg:inline">Quarterly assessment</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {weights.map((preset) => (
                            <TableRow key={preset.label}>
                                <TableCell className="px-4 text-[13px] lg:px-5 lg:py-3 lg:text-sm">{preset.label}</TableCell>
                                <TableCell className="tabular text-center text-[13px] font-semibold lg:py-3 lg:text-sm">{preset.ww}%</TableCell>
                                <TableCell className="tabular text-center text-[13px] font-semibold lg:py-3 lg:text-sm">{preset.pt}%</TableCell>
                                <TableCell className="tabular text-center text-[13px] font-semibold lg:py-3 lg:text-sm">{preset.qa}%</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}
