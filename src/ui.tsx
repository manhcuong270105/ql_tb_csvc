import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Inbox,
  X,
  type LucideIcon,
} from "lucide-react"
import type { Role } from "./store"
import { roleConfigs } from "./config"

export function Badge({
  children,
  tone = "gray",
}: {
  children: ReactNode
  tone?: string
}) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}
export function StatusBadge({ status }: { status: string }) {
  const tone = /từ chối|hỏng|khẩn|khóa|ngừng/i.test(status)
    ? "red"
    : /duyệt|hoàn thành|sẵn sàng|hoạt động/i.test(status)
      ? "green"
      : /bảo trì|sửa chữa/i.test(status)
        ? "purple"
        : /chờ phê duyệt|chờ xác nhận|xuống cấp/i.test(status)
          ? "yellow"
          : /đã gửi|đang|sử dụng|tiếp nhận/i.test(status)
            ? "blue"
            : "gray"
  return (
    <Badge tone={tone}>
      <span className="badge-dot" />
      {status}
    </Badge>
  )
}
export function RoleBadge({ role }: { role: Role }) {
  return (
    <span
      className="role-badge"
      style={{ "--role": roleConfigs[role].color } as React.CSSProperties}
    >
      {roleConfigs[role].label}
    </span>
  )
}
export function RoomTypeBadge({ group }: { group: string }) {
  return (
    <Badge
      tone={
        group === "Dạy học"
          ? "teal"
          : group === "Hành chính"
            ? "orange"
            : "gray"
      }
    >
      {group}
    </Badge>
  )
}
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />
}
export function EmptyState({
  title = "Chưa có dữ liệu",
  description = "Dữ liệu sẽ xuất hiện tại đây khi được tạo.",
  action,
}: {
  title?: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Inbox size={26} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  )
}
export function Drawer({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    if (open) document.addEventListener("keydown", fn)
    return () => document.removeEventListener("keydown", fn)
  }, [open, onClose])
  if (!open) return null
  return (
    <div
      className="overlay"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <aside className="drawer" role="dialog" aria-modal="true">
        <div className="panel-head">
          <div>
            <span className="eyebrow">Thông tin nhanh</span>
            <h2>{title}</h2>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Đóng">
            <X />
          </button>
        </div>
        <div className="drawer-body">{children}</div>
      </aside>
    </div>
  )
}
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Xác nhận",
  danger,
  onConfirm,
  onClose,
}: {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  danger?: boolean
  onConfirm: () => void
  onClose: () => void
}) {
  if (!open) return null
  return (
    <div className="overlay centered">
      <div className="dialog" role="alertdialog" aria-modal="true">
        <div className="panel-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose}>
            <X />
          </button>
        </div>
        <p>{description}</p>
        <div className="dialog-actions">
          <button className="btn secondary" onClick={onClose}>
            Hủy
          </button>
          <button
            className={`btn ${danger ? "danger" : "primary"}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
export function StatCard({
  label,
  value,
  icon: Icon,
  onClick,
}: {
  label: string
  value: string | number
  icon: LucideIcon
  onClick?: () => void
}) {
  return (
    <button className="stat-card" onClick={onClick}>
      <span className="stat-icon">
        <Icon />
      </span>
      <span>
        <small>{label}</small>
        <strong>{value}</strong>
      </span>
      <ChevronRight />
    </button>
  )
}
export function Stepper({
  steps,
  current,
}: {
  steps: string[]
  current: number
}) {
  return (
    <ol className="stepper">
      {steps.map((step, i) => (
        <li
          className={i < current ? "done" : i === current ? "current" : ""}
          key={step}
        >
          <span>{i + 1}</span>
          <small>{step}</small>
        </li>
      ))}
    </ol>
  )
}
interface TimelineItem {
  title: string
  description?: string
  time: string
}
export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="timeline">
      {items.map((item, i) => (
        <li key={i}>
          <span />
          <div>
            <strong>{item.title}</strong>
            {item.description && <p>{item.description}</p>}
            <small>{item.time}</small>
          </div>
        </li>
      ))}
    </ol>
  )
}
export function RelatedPanel({
  title = "Liên quan",
  children,
}: {
  title?: string
  children: ReactNode
}) {
  return (
    <section className="card">
      <h3>{title}</h3>
      <div className="related-list">{children}</div>
    </section>
  )
}
export function EntityLink({
  children,
  onClick,
}: {
  children: ReactNode
  onClick?: () => void
}) {
  return (
    <button className="entity-link" onClick={onClick}>
      {children}
    </button>
  )
}

export interface Column<T> {
  key: string
  label: string
  render: (row: T) => ReactNode
  sortable?: boolean
}
export function DataTable<T>({
  rows,
  columns,
  keyOf,
  emptyTitle,
}: {
  rows: T[]
  columns: Column<T>[]
  keyOf: (row: T) => string
  emptyTitle?: string
}) {
  const [sort, setSort] = useState<string>()
  const visible = useMemo(
    () =>
      sort
        ? [...rows].sort((a, b) =>
            String((a as Record<string, unknown>)[sort]).localeCompare(
              String((b as Record<string, unknown>)[sort]),
              "vi",
            ),
          )
        : rows,
    [rows, sort],
  )
  if (!rows.length) return <EmptyState title={emptyTitle} />
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key}>
                {c.sortable ? (
                  <button onClick={() => setSort(c.key)}>
                    {c.label}
                    <ChevronDown size={14} />
                  </button>
                ) : (
                  c.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visible.map((row) => (
            <tr key={keyOf(row)}>
              {columns.map((c) => (
                <td key={c.key}>{c.render(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
export function FilterBar({
  search,
  onSearch,
  children,
  onClear,
}: {
  search: string
  onSearch: (v: string) => void
  children?: ReactNode
  onClear?: () => void
}) {
  return (
    <div className="filter-bar">
      <input
        aria-label="Tìm kiếm"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Tìm kiếm..."
      />
      {children}
      {onClear && (
        <button className="btn ghost" onClick={onClear}>
          Xóa bộ lọc
        </button>
      )}
    </div>
  )
}
interface TreeChild {
  id: string
  label: string
}
export function TreeView({
  nodes,
}: {
  nodes: {
    id: string
    label: string
    children?: TreeChild[]
  }[]
}) {
  const [open, setOpen] = useState<string[]>([])
  return (
    <div className="tree">
      {nodes.map((n) => (
        <div key={n.id}>
          <button
            onClick={() =>
              setOpen((x) =>
                x.includes(n.id) ? x.filter((v) => v !== n.id) : [...x, n.id],
              )
            }
          >
            {open.includes(n.id) ? <ChevronDown /> : <ChevronRight />}
            {n.label}
          </button>
          {open.includes(n.id) &&
            n.children?.map((c) => (
              <div className="tree-child" key={c.id}>
                {c.label}
              </div>
            ))}
        </div>
      ))}
    </div>
  )
}
interface FloorRoom {
  id: string
  code: string
  name: string
  status: string
}
export function FloorPlanGrid({
  rooms,
  onSelect,
}: {
  rooms: FloorRoom[]
  onSelect?: (id: string) => void
}) {
  return (
    <div className="floor-grid">
      {rooms.map((r) => (
        <button key={r.id} onClick={() => onSelect?.(r.id)}>
          <strong>{r.code}</strong>
          <span>{r.name}</span>
          <StatusBadge status={r.status} />
        </button>
      ))}
    </div>
  )
}
interface CalendarEvent {
  date: string
  label: string
}
export function Calendar({ events = [] }: { events?: CalendarEvent[] }) {
  const [date, setDate] = useState(new Date(2026, 2, 1))
  const days = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  return (
    <div className="calendar">
      <div className="calendar-head">
        <button
          onClick={() =>
            setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1))
          }
        >
          <ChevronLeft />
        </button>
        <strong>
          Tháng {date.getMonth() + 1}/{date.getFullYear()}
        </strong>
        <button
          onClick={() =>
            setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1))
          }
        >
          <ChevronRight />
        </button>
      </div>
      <div className="calendar-grid">
        {Array.from({ length: days }, (_, i) => {
          const day = i + 1
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
          return (
            <div key={day}>
              <strong>{day}</strong>
              {events
                .filter((e) => e.date === key)
                .map((e, j) => (
                  <span key={j}>{e.label}</span>
                ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
export function PermissionMatrix({
  roles,
  permissions,
}: {
  roles: string[]
  permissions: string[]
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Quyền</th>
            {roles.map((r) => (
              <th key={r}>{r}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {permissions.map((p, i) => (
            <tr key={p}>
              <td>{p}</td>
              {roles.map((r, j) => (
                <td key={r}>
                  <input
                    type="checkbox"
                    defaultChecked={(i + j) % 3 !== 0}
                    aria-label={`${p} - ${r}`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

type ToastItem = {
  id: number
  message: string
  action?: ToastAction
}
interface ToastAction {
  label: string
  onClick: () => void
}
let toastListener: ((item: ToastItem) => void) | undefined
export const toast = (message: string, action?: ToastItem["action"]) =>
  toastListener?.({ id: Date.now(), message, action })
export function ToastViewport() {
  const [items, setItems] = useState<ToastItem[]>([])
  useEffect(() => {
    toastListener = (item) => {
      setItems((x) => [...x, item])
      setTimeout(() => setItems((x) => x.filter((v) => v.id !== item.id)), 4500)
    }
    return () => {
      toastListener = undefined
    }
  }, [])
  return (
    <div className="toast-viewport" aria-live="polite">
      {items.map((item) => (
        <div className="toast" key={item.id}>
          <span>✓</span>
          <p>{item.message}</p>
          {item.action && (
            <button onClick={item.action.onClick}>{item.action.label}</button>
          )}
          <button
            onClick={() => setItems((x) => x.filter((v) => v.id !== item.id))}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  )
}
