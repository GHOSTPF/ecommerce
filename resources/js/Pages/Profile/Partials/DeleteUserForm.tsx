import { useRef, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/Components/ui/dialog';
import { AlertTriangle } from 'lucide-react';

export default function DeleteUserForm({ className }: { className?: string }) {
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
    const passwordInput = useRef<HTMLInputElement>(null);

    const { data, setData, delete: destroy, processing, reset, errors } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingDeletion(true);
        setTimeout(() => passwordInput.current?.focus(), 100);
    };

    const deleteUser = (e: React.FormEvent) => {
        e.preventDefault();
        destroy('/profile', {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingDeletion(false);
        reset();
    };

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-lg font-semibold text-destructive flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Deletar Conta
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Após deletar sua conta, todos os seus dados serão permanentemente removidos.
                    Antes de continuar, faça o download de qualquer dado que deseje manter.
                </p>
            </div>

            <Button
                variant="destructive"
                onClick={confirmUserDeletion}
            >
                Deletar Minha Conta
            </Button>

            <Dialog open={confirmingDeletion} onOpenChange={setConfirmingDeletion}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-5 w-5" />
                            Confirmar Exclusão
                        </DialogTitle>
                        <DialogDescription>
                            Tem certeza que deseja deletar sua conta? Esta ação é
                            <strong> irreversível</strong>. Todos os seus dados serão
                            permanentemente removidos. Digite sua senha para confirmar.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={deleteUser} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="delete-password">Sua Senha</Label>
                            <Input
                                id="delete-password"
                                ref={passwordInput}
                                type="password"
                                placeholder="Digite sua senha para confirmar"
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                            />
                            {errors.password && (
                                <p className="text-destructive text-xs">{errors.password}</p>
                            )}
                        </div>

                        <DialogFooter className="gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeModal}
                                disabled={processing}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={processing}
                            >
                                {processing ? 'Deletando...' : 'Sim, deletar minha conta'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}