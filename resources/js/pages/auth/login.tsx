import { Head, useForm } from '@inertiajs/react';
import { Check, LoaderCircle, LogIn, User } from 'lucide-react';
import { FormEventHandler } from 'react';

import { AuthNotice } from '@/components/auth-notice';
import InputError from '@/components/input-error';
import { PasswordInput } from '@/components/password-input';
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

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    return (
        <AuthLayout
            title="Sign in to your account"
            description="Use the credentials issued by the registrar."
            footer={
                <>
                    First time here, or password just reset? Sign in with your one-time password &mdash;{' '}
                    <span className="text-foreground font-semibold">the xxxx-xxxx code from the registrar</span> &mdash; and set your own.
                </>
            }
        >
            <Head title="Sign in" />

            <form className="flex flex-col gap-4" onSubmit={submit}>
                {status && (
                    <AuthNotice icon={Check} tone="laurel">
                        {status}
                    </AuthNotice>
                )}

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
                            className="h-11 pl-9 lg:h-10"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="you@dcsa.edu.ph"
                        />
                    </div>
                    <InputError message={errors.email} />
                </div>

                <div className="grid gap-1.5">
                    <Label htmlFor="password">Password</Label>
                    <PasswordInput
                        id="password"
                        required
                        tabIndex={2}
                        autoComplete="current-password"
                        className="h-11 lg:h-10"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="Password"
                    />
                    <InputError message={errors.password} />
                </div>

                <div className="flex min-h-11 items-center justify-between lg:min-h-0">
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

                <Button type="submit" className="h-12 w-full gap-2 lg:h-11" tabIndex={4} disabled={processing}>
                    {processing ? <LoaderCircle className="size-4 animate-spin" /> : <LogIn className="size-4" />}
                    Login
                </Button>
            </form>
        </AuthLayout>
    );
}
