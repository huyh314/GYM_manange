-- Enable Row Level Security (RLS) cho các bảng
alter table packages enable row level security;
alter table user_packages enable row level security;
alter table sessions enable row level security;
alter table users enable row level security;

-- Policies cho bảng `packages`
create policy "Cho phép tất cả đọc packages" on packages for select to public using (true);
create policy "Chỉ Admin được sửa packages" on packages for all to authenticated using (auth.jwt() ->> 'app_role' = 'admin');

-- Policies cho bảng `users`
create policy "Tất cả có thể đọc rules cơ bản" on users for select to authenticated using (true);
create policy "Chỉ Admin quản lý users" on users for all to authenticated using (auth.jwt() ->> 'app_role' = 'admin');

-- Policies cho bảng `user_packages`
create policy "Admin quản lý user_packages" on user_packages for all to authenticated using (auth.jwt() ->> 'app_role' = 'admin');
create policy "PT và Client xem user_packages liên quan" on user_packages for select to authenticated using (
  pt_id = auth.uid() or client_id = auth.uid()
);

-- Policies cho bảng `sessions`
create policy "Admin quản lý sessions" on sessions for all to authenticated using (auth.jwt() ->> 'app_role' = 'admin');
-- PT có thể select và update (check-in, logbook) các buổi tập của mình
create policy "PT truy cập sessions của mình" on sessions for all to authenticated using (
  pt_id = auth.uid()
);
-- Client có thể select buổi tập của mình
create policy "Client xem sessions của mình" on sessions for select to authenticated using (
  client_id = auth.uid()
);

-- Hàm RPC: Điểm danh (Atomic Transaction)
create or replace function checkin_session(p_session_id uuid, p_pt_id uuid, p_logbook jsonb, p_notes text)
returns boolean
language plpgsql
security definer -- chạy dưới quyền owner (bypass RLS cục bộ nếu cần)
as $$
declare
    v_user_package_id uuid;
    v_status varchar;
begin
    -- 1. Lấy thông tin session và kiểm tra quyền
    select user_package_id, status into v_user_package_id, v_status
    from sessions
    where id = p_session_id and pt_id = p_pt_id;

    if v_user_package_id is null then
        raise exception 'Session không tồn tại hoặc bạn không có quyền';
    end if;

    if v_status != 'scheduled' then
        raise exception 'Session này đã được điểm danh hoặc bị hủy';
    end if;

    -- 2. Cập nhật status của session thành 'completed', lưu logbook và thời gian
    update sessions
    set status = 'completed',
        logbook = p_logbook,
        notes = p_notes,
        checked_in_at = now()
    where id = p_session_id;

    -- 3. Trừ số buổi còn lại trong bảng user_packages
    update user_packages
    set remaining_sessions = remaining_sessions - 1
    where id = v_user_package_id and remaining_sessions > 0;

    -- 4. Nếu số buổi còn lại = 0, đánh dấu package hoàn thành (tùy chọn)
    -- update user_packages set status = 'completed' where id = v_user_package_id and remaining_sessions <= 0;

    return true;
end;
$$;
