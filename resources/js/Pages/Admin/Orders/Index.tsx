import AdminLayout from '@/Layouts/AdminLayout';
import { Link, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Card } from '@/Components/ui/card';
import { Search, Eye } from 'lucide-react';
import { useState } from 'react';

interface Order {
    id: number;
    order_number: string;
    status: string;
    payment_status: string;
    total: number;
    created_at: string;
    user?: { name: string; email: string };
    status_badge: { label: string; color: string };
}

interface Props {
    orders: {
        data: Order[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
        last_page: number;
    };
}

// ✅ Mapa de status manual como fallback
const STATUS_LABELS: Record<string, string> = {
    pending: 'Aguardando',
    confirmed: 'Confirmado',
    processing: 'Processando',
    shipped: 'Enviado',
    delivered: 'Entregue',
    cancelled: 'Cancelado',
    refunded: 'Reembolsado',
};

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    pending: 'outline',
    confirmed: 'default',
    processing: 'default',
    shipped: 'secondary',
    delivered: 'default',
    cancelled: 'destructive',
    refunded: 'secondary',
};

const STATUS_COLORS: Record<string, string> = {
    pending: 'text-yellow-600 border-yellow-400 bg-yellow-50',
    confirmed: 'text-blue-600 border-blue-400 bg-blue-50',
    processing: 'text-purple-600 border-purple-400 bg-purple-50',
    shipped: 'text-indigo-600 border-indigo-400 bg-indigo-50',
    delivered: 'text-green-600 border-green-400 bg-green-50',
    cancelled: 'text-red-600 border-red-400 bg-red-50',
    refunded: 'text-gray-600 border-gray-400 bg-gray-50',
};

const PAYMENT_LABELS: Record<string, string> = {
    paid: 'Pago',
    pending: 'Pendente',
    failed: 'Falhou',
    refunded: 'Reembolsado',
};

const PAYMENT_COLORS: Record<string, string> = {
    paid: 'text-green-600 border-green-400 bg-green-50',
    pending: 'text-yellow-600 border-yellow-400 bg-yellow-50',
    failed: 'text-red-600 border-red-400 bg-red-50',
    refunded: 'text-gray-600 border-gray-400 bg-gray-50',
};

export default function AdminOrdersIndex({ orders }: Props) {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');

    const fmt = (v: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

    const applyFilters = () => {
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (status) params.status = status;
        router.get('/admin/orders', params, { preserveState: true });
    };

    return (
        <AdminLayout title="Pedidos">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex gap-2 flex-1 flex-wrap">
                    <div className="relative flex-1 min-w-48">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por número ou cliente..."
                            className="pl-9"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && applyFilters()}
                        />
                    </div>
                    <Select value={status} onValueChange={(value) => setStatus(value ?? '')}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Todos os status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">Todos os status</SelectItem>
                            <SelectItem value="pending">Aguardando</SelectItem>
                            <SelectItem value="confirmed">Confirmado</SelectItem>
                            <SelectItem value="processing">Processando</SelectItem>
                            <SelectItem value="shipped">Enviado</SelectItem>
                            <SelectItem value="delivered">Entregue</SelectItem>
                            <SelectItem value="cancelled">Cancelado</SelectItem>
                            <SelectItem value="refunded">Reembolsado</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={applyFilters}>Filtrar</Button>
                </div>
            </div>

            {/* Resumo rápido */}
            <div className="flex gap-3 mb-6 flex-wrap">
                {Object.entries(STATUS_LABELS).map(([key, label]) => {
                    const count = orders.data.filter(o => o.status === key).length;
                    if (count === 0) return null;
                    return (
                        <button
                            key={key}
                            onClick={() => {
                                setStatus(key);
                                router.get('/admin/orders', { status: key }, { preserveState: true });
                            }}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all hover:scale-105 ${STATUS_COLORS[key]}`}
                        >
                            {label}: {count}
                        </button>
                    );
                })}
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b text-left text-muted-foreground bg-muted/50">
                                <th className="px-4 py-3 font-medium">Pedido</th>
                                <th className="px-4 py-3 font-medium">Cliente</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium">Pagamento</th>
                                <th className="px-4 py-3 font-medium">Total</th>
                                <th className="px-4 py-3 font-medium">Data</th>
                                <th className="px-4 py-3 font-medium text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {orders.data.map(order => (
                                <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <span className="font-mono font-bold text-xs">
                                            {order.order_number}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="font-medium">{order.user?.name ?? 'N/A'}</p>
                                        {order.user?.email && (
                                            <p className="text-xs text-muted-foreground">{order.user.email}</p>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {/* ✅ Usa status_badge do backend OU fallback local */}
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[order.status] ?? 'text-gray-600 border-gray-400 bg-gray-50'}`}>
                                            {order.status_badge?.label ?? STATUS_LABELS[order.status] ?? order.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${PAYMENT_COLORS[order.payment_status] ?? 'text-gray-600 border-gray-400 bg-gray-50'}`}>
                                            {PAYMENT_LABELS[order.payment_status] ?? order.payment_status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 font-bold">{fmt(order.total)}</td>
                                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                                        {new Date(order.created_at).toLocaleDateString('pt-BR', {
                                            day: '2-digit', month: '2-digit', year: 'numeric',
                                            hour: '2-digit', minute: '2-digit',
                                        })}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Button variant="ghost" size="sm" >
                                            <Link href={`/admin/orders/${order.id}`} className="gap-1 flex flex-items">
                                                <Eye className="h-3.5 w-3.5" /> Ver
                                            </Link>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {orders.data.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        Nenhum pedido encontrado.
                    </div>
                )}

                {orders.last_page > 1 && (
                    <div className="flex justify-center gap-2 p-4 border-t flex-wrap">
                        {orders.links.map((link, i) => (
                            <Button
                                key={i}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </Card>
        </AdminLayout>
    );
}