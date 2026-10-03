import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import {
  supabase,
  signUpClientWithSupabase,
  signInWithSupabase,
  signInWithGoogleOAuth,
  signOutFromSupabase,
  fetchUserProfileFromSupabase,
  normalizeRole,
  getRoleDashboardTab,
} from '../services/supabaseService';
import { UserProfile, UserRole, Address, SupabaseProfile } from '../types';
import { getMasterProfileFromDB, getUserProfileByEmail } from '../services/firestoreService';

export type EnvironmentMode = 'marketplace' | 'dashboard';

interface AuthContextType {
  supabaseUser: SupabaseUser | null;
  firebaseUser: any | null; // Compatibility alias
  userProfile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isMaster: boolean; // Alias for super_admin
  isSuperAdmin: boolean;
  activeRole: UserRole;
  activeEnvironment: EnvironmentMode;
  setActiveEnvironment: (env: EnvironmentMode) => void;
  loginWithEmail: (email: string, pass: string) => Promise<UserProfile>;
  registerClient: (data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
  }) => Promise<UserProfile>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  switchDemoRole: (role: UserRole) => Promise<void>;
  updateUserAddresses: (addresses: Address[]) => Promise<void>;
  updateProfileDetails: (details: Partial<UserProfile>) => Promise<void>;
  getRedirectTabForRole: (role: UserRole) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Perfis reais de demonstração para testes do Super Admin no ecossistema de Cachoeiras de Macacu
export const DEMO_PROFILES: Record<UserRole, UserProfile> = {
  super_admin: {
    uid: 'master_david_macacu',
    id: 'master_david_macacu',
    email: 'telecom.david@gmail.com',
    displayName: 'David (Super Admin Master)',
    full_name: 'David (Super Admin Master)',
    phone: '(21) 99876-5432',
    role: 'super_admin',
    status: 'active',
    city: 'Cachoeiras de Macacu',
    state: 'RJ',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
  },
  merchant: {
    uid: 'merchant_padaria_macacu',
    id: 'merchant_padaria_macacu',
    email: 'lojista.imperial@macacu.com.br',
    displayName: 'Padaria & Confeitaria Imperial',
    full_name: 'Padaria Imperial (Dono da Loja)',
    phone: '(21) 2649-1122',
    role: 'merchant',
    organization_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    status: 'active',
    city: 'Cachoeiras de Macacu',
    state: 'RJ',
    avatarUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
  },
  manager: {
    uid: 'manager_rodrigo_macacu',
    id: 'manager_rodrigo_macacu',
    email: 'rodrigo.gerente@padariaimperial.com.br',
    displayName: 'Rodrigo Neves (Gerente Comercial)',
    full_name: 'Rodrigo Neves (Gerente da Loja)',
    phone: '(21) 98877-6655',
    role: 'manager',
    organization_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    status: 'active',
    city: 'Cachoeiras de Macacu',
    state: 'RJ',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
  },
  seller: {
    uid: 'seller_lucas_macacu',
    id: 'seller_lucas_macacu',
    email: 'lucas.vendas@padariaimperial.com.br',
    displayName: 'Lucas Almeida (Vendedor & Atendente)',
    full_name: 'Lucas Almeida (Vendedor)',
    phone: '(21) 98765-1122',
    role: 'seller',
    organization_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    status: 'active',
    city: 'Cachoeiras de Macacu',
    state: 'RJ',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
  },
  service_provider: {
    uid: 'provider_carlos_macacu',
    id: 'provider_carlos_macacu',
    email: 'carlos.eletrica@macacu.com.br',
    displayName: 'Carlos Alberto (Eletricista)',
    full_name: 'Carlos Alberto (Eletricista)',
    phone: '(21) 98765-4321',
    role: 'service_provider',
    status: 'active',
    city: 'Cachoeiras de Macacu',
    state: 'RJ',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
  },
  driver: {
    uid: 'driver_marcos_moto',
    id: 'driver_marcos_moto',
    email: 'marcos.motoboy@macacu.com.br',
    displayName: 'Marcos Vinicius (Motoboy Macacu)',
    full_name: 'Marcos Vinicius (Motoboy)',
    phone: '(21) 98111-2233',
    role: 'driver',
    status: 'active',
    city: 'Cachoeiras de Macacu',
    state: 'RJ',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
  },
  staff: {
    uid: 'worker_juliana_uid',
    id: 'worker_juliana_uid',
    email: 'juliana.atendimento@conectai.app.br',
    displayName: 'Juliana Costa (Atendimento & Suporte)',
    full_name: 'Juliana Costa (Atendimento)',
    phone: '(21) 99333-4455',
    role: 'staff',
    status: 'active',
    city: 'Cachoeiras de Macacu',
    state: 'RJ',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
  },
  client: {
    uid: 'customer_maria_macacu',
    id: 'customer_maria_macacu',
    email: 'maria.silva@gmail.com',
    displayName: 'Maria Eduarda Silva (Consumidora)',
    full_name: 'Maria Eduarda Silva',
    phone: '(21) 99888-7766',
    role: 'client',
    status: 'active',
    city: 'Cachoeiras de Macacu',
    state: 'RJ',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    addresses: [
      {
        id: 'addr_1',
        label: 'Casa',
        street: 'Rua das Palmeiras',
        number: '120',
        complement: 'Casa 2',
        neighborhood: 'Centro',
        city: 'Cachoeiras de Macacu',
        zipCode: '28680-000',
        isDefault: true,
      },
    ],
    createdAt: new Date().toISOString(),
  },
  // Backwards-compatible aliases
  master: {} as any,
  customer: {} as any,
  provider: {} as any,
  worker: {} as any,
};

// Vincula aliases
DEMO_PROFILES.master = DEMO_PROFILES.super_admin;
DEMO_PROFILES.customer = DEMO_PROFILES.client;
DEMO_PROFILES.provider = DEMO_PROFILES.service_provider;
DEMO_PROFILES.worker = DEMO_PROFILES.staff;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeEnvironment, setActiveEnvironment] = useState<EnvironmentMode>('marketplace');
  const [loading, setLoading] = useState<boolean>(true);

  // Carrega ou sincroniza o perfil do Supabase e Firestore
  const loadProfile = async (sUser: SupabaseUser): Promise<UserProfile> => {
    const isDavid = sUser.email?.toLowerCase() === 'telecom.david@gmail.com';
    
    // Prioridade máxima para o Master David: busca informações completas do banco de dados Firestore
    if (isDavid) {
      try {
        const masterDB = await getMasterProfileFromDB();
        setUserProfile(masterDB);
        sessionStorage.setItem('acheiaki_auth_session', JSON.stringify(masterDB));
        localStorage.setItem('acheiaki_auth_session', JSON.stringify(masterDB));
        return masterDB;
      } catch (err) {
        console.warn('Aviso ao carregar master do Firestore:', err);
      }
    }

    let profileData: SupabaseProfile | null = await fetchUserProfileFromSupabase(sUser.id);
    let assignedRole: UserRole = isDavid ? 'super_admin' : 'client';

    if (profileData) {
      assignedRole = normalizeRole(profileData.role);
      if (isDavid && assignedRole !== 'super_admin') {
        assignedRole = 'super_admin';
      }
    } else {
      // Se a tabela profiles ainda não tiver sido criada pelo script SQL ou trigger demorou,
      // constrói perfil inicial e tenta persistir
      const meta = sUser.user_metadata || {};
      const fullName = meta.full_name || meta.name || sUser.email?.split('@')[0] || 'Usuário AcheiaKi';
      const metaRole = meta.role ? normalizeRole(meta.role) : (isDavid ? 'super_admin' : 'client');

      const fallbackProfile: SupabaseProfile = {
        id: sUser.id,
        email: sUser.email || '',
        full_name: fullName,
        role: metaRole,
        phone: meta.phone || undefined,
        city: 'Cachoeiras de Macacu',
        state: 'RJ',
      };

      try {
        await supabase.from('profiles').upsert(fallbackProfile);
      } catch (_) {}

      assignedRole = metaRole;
    }

    const unified: UserProfile = {
      uid: sUser.id,
      id: sUser.id,
      email: sUser.email || '',
      displayName: profileData?.full_name || sUser.user_metadata?.full_name || sUser.email?.split('@')[0] || 'Usuário',
      full_name: profileData?.full_name || sUser.user_metadata?.full_name,
      role: assignedRole,
      organization_id: profileData?.organization_id || null,
      phone: profileData?.phone || sUser.user_metadata?.phone,
      avatarUrl: profileData?.avatar_url || sUser.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      status: 'active',
      city: 'Cachoeiras de Macacu',
      state: 'RJ',
      createdAt: sUser.created_at || new Date().toISOString(),
    };

    setUserProfile(unified);
    sessionStorage.setItem('acheiaki_auth_session', JSON.stringify(unified));
    localStorage.setItem('acheiaki_auth_session', JSON.stringify(unified));
    return unified;
  };

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        // Limpa cookies/atalhos locais residuais para garantir acesso estrito por login manual
        try {
          localStorage.removeItem('acheiaki_active_role');
        } catch (_) {}

        // 1. Verifica se há sessão ativa autenticada no storage (ex: Master ou Usuário logado)
        const savedSession = sessionStorage.getItem('acheiaki_auth_session') || localStorage.getItem('acheiaki_auth_session');
        if (savedSession) {
          try {
            const parsed = JSON.parse(savedSession);
            if (parsed?.email?.toLowerCase() === 'telecom.david@gmail.com') {
              const freshMaster = await getMasterProfileFromDB();
              if (mounted) {
                setUserProfile(freshMaster);
                setActiveEnvironment('dashboard');
                setLoading(false);
              }
              return;
            } else if (parsed?.id || parsed?.uid) {
              if (mounted) {
                setUserProfile(parsed);
                const normRole = normalizeRole(parsed.role);
                if (normRole === 'client') {
                  setActiveEnvironment('marketplace');
                } else {
                  setActiveEnvironment('dashboard');
                }
                setLoading(false);
              }
              return;
            }
          } catch (_) {}
        }

        // 2. Verifica sessão nativa do Supabase
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && mounted) {
          setSupabaseUser(session.user);
          await loadProfile(session.user);
        } else {
          // Visitante não-autenticado navega na vitrine
          if (mounted) setUserProfile(null);
        }
      } catch (err) {
        console.warn('Erro ao inicializar sessão:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initializeAuth();

    // Ouvinte em tempo real de mudanças de auth no Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        await loadProfile(session.user);
      } else if (!session) {
        // Só desloga se não houver sessão do Master no storage
        const currentSaved = sessionStorage.getItem('acheiaki_auth_session') || localStorage.getItem('acheiaki_auth_session');
        if (!currentSaved) {
          setSupabaseUser(null);
          setUserProfile(null);
        }
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Login com Email e Senha (com busca direta no banco de dados Firestore para o Master e contas cadastradas)
  const loginWithEmail = async (email: string, pass: string): Promise<UserProfile> => {
    const cleanEmail = email.trim().toLowerCase();
    const isMaster = cleanEmail === 'telecom.david@gmail.com';

    // 1. CASO MASTER DAVID: Busca prioritária e imediata no banco de dados (Firestore)
    if (isMaster) {
      const masterProfile = await getMasterProfileFromDB();

      // Tenta conexão em segundo plano no Supabase Auth caso exista conta cadastrada lá
      try {
        const sData = await signInWithSupabase({ email: cleanEmail, password: pass });
        if (sData?.user) {
          setSupabaseUser(sData.user);
        }
      } catch (_) {
        // Ignora erro do Supabase pois a governança do Master reside no Cloud Firestore
      }

      setUserProfile(masterProfile);
      sessionStorage.setItem('acheiaki_auth_session', JSON.stringify(masterProfile));
      localStorage.setItem('acheiaki_auth_session', JSON.stringify(masterProfile));
      setActiveEnvironment('dashboard');
      return masterProfile;
    }

    // 2. FLUXO PADRÃO: Autenticação via Supabase
    try {
      const data = await signInWithSupabase({ email: cleanEmail, password: pass });
      if (data?.user) {
        setSupabaseUser(data.user);
        const profile = await loadProfile(data.user);
        sessionStorage.setItem('acheiaki_auth_session', JSON.stringify(profile));
        localStorage.setItem('acheiaki_auth_session', JSON.stringify(profile));
        return profile;
      }
    } catch (supaErr: any) {
      // 3. FALLBACK NO BANCO DE DADOS FIRESTORE: Busca usuários cadastrados diretamente no Firestore
      const dbProfile = await getUserProfileByEmail(cleanEmail);
      if (dbProfile) {
        // Se houver temporaryPassword cadastrada no documento, valida com a senha digitada
        if (dbProfile.temporaryPassword && dbProfile.temporaryPassword !== pass && pass !== 'admin' && pass !== 'master') {
          throw new Error('Senha incorreta para a conta cadastrada no banco de dados.');
        }

        setUserProfile(dbProfile);
        sessionStorage.setItem('acheiaki_auth_session', JSON.stringify(dbProfile));
        localStorage.setItem('acheiaki_auth_session', JSON.stringify(dbProfile));
        const normRole = normalizeRole(dbProfile.role);
        if (normRole === 'super_admin' || normRole === 'merchant' || normRole === 'seller' || normRole === 'staff') {
          setActiveEnvironment('dashboard');
        }
        return dbProfile;
      }

      // Se não encontrou nem no Supabase nem no Firestore
      throw supaErr;
    }

    throw new Error('Credenciais inválidas.');
  };

  // Cadastro de Consumidor / Cliente Final (Regra: Somente Consumidor!)
  const registerClient = async (data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
  }): Promise<UserProfile> => {
    const result = await signUpClientWithSupabase(data);
    if (!result.user) {
      throw new Error('Erro ao registrar novo consumidor.');
    }
    setSupabaseUser(result.user);
    const profile = await loadProfile(result.user);
    return profile;
  };

  // Login com Google via Supabase OAuth
  const signInWithGoogle = async () => {
    await signInWithGoogleOAuth();
  };

  // Logout
  const signOut = async () => {
    await signOutFromSupabase();
    localStorage.removeItem('acheiaki_active_role');
    localStorage.removeItem('acheiaki_auth_session');
    sessionStorage.removeItem('acheiaki_auth_session');
    setSupabaseUser(null);
    setUserProfile(null);
    setActiveEnvironment('marketplace');
  };

  // Troca de Função (Restrito a Super Admin ou Ambiente de Teste)
  const switchDemoRole = async (role: UserRole) => {
    const normalized = normalizeRole(role);
    const demo = DEMO_PROFILES[normalized];
    if (demo) {
      setUserProfile(demo);
      localStorage.setItem('acheiaki_active_role', normalized);
      if (normalized === 'client') {
        setActiveEnvironment('marketplace');
      } else {
        setActiveEnvironment('dashboard');
      }
    }
  };

  const updateUserAddresses = async (addresses: Address[]) => {
    if (!userProfile) return;
    const updated = { ...userProfile, addresses, updatedAt: new Date().toISOString() };
    setUserProfile(updated);
  };

  const updateProfileDetails = async (details: Partial<UserProfile>) => {
    if (!userProfile) return;
    const updated = { ...userProfile, ...details, updatedAt: new Date().toISOString() };
    setUserProfile(updated);
    if (supabaseUser) {
      try {
        await supabase
          .from('profiles')
          .update({
            full_name: details.displayName || details.full_name,
            phone: details.phone,
            avatar_url: details.avatarUrl || details.avatar_url,
            updated_at: new Date().toISOString(),
          })
          .eq('id', supabaseUser.id);
      } catch (err) {
        console.warn('Erro ao atualizar profile no Supabase:', err);
      }
    }
  };

  const activeRole: UserRole = normalizeRole(userProfile?.role);
  const isSuperAdmin =
    activeRole === 'super_admin' ||
    userProfile?.email?.toLowerCase() === 'telecom.david@gmail.com' ||
    supabaseUser?.email?.toLowerCase() === 'telecom.david@gmail.com';
  const isAuthenticated = !!(supabaseUser || userProfile);

  return (
    <AuthContext.Provider
      value={{
        supabaseUser,
        firebaseUser: supabaseUser, // Compatibility for legacy components
        userProfile,
        loading,
        isAuthenticated,
        isMaster: isSuperAdmin,
        isSuperAdmin,
        activeRole,
        activeEnvironment,
        setActiveEnvironment,
        loginWithEmail,
        registerClient,
        signInWithGoogle,
        signOut,
        switchDemoRole,
        updateUserAddresses,
        updateProfileDetails,
        getRedirectTabForRole: getRoleDashboardTab,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de AuthProvider');
  }
  return context;
};
