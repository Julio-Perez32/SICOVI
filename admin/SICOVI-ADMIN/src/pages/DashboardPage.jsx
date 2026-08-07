import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import {
  Wallet,
  TrendingUp,
  ShoppingBag,
  CalendarDays,
  PackageX,
  BellRing,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import StatCard from '../components/StatCard'
import Badge from '../components/Badge'
import ChartTooltip from '../components/ChartTooltip'
import PageHeader from '../components/PageHeader'
import { formatCurrency, formatDateTime } from '../lib/format'
import {
  summary,
  salesTimeseries,
  topProducts,
  marginByCategory,
  salesByEmployee,
  recentActivity,
} from '../mock/dashboard'

const dowFormatter = new Intl.DateTimeFormat('es-SV', { weekday: 'short' })

function SectionCard({ title, description, children, className = '' }) {
  return (
    <div className={`rounded-2xl bg-card p-5 ring-1 ring-hairline ${className}`}>
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        {description && <p className="text-xs text-ink-muted">{description}</p>}
      </div>
      {children}
    </div>
  )
}

export default function DashboardPage() {
  const timeseriesData = salesTimeseries.map((d) => ({
    ...d,
    dia: dowFormatter.format(new Date(`${d.fecha}T00:00:00`)),
  }))

  const topProductsData = [...topProducts]
    .sort((a, b) => b.unidadesVendidas - a.unidadesVendidas)
    .slice(0, 5)
    .reverse() // recharts vertical bar dibuja de abajo hacia arriba

  const maxVendedor = Math.max(...salesByEmployee.map((v) => v.totalVendido))

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Resumen general del inventario y las ventas del taller"
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          icon={Wallet}
          label="Valor de inventario (costo)"
          value={formatCurrency(summary.valorInventarioCosto)}
          hint={`${summary.totalProductos} productos · ${summary.unidadesEnStock} unidades`}
        />
        <StatCard
          icon={TrendingUp}
          label="Ganancia potencial"
          value={formatCurrency(summary.gananciaPotencialInventario)}
          hint={`Si se vende todo a ${formatCurrency(summary.valorInventarioVenta)}`}
          tone="good"
        />
        <StatCard
          icon={ShoppingBag}
          label="Ventas de hoy"
          value={formatCurrency(summary.ventasHoy.total)}
          hint={`${summary.ventasHoy.cantidad} ventas · ganancia ${formatCurrency(summary.ventasHoy.ganancia)}`}
        />
        <StatCard
          icon={CalendarDays}
          label="Ventas del mes"
          value={formatCurrency(summary.ventasMes.total)}
          hint={`${summary.ventasMes.cantidad} ventas · ganancia ${formatCurrency(summary.ventasMes.ganancia)}`}
        />
        <StatCard
          icon={PackageX}
          label="Stock bajo / sin stock"
          value={`${summary.productosStockBajo} / ${summary.productosSinStock}`}
          hint="Productos que necesitan reabastecerse"
          tone="warning"
        />
        <StatCard
          icon={BellRing}
          label="Alertas sin leer"
          value={summary.alertasSinLeer}
          hint="Ver detalle en Alertas"
          tone="critical"
        />
      </div>

      {/* Ventas por día + Top productos */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-5">
        <SectionCard
          title="Ventas de los últimos 7 días"
          description="Total vendido por día"
          className="xl:col-span-3"
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeseriesData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--hairline)" strokeDasharray="0" />
                <XAxis
                  dataKey="dia"
                  tickLine={false}
                  axisLine={{ stroke: 'var(--line)' }}
                  tick={{ fill: 'var(--ink-muted)', fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={44}
                  tick={{ fill: 'var(--ink-muted)', fontSize: 12 }}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  content={<ChartTooltip formatter={(v) => formatCurrency(v)} />}
                  cursor={{ stroke: 'var(--line)', strokeWidth: 1 }}
                />
                <Area
                  type="monotone"
                  dataKey="totalVentas"
                  name="Ventas"
                  stroke="var(--series-1)"
                  strokeWidth={2}
                  fill="var(--series-1)"
                  fillOpacity={0.1}
                  dot={{ r: 4, fill: 'var(--series-1)', stroke: 'var(--card)', strokeWidth: 2 }}
                  activeDot={{ r: 5, fill: 'var(--series-1)', stroke: 'var(--card)', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard
          title="Top productos"
          description="Por unidades vendidas"
          className="xl:col-span-2"
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topProductsData}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                barCategoryGap={10}
              >
                <CartesianGrid horizontal={false} stroke="var(--hairline)" />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="codigo"
                  tickLine={false}
                  axisLine={false}
                  width={70}
                  tick={{ fill: 'var(--ink-soft)', fontSize: 12 }}
                />
                <Tooltip
                  content={
                    <ChartTooltip
                      formatter={(v, entry) => `${v} u. · ${formatCurrency(entry.payload.totalVendido)}`}
                    />
                  }
                  cursor={{ fill: 'var(--ink)', fillOpacity: 0.04 }}
                />
                <Bar
                  dataKey="unidadesVendidas"
                  name="Unidades"
                  fill="var(--series-1)"
                  radius={[4, 4, 4, 4]}
                  barSize={18}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      {/* Margen por categoría + ranking vendedores */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-5">
        <SectionCard
          title="Costo vs. venta por categoría"
          description="Valor de inventario a precio de costo y de venta"
          className="xl:col-span-3"
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={marginByCategory} margin={{ top: 8, right: 8, left: 8, bottom: 0 }} barGap={2}>
                <CartesianGrid vertical={false} stroke="var(--hairline)" />
                <XAxis
                  dataKey="categoria"
                  tickLine={false}
                  axisLine={{ stroke: 'var(--line)' }}
                  tick={{ fill: 'var(--ink-muted)', fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={44}
                  tick={{ fill: 'var(--ink-muted)', fontSize: 12 }}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip content={<ChartTooltip formatter={(v) => formatCurrency(v)} />} cursor={{ fill: 'var(--ink)', fillOpacity: 0.04 }} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  height={28}
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12, color: 'var(--ink-soft)' }}
                />
                <Bar dataKey="valorCosto" name="Costo" fill="var(--series-1)" radius={[4, 4, 0, 0]} maxBarSize={22} />
                <Bar dataKey="valorVenta" name="Venta" fill="var(--series-2)" radius={[4, 4, 0, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard
          title="Ventas por empleado"
          description="Total vendido (no anuladas)"
          className="xl:col-span-2"
        >
          <div className="flex flex-col gap-4 py-1">
            {salesByEmployee.map((v) => (
              <div key={v.vendedor}>
                <div className="mb-1.5 flex items-baseline justify-between text-sm">
                  <span className="font-medium text-ink">{v.vendedor}</span>
                  <span className="text-ink-soft">{formatCurrency(v.totalVendido)}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--series-1)_15%,transparent)]">
                  <div
                    className="h-full rounded-full bg-series-1"
                    style={{ width: `${Math.max(6, (v.totalVendido / maxVendedor) * 100)}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-ink-muted">{v.cantidadVentas} ventas</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Actividad reciente */}
      <div className="mt-4">
        <SectionCard title="Actividad reciente" description="Últimos movimientos de inventario (kardex)">
          <ul className="divide-y divide-hairline">
            {recentActivity.map((m) => {
              const esEntrada = m.tipo === 'entrada'
              return (
                <li key={m._id} className="flex items-center gap-3 py-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink/5 text-ink-soft">
                    {esEntrada ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-ink">
                      <span className="font-medium">{m.producto.nombre}</span>{' '}
                      <span className="text-ink-muted">({m.producto.codigo})</span>
                    </p>
                    <p className="text-xs text-ink-muted">
                      {m.motivo} · {m.usuario.nombre} · {formatDateTime(m.createdAt)}
                    </p>
                  </div>
                  <Badge tone={esEntrada ? 'good' : 'neutral'}>
                    {esEntrada ? '+' : ''}
                    {m.cantidad} · stock {m.stockResultante}
                  </Badge>
                </li>
              )
            })}
          </ul>
        </SectionCard>
      </div>
    </div>
  )
}
