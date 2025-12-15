"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface AlertDialogContentProps {
  children: React.ReactNode;
  className?: string;
}

interface AlertDialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface AlertDialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

interface AlertDialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface AlertDialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

interface AlertDialogActionProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

interface AlertDialogCancelProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const AlertDialog = ({ open, onOpenChange, children }: AlertDialogProps) => {
  if (!open) return null;

  return (
    <div className="alert-dialog-overlay" onClick={() => onOpenChange(false)}>
      <div
        className="alert-dialog-container"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

const AlertDialogContent = ({
  children,
  className,
}: AlertDialogContentProps) => {
  return (
    <div className={cn("alert-dialog-content", className)}>{children}</div>
  );
};

const AlertDialogHeader = ({ children, className }: AlertDialogHeaderProps) => {
  return (
    <div className={cn("alert-dialog-header", className)}>{children}</div>
  );
};

const AlertDialogFooter = ({ children, className }: AlertDialogFooterProps) => {
  return (
    <div className={cn("alert-dialog-footer", className)}>{children}</div>
  );
};

const AlertDialogTitle = ({ children, className }: AlertDialogTitleProps) => {
  return <h2 className={cn("alert-dialog-title", className)}>{children}</h2>;
};

const AlertDialogDescription = ({
  children,
  className,
}: AlertDialogDescriptionProps) => {
  return (
    <p className={cn("alert-dialog-description", className)}>{children}</p>
  );
};

const AlertDialogAction = ({
  children,
  className,
  ...props
}: AlertDialogActionProps) => {
  return (
    <button className={cn("alert-dialog-action", className)} {...props}>
      {children}
    </button>
  );
};

const AlertDialogCancel = ({
  children,
  className,
  ...props
}: AlertDialogCancelProps) => {
  return (
    <button className={cn("alert-dialog-cancel", className)} {...props}>
      {children}
    </button>
  );
};

export {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
