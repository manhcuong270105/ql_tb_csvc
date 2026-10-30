import {
  Archive,
  Bell,
  Boxes,
  Building2,
  CalendarClock,
  ChartNoAxesCombined,
  CircleDollarSign,
  ClipboardCheck,
  ClipboardList,
  DatabaseBackup,
  FileCheck2,
  FileClock,
  FilePlus2,
  Gauge,
  Handshake,
  LayoutDashboard,
  ListTree,
  PackageCheck,
  Settings,
  ShieldCheck,
  UserCog,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react"
import type { Role } from "./store"

export interface NavItem {
  label: string
  path?: string
  icon: LucideIcon
  count?: number
  children?: NavItem[]
  available?: boolean
}
export interface RoleConfig {
  label: string
  areaName: string
  basePath: string
  color: string
  darkSidebar?: boolean
  nav: NavItem[]
  quickActions: string[]
}
const item = (
  label: string,
  path: string,
  icon: LucideIcon,
  available = false,
): NavItem => ({ label, path, icon, available })

export const roleConfigs: Record<Role, RoleConfig> = {
  faculty: {
    label: "Trưởng khoa",
    areaName: "Khu vực Khoa",
    basePath: "/khoa",
    color: "#0D9488",
    quickActions: [
      "Đề xuất mua sắm",
      "Yêu cầu sửa chữa/bảo trì",
      "Đề xuất CSVC",
    ],
    nav: [
      item("Trang chủ", "/khoa", LayoutDashboard, true),
      item("Đề xuất mua sắm", "/khoa/de-xuat", FilePlus2, true),
      item("Thiết bị của khoa", "/khoa/thiet-bi", Boxes, true),
      item("Phòng học và phòng thí nghiệm", "/khoa/phong", Building2, true),
      item("Đề xuất CSVC", "/khoa/de-xuat-csvc", ClipboardList, true),
      item("Phiếu bàn giao", "/khoa/ban-giao", Handshake, true),
      item("Yêu cầu sửa chữa/bảo trì", "/khoa/bao-tri", Wrench, true),
      item("Thay thế/thanh lý", "/khoa/thanh-ly", Archive, true),
      item("Thông báo", "/thong-bao", Bell, true),
    ],
  },
  department: {
    label: "Trưởng phòng ban",
    areaName: "Khu vực Phòng ban",
    basePath: "/phong-ban",
    color: "#EA580C",
    quickActions: [
      "Đề xuất mua sắm",
      "Yêu cầu sửa chữa/bảo trì",
      "Đề xuất CSVC",
    ],
    nav: [
      item("Trang chủ", "/phong-ban", LayoutDashboard, true),
      item("Đề xuất mua sắm", "/phong-ban/de-xuat", FilePlus2),
      item("Thiết bị của phòng ban", "/phong-ban/thiet-bi", Boxes),
      item("Phòng làm việc và phòng họp", "/phong-ban/phong", Building2),
      item("Đề xuất CSVC", "/phong-ban/de-xuat-csvc", ClipboardList),
      item("Phiếu bàn giao", "/phong-ban/ban-giao", Handshake),
      item("Yêu cầu sửa chữa/bảo trì", "/phong-ban/bao-tri", Wrench),
      item("Thay thế/thanh lý", "/phong-ban/thanh-ly", Archive),
      item("Thông báo", "/thong-bao", Bell, true),
    ],
  },
  facilities: {
    label: "Chuyên viên QLCSVC",
    areaName: "Phòng QLCSVC",
    basePath: "/qlcsvc",
    color: "#2563EB",
    quickActions: [
      "Lập phiếu bàn giao",
      "Tiếp nhận thiết bị",
      "Thêm phòng",
      "Phân bổ phòng",
    ],
    nav: [
      item("Trang chủ", "/qlcsvc", LayoutDashboard, true),
      {
        label: "Đề xuất và kế hoạch",
        icon: ClipboardList,
        children: [
          item("Tiếp nhận đề xuất", "/qlcsvc/de-xuat", FileClock),
          item("Kế hoạch mua sắm", "/qlcsvc/ke-hoach", CircleDollarSign),
        ],
      },
      {
        label: "Thiết bị",
        icon: Boxes,
        children: [
          item("Tiếp nhận", "/qlcsvc/thiet-bi/tiep-nhan", PackageCheck),
          item("Danh mục", "/qlcsvc/thiet-bi", ListTree),
          item("Điều chuyển", "/qlcsvc/thiet-bi/dieu-chuyen", Handshake),
        ],
      },
      item("Bàn giao", "/qlcsvc/ban-giao", Handshake),
      {
        label: "Cơ sở vật chất",
        icon: Building2,
        children: [
          item("Tổng quan", "/qlcsvc/csvc", Gauge),
          item("Danh sách phòng", "/qlcsvc/phong", Building2),
          item("Phân bổ phòng", "/qlcsvc/phan-bo", Handshake),
          item("Đề xuất CSVC", "/qlcsvc/de-xuat-csvc", ClipboardList),
        ],
      },
      {
        label: "Bảo trì",
        icon: Wrench,
        children: [
          item("Hàng đợi", "/qlcsvc/bao-tri", FileClock),
          item("Lịch", "/qlcsvc/bao-tri/lich", CalendarClock),
          item(
            "Lịch sử và chi phí",
            "/qlcsvc/bao-tri/lich-su",
            CircleDollarSign,
          ),
        ],
      },
      item("Thanh lý/Ngừng sử dụng", "/qlcsvc/thanh-ly", Archive),
      item("Danh mục", "/qlcsvc/danh-muc", ListTree),
      item("Báo cáo", "/qlcsvc/bao-cao", ChartNoAxesCombined),
      item("Thông báo", "/thong-bao", Bell, true),
    ],
  },
  leadership: {
    label: "Ban lãnh đạo",
    areaName: "Khu vực Ban lãnh đạo",
    basePath: "/lanh-dao",
    color: "#6D28D9",
    quickActions: [],
    nav: [
      item("Trang chủ", "/lanh-dao", LayoutDashboard, true),
      item("Phê duyệt đề xuất", "/lanh-dao/phe-duyet", ClipboardCheck),
      item("Duyệt thanh lý/ngừng sử dụng", "/lanh-dao/thanh-ly", FileCheck2),
      item("Tổng quan thiết bị", "/lanh-dao/thiet-bi", Boxes),
      item("Tổng quan CSVC", "/lanh-dao/csvc", Building2),
      item("Báo cáo, thống kê", "/lanh-dao/bao-cao", ChartNoAxesCombined),
      item("Thông báo", "/thong-bao", Bell, true),
    ],
  },
  admin: {
    label: "Quản trị viên",
    areaName: "Quản trị hệ thống",
    basePath: "/admin",
    color: "#334155",
    darkSidebar: true,
    quickActions: ["Thêm tài khoản", "Gửi thông báo hệ thống"],
    nav: [
      item("Tổng quan", "/admin", LayoutDashboard, true),
      item("Tài khoản", "/admin/tai-khoan", Users),
      item("Khoa", "/admin/khoa", Building2),
      item("Phòng ban", "/admin/phong-ban", Building2),
      item("Phân quyền", "/admin/phan-quyen", ShieldCheck),
      item("Cấu hình", "/admin/cau-hinh", Settings),
      item("Nhật ký hoạt động", "/admin/nhat-ky", ClipboardList),
      item("Sao lưu và khôi phục", "/admin/sao-luu", DatabaseBackup),
    ],
  },
}

export const roleOrder: Role[] = [
  "faculty",
  "department",
  "facilities",
  "leadership",
  "admin",
]
export const roleIcon: Record<Role, LucideIcon> = {
  faculty: Users,
  department: UserCog,
  facilities: Building2,
  leadership: ShieldCheck,
  admin: Settings,
}
