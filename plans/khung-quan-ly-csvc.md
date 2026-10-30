# Kế hoạch: Khung hệ thống quản lý thiết bị và cơ sở vật chất

## 1. Mục tiêu và ranh giới

Xây dựng nền tảng frontend chạy được bằng React 19 + Vite + Tailwind CSS 4 cho hệ thống quản lý thiết bị và cơ sở vật chất trường đại học, toàn bộ nội dung hiển thị bằng tiếng Việt.

Phạm vi lần này chỉ gồm:

- AppShell responsive dùng chung.
- Sidebar, topbar và cấu hình điều hướng riêng cho 5 vai trò.
- Đăng nhập demo, chuyển vai trò demo, đăng xuất và route guard.
- Các route có nội dung thực ở bước này: `/dang-nhap`, 5 route gốc vai trò, `/ho-so`, `/thong-bao`, `/403` và `*` (404).
- Kho trạng thái React dùng chung trong bộ nhớ và toàn bộ dữ liệu mẫu nền tảng.
- Bộ thành phần dùng chung được yêu cầu, ở dạng tái sử dụng được cho các trang nghiệp vụ sau.
- Màn hình khởi động tối giản tại route gốc mỗi vai trò để xác nhận AppShell, không dựng dashboard/thẻ nghiệp vụ trước.

Không thực hiện:

- Các trang danh sách, chi tiết, biểu mẫu, wizard và quy trình nghiệp vụ ở các route menu còn lại.
- Dashboard nghiệp vụ của 5 vai trò.
- Backend, API, cơ sở dữ liệu, xác thực thật hoặc lưu dữ liệu qua lần tải lại trang.
- Đặt lịch mượn phòng theo giờ hay chức năng ngoài đặc tả.

Các mục nghiệp vụ tương lai vẫn xuất hiện đúng nhóm, nhãn và thứ tự trong sidebar nhưng ở trạng thái chưa khả dụng, có tooltip “Sẽ triển khai ở bước tiếp theo”, không điều hướng tới trang placeholder. Các mục có nội dung ở bước này hoạt động bình thường.

## 2. Hiện trạng và quyết định kỹ thuật

### Hiện trạng repository

- Vite 8, React 19, TypeScript 5.7.
- Tailwind CSS 4 đã nối qua `@tailwindcss/vite`.
- Chưa có router, icon library, state library hoặc component library.
- `src/App.tsx` hiện là khung rỗng; `src/index.css` chỉ import Tailwind.
- Dev server do Figma Make quản lý, không khởi chạy thêm.

### Quyết định

- Thêm `react-router-dom` để xử lý nested route, redirect, route guard, breadcrumb và query string.
- Thêm `lucide-react` làm hệ icon nhất quán; không dùng emoji.
- Không thêm state library: dùng `AppStoreProvider` + `useReducer` + các selector/action typed để giữ một nguồn dữ liệu trong bộ nhớ.
- Tách `AuthProvider` khỏi domain store nhưng auth vẫn đọc danh sách tài khoản từ store; phiên demo chỉ tồn tại trong bộ nhớ và reset khi reload.
- Dùng `URLSearchParams` cho state bộ lọc/tab/trang của các component dùng chung; các trang sau có thể dùng lại hook này.
- Dữ liệu mẫu sinh theo seed cố định để mã, số lượng và quan hệ ổn định giữa các lần chạy.
- Dùng CSS variables cho màu vai trò; màu vai trò chỉ áp dụng cho viền đầu sidebar, RoleBadge, nút chính và focus/accent phù hợp.
- Dùng font Inter qua Google Fonts CSS import; có fallback hệ thống.

## 3. Cấu trúc mã dự kiến

```text
src/
  app/
    AppRouter.tsx
    routes.tsx
    routeConfig.ts
  auth/
    AuthContext.tsx
    ProtectedRoute.tsx
    RoleRoute.tsx
    LoginPage.tsx
  layouts/
    AppShell.tsx
    MiniTopbar.tsx
    Sidebar.tsx
    Topbar.tsx
  pages/
    RoleHomePage.tsx
    ProfilePage.tsx
    NotificationsPage.tsx
    ForbiddenPage.tsx
    NotFoundPage.tsx
  components/
    common/
      Breadcrumb.tsx
      QuickSearch.tsx
      NotificationBell.tsx
      StatCard.tsx
      DataTable.tsx
      FilterBar.tsx
      EntityLink.tsx
      StatusBadge.tsx
      RoleBadge.tsx
      RoomTypeBadge.tsx
      Timeline.tsx
      Stepper.tsx
      RelatedPanel.tsx
      ConfirmDialog.tsx
      Drawer.tsx
      Toast.tsx
      EmptyState.tsx
      Skeleton.tsx
      TreeView.tsx
      FloorPlanGrid.tsx
      Calendar.tsx
      PermissionMatrix.tsx
      Tooltip.tsx
  store/
    AppStore.tsx
    actions.ts
    selectors.ts
    types.ts
    seed/
      index.ts
      generators.ts
      referenceData.ts
  hooks/
    useEscapeKey.ts
    useMediaQuery.ts
    useUrlState.ts
  utils/
    formatters.ts
    entityRoutes.ts
    validationMessages.ts
  styles/
    (chỉ thêm nếu global CSS vượt quá mức hợp lý)
```

Các thư mục vai trò nghiệp vụ (`features/khoa`, `features/phong-ban`, `features/qlcsvc`, `features/lanh-dao`, `features/admin`) sẽ được dành cho prompt sau; lần này cấu hình role/menu nằm ở `routeConfig.ts` để tránh tạo trang rỗng giả.

## 4. Mô hình vai trò, auth và route guard

### Vai trò

- `faculty`: Khoa, prefix `/khoa`, màu `#0D9488`.
- `department`: Phòng ban, prefix `/phong-ban`, màu `#EA580C`.
- `facilities`: Phòng QLCSVC, prefix `/qlcsvc`, màu `#2563EB`.
- `leadership`: Ban lãnh đạo, prefix `/lanh-dao`, màu `#6D28D9`.
- `admin`: Admin, prefix `/admin`, màu `#334155`, sidebar tối.

### Luồng đăng nhập

- `/dang-nhap` có mini topbar với logo và tên hệ thống, không có sidebar.
- Form gồm tên đăng nhập/email, mật khẩu, hiển thị/ẩn mật khẩu, ghi nhớ chỉ là UI demo và validation tiếng Việt.
- 5 nút “Tài khoản mẫu”, mỗi nút đăng nhập nhanh bằng một tài khoản hoạt động thuộc vai trò tương ứng.
- Tài khoản khóa không thể đăng nhập và hiển thị lỗi rõ ràng.
- Đăng nhập thành công chuyển tới route gốc của vai trò.
- Nếu đã đăng nhập mà vào `/dang-nhap`, chuyển về route gốc vai trò.

### Guard

- Chưa đăng nhập vào route bảo vệ: chuyển `/dang-nhap`, mang `state.from` để có thể quay lại khi hợp lệ.
- Đã đăng nhập nhưng truy cập prefix vai trò khác: chuyển `/403`.
- `/ho-so` và `/thong-bao` dùng vai trò hiện tại để chọn AppShell, màu và sidebar.
- `/403` và 404:
  - Đã đăng nhập: nằm trong AppShell của vai trò hiện tại.
  - Chưa đăng nhập: dùng mini topbar và nút “Đăng nhập”.
- “Chuyển vai trò (demo)” mở menu 5 vai trò, chọn vai trò sẽ đổi sang tài khoản mẫu mặc định của vai trò đó và chuyển đúng route gốc.
- Đăng xuất xóa phiên trong bộ nhớ và về `/dang-nhap`.

## 5. AppShell và điều hướng

### Sidebar

- Logo trường dạng mark SVG/CSS đơn giản, tên khu vực và RoleBadge.
- Cấu hình đầy đủ menu đúng đặc tả cho cả 5 vai trò, gồm nhóm và submenu.
- Chỉ route có nội dung lần này được bấm; route nghiệp vụ tương lai hiển thị disabled và tooltip.
- Hỗ trợ expanded/collapsed trên desktop; collapsed chỉ hiện icon và tooltip.
- Tablet/điện thoại dùng drawer sidebar mở từ hamburger, có backdrop, khóa scroll và đóng bằng Esc.
- Nhóm submenu tự mở khi có route active; logic active dùng prefix dài nhất để sau này trang con vẫn sáng mục cha.
- API menu hỗ trợ `pendingCount`; seed count lấy từ selector dù chưa có trang đích.
- Cuối sidebar có Hồ sơ và Đăng xuất.

### Topbar

- Nút mở/thu sidebar.
- Breadcrumb generated từ route config; mỗi cấp có link khi route tồn tại.
- QuickSearch tìm không dấu/không phân biệt hoa thường theo mã và tên của đề xuất, tài sản, phòng, phiếu, yêu cầu; debounce nhẹ; kết quả nhóm theo loại.
- Với route chi tiết chưa tồn tại trong bước này, kết quả mở Drawer chỉ xem tóm tắt thay vì điều hướng chết. Hạ tầng `entityRoutes` sẽ sẵn sàng chuyển thành link ở prompt sau.
- Nút “+ Tạo nhanh”:
  - Hiện danh sách đúng theo vai trò.
  - Ban lãnh đạo không hiển thị.
  - Các hành động chưa có form bị disabled kèm tooltip “Sẽ triển khai ở bước tiếp theo”.
- NotificationBell có số chưa đọc, dropdown 5 thông báo mới nhất, đánh dấu đã đọc khi bấm; “Xem tất cả” tới `/thong-bao`.
- Avatar menu: Hồ sơ, Chuyển vai trò demo, Đăng xuất.

### Màn hình route gốc

- Chỉ là trang chào tối giản trong AppShell: tên khu vực, tên người dùng, mô tả ngắn và ghi chú các phân hệ sẽ được bổ sung ở bước tiếp theo.
- Không có StatCard, biểu đồ, bảng hoặc số liệu dashboard để tránh làm trước phạm vi.

## 6. Kho trạng thái và dữ liệu mẫu

### Store API

`AppState` chứa:

- `accounts`, `faculties`, `departments`, `suppliers`.
- `campuses`, `buildings`, `floors`, `rooms`.
- `purchaseProposals`, `purchasePlans`, `assets`.
- `equipmentHandovers`, `roomHandovers`, `roomAllocations`.
- `facilityProposals`, `maintenanceRequests`, `maintenanceRecords`.
- `disposalProposals`, `notifications`, `auditLogs`, `backups`.
- `settings`, cùng bộ đếm mã tiếp theo.

Action nền tảng:

- `createEntity`, `updateEntity`, `updateEntityStatus`.
- `markNotificationRead`, `markAllNotificationsRead`.
- `appendNotification`, `appendAuditLog`.
- `batch` để một thao tác nghiệp vụ tương lai cập nhật atomically nhiều collection.

Mọi action thay đổi quan trọng có helper để tự thêm audit log và thông báo liên quan. Không triển khai state machine nghiệp vụ đầy đủ ở lần này, nhưng types/status unions và các helper chuyển trạng thái được chuẩn bị để trang sau dùng chung.

### Kiểu dữ liệu và liên kết

- Dùng ID nội bộ ổn định và mã hiển thị riêng (`DX-0001`, `KH-0001`, `TS-0001`, `P-A101`, `BG-0001`, `BGP-0001`, `YC-0001`, `BT-0001`, `TL-0001`, `CS-0001`).
- Quan hệ lưu bằng ID: thiết bị → phòng/đơn vị/kế hoạch; phòng → tòa/tầng/đơn vị; phiếu/yêu cầu → đối tượng và lịch sử.
- Đơn vị dùng union `{ type: 'faculty' | 'department'; id }`; không trộn Khoa và Phòng ban.
- Ngày lưu ISO nội bộ, format UI `dd/MM/yyyy`.
- Tiền lưu number, format `vi-VN` thành dạng `25.000.000 ₫`.
- Diện tích lưu number và hiển thị `m²`.

### Seed cố định

Tạo đúng quy mô yêu cầu:

- 4 Khoa, 3 Phòng ban.
- 2–3 tài khoản mỗi vai trò, Admin 2, gồm vài tài khoản khóa; tài khoản demo mặc định luôn hoạt động.
- 2 cơ sở, 4 tòa A–D, mỗi tòa 3–5 tầng, khoảng 40 phòng đúng phân bố loại đã nêu; đủ tình trạng và có phòng chưa phân bổ.
- Quan hệ phân bổ tuân thủ: Dạy học chỉ Khoa, Hành chính chỉ Phòng ban, Dùng chung không phân bổ.
- 12–15 đề xuất mua sắm đủ trạng thái; 3 kế hoạch.
- 6–8 đề xuất CSVC, gồm dữ liệu khảo sát.
- 50–70 thiết bị, mỗi record là một tài sản riêng, đặt trong phòng hợp lệ; có thiết bị sắp hết bảo hành/đến hạn bảo trì.
- 8–10 phiếu bàn giao thiết bị; 4–5 phiếu bàn giao phòng.
- 12–15 yêu cầu bảo trì cho cả thiết bị/phòng; có phiếu bảo trì và chi phí.
- Một số đề xuất thanh lý/ngừng sử dụng.
- 5–6 nhà cung cấp, 60–80 audit log, 4–5 backup.
- Thông báo đủ cho cả 5 vai trò và có trạng thái đã/chưa đọc.

Sau khi seed, chạy hàm kiểm tra invariant ở môi trường development để phát hiện mã trùng, quan hệ mồ côi, phân bổ sai nhóm phòng, thiết bị trỏ tới phòng không tồn tại hoặc trạng thái không hợp lệ.

## 7. Thành phần dùng chung

Tất cả component có TypeScript props rõ ràng, keyboard focus, aria label phù hợp, trạng thái disabled/loading/empty khi cần:

- `Breadcrumb`: danh sách cấp điều hướng có link.
- `QuickSearch`: combobox nhóm kết quả, điều hướng bàn phím, drawer fallback.
- `NotificationBell`: count, popover 5 dòng, mark-read.
- `StatCard`: title/value/trend/icon, click hoặc link với query string.
- `DataTable<T>`: columns typed, sort, row action, selection, loading/empty, pagination; state có thể điều khiển từ URL.
- `FilterBar`: search/select/date filters, clear, đồng bộ URL qua `useUrlState`.
- `EntityLink`: resolve link theo vai trò; nếu không có route hợp lệ thì mở read-only Drawer.
- `StatusBadge`, `RoleBadge`, `RoomTypeBadge`: mapping màu/chữ đúng đặc tả, không chỉ dựa vào màu.
- `Timeline`: lịch sử theo thời gian.
- `Stepper`: bước hiện tại/hoàn thành/lỗi, responsive.
- `RelatedPanel`: danh sách entity liên quan bằng `EntityLink`.
- `ConfirmDialog`: focus trap cơ bản, Esc/X, destructive variant.
- `Drawer`: phải/trái, focus management, Esc/X, backdrop.
- `Toast`: provider toàn app, success/error/info, action link “Xem”, tự đóng có thể pause khi hover.
- `EmptyState`: icon, mô tả, CTA tùy chọn.
- `Skeleton`: text/card/table primitives.
- `TreeView`: node mở/đóng, chọn bằng chuột/bàn phím.
- `FloorPlanGrid`: grid phòng theo tầng, trạng thái và loại phòng.
- `Calendar`: tháng, ngày sự kiện, chuyển tháng; không hỗ trợ đặt lịch.
- `PermissionMatrix`: hàng quyền/cột vai trò, read-only hoặc editable qua props.
- `Tooltip`: dùng cho disabled reason và sidebar collapsed.

Các component phức tạp chưa có trang nghiệp vụ sẽ được triển khai độc lập và export qua barrel file, không tạo gallery route công khai.

## 8. Thiết kế và responsive

- Nền `#F8FAFC`, card trắng bo 12px, border xám nhạt và shadow nhẹ.
- Thương hiệu chính `#1E3A8A`–`#2563EB`; màu vai trò theo đặc tả.
- Typography Inter, cỡ nền 14–16px, hierarchy rõ.
- Sidebar desktop khoảng 272px, collapsed khoảng 76px; topbar sticky.
- Mobile: topbar gọn, breadcrumb rút ngắn, search mở overlay, sidebar dạng drawer.
- Admin dùng sidebar slate tối; các vai trò khác dùng nền sáng với viền đầu theo màu vai trò.
- Badge trạng thái và loại phòng mapping chính xác theo hệ màu yêu cầu.
- Focus ring rõ, contrast WCAG AA, hit target tối thiểu hợp lý, thao tác chính dùng được bằng bàn phím.
- Modal/drawer phủ vùng nội dung, không làm mất AppShell; mini-shell chỉ áp dụng khi chưa đăng nhập.

## 9. Validation và format nền tảng

Tạo module hằng số cho toàn bộ thông báo validation tiếng Việt trong đặc tả để các form sau tái sử dụng, gồm required, số lượng, giá trị âm, mã trùng, diện tích, số lượng bàn giao, quy tắc phân bổ phòng, thiết bị còn trong phòng, lý do từ chối, kết quả đã tồn tại, email/tên đăng nhập, mật khẩu và ràng buộc đơn vị.

Formatter dùng chung:

- `formatDate(iso) -> dd/MM/yyyy`.
- `formatCurrency(value) -> 25.000.000 ₫`.
- `formatArea(value) -> X m²`.
- `normalizeSearchText` loại dấu tiếng Việt để tìm kiếm.

## 10. Kiểm thử và tiêu chí hoàn thành

### Kiểm tra tự động

- Chạy formatter theo script repo: `pnpm format`.
- Chạy build production: `pnpm build` vì đây là thay đổi nền tảng rộng và thêm dependency.
- Không khởi chạy dev server riêng.

### Kiểm tra hành vi thủ công trên preview hiện có

1. Mở `/dang-nhap`, kiểm tra mini topbar và responsive.
2. Dùng cả 5 nút tài khoản mẫu; mỗi nút vào đúng route gốc, đúng màu/sidebar.
3. Thử truy cập prefix vai trò khác và xác nhận `/403` vẫn trong AppShell.
4. Đăng xuất rồi truy cập route bảo vệ; xác nhận chuyển về đăng nhập.
5. Kiểm tra 403/404 khi đã và chưa đăng nhập.
6. Thu gọn sidebar desktop; mở/đóng mobile drawer bằng nút, backdrop và Esc.
7. Kiểm tra các nhóm menu, disabled tooltip và các mục `/ho-so`, `/thong-bao`.
8. QuickSearch tìm được mã thiết bị/phòng/đề xuất không dấu và mở drawer tóm tắt.
9. Chuông hiển thị count, 5 thông báo, bấm một dòng cập nhật đã đọc đồng thời ở trang thông báo.
10. Chuyển vai trò demo từ avatar, kiểm tra shell và redirect.
11. Kiểm tra focus/keyboard cho menu, popover, dialog, drawer và search.
12. Kiểm tra seed invariants và console không có lỗi runtime.

### Điều kiện nghiệm thu

- Không có trang nghiệp vụ tương lai hoặc dashboard được dựng trước.
- 5 khu vực có shell/layout/màu riêng và guard đúng.
- Một store duy nhất cung cấp dữ liệu quan hệ đầy đủ cho các prompt sau.
- Tất cả component dùng chung được export và có API typed, không phụ thuộc dữ liệu hard-code.
- Toàn bộ nhãn UI bằng tiếng Việt; biến/hàm bằng tiếng Anh.
- Build và format hoàn tất thành công, hoặc blocker môi trường được báo rõ.
