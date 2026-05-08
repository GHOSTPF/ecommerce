import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { DollarSign, ShoppingBag, Package, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface Props {
    stats: {
        total_revenue: number; total_orders: number; total_products: number;
        total_customers: number; pending_orders: number; low_stock: number;
    };
    revenueByMonth: { month: string; revenue: number; orders: number }[];
    topProducts: any[];
    recentOrders: any[];
}

export default function AdminDashboard({ stats, revenueByMonth, topProducts, recentOrders }: Props) {
    const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

    const statCards = [
        { title: 'Receita Total', value: fmt(stats.total_revenue), icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950' },
        { title: 'Total de Pedidos', value: stats.total_orders.toString(), icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950' },
        { title: 'Produtos', value: stats.total_products.toString(), icon: Package, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950' },
        { title: 'Clientes', value: stats.total_customers.toString(), icon: Users, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950' },
    ];

    return (
        <AdminLayout title="Dashboard">
            {/* Alert */}
            {(stats.pending_orders > 0 || stats.low_stock > 0) && (
                <div className="flex gap-3 mb-6 flex-wrap">
                    {stats.pending_orders > 0 && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 rounded-lg text-sm text-yellow-800 dark:text-yellow-200">
                            <AlertTriangle className="h-4 w-4" />
                            {stats.pending_orders} pedido(s) aguardando confirmação
                        </div>
                    )}
                    {stats.low_stock > 0 && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-950 border border-red-200 rounded-lg text-sm text-red-800 dark:text-red-200">
                            <AlertTriangle className="h-4 w-4" />
                            {stats.low_stock} produto(s) com estoque baixo
                        </div>
                    )}
                </div>
            )}

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statCards.map(({ title, value, icon: Icon, color, bg }) => (
                    <Card key={title}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">{title}</p>
                                    <p className="text-2xl font-bold mt-1">{value}</p>
                                </div>
                                <div className={`p-3 rounded-full ${bg}`}>
                                    <Icon className={`h-6 w-6 ${color}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Receita por Mês</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={revenueByMonth}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                                <XAxis dataKey="month" className="text-xs" />
                                <YAxis
                                    className="text-xs"
                                    tickFormatter={v => `R$${(v/1000).toFixed(0)}k`}
                                />
                                <Tooltip
                                    formatter={(v) => fmt(Number(v ?? 0))}
                                    labelClassName="font-medium"
                                />
                                <Line
                                    type="monotone" dataKey="revenue"
                                    stroke="hsl(var(--primary))" strokeWidth={2}
                                    dot={{ r: 4 }} activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Top Products */}
                <Card>
                    <CardHeader>
                        <CardTitle>Mais Vendidos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {topProducts.map((product, i) => (
                                <div key={product.id} className="flex items-center gap-3">
                                    <span className="text-muted-foreground text-sm w-5 font-medium">{i + 1}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{product.name}</p>
                                        <p className="text-xs text-muted-foreground">{product.order_items_count} vendas</p>
                                    </div>
                                    <span className="text-sm font-bold text-primary">
                                        {fmt(product.order_items_sum_subtotal ?? 0)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Orders */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Pedidos Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="pb-3 font-medium">Pedido</th>
                                    <th className="pb-3 font-medium">Cliente</th>
                                    <th className="pb-3 font-medium">Status</th>
                                    <th className="pb-3 font-medium">Total</th>
                                    <th className="pb-3 font-medium">Data</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {recentOrders.map(order => (
                                    <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="py-3 font-mono text-xs font-medium">{order.order_number}</td>
                                        <td className="py-3">{order.user?.name ?? 'N/A'}</td>
                                        <td className="py-3">
                                            <Badge variant="outline" className="text-xs">
                                                {order.status_badge?.label}
                                            </Badge>
                                        </td>
                                        <td className="py-3 font-bold">{fmt(order.total)}</td>
                                        <td className="py-3 text-muted-foreground">
                                            {new Date(order.created_at).toLocaleDateString('pt-BR')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </AdminLayout>
    );
}