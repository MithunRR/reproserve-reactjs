import React from 'react';
import {
  ResponsiveContainer,
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieChartIcon } from 'lucide-react';

// Brand palette (matches --sky-blue / --coral-orange + the blue family used
// across the dashboard). Kept here so the charts read as "on brand".
const BRAND = {
  sky:       '#0089e1',
  lightBlue: '#33a1e8',
  darkBlue:  '#006eb5',
  gold:      '#ffd200', // --coral-orange in this theme
  slate:     '#7aa7c7'
};

const AXIS_TICK = { fill: 'rgba(255,255,255,0.75)', fontSize: 11 };
const GRID_STROKE = 'rgba(255,255,255,0.12)';

// Dark, glassy tooltip so it reads on the blue background.
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div
      style={{
        background: 'rgba(0, 22, 36, 0.92)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: 10,
        padding: '8px 12px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.35)'
      }}>
      {label != null &&
        <div style={{ color: '#fff', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{label}</div>
      }
      {payload.map((p) => (
        <div key={p.dataKey || p.name} style={{ color: '#fff', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 9, height: 9, borderRadius: 2, background: p.color || p.fill, display: 'inline-block' }} />
          <span style={{ opacity: 0.85 }}>{p.name}:</span>
          <span style={{ fontWeight: 600 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

function ChartCard({ title, icon: Icon, children, className = '' }) {
  return (
    <div className={`rounded-2xl p-4 sm:p-5 ${className}`} style={panelStyle}>
      <h3 className="text-sm sm:text-base text-white drop-shadow-lg mb-3 flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 sm:h-5 sm:w-5" />} {title}
      </h3>
      {children}
    </div>
  );
}

const panelStyle = {
  background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.2)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
};

// Renders the Platform Analytics charts. Pure presentational — all data,
// loading and error handling is owned by AdminDashboard.
export default function GrowthCharts({ series, loading, error, roleData }) {
  const hasSeries = Array.isArray(series) && series.length > 0;
  const hasRoles = Array.isArray(roleData) && roleData.some((d) => d.value > 0);

  // If the growth endpoint is unavailable we still show the role donut (it
  // comes from /api/admin/stats, which already loaded), plus a small notice.
  const growthUnavailable = !loading && (error || !hasSeries);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      {/* User growth — area chart */}
      <ChartCard title="User Growth (6 months)" icon={TrendingUp}>
        {loading &&
          <p className="text-white/80 text-sm py-8 text-center">Loading analytics…</p>
        }
        {growthUnavailable &&
          <p className="text-white/70 text-sm py-8 text-center">Analytics unavailable.</p>
        }
        {!loading && hasSeries &&
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={series} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={BRAND.sky} stopOpacity={0.55} />
                  <stop offset="100%" stopColor={BRAND.sky} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
              <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={{ stroke: GRID_STROKE }} />
              <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} allowDecimals={false} width={36} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.25)' }} />
              <Area
                type="monotone" dataKey="users" name="Users"
                stroke={BRAND.sky} strokeWidth={2.5}
                fill="url(#userGrad)" activeDot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        }
      </ChartCard>

      {/* Activity — grouped bars: quotes / listings / open houses */}
      <ChartCard title="Platform Activity (6 months)" icon={BarChart3}>
        {loading &&
          <p className="text-white/80 text-sm py-8 text-center">Loading analytics…</p>
        }
        {growthUnavailable &&
          <p className="text-white/70 text-sm py-8 text-center">Analytics unavailable.</p>
        }
        {!loading && hasSeries &&
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={series} margin={{ top: 6, right: 8, left: -18, bottom: 0 }} barGap={2} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
              <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={{ stroke: GRID_STROKE }} />
              <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} allowDecimals={false} width={36} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.06)' }} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#fff' }} iconType="circle" iconSize={8} />
              <Bar dataKey="quotes"     name="Quotes"      fill={BRAND.sky}       radius={[3, 3, 0, 0]} />
              <Bar dataKey="listings"   name="Listings"    fill={BRAND.lightBlue} radius={[3, 3, 0, 0]} />
              <Bar dataKey="openHouses" name="Open Houses" fill={BRAND.gold}      radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        }
      </ChartCard>

      {/* Role distribution — donut from current counts (always available) */}
      {hasRoles &&
        <ChartCard title="Roles at a Glance" icon={PieChartIcon} className="lg:col-span-2">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={roleData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={78}
                  paddingAngle={2}
                  stroke="rgba(0,22,36,0.4)">
                  {roleData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#fff' }} iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      }
    </div>
  );
}
