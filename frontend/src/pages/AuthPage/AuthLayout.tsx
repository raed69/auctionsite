// AuthLayout.tsx
// Minimal layout for auth pages — no Navbar/Sidebar, just a branded header + slim footer.
// Used by both SignUpPage and LoginPage via <Outlet />.

import { Outlet, Link, useLocation } from 'react-router-dom';

export default function AuthLayout() {
  const { pathname } = useLocation();
  const isLogin = pathname === '/auth/login';

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      {/* Minimal sticky header */}
      <header className="w-full sticky top-0 bg-surface-container-low z-50 h-16 px-8 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-on-surface tracking-wider uppercase font-headline">
          The Curator
        </Link>
        <div className="hidden md:flex items-center gap-2">
          <span className="font-label text-sm text-outline">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
          </span>
          <Link
            to={isLogin ? '/auth/signup' : '/auth/login'}
            className="font-label text-sm font-bold text-primary hover:text-primary-container transition-colors underline underline-offset-4"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </Link>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-grow flex items-center justify-center p-6 md:p-12 bg-surface">
        <Outlet />
      </main>

      {/* Slim footer */}
      <footer className="w-full py-8 bg-surface-container-low border-t border-outline-variant/20">
        <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto px-8 gap-4">
          <span className="font-label text-sm text-on-surface-variant">
            © 2024 The Curator. All rights reserved.
          </span>
          <div className="flex gap-6">
            {['Privacy Policy', 'Terms of Service', 'Help Center'].map((label) => (
              <a
                key={label}
                href="#"
                className="font-label text-sm text-on-surface-variant hover:text-primary transition-colors"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
