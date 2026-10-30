import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import {
  BrowserRouter,
  Link,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom"
import {
  Bell,
  Building2,
  Check,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Eye,
  EyeOff,
  LockKeyhole,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Shield,
  User,
  X,
} from "lucide-react"
import { roleConfigs, roleIcon, roleOrder, type NavItem } from "./config"
import {
  AppStoreProvider,
  formatDate,
  normalizeText,
  type Account,
  type Role,
  useAppStore,
} from "./store"
import {
  Drawer,
  EmptyState,
  RoleBadge,
  StatusBadge,
  ToastViewport,
  toast,
} from "./ui"
import {
  AssetDetail,
  AssetList,
  DisposalPage,
  FacilityProposalPage,
  FacultyDashboard,
  HandoverDetail,
  HandoverList,
  MaintenanceDetail,
  MaintenanceForm,
  MaintenanceList,
  ProposalDetail,
  ProposalForm,
  ProposalList,
  RoomDetail,
  RoomList,
} from "./KhoaPages"

type AuthValue = {
  user: Account | null
  login: (username: string, password: string) => string | null
  completeFirstLogin: (username: string, newPassword: string) => void
  loginAsRole: (role: Role) => void
  logout: () => void
}
const AuthContext = createContext<AuthValue | null>(null)
function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error("Thiếu AuthProvider")
  return value
}
function AuthProvider({ children }: { children: ReactNode }) {
  const { state, dispatch } = useAppStore()
  const [user, setUser] = useState<Account | null>(null)
  const login = (username: string, password: string) => {
    const account = state.accounts.find(
      (a) => a.username === username || a.email === username,
    )
    if (!account || account.password !== password)
      return "Tên đăng nhập hoặc mật khẩu không đúng."
    if (account.locked)
      return "Tài khoản đã bị khóa, vui lòng liên hệ quản trị viên."
    if (account.mustChangePassword) return "__CHANGE_PASSWORD__"
    setUser(account)
    dispatch({
      type: "ADD_AUDIT",
      log: {
        id: `log-${Date.now()}`,
        actor: account.name,
        action: "Đăng nhập",
        target: "Hệ thống",
        createdAt: new Date().toISOString(),
      },
    })
    return null
  }
  const loginAsRole = (role: Role) => {
    const account = state.accounts.find((a) => a.role === role && !a.locked)
    if (account) setUser(account)
  }
  const completeFirstLogin = (username: string, newPassword: string) => {
    const account = state.accounts.find((a) => a.username === username)
    if (!account) return
    dispatch({
      type: "UPDATE_RECORD",
      collection: "accounts",
      id: account.id,
      changes: { password: newPassword, mustChangePassword: false },
    })
    setUser({ ...account, password: newPassword, mustChangePassword: false })
  }
  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        completeFirstLogin,
        loginAsRole,
        logout: () => setUser(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

function UniversityMark({ light = false }: { light?: boolean }) {
  return (
    <div className={`brand ${light ? "light" : ""}`}>
      <span className="logo-mark">
        <Building2 />
      </span>
      <span>
        <strong>UNI ASSET</strong>
        <small>Quản lý thiết bị & CSVC</small>
      </span>
    </div>
  )
}

function MiniTopbar() {
  return (
    <header className="mini-topbar">
      <Link to="/dang-nhap">
        <UniversityMark />
      </Link>
      <span>Hệ thống quản lý tài sản trường đại học</span>
    </header>
  )
}

function LoginPage() {
  const { user, login, completeFirstLogin, loginAsRole } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [firstLogin, setFirstLogin] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  if (user) return <Navigate to={roleConfigs[user.role].basePath} replace />
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const message = login(username.trim(), password)
    if (message === "__CHANGE_PASSWORD__") {
      setFirstLogin(true)
      setError("")
    } else if (message) setError(message)
    else navigate(searchParams.get("redirect") || "/")
  }
  const changePassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (
      newPassword.length < 8 ||
      !/[A-Z]/.test(newPassword) ||
      !/[a-z]/.test(newPassword) ||
      !/\d/.test(newPassword)
    )
      return setError(
        "Mật khẩu tối thiểu 8 ký tự, gồm chữ hoa, chữ thường và số.",
      )
    if (newPassword !== confirmPassword)
      return setError("Mật khẩu nhập lại không khớp.")
    completeFirstLogin(username, newPassword)
    toast("Đã đổi mật khẩu thành công")
    navigate(searchParams.get("redirect") || "/")
  }
  const demo = (role: Role) => {
    loginAsRole(role)
    navigate(roleConfigs[role].basePath)
  }
  return (
    <div className="auth-page">
      <MiniTopbar />
      <main className="auth-main">
        <section className="auth-intro">
          <span className="intro-kicker">
            <Shield size={16} /> Nền tảng quản trị tập trung
          </span>
          <h1>Quản lý tài sản minh bạch, vận hành cơ sở hiệu quả.</h1>
          <p>
            Theo dõi xuyên suốt vòng đời thiết bị và cơ sở vật chất, từ đề xuất
            đến bàn giao, bảo trì và thanh lý.
          </p>
          <div className="intro-stats">
            <div>
              <strong>Thiết bị</strong>
              <span>Quản lý trọn vòng đời tài sản</span>
            </div>
            <div>
              <strong>Cơ sở vật chất</strong>
              <span>Theo dõi phòng và phân bổ</span>
            </div>
            <div>
              <strong>Bảo trì</strong>
              <span>Chủ động cảnh báo và xử lý</span>
            </div>
          </div>
        </section>
        <section className="login-card">
          <div>
            <span className="eyebrow">Chào mừng trở lại</span>
            <h2>
              {firstLogin ? "Đổi mật khẩu lần đầu" : "Đăng nhập hệ thống"}
            </h2>
            <p>
              {firstLogin
                ? "Thiết lập mật khẩu mới trước khi tiếp tục."
                : "Sử dụng tài khoản được nhà trường cấp."}
            </p>
          </div>
          {!firstLogin ? (
            <form onSubmit={submit}>
              <label>
                Tên đăng nhập hoặc email
                <input
                  autoFocus
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value)
                    setError("")
                  }}
                  placeholder="Ví dụ: khoa1"
                />
              </label>
              <label>
                Mật khẩu
                <div className="password-field">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setError("")
                    }}
                    placeholder="Nhập mật khẩu"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </label>
              {error && <div className="form-error">{error}</div>}
              <div className="form-row">
                <label className="checkbox">
                  <input type="checkbox" /> Ghi nhớ đăng nhập
                </label>
                <button type="button" className="text-btn">
                  Quên mật khẩu?
                </button>
              </div>
              <button className="btn primary wide" type="submit">
                Đăng nhập <ChevronRight size={18} />
              </button>
            </form>
          ) : (
            <form onSubmit={changePassword}>
              <label>
                Mật khẩu mới
                <div className="password-field">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value)
                      setError("")
                    }}
                    placeholder="Tối thiểu 8 ký tự"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </label>
              <div className="strength">
                <span className={newPassword.length >= 8 ? "on" : ""} />
                <span
                  className={
                    /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)
                      ? "on"
                      : ""
                  }
                />
                <span className={/\d/.test(newPassword) ? "on" : ""} />
              </div>
              <label>
                Nhập lại mật khẩu
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    setError("")
                  }}
                />
              </label>
              {error && <div className="form-error">{error}</div>}
              <button className="btn primary wide" type="submit">
                Lưu mật khẩu và tiếp tục <ChevronRight />
              </button>
            </form>
          )}
          {!firstLogin && (
            <>
              <div className="demo-divider">
                <span>Tài khoản mẫu</span>
              </div>
              <div className="demo-roles">
                {roleOrder.map((role) => {
                  const Icon = roleIcon[role]
                  return (
                    <button
                      key={role}
                      onClick={() => demo(role)}
                      style={
                        {
                          "--role": roleConfigs[role].color,
                        } as React.CSSProperties
                      }
                    >
                      <Icon size={17} />
                      <span>{roleConfigs[role].areaName}</span>
                    </button>
                  )
                })}
              </div>
              <small className="demo-note">
                Mật khẩu chung cho tài khoản mẫu: <strong>Demo@123</strong>
              </small>
            </>
          )}
        </section>
      </main>
      <footer className="auth-footer">
        © 2026 Trường Đại học Mẫu · Trung tâm Công nghệ thông tin
      </footer>
    </div>
  )
}

function Guard({ role }: { role?: Role }) {
  const { user } = useAuth()
  const location = useLocation()
  if (!user)
    return (
      <Navigate
        to={`/dang-nhap?redirect=${encodeURIComponent(`${location.pathname}${location.search}`)}`}
        replace
      />
    )
  if (role && user.role !== role) return <Navigate to="/403" replace />
  return <Outlet />
}

function NavEntry({
  item,
  collapsed,
  closeMobile,
}: {
  item: NavItem
  collapsed: boolean
  closeMobile: () => void
}) {
  const location = useLocation()
  const [open, setOpen] = useState(
    () =>
      item.children?.some((c) => location.pathname.startsWith(c.path || "")) ||
      false,
  )
  const Icon = item.icon
  if (item.children)
    return (
      <div className="nav-group">
        <button
          className="nav-item"
          onClick={() => setOpen(!open)}
          title={collapsed ? item.label : undefined}
        >
          <Icon />
          <span>{item.label}</span>
          <ChevronDown className={open ? "rotated" : ""} />
        </button>
        {open && !collapsed && (
          <div className="subnav">
            {item.children.map((child) => (
              <NavEntry
                key={child.path}
                item={child}
                collapsed={false}
                closeMobile={closeMobile}
              />
            ))}
          </div>
        )}
      </div>
    )
  const active =
    item.path === location.pathname ||
    (item.path !== "/khoa" &&
      item.path !== "/phong-ban" &&
      item.path !== "/qlcsvc" &&
      item.path !== "/lanh-dao" &&
      item.path !== "/admin" &&
      location.pathname.startsWith(`${item.path}/`))
  if (!item.available)
    return (
      <button
        className="nav-item disabled"
        title="Sẽ triển khai ở bước tiếp theo"
        aria-disabled="true"
      >
        <Icon />
        <span>{item.label}</span>
      </button>
    )
  return (
    <Link
      className={`nav-item ${active ? "active" : ""}`}
      to={item.path!}
      onClick={closeMobile}
      title={collapsed ? item.label : undefined}
    >
      <Icon />
      <span>{item.label}</span>
      {item.count ? <b>{item.count}</b> : null}
    </Link>
  )
}

function Sidebar({
  collapsed,
  mobileOpen,
  onClose,
}: {
  collapsed: boolean
  mobileOpen: boolean
  onClose: () => void
}) {
  const { user, logout } = useAuth()
  if (!user) return null
  const config = roleConfigs[user.role]
  return (
    <>
      <div
        className={`mobile-backdrop ${mobileOpen ? "show" : ""}`}
        onClick={onClose}
      />
      <aside
        className={`sidebar ${config.darkSidebar ? "dark" : ""} ${
          collapsed ? "collapsed" : ""
        } ${mobileOpen ? "mobile-open" : ""}`}
        style={{ "--role": config.color } as React.CSSProperties}
      >
        <div className="sidebar-brand">
          <UniversityMark light={config.darkSidebar} />
          <button className="icon-btn mobile-only" onClick={onClose}>
            <X />
          </button>
        </div>
        <div className="area-label">
          <span>{config.areaName}</span>
          <RoleBadge role={user.role} />
        </div>
        <nav>
          {config.nav.map((item, i) => (
            <NavEntry
              item={item}
              collapsed={collapsed}
              closeMobile={onClose}
              key={item.path || `${item.label}-${i}`}
            />
          ))}
        </nav>
        <div className="sidebar-footer">
          <Link
            className={`nav-item ${
              location.pathname === "/ho-so" ? "active" : ""
            }`}
            to="/ho-so"
          >
            <User />
            <span>Hồ sơ</span>
          </Link>
          <button className="nav-item" onClick={logout}>
            <LogOut />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>
    </>
  )
}

type SearchResult = {
  kind: string
  code: string
  name: string
  status: string
  detail?: string
}
function QuickSearch() {
  const { state } = useAppStore()
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<SearchResult | null>(null)
  const results = useMemo(() => {
    if (query.trim().length < 2) return []
    const q = normalizeText(query)
    const pools: SearchResult[] = [
      ...state.assets.map((x) => ({
        kind: "Thiết bị",
        code: x.code,
        name: x.name,
        status: x.status,
        detail: x.assetCode,
      })),
      ...state.rooms.map((x) => ({
        kind: "Phòng",
        code: x.code,
        name: x.name,
        status: x.status,
        detail: `${x.building} · Tầng ${x.floor}`,
      })),
      ...state.purchaseProposals.map((x) => ({
        kind: "Đề xuất",
        code: x.code,
        name: x.name,
        status: x.status,
      })),
      ...state.maintenanceRequests.map((x) => ({
        kind: "Bảo trì",
        code: x.code,
        name: x.name,
        status: x.status,
      })),
      ...state.equipmentHandovers.map((x) => ({
        kind: "Bàn giao",
        code: x.code,
        name: x.name,
        status: x.status,
      })),
    ]
    return pools
      .filter((x) =>
        normalizeText(`${x.code} ${x.name} ${x.detail || ""}`).includes(q),
      )
      .slice(0, 10)
  }, [query, state])
  return (
    <div className="quick-search">
      <Search size={18} />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Tìm mã đề xuất, tài sản, phòng..."
        aria-label="Tìm kiếm nhanh"
      />
      {query && (
        <button onClick={() => setQuery("")}>
          <X size={15} />
        </button>
      )}
      {results.length > 0 && (
        <div className="search-results">
          {results.map((r, i) => (
            <button
              key={`${r.kind}-${r.code}-${i}`}
              onClick={() => {
                setSelected(r)
                setQuery("")
              }}
            >
              <span className="search-kind">{r.kind}</span>
              <span>
                <strong>{r.code}</strong>
                <small>{r.name}</small>
              </span>
              <StatusBadge status={r.status} />
            </button>
          ))}
        </div>
      )}
      <Drawer
        open={!!selected}
        title={selected?.code || ""}
        onClose={() => setSelected(null)}
      >
        {selected && (
          <div className="entity-summary">
            <span className="eyebrow">{selected.kind}</span>
            <h3>{selected.name}</h3>
            {selected.detail && <p>{selected.detail}</p>}
            <StatusBadge status={selected.status} />
            <div className="info-note">
              <CircleHelp />
              Trang chi tiết sẽ được bổ sung ở bước nghiệp vụ tiếp theo.
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}

function NotificationBell() {
  const { user } = useAuth()
  const { state, dispatch } = useAppStore()
  const [open, setOpen] = useState(false)
  if (!user) return null
  const notifications = state.notifications
    .filter((n) => n.role === user.role)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const unread = notifications.filter((n) => !n.read).length
  return (
    <div className="popover-wrap">
      <button
        className="icon-btn bell-btn"
        onClick={() => setOpen(!open)}
        aria-label={`${unread} thông báo chưa đọc`}
      >
        <Bell />
        {unread > 0 && <b>{unread}</b>}
      </button>
      {open && (
        <div className="popover notifications">
          <div className="popover-head">
            <div>
              <strong>Thông báo</strong>
              <small>{unread} chưa đọc</small>
            </div>
            {unread > 0 && (
              <button
                onClick={() =>
                  dispatch({ type: "MARK_ALL_READ", role: user.role })
                }
              >
                Đánh dấu đã đọc
              </button>
            )}
          </div>
          {notifications.slice(0, 5).map((n) => (
            <button
              className={!n.read ? "unread" : ""}
              key={n.id}
              onClick={() =>
                dispatch({ type: "MARK_NOTIFICATION_READ", id: n.id })
              }
            >
              <span className="noti-dot" />
              <span>
                <strong>{n.title}</strong>
                <small>{n.message}</small>
                <time>{formatDate(n.createdAt)}</time>
              </span>
            </button>
          ))}
          <Link
            className="popover-all"
            to="/thong-bao"
            onClick={() => setOpen(false)}
          >
            Xem tất cả thông báo <ChevronRight />
          </Link>
        </div>
      )}
    </div>
  )
}

function RoleSwitcher({ close }: { close: () => void }) {
  const { loginAsRole } = useAuth()
  const navigate = useNavigate()
  return (
    <div className="role-switcher">
      {roleOrder.map((role) => {
        const Icon = roleIcon[role]
        return (
          <button
            key={role}
            onClick={() => {
              loginAsRole(role)
              navigate(roleConfigs[role].basePath)
              close()
              toast(`Đã chuyển sang ${roleConfigs[role].areaName}`)
            }}
          >
            <span style={{ background: roleConfigs[role].color }}>
              <Icon />
            </span>
            <div>
              <strong>{roleConfigs[role].areaName}</strong>
              <small>{roleConfigs[role].label}</small>
            </div>
          </button>
        )
      })}
    </div>
  )
}

function Topbar({
  collapsed,
  setCollapsed,
  openMobile,
}: {
  collapsed: boolean
  setCollapsed: (v: boolean) => void
  openMobile: () => void
}) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [avatarOpen, setAvatarOpen] = useState(false)
  const [quickOpen, setQuickOpen] = useState(false)
  if (!user) return null
  const config = roleConfigs[user.role]
  const title =
    location.pathname === "/ho-so"
      ? "Hồ sơ"
      : location.pathname === "/thong-bao"
        ? "Thông báo"
        : config.areaName
  return (
    <header className="topbar">
      <div className="top-left">
        <button
          className="icon-btn desktop-toggle"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
        </button>
        <button className="icon-btn mobile-toggle" onClick={openMobile}>
          <Menu />
        </button>
        <div className="breadcrumb">
          <Link to={config.basePath}>{config.areaName}</Link>
          {location.pathname !== config.basePath && (
            <>
              <ChevronRight />
              <span>{title}</span>
            </>
          )}
        </div>
      </div>
      <div className="top-actions">
        <QuickSearch />
        {config.quickActions.length > 0 && (
          <div className="popover-wrap">
            <button
              className="btn primary"
              onClick={() => setQuickOpen(!quickOpen)}
            >
              <Plus /> Tạo nhanh
            </button>
            {quickOpen && (
              <div className="popover quick-menu">
                {config.quickActions.map((x) => {
                  const facultyPaths: Record<string, string> = {
                    "Đề xuất mua sắm": "/khoa/de-xuat/moi",
                    "Yêu cầu sửa chữa/bảo trì": "/khoa/bao-tri/moi",
                    "Đề xuất CSVC": "/khoa/de-xuat-csvc/moi",
                  }
                  const path =
                    user.role === "faculty" ? facultyPaths[x] : undefined
                  return (
                    <button
                      disabled={!path}
                      title={
                        !path ? "Sẽ triển khai ở bước tiếp theo" : undefined
                      }
                      key={x}
                      onClick={() => {
                        if (path) {
                          navigate(path)
                          setQuickOpen(false)
                        }
                      }}
                    >
                      <Plus />
                      {x}
                      {!path && <small>Sắp có</small>}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}
        <NotificationBell />
        <div className="popover-wrap">
          <button
            className="avatar-btn"
            onClick={() => setAvatarOpen(!avatarOpen)}
          >
            <span>
              {user.name
                .split(" ")
                .slice(-2)
                .map((x) => x[0])
                .join("")}
            </span>
            <div>
              <strong>{user.name}</strong>
              <small>{config.label}</small>
            </div>
            <ChevronDown />
          </button>
          {avatarOpen && (
            <div className="popover avatar-menu">
              <div className="user-card">
                <span>
                  {user.name
                    .split(" ")
                    .slice(-2)
                    .map((x) => x[0])
                    .join("")}
                </span>
                <div>
                  <strong>{user.name}</strong>
                  <small>{user.email}</small>
                </div>
              </div>
              <Link to="/ho-so" onClick={() => setAvatarOpen(false)}>
                <User />
                Hồ sơ cá nhân
              </Link>
              <div className="menu-label">Chuyển vai trò (demo)</div>
              <RoleSwitcher close={() => setAvatarOpen(false)} />
              <button
                className="logout-row"
                onClick={() => {
                  logout()
                  navigate("/dang-nhap")
                }}
              >
                <LogOut />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

function AppShell({ children }: { children?: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  useEffect(() => {
    const fn = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false)
    document.addEventListener("keydown", fn)
    return () => document.removeEventListener("keydown", fn)
  }, [])
  return (
    <div className={`app-shell ${collapsed ? "is-collapsed" : ""}`}>
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <div className="app-column">
        <Topbar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          openMobile={() => setMobileOpen(true)}
        />
        <main className="content">{children ?? <Outlet />}</main>
      </div>
    </div>
  )
}

function RoleHome() {
  const { user } = useAuth()
  if (!user) return null
  const config = roleConfigs[user.role]
  const Icon = roleIcon[user.role]
  return (
    <div className="welcome-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Không gian làm việc</span>
          <h1>Xin chào, {user.name.split(" ").slice(-2).join(" ")}</h1>
          <p>
            Bạn đang truy cập {config.areaName.toLowerCase()} với quyền{" "}
            {config.label.toLowerCase()}.
          </p>
        </div>
        <RoleBadge role={user.role} />
      </div>
      <section
        className="welcome-card"
        style={{ "--role": config.color } as React.CSSProperties}
      >
        <div className="welcome-icon">
          <Icon />
        </div>
        <div>
          <h2>Nền tảng đã sẵn sàng</h2>
          <p>
            Khung điều hướng, dữ liệu mẫu và các thành phần dùng chung đã được
            thiết lập. Các phân hệ nghiệp vụ sẽ được bổ sung ở bước tiếp theo.
          </p>
          <div className="ready-list">
            <span>
              <Check /> Điều hướng theo vai trò
            </span>
            <span>
              <Check /> Tìm kiếm dữ liệu tập trung
            </span>
            <span>
              <Check /> Thông báo đồng bộ
            </span>
          </div>
        </div>
      </section>
      <div className="scope-note">
        <CircleHelp />
        <div>
          <strong>Phạm vi bước hiện tại</strong>
          <p>
            Các mục nghiệp vụ trong sidebar đang tạm khóa để không dựng trước
            nội dung của các prompt tiếp theo.
          </p>
        </div>
      </div>
    </div>
  )
}
function ProfilePage() {
  const { user } = useAuth()
  const { state, dispatch } = useAppStore()
  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [phone, setPhone] = useState(user?.phone || "")
  const [passwords, setPasswords] = useState({ old: "", next: "", confirm: "" })
  const [error, setError] = useState("")
  if (!user) return null
  const unit = [...state.faculties, ...state.departments].find(
    (x) => x.id === user.unitId,
  )
  const saveInfo = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return setError("Email không hợp lệ.")
    dispatch({
      type: "UPDATE_RECORD",
      collection: "accounts",
      id: user.id,
      changes: { name, email, phone },
    })
    setError("")
    toast("Đã cập nhật thông tin cá nhân")
  }
  const savePassword = () => {
    if (passwords.old !== user.password)
      return setError("Mật khẩu hiện tại không đúng.")
    if (
      passwords.next.length < 8 ||
      !/[A-Z]/.test(passwords.next) ||
      !/[a-z]/.test(passwords.next) ||
      !/\d/.test(passwords.next)
    )
      return setError(
        "Mật khẩu tối thiểu 8 ký tự, gồm chữ hoa, chữ thường và số.",
      )
    if (passwords.next !== passwords.confirm)
      return setError("Mật khẩu nhập lại không khớp.")
    dispatch({
      type: "UPDATE_RECORD",
      collection: "accounts",
      id: user.id,
      changes: { password: passwords.next },
    })
    setPasswords({ old: "", next: "", confirm: "" })
    setError("")
    toast("Đã đổi mật khẩu thành công")
  }
  return (
    <div>
      <div className="page-heading">
        <div>
          <span className="eyebrow">Tài khoản</span>
          <h1>Hồ sơ cá nhân</h1>
          <p>Thông tin nhận diện và quyền truy cập của bạn.</p>
        </div>
      </div>
      <div className="profile-layout">
        <section className="card">
          <div className="profile-summary">
            <div className="profile-avatar">
              {user.name
                .split(" ")
                .slice(-2)
                .map((x) => x[0])
                .join("")}
            </div>
            <div>
              <h2>Thông tin cá nhân</h2>
              <RoleBadge role={user.role} />
            </div>
          </div>
          <div className="form-grid">
            <label className="field">
              <span>Họ và tên</span>
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="field">
              <span>Email</span>
              <input value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label className="field">
              <span>Số điện thoại</span>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </label>
            <label className="field">
              <span>Tên đăng nhập</span>
              <input value={user.username} disabled />
            </label>
            <label className="field">
              <span>Vai trò</span>
              <input value={roleConfigs[user.role].label} disabled />
            </label>
            <label className="field">
              <span>Đơn vị</span>
              <input
                value={unit?.name || roleConfigs[user.role].areaName}
                disabled
              />
            </label>
          </div>
          {error && <p className="form-error">{error}</p>}
          <button className="btn primary" onClick={saveInfo}>
            Lưu thông tin
          </button>
        </section>
        <section className="card">
          <h3>Đổi mật khẩu</h3>
          <div className="password-form">
            <label className="field">
              <span>Mật khẩu hiện tại</span>
              <input
                type="password"
                value={passwords.old}
                onChange={(e) =>
                  setPasswords({ ...passwords, old: e.target.value })
                }
              />
            </label>
            <label className="field">
              <span>Mật khẩu mới</span>
              <input
                type="password"
                value={passwords.next}
                onChange={(e) =>
                  setPasswords({ ...passwords, next: e.target.value })
                }
              />
            </label>
            <div className="strength">
              <span className={passwords.next.length >= 8 ? "on" : ""} />
              <span
                className={
                  /[a-z]/.test(passwords.next) && /[A-Z]/.test(passwords.next)
                    ? "on"
                    : ""
                }
              />
              <span className={/\d/.test(passwords.next) ? "on" : ""} />
            </div>
            <label className="field">
              <span>Nhập lại mật khẩu mới</span>
              <input
                type="password"
                value={passwords.confirm}
                onChange={(e) =>
                  setPasswords({ ...passwords, confirm: e.target.value })
                }
              />
            </label>
            <button className="btn secondary" onClick={savePassword}>
              Đổi mật khẩu
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
function NotificationsPage() {
  const { user } = useAuth()
  const { state, dispatch } = useAppStore()
  if (!user) return null
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const tab = params.get("tab") || "tat-ca"
  const category = params.get("loai") || ""
  const kindOf = (title: string) =>
    /bàn giao|phiếu/i.test(title)
      ? "Bàn giao"
      : /bảo trì|sửa chữa/i.test(title)
        ? "Bảo trì"
        : /CSVC|phòng/i.test(title)
          ? "CSVC"
          : /hệ thống/i.test(title)
            ? "Hệ thống"
            : "Đề xuất"
  const list = state.notifications
    .filter((n) => n.role === user.role)
    .filter((n) => tab !== "chua-doc" || !n.read)
    .filter((n) => !category || kindOf(n.title) === category)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const grouped = list.reduce<Record<string, typeof list>>((groups, item) => {
    const date = formatDate(item.createdAt)
    groups[date] = [...(groups[date] || []), item]
    return groups
  }, {})
  const notificationPath = (title: string) => {
    const code = title.match(/(?:DX|BG|BGP|YC|CS|TS)-\d{4}/)?.[0]
    if (!code) return roleConfigs[user.role].basePath
    if (user.role !== "faculty") return roleConfigs[user.role].basePath
    if (code.startsWith("BG")) return `/khoa/ban-giao/${code}`
    if (code.startsWith("YC")) return `/khoa/bao-tri/${code}`
    if (code.startsWith("CS")) return `/khoa/de-xuat-csvc/${code}`
    if (code.startsWith("TS")) return `/khoa/thiet-bi/${code}`
    return `/khoa/de-xuat/${code}`
  }
  return (
    <div>
      <div className="page-heading">
        <div>
          <span className="eyebrow">Trung tâm cập nhật</span>
          <h1>Thông báo</h1>
          <p>
            Theo dõi các thay đổi và công việc liên quan đến vai trò của bạn.
          </p>
        </div>
        <button
          className="btn secondary"
          onClick={() => dispatch({ type: "MARK_ALL_READ", role: user.role })}
        >
          Đánh dấu tất cả đã đọc
        </button>
      </div>
      <div className="notification-tools">
        <div className="tabs">
          <button
            className={tab === "tat-ca" ? "active" : ""}
            onClick={() => setParams(category ? { loai: category } : {})}
          >
            Tất cả
          </button>
          <button
            className={tab === "chua-doc" ? "active" : ""}
            onClick={() =>
              setParams(
                category
                  ? { tab: "chua-doc", loai: category }
                  : { tab: "chua-doc" },
              )
            }
          >
            Chưa đọc
          </button>
        </div>
        <select
          value={category}
          onChange={(e) => {
            const next = new URLSearchParams(params)
            e.target.value
              ? next.set("loai", e.target.value)
              : next.delete("loai")
            setParams(next)
          }}
        >
          <option value="">Tất cả loại</option>
          {["Đề xuất", "Bàn giao", "Bảo trì", "CSVC", "Hệ thống"].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </div>
      {!list.length ? (
        <EmptyState
          title="Bạn chưa có thông báo nào"
          description="Các cập nhật mới sẽ xuất hiện tại đây."
        />
      ) : (
        Object.entries(grouped).map(([date, notifications]) => (
          <section className="notification-group" key={date}>
            <h3>{date}</h3>
            <div className="notification-page">
              {notifications?.map((n) => (
                <button
                  className={!n.read ? "unread" : ""}
                  key={n.id}
                  onClick={() => {
                    dispatch({ type: "MARK_NOTIFICATION_READ", id: n.id })
                    navigate(notificationPath(`${n.title} ${n.message}`))
                  }}
                >
                  <span className="noti-icon">
                    <Bell />
                  </span>
                  <span>
                    <strong>{n.title}</strong>
                    <p>{n.message}</p>
                    <time>
                      {kindOf(n.title)} · {formatDate(n.createdAt)}
                    </time>
                  </span>
                  {!n.read && <i />}
                </button>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  )
}
function ErrorPage({ code }: { code: "403" | "404" }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const content = (
    <div className="error-page">
      {code === "403" ? (
        <span className="error-illustration">
          <LockKeyhole />
        </span>
      ) : (
        <span>{code}</span>
      )}
      <h1>
        {code === "403"
          ? "Bạn không có quyền truy cập trang này"
          : "Không tìm thấy trang"}
      </h1>
      <p>
        {code === "403"
          ? "Khu vực này không thuộc vai trò hiện tại của bạn."
          : "Địa chỉ bạn truy cập không tồn tại hoặc đã được thay đổi."}
      </p>
      {code === "404" && user && (
        <div className="error-search">
          <Search />
          <input placeholder="Tìm mã đề xuất, tài sản, phòng..." />
        </div>
      )}
      <div className="error-actions">
        <button
          className="btn primary"
          onClick={() =>
            navigate(user ? roleConfigs[user.role].basePath : "/dang-nhap")
          }
        >
          {user
            ? code === "403"
              ? "Về trang chủ của tôi"
              : "Về trang chủ"
            : "Đăng nhập"}
        </button>
        {user && code === "403" && (
          <button className="btn secondary" onClick={() => navigate(-1)}>
            <ArrowLeft /> Quay lại
          </button>
        )}
      </div>
    </div>
  )
  if (!user)
    return (
      <div className="plain-page">
        <MiniTopbar />
        {content}
      </div>
    )
  return content
}

function RoleAreaFallback({ expectedRole }: { expectedRole: Role }) {
  const { user } = useAuth()
  const location = useLocation()
  if (!user)
    return (
      <Navigate
        to={`/dang-nhap?redirect=${encodeURIComponent(`${location.pathname}${location.search}`)}`}
        replace
      />
    )
  if (user.role !== expectedRole) return <Navigate to="/403" replace />
  return (
    <AppShell>
      <ErrorPage code="404" />
    </AppShell>
  )
}

function ConditionalError({ code }: { code: "403" | "404" }) {
  const { user } = useAuth()
  if (!user) return <ErrorPage code={code} />
  return (
    <AppShell>
      <ErrorPage code={code} />
    </AppShell>
  )
}

function RootRedirect() {
  const { user } = useAuth()
  return (
    <Navigate
      to={user ? roleConfigs[user.role].basePath : "/dang-nhap"}
      replace
    />
  )
}
function AppRoutes() {
  return (
    <Routes>
      <Route path="/dang-nhap" element={<LoginPage />} />
      <Route path="/" element={<RootRedirect />} />
      {roleOrder.map((role) => (
        <Route key={`${role}-home`} element={<Guard role={role} />}>
          <Route element={<AppShell />}>
            <Route
              path={roleConfigs[role].basePath}
              element={role === "faculty" ? <FacultyDashboard /> : <RoleHome />}
            />
            {role === "faculty" && (
              <>
                <Route path="/khoa/de-xuat" element={<ProposalList />} />
                <Route path="/khoa/de-xuat/moi" element={<ProposalForm />} />
                <Route
                  path="/khoa/de-xuat/:id/sua"
                  element={<ProposalForm />}
                />
                <Route path="/khoa/de-xuat/:id" element={<ProposalDetail />} />
                <Route path="/khoa/thiet-bi" element={<AssetList />} />
                <Route path="/khoa/thiet-bi/:id" element={<AssetDetail />} />
                <Route path="/khoa/ban-giao" element={<HandoverList />} />
                <Route path="/khoa/ban-giao/:id" element={<HandoverDetail />} />
                <Route path="/khoa/bao-tri" element={<MaintenanceList />} />
                <Route path="/khoa/bao-tri/moi" element={<MaintenanceForm />} />
                <Route
                  path="/khoa/bao-tri/:id"
                  element={<MaintenanceDetail />}
                />
                <Route path="/khoa/thanh-ly" element={<DisposalPage />} />
                <Route path="/khoa/phong" element={<RoomList />} />
                <Route path="/khoa/phong/:id" element={<RoomDetail />} />
                <Route
                  path="/khoa/de-xuat-csvc"
                  element={<FacilityProposalPage />}
                />
                <Route
                  path="/khoa/de-xuat-csvc/moi"
                  element={<FacilityProposalPage mode="form" />}
                />
                <Route
                  path="/khoa/de-xuat-csvc/:id"
                  element={<FacilityProposalPage mode="detail" />}
                />
              </>
            )}
          </Route>
        </Route>
      ))}
      {roleOrder.map((role) => (
        <Route
          key={`${role}-fallback`}
          path={`${roleConfigs[role].basePath}/*`}
          element={<RoleAreaFallback expectedRole={role} />}
        />
      ))}
      <Route element={<Guard />}>
        <Route element={<AppShell />}>
          <Route path="/ho-so" element={<ProfilePage />} />
          <Route path="/thong-bao" element={<NotificationsPage />} />
        </Route>
      </Route>
      <Route path="/403" element={<ConditionalError code="403" />} />
      <Route path="*" element={<ConditionalError code="404" />} />
    </Routes>
  )
}
export default function App() {
  return (
    <AppStoreProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <ToastViewport />
        </BrowserRouter>
      </AuthProvider>
    </AppStoreProvider>
  )
}
