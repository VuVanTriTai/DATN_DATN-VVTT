import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import {
  Users, Search, UserPlus, UserCheck, UserX,
  Loader2, Send, X, CheckCircle, Clock, Trash2,
  Mail, Link
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface FriendUser {
  _id: string;
  fullName: string;
  email: string;
  role?: string[];
  friendshipStatus?: 'pending' | 'accepted' | 'rejected' | null;
  friendshipId?: string | null;
  iAmRequester?: boolean;
}

interface FriendItem {
  friendshipId: string;
  friend: FriendUser;
  since: string;
}

interface PendingRequest {
  _id: string;
  requester: FriendUser;
  createdAt: string;
}

type Tab = 'friends' | 'search' | 'requests';

// ─── Role Badge ───────────────────────────────────────────────────────────────
const RoleBadge: React.FC<{ role?: string[] }> = ({ role }) => {
  if (!role) return null;
  const isInstructor = role.includes('instructor');
  return (
    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
      isInstructor
        ? 'text-purple-400 bg-purple-500/10 border-purple-500/30'
        : 'text-blue-400 bg-blue-500/10 border-blue-500/30'
    }`}>
      {isInstructor ? 'Giảng viên' : 'Học viên'}
    </span>
  );
};

// ─── Avatar ──────────────────────────────────────────────────────────────────
const Avatar: React.FC<{ name: string; size?: 'sm' | 'md' | 'lg' }> = ({ name, size = 'md' }) => {
  const initials = name
    ? name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '??';
  const sizeClass = {
    sm: 'w-9 h-9 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-14 h-14 text-base',
  }[size];
  return (
    <div className={`${sizeClass} rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-black text-white shrink-0`}>
      {initials}
    </div>
  );
};

// ─── Feature Card ─────────────────────────────────────────────────────────────
const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: string;
  onClick: () => void;
}> = ({ icon, title, desc, color, onClick }) => (
  <button
    onClick={onClick}
    className={`group flex-1 min-w-[140px] flex flex-col items-center gap-3 p-6 rounded-3xl border transition-all hover:scale-[1.03] active:scale-95 ${color}`}
  >
    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/10 group-hover:bg-white/20 transition-colors">
      {icon}
    </div>
    <div className="text-center">
      <p className="font-black text-sm text-white">{title}</p>
      <p className="text-[11px] opacity-70 mt-0.5 font-medium">{desc}</p>
    </div>
  </button>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const Friends: React.FC = () => {
  const [tab, setTab] = useState<Tab>('friends');

  // Tab: Bạn bè
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);

  // Tab: Tìm kiếm
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState<FriendUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Tab: Lời mời
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // ── Load dữ liệu ────────────────────────────────────────────────────────
  const loadFriends = useCallback(async () => {
    setLoadingFriends(true);
    try {
      const res = await api.friends.getMyFriends();
      if (res.success) setFriends(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingFriends(false);
    }
  }, []);

  const loadRequests = useCallback(async () => {
    setLoadingRequests(true);
    try {
      const res = await api.friends.getRequests();
      if (res.success) setRequests(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  useEffect(() => {
    loadFriends();
    loadRequests();
  }, [loadFriends, loadRequests]);

  // ── Tìm kiếm ────────────────────────────────────────────────────────────
  const handleSearch = async () => {
    if (searchQ.trim().length < 2) return;
    setSearching(true);
    try {
      const res = await api.friends.search(searchQ.trim());
      if (res.success) setSearchResults(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setSearching(false);
    }
  };

  // ── Gửi lời mời ─────────────────────────────────────────────────────────
  const handleSendRequest = async (userId: string) => {
    setActionLoading(userId);
    try {
      const res = await api.friends.sendRequest(userId);
      if (res.success) {
        setSearchResults(prev => prev.map(u =>
          u._id === userId ? { ...u, friendshipStatus: 'pending', iAmRequester: true } : u
        ));
        await loadRequests();
      }
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Lỗi khi gửi lời mời');
    } finally {
      setActionLoading(null);
    }
  };

  // ── Hủy lời mời đã gửi ──────────────────────────────────────────────────
  const handleCancelRequest = async (userId: string) => {
    setActionLoading(userId);
    try {
      const res = await api.friends.cancelRequest(userId);
      if (res.success) {
        setSearchResults(prev => prev.map(u =>
          u._id === userId ? { ...u, friendshipStatus: null, friendshipId: null } : u
        ));
      }
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Lỗi');
    } finally {
      setActionLoading(null);
    }
  };

  // ── Chấp nhận lời mời ───────────────────────────────────────────────────
  const handleAccept = async (friendshipId: string) => {
    setActionLoading(friendshipId);
    try {
      const res = await api.friends.acceptRequest(friendshipId);
      if (res.success) {
        setRequests(prev => prev.filter(r => r._id !== friendshipId));
        await loadFriends();
      }
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Lỗi');
    } finally {
      setActionLoading(null);
    }
  };

  // ── Từ chối lời mời ─────────────────────────────────────────────────────
  const handleReject = async (friendshipId: string) => {
    setActionLoading(friendshipId);
    try {
      const res = await api.friends.rejectRequest(friendshipId);
      if (res.success) {
        setRequests(prev => prev.filter(r => r._id !== friendshipId));
      }
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Lỗi');
    } finally {
      setActionLoading(null);
    }
  };

  // ── Hủy kết bạn ─────────────────────────────────────────────────────────
  const handleUnfriend = async (userId: string) => {
    if (!confirm('Bạn có chắc muốn hủy kết bạn?')) return;
    setActionLoading(userId);
    try {
      const res = await api.friends.unfriend(userId);
      if (res.success) {
        setFriends(prev => prev.filter(f => f.friend._id !== userId));
      }
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Lỗi');
    } finally {
      setActionLoading(null);
    }
  };

  // ── Tab buttons ──────────────────────────────────────────────────────────
  const TABS: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'friends',  label: 'Bạn bè',        icon: <Users size={16} />,    badge: friends.length },
    { id: 'search',   label: 'Tìm kiếm',      icon: <Search size={16} /> },
    { id: 'requests', label: 'Lời mời kết bạn', icon: <UserPlus size={16} />, badge: requests.length },
  ];

  // ── Render tab content ───────────────────────────────────────────────────
  const renderContent = () => {
    // ── TAB: Bạn bè ───────────────────────────────────────────────────────
    if (tab === 'friends') {
      return (
        <div className="bg-[#111827]/80 border border-white/5 rounded-3xl p-6 min-h-[260px]">
          <div className="flex items-center gap-2 mb-5">
            <Users size={18} className="text-blue-400" />
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-300">
              Danh sách bạn bè ({friends.length})
            </h2>
          </div>

          {loadingFriends ? (
            <div className="flex items-center justify-center py-16 gap-3 text-slate-500">
              <Loader2 className="animate-spin text-blue-400" size={22} />
              <span className="text-sm font-bold">Đang tải...</span>
            </div>
          ) : friends.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Users size={48} className="text-slate-700" />
              <p className="text-slate-500 font-bold text-sm">Chưa có bạn bè nào</p>
              <p className="text-slate-600 text-xs">Hãy tìm kiếm và kết bạn với những người khác</p>
            </div>
          ) : (
            <div className="space-y-3">
              {friends.map(({ friendshipId, friend, since }) => (
                <div
                  key={friendshipId}
                  className="flex items-center gap-4 p-4 bg-slate-900/60 border border-white/5 rounded-2xl hover:border-blue-500/20 hover:bg-slate-800/50 transition-all group"
                >
                  <Avatar name={friend.fullName} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-black text-sm text-white truncate">{friend.fullName}</p>
                      <RoleBadge role={friend.role} />
                    </div>
                    <p className="text-xs text-slate-500 truncate flex items-center gap-1.5">
                      <Mail size={11} />
                      {friend.email}
                    </p>
                    <p className="text-[10px] text-slate-600 mt-0.5">
                      Bạn bè từ {new Date(since).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleUnfriend(friend._id)}
                      disabled={actionLoading === friend._id}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-xs font-black transition-all"
                    >
                      {actionLoading === friend._id
                        ? <Loader2 size={12} className="animate-spin" />
                        : <Trash2 size={12} />}
                      Hủy kết bạn
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // ── TAB: Tìm kiếm ─────────────────────────────────────────────────────
    if (tab === 'search') {
      return (
        <div className="bg-[#111827]/80 border border-white/5 rounded-3xl p-6 min-h-[260px]">
          <div className="flex items-center gap-2 mb-5">
            <Search size={18} className="text-violet-400" />
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-300">Tìm kiếm</h2>
          </div>

          {/* Search input */}
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Nhập email hoặc tên để tìm kiếm..."
              className="flex-1 bg-slate-900/80 border border-white/10 text-white placeholder:text-slate-600 rounded-2xl px-5 py-3 text-sm font-medium focus:outline-none focus:border-violet-500/60 transition-all"
            />
            <button
              onClick={handleSearch}
              disabled={searching || searchQ.trim().length < 2}
              className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-2xl font-black text-sm flex items-center gap-2 transition-all shadow-lg shadow-violet-900/30"
            >
              {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              Tìm
            </button>
          </div>

          {/* Results */}
          {searchResults.length === 0 && !searching && (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-600">
              <Search size={36} className="opacity-40" />
              <p className="text-sm font-bold">Nhập email hoặc tên để tìm bạn bè</p>
            </div>
          )}

          <div className="space-y-3">
            {searchResults.map(user => (
              <div
                key={user._id}
                className="flex items-center gap-4 p-4 bg-slate-900/60 border border-white/5 rounded-2xl hover:border-violet-500/20 transition-all"
              >
                <Avatar name={user.fullName} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-black text-sm text-white truncate">{user.fullName}</p>
                    <RoleBadge role={user.role} />
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Mail size={11} /> {user.email}
                  </p>
                </div>

                {/* Action button */}
                <div>
                  {user.friendshipStatus === 'accepted' && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-black">
                      <UserCheck size={12} /> Bạn bè
                    </span>
                  )}
                  {user.friendshipStatus === 'pending' && user.iAmRequester && (
                    <button
                      onClick={() => handleCancelRequest(user._id)}
                      disabled={actionLoading === user._id}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-xl text-xs font-black hover:bg-orange-500/20 transition-all"
                    >
                      {actionLoading === user._id ? <Loader2 size={12} className="animate-spin" /> : <Clock size={12} />}
                      Đã gửi lời mời
                    </button>
                  )}
                  {user.friendshipStatus === 'pending' && !user.iAmRequester && (
                    <button
                      onClick={() => user.friendshipId && handleAccept(user.friendshipId)}
                      disabled={actionLoading === user.friendshipId}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs font-black hover:bg-blue-500/20 transition-all disabled:opacity-50"
                    >
                      {actionLoading === user.friendshipId ? <Loader2 size={12} className="animate-spin" /> : <UserPlus size={12} />}
                      Chấp nhận
                    </button>
                  )}
                  {!user.friendshipStatus && (
                    <button
                      onClick={() => handleSendRequest(user._id)}
                      disabled={actionLoading === user._id}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
                    >
                      {actionLoading === user._id ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                      Kết bạn
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // ── TAB: Lời mời kết bạn ──────────────────────────────────────────────
    if (tab === 'requests') {
      return (
        <div className="bg-[#111827]/80 border border-white/5 rounded-3xl p-6 min-h-[260px]">
          <div className="flex items-center gap-2 mb-5">
            <UserPlus size={18} className="text-pink-400" />
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-300">Lời mời kết bạn</h2>
          </div>

          {loadingRequests ? (
            <div className="flex items-center justify-center py-16 gap-3 text-slate-500">
              <Loader2 className="animate-spin text-pink-400" size={22} />
              <span className="text-sm font-bold">Đang tải...</span>
            </div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <UserPlus size={48} className="text-slate-700" />
              <p className="text-slate-500 font-bold text-sm">Không có lời mời kết bạn nào</p>
              <p className="text-slate-600 text-xs">Khi có người gửi lời mời kết bạn, bạn sẽ thấy ở đây</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map(req => (
                <div
                  key={req._id}
                  className="flex items-center gap-4 p-4 bg-slate-900/60 border border-white/5 rounded-2xl hover:border-pink-500/20 transition-all"
                >
                  <Avatar name={req.requester.fullName} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-black text-sm text-white truncate">{req.requester.fullName}</p>
                      <RoleBadge role={req.requester.role} />
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Mail size={11} /> {req.requester.email}
                    </p>
                    <p className="text-[10px] text-slate-600 mt-0.5">
                      {new Date(req.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAccept(req._id)}
                      disabled={actionLoading === req._id}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black transition-all shadow-lg disabled:opacity-50"
                    >
                      {actionLoading === req._id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                      Chấp nhận
                    </button>
                    <button
                      onClick={() => handleReject(req._id)}
                      disabled={actionLoading === req._id}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 rounded-xl text-xs font-black transition-all disabled:opacity-50"
                    >
                      {actionLoading === req._id ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
                      Từ chối
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-white p-6 lg:p-10">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* ── Header ── */}
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
            Bạn bè
          </h1>
          <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full mt-2 mb-2" />
          <p className="text-slate-500 text-sm">Kết nối với bạn bè và chia sẻ hành trình học tập</p>
        </div>

        {/* ── Tab Bar ── */}
        <div className="flex gap-2 p-1.5 bg-[#111827]/80 border border-white/5 rounded-2xl w-full">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                tab === t.id
                  ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-900/30'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
              {t.badge !== undefined && t.badge > 0 && (
                <span className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  tab === t.id ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'
                }`}>
                  {t.badge > 9 ? '9+' : t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        <div className="animate-in fade-in duration-300">
          {renderContent()}
        </div>

        {/* ── Feature Cards ── */}
        <div className="flex gap-4 flex-wrap">
          <FeatureCard
            icon={<Search size={24} className="text-blue-300" />}
            title="Tìm kiếm"
            desc="Tìm bạn bằng email"
            color="bg-gradient-to-br from-blue-700/60 to-blue-900/60 border border-blue-500/20 hover:border-blue-400/40"
            onClick={() => setTab('search')}
          />
          <FeatureCard
            icon={<UserPlus size={24} className="text-emerald-300" />}
            title="Kết nối"
            desc="Gửi lời mời kết bạn"
            color="bg-gradient-to-br from-emerald-700/60 to-emerald-900/60 border border-emerald-500/20 hover:border-emerald-400/40"
            onClick={() => setTab('search')}
          />
          <FeatureCard
            icon={<UserCheck size={24} className="text-violet-300" />}
            title="Lời mời"
            desc="Xem lời mời đến"
            color="bg-gradient-to-br from-violet-700/60 to-purple-900/60 border border-violet-500/20 hover:border-violet-400/40"
            onClick={() => setTab('requests')}
          />
        </div>

      </div>
    </div>
  );
};

export default Friends;
