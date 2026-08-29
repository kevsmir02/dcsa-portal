import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

type Band = { label: string; count: number; percentage: number };

const BAND_COLORS = ['var(--chart-3)', 'var(--chart-2)', 'var(--chart-5)', 'var(--chart-4)', 'var(--chart-1)'];

/**
 * Learners grouped by DepEd descriptor band. The legend carries the labels so
 * the ring itself stays uncluttered.
 */
export function GradeDistribution({ data }: { data: Band[] }) {
    const total = data.reduce((sum, band) => sum + band.count, 0);

    if (total === 0) {
        return <div className="text-muted-foreground flex h-56 items-center justify-center text-sm">No grades computed yet.</div>;
    }

    return (
        <div className="flex flex-col items-center gap-3 sm:flex-row">
            <div className="relative h-44 w-44 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={data} dataKey="count" nameKey="label" innerRadius={52} outerRadius={78} paddingAngle={2} strokeWidth={0}>
                            {data.map((_, index) => (
                                <Cell key={index} fill={BAND_COLORS[index % BAND_COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                background: 'var(--popover)',
                                border: '1px solid var(--border)',
                                borderRadius: 8,
                                fontSize: 12,
                                color: 'var(--popover-foreground)',
                            }}
                            formatter={(value, name) => [`${value} grades`, name]}
                        />
                    </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <div className="tabular text-xl leading-none font-bold">{total}</div>
                    <div className="text-muted-foreground text-[10px] tracking-wide uppercase">grades</div>
                </div>
            </div>

            <ul className="w-full min-w-0 flex-1 space-y-1.5">
                {data.map((band, index) => (
                    <li key={band.label} className="flex items-center gap-2 text-xs">
                        <span
                            className="size-2.5 shrink-0 rounded-[3px]"
                            style={{ background: BAND_COLORS[index % BAND_COLORS.length] }}
                            aria-hidden
                        />
                        <span className="min-w-0 flex-1 truncate">{band.label}</span>
                        <span className="tabular text-muted-foreground shrink-0">{band.percentage}%</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
