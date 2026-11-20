-- Thêm cờ "Nổi bật": KOL nào được tick sẽ hiện ở mục "Top profile" giữa trang chủ (trước đây gõ cứng trong mã).
-- Chỉ chạy phần nạp dữ liệu ban đầu ĐÚNG MỘT LẦN (khi cột chưa tồn tại), để chạy lại không ghi đè chỉnh sửa trong trang quản trị.
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'kols' and column_name = 'is_featured'
  ) then
    alter table public.kols add column is_featured boolean not null default false;

    -- Hai KOL đang có trong mục Top profile cũ.
    update public.kols set is_featured = true where slug in ('khoa-pug--6858', 'quan-khong-go-5mtl');

    -- Huỳnh Khánh Đông: ảnh cũ đã hỏng nên tạo ở trạng thái ẨN; vào admin tải ảnh lên rồi chọn "Hiển thị ở trang chủ".
    insert into public.kols (slug, name, nickname, avatar, province, fields, sort_order, is_published, is_featured)
    values ('huynh-khanh-dong-5220', 'Huỳnh Khánh Đông', 'Huỳnh Khánh Đông', '', 'Thành phố Hồ Chí Minh', array['fashion','streamingAndModel','beauty'], 9, false, true)
    on conflict (slug) do nothing;
  end if;
end $$;

create index if not exists kols_featured_idx on public.kols (is_featured, is_published, sort_order);
