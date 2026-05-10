import MainLayout from '@/Layouts/MainLayout';
import { Head, usePage } from '@inertiajs/react';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import DeleteUserForm from './Partials/DeleteUserForm';

interface Props {
    mustVerifyEmail: boolean;
    status?: string;
    cartCount?: number;
}

export default function Edit({ mustVerifyEmail, status, cartCount = 0 }: Props) {
    return (
        <MainLayout cartCount={cartCount}>
            <Head title="Meu Perfil" />

            <div className="py-12">
                <div className="mx-auto max-w-3xl px-4 space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold">Meu Perfil</h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            Gerencie suas informações pessoais e segurança da conta
                        </p>
                    </div>

                    {/* Informações pessoais */}
                    <div className="bg-card border rounded-xl p-6 shadow-sm">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                        />
                    </div>

                    {/* Senha */}
                    <div className="bg-card border rounded-xl p-6 shadow-sm">
                        <UpdatePasswordForm />
                    </div>

                    {/* Deletar conta */}
                    <div className="bg-card border rounded-xl p-6 shadow-sm border-destructive/30">
                        <DeleteUserForm />
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}