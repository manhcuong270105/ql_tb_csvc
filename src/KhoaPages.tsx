import { useMemo, useState } from "react"
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom"
import {
  AlertTriangle,
  ArrowLeft,
  Boxes,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FilePlus2,
  Grid2X2,
  List,
  Plus,
  Send,
  ShieldAlert,
  Trash2,
  Wrench,
} from "lucide-react"
import {
  formatArea,
  formatCurrency,
  formatDate,
  normalizeText,
  type Asset,
  type DomainRecord,
  type Room,
  useAppStore,
} from "./store"
import {
  ConfirmDialog,
  DataTable,
  Drawer,
  EmptyState,
  EntityLink,
  FilterBar,
  FloorPlanGrid,
  RelatedPanel,
  RoomTypeBadge,
  StatCard,
  StatusBadge,
  Stepper,
  Timeline,
  toast,
} from "./ui"

const facultyId = "K-CNTT"
const today = new Date().toISOString().slice(0, 10)

function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string
  title: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="page-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions}
    </div>
  )
}

function Card({
  title,
  children,
  className = "",
}: {
  title?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={`card ${className}`}>
      {title && <h3>{title}</h3>}
      {children}
    </section>
  )
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <label className="field">
      <span>
        {label} {required && <b>*</b>}
      </span>
      {children}
      {error && <small className="field-error">{error}</small>}
    </label>
  )
}

function unitData(state: ReturnType<typeof useAppStore>["state"]) {
  const rooms = state.rooms.filter((r) => r.unitId === facultyId)
  const roomIds = new Set(rooms.map((r) => r.id))
  const assets = state.assets.filter(
    (a) => a.unitId === facultyId || (a.roomId && roomIds.has(a.roomId)),
  )
  const proposals = state.purchaseProposals.filter(
    (p) => p.unitId === facultyId,
  )
  return { rooms, assets, proposals }
}

export function FacultyDashboard() {
  const { state } = useAppStore()
  const navigate = useNavigate()
  const { rooms, assets, proposals } = unitData(state)
  const handovers = state.equipmentHandovers.filter(
    (x) => x.unitId === facultyId,
  )
  const requests = state.maintenanceRequests.filter(
    (x) => x.unitId === facultyId,
  )
  const facility = state.facilityProposals.filter((x) => x.unitId === facultyId)
  const stats = [
    [
      "Đề xuất đang xử lý",
      proposals.filter((x) => !/Bị từ chối|Đã bàn giao/.test(x.status)).length,
      FilePlus2,
      "/khoa/de-xuat?trangThai=dang_xu_ly",
    ],
    ["Thiết bị của khoa", assets.length, Boxes, "/khoa/thiet-bi"],
    [
      "Bàn giao chờ xác nhận",
      handovers.filter((x) => x.status === "Chờ xác nhận").length,
      ClipboardCheck,
      "/khoa/ban-giao?tab=cho_xac_nhan",
    ],
    [
      "Bảo trì đang mở",
      requests.filter((x) => !/Hoàn thành|Không sửa được/.test(x.status))
        .length,
      Wrench,
      "/khoa/bao-tri?trangThai=mo",
    ],
  ] as const
  const roomStats = [
    ["Số phòng của khoa", rooms.length, Building2, "/khoa/phong"],
    [
      "Phòng đang sửa chữa",
      rooms.filter((x) => x.status.includes("sửa chữa")).length,
      Wrench,
      "/khoa/phong?tinhTrang=dang_sua",
    ],
    [
      "Phòng xuống cấp",
      rooms.filter((x) => x.status === "Xuống cấp").length,
      AlertTriangle,
      "/khoa/phong?tinhTrang=xuong_cap",
    ],
    [
      "Đề xuất CSVC đang xử lý",
      facility.filter((x) => x.status !== "Hoàn thành").length,
      Clock3,
      "/khoa/de-xuat-csvc?trangThai=dang_xu_ly",
    ],
  ] as const
  return (
    <div>
      <PageHeader
        eyebrow="Khoa Công nghệ thông tin"
        title="Chào buổi sáng, Minh Anh"
        description="Đây là tổng quan tài sản và công việc cần xử lý của khoa."
      />
      <div className="stat-grid">
        {stats.map(([label, value, icon, path]) => (
          <StatCard
            key={label}
            label={label}
            value={value}
            icon={icon}
            onClick={() => navigate(path)}
          />
        ))}
      </div>
      <div className="section-label">Cơ sở vật chất</div>
      <div className="stat-grid">
        {roomStats.map(([label, value, icon, path]) => (
          <StatCard
            key={label}
            label={label}
            value={value}
            icon={icon}
            onClick={() => navigate(path)}
          />
        ))}
      </div>
      <div className="dashboard-columns">
        <Card title="Việc cần làm">
          <div className="task-list">
            {handovers
              .filter((x) => x.status === "Chờ xác nhận")
              .slice(0, 2)
              .map((x) => (
                <Link to={`/khoa/ban-giao/${x.code}`} key={x.id}>
                  <span className="task-icon yellow">
                    <ClipboardCheck />
                  </span>
                  <span>
                    <strong>Xác nhận phiếu {x.code}</strong>
                    <small>Phiếu bàn giao đang chờ khoa đối chiếu</small>
                  </span>
                  <span className="task-action">Xác nhận</span>
                </Link>
              ))}
            {proposals
              .filter((x) => x.status === "Bị từ chối")
              .slice(0, 2)
              .map((x) => (
                <Link to={`/khoa/de-xuat/${x.code}`} key={x.id}>
                  <span className="task-icon red">
                    <AlertTriangle />
                  </span>
                  <span>
                    <strong>Xem lý do từ chối {x.code}</strong>
                    <small>Cần rà soát trước khi lập đề xuất mới</small>
                  </span>
                  <span className="task-action">Xem</span>
                </Link>
              ))}
          </div>
        </Card>
        <Card title="Hoạt động gần đây">
          <Timeline items={state.auditLogs.slice(0, 5).map((x) => ({
              title: `${x.action} ${x.target}`,
              description: x.actor,
              time: formatDate(x.createdAt),
            }))} />
        </Card>
      </div>
    </div>
  )
}

export function ProposalList() {
  const { state, dispatch } = useAppStore()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const { proposals } = unitData(state)
  const q = params.get("q") || ""
  const status = params.get("trangThai") || ""
  const rows = proposals.filter(
    (x) =>
      (!q || normalizeText(x.code).includes(normalizeText(q))) &&
      (!status ||
        (status === "dang_xu_ly"
          ? !/Bị từ chối|Đã bàn giao/.test(x.status)
          : x.status === status)),
  )
  const remove = (record: DomainRecord) => {
    if (record.status !== "Nháp") return
    dispatch({
      type: "UPDATE_RECORD",
      collection: "purchaseProposals",
      id: record.id,
      changes: { unitId: "deleted" },
    })
    toast(`Đã xóa đề xuất ${record.code}`)
  }
  return (
    <div>
      <PageHeader
        eyebrow="Mua sắm"
        title="Đề xuất mua sắm"
        description="Theo dõi đề xuất thiết bị của Khoa Công nghệ thông tin."
        actions={
          <Link className="btn primary" to="/khoa/de-xuat/moi">
            <Plus /> Lập đề xuất
          </Link>
        }
      />
      <FilterBar
        search={q}
        onSearch={(value) => {
          const next = new URLSearchParams(params)
          value ? next.set("q", value) : next.delete("q")
          setParams(next)
        }}
        onClear={() => setParams({})}
      >
        <select
          value={status}
          onChange={(e) => {
            const next = new URLSearchParams(params)
            e.target.value
              ? next.set("trangThai", e.target.value)
              : next.delete("trangThai")
            setParams(next)
          }}
        >
          <option value="">Tất cả trạng thái</option>
          {[
            "Nháp",
            "Đã gửi",
            "Đã tiếp nhận",
            "Chờ phê duyệt",
            "Đã phê duyệt",
            "Bị từ chối",
          ].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <input type="date" aria-label="Từ ngày" />
        <input type="date" aria-label="Đến ngày" />
      </FilterBar>
      <div className="content-card">
        <DataTable
          rows={rows}
          keyOf={(x) => x.id}
          emptyTitle="Chưa có đề xuất"
          columns={[
            {
              key: "code",
              label: "Mã đề xuất",
              sortable: true,
              render: (x) => (
                <Link className="table-link" to={`/khoa/de-xuat/${x.code}`}>
                  {x.code}
                </Link>
              ),
            },
            {
              key: "createdAt",
              label: "Ngày đề xuất",
              render: (x) => formatDate(x.createdAt),
            },
            {
              key: "priority",
              label: "Mức độ cần thiết",
              render: (x) => (
                <span>
                  {Number(x.code.slice(-1)) % 3 === 0 ? "Cao" : "Trung bình"}
                </span>
              ),
            },
            {
              key: "quantity",
              label: "Số thiết bị",
              render: (x) => 2 + (Number(x.code.slice(-1)) % 5),
            },
            {
              key: "status",
              label: "Trạng thái",
              render: (x) => <StatusBadge status={x.status} />,
            },
            {
              key: "actions",
              label: "Thao tác",
              render: (x) => (
                <div className="row-actions">
                  <button onClick={() => navigate(`/khoa/de-xuat/${x.code}`)}>
                    Xem
                  </button>
                  {x.status === "Nháp" && (
                    <>
                      <button
                        onClick={() => navigate(`/khoa/de-xuat/${x.code}/sua`)}
                      >
                        Sửa
                      </button>
                      <button className="danger-text" onClick={() => remove(x)}>
                        Xóa
                      </button>
                    </>
                  )}
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  )
}

interface PurchaseLine {
  id: number
  name: string
  type: string
  quantity: number
  price: number
  note: string
}

export function ProposalForm() {
  const { state, dispatch } = useAppStore()
  const navigate = useNavigate()
  const { id } = useParams()
  const existing = state.purchaseProposals.find((x) => x.code === id)
  const { rooms } = unitData(state)
  const [purpose, setPurpose] = useState(existing?.details || "")
  const [priority, setPriority] = useState("Trung bình")
  const [roomId, setRoomId] = useState("")
  const [lines, setLines] = useState<PurchaseLine[]>([
    { id: 1, name: "", type: "Máy tính", quantity: 1, price: 0, note: "" },
  ])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [confirm, setConfirm] = useState(false)
  const save = (send: boolean) => {
    const nextErrors: Record<string, string> = {}
    if (!purpose.trim()) nextErrors.purpose = "Vui lòng nhập mục đích."
    lines.forEach((line) => {
      if (!line.name.trim())
        nextErrors[`name-${line.id}`] = "Vui lòng nhập tên thiết bị."
      if (!Number.isInteger(line.quantity) || line.quantity <= 0)
        nextErrors[`quantity-${line.id}`] = "Số lượng phải là số nguyên dương."
    })
    if (Object.keys(nextErrors).length) return setErrors(nextErrors)
    const code =
      existing?.code ||
      `DX-${String(state.purchaseProposals.length + 1).padStart(4, "0")}`
    const record = {
      id: existing?.id || `dx-${Date.now()}`,
      code,
      name: purpose,
      details: JSON.stringify({ purpose, priority, roomId, lines }),
      status: send ? "Đã gửi" : "Nháp",
      unitId: facultyId,
      createdAt: today,
      amount: lines.reduce((sum, line) => sum + line.quantity * line.price, 0),
    }
    if (existing)
      dispatch({
        type: "UPDATE_RECORD",
        collection: "purchaseProposals",
        id: existing.id,
        changes: record,
      })
    else
      dispatch({ type: "ADD_RECORD", collection: "purchaseProposals", record })
    if (send) {
      dispatch({
        type: "ADD_NOTIFICATION",
        notification: {
          id: `noti-${Date.now()}`,
          role: "facilities",
          title: `Đề xuất ${code} vừa được gửi`,
          message: purpose,
          createdAt: new Date().toISOString(),
          read: false,
          entityKind: "proposal",
          entityId: record.id,
        },
      })
      toast(`Đã gửi đề xuất ${code}`)
      navigate(`/khoa/de-xuat/${code}`)
    } else {
      toast(`Đã lưu nháp ${code}`)
      navigate("/khoa/de-xuat")
    }
  }
  const updateLine = (id: number, changes: Partial<PurchaseLine>) =>
    setLines((value) =>
      value.map((x) => (x.id === id ? { ...x, ...changes } : x)),
    )
  return (
    <div className="form-page">
      <PageHeader
        eyebrow="Đề xuất mua sắm"
        title={existing ? `Chỉnh sửa ${existing.code}` : "Lập đề xuất mới"}
        description="Khai báo nhu cầu và danh sách thiết bị cần mua."
      />
      <Card title="1. Thông tin chung">
        <div className="form-grid">
          <Field label="Mục đích" required error={errors.purpose}>
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Mô tả mục đích sử dụng thiết bị..."
            />
          </Field>
          <Field label="Đơn vị sử dụng">
            <input value="Khoa Công nghệ thông tin" disabled />
          </Field>
          <Field label="Mức độ cần thiết">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              {["Thấp", "Trung bình", "Cao", "Khẩn"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </Field>
          <Field label="Thời gian dự kiến">
            <input type="date" min={today} />
          </Field>
          <Field label="Phòng sẽ đặt thiết bị">
            <select value={roomId} onChange={(e) => setRoomId(e.target.value)}>
              <option value="">Chưa xác định</option>
              {rooms.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.code} — {x.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Card>
      <Card title="2. Danh sách thiết bị cần mua">
        <div className="line-table">
          <div className="line-head">
            <span>Tên thiết bị *</span>
            <span>Loại</span>
            <span>Số lượng *</span>
            <span>Đơn giá dự kiến</span>
            <span>Ghi chú</span>
            <span />
          </div>
          {lines.map((line) => (
            <div className="line-row" key={line.id}>
              <div>
                <input
                  value={line.name}
                  onChange={(e) =>
                    updateLine(line.id, { name: e.target.value })
                  }
                  placeholder="Tên thiết bị"
                />
                {errors[`name-${line.id}`] && (
                  <small className="field-error">
                    {errors[`name-${line.id}`]}
                  </small>
                )}
              </div>
              <select
                value={line.type}
                onChange={(e) => updateLine(line.id, { type: e.target.value })}
              >
                <option>Máy tính</option>
                <option>Thiết bị mạng</option>
                <option>Thiết bị thí nghiệm</option>
                <option>Nội thất</option>
              </select>
              <div>
                <input
                  type="number"
                  min="1"
                  value={line.quantity}
                  onChange={(e) =>
                    updateLine(line.id, { quantity: Number(e.target.value) })
                  }
                />
                {errors[`quantity-${line.id}`] && (
                  <small className="field-error">
                    {errors[`quantity-${line.id}`]}
                  </small>
                )}
              </div>
              <input
                type="number"
                min="0"
                value={line.price}
                onChange={(e) =>
                  updateLine(line.id, { price: Number(e.target.value) })
                }
              />
              <input
                value={line.note}
                onChange={(e) => updateLine(line.id, { note: e.target.value })}
              />
              <button
                className="icon-btn danger-text"
                disabled={lines.length === 1}
                onClick={() =>
                  setLines((value) => value.filter((x) => x.id !== line.id))
                }
              >
                <Trash2 />
              </button>
            </div>
          ))}
        </div>
        <button
          className="btn secondary"
          onClick={() =>
            setLines((value) => [
              ...value,
              {
                id: Date.now(),
                name: "",
                type: "Máy tính",
                quantity: 1,
                price: 0,
                note: "",
              },
            ])
          }
        >
          <Plus /> Thêm dòng
        </button>
      </Card>
      <div className="sticky-actions">
        <button className="btn ghost" onClick={() => navigate(-1)}>
          Hủy
        </button>
        <button className="btn secondary" onClick={() => save(false)}>
          Lưu nháp
        </button>
        <button className="btn primary" onClick={() => setConfirm(true)}>
          <Send /> Gửi đề xuất
        </button>
      </div>
      <ConfirmDialog
        open={confirm}
        title="Gửi đề xuất mua sắm?"
        description="Đề xuất sẽ được chuyển tới Phòng QLCSVC để tiếp nhận. Bạn vẫn có thể theo dõi trạng thái sau khi gửi."
        confirmLabel="Gửi đề xuất"
        onClose={() => setConfirm(false)}
        onConfirm={() => {
          setConfirm(false)
          save(true)
        }}
      />
    </div>
  )
}

const purchaseSteps = [
  "Nháp",
  "Đã gửi",
  "Đã tiếp nhận",
  "Chờ phê duyệt",
  "Đã phê duyệt",
  "Đang mua sắm",
  "Đã nhận hàng",
  "Đã bàn giao",
]
export function ProposalDetail() {
  const { id } = useParams()
  const { state, dispatch } = useAppStore()
  const navigate = useNavigate()
  const record = state.purchaseProposals.find((x) => x.code === id)
  const [cancel, setCancel] = useState(false)
  if (!record)
    return <MissingEntity type="đề xuất" code={id || ""} back="/khoa/de-xuat" />
  const step = Math.max(0, purchaseSteps.indexOf(record.status))
  const rejected = record.status === "Bị từ chối"
  return (
    <div>
      <PageHeader
        eyebrow="Chi tiết đề xuất"
        title={record.code}
        description={record.name}
        actions={<StatusBadge status={record.status} />}
      />
      <Card>
        <Stepper
          steps={
            rejected
              ? [...purchaseSteps.slice(0, 4), "Bị từ chối"]
              : purchaseSteps
          }
          current={rejected ? 4 : step}
        />
      </Card>
      <div className="detail-grid">
        <Card title="Thông tin chung">
          <dl className="detail-list">
            <div>
              <dt>Đơn vị</dt>
              <dd>Khoa Công nghệ thông tin</dd>
            </div>
            <div>
              <dt>Ngày đề xuất</dt>
              <dd>{formatDate(record.createdAt)}</dd>
            </div>
            <div>
              <dt>Mức độ</dt>
              <dd>Cao</dd>
            </div>
            <div>
              <dt>Dự toán</dt>
              <dd>{formatCurrency(record.amount || 0)}</dd>
            </div>
            <div className="full">
              <dt>Mục đích</dt>
              <dd>{record.name}</dd>
            </div>
          </dl>
        </Card>
        <Card
          title="Kết quả phê duyệt"
          className={rejected ? "rejection-card" : ""}
        >
          {[
            "Đã phê duyệt",
            "Bị từ chối",
            "Đang mua sắm",
            "Đã nhận hàng",
            "Đã bàn giao",
          ].includes(record.status) ? (
            <dl className="detail-list">
              <div>
                <dt>Kinh phí duyệt</dt>
                <dd>{formatCurrency((record.amount || 0) * 0.9)}</dd>
              </div>
              <div>
                <dt>Người duyệt</dt>
                <dd>PGS. Nguyễn Văn Sơn</dd>
              </div>
              <div className="full">
                <dt>{rejected ? "Lý do từ chối" : "Kết luận"}</dt>
                <dd>
                  {rejected
                    ? "Hồ sơ chưa làm rõ nhu cầu và đơn giá dự kiến."
                    : "Phê duyệt theo dự toán đã thẩm định."}
                </dd>
              </div>
            </dl>
          ) : (
            <EmptyState
              title="Chưa có kết quả phê duyệt"
              description="Kết quả sẽ hiển thị sau khi Ban lãnh đạo xử lý."
            />
          )}
        </Card>
      </div>
      <Card title="Danh sách thiết bị">
        <DataTable
          rows={[
            {
              name: "Máy tính cấu hình cao",
              type: "Máy tính",
              quantity: 5,
              price: 25000000,
            },
            {
              name: "Màn hình 27 inch",
              type: "Thiết bị máy tính",
              quantity: 5,
              price: 6500000,
            },
          ]}
          keyOf={(x) => x.name}
          columns={[
            { key: "name", label: "Tên thiết bị", render: (x) => x.name },
            { key: "type", label: "Loại", render: (x) => x.type },
            { key: "quantity", label: "Số lượng", render: (x) => x.quantity },
            {
              key: "price",
              label: "Đơn giá dự kiến",
              render: (x) => formatCurrency(x.price),
            },
          ]}
        />
      </Card>
      <RelatedPanel>
        <button className="related-row">
          <span>
            <strong>KH-0001</strong>
            <small>Kế hoạch mua sắm liên quan</small>
          </span>
          <StatusBadge status="Đã phê duyệt" />
        </button>
        {state.assets
          .filter((x) => x.planId === "plan-1")
          .slice(0, 2)
          .map((x) => (
            <Link
              className="related-row"
              to={`/khoa/thiet-bi/${x.code}`}
              key={x.id}
            >
              <span>
                <strong>{x.code}</strong>
                <small>{x.name}</small>
              </span>
              <StatusBadge status={x.status} />
            </Link>
          ))}
      </RelatedPanel>
      <div className="page-actions">
        {record.status === "Nháp" && (
          <Link
            className="btn secondary"
            to={`/khoa/de-xuat/${record.code}/sua`}
          >
            Sửa đề xuất
          </Link>
        )}
        {record.status === "Đã gửi" && (
          <button
            className="btn secondary danger-text"
            onClick={() => setCancel(true)}
          >
            Hủy đề xuất
          </button>
        )}
        <Link className="btn primary" to="/khoa/de-xuat/moi">
          Lập đề xuất mới từ bản này
        </Link>
      </div>
      <ConfirmDialog
        open={cancel}
        title="Hủy đề xuất?"
        description="Đề xuất chưa được tiếp nhận và sẽ chuyển về trạng thái Nháp."
        danger
        confirmLabel="Hủy đề xuất"
        onClose={() => setCancel(false)}
        onConfirm={() => {
          dispatch({
            type: "UPDATE_RECORD",
            collection: "purchaseProposals",
            id: record.id,
            changes: { status: "Nháp" },
          })
          setCancel(false)
          toast(`Đã hủy gửi ${record.code}`)
        }}
      />
    </div>
  )
}

function MissingEntity({
  type,
  code,
  back,
}: {
  type: string
  code: string
  back: string
}) {
  return (
    <div className="error-page compact">
      <span>404</span>
      <h1>
        Không tìm thấy {type} {code}
      </h1>
      <p>Đối tượng không tồn tại hoặc bạn không có quyền xem.</p>
      <Link className="btn primary" to={back}>
        Về danh sách
      </Link>
    </div>
  )
}

export function AssetList() {
  const { state } = useAppStore()
  const { assets, rooms } = unitData(state)
  const [params, setParams] = useSearchParams()
  const [view, setView] = useState<"table" | "card">("table")
  const q = params.get("q") || ""
  const status = params.get("tinhTrang") || ""
  const room = params.get("phong") || ""
  const rows = assets.filter(
    (x) =>
      (!q ||
        normalizeText(`${x.code} ${x.assetCode} ${x.name}`).includes(
          normalizeText(q),
        )) &&
      (!status ? x.status !== "Đã thanh lý" : x.status === status) &&
      (!room || x.roomId === room),
  )
  return (
    <div>
      <PageHeader
        eyebrow="Tài sản"
        title="Thiết bị của khoa"
        description={`${rows.length} thiết bị đang hiển thị`}
        actions={
          <div className="view-toggle">
            <button
              className={view === "table" ? "active" : ""}
              onClick={() => setView("table")}
            >
              <List />
            </button>
            <button
              className={view === "card" ? "active" : ""}
              onClick={() => setView("card")}
            >
              <Grid2X2 />
            </button>
          </div>
        }
      />
      <FilterBar
        search={q}
        onSearch={(v) => {
          const next = new URLSearchParams(params)
          v ? next.set("q", v) : next.delete("q")
          setParams(next)
        }}
        onClear={() => setParams({})}
      >
        <select
          value={status}
          onChange={(e) => {
            const next = new URLSearchParams(params)
            e.target.value
              ? next.set("tinhTrang", e.target.value)
              : next.delete("tinhTrang")
            setParams(next)
          }}
        >
          <option value="">Đang quản lý</option>
          {[
            "Đang sử dụng",
            "Sẵn sàng bàn giao",
            "Đang bảo trì/sửa chữa",
            "Hỏng",
            "Chờ thanh lý",
            "Đã thanh lý",
          ].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <select
          value={room}
          onChange={(e) => {
            const next = new URLSearchParams(params)
            e.target.value
              ? next.set("phong", e.target.value)
              : next.delete("phong")
            setParams(next)
          }}
        >
          <option value="">Tất cả phòng</option>
          {rooms.map((x) => (
            <option value={x.id} key={x.id}>
              {x.code}
            </option>
          ))}
        </select>
      </FilterBar>
      {view === "table" ? (
        <div className="content-card">
          <DataTable
            rows={rows}
            keyOf={(x) => x.id}
            columns={[
              {
                key: "assetCode",
                label: "Mã tài sản",
                sortable: true,
                render: (x) => (
                  <Link className="table-link" to={`/khoa/thiet-bi/${x.code}`}>
                    {x.code}
                  </Link>
                ),
              },
              { key: "name", label: "Tên thiết bị", render: (x) => x.name },
              { key: "type", label: "Loại", render: (x) => x.type },
              {
                key: "roomId",
                label: "Phòng",
                render: (x) => {
                  const r = rooms.find((v) => v.id === x.roomId)
                  return r ? (
                    <Link className="table-link" to={`/khoa/phong/${r.code}`}>
                      {r.code}
                    </Link>
                  ) : (
                    "—"
                  )
                },
              },
              {
                key: "status",
                label: "Tình trạng",
                render: (x) => <StatusBadge status={x.status} />,
              },
              {
                key: "warrantyEnd",
                label: "Hạn bảo hành",
                render: (x) => (
                  <span
                    className={
                      new Date(x.warrantyEnd).getTime() - Date.now() <
                      2592000000
                        ? "warning-text"
                        : ""
                    }
                  >
                    {formatDate(x.warrantyEnd)}
                  </span>
                ),
              },
              {
                key: "action",
                label: "Thao tác",
                render: (x) => (
                  <div className="row-actions">
                    <Link to={`/khoa/thiet-bi/${x.code}`}>Xem</Link>
                    <Link to={`/khoa/bao-tri/moi?doiTuong=${x.code}`}>
                      Báo sự cố
                    </Link>
                  </div>
                ),
              },
            ]}
          />
        </div>
      ) : (
        <div className="asset-grid">
          {rows.map((x) => (
            <Link
              className="asset-card"
              to={`/khoa/thiet-bi/${x.code}`}
              key={x.id}
            >
              <span className="asset-icon">
                <Boxes />
              </span>
              <strong>{x.name}</strong>
              <small>
                {x.code} · {x.assetCode}
              </small>
              <StatusBadge status={x.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export function AssetDetail() {
  const { id } = useParams()
  const { state } = useAppStore()
  const [tab, setTab] = useState("info")
  const asset = state.assets.find((x) => x.code === id)
  if (!asset)
    return (
      <MissingEntity type="thiết bị" code={id || ""} back="/khoa/thiet-bi" />
    )
  const room = state.rooms.find((x) => x.id === asset.roomId)
  const openRequest = state.maintenanceRequests.find(
    (x) =>
      x.entityId === asset.id && !/Hoàn thành|Không sửa được/.test(x.status),
  )
  return (
    <div>
      <PageHeader
        eyebrow="Chi tiết thiết bị"
        title={asset.name}
        description={`${asset.code} · ${asset.assetCode}`}
        actions={<StatusBadge status={asset.status} />}
      />
      {asset.status.includes("bảo trì") && (
        <div className="banner purple">
          <Wrench />
          <span>
            <strong>Thiết bị đang được bảo trì</strong>
            <small>QLCSVC đang xử lý yêu cầu liên quan.</small>
          </span>
          {openRequest && (
            <Link to={`/khoa/bao-tri/${openRequest.code}`}>Xem yêu cầu</Link>
          )}
        </div>
      )}
      <div className="object-strip">
        <div>
          <span>Vị trí hiện tại</span>
          {room ? (
            <Link to={`/khoa/phong/${room.code}`}>
              {room.code} — {room.name}
            </Link>
          ) : (
            <strong>Chưa bố trí phòng</strong>
          )}
        </div>
        <div className="page-actions">
          <Link
            className="btn primary"
            to={
              openRequest
                ? `/khoa/bao-tri/${openRequest.code}`
                : `/khoa/bao-tri/moi?doiTuong=${asset.code}`
            }
          >
            <Wrench />{" "}
            {openRequest ? "Xem yêu cầu đang mở" : "Yêu cầu sửa chữa/bảo trì"}
          </Link>
          <Link
            className="btn secondary"
            to={`/khoa/thanh-ly?thietBi=${asset.code}&tab=lap`}
          >
            Đề xuất thanh lý
          </Link>
        </div>
      </div>
      <div className="tabs">
        {[
          ["info", "Thông tin"],
          ["move", "Lịch sử điều chuyển"],
          ["maintenance", "Lịch sử bảo trì"],
        ].map(([key, label]) => (
          <button
            className={tab === key ? "active" : ""}
            onClick={() => setTab(key)}
            key={key}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "info" && (
        <Card>
          <dl className="detail-list">
            <div>
              <dt>Loại thiết bị</dt>
              <dd>{asset.type}</dd>
            </div>
            <div>
              <dt>Nhà cung cấp</dt>
              <dd>
                {state.suppliers.find((x) => x.id === asset.supplierId)?.name}
              </dd>
            </div>
            <div>
              <dt>Ngày mua</dt>
              <dd>{formatDate(asset.purchaseDate)}</dd>
            </div>
            <div>
              <dt>Giá mua</dt>
              <dd>{formatCurrency(asset.price)}</dd>
            </div>
            <div>
              <dt>Hạn bảo hành</dt>
              <dd>{formatDate(asset.warrantyEnd)}</dd>
            </div>
            <div>
              <dt>Bảo trì tiếp theo</dt>
              <dd>
                {asset.nextMaintenance
                  ? formatDate(asset.nextMaintenance)
                  : "—"}
              </dd>
            </div>
          </dl>
        </Card>
      )}
      {tab !== "info" && (
        <Card>
          <Timeline items={state.auditLogs.slice(0, 5).map((x, i) => ({
              title:
                tab === "move"
                  ? `Điều chuyển tới ${room?.code || "Kho trung tâm"}`
                  : `Bảo trì định kỳ BT-${String(i + 1).padStart(4, "0")}`,
              description: x.actor,
              time: formatDate(x.createdAt),
            }))} />
        </Card>
      )}
      <RelatedPanel>
        <Link className="related-row" to="/khoa/ban-giao/BG-0001">
          <span>
            <strong>BG-0001</strong>
            <small>Phiếu bàn giao nguồn</small>
          </span>
        </Link>
        <Link className="related-row" to="/khoa/de-xuat/DX-0001">
          <span>
            <strong>DX-0001</strong>
            <small>Đề xuất mua sắm nguồn</small>
          </span>
        </Link>
      </RelatedPanel>
    </div>
  )
}

export function HandoverList() {
  const { state } = useAppStore()
  const [params, setParams] = useSearchParams()
  const type = params.get("loai") || "thiet-bi"
  const tab = params.get("tab") || "cho_xac_nhan"
  const source =
    type === "phong" ? state.roomHandovers : state.equipmentHandovers
  const rows = source
    .filter(
      (x) =>
        x.unitId === facultyId &&
        (tab === "cho_xac_nhan"
          ? x.status === "Chờ xác nhận"
          : x.status === "Đã xác nhận"),
    )
    .sort((a) => (a.status === "Chờ xác nhận" ? -1 : 1))
  return (
    <div>
      <PageHeader
        eyebrow="Tiếp nhận tài sản"
        title="Phiếu bàn giao"
        description="Đối chiếu và xác nhận tài sản được bàn giao cho khoa."
      />
      <div className="segmented">
        <button
          className={type === "thiet-bi" ? "active" : ""}
          onClick={() => setParams({ loai: "thiet-bi", tab })}
        >
          Thiết bị
        </button>
        <button
          className={type === "phong" ? "active" : ""}
          onClick={() => setParams({ loai: "phong", tab })}
        >
          Phòng
        </button>
      </div>
      <div className="tabs">
        <button
          className={tab === "cho_xac_nhan" ? "active" : ""}
          onClick={() => setParams({ loai: type, tab: "cho_xac_nhan" })}
        >
          Chờ xác nhận
        </button>
        <button
          className={tab === "da_xac_nhan" ? "active" : ""}
          onClick={() => setParams({ loai: type, tab: "da_xac_nhan" })}
        >
          Đã xác nhận
        </button>
      </div>
      <div className="content-card">
        <DataTable
          rows={rows}
          emptyTitle="Không có phiếu trong mục này"
          keyOf={(x) => x.id}
          columns={[
            {
              key: "code",
              label: "Mã phiếu",
              render: (x) => (
                <Link className="table-link" to={`/khoa/ban-giao/${x.code}`}>
                  {x.code}
                </Link>
              ),
            },
            {
              key: "createdAt",
              label: "Ngày bàn giao",
              render: (x) => formatDate(x.createdAt),
            },
            { key: "sender", label: "Người giao", render: () => "Lê Đức Long" },
            {
              key: "content",
              label: "Nội dung",
              render: (x) =>
                type === "phong"
                  ? `Phòng ${state.rooms[Number(x.code.slice(-1)) % state.rooms.length].code}`
                  : `${2 + (Number(x.code.slice(-1)) % 6)} thiết bị`,
            },
            {
              key: "status",
              label: "Trạng thái",
              render: (x) => <StatusBadge status={x.status} />,
            },
          ]}
        />
      </div>
    </div>
  )
}

export function HandoverDetail() {
  const { id } = useParams()
  const { state, dispatch } = useAppStore()
  const navigate = useNavigate()
  const record = [...state.equipmentHandovers, ...state.roomHandovers].find(
    (x) => x.code === id,
  )
  const roomMode = id?.startsWith("BGP")
  const relatedAssets = unitData(state).assets.slice(0, 4)
  const [checked, setChecked] = useState<string[]>([])
  const [rejecting, setRejecting] = useState(false)
  const [note, setNote] = useState("")
  const [error, setError] = useState("")
  if (!record)
    return (
      <MissingEntity
        type="phiếu bàn giao"
        code={id || ""}
        back="/khoa/ban-giao"
      />
    )
  const collection = roomMode ? "roomHandovers" : "equipmentHandovers"
  const confirm = () => {
    dispatch({
      type: "UPDATE_RECORD",
      collection,
      id: record.id,
      changes: { status: "Đã xác nhận" },
    })
    toast(`Đã xác nhận tiếp nhận ${record.code}`)
    navigate(roomMode ? "/khoa/phong" : "/khoa/thiet-bi?moiNhan=1")
  }
  return (
    <div>
      <PageHeader
        eyebrow="Phiếu bàn giao"
        title={record.code}
        description={
          roomMode
            ? "Bàn giao phòng cho Khoa Công nghệ thông tin"
            : "Bàn giao thiết bị cho Khoa Công nghệ thông tin"
        }
        actions={<StatusBadge status={record.status} />}
      />
      <Card title="Thông tin phiếu">
        <dl className="detail-list">
          <div>
            <dt>Ngày bàn giao</dt>
            <dd>{formatDate(record.createdAt)}</dd>
          </div>
          <div>
            <dt>Người giao</dt>
            <dd>Lê Đức Long</dd>
          </div>
          <div>
            <dt>Người chịu trách nhiệm</dt>
            <dd>Nguyễn Minh Anh</dd>
          </div>
          <div>
            <dt>Đơn vị nhận</dt>
            <dd>Khoa Công nghệ thông tin</dd>
          </div>
        </dl>
      </Card>
      {roomMode ? (
        <RoomHandover room={state.rooms[0]} assets={relatedAssets} />
      ) : (
        <Card title="Danh sách thiết bị">
          <DataTable
            rows={relatedAssets}
            keyOf={(x) => x.id}
            columns={[
              {
                key: "check",
                label: "Đối chiếu",
                render: (x) => (
                  <input
                    type="checkbox"
                    disabled={record.status === "Đã xác nhận"}
                    checked={
                      checked.includes(x.id) || record.status === "Đã xác nhận"
                    }
                    onChange={(e) =>
                      setChecked((v) =>
                        e.target.checked
                          ? [...v, x.id]
                          : v.filter((id) => id !== x.id),
                      )
                    }
                  />
                ),
              },
              {
                key: "code",
                label: "Mã tài sản",
                render: (x) => (
                  <Link className="table-link" to={`/khoa/thiet-bi/${x.code}`}>
                    {x.code}
                  </Link>
                ),
              },
              { key: "name", label: "Tên", render: (x) => x.name },
              {
                key: "condition",
                label: "Tình trạng khi giao",
                render: () => "Mới, hoạt động tốt",
              },
              { key: "room", label: "Phòng đặt", render: () => "P-A101" },
            ]}
          />
        </Card>
      )}
      {record.status === "Chờ xác nhận" && (
        <div className="sticky-actions">
          <button className="btn secondary" onClick={() => setRejecting(true)}>
            Không xác nhận
          </button>
          <button
            className="btn primary"
            disabled={!roomMode && checked.length !== relatedAssets.length}
            onClick={confirm}
          >
            <CheckCircle2 /> Xác nhận tiếp nhận
          </button>
        </div>
      )}
      <Drawer
        open={rejecting}
        title="Không xác nhận phiếu"
        onClose={() => setRejecting(false)}
      >
        <Field label="Ghi chú" required error={error}>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Nêu rõ nội dung chưa khớp..."
          />
        </Field>
        <button
          className="btn primary wide"
          onClick={() => {
            if (!note.trim()) return setError("Vui lòng nhập ghi chú.")
            dispatch({
              type: "ADD_NOTIFICATION",
              notification: {
                id: `noti-${Date.now()}`,
                role: "facilities",
                title: `${record.code} chưa được xác nhận`,
                message: note,
                createdAt: new Date().toISOString(),
                read: false,
                entityKind: "handover",
                entityId: record.id,
              },
            })
            toast("Đã gửi phản hồi tới Phòng QLCSVC")
            navigate("/khoa/ban-giao")
          }}
        >
          Gửi phản hồi
        </button>
      </Drawer>
    </div>
  )
}

interface RoomHandoverProps {
  room: Room
  assets: Asset[]
}

function RoomHandover({ room, assets }: RoomHandoverProps) {
  return (
    <div className="detail-grid">
      <Card title="Thông tin phòng">
        <dl className="detail-list">
          <div>
            <dt>Mã phòng</dt>
            <dd>{room.code}</dd>
          </div>
          <div>
            <dt>Loại</dt>
            <dd>{room.type}</dd>
          </div>
          <div>
            <dt>Vị trí</dt>
            <dd>
              {room.building}, tầng {room.floor}
            </dd>
          </div>
          <div>
            <dt>Diện tích</dt>
            <dd>{formatArea(room.area)}</dd>
          </div>
          <div>
            <dt>Sức chứa</dt>
            <dd>{room.capacity} chỗ</dd>
          </div>
          <div>
            <dt>Ngày bắt đầu</dt>
            <dd>{formatDate(today)}</dd>
          </div>
        </dl>
      </Card>
      <Card title={`Thiết bị hiện có (${assets.length})`}>
        {assets.map((x) => (
          <Link className="mini-row" to={`/khoa/thiet-bi/${x.code}`} key={x.id}>
            <strong>{x.code}</strong>
            <span>{x.name}</span>
          </Link>
        ))}
      </Card>
    </div>
  )
}

export function MaintenanceList() {
  const { state } = useAppStore()
  const [params, setParams] = useSearchParams()
  const q = params.get("q") || ""
  const rows = state.maintenanceRequests.filter(
    (x) =>
      x.unitId === facultyId &&
      (!q || normalizeText(x.code).includes(normalizeText(q))),
  )
  return (
    <div>
      <PageHeader
        eyebrow="Sửa chữa & bảo trì"
        title="Yêu cầu sửa chữa/bảo trì"
        description="Theo dõi các sự cố thiết bị và phòng của khoa."
        actions={
          <Link className="btn primary" to="/khoa/bao-tri/moi">
            <Plus /> Gửi yêu cầu
          </Link>
        }
      />
      <FilterBar
        search={q}
        onSearch={(v) => setParams(v ? { q: v } : {})}
        onClear={() => setParams({})}
      >
        <select>
          <option>Thiết bị và phòng</option>
          <option>Thiết bị</option>
          <option>Phòng</option>
        </select>
        <select>
          <option>Tất cả trạng thái</option>
          <option>Chờ tiếp nhận</option>
          <option>Đang sửa chữa</option>
          <option>Hoàn thành</option>
        </select>
        <select>
          <option>Mọi mức khẩn cấp</option>
          <option>Khẩn</option>
          <option>Cao</option>
          <option>Thường</option>
        </select>
      </FilterBar>
      <div className="content-card">
        <DataTable
          rows={rows}
          keyOf={(x) => x.id}
          columns={[
            {
              key: "code",
              label: "Mã yêu cầu",
              render: (x) => (
                <Link className="table-link" to={`/khoa/bao-tri/${x.code}`}>
                  {x.code}
                </Link>
              ),
            },
            {
              key: "object",
              label: "Đối tượng",
              render: (x) => (x.entityType === "Phòng" ? "P-A101" : "TS-0001"),
            },
            {
              key: "type",
              label: "Loại yêu cầu",
              render: (x) =>
                Number(x.code.slice(-1)) % 2 ? "Sửa chữa" : "Bảo trì",
            },
            {
              key: "level",
              label: "Mức khẩn cấp",
              render: (x) => (
                <StatusBadge
                  status={
                    Number(x.code.slice(-1)) % 4 === 0 ? "Khẩn" : "Thường"
                  }
                />
              ),
            },
            {
              key: "createdAt",
              label: "Ngày báo",
              render: (x) => formatDate(x.createdAt),
            },
            {
              key: "status",
              label: "Trạng thái",
              render: (x) => <StatusBadge status={x.status} />,
            },
          ]}
        />
      </div>
    </div>
  )
}

export function MaintenanceForm() {
  const { state, dispatch } = useAppStore()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const preset = params.get("doiTuong") || ""
  const { assets, rooms } = unitData(state)
  const [kind, setKind] = useState(preset.startsWith("P-") ? "room" : "asset")
  const [entity, setEntity] = useState(preset)
  const [content, setContent] = useState("")
  const [error, setError] = useState("")
  const open = state.maintenanceRequests.find(
    (x) => x.entityId === entity && !/Hoàn thành|Không sửa được/.test(x.status),
  )
  const submit = () => {
    if (!content.trim()) return setError("Vui lòng bổ sung nội dung sự cố.")
    const code = `YC-${String(state.maintenanceRequests.length + 1).padStart(4, "0")}`
    const record = {
      id: `yc-${Date.now()}`,
      code,
      name: `Yêu cầu ${entity}`,
      status: "Chờ tiếp nhận",
      unitId: facultyId,
      entityType: kind === "asset" ? "Thiết bị" : "Phòng",
      entityId: entity,
      createdAt: today,
      details: content,
    }
    dispatch({ type: "ADD_RECORD", collection: "maintenanceRequests", record })
    dispatch({
      type: "ADD_NOTIFICATION",
      notification: {
        id: `noti-${Date.now()}`,
        role: "facilities",
        title: `Yêu cầu ${code} vừa được gửi`,
        message: `${entity}: ${content}`,
        createdAt: new Date().toISOString(),
        read: false,
        entityKind: "maintenance",
        entityId: record.id,
      },
    })
    toast(`Đã gửi yêu cầu ${code}`)
    navigate(`/khoa/bao-tri/${code}`)
  }
  return (
    <div>
      <PageHeader
        eyebrow="Sửa chữa & bảo trì"
        title="Gửi yêu cầu mới"
        description="Chọn đối tượng và mô tả chính xác sự cố cần xử lý."
      />
      <Card title="1. Chọn đối tượng">
        <div className="choice-cards">
          <button
            className={kind === "asset" ? "active" : ""}
            onClick={() => {
              setKind("asset")
              setEntity("")
            }}
          >
            <Boxes />
            <span>
              <strong>Thiết bị</strong>
              <small>Máy tính, máy chiếu, thiết bị thí nghiệm...</small>
            </span>
          </button>
          <button
            className={kind === "room" ? "active" : ""}
            onClick={() => {
              setKind("room")
              setEntity("")
            }}
          >
            <Building2 />
            <span>
              <strong>Phòng</strong>
              <small>Phòng học, phòng máy, phòng thí nghiệm...</small>
            </span>
          </button>
        </div>
        <Field label="Tìm và chọn đối tượng" required>
          <select value={entity} onChange={(e) => setEntity(e.target.value)}>
            <option value="">Chọn đối tượng...</option>
            {(kind === "asset" ? assets : rooms).map((x) => (
              <option key={x.id} value={x.code}>
                {x.code} — {x.name}
              </option>
            ))}
          </select>
        </Field>
        {open && (
          <div className="banner yellow">
            <AlertTriangle />
            <span>
              <strong>
                {entity} đang có yêu cầu {open.code} chưa xử lý xong
              </strong>
              <small>
                Bạn vẫn có thể gửi thêm yêu cầu nếu đây là sự cố khác.
              </small>
            </span>
            <Link to={`/khoa/bao-tri/${open.code}`}>Xem yêu cầu</Link>
          </div>
        )}
      </Card>
      <Card title="2. Nội dung yêu cầu">
        <div className="form-grid">
          <Field label="Loại yêu cầu">
            <select>
              <option>Sửa chữa</option>
              <option>Bảo trì</option>
            </select>
          </Field>
          <Field label="Mức khẩn cấp">
            <select>
              <option>Thường</option>
              <option>Cao</option>
              <option>Khẩn</option>
            </select>
          </Field>
          <Field label="Ngày báo hỏng">
            <input type="date" defaultValue={today} />
          </Field>
          <Field label="Nội dung sự cố" required error={error}>
            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value)
                setError("")
              }}
              placeholder="Mô tả dấu hiệu, thời điểm và ảnh hưởng của sự cố..."
            />
          </Field>
          <Field label="Ảnh đính kèm">
            <input type="file" accept="image/*" multiple />
          </Field>
        </div>
      </Card>
      <div className="sticky-actions">
        <button className="btn ghost" onClick={() => navigate(-1)}>
          Hủy
        </button>
        <button className="btn primary" disabled={!entity} onClick={submit}>
          <Send /> Gửi yêu cầu
        </button>
      </div>
    </div>
  )
}

const maintenanceSteps = [
  "Chờ tiếp nhận",
  "Đã tiếp nhận",
  "Đang sửa chữa",
  "Hoàn thành",
]
export function MaintenanceDetail() {
  const { id } = useParams()
  const { state, dispatch } = useAppStore()
  const navigate = useNavigate()
  const record = state.maintenanceRequests.find((x) => x.code === id)
  if (!record)
    return <MissingEntity type="yêu cầu" code={id || ""} back="/khoa/bao-tri" />
  const failed = record.status === "Không sửa được"
  return (
    <div>
      <PageHeader
        eyebrow="Chi tiết yêu cầu"
        title={record.code}
        description={record.name}
        actions={<StatusBadge status={record.status} />}
      />
      <Card>
        <Stepper
          steps={
            failed
              ? [...maintenanceSteps.slice(0, 3), "Không sửa được"]
              : maintenanceSteps
          }
          current={
            failed ? 3 : Math.max(0, maintenanceSteps.indexOf(record.status))
          }
        />
      </Card>
      {failed && (
        <div className="banner orange">
          <ShieldAlert />
          <span>
            <strong>Đối tượng không thể sửa chữa</strong>
            <small>Vui lòng lập đề xuất xử lý tiếp theo.</small>
          </span>
          <Link
            className="btn secondary"
            to={
              record.entityType === "Phòng"
                ? `/khoa/de-xuat-csvc/moi?phong=${record.entityId}&loai=cai-tao&yc=${record.code}`
                : `/khoa/thanh-ly?thietBi=${record.entityId}&yc=${record.code}&tab=lap`
            }
          >
            {record.entityType === "Phòng"
              ? "Lập đề xuất cải tạo"
              : "Lập đề xuất thanh lý"}
          </Link>
        </div>
      )}
      <div className="detail-grid">
        <Card title="Thông tin sự cố">
          <dl className="detail-list">
            <div>
              <dt>Đối tượng</dt>
              <dd>
                <EntityLink>{record.entityId || "TS-0001"}</EntityLink>
              </dd>
            </div>
            <div>
              <dt>Loại yêu cầu</dt>
              <dd>Sửa chữa</dd>
            </div>
            <div>
              <dt>Mức khẩn cấp</dt>
              <dd>
                <StatusBadge status="Cao" />
              </dd>
            </div>
            <div>
              <dt>Ngày báo</dt>
              <dd>{formatDate(record.createdAt)}</dd>
            </div>
            <div className="full">
              <dt>Nội dung</dt>
              <dd>{record.details}</dd>
            </div>
          </dl>
        </Card>
        {["Hoàn thành", "Không sửa được"].includes(record.status) ? (
          <Card title="Kết quả xử lý">
            <dl className="detail-list">
              <div>
                <dt>Ngày xử lý</dt>
                <dd>{formatDate(today)}</dd>
              </div>
              <div>
                <dt>Phiếu bảo trì</dt>
                <dd>
                  <EntityLink>BT-0001</EntityLink>
                </dd>
              </div>
              <div>
                <dt>Chi phí</dt>
                <dd>{formatCurrency(1850000)}</dd>
              </div>
              <div>
                <dt>Bảo trì tiếp theo</dt>
                <dd>20/09/2026</dd>
              </div>
              <div className="full">
                <dt>Kết quả</dt>
                <dd>
                  {failed
                    ? "Thiết bị hỏng bo mạch chính, không còn linh kiện phù hợp."
                    : "Đã thay thế linh kiện và kiểm tra vận hành ổn định."}
                </dd>
              </div>
            </dl>
          </Card>
        ) : (
          <Card>
            <EmptyState
              title="Đang chờ kết quả xử lý"
              description="Kết quả và chi phí sẽ hiển thị sau khi QLCSVC hoàn thành."
            />
          </Card>
        )}
      </div>
      {record.status === "Chờ tiếp nhận" && (
        <button
          className="btn secondary danger-text"
          onClick={() => {
            dispatch({
              type: "UPDATE_RECORD",
              collection: "maintenanceRequests",
              id: record.id,
              changes: { unitId: "cancelled" },
            })
            toast(`Đã hủy ${record.code}`)
            navigate("/khoa/bao-tri")
          }}
        >
          Hủy yêu cầu
        </button>
      )}
    </div>
  )
}

export function DisposalPage() {
  const { state, dispatch } = useAppStore()
  const [params, setParams] = useSearchParams()
  const [selected, setSelected] = useState<DomainRecord | null>(null)
  const { assets } = unitData(state)
  const tab = params.get("tab") || "danh-sach"
  const preset = params.get("thietBi") || ""
  const [asset, setAsset] = useState(preset)
  const [reason, setReason] = useState("")
  const rows = state.disposalProposals.filter((x) => x.unitId === facultyId)
  const submit = () => {
    if (!asset || !reason.trim()) return
    const code = `TL-${String(state.disposalProposals.length + 1).padStart(4, "0")}`
    const record = {
      id: `tl-${Date.now()}`,
      code,
      name: `Đề xuất thanh lý ${asset}`,
      status: "Chờ phê duyệt",
      unitId: facultyId,
      entityId: asset,
      createdAt: today,
      details: reason,
    }
    dispatch({ type: "ADD_RECORD", collection: "disposalProposals", record })
    dispatch({
      type: "ADD_NOTIFICATION",
      notification: {
        id: `noti-${Date.now()}`,
        role: "leadership",
        title: `${code} chờ phê duyệt`,
        message: reason,
        createdAt: new Date().toISOString(),
        read: false,
        entityKind: "asset",
        entityId: record.id,
      },
    })
    setSelected(record)
    toast(`Đã gửi đề xuất ${code}`)
  }
  return (
    <div>
      <PageHeader
        eyebrow="Vòng đời tài sản"
        title="Thay thế / thanh lý"
        description="Lập và theo dõi đề xuất xử lý thiết bị không còn phù hợp."
      />
      <div className="tabs">
        <button
          className={tab === "danh-sach" ? "active" : ""}
          onClick={() => setParams({ tab: "danh-sach" })}
        >
          Danh sách
        </button>
        <button
          className={tab === "lap" ? "active" : ""}
          onClick={() => setParams({ tab: "lap" })}
        >
          Lập đề xuất
        </button>
      </div>
      {tab === "danh-sach" ? (
        <div className="content-card">
          <DataTable
            rows={rows}
            keyOf={(x) => x.id}
            columns={[
              {
                key: "code",
                label: "Mã",
                render: (x) => (
                  <button className="table-link" onClick={() => setSelected(x)}>
                    {x.code}
                  </button>
                ),
              },
              {
                key: "asset",
                label: "Thiết bị",
                render: (x) => (
                  <Link
                    className="table-link"
                    to={`/khoa/thiet-bi/${x.entityId || "TS-0001"}`}
                  >
                    {x.entityId || "TS-0001"}
                  </Link>
                ),
              },
              {
                key: "reason",
                label: "Lý do",
                render: (x) => x.details || "Không còn đáp ứng nhu cầu",
              },
              {
                key: "date",
                label: "Ngày",
                render: (x) => formatDate(x.createdAt),
              },
              {
                key: "status",
                label: "Trạng thái",
                render: (x) => <StatusBadge status={x.status} />,
              },
            ]}
          />
        </div>
      ) : (
        <Card title="Thông tin đề xuất">
          <div className="form-grid">
            <Field label="Thiết bị" required>
              <select value={asset} onChange={(e) => setAsset(e.target.value)}>
                <option value="">Chọn thiết bị...</option>
                {assets.map((x) => (
                  <option key={x.id} value={x.code}>
                    {x.code} — {x.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Đề nghị">
              <select>
                <option>Thanh lý</option>
                <option>Thay thế bằng thiết bị mới</option>
              </select>
            </Field>
            <Field label="Lý do" required>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </Field>
            <Field label="Tài liệu đính kèm">
              <input type="file" />
            </Field>
          </div>
          <button className="btn primary" onClick={submit}>
            <Send /> Gửi đề xuất
          </button>
        </Card>
      )}
      <Drawer
        open={!!selected}
        title={selected?.code || ""}
        onClose={() => setSelected(null)}
      >
        {selected && (
          <div className="drawer-detail">
            <StatusBadge status={selected.status} />
            <h3>{selected.name}</h3>
            <p>{selected.details}</p>
            <dl className="detail-list">
              <div>
                <dt>Kết quả duyệt</dt>
                <dd>
                  {selected.status === "Bị từ chối"
                    ? "Không đồng ý"
                    : "Đang chờ xử lý"}
                </dd>
              </div>
              <div>
                <dt>Người đề xuất</dt>
                <dd>Nguyễn Minh Anh</dd>
              </div>
            </dl>
          </div>
        )}
      </Drawer>
    </div>
  )
}

export function RoomList() {
  const { state } = useAppStore()
  const { rooms, assets } = unitData(state)
  const [params, setParams] = useSearchParams()
  const [view, setView] = useState<"card" | "table">("card")
  const status = params.get("tinhTrang") || ""
  const rows = rooms.filter(
    (x) =>
      x.group === "Dạy học" &&
      (!status || status === "dang_sua"
        ? !status || x.status.includes("sửa chữa")
        : status === "xuong_cap"
          ? x.status === "Xuống cấp"
          : x.status === status),
  )
  const cards = [
    ["Tổng phòng", rooms.length, ""],
    [
      "Đang sử dụng",
      rooms.filter((x) => x.status === "Đang sử dụng").length,
      "Đang sử dụng",
    ],
    [
      "Đang sửa chữa",
      rooms.filter((x) => x.status.includes("sửa chữa")).length,
      "dang_sua",
    ],
    [
      "Xuống cấp",
      rooms.filter((x) => x.status === "Xuống cấp").length,
      "xuong_cap",
    ],
  ] as const
  return (
    <div>
      <PageHeader
        eyebrow="Không gian dạy học"
        title="Phòng học và phòng thí nghiệm"
        description="Các phòng nhóm Dạy học đã được phân bổ cho khoa."
        actions={
          <div className="view-toggle">
            <button
              className={view === "card" ? "active" : ""}
              onClick={() => setView("card")}
            >
              <Grid2X2 />
            </button>
            <button
              className={view === "table" ? "active" : ""}
              onClick={() => setView("table")}
            >
              <List />
            </button>
          </div>
        }
      />
      <div className="room-stat-grid">
        {cards.map(([label, value, filter]) => (
          <button
            key={label}
            onClick={() =>
              filter ? setParams({ tinhTrang: filter }) : setParams({})
            }
          >
            <span>{label}</span>
            <strong>{value}</strong>
          </button>
        ))}
      </div>
      <FilterBar search="" onSearch={() => {}} onClear={() => setParams({})}>
        <select>
          <option>Tất cả loại phòng</option>
          <option>Phòng học</option>
          <option>Giảng đường</option>
          <option>Phòng thí nghiệm</option>
          <option>Phòng máy</option>
        </select>
        <select>
          <option>Tất cả tòa nhà</option>
          <option>Tòa A</option>
          <option>Tòa B</option>
        </select>
        <select
          value={status}
          onChange={(e) =>
            setParams(e.target.value ? { tinhTrang: e.target.value } : {})
          }
        >
          <option value="">Mọi tình trạng</option>
          <option>Đang sử dụng</option>
          <option value="dang_sua">Đang sửa chữa</option>
          <option value="xuong_cap">Xuống cấp</option>
        </select>
      </FilterBar>
      {view === "card" ? (
        <div className="room-grid">
          {rows.map((x) => (
            <article
              className={`room-card ${
                x.status.includes("sửa chữa") ? "repairing" : ""
              }`}
              key={x.id}
            >
              <div className="room-card-head">
                <Link to={`/khoa/phong/${x.code}`}>{x.code}</Link>
                <RoomTypeBadge group={x.group} />
              </div>
              <h3>{x.name}</h3>
              <p>
                {x.building} · Tầng {x.floor}
              </p>
              <div className="room-meta">
                <span>{x.capacity} chỗ</span>
                <Link to={`/khoa/thiet-bi?phong=${x.id}`}>
                  {assets.filter((a) => a.roomId === x.id).length} thiết bị
                </Link>
              </div>
              <div className="room-card-foot">
                <StatusBadge status={x.status} />
                {x.type === "Phòng thí nghiệm" && (
                  <span title="Có yêu cầu an toàn">
                    <ShieldAlert />
                  </span>
                )}
                <Link to={`/khoa/bao-tri/moi?doiTuong=${x.code}`}>
                  Báo sự cố
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <FloorPlanGrid
          rooms={rows}
          onSelect={(id) => {
            const room = rows.find((x) => x.id === id)
            if (room) location.href = `/khoa/phong/${room.code}`
          }}
        />
      )}
    </div>
  )
}

export function RoomDetail() {
  const { id } = useParams()
  const { state } = useAppStore()
  const [tab, setTab] = useState("info")
  const room = state.rooms.find((x) => x.code === id)
  if (!room)
    return <MissingEntity type="phòng" code={id || ""} back="/khoa/phong" />
  const assets = state.assets.filter((x) => x.roomId === room.id)
  const request = state.maintenanceRequests.find((x) => x.entityId === room.id)
  return (
    <div>
      <PageHeader
        eyebrow="Chi tiết phòng"
        title={room.name}
        description={`${room.code} · ${room.building}, tầng ${room.floor}`}
        actions={
          <div className="badge-row">
            <RoomTypeBadge group={room.group} />
            <StatusBadge status={room.status} />
          </div>
        }
      />
      {room.status.includes("sửa chữa") && (
        <div className="banner purple">
          <Wrench />
          <span>
            <strong>Phòng đang sửa chữa/cải tạo</strong>
            <small>Hạn chế sử dụng cho đến khi có thông báo mới.</small>
          </span>
          {request && (
            <Link to={`/khoa/bao-tri/${request.code}`}>Xem yêu cầu</Link>
          )}
        </div>
      )}
      <div className="page-actions">
        <Link
          className="btn primary"
          to={`/khoa/bao-tri/moi?doiTuong=${room.code}`}
        >
          <Wrench /> Báo sự cố phòng
        </Link>
        <Link
          className="btn secondary"
          to={`/khoa/de-xuat-csvc/moi?phong=${room.code}&loai=cai-tao`}
        >
          Đề xuất cải tạo/nâng cấp
        </Link>
      </div>
      <div className="tabs">
        {[
          ["info", "Thông tin"],
          ["assets", `Thiết bị trong phòng (${assets.length})`],
          ["maintenance", "Lịch sử bảo trì"],
          ["allocation", "Lịch sử phân bổ"],
        ].map(([key, label]) => (
          <button
            className={tab === key ? "active" : ""}
            key={key}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "info" && (
        <div className="detail-grid">
          <Card>
            <dl className="detail-list">
              <div>
                <dt>Diện tích</dt>
                <dd>{formatArea(room.area)}</dd>
              </div>
              <div>
                <dt>Sức chứa</dt>
                <dd>{room.capacity} chỗ</dd>
              </div>
              <div>
                <dt>Mục đích sử dụng</dt>
                <dd>{room.type}</dd>
              </div>
              <div>
                <dt>Người phụ trách</dt>
                <dd>Nguyễn Minh Anh</dd>
              </div>
            </dl>
          </Card>
          {room.safety && (
            <Card title="Yêu cầu an toàn">
              <div className="safety-list">
                {room.safety.map((x) => (
                  <span key={x}>
                    <CheckCircle2 /> {x}
                  </span>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
      {tab === "assets" && (
        <Card>
          <DataTable
            rows={assets}
            keyOf={(x) => x.id}
            columns={[
              {
                key: "code",
                label: "Mã tài sản",
                render: (x) => (
                  <Link className="table-link" to={`/khoa/thiet-bi/${x.code}`}>
                    {x.code}
                  </Link>
                ),
              },
              { key: "name", label: "Tên", render: (x) => x.name },
              { key: "type", label: "Loại", render: (x) => x.type },
              {
                key: "status",
                label: "Tình trạng",
                render: (x) => <StatusBadge status={x.status} />,
              },
            ]}
          />
        </Card>
      )}
      {(tab === "maintenance" || tab === "allocation") && (
        <Card>
          <Timeline items={state.auditLogs.slice(0, 5).map((x, i) => ({
              title:
                tab === "allocation"
                  ? `Bàn giao phòng BGP-${String(i + 1).padStart(4, "0")}`
                  : `Bảo trì phòng YC-${String(i + 1).padStart(4, "0")}`,
              description: x.actor,
              time: formatDate(x.createdAt),
            }))} />
        </Card>
      )}
      <RelatedPanel>
        <Link className="related-row" to={`/khoa/de-xuat-csvc/CS-0001`}>
          <span>
            <strong>CS-0001</strong>
            <small>Đề xuất nâng cấp phòng</small>
          </span>
        </Link>
        {request && (
          <Link className="related-row" to={`/khoa/bao-tri/${request.code}`}>
            <span>
              <strong>{request.code}</strong>
              <small>Yêu cầu đang mở</small>
            </span>
          </Link>
        )}
      </RelatedPanel>
    </div>
  )
}

export function FacilityProposalPage({ mode }: { mode?: "form" | "detail" }) {
  const { state, dispatch } = useAppStore()
  const { id } = useParams()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const { rooms } = unitData(state)
  const record = state.facilityProposals.find((x) => x.code === id)
  const form = mode === "form" || params.get("tab") === "lap"
  const [type, setType] = useState(
    params.get("loai") === "cai-tao"
      ? "Cải tạo/sửa chữa lớn"
      : "Cấp thêm phòng",
  )
  const [room, setRoom] = useState(params.get("phong") || "")
  const [purpose, setPurpose] = useState("")
  if (mode === "detail") {
    if (!record)
      return (
        <MissingEntity
          type="đề xuất CSVC"
          code={id || ""}
          back="/khoa/de-xuat-csvc"
        />
      )
    const steps = [
      "Nháp",
      "Đã gửi",
      "Đang khảo sát",
      "Chờ phê duyệt",
      "Đã phê duyệt",
      "Đang thực hiện",
      "Hoàn thành",
    ]
    const current = Math.max(0, steps.indexOf(record.status))
    return (
      <div>
        <PageHeader
          eyebrow="Chi tiết đề xuất CSVC"
          title={record.code}
          description={record.name}
          actions={<StatusBadge status={record.status} />}
        />
        <Card>
          <Stepper steps={steps} current={current} />
        </Card>
        <div className="detail-grid">
          <Card title="Nội dung đề xuất">
            <dl className="detail-list">
              <div>
                <dt>Loại</dt>
                <dd>Cải tạo/sửa chữa lớn</dd>
              </div>
              <div>
                <dt>Mức độ</dt>
                <dd>Cao</dd>
              </div>
              <div>
                <dt>Phòng liên quan</dt>
                <dd>
                  <Link className="table-link" to="/khoa/phong/P-A101">
                    P-A101
                  </Link>
                </dd>
              </div>
              <div>
                <dt>Ngày gửi</dt>
                <dd>{formatDate(record.createdAt)}</dd>
              </div>
            </dl>
          </Card>
          <Card title="Kết quả khảo sát">
            <dl className="detail-list">
              <div className="full">
                <dt>Hiện trạng</dt>
                <dd>Hệ thống điện và điều hòa đã xuống cấp.</dd>
              </div>
              <div className="full">
                <dt>Phương án</dt>
                <dd>Thay mới tủ điện, cải tạo trần và hệ thống chiếu sáng.</dd>
              </div>
              <div>
                <dt>Dự toán</dt>
                <dd>{formatCurrency(record.amount || 0)}</dd>
              </div>
              <div>
                <dt>Thời gian</dt>
                <dd>30 ngày</dd>
              </div>
            </dl>
          </Card>
        </div>
        <Card title="Kết quả phê duyệt">
          {current >= 4 ? (
            <p>Đã phê duyệt phương án và dự toán thực hiện.</p>
          ) : (
            <EmptyState title="Chưa có kết quả" />
          )}
        </Card>
      </div>
    )
  }
  const submit = () => {
    const code = `CS-${String(state.facilityProposals.length + 1).padStart(4, "0")}`
    const newRecord = {
      id: `cs-${Date.now()}`,
      code,
      name: purpose || `${type} cho Khoa CNTT`,
      status: "Đã gửi",
      unitId: facultyId,
      entityId: room,
      createdAt: today,
      details: type,
    }
    dispatch({
      type: "ADD_RECORD",
      collection: "facilityProposals",
      record: newRecord,
    })
    dispatch({
      type: "ADD_NOTIFICATION",
      notification: {
        id: `noti-${Date.now()}`,
        role: "facilities",
        title: `${code} vừa được gửi`,
        message: newRecord.name,
        createdAt: new Date().toISOString(),
        read: false,
        entityKind: "room",
        entityId: room,
      },
    })
    toast(`Đã gửi đề xuất ${code}`)
    navigate(`/khoa/de-xuat-csvc/${code}`)
  }
  const rows = state.facilityProposals.filter((x) => x.unitId === facultyId)
  return (
    <div>
      <PageHeader
        eyebrow="Cơ sở vật chất"
        title="Đề xuất CSVC"
        description="Đề xuất cấp thêm, cải tạo hoặc nâng cấp không gian dạy học."
      />
      <div className="tabs">
        <button className={!form ? "active" : ""} onClick={() => setParams({})}>
          Danh sách
        </button>
        <button
          className={form ? "active" : ""}
          onClick={() => setParams({ tab: "lap" })}
        >
          Lập đề xuất
        </button>
      </div>
      {form ? (
        <Card title="Thông tin đề xuất">
          <div className="form-grid">
            <Field label="Loại đề xuất" required>
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option>Cấp thêm phòng</option>
                <option>Cải tạo/sửa chữa lớn</option>
                <option>Nâng cấp</option>
              </select>
            </Field>
            {type === "Cấp thêm phòng" ? (
              <>
                <Field label="Loại phòng mong muốn">
                  <select>
                    <option>Phòng học</option>
                    <option>Giảng đường</option>
                    <option>Phòng thí nghiệm</option>
                    <option>Phòng máy</option>
                    <option>Xưởng thực hành</option>
                  </select>
                </Field>
                <Field label="Sức chứa mong muốn">
                  <input type="number" min="1" defaultValue="40" />
                </Field>
              </>
            ) : (
              <Field label="Phòng liên quan">
                <select value={room} onChange={(e) => setRoom(e.target.value)}>
                  <option value="">Chọn phòng...</option>
                  {rooms.map((x) => (
                    <option key={x.id} value={x.code}>
                      {x.code} — {x.name}
                    </option>
                  ))}
                </select>
              </Field>
            )}
            <Field label="Mục đích" required>
              <textarea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              />
            </Field>
            <Field label="Mức độ cần thiết">
              <select>
                <option>Trung bình</option>
                <option>Cao</option>
                <option>Khẩn</option>
              </select>
            </Field>
            <Field label="Thời gian dự kiến">
              <input type="date" />
            </Field>
            <Field label="Đính kèm">
              <input type="file" />
            </Field>
          </div>
          <button className="btn primary" onClick={submit}>
            <Send /> Gửi đề xuất
          </button>
        </Card>
      ) : (
        <div className="content-card">
          <DataTable
            rows={rows}
            keyOf={(x) => x.id}
            columns={[
              {
                key: "code",
                label: "Mã",
                render: (x) => (
                  <Link
                    className="table-link"
                    to={`/khoa/de-xuat-csvc/${x.code}`}
                  >
                    {x.code}
                  </Link>
                ),
              },
              {
                key: "type",
                label: "Loại",
                render: (x) =>
                  Number(x.code.slice(-1)) % 2
                    ? "Cải tạo/sửa chữa lớn"
                    : "Cấp thêm phòng",
              },
              {
                key: "room",
                label: "Phòng liên quan",
                render: () => (
                  <Link className="table-link" to="/khoa/phong/P-A101">
                    P-A101
                  </Link>
                ),
              },
              { key: "level", label: "Mức độ", render: () => "Cao" },
              {
                key: "date",
                label: "Ngày",
                render: (x) => formatDate(x.createdAt),
              },
              {
                key: "status",
                label: "Trạng thái",
                render: (x) => <StatusBadge status={x.status} />,
              },
            ]}
          />
        </div>
      )}
    </div>
  )
}
