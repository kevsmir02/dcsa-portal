import { Head, useForm } from '@inertiajs/react';
import { Check, LoaderCircle, Mail, Send } from 'lucide-react';
import { FormEventHandler } from 'react';

import { AuthNotice } from '@/components/auth-notice';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <AuthLayout
            title="Forgot your password?"
            description="Enter the email address on your portal account and we will send you a reset link."
            footer={
                <>
                    Remembered it? <TextLink href={route('login')}>Back to sign in</TextLink>
                </>
            }
        >
            <Head title="Forgot password" />

            <form className="flex flex-col gap-4" onSubmit={submit}>
                {status && (
                    <AuthNotice icon={Check} tone="laurel">
                        {status}
                    </AuthNotice>
                )}

                <div className="grid gap-1.5">
                    <Label htmlFor="email">Email address</Label>
                    <div className="relative">
                        <Mail className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            required
                            autoFocus
                            autoComplete="email"
                            className="h-11 pl-9 lg:h-10"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="you@dcsa.edu.ph"
                        />
                    </div>
                    <InputError message={errors.email} />
                </div>

                <Button type="submit" className="h-12 w-full gap-2 lg:h-11" disabled={processing}>
                    {processing ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}
                    Email password reset link
                </Button>
            </form>
        </AuthLayout>
    );
}
