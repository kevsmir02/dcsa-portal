import { Head, useForm, usePage } from '@inertiajs/react';
import { Check, LoaderCircle, Mail, RefreshCw } from 'lucide-react';
import { FormEventHandler } from 'react';

import { AuthNotice } from '@/components/auth-notice';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/auth-layout';
import { type SharedData } from '@/types';

export default function VerifyEmail({ status }: { status?: string }) {
    const { auth, school } = usePage<SharedData>().props;
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <AuthLayout
            title="Verify your email address"
            description="Open the link we just emailed you to finish setting up your portal account."
            footer={
                <>
                    Wrong address, or no email after a few minutes? Contact the registrar
                    {school.email ? ` at ${school.email}` : ''}, or{' '}
                    <TextLink href={route('logout')} method="post" as="button">
                        log out
                    </TextLink>
                    .
                </>
            }
        >
            <Head title="Email verification" />

            <form onSubmit={submit} className="flex flex-col gap-4">
                {status === 'verification-link-sent' && (
                    <AuthNotice icon={Check} tone="laurel">
                        A new verification link has been sent to your email address.
                    </AuthNotice>
                )}

                <div className="flex flex-col items-center gap-4 rounded-lg border p-7 text-center">
                    <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-xl">
                        <Mail className="size-[22px]" />
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        We sent a verification link to
                        <br />
                        <span className="text-foreground font-semibold">{auth.user?.email}</span>
                    </p>
                    <Button type="submit" variant="secondary" className="gap-2" disabled={processing}>
                        {processing ? <LoaderCircle className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
                        Resend verification email
                    </Button>
                </div>
            </form>
        </AuthLayout>
    );
}
