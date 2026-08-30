import { Head, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle, ShieldCheck } from 'lucide-react';
import { FormEventHandler } from 'react';

import { AuthNotice } from '@/components/auth-notice';
import InputError from '@/components/input-error';
import { PasswordInput } from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { type SharedData } from '@/types';

export default function ConfirmPassword() {
    const { auth } = usePage<SharedData>().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout
            title="Confirm your password"
            description="This is a secure area of the portal. Confirm your password before continuing."
            footer={
                <>
                    Not you?{' '}
                    <TextLink href={route('logout')} method="post" as="button">
                        Log out
                    </TextLink>
                </>
            }
        >
            <Head title="Confirm password" />

            <form className="flex flex-col gap-4" onSubmit={submit}>
                <AuthNotice icon={ShieldCheck} tone="navy">
                    You are signed in as <span className="font-semibold">{auth.user?.name}</span>. Confirming again keeps grade records safe on a
                    shared computer.
                </AuthNotice>

                <div className="grid gap-1.5">
                    <Label htmlFor="password">Password</Label>
                    <PasswordInput
                        id="password"
                        name="password"
                        required
                        autoFocus
                        autoComplete="current-password"
                        className="h-11 lg:h-10"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="Password"
                    />
                    <InputError message={errors.password} />
                </div>

                <Button type="submit" className="h-12 w-full gap-2 lg:h-11" disabled={processing}>
                    {processing ? <LoaderCircle className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
                    Confirm password
                </Button>
            </form>
        </AuthLayout>
    );
}
