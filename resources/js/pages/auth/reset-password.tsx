import { Head, useForm } from '@inertiajs/react';
import { Check, KeyRound, LoaderCircle, Lock, Mail, ShieldCheck } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { PasswordInput } from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

interface ResetPasswordProps {
    token: string;
    email: string;
}

interface ResetPasswordForm {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
    [key: string]: string;
}

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const { data, setData, post, processing, errors, reset } = useForm<ResetPasswordForm>({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout
            title="Set a new password"
            description="Choose a password you have not used on this portal before."
            footer="This link was issued for the address above and can only be used once."
        >
            <Head title="Reset password" />

            <form className="flex flex-col gap-4" onSubmit={submit}>
                <div className="grid gap-1.5">
                    <Label htmlFor="email">Email address</Label>
                    {/* Fixed by the reset link -- shown so it is clear which account this sets. */}
                    <div className="relative">
                        <Mail className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            autoComplete="email"
                            readOnly
                            className="bg-muted text-muted-foreground h-11 pr-10 pl-9 lg:h-10"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        <Lock className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 size-3.5 -translate-y-1/2" />
                    </div>
                    <InputError message={errors.email} />
                </div>

                <div className="grid gap-1.5">
                    <Label htmlFor="password">New password</Label>
                    <PasswordInput
                        id="password"
                        name="password"
                        required
                        autoFocus
                        autoComplete="new-password"
                        icon={KeyRound}
                        className="h-11 lg:h-10"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="New password"
                    />
                    <InputError message={errors.password} />
                </div>

                <div className="grid gap-1.5">
                    <Label htmlFor="password_confirmation">Confirm new password</Label>
                    <PasswordInput
                        id="password_confirmation"
                        name="password_confirmation"
                        required
                        autoComplete="new-password"
                        icon={KeyRound}
                        className="h-11 lg:h-10"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        placeholder="Re-enter the new password"
                    />
                    <InputError message={errors.password_confirmation} />
                </div>

                <ul className="text-muted-foreground flex flex-col gap-1.5 text-[13px]">
                    <li className="flex items-center gap-1.5">
                        <Check className="size-3.5 shrink-0 stroke-[2.5] text-[hsl(145,56%,27%)] dark:text-[hsl(145,45%,50%)]" />
                        At least 8 characters
                    </li>
                    <li className="flex items-center gap-1.5">
                        <Check className="size-3.5 shrink-0 stroke-[2.5] text-[hsl(145,56%,27%)] dark:text-[hsl(145,45%,50%)]" />
                        Both entries have to match
                    </li>
                </ul>

                <Button type="submit" className="h-12 w-full gap-2 lg:h-11" disabled={processing}>
                    {processing ? <LoaderCircle className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
                    Reset password
                </Button>
            </form>
        </AuthLayout>
    );
}
