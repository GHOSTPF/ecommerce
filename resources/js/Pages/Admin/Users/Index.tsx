import AdminLayout from '@/Layouts/AdminLayout';
import { Link, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Avatar, AvatarFallback } from '@/Components/ui/avatar';
import { Search, Eye, Trash2, ShieldCheck, Users } from 'lucide-react';
import { useState } from 'react';

interface Role { name: string; }
interface User {
    id: number; name: string; email: string;
    created_at: string; orders_count: number;
    roles: Role[];
}
interface Props {
    users: {
        data: User[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
        last_page: number;
    };
}

export default function AdminUsersIndex({ users }: Props) {
    const [search, setSearch] = useState('');

    const applySearch = () => {
        router.get('/admin/users', search ? { search } : {}, { preserveState: true });
    };

    const deleteUser = (id: number, name: string) => {
        if (confirm(`Remover o usuário "${name}"? Esta ação não pode ser desfeita.`)) {
            router.delete(`/admin/users/${id}`);
        }
    };

    return (
        <AdminLayout title="Usuários">
            {/* Header com total */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <p className="font-semibold">Total de Usuários</p>
                        <p className="text-2xl font-bold text-primary">{users.total}</p>
                    </div>
                </div>
            </div>

            {/* Busca */}
            <div className="flex gap-3 mb-6">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nome ou email..."
                        className="pl-9"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applySearch()}
                    />
                </div>
                <Button variant="outline" onClick={applySearch}>Buscar</Button>
                {search && (
                    <Button variant="ghost" onClick={() => {
                        setSearch('');
                        router.get('/admin/users');
                    }}>
                        Limpar
                    </Button>
                )}
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b text-left text-muted-foreground bg-muted/50">
                                <th className="px-4 py-3 font-medium">Usuário</th>
                                <th className="px-4 py-3 font-medium">Perfil</th>
                                <th className="px-4 py-3 font-medium">Pedidos</th>
                                <th className="px-4 py-3 font-medium">Cadastro</th>
                                <th className="px-4 py-3 font-medium text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {users.data.map(user => {
                                const isAdmin = user.roles?.some(r => r.name === 'admin');
                                const initials = user.name
                                    .split(' ')
                                    .map(n => n[0])
                                    .slice(0, 2)
                                    .join('')
                                    .toUpperCase();

                                return (
                                    <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                                                        {initials}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium flex items-center gap-1.5">
                                                        {user.name}
                                                        {isAdmin && (
                                                            <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-label="Administrador" />
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-1 flex-wrap">
                                                {user.roles?.map(role => (
                                                    <Badge
                                                        key={role.name}
                                                        variant={role.name === 'admin' ? 'default' : 'secondary'}
                                                        className="text-xs"
                                                    >
                                                        {role.name === 'admin' ? '👑 Admin' : '👤 Cliente'}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="font-bold">{user.orders_count}</span>
                                            <span className="text-muted-foreground text-xs ml-1">pedido(s)</span>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground text-xs">
                                            {new Date(user.created_at).toLocaleDateString('pt-BR', {
                                                day: '2-digit', month: '2-digit', year: 'numeric',
                                            })}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button variant="ghost" size="sm" >
                                                    <Link href={`/admin/users/${user.id}`} className='flex flex-items'>
                                                        <Eye className="h-3.5 w-3.5 mr-1" /> Ver
                                                    </Link>
                                                </Button>
                                                {!isAdmin && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => deleteUser(user.id, user.name)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {users.data.length === 0 && (
                    <div className="text-center py-16 text-muted-foreground">
                        <Users className="h-10 w-10 mx-auto mb-3 opacity-50" />
                        <p>Nenhum usuário encontrado.</p>
                    </div>
                )}

                {users.last_page > 1 && (
                    <div className="flex justify-center gap-2 p-4 border-t flex-wrap">
                        {users.links.map((link, i) => (
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