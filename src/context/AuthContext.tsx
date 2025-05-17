import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthState, User } from "@/types";
import { toast } from "@/components/ui/sonner";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Lista de usuários mockada apenas para simulação local
const mockUsers: User[] = [
  {
    id: "1",
    name: "Maria Silva",
    email: "maria@example.com",
    avatar: "/placeholder.svg",
    role: "admin",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "João Santos",
    email: "joao@example.com",
    avatar: "/placeholder.svg",
    role: "user",
    createdAt: new Date().toISOString(),
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Carrega usuário salvo no localStorage ao iniciar a aplicação
  useEffect(() => {
    const storedUser = localStorage.getItem("ecoUser");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setAuthState({ user, isAuthenticated: true, isLoading: false });
      } catch (error) {
        setAuthState({ user: null, isAuthenticated: false, isLoading: false });
      }
    } else {
      setAuthState({ user: null, isAuthenticated: false, isLoading: false });
    }
  }, []);

  // Simula login: verifica se o usuário existe e se a senha está correta
  const login = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        const user = mockUsers.find(
          (u) => u.email.toLowerCase() === email.toLowerCase()
        );
        if (user && password === "password") {
          setAuthState({ user, isAuthenticated: true, isLoading: false });
          localStorage.setItem("ecoUser", JSON.stringify(user));
          toast.success("Login bem-sucedido!");
          resolve();
        } else {
          setAuthState(prev => ({ ...prev, isLoading: false }));
          toast.error("Credenciais inválidas.");
          reject(new Error("Invalid credentials"));
        }
      }, 800);
    });
  };

  // Simula registro: verifica se o email já existe e adiciona novo usuário
  const register = async (name: string, email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        const existingUser = mockUsers.find(
          (u) => u.email.toLowerCase() === email.toLowerCase()
        );
        if (existingUser) {
          setAuthState(prev => ({ ...prev, isLoading: false }));
          toast.error("Email já está em uso.");
          reject(new Error("Email already in use"));
        } else {
          const newUser: User = {
            id: `${mockUsers.length + 1}`,
            name,
            email,
            avatar: "/placeholder.svg",
            role: "user",
            createdAt: new Date().toISOString(),
          };
          mockUsers.push(newUser);
          setAuthState({ user: newUser, isAuthenticated: true, isLoading: false });
          localStorage.setItem("ecoUser", JSON.stringify(newUser));
          toast.success("Registro bem-sucedido!");
          resolve();
        }
      }, 800);
    });
  };

  // Remove usuário do estado e do localStorage ao fazer logout
  const logout = () => {
    localStorage.removeItem("ecoUser");
    setAuthState({ user: null, isAuthenticated: false, isLoading: false });
    toast.info("Você saiu da sua conta.");
  };

  return (
    <AuthContext.Provider
      value={{ ...authState, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook para acessar o contexto de autenticação em qualquer componente
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};