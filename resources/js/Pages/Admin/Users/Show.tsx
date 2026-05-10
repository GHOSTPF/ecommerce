import AdminLayout from '@/Layouts/AdminLayout';
import { Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Separator } from '@/Components/ui/separator';
import { Avatar, AvatarFallback } from '@/Components/ui/avatar';
import {
    ChevronLeft, ShieldCheck, Mail, Calendar,
    ShoppingBag, MapPin, Package,
} from 'lucide-react';

interface Address {
    id: number; type: string; name: string; street: string; number: string;
    complement?: string; neighborhood: string; city: string; state: string; zipcode: string;
}
interface OrderItem { product_name: string; quantity: number; }
interface Order {
    id: number; order_number: string; status: string; total: number;
    created_at: string; items: OrderItem[];
    status_badge?: { label: string; color: string };
}
interface Role { name: string; }
interface User {
    id: number; name: string; email: string; created_at: string;
    roles: Role[]; orders: Order[]; addresses: Address[];
}

const STATUS_COLORS: Record<string, string> = {
    pending: 'text-yellow-600 border-yellow-400 bg-yellow-50',
    confirmed: 'text-blue-600 border-blue-400 bg-blue-50',
    processing: 'text-purple-600 border-purple-400 bg-purple-50',
    shipped: 'text-indigo-600 border-indigo-400 bg-indigo-50',
    delivered: 'text-green-600 border-green-400 bg-green-50',
    cancelled: 'text-red-600 border-red-400 bg-red-50',
    refunded: 'text-gray-600 border-gray-400 bg-gray-50',
};

const STATUS_LABELS: Record<string, string> = {
    pending: 'Aguardando', confirmed: 'Confirmado', processing: 'Processando',
    shipped: 'Enviado', delivered: 'Entregue', cancelled: 'Cancelado', refunded: 'Reembolsado',
};

export default function AdminUserShow({ user }: { user: User }) {
    const fmt = (v: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

    const isAdmin = user.roles?.some(r => r.name === 'admin');
    const initials = user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    const totalSpent = user.orders
        .filter((o: any) => o.payment_status === 'paid')
        .reduce((sum, o) => sum + Number(o.total), 0);

    return (
        <AdminLayout title="Detalhes do Usuário">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Button variant="ghost" size="sm" >
                    <Link href="/admin/users" className='flex flex-items'>
                        <ChevronLeft className="h-4 w-4 mr-1" /> Usuários
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sidebar — Info do Usuário */}
                <div className="space-y-4">
                    {/* Card Principal */}
                    <Card>
                        <CardContent className="p-6 text-center space-y-3">
                            <Avatar className="h-20 w-20 mx-auto">
                                <AvatarFallback className="text-2xl bg-primary/10 text-primary font-bold">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="font-bold text-lg flex items-center justify-center gap-2">
                                    {user.name}
                                    {isAdmin && <ShieldCheck className="h-4 w-4 text-primary" />}
                                </h2>
                                <p className="text-muted-foreground text-sm">{user.email}</p>
                            </div>
                            <div className="flex gap-2 justify-center flex-wrap">
                                {user.roles?.map(role => (
                                    <Badge
                                        key={role.name}
                                        variant={role.name === 'admin' ? 'default' : 'secondary'}
                                    >
                                        {role.name === 'admin' ? '👑 Admin' : '👤 Cliente'}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Informações */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Informações</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="h-4 w-4 shrink-0" />
                                <span className="truncate">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="h-4 w-4 shrink-0" />
                                <span>
                                    Cadastrado em{' '}
                                    {new Date(user.created_at).toLocaleDateString('pt-BR', {
                                        day: '2-digit', month: 'long', year: 'numeric',
                                    })}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Estatísticas */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Estatísticas</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                                    <ShoppingBag className="h-3.5 w-3.5" /> Total de Pedidos
                                </span>
                                <span className="font-bold">{user.orders.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Total Gasto</span>
                                <span className="font-bold text-primary">{fmt(totalSpent)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Endereços</span>
                                <span className="font-bold">{user.addresses?.length ?? 0}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Endereços */}
                    {user.addresses?.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <MapPin className="h-4 w-4" /> Endereços
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {user.addresses.map(addr => (
                                    <div key={addr.id} className="text-xs text-muted-foreground space-y-0.5 pb-3 border-b last:border-0 last:pb-0">
                                        <p className="font-medium text-foreground">{addr.name}</p>
                                        <p>{addr.street}, {addr.number}{addr.complement && `, ${addr.complement}`}</p>
                                        <p>{addr.neighborhood} — {addr.city}/{addr.state}</p>
                                        <p className="font-mono">CEP: {addr.zipcode}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Histórico de Pedidos */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                Histórico de Pedidos ({user.orders.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {user.orders.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <ShoppingBag className="h-10 w-10 mx-auto mb-3 opacity-50" />
                                    <p>Nenhum pedido realizado ainda.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {user.orders.map(order => (
                                        <div
                                            key={order.id}
                                            className="flex items-start justify-between gap-4 p-4 border rounded-xl hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="space-y-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-mono font-bold text-xs">
                                                        {order.order_number}
                                                    </span>
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[order.status] ?? 'bg-gray-50 text-gray-600 border-gray-400'}`}>
                                                        {order.status_badge?.label ?? STATUS_LABELS[order.status] ?? order.status}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(order.created_at).toLocaleDateString('pt-BR', {
                                                        day: '2-digit', month: 'long', year: 'numeric',
                                                    })}
                                                </p>
                                                {order.items?.length > 0 && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {order.items.slice(0, 2).map(i => i.product_name).join(', ')}
                                                        {order.items.length > 2 && ` +${order.items.length - 2} mais`}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 shrink-0">
                                                <span className="font-bold text-primary">
                                                    {fmt(order.total)}
                                                </span>
                                                <Button variant="ghost" size="sm" >
                                                    <Link href={`/admin/orders/${order.id}`}>
                                                        Ver →
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}