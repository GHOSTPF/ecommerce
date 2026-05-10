import AdminLayout from '@/Layouts/AdminLayout';
import { Link, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Separator } from '@/Components/ui/separator';
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from '@/Components/ui/select';
import {
    ChevronLeft, Package, MapPin, CreditCard,
    User, Truck, CheckCircle,
} from 'lucide-react';

interface OrderItem {
    id: number; product_name: string; product_sku?: string;
    price: number; quantity: number; subtotal: number;
    product?: { images: { image_path: string }[] };
}

interface Order {
    id: number; order_number: string; status: string;
    payment_status: string; payment_method?: string; payment_id?: string;
    subtotal: number; tax: number; shipping: number; discount: number; total: number;
    coupon_code?: string; tracking_code?: string; shipping_carrier?: string;
    shipping_name: string; shipping_phone?: string; shipping_zipcode: string;
    shipping_street: string; shipping_number: string; shipping_complement?: string;
    shipping_neighborhood: string; shipping_city: string; shipping_state: string;
    notes?: string; admin_notes?: string;
    created_at: string; paid_at?: string; shipped_at?: string; delivered_at?: string;
    items: OrderItem[];
    user?: { id: number; name: string; email: string };
    status_badge?: { label: string; color: string };
}

const STATUS_OPTIONS = [
    { value: 'pending', label: '⏳ Aguardando' },
    { value: 'confirmed', label: '✅ Confirmado' },
    { value: 'processing', label: '⚙️ Processando' },
    { value: 'shipped', label: '🚚 Enviado' },
    { value: 'delivered', label: '🎉 Entregue' },
    { value: 'cancelled', label: '❌ Cancelado' },
    { value: 'refunded', label: '↩️ Reembolsado' },
];

const STATUS_COLORS: Record<string, string> = {
    pending: 'text-yellow-600 border-yellow-400 bg-yellow-50 dark:bg-yellow-950',
    confirmed: 'text-blue-600 border-blue-400 bg-blue-50 dark:bg-blue-950',
    processing: 'text-purple-600 border-purple-400 bg-purple-50 dark:bg-purple-950',
    shipped: 'text-indigo-600 border-indigo-400 bg-indigo-50 dark:bg-indigo-950',
    delivered: 'text-green-600 border-green-400 bg-green-50 dark:bg-green-950',
    cancelled: 'text-red-600 border-red-400 bg-red-50 dark:bg-red-950',
    refunded: 'text-gray-600 border-gray-400 bg-gray-50 dark:bg-gray-950',
};

const STATUS_LABELS: Record<string, string> = {
    pending: 'Aguardando', confirmed: 'Confirmado', processing: 'Processando',
    shipped: 'Enviado', delivered: 'Entregue', cancelled: 'Cancelado', refunded: 'Reembolsado',
};

const TIMELINE = [
    { key: 'pending', label: 'Recebido', icon: '📋' },
    { key: 'confirmed', label: 'Confirmado', icon: '✅' },
    { key: 'processing', label: 'Processando', icon: '⚙️' },
    { key: 'shipped', label: 'Enviado', icon: '🚚' },
    { key: 'delivered', label: 'Entregue', icon: '🎉' },
];

export default function AdminOrderShow({ order }: { order: Order }) {
    const fmt = (v: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

    const { data, setData, patch, processing } = useForm({
        status: order.status,
        tracking_code: order.tracking_code ?? '',
        shipping_carrier: order.shipping_carrier ?? '',
        admin_notes: order.admin_notes ?? '',
    });

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/admin/orders/${order.id}/status`);
    };

    const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentIdx = statusOrder.indexOf(order.status);
    const isCancelled = ['cancelled', 'refunded'].includes(order.status);

    const statusLabel = order.status_badge?.label ?? STATUS_LABELS[order.status] ?? order.status;
    const statusColor = STATUS_COLORS[order.status] ?? '';

    return (
        <AdminLayout title={`Pedido ${order.order_number}`}>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6 flex-wrap">
                <Button variant="ghost" size="sm" >
                    <Link href="/admin/orders" className='flex flex-items'>
                        <ChevronLeft className="h-4 w-4 mr-1" /> Voltar
                    </Link>
                </Button>
                <Separator orientation="vertical" className="h-5" />
                <span className="font-mono font-bold text-sm">{order.order_number}</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColor}`}>
                    {statusLabel}
                </span>
                {order.payment_status === 'paid' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border text-green-600 border-green-400 bg-green-50">
                        <CheckCircle className="h-3 w-3" /> Pago
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">

                    {/* Timeline */}
                    {!isCancelled && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Progresso do Pedido</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center overflow-x-auto pb-2">
                                    {TIMELINE.map((step, i) => {
                                        const stepIdx = statusOrder.indexOf(step.key);
                                        const isDone = stepIdx <= currentIdx;
                                        const isActive = step.key === order.status;
                                        return (
                                            <div key={step.key} className="flex items-center">
                                                <div className="flex flex-col items-center gap-1.5 px-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all ${
                                                        isActive
                                                            ? 'bg-primary ring-4 ring-primary/20 scale-110'
                                                            : isDone
                                                                ? 'bg-green-100 dark:bg-green-900'
                                                                : 'bg-muted'
                                                    }`}>
                                                        {step.icon}
                                                    </div>
                                                    <span className={`text-xs text-center leading-tight w-16 ${
                                                        isActive ? 'font-bold text-primary' :
                                                        isDone ? 'text-green-600 font-medium' :
                                                        'text-muted-foreground'
                                                    }`}>
                                                        {step.label}
                                                    </span>
                                                </div>
                                                {i < TIMELINE.length - 1 && (
                                                    <div className={`h-0.5 w-8 shrink-0 rounded-full transition-all ${
                                                        statusOrder.indexOf(TIMELINE[i + 1].key) <= currentIdx
                                                            ? 'bg-green-400'
                                                            : 'bg-border'
                                                    }`} />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {order.tracking_code && (
                                    <div className="mt-4 p-3 bg-muted rounded-lg text-sm flex items-start gap-2">
                                        <Truck className="h-4 w-4 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="font-medium">Rastreamento</p>
                                            <p className="text-muted-foreground">
                                                {order.shipping_carrier && <>{order.shipping_carrier}: </>}
                                                <span className="font-mono font-bold">{order.tracking_code}</span>
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {isCancelled && (
                        <Card className="border-red-200 bg-red-50 dark:bg-red-950">
                            <CardContent className="p-4">
                                <p className="font-semibold text-red-600 dark:text-red-400">
                                    {order.status === 'cancelled' ? '❌ Pedido Cancelado' : '↩️ Pedido Reembolsado'}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Itens */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                Itens do Pedido ({order.items.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="divide-y">
                                {order.items.map(item => (
                                    <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                                        <img
                                            src={item.product?.images?.[0]?.image_path ?? '/placeholder.png'}
                                            alt={item.product_name}
                                            className="w-16 h-16 object-cover rounded-lg bg-muted shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium">{item.product_name}</p>
                                            {item.product_sku && (
                                                <p className="text-xs text-muted-foreground font-mono">
                                                    SKU: {item.product_sku}
                                                </p>
                                            )}
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {item.quantity} × {fmt(item.price)}
                                            </p>
                                        </div>
                                        <p className="font-bold shrink-0">{fmt(item.subtotal)}</p>
                                    </div>
                                ))}
                            </div>

                            <Separator className="my-4" />

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>{fmt(order.subtotal)}</span>
                                </div>
                                {order.discount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Desconto {order.coupon_code && `(${order.coupon_code})`}</span>
                                        <span>-{fmt(order.discount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Frete</span>
                                    <span>{fmt(order.shipping)}</span>
                                </div>
                                {order.tax > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Impostos</span>
                                        <span>{fmt(order.tax)}</span>
                                    </div>
                                )}
                                <Separator />
                                <div className="flex justify-between font-bold text-base">
                                    <span>Total</span>
                                    <span className="text-primary">{fmt(order.total)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Cliente + Endereço */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <User className="h-4 w-4" /> Cliente
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm space-y-1">
                                {order.user ? (
                                    <>
                                        <p className="font-medium">{order.user.name}</p>
                                        <p className="text-muted-foreground">{order.user.email}</p>
                                        <Button variant="link" size="sm" className="p-0 h-auto text-xs" >
                                            <Link href={`/admin/users/${order.user.id}`}>
                                                Ver perfil →
                                            </Link>
                                        </Button>
                                    </>
                                ) : (
                                    <p className="text-muted-foreground">Não encontrado</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <MapPin className="h-4 w-4" /> Endereço
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm space-y-1">
                                <p className="font-medium">{order.shipping_name}</p>
                                {order.shipping_phone && (
                                    <p className="text-muted-foreground">{order.shipping_phone}</p>
                                )}
                                <p className="text-muted-foreground">
                                    {order.shipping_street}, {order.shipping_number}
                                    {order.shipping_complement && `, ${order.shipping_complement}`}
                                </p>
                                <p className="text-muted-foreground">
                                    {order.shipping_neighborhood} — {order.shipping_city}/{order.shipping_state}
                                </p>
                                <p className="text-muted-foreground font-mono text-xs">
                                    CEP: {order.shipping_zipcode}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Pagamento */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm flex items-center gap-2">
                                <CreditCard className="h-4 w-4" /> Pagamento
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-muted-foreground text-xs">Método</p>
                                    <p className="font-medium">
                                        {order.payment_method === 'credit_card' ? '💳 Cartão de Crédito' :
                                         order.payment_method === 'pix' ? '⚡ PIX' :
                                         order.payment_method === 'boleto' ? '📄 Boleto' :
                                         order.payment_method ?? '—'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-xs">Status</p>
                                    <p className="font-medium">
                                        {order.payment_status === 'paid' ? '✅ Pago' :
                                         order.payment_status === 'pending' ? '⏳ Pendente' :
                                         order.payment_status === 'failed' ? '❌ Falhou' : order.payment_status}
                                    </p>
                                </div>
                                {order.paid_at && (
                                    <div>
                                        <p className="text-muted-foreground text-xs">Pago em</p>
                                        <p className="font-medium">
                                            {new Date(order.paid_at).toLocaleDateString('pt-BR', {
                                                day: '2-digit', month: 'long', year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                )}
                                {order.payment_id && (
                                    <div>
                                        <p className="text-muted-foreground text-xs">ID Transação</p>
                                        <p className="font-mono text-xs truncate">{order.payment_id}</p>
                                    </div>
                                )}
                            </div>
                            {order.notes && (
                                <div className="mt-3 pt-3 border-t">
                                    <p className="text-muted-foreground text-xs">Obs. do cliente</p>
                                    <p className="mt-0.5 italic">{order.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Painel Admin */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">⚙️ Gerenciar Pedido</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdate} className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label>Status do Pedido</Label>
                                    <Select
                                        value={data.status}
                                        onValueChange={v => setData('status', v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {STATUS_OPTIONS.map(opt => (
                                                <SelectItem key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label>Transportadora</Label>
                                    <Input
                                        placeholder="Correios, JadLog, Total Express..."
                                        value={data.shipping_carrier}
                                        onChange={e => setData('shipping_carrier', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label>Código de Rastreamento</Label>
                                    <Input
                                        className="font-mono"
                                        placeholder="BR123456789BR"
                                        value={data.tracking_code}
                                        onChange={e => setData('tracking_code', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label>Notas Internas</Label>
                                    <Textarea
                                        rows={3}
                                        placeholder="Anotações internas sobre este pedido..."
                                        value={data.admin_notes}
                                        onChange={e => setData('admin_notes', e.target.value)}
                                    />
                                </div>

                                <Button type="submit" className="w-full" disabled={processing}>
                                    {processing ? 'Salvando...' : '💾 Salvar Alterações'}
                                </Button>
                            </form>

                            <Separator className="my-4" />

                            <div className="text-xs text-muted-foreground space-y-1.5">
                                <div className="flex justify-between">
                                    <span>Criado em</span>
                                    <span>{new Date(order.created_at).toLocaleDateString('pt-BR')}</span>
                                </div>
                                {order.shipped_at && (
                                    <div className="flex justify-between">
                                        <span>Enviado em</span>
                                        <span>{new Date(order.shipped_at).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                )}
                                {order.delivered_at && (
                                    <div className="flex justify-between">
                                        <span>Entregue em</span>
                                        <span>{new Date(order.delivered_at).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}