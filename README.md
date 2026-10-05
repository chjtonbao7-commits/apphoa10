# Thầy Schrödinger · Cấu trúc lớp vỏ electron nguyên tử

Ứng dụng học tập cho học sinh lớp 10 (Hóa học 10 – Bài 3), tích hợp phát triển năng lực số **NLS 5.3.NC1a**. Học sinh đăng nhập bằng họ tên và lớp, rồi học cùng một trợ lí AI nhập vai nhà vật lý **Erwin Schrödinger** — người luôn gợi mở bằng câu hỏi thay vì đưa đáp án.

## Tính năng

- **Đăng nhập** bằng họ và tên + lớp; tiến trình được lưu lại.
- **Trò chuyện với Thầy Schrödinger**: trả lời ngắn (2–4 câu), luôn kết thúc bằng một câu hỏi gợi mở, bám sát mô hình hiện đại, hình dạng AO s/p, nguyên lí vững bền, Pauli, quy tắc Hund; khuyến khích dùng PhET, Orbital Viewer, ChemDoodle, Canva, PowerPoint.
- **Phòng thí nghiệm ô orbital**: tự điền ↑/↓ vào ô cho các nguyên tố Z = 1–20 và nhận gợi ý theo từng quy tắc bị vi phạm.
- **Thử thách 10 câu** theo 5 chủ đề, có gợi ý cho câu sai.
- **Nhiệm vụ năng lực số**: 4 nhiệm vụ, nộp minh chứng (ghi chú hoặc link sản phẩm Canva/PowerPoint/video).
- **Kết quả của em**: chỉ số tổng hợp, xếp loại, điểm mạnh – cần củng cố – bước tiếp theo.
- **Thống kê lớp (giáo viên)** tại `/thong-ke`: phân bố điểm, xếp loại, mức nắm vững theo chủ đề, tỉ lệ hoàn thành NLS, lỗi quy tắc thường gặp, gợi ý giảng dạy, bảng phân tích cá nhân hóa từng học sinh và xuất CSV.

## Công nghệ

TanStack Start (React 19) · Tailwind CSS 4 · TanStack AI + Claude qua Netlify AI Gateway · Netlify Database (Postgres) + Drizzle ORM · Netlify.

## Chạy trên máy

```bash
pnpm install
netlify dev   # cần Netlify CLI và site đã liên kết để có AI Gateway + Database
```

Khi thay đổi `db/schema.ts`, tạo migration bằng `npx drizzle-kit generate --name <ten_thay_doi>`; Netlify tự áp dụng migration khi deploy.

## Hướng phát triển

- Đăng nhập cho giáo viên để bảo vệ trang thống kê.
- Nhận xét bằng AI cho từng học sinh trên trang thống kê.
- Mở rộng Phòng thí nghiệm tới Z = 36 (bao gồm trường hợp đặc biệt Cr, Cu).
