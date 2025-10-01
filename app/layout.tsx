import "./globals.css";
import { LangProvider } from "./(components)/LangProvider";
import LangToggle from "./LangToggle";

export const metadata = { title: "CheckMyDashboard" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LangProvider>
          <header className="header">
            <div className="container header-inner">
              <div className="header-left">
                <a href="/" className="btn" style={{ width:"auto" }}>Home</a>
                <a href="/dashboard" className="link">Dashboard</a>
                <a href="/login" className="link">Login</a>
              </div>
              <LangToggle />
            </div>
          </header>
          {children}
        </LangProvider>
      </body>
    </html>
  );
}
