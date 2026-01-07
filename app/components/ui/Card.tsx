export const Card = ({ children, className = "" }: { children?: React.ReactNode; className?: string }) => {
    return (
        <div className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 ${className}`}>
            {children}
        </div>
    );
};