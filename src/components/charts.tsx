import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { EmployeeUsagePoint, ModuleUsagePoint, UsagePoint } from '../types'

const axisStyle = {
  fontSize: 12,
  fill: 'var(--text-muted)',
}

const tooltipStyle = {
  backgroundColor: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  boxShadow: 'var(--shadow-md)',
}

export function UsageTrendChart({ data }: { data: UsagePoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 12, right: 12, left: -20, bottom: 0 }}>
        <CartesianGrid stroke="var(--border)" vertical={false} />
        <XAxis dataKey="label" tick={axisStyle} tickLine={false} axisLine={false} />
        <YAxis tick={axisStyle} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ color: 'var(--text-soft)' }} />
        <Line type="monotone" dataKey="checks" stroke="var(--accent)" strokeWidth={2.4} dot={false} name="Checks" />
        <Line type="monotone" dataKey="risky" stroke="#f59e0b" strokeWidth={2} dot={false} name="Risky" />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function ModuleUsageChart({ data }: { data: ModuleUsagePoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 12, left: 12, bottom: 0 }}>
        <CartesianGrid stroke="var(--border)" horizontal={false} />
        <XAxis type="number" tick={axisStyle} tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey="name" tick={axisStyle} tickLine={false} axisLine={false} width={126} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="usage" fill="var(--accent)" radius={[0, 8, 8, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function EmployeeUsageChart({ data }: { data: EmployeeUsagePoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
        <CartesianGrid stroke="var(--border)" vertical={false} />
        <XAxis dataKey="name" tick={axisStyle} tickLine={false} axisLine={false} />
        <YAxis tick={axisStyle} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="checks" fill="#8bb4ff" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function RiskSplitChart({ risky, safe }: { risky: number; safe: number }) {
  const data = [
    { name: 'Safe', value: safe, color: 'var(--accent)' },
    { name: 'Risky', value: risky, color: '#f59e0b' },
  ]

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ color: 'var(--text-soft)' }} />
        <Pie data={data} dataKey="value" innerRadius={54} outerRadius={84} paddingAngle={2} stroke="none">
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  )
}
