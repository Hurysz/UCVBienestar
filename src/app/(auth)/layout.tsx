import { Logo } from '@/components/logo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg text-center mb-8">
        <div className="flex justify-center mb-4">
          <Logo />
        </div>
        {children}
      </div>
    </div>
  );
}
