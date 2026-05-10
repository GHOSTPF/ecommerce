import { useForm, Link, usePage } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { CheckCircle } from 'lucide-react';

interface Props {
    mustVerifyEmail: boolean;
    status?: string;
    className?: string;
}

export default function UpdateProfileInformationForm({ mustVerifyEmail, status }: Props) {
    const user = usePage().props.auth.user as any;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name ?? '',
        email: user.email ?? '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch('/profile');
    };

    return (
        <div className="space-y-5">
            <div>
                <h2 className="text-lg font-semibold">Informações do Perfil</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Atualize seu nome e endereço de e-mail.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div className="space-y-1.5">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                        id="name"
                        value={data.name}
                        onChange={e => setData('name', e.target.value)}
                        autoComplete="name"
                    />
                    {errors.name && (
                        <p className="text-destructive text-xs">{errors.name}</p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={e => setData('email', e.target.value)}
                        autoComplete="username"
                    />
                    {errors.email && (
                        <p className="text-destructive text-xs">{errors.email}</p>
                    )}
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 rounded-lg text-sm text-yellow-800 dark:text-yellow-200">
                        <p>
                            Seu e-mail não está verificado.{' '}
                            <Link
                                href="/email/verification-notification"
                                method="post"
                                as="button"
                                className="underline hover:no-underline font-medium"
                            >
                                Clique aqui para reenviar o e-mail de verificação.
                            </Link>
                        </p>
                        {status === 'verification-link-sent' && (
                            <p className="mt-2 font-medium text-green-600">
                                Um novo link de verificação foi enviado para seu e-mail.
                            </p>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <Button type="submit" disabled={processing}>
                        Salvar Alterações
                    </Button>
                    {recentlySuccessful && (
                        <span className="flex items-center gap-1.5 text-sm text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            Salvo com sucesso!
                        </span>
                    )}
                </div>
            </form>
        </div>
    );
}