import type { PropsWithChildren, HTMLAttributes } from 'react';

export default function Section({ children, className, ...props }: PropsWithChildren<HTMLAttributes<HTMLElement>>) {

    const classes = "w-full container py-8";
    if (className) {
        className = `${classes} ${className}`;
    }

    return <section className={className ?? classes} {...props}>{children}</section>;
}
