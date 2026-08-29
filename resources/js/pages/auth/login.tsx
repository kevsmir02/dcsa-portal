import { Head, useForm } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle, Lock, LogIn, User } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
    [key: string]: string | boolean;
}

export default function Login({ status, canResetPassword }: { status?: string; canResetPassword: boolean }) {
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });
    const [showPassword, setShowPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    return (
        <AuthLayout title="Sign in to your account" description="Use the credentials issued by the registrar.">
            <Head title="Sign in" />

            {status && (
                <div className="mb-4 rounded-md border border-[hsl(145,56%,27%)]/25 bg-[hsl(145,56%,27%)]/8 px-3 py-2 text-center text-sm font-medium text-[hsl(145,56%,24%)]">
                    {status}
                </div>
            )}

            <form className="flex flex-col gap-4" onSubmit={submit}>
                <div className="grid gap-1.5">
                    <Label htmlFor="email">Email address</Label>
                    <div className="relative">
                        <User className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                        <Input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            className="pl-9"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="you@dcsa.edu.ph"
                        />
                    </div>
                    <InputError message={errors.email} />
                </div>

                <div className="grid gap-1.5">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                        <Lock className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            className="pr-10 pl-9"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Password"
                        />
                        <button
                            type="button"
                            tabIndex={-1}
                            onClick={() => setShowPassword((shown) => !shown)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                        >
                            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                    </div>
                    <InputError message={errors.password} />
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                        <Checkbox
                            id="remember"
                            name="remember"
                            tabIndex={3}
                            checked={data.remember}
                            onCheckedChange={(checked) => setData('remember', checked === true)}
                        />
                        <span>Remember me</span>
                    </label>

                    {canResetPassword && (
                        <TextLink href={route('password.request')} className="text-sm" tabIndex={5}>
                            Forgot password?
                        </TextLink>
                    )}
                </div>

                <Button type="submit" className="mt-1 w-full gap-2" size="lg" tabIndex={4} disabled={processing}>
                    {processing ? <LoaderCircle className="size-4 animate-spin" /> : <LogIn className="size-4" />}
                    Login
                </Button>
            </form>
        </AuthLayout>
    );
}
