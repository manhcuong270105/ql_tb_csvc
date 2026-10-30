import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react"

export type Role = "faculty" | "department" | "facilities" | "leadership" | "admin"
export type UnitType = "faculty" | "department"
export type EntityKind = "asset" | "room" | "proposal" | "plan" | "handover" | "maintenance"

export interface Account {
  id: string
  username: string
  password: string
  name: string
  email: string
  phone?: string
  role: Role
  unitId?: string
  locked?: boolean
  mustChangePassword?: boolean
}

export interface Unit {
  id: string
  code: string
  name: string
  type: UnitType
  active: boolean
}
export interface Room {
  id: string
  code: string
  name: string
  campusId: string
  building: string
  floor: number
  type: string
  group: "Dạy học" | "Hành chính" | "Dùng chung"
  area: number
  capacity: number
  status: string
  unitId?: string
  safety?: string[]
}
export interface Asset {
  id: string
  code: string
  assetCode: string
  name: string
  type: string
  supplierId: string
  purchaseDate: string
  price: number
  warrantyEnd: string
  status: string
  roomId?: string
  unitId?: string
  planId?: string
  nextMaintenance?: string
}
export interface DomainRecord {
  id: string
  code: string
  name: string
  status: string
  unitId?: string
  entityType?: "Thiết bị" | "Phòng"
  entityId?: string
  amount?: number
  createdAt: string
  details?: string
}
export interface Notification {
  id: string
  role: Role
  title: string
  message: string
  createdAt: string
  read: boolean
  entityKind?: EntityKind
  entityId?: string
}
export interface AuditLog {
  id: string
  actor: string
  action: string
  target: string
  createdAt: string
}
export interface Backup {
  id: string
  name: string
  createdAt: string
  size: string
  status: string
}
interface Campus {
  id: string
  name: string
  address: string
}
interface Supplier {
  id: string
  name: string
}
interface Settings {
  maintenanceWarningDays: number
  passwordMinLength: number
}

export interface AppState {
  accounts: Account[]
  faculties: Unit[]
  departments: Unit[]
  campuses: Campus[]
  rooms: Room[]
  assets: Asset[]
  suppliers: Supplier[]
  purchaseProposals: DomainRecord[]
  purchasePlans: DomainRecord[]
  facilityProposals: DomainRecord[]
  equipmentHandovers: DomainRecord[]
  roomHandovers: DomainRecord[]
  maintenanceRequests: DomainRecord[]
  maintenanceRecords: DomainRecord[]
  disposalProposals: DomainRecord[]
  notifications: Notification[]
  auditLogs: AuditLog[]
  backups: Backup[]
  settings: Settings
}

const faculties: Unit[] = [
  ["K-CNTT", "CNTT", "Khoa Công nghệ thông tin"],
  ["K-CK", "CK", "Khoa Cơ khí"],
  ["K-KT", "KT", "Khoa Kinh tế"],
  ["K-NN", "NN", "Khoa Ngoại ngữ"],
].map(([id, code, name]) => ({ id, code, name, type: "faculty", active: true }))
const departments: Unit[] = [
  ["PB-DT", "DT", "Phòng Đào tạo"],
  ["PB-HCTH", "HCTH", "Phòng Hành chính – Tổng hợp"],
  ["PB-TCKT", "TCKT", "Phòng Tài chính – Kế toán"],
].map(([id, code, name]) => ({
  id,
  code,
  name,
  type: "department",
  active: true,
}))

const roleSeeds: {
  role: Role
  prefix: string
  names: string[]
  unitIds?: string[]
}[] = [
  {
    role: "faculty",
    prefix: "khoa",
    names: ["Nguyễn Minh Anh", "Trần Quốc Bảo", "Lê Thu Hà"],
    unitIds: faculties.map((x) => x.id),
  },
  {
    role: "department",
    prefix: "phongban",
    names: ["Phạm Hoàng Nam", "Vũ Ngọc Lan", "Đỗ Anh Tuấn"],
    unitIds: departments.map((x) => x.id),
  },
  {
    role: "facilities",
    prefix: "qlcsvc",
    names: ["Lê Đức Long", "Nguyễn Hải Yến", "Phan Tuấn Kiệt"],
  },
  {
    role: "leadership",
    prefix: "lanhdao",
    names: ["PGS. Nguyễn Văn Sơn", "TS. Trần Mai Phương"],
  },
  {
    role: "admin",
    prefix: "admin",
    names: ["Quản trị hệ thống", "Trần Kỹ Thuật"],
  },
]
const accounts: Account[] = roleSeeds.flatMap((seed) =>
  seed.names.map((name, i) => ({
    id: `${seed.prefix}-${i + 1}`,
    username: `${seed.prefix}${i + 1}`,
    password: "Demo@123",
    name,
    email: `${seed.prefix}${i + 1}@university.edu.vn`,
    phone: `09${String(10000000 + i * 123456).slice(0, 8)}`,
    role: seed.role,
    unitId: seed.unitIds?.[i % seed.unitIds.length],
    locked: i === 2 && (seed.role === "faculty" || seed.role === "department"),
    mustChangePassword: i === 1,
  })),
)

const roomTypes = [
  ...Array(10).fill(["Phòng học", "Dạy học"]),
  ...Array(3).fill(["Giảng đường", "Dạy học"]),
  ...Array(6).fill(["Phòng thí nghiệm", "Dạy học"]),
  ...Array(3).fill(["Phòng máy", "Dạy học"]),
  ...Array(2).fill(["Xưởng thực hành", "Dạy học"]),
  ...Array(2).fill(["Văn phòng khoa/bộ môn", "Dạy học"]),
  ...Array(6).fill(["Phòng làm việc", "Hành chính"]),
  ...Array(3).fill(["Phòng họp", "Hành chính"]),
  ...Array(2).fill(["Kho", "Hành chính"]),
  ["Hội trường", "Dùng chung"],
  ["Thư viện", "Dùng chung"],
] as [string, Room["group"]][]
const statuses = [
  "Đang sử dụng",
  "Trống",
  "Đang sửa chữa/cải tạo",
  "Xuống cấp",
  "Ngừng sử dụng",
]
const rooms: Room[] = roomTypes.map(([type, group], i) => {
  const building = ["A", "B", "C", "D"][Math.floor(i / 10)]
  const floor = (i % 4) + 1
  const unitList =
    group === "Dạy học" ? faculties : group === "Hành chính" ? departments : []
  return {
    id: `room-${i + 1}`,
    code: `P-${building}${floor}${String((i % 10) + 1).padStart(2, "0")}`,
    name: `${type} ${building}.${floor}${(i % 10) + 1}`,
    campusId: i < 20 ? "cs-1" : "cs-2",
    building: `Tòa ${building}`,
    floor,
    type,
    group,
    area: 42 + (i % 6) * 12,
    capacity: 20 + (i % 5) * 10,
    status: statuses[i % statuses.length],
    unitId: i % 7 === 0 ? undefined : unitList[i % unitList.length]?.id,
    safety:
      type === "Phòng thí nghiệm" ? ["PCCC", "Hóa chất", "Điện"] : undefined,
  }
})

const suppliers = [
  "Công ty Thiết bị Sao Việt",
  "Công ty Công nghệ Minh Long",
  "Nội thất Hòa Bình",
  "Thiết bị Giáo dục An Phát",
  "Công ty Mạng Đại Dương",
  "Kỹ thuật Đông Á",
].map((name, i) => ({ id: `ncc-${i + 1}`, name }))
const assetNames = [
  "Máy tính để bàn",
  "Máy chiếu Epson",
  "Điều hòa Daikin",
  "Bộ bàn ghế",
  "Switch mạng Cisco",
  "Kính hiển vi",
  "Máy CNC mini",
  "Máy in đa năng",
]
const assetStatuses = [
  "Đang sử dụng",
  "Sẵn sàng bàn giao",
  "Đang bảo trì/sửa chữa",
  "Hỏng",
  "Chờ thanh lý",
  "Đã thanh lý",
]
const assets: Asset[] = Array.from({ length: 64 }, (_, i) => {
  const room = rooms[i % rooms.length]
  return {
    id: `asset-${i + 1}`,
    code: `TS-${String(i + 1).padStart(4, "0")}`,
    assetCode: `ĐH-${2021 + (i % 5)}-${String(i + 1).padStart(5, "0")}`,
    name: assetNames[i % assetNames.length],
    type: assetNames[i % assetNames.length],
    supplierId: suppliers[i % suppliers.length].id,
    purchaseDate: `${2021 + (i % 5)}-${String((i % 12) + 1).padStart(2, "0")}-15`,
    price: 3500000 + (i % 12) * 2250000,
    warrantyEnd: `2026-${String((i % 12) + 1).padStart(2, "0")}-20`,
    status: assetStatuses[i % assetStatuses.length],
    roomId: i % 9 === 0 ? undefined : room.id,
    unitId: room.unitId,
    planId: `plan-${(i % 3) + 1}`,
    nextMaintenance: `2026-${String(((i + 2) % 12) + 1).padStart(2, "0")}-10`,
  }
})

const makeRecords = (
  count: number,
  prefix: string,
  statusesList: string[],
  label: string,
): DomainRecord[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `${prefix.toLowerCase()}-${i + 1}`,
    code: `${prefix}-${String(i + 1).padStart(4, "0")}`,
    name: `${label} ${i + 1}`,
    status: statusesList[i % statusesList.length],
    unitId: [...faculties, ...departments][i % 7].id,
    createdAt: `2026-${String((i % 3) + 1).padStart(2, "0")}-${String((i % 25) + 1).padStart(2, "0")}`,
    amount: 12000000 + i * 3500000,
    details:
      i % 2
        ? "Đã cập nhật đầy đủ hồ sơ và dự toán."
        : "Đang chờ đơn vị liên quan xử lý.",
  }))

const proposalStatuses = [
  "Nháp",
  "Đã gửi",
  "Đã tiếp nhận",
  "Chờ phê duyệt",
  "Đã phê duyệt",
  "Bị từ chối",
  "Đang mua sắm",
  "Đã nhận hàng",
  "Đã bàn giao",
]
const maintenanceStatuses = [
  "Chờ tiếp nhận",
  "Đã tiếp nhận",
  "Đang sửa chữa",
  "Hoàn thành",
  "Không sửa được",
]
const notifications: Notification[] = Array.from({ length: 32 }, (_, i) => ({
  id: `noti-${i + 1}`,
  role: roleSeeds[i % 5].role,
  title: [
    "Có đề xuất mới cần xử lý",
    "Phiếu bàn giao chờ xác nhận",
    "Sắp đến hạn bảo trì",
    "Kết quả phê duyệt đã có",
  ][i % 4],
  message: `Thông báo mẫu liên quan đến hồ sơ ${["DX", "BG", "YC", "CS"][i % 4]}-${String((i % 15) + 1).padStart(4, "0")}.`,
  createdAt: `2026-03-${String(20 - (i % 18)).padStart(2, "0")}T${String(8 + (i % 9)).padStart(2, "0")}:00:00`,
  read: i % 3 === 0,
  entityKind: i % 2 ? "proposal" : "maintenance",
}))

export const initialState: AppState = {
  accounts,
  faculties,
  departments,
  campuses: [
    { id: "cs-1", name: "Cơ sở chính", address: "123 Nguyễn Trãi, Hà Nội" },
    { id: "cs-2", name: "Cơ sở thực hành", address: "45 Lê Văn Lương, Hà Nội" },
  ],
  rooms,
  assets,
  suppliers,
  purchaseProposals: makeRecords(15, "DX", proposalStatuses, "Đề xuất mua sắm"),
  purchasePlans: makeRecords(
    3,
    "KH",
    ["Chờ phê duyệt", "Đã phê duyệt", "Đang mua sắm"],
    "Kế hoạch mua sắm",
  ),
  facilityProposals: makeRecords(
    8,
    "CS",
    [
      "Nháp",
      "Đã gửi",
      "Đang khảo sát",
      "Chờ phê duyệt",
      "Đã phê duyệt",
      "Đang thực hiện",
      "Hoàn thành",
    ],
    "Đề xuất cơ sở vật chất",
  ),
  equipmentHandovers: makeRecords(
    10,
    "BG",
    ["Chờ xác nhận", "Đã xác nhận"],
    "Phiếu bàn giao thiết bị",
  ),
  roomHandovers: makeRecords(
    5,
    "BGP",
    ["Chờ xác nhận", "Đã xác nhận"],
    "Phiếu bàn giao phòng",
  ),
  maintenanceRequests: makeRecords(
    15,
    "YC",
    maintenanceStatuses,
    "Yêu cầu bảo trì",
  ),
  maintenanceRecords: makeRecords(8, "BT", ["Hoàn thành"], "Phiếu bảo trì"),
  disposalProposals: makeRecords(
    6,
    "TL",
    ["Đã gửi", "Chờ phê duyệt", "Đã phê duyệt", "Bị từ chối"],
    "Đề xuất thanh lý/ngừng sử dụng",
  ),
  notifications,
  auditLogs: Array.from({ length: 72 }, (_, i) => ({
    id: `log-${i + 1}`,
    actor: accounts[i % accounts.length].name,
    action: ["Tạo mới", "Cập nhật", "Chuyển trạng thái", "Đăng nhập"][i % 4],
    target: `Đối tượng #${i + 1}`,
    createdAt: `2026-03-${String((i % 28) + 1).padStart(2, "0")}T10:30:00`,
  })),
  backups: Array.from({ length: 5 }, (_, i) => ({
    id: `backup-${i + 1}`,
    name: `Sao lưu tự động ${i + 1}`,
    createdAt: `2026-0${i + 1}-01T02:00:00`,
    size: `${120 + i * 14} MB`,
    status: "Hoàn thành",
  })),
  settings: { maintenanceWarningDays: 30, passwordMinLength: 8 },
}

export type Action = {
  type: "MARK_NOTIFICATION_READ"
  id: string
} | {
  type: "MARK_ALL_READ"
  role: Role
} | {
  type: "UPDATE_RECORD"
  collection: keyof AppState
  id: string
  changes: Record<string, unknown>
} | {
  type: "ADD_AUDIT"
  log: AuditLog
} | {
  type: "ADD_RECORD"
  collection: keyof AppState
  record: Record<string, unknown>
} | {
  type: "ADD_NOTIFICATION"
  notification: Notification
}

function reducer(state: AppState, action: Action): AppState {
  if (action.type === "MARK_NOTIFICATION_READ")
    return {
      ...state,
      notifications: state.notifications.map((n) =>
        n.id === action.id ? { ...n, read: true } : n,
      ),
    }
  if (action.type === "MARK_ALL_READ")
    return {
      ...state,
      notifications: state.notifications.map((n) =>
        n.role === action.role ? { ...n, read: true } : n,
      ),
    }
  if (action.type === "ADD_AUDIT")
    return { ...state, auditLogs: [action.log, ...state.auditLogs] }
  if (action.type === "ADD_NOTIFICATION")
    return {
      ...state,
      notifications: [action.notification, ...state.notifications],
    }
  if (action.type === "ADD_RECORD") {
    const value = state[action.collection]
    if (!Array.isArray(value)) return state
    return { ...state, [action.collection]: [action.record, ...value] }
  }
  if (action.type === "UPDATE_RECORD") {
    const value = state[action.collection]
    if (!Array.isArray(value)) return state
    return {
      ...state,
      [action.collection]: value.map((item) =>
        item.id === action.id ? { ...item, ...action.changes } : item,
      ),
    }
  }
  return state
}

const StoreContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<Action>
} | null>(null)
export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const value = useMemo(() => ({ state, dispatch }), [state])
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
export function useAppStore() {
  const value = useContext(StoreContext)
  if (!value)
    throw new Error("useAppStore phải được dùng trong AppStoreProvider")
  return value
}

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat("vi-VN").format(new Date(value))
export const formatCurrency = (value: number) =>
  `${new Intl.NumberFormat("vi-VN").format(value)} ₫`
export const formatArea = (value: number) =>
  `${new Intl.NumberFormat("vi-VN").format(value)} m²`
export const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()

export const validationMessages = {
  required: (field: string) => `Vui lòng nhập ${field}.`,
  positiveInteger: "Số lượng phải là số nguyên dương.",
  nonNegative: "Giá trị không được âm.",
  duplicateAssetCode: "Mã thiết bị đã tồn tại, vui lòng nhập mã khác.",
  duplicateRoomCode: "Mã phòng đã tồn tại.",
  positiveArea: "Diện tích phải lớn hơn 0.",
  invalidEmail: "Email không hợp lệ.",
  rejectionReason: "Vui lòng nhập lý do từ chối.",
}
