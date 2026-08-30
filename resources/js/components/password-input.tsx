import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, Lock, type LucideIcon } from 'lucide-react';
import { forwardRef, useState, type ComponentProps } from 'react';

/**
 * A password field with the leading icon and the show/hide eye. Every screen that
 * asks for a password uses this one, so they all behave the same way.
 */
export const PasswordInput = forwardRef<HTMLInputElement, ComponentProps<'input'> & { icon?: LucideIcon }>(
    ({ className, icon: Icon = Lock, ...props }, ref) => {
        const [visible, setVisible] = useState(false);

        return (
            <div className="relative">
                <Icon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input ref={ref} {...props} type={visible ? 'text' : 'password'} className={cn('pr-10 pl-9', className)} />
                <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setVisible((shown) => !shown)}
                    aria-label={visible ? 'Hide password' : 'Show password'}
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                >
                    {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
            </div>
        );
    },
);
PasswordInput.displayName = 'PasswordInput';
