import AdminLayout from '@/Layouts/AdminLayout';
import { Link, router, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Card, CardContent } from '@/Components/ui/card';
import {
    Plus, Search, Edit, Trash2, Eye, EyeOff,
    Star, AlertTriangle, Package,
} from 'lucide-react';
import { useState } from 'react';

interface Product {
    id: number; name: string; sku?: string; price: number; sale_price?: number;
    stock_quantity: number; is_active: boolean; is_featured: boolean;
    low_stock_threshold: number; deleted_at?: string;
    category: { name: string };
    images: { image_path: string; is_primary: boolean }[];
}

interface Props {
    products: { data: Product[]; links: any[]; meta: { last_page?: number; total?: number } };
    categories: { id: number; name: string }[];
}

export default function AdminProductsIndex({ products, categories }: Props) {
    const [search, setSearch] = useState('');
const [category, setCategory] = useState<string | null>('');
const [status, setStatus] = useState<string | null>('');

    const fmt = (v: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

    const applyFilters = () => {
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (category) params.category = category;
        if (status) params.status = status;
        router.get('/admin/products', params, { preserveState: true });
    };

    const deleteProduct = (id: number, name: string) => {
        if (confirm(`Deseja remover "${name}"?`)) {
            router.delete(`/admin/products/${id}`);
        }
    };

    const toggleActive = (product: Product) => {
        router.patch(`/admin/products/${product.id}`, {
            ...product,
            is_active: !product.is_active,
            category_id: product.category,
        }, { preserveScroll: true });
    };

    const totalProducts = products.meta?.total ?? products.data.length;
    const lowStockCount = products.data.filter(
        p => p.stock_quantity <= p.low_stock_threshold && !p.deleted_at
    ).length;
    const featuredCount = products.data.filter(
        p => p.is_featured && !p.deleted_at
    ).length;

    return (
        <AdminLayout title="Produtos">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex gap-2 flex-1 flex-wrap">
                    <div className="relative flex-1 min-w-40">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar produtos..."
                            className="pl-9"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && applyFilters()}
                        />
                    </div>
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="w-44">
                            <SelectValue placeholder="Categoria" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">Todas</SelectItem>
                            {categories.map(c => (
                                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="w-36">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">Todos</SelectItem>
                            <SelectItem value="active">Ativos</SelectItem>
                            <SelectItem value="inactive">Inativos</SelectItem>
                            <SelectItem value="deleted">Removidos</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={applyFilters}>Filtrar</Button>
                </div>
                <Button >
                    <Link href="/admin/products/create" className='flex flex-items'>
                        <Plus className="h-4 w-4 mr-2" /> Novo Produto
                    </Link>
                </Button>
            </div>

            {/* Stats rápidas */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <Package className="h-8 w-8 text-primary" />
                        <div>
                            <p className="text-2xl font-bold">{totalProducts}</p>
                            <p className="text-xs text-muted-foreground">Total de Produtos</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <AlertTriangle className="h-8 w-8 text-yellow-500" />
                        <div>
                            <p className="text-2xl font-bold">
                                {products.data.filter(p => p.stock_quantity <= p.low_stock_threshold && !p.deleted_at).length}
                            </p>
                            <p className="text-xs text-muted-foreground">Estoque Baixo</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <Star className="h-8 w-8 text-amber-500" />
                        <div>
                            <p className="text-2xl font-bold">
                                {products.data.filter(p => p.is_featured && !p.deleted_at).length}
                            </p>
                            <p className="text-xs text-muted-foreground">Em Destaque</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b text-left text-muted-foreground bg-muted/50">
                                <th className="px-4 py-3 font-medium">Produto</th>
                                <th className="px-4 py-3 font-medium">Categoria</th>
                                <th className="px-4 py-3 font-medium">Preço</th>
                                <th className="px-4 py-3 font-medium">Estoque</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {products.data.map(product => {
                                const img = product.images?.find(i => i.is_primary) ?? product.images?.[0];
                                const isLowStock = product.stock_quantity <= product.low_stock_threshold;
                                return (
                                    <tr
                                        key={product.id}
                                        className={`hover:bg-muted/50 transition-colors ${product.deleted_at ? 'opacity-50' : ''}`}
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={img?.image_path ?? '/placeholder.png'}
                                                    alt={product.name}
                                                    className="w-10 h-10 object-cover rounded-lg bg-muted shrink-0"
                                                />
                                                <div className="min-w-0">
                                                    <p className="font-medium truncate max-w-48">{product.name}</p>
                                                    {product.sku && <p className="text-xs text-muted-foreground font-mono">{product.sku}</p>}
                                                    {product.is_featured && (
                                                        <Badge variant="outline" className="text-xs text-amber-600 border-amber-300 mt-0.5">
                                                            ⭐ Destaque
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-muted-foreground">{product.category?.name}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="font-bold">
                                                    {fmt(product.sale_price ?? product.price)}
                                                </p>
                                                {product.sale_price && (
                                                    <p className="text-xs text-muted-foreground line-through">{fmt(product.price)}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5">
                                                {isLowStock && !product.deleted_at && (
                                                    <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
                                                )}
                                                <span className={isLowStock ? 'text-yellow-600 font-bold' : ''}>
                                                    {product.stock_quantity}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {product.deleted_at ? (
                                                <Badge variant="outline" className="text-xs text-red-500 border-red-300">Removido</Badge>
                                            ) : (
                                                <Badge variant={product.is_active ? 'default' : 'secondary'} className="text-xs">
                                                    {product.is_active ? 'Ativo' : 'Inativo'}
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8" >
                                                    <Link href={`/produtos/${product.id}`} target="_blank">
                                                        <Eye className="h-3.5 w-3.5" />
                                                    </Link>
                                                </Button>
                                                {!product.deleted_at && (
                                                    <>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8" >
                                                            <Link href={`/admin/products/${product.id}/edit`}>
                                                                <Edit className="h-3.5 w-3.5" />
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                                                            onClick={() => deleteProduct(product.id, product.name)}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {products.data.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <Package className="h-10 w-10 mx-auto mb-3" />
                        <p>Nenhum produto encontrado.</p>
                    </div>
                )}

                {/* Pagination */}
                {(products.meta?.last_page ?? 0) > 1 && (
                    <div className="flex justify-center gap-2 p-4 border-t flex-wrap">
                        {products.links.map((link: any, i: number) => (
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