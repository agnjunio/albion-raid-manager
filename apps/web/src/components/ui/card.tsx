import React from "react";

export default function Card({
  title,
  actions,
  children,
  className,
}: {
  title?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const hasHeader = !!title || !!actions;

  return (
    <div className={`p-4 rounded-lg bg-primary-gray-800/25 ${className}`}>
      {hasHeader && (
        <div className="flex justify-between items-center mb-4">
          {title && <h1 className="text-lg font-medium">{title}</h1>}
          {actions && <div>{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
