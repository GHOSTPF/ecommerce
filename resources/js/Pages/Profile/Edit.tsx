import { useState, useRef } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Separator } from '@/Components/ui/separator';
import { Badge } from '@/Components/ui/badge';
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogTrigger,
} from '@/Components/ui/dialog';
import {
    Camera, Plus, Trash2, Star, MapPin,
    CheckCircle, Edit3, Loader2, Search, AlertCircle,
} from 'lucide-react';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import DeleteUserForm from './Partials/DeleteUserForm';

interface Address {
    id: number; label?: string; name: string; phone?: string;
    zipcode: string; street: string; number: string; complement?: string;
    neighborhood: string; city: string; state: string; is_default: boolean;
}
interface Props {
    mustVerifyEmail: boolean;
    status?: string;
    addresses: Address[];
    cartCount?: number;
}

export default function ProfileEdit({ mustVerifyEmail, status, addresses, cartCount = 0 }: Props) {
    const { auth } = usePage().props as any;
    const user = auth.user;

    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [addAddressOpen, setAddAddressOpen] = useState(false);
    const [editingAddr, setEditingAddr]       = useState<Address | null>(null);
    const [cepLoading, setCepLoading]         = useState(false);
    const [cepFound, setCepFound]             = useState(false);
    const [cepError, setCepError]             = useState('');
    const avatarRef = useRef<HTMLInputElement>(null);

    const fmt = (v: string) => v;

    // Form do Perfil
    const profileForm = useForm({
        name:   user.name ?? '',
        email:  user.email ?? '',
        phone:  user.phone ?? '',
        avatar: null as File | null,
        _method: 'PATCH',
    });

    // Form de Endereço
    const addrForm = useForm({
        label:        '',
        name:         user.name ?? '',
        phone:        user.phone ?? '',
        zipcode:      '',
        street:       '',
        number:       '',
        complement:   '',
        neighborhood: '',
        city:         '',
        state:        '',
        is_default:   false,
    });

    // Avatar preview
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            profileForm.setData('avatar', file);
            const url = URL.createObjectURL(file);
            setAvatarPreview(url);
        }
    };

    // Salvar perfil
    const handleProfileSave = (e: React.FormEvent) => {
        e.preventDefault();
        profileForm.post('/profile', { forceFormData: true });
    };

    // CEP no form de endereço
    const handleCepChange = (value: string) => {
        const clean  = value.replace(/\D/g, '').slice(0, 8);
        const fmtCep = clean.length > 5 ? `${clean.slice(0, 5)}-${clean.slice(5)}` : clean;
        addrForm.setData('zipcode', fmtCep);
        setCepFound(false); setCepError('');
        if (clean.length === 8) fetchCep(clean);
    };

    const fetchCep = async (cep: string) => {
        setCepLoading(true);
        try {
            const res    = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const result = await res.json();
            if (result.erro) {
                setCepError('CEP não encontrado.');
            } else {
                addrForm.setData(prev => ({
                    ...prev,
                    street:       result.logradouro ?? '',
                    neighborhood: result.bairro ?? '',
                    city:         result.localidade ?? '',
                    state:        result.uf ?? '',
                }));
                setCepFound(true);
                setTimeout(() => document.getElementById('addr-number')?.focus(), 100);
            }
        } catch { setCepError('Erro ao buscar CEP.'); }
        finally { setCepLoading(false); }
    };

    const handleAddressSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingAddr) {
            addrForm.put(`/enderecos/${editingAddr.id}`, {
                onSuccess: () => { setEditingAddr(null); setAddAddressOpen(false); addrForm.reset(); },
            });
        } else {
            addrForm.post('/enderecos', {
                onSuccess: () => { setAddAddressOpen(false); addrForm.reset(); },
            });
        }
    };

    const openEdit = (addr: Address) => {
        setEditingAddr(addr);
        addrForm.setData({
            label: addr.label ?? '', name: addr.name, phone: addr.phone ?? '',
            zipcode: addr.zipcode, street: addr.street, number: addr.number,
            complement: addr.complement ?? '', neighborhood: addr.neighborhood,
            city: addr.city, state: addr.state, is_default: addr.is_default,
        });
        setCepFound(false); setCepError('');
        setAddAddressOpen(true);
    };

    const AddressForm = () => (
        <form onSubmit={handleAddressSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <Label>Identificação</Label>
                    <Input
                        placeholder='Ex: "Casa", "Trabalho"'
                        value={addrForm.data.label}
                        onChange={e => addrForm.setData('label', e.target.value)}
                    />
                </div>
                <div className="space-y-1.5">
                    <Label>CEP *</Label>
                    <div className="relative">
                        <Input
                            placeholder="00000-000"
                            maxLength={9}
                            value={addrForm.data.zipcode}
                            onChange={e => handleCepChange(e.target.value)}
                            className={cepFound ? 'border-green-500' : cepError ? 'border-red-500' : ''}
                        />
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                            {cepLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                            {cepFound && !cepLoading && <CheckCircle className="h-4 w-4 text-green-500" />}
                            {cepError && !cepLoading && <AlertCircle className="h-4 w-4 text-red-500" />}
                        </div>
                    </div>
                    {cepError && <p className="text-xs text-red-500">{cepError}</p>}
                    <a href="https://buscacepinter.correios.com.br/app/endereco/index.php" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                        <Search className="h-3 w-3" /> Não sei meu CEP
                    </a>
                </div>
            </div>

            <div className="space-y-1.5">
                <Label>Nome no endereço *</Label>
                <Input
                    value={addrForm.data.name}
                    onChange={e => addrForm.setData('name', e.target.value)}
                    placeholder="Nome de quem vai receber"
                />
            </div>

            <div className="space-y-1.5">
                <Label>Rua / Avenida *</Label>
                <Input
                    value={addrForm.data.street}
                    onChange={e => addrForm.setData('street', e.target.value)}
                    className={cepFound && addrForm.data.street ? 'border-green-300' : ''}
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <Label>Número *</Label>
                    <Input
                        id="addr-number"
                        value={addrForm.data.number}
                        onChange={e => addrForm.setData('number', e.target.value)}
                    />
                </div>
                <div className="space-y-1.5">
                    <Label>Complemento</Label>
                    <Input
                        value={addrForm.data.complement}
                        onChange={e => addrForm.setData('complement', e.target.value)}
                        placeholder="Apto, Bloco..."
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <Label>Bairro *</Label>
                <Input
                    value={addrForm.data.neighborhood}
                    onChange={e => addrForm.setData('neighborhood', e.target.value)}
                    className={cepFound && addrForm.data.neighborhood ? 'border-green-300' : ''}
                />
            </div>

            <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1.5">
                    <Label>Cidade *</Label>
                    <Input
                        value={addrForm.data.city}
                        onChange={e => addrForm.setData('city', e.target.value)}
                        className={cepFound && addrForm.data.city ? 'border-green-300' : ''}
                    />
                </div>
                <div className="space-y-1.5">
                    <Label>Estado *</Label>
                    <Input
                        value={addrForm.data.state}
                        onChange={e => addrForm.setData('state', e.target.value.toUpperCase())}
                        maxLength={2}
                        placeholder="PB"
                        className={`uppercase ${cepFound && addrForm.data.state ? 'border-green-300' : ''}`}
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <Label>Telefone para entrega</Label>
                <Input
                    value={addrForm.data.phone}
                    onChange={e => addrForm.setData('phone', e.target.value)}
                    placeholder="(83) 99999-9999"
                />
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                    <p className="text-sm font-medium">Definir como endereço padrão</p>
                    <p className="text-xs text-muted-foreground">Será usado automaticamente no checkout</p>
                </div>
                <button
                    type="button"
                    onClick={() => addrForm.setData('is_default', !addrForm.data.is_default)}
                    className={`w-10 h-5 rounded-full transition-colors ${addrForm.data.is_default ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                >
                    <span className={`block w-4 h-4 bg-white rounded-full shadow transition-transform mx-0.5 ${addrForm.data.is_default ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
            </div>

            <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={addrForm.processing} className="flex-1">
                    {addrForm.processing ? 'Salvando...' : editingAddr ? 'Atualizar Endereço' : 'Salvar Endereço'}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setAddAddressOpen(false); setEditingAddr(null); addrForm.reset(); }}>
                    Cancelar
                </Button>
            </div>
        </form>
    );

    return (
        <MainLayout cartCount={cartCount}>
            <Head title="Meu Perfil" />
            <div className="container mx-auto px-4 py-10 max-w-4xl">
                <h1 className="text-2xl font-bold mb-6">Meu Perfil</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* ═══ COLUNA ESQUERDA — Avatar + Info ═══ */}
                    <div className="space-y-4">
                        <Card>
                            <CardContent className="p-6 flex flex-col items-center gap-4">
                                {/* Avatar */}
                                <div className="relative group">
                                    <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg">
                                        <img
                                            src={avatarPreview ?? user.avatar_url}
                                            alt={user.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <button
                                        onClick={() => avatarRef.current?.click()}
                                        className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 shadow-lg hover:scale-110 transition-transform"
                                        title="Alterar foto"
                                    >
                                        <Camera className="h-4 w-4" />
                                    </button>
                                    <input
                                        ref={avatarRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleAvatarChange}
                                    />
                                </div>

                                <div className="text-center">
                                    <h2 className="font-bold text-lg">{user.name}</h2>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>

                                {avatarPreview && (
                                    <p className="text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg text-center">
                                        📷 Salve o perfil para aplicar a nova foto
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* ═══ COLUNA DIREITA — Formulários ═══ */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Informações Pessoais */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Informações Pessoais</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {status === 'profile-updated' && (
                                    <div className="flex items-center gap-2 mb-4 p-3 bg-green-50 dark:bg-green-950 rounded-lg text-sm text-green-700 dark:text-green-300">
                                        <CheckCircle className="h-4 w-4" /> Perfil atualizado com sucesso!
                                    </div>
                                )}
                                <form onSubmit={handleProfileSave} className="space-y-4" encType="multipart/form-data">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label>Nome *</Label>
                                            <Input
                                                value={profileForm.data.name}
                                                onChange={e => profileForm.setData('name', e.target.value)}
                                            />
                                            {profileForm.errors.name && <p className="text-destructive text-xs">{profileForm.errors.name}</p>}
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>Telefone</Label>
                                            <Input
                                                value={profileForm.data.phone}
                                                onChange={e => profileForm.setData('phone', e.target.value)}
                                                placeholder="(83) 99999-9999"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>E-mail *</Label>
                                        <Input
                                            type="email"
                                            value={profileForm.data.email}
                                            onChange={e => profileForm.setData('email', e.target.value)}
                                        />
                                        {profileForm.errors.email && <p className="text-destructive text-xs">{profileForm.errors.email}</p>}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Button type="submit" disabled={profileForm.processing}>
                                            {profileForm.processing ? 'Salvando...' : 'Salvar Alterações'}
                                        </Button>
                                        {profileForm.recentlySuccessful && (
                                            <span className="flex items-center gap-1.5 text-sm text-green-600">
                                                <CheckCircle className="h-4 w-4" /> Salvo!
                                            </span>
                                        )}
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Endereços */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5" /> Meus Endereços
                                    </CardTitle>
                                    <Dialog open={addAddressOpen} onOpenChange={open => { setAddAddressOpen(open); if (!open) { setEditingAddr(null); addrForm.reset(); } }}>
                                        <DialogTrigger >
                                            <Button size="sm" variant="outline">
                                                <Plus className="h-4 w-4 mr-1.5" /> Novo Endereço
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                                            <DialogHeader>
                                                <DialogTitle>{editingAddr ? 'Editar Endereço' : 'Novo Endereço'}</DialogTitle>
                                            </DialogHeader>
                                            <AddressForm />
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {addresses.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <MapPin className="h-10 w-10 mx-auto mb-3 opacity-40" />
                                        <p className="text-sm">Nenhum endereço cadastrado.</p>
                                        <p className="text-xs mt-1">Adicione um endereço para agilizar seu checkout.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {addresses.map(addr => (
                                            <div
                                                key={addr.id}
                                                className={`p-4 border-2 rounded-xl transition-all ${
                                                    addr.is_default
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-border hover:border-muted-foreground/30'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                                            <p className="font-semibold text-sm">
                                                                {addr.label || addr.name}
                                                            </p>
                                                            {addr.is_default && (
                                                                <Badge className="text-xs gap-1 h-5">
                                                                    <Star className="h-2.5 w-2.5 fill-current" /> Padrão
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">
                                                            {addr.name} {addr.phone && `— ${addr.phone}`}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-0.5">
                                                            {addr.street}, {addr.number}
                                                            {addr.complement && `, ${addr.complement}`}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {addr.neighborhood} — {addr.city}/{addr.state} — CEP: {addr.zipcode}
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-col gap-1 shrink-0">
                                                        {!addr.is_default && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="text-xs h-7 px-2 gap-1"
                                                                onClick={() => router.patch(`/enderecos/${addr.id}/padrao`, {}, { preserveScroll: true })}
                                                            >
                                                                <Star className="h-3 w-3" /> Definir padrão
                                                            </Button>
                                                        )}
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-7 px-2 gap-1 text-xs"
                                                            onClick={() => openEdit(addr)}
                                                        >
                                                            <Edit3 className="h-3 w-3" /> Editar
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-7 px-2 gap-1 text-xs text-destructive hover:text-destructive"
                                                            onClick={() => {
                                                                if (confirm('Remover este endereço?')) {
                                                                    router.delete(`/enderecos/${addr.id}`, { preserveScroll: true });
                                                                }
                                                            }}
                                                        >
                                                            <Trash2 className="h-3 w-3" /> Remover
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Senha */}
                        <Card>
                            <CardHeader><CardTitle>Alterar Senha</CardTitle></CardHeader>
                            <CardContent><UpdatePasswordForm /></CardContent>
                        </Card>

                        {/* Deletar conta */}
                        <Card className="border-destructive/30">
                            <CardHeader><CardTitle className="text-destructive">Zona de Perigo</CardTitle></CardHeader>
                            <CardContent><DeleteUserForm /></CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}