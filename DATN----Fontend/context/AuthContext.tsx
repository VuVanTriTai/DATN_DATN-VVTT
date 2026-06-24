import React, { createContext, useContext, useState, useEffect } from 'react';

// Định nghĩa các loại vai trò
export type UserRole = 'learner' | 'instructor' | 'admin';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole[]; // Một tài khoản có thể có nhiều vai trò
  avatar?: string;
  instructorProfile?: {
    specialization?: string;
    bio?: string;
    teachingFields?: string[];
  };
}

interface AuthContextType {
  user: User | null;
  activeMode: UserRole; // Chế độ hiện tại người dùng đang chọn để xem UI
  switchMode: (mode: UserRole) => void;
  login: (userData: User, token: string) => void;
  logout: () => void;
  updateUserAndToken: (userData: any, token?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activeMode, setActiveMode] = useState<UserRole>('learner');

  // 1. Khôi phục dữ liệu từ localStorage khi load trang
  useEffect(() => {
    try {
      // Khôi phục User
      const savedUser = localStorage.getItem('user');
      if (savedUser && savedUser !== "undefined" && savedUser !== "null") {
        setUser(JSON.parse(savedUser));
      }

      // Khôi phục Chế độ xem hiện tại (Learner hay Instructor)
      const savedMode = localStorage.getItem('activeMode') as UserRole;
      if (savedMode) {
        setActiveMode(savedMode);
      }
    } catch (error) {
      console.error("Lỗi đọc dữ liệu từ storage:", error);
      localStorage.clear();
    }
  }, []);

  // 2. Hàm Đăng nhập
  const login = (userData: User, token: string) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    
    // Admin vào chế độ admin, còn lại mặc định learner
    const defaultMode: UserRole = userData.role.includes('admin') ? 'admin' : 'learner';
    setActiveMode(defaultMode);
    localStorage.setItem('activeMode', defaultMode);
  };

  // 3. Hàm Đăng xuất
  const logout = () => {
    setUser(null);
    localStorage.clear();
    window.location.href = '/auth';
  };

  // 4. Hàm Chuyển đổi chế độ (Switch Mode)
  // Trong AuthContext.tsx, sửa hàm switchMode:

  const switchMode = (mode: UserRole) => {
    // Kiểm tra xem user có thực sự sở hữu role đó không trước khi cho phép chuyển
    if (user && user.role.includes(mode)) {
      setActiveMode(mode);
      localStorage.setItem('activeMode', mode);
    } else {
      alert("Tài khoản của bạn chưa đăng ký vai trò này!");
      // Nếu không có quyền, ép về learner
      setActiveMode('learner');
      localStorage.setItem('activeMode', 'learner');
    }
  };

  // 5. Hàm cập nhật thông tin user và token
  const updateUserAndToken = (userData: any, token?: string) => {
    const mappedUser: User = {
      id: userData.id || userData._id || "",
      fullName: userData.fullName || "",
      email: userData.email || "",
      role: userData.role || [],
      avatar: userData.avatar,
      instructorProfile: userData.instructorProfile
    };
    setUser(mappedUser);
    localStorage.setItem('user', JSON.stringify(mappedUser));
    if (token) {
      localStorage.setItem('token', token);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      activeMode, 
      switchMode, 
      login, 
      logout,
      updateUserAndToken
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook để sử dụng nhanh context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};