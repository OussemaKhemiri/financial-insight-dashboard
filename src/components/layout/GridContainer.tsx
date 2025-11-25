import { ReactNode } from 'react';

interface GridContainerProps {
    children: ReactNode;
}

export default function GridContainer({ children }: GridContainerProps) {
    return (
        <div className="flex flex-col w-full min-h-screen p-4 bg-slate-50 gap-8">
            {children}
        </div>
    );
}