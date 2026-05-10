import AdminLayout from '@/Layouts/AdminLayout';
import { router, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Switch } from '@/Components/ui/switch';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent } from '@/Components/ui/card';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/Components/ui/dialog';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import { useState } from 'react';

interface Category {
    id: number; name: string; slug: string; description?: string;
    is_active: boolean; products_count: number;
    parent?: { name: string };
}

interface Props { categories: Category[]; }

export default function AdminCategoriesIndex({ categories }: Props) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [createOpen, setCreateOpen] = useState(false);

    const createForm = useForm({ name: '', description: '', is_active: true });
    const editForm = useForm({ name: '', description: '', is_active: true });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/admin/categories', {
            onSuccess: () => { createForm.reset(); setCreateOpen(false); },
        });
    };

    const handleEdit = (cat: Category) => {
        setEditingId(cat.id);
        editForm.setData({ name: cat.name, description: cat.description ?? '', is_active: cat.is_active });
    };

    const handleUpdate = (e: React.FormEvent, id: number) => {
        e.preventDefault();
        editForm.patch(`/admin/categories/${id}`, {
            onSuccess: () => setEditingId(null),
        });
    };

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Remover categoria "${name}"? Os produtos vinculados não serão removidos.`)) {
            router.delete(`/admin/categories/${id}`);
        }
    };

    return (
        <AdminLayout title="Categorias">
            <div className="flex justify-between items-center mb-6">
                <p className="text-muted-foreground text-sm">{categories.length} categorias cadastradas</p>
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogTrigger>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" /> Nova Categoria
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Nova Categoria</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4 pt-2">
                            <div>
                                <Label>Nome *</Label>
                                <Input
                                    className="mt-1"
                                    placeholder="Ex: Eletrônicos"
                                    value={createForm.data.name}
                                    onChange={e => createForm.setData('name', e.target.value)}
                                />
                                {createForm.errors.name && (
                                    <p className="text-destructive text-xs mt-1">{createForm.errors.name}</p>
                                )}
                            </div>
                            <div>
                                <Label>Descrição</Label>
                                <Textarea
                                    className="mt-1"
                                    rows={3}
                                    placeholder="Descrição da categoria..."
                                    value={createForm.data.description}
                                    onChange={e => createForm.setData('description', e.target.value)}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label>Ativa</Label>
                                <Switch
                                    checked={createForm.data.is_active}
                                    onCheckedChange={v => createForm.setData('is_active', v)}
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <Button type="submit" disabled={createForm.processing} className="flex-1">
                                    Criar Categoria
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                                    Cancelar
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map(cat => (
                    <Card key={cat.id} className={!cat.is_active ? 'opacity-60' : ''}>
                        <CardContent className="p-4">
                            {editingId === cat.id ? (
                                <form onSubmit={e => handleUpdate(e, cat.id)} className="space-y-3">
                                    <Input
                                        value={editForm.data.name}
                                        onChange={e => editForm.setData('name', e.target.value)}
                                        placeholder="Nome da categoria"
                                        autoFocus
                                    />
                                    <Textarea
                                        rows={2}
                                        value={editForm.data.description}
                                        onChange={e => editForm.setData('description', e.target.value)}
                                        placeholder="Descrição"
                                    />
                                    <div className="flex items-center justify-between text-sm">
                                        <span>Ativa</span>
                                        <Switch
                                            checked={editForm.data.is_active}
                                            onCheckedChange={v => editForm.setData('is_active', v)}
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button type="submit" size="sm" disabled={editForm.processing} className="flex-1">
                                            Salvar
                                        </Button>
                                        <Button type="button" variant="outline" size="sm" onClick={() => setEditingId(null)}>
                                            Cancelar
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <Tag className="h-4 w-4 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-sm">{cat.name}</h3>
                                                <p className="text-xs text-muted-foreground font-mono">{cat.slug}</p>
                                            </div>
                                        </div>
                                        <Badge variant={cat.is_active ? 'default' : 'secondary'} className="text-xs shrink-0">
                                            {cat.is_active ? 'Ativa' : 'Inativa'}
                                        </Badge>
                                    </div>

                                    {cat.description && (
                                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{cat.description}</p>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">
                                            {cat.products_count} produto(s)
                                        </span>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost" size="icon" className="h-7 w-7"
                                                onClick={() => handleEdit(cat)}
                                            >
                                                <Edit className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost" size="icon"
                                                className="h-7 w-7 text-destructive hover:text-destructive"
                                                onClick={() => handleDelete(cat.id, cat.name)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                ))}

                {categories.length === 0 && (
                    <div className="col-span-full text-center py-16 text-muted-foreground">
                        <Tag className="h-10 w-10 mx-auto mb-3" />
                        <p>Nenhuma categoria cadastrada.</p>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}