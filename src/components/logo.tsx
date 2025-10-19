"use client";

import Link from 'next/link';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/dashboard" className={cn('flex flex-col items-center gap-2 text-foreground', className)}>
      <Image src="/ucv-logo.png" alt="UCV Logo" width={160} height={160} />
      <span className="text-xl font-bold font-headline">UCV Bienestar</span>
    </Link>
  );
}
