"use client";

import { Toaster } from "react-hot-toast";
import { CircleX, CircleCheck } from "lucide-react";

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        success: {
          icon: <CircleCheck className="w-4 h-4" />,
          style: {
            borderRadius: '20px',
            background: '#85cb33',
            color: '#fff',
          },
        },
        error: {
          icon: <CircleX className="w-4 h-4" />,
          style: {
            borderRadius: '20px',
            background: 'red',
            color: '#fff',
          },
        },
      }}
    />
  );
}
