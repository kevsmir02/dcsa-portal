import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type Point = { month: string; total: number };

/** Cumulative enrolment across the term. */
export function EnrollmentTrend({ data }: { data: Point[] }) {
    if (data.length === 0) {
        return <div className="text-muted-foreground flex h-56 items-center justify-center text-sm">No enrolment data yet.</div>;
    }

    return (
        <ResponsiveContainer width="100%" height={224}>
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <defs>
                    <linearGradient id="enrolment-fill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.28} />
                        <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
                    </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                <YAxis tickLine={false} axisLine={false} width={44} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} allowDecimals={false} />
                <Tooltip
                    cursor={{ stroke: 'var(--border)' }}
                    contentStyle={{
                        background: 'var(--popover)',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        fontSize: 12,
                        color: 'var(--popover-foreground)',
                    }}
                    formatter={(value) => [`${value} learners`, 'Enrolled']}
                />
                <Area type="monotone" dataKey="total" stroke="var(--chart-1)" strokeWidth={2} fill="url(#enrolment-fill)" />
            </AreaChart>
        </ResponsiveContainer>
    );
}
