import React, { useEffect, useState, useCallback } from 'react';
import { adminApi } from '../../services/adminService';
import {
  Search, Filter, Shield, GraduationCap, School,
  Ban, CheckCircle, Trash2, RefreshCw, Eye,
  ChevronLeft, ChevronRight, X, AlertTriangle, KeyRound
} from 'lucide-react';

interface User {
  _id: string;
  fullName: string;
  email: string;
  role: string[];
  isBanned: boolean;
  createdAt: string;
  instructorProfile?: { avgRating: number; ratingCount: number };
}

// ── Modal Chi tiết User ──────────────────────────────────────────────────────
const UserDetailModal = ({ userId, onClose }: { userId: string; onClose: () => void }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [resetPwd, setResetPwd] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');

  useEffect(() => {
    adminApi.getUserDetail(userId).then(r => setData(r.data)).finally(() => setLoading(false));
  }, [userId]);

  const handleResetPwd = async () => {
    if (!resetPwd || resetPwd.length < 6) { setPwdMsg('Mật khẩu phải ≥ 6 ký tự'); return; }
    try {
      await adminApi.resetPassword(userId, resetPwd);
      setPwdMsg('✅ Đặt lại mật khẩu thành công!');
      setResetPwd('');
    } catch { setPwdMsg('❌ Lỗi khi đặt lại mật khẩu'); }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#12101f] border border-white/10 rounded-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#12101f] z-10">
          <h2 className="text-white font-black text-lg">Chi tiết Tài khoản</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10"><X size={18} /></button>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : data && (
          <div className="p-6 space-y-5">
            {/* Profile */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-xl">
                {data.user.fullName[0]}
              </div>
              <div>
                <p className="text-white font-black text-lg">{data.user.fullName}</p>
                <p className="text-slate-400 text-sm">{data.user.email}</p>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {data.user.role.map((r: string) => (
                    <span key={r} className={`px-2 py-0.5 rounded-lg text-xs font-bold
                      ${r === 'admin' ? 'bg-red-500/20 text-red-400' : r === 'instructor' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                      {r}
                    </span>
                  ))}
                  {data.user.isBanned && <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-red-900/40 text-red-300">BANNED</span>}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <p className="text-white text-2xl font-black">{data.courseCount}</p>
                <p className="text-slate-400 text-xs mt-1">Khoá học</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <p className="text-white text-2xl font-black">{data.publicCourseCount}</p>
                <p className="text-slate-400 text-xs mt-1">Trên Market</p>
              </div>
            </div>

            {/* Recent Courses */}
            {data.recentCourses?.length > 0 && (
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Khoá học gần đây</p>
                <div className="space-y-2">
                  {data.recentCourses.map((c: any) => (
                    <div key={c._id} className="flex items-center justify-between p-3 bg-white/3 rounded-xl">
                      <p className="text-white text-sm font-medium truncate">{c.title}</p>
                      {c.isPublic && <span className="text-green-400 text-xs ml-2 flex-shrink-0">Public</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reset Password */}
            {!data.user.role.includes('admin') && (
              <div className="border border-white/10 rounded-2xl p-4">
                <p className="text-slate-300 text-sm font-bold mb-3 flex items-center gap-2">
                  <KeyRound size={14} /> Đặt lại mật khẩu
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={resetPwd}
                    onChange={e => setResetPwd(e.target.value)}
                    placeholder="Mật khẩu mới (≥ 6 ký tự)"
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-red-500"
                  />
                  <button onClick={handleResetPwd} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-bold transition-colors">
                    Đặt
                  </button>
                </div>
                {pwdMsg && <p className="text-xs mt-2 text-slate-300">{pwdMsg}</p>}
              </div>
            )}

            <p className="text-slate-600 text-xs text-center">
              Tham gia: {new Date(data.user.createdAt).toLocaleDateString('vi-VN')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Confirm Dialog ───────────────────────────────────────────────────────────
const ConfirmDialog = ({
  message, onConfirm, onCancel, danger = false
}: { message: string; onConfirm: () => void; onCancel: () => void; danger?: boolean }) => (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-[#12101f] border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center">
      <AlertTriangle size={36} className={`mx-auto mb-4 ${danger ? 'text-red-400' : 'text-yellow-400'}`} />
      <p className="text-white font-bold text-base mb-6">{message}</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-colors text-sm">
          Huỷ
        </button>
        <button onClick={onConfirm} className={`flex-1 py-2.5 rounded-xl font-bold transition-colors text-sm text-white ${danger ? 'bg-red-600 hover:bg-red-500' : 'bg-yellow-600 hover:bg-yellow-500'}`}>
          Xác nhận
        </button>
      </div>
    </div>
  </div>
);

// ── Main Component ───────────────────────────────────────────────────────────
const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [bannedFilter, setBannedFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ msg: string; action: () => void; danger?: boolean } | null>(null);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers({ page, limit: 12, search, role: roleFilter, banned: bannedFilter });
      setUsers(res.data.users);
      setPagination(res.data.pagination);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, bannedFilter]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  // Debounce search
  useEffect(() => { setPage(1); }, [search, roleFilter, bannedFilter]);

  const handleBan = (user: User) => {
    setConfirm({
      msg: `Khóa tài khoản "${user.fullName}"?`,
      danger: true,
      action: async () => {
        await adminApi.banUser(user._id);
        showToast(`Đã khóa: ${user.email}`);
        loadUsers();
        setConfirm(null);
      }
    });
  };

  const handleUnban = (user: User) => {
    setConfirm({
      msg: `Mở khóa tài khoản "${user.fullName}"?`,
      action: async () => {
        await adminApi.unbanUser(user._id);
        showToast(`Đã mở khóa: ${user.email}`);
        loadUsers();
        setConfirm(null);
      }
    });
  };

  const handleDelete = (user: User) => {
    setConfirm({
      msg: `XOÁ VĨNH VIỄN tài khoản "${user.fullName}"? Toàn bộ dữ liệu sẽ bị mất!`,
      danger: true,
      action: async () => {
        await adminApi.deleteUser(user._id);
        showToast(`Đã xoá: ${user.email}`);
        loadUsers();
        setConfirm(null);
      }
    });
  };

  const handleToggleRole = async (user: User) => {
    const isInstructor = user.role.includes('instructor');
    const newRole = isInstructor ? 'learner' : 'instructor';
    const label = isInstructor ? 'thu hồi quyền Giảng viên' : 'cấp quyền Giảng viên';
    setConfirm({
      msg: `Bạn muốn ${label} cho "${user.fullName}"?`,
      action: async () => {
        await adminApi.updateUserRole(user._id, newRole);
        showToast(`Đã cập nhật role cho: ${user.email}`);
        loadUsers();
        setConfirm(null);
      }
    });
  };

  return (
    <div className="p-8 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white">Quản lý Tài khoản</h1>
          <p className="text-slate-400 mt-1">{pagination.total} tài khoản trong hệ thống</p>
        </div>
        <button onClick={loadUsers} className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-all">
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc email..."
            className="w-full bg-[#12101f] border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-red-500/50 transition-colors"
          />
        </div>
        <div className="flex gap-3">
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="bg-[#12101f] border border-white/10 rounded-2xl px-4 py-3 text-slate-300 text-sm focus:outline-none focus:border-red-500/50 appearance-none cursor-pointer"
          >
            <option value="">Tất cả Role</option>
            <option value="learner">Learner</option>
            <option value="instructor">Instructor</option>
          </select>
          <select
            value={bannedFilter}
            onChange={e => setBannedFilter(e.target.value)}
            className="bg-[#12101f] border border-white/10 rounded-2xl px-4 py-3 text-slate-300 text-sm focus:outline-none focus:border-red-500/50 appearance-none cursor-pointer"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="false">Đang hoạt động</option>
            <option value="true">Đã bị khóa</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#12101f] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-6 py-4 text-slate-400 text-xs font-black uppercase tracking-wider">Người dùng</th>
                <th className="text-left px-6 py-4 text-slate-400 text-xs font-black uppercase tracking-wider">Role</th>
                <th className="text-left px-6 py-4 text-slate-400 text-xs font-black uppercase tracking-wider">Trạng thái</th>
                <th className="text-left px-6 py-4 text-slate-400 text-xs font-black uppercase tracking-wider">Ngày tham gia</th>
                <th className="text-right px-6 py-4 text-slate-400 text-xs font-black uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-500">Không tìm thấy tài khoản nào.</td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user._id} className="border-b border-white/5 hover:bg-white/2 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                          {user.fullName[0]}
                        </div>
                        <div>
                          <p className="text-white font-bold text-sm">{user.fullName}</p>
                          <p className="text-slate-400 text-xs">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1.5 flex-wrap">
                        {user.role.map(r => (
                          <span key={r} className={`px-2.5 py-1 rounded-lg text-xs font-bold
                            ${r === 'admin' ? 'bg-red-500/20 text-red-400' : r === 'instructor' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                            {r === 'learner' ? <GraduationCap size={10} className="inline mr-1" /> : r === 'instructor' ? <School size={10} className="inline mr-1" /> : <Shield size={10} className="inline mr-1" />}
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.isBanned
                        ? <span className="flex items-center gap-1.5 text-red-400 text-xs font-bold"><Ban size={12} />Đã khóa</span>
                        : <span className="flex items-center gap-1.5 text-green-400 text-xs font-bold"><CheckCircle size={12} />Hoạt động</span>
                      }
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-sm">
                      {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* View */}
                        <button onClick={() => setSelectedUserId(user._id)}
                          title="Xem chi tiết"
                          className="p-2 bg-white/5 hover:bg-white/15 rounded-xl text-slate-400 hover:text-white transition-all">
                          <Eye size={14} />
                        </button>
                        {/* Toggle Role */}
                        {!user.role.includes('admin') && (
                          <button onClick={() => handleToggleRole(user)}
                            title={user.role.includes('instructor') ? 'Thu hồi Instructor' : 'Cấp Instructor'}
                            className="p-2 bg-white/5 hover:bg-purple-600/20 rounded-xl text-slate-400 hover:text-purple-400 transition-all">
                            <School size={14} />
                          </button>
                        )}
                        {/* Ban / Unban */}
                        {!user.role.includes('admin') && (
                          user.isBanned
                            ? <button onClick={() => handleUnban(user)} title="Mở khóa"
                                className="p-2 bg-white/5 hover:bg-green-600/20 rounded-xl text-slate-400 hover:text-green-400 transition-all">
                                <CheckCircle size={14} />
                              </button>
                            : <button onClick={() => handleBan(user)} title="Khóa tài khoản"
                                className="p-2 bg-white/5 hover:bg-red-600/20 rounded-xl text-slate-400 hover:text-red-400 transition-all">
                                <Ban size={14} />
                              </button>
                        )}
                        {/* Delete */}
                        {!user.role.includes('admin') && (
                          <button onClick={() => handleDelete(user)} title="Xoá tài khoản"
                            className="p-2 bg-white/5 hover:bg-red-600/30 rounded-xl text-slate-400 hover:text-red-400 transition-all">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/5">
            <p className="text-slate-400 text-sm">
              Trang {page}/{pagination.totalPages} · {pagination.total} tài khoản
            </p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                <ChevronLeft size={16} />
              </button>
              <button disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedUserId && <UserDetailModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />}
      {confirm && <ConfirmDialog message={confirm.msg} danger={confirm.danger} onConfirm={confirm.action} onCancel={() => setConfirm(null)} />}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#1a1730] border border-white/10 rounded-2xl px-5 py-3 text-white text-sm font-medium shadow-2xl animate-in slide-in-from-bottom-4 z-50">
          {toast}
        </div>
      )}
    </div>
  );
};

export default UserManagement;
