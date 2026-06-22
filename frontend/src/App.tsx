import { createContext, FormEvent, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { Navigate, NavLink, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { API_URL, IS_DEMO_MODE, TOKEN_STORAGE_KEY, apiRequest } from "./api";
import { CrudPage } from "./CrudPage";
import { DashboardPage } from "./DashboardPage";
import { AuditPage } from "./AuditPage";
import { ImportPage } from "./ImportPage";
import { LeadDetailsPage } from "./LeadDetailsPage";
import { LeadOpsPage } from "./LeadOpsPage";
import { ReferencesPage } from "./ReferencesPage";
import { ReportDetailsPage, ReportsPage } from "./ReportsPage";
import { demoLogin, demoMe } from "./demoApi";
import { resourceConfigs } from "./resourceConfigs";
import type { RoleCode, User } from "./types";

const pages = [
  { path: "/dashboard", title: "Главная", roles: ["admin", "director", "analyst"] },
  { path: "/leadops", title: "Лиды", roles: ["admin", "director", "analyst"] },
  { path: "/clients", title: "Клиенты", roles: ["admin", "client_manager"] },
  { path: "/projects", title: "Проекты", roles: ["admin", "project_manager", "director", "analyst"] },
  { path: "/tasks", title: "Задачи", roles: ["admin", "project_manager", "director", "analyst"] },
  { path: "/finance", title: "Финансы", roles: ["admin", "finance", "director", "analyst"] },
  { path: "/reports", title: "Отчеты", roles: ["admin", "director", "analyst"] },
  { path: "/admin/import", title: "Импорт", roles: ["admin", "analyst"] },
  { path: "/admin/audit", title: "Журнал", roles: ["admin", "analyst"] },
  { path: "/admin/references", title: "Справочники", roles: ["admin"] }
] as const;

type AuthContextValue = {
  isLoading: boolean;
  token: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}

function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(token));

  const logout = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    if (IS_DEMO_MODE) {
      setUser(demoMe().user);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    fetch(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Сессия истекла. Войдите снова.");
        }

        return response.json() as Promise<{ user: User }>;
      })
      .then((data) => {
        if (isMounted) {
          setUser(data.user);
        }
      })
      .catch(() => {
        if (isMounted) {
          logout();
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoading,
      token,
      user,
      login: async (email, password) => {
        if (IS_DEMO_MODE) {
          const data = await demoLogin(email, password);
          localStorage.setItem(TOKEN_STORAGE_KEY, data.accessToken);
          setToken(data.accessToken);
          setUser(data.user);
          return;
        }

        const response = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message ?? "Не удалось войти в систему");
        }

        localStorage.setItem(TOKEN_STORAGE_KEY, data.accessToken);
        setToken(data.accessToken);
        setUser(data.user);
      },
      logout
    }),
    [isLoading, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function PageByPath({ path, token, user }: { path: string; token: string | null; user: User | null }) {
  if (path === "/dashboard") {
    return <DashboardPage token={token} />;
  }

  if (path === "/leadops") {
    return <LeadOpsPage token={token} />;
  }

  if (path === "/reports") {
    return <ReportsPage token={token} />;
  }

  if (path === "/admin/import") {
    return <ImportPage token={token} />;
  }

  if (path === "/admin/audit") {
    return <AuditPage token={token} />;
  }

  const key = path.replace("/", "");
  if (key in resourceConfigs) {
    const writeRolesByKey: Record<string, RoleCode[]> = {
      clients: ["admin", "client_manager"],
      projects: ["admin", "project_manager"],
      tasks: ["admin", "project_manager"],
      finance: ["admin", "finance"]
    };
    const readOnly = user ? !writeRolesByKey[key]?.includes(user.role.code) : true;
    return <CrudPage config={resourceConfigs[key]} token={token} readOnly={readOnly} />;
  }

  if (path === "/admin/references") {
    return <ReferencesPage token={token} />;
  }

  return <PlaceholderPage title={pages.find((page) => page.path === path)?.title ?? "Раздел"} />;
}

function AccessDeniedPage() {
  return (
    <section className="page">
      <p className="eyebrow">403</p>
      <h1>Доступ запрещен</h1>
      <p>У вашей роли нет доступа к этому разделу. Выберите доступный пункт меню или войдите под другой учетной записью.</p>
    </section>
  );
}

function NotFoundPage() {
  return (
    <section className="page">
      <p className="eyebrow">404</p>
      <h1>Страница не найдена</h1>
      <p>Такого раздела нет в системе. Используйте боковое меню для перехода к рабочим модулям.</p>
    </section>
  );
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const location = useLocation();

  if (auth.isLoading) {
    return <div className="loading">Загрузка...</div>;
  }

  if (!auth.user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin12345");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const requestedPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
  const from = IS_DEMO_MODE ? (requestedPath && requestedPath !== "/" ? requestedPath : "/leadops") : requestedPath ?? "/dashboard";

  if (auth.user) {
    return <Navigate to={IS_DEMO_MODE ? "/leadops" : "/dashboard"} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await auth.login(email, password);
      navigate(from, { replace: true });
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Не удалось войти в систему");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-panel">
        <p className="eyebrow">ООО «7 Красных линий»</p>
        <h1>Информационная система аналитической отчетности</h1>
        <p>Оперативные показатели, проекты и отчеты в едином рабочем пространстве.</p>
        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" />
          </label>
          <label>
            Пароль
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              autoComplete="current-password"
            />
          </label>
          {error ? <div className="form-error">{error}</div> : null}
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Вход..." : "Войти"}
          </button>
        </form>
      </section>
    </main>
  );
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <section className="page">
      <p className="eyebrow">Раздел системы</p>
      <h1>{title}</h1>
      <p>Модуль доступен в навигации и готов к дальнейшему развитию по плану проекта.</p>
    </section>
  );
}

function Layout() {
  const auth = useAuth();
  const navigate = useNavigate();
  const availablePages = pages.filter((page) => auth.user && (page.roles as readonly RoleCode[]).includes(auth.user.role.code));

  function handleLogout() {
    auth.logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">7</span>
          <div>
            <strong>7 Красных линий</strong>
            <span>Аналитическая отчетность</span>
          </div>
        </div>
        <nav>
          {availablePages.map((page) => (
            <NavLink key={page.path} to={page.path}>
              {page.title}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="content">
        <header className="topbar">
          <span>ООО «7 Красных линий»</span>
          <div className="userbar">
            <span>
              {auth.user?.fullName} · {auth.user?.role.name}
            </span>
            <button type="button" onClick={handleLogout}>
              Выйти
            </button>
          </div>
        </header>
        <Routes>
          {availablePages.map((page) => (
            <Route key={page.path} path={page.path.replace("/", "")} element={<PageByPath path={page.path} token={auth.token} user={auth.user} />} />
          ))}
          <Route
            path="reports/:id"
            element={auth.user && ["admin", "director", "analyst"].includes(auth.user.role.code) ? <ReportDetailsPage token={auth.token} /> : <AccessDeniedPage />}
          />
          <Route
            path="leadops/leads/:id"
            element={auth.user && ["admin", "director", "analyst"].includes(auth.user.role.code) ? <LeadDetailsPage token={auth.token} /> : <AccessDeniedPage />}
          />
          <Route path="admin" element={<Navigate to="/admin/references" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
