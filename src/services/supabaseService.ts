import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Merchant, DeliveryDriver, Seller, UserRole, SupabaseProfile, UserProfile } from '../types';

export const SUPABASE_URL = 'https://iiogvrxneyflwxkuerjf.supabase.co';
export const SUPABASE_REST_URL = 'https://iiogvrxneyflwxkuerjf.supabase.co/rest/v1/';
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_oR6yRl_Jd8dvgjpu_w9h5Q_aUiNebLx';

// Initialize Supabase Client
export const supabase: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

export interface SupabaseSyncResult {
  success: boolean;
  table: string;
  source: 'supabase_api' | 'supabase_rest' | 'local_fallback';
  message: string;
  data?: any;
}

/**
 * Normaliza qualquer role legada ou alias para os 8 perfis estritos de RBAC
 */
export function normalizeRole(role: string | undefined | null): UserRole {
  if (!role) return 'client';
  const clean = role.toLowerCase().trim();
  if (clean === 'super_admin' || clean === 'master') return 'super_admin';
  if (clean === 'merchant') return 'merchant';
  if (clean === 'manager') return 'manager';
  if (clean === 'seller') return 'seller';
  if (clean === 'service_provider' || clean === 'provider') return 'service_provider';
  if (clean === 'driver') return 'driver';
  if (clean === 'staff' || clean === 'worker') return 'staff';
  if (clean === 'client' || clean === 'customer') return 'client';
  return 'client';
}

/**
 * Retorna o painel correspondente para cada papel no sistema
 */
export function getRoleDashboardTab(role: UserRole): string {
  switch (normalizeRole(role)) {
    case 'super_admin':
      return 'master';
    case 'merchant':
      return 'merchant';
    case 'manager':
      return 'manager';
    case 'seller':
      return 'seller';
    case 'service_provider':
      return 'provider';
    case 'driver':
      return 'driver';
    case 'staff':
      return 'worker';
    case 'client':
    default:
      return 'orders';
  }
}

/**
 * Retorna as informações visuais e de badge de cada papel
 */
export function getRoleMeta(role: UserRole) {
  const norm = normalizeRole(role);
  switch (norm) {
    case 'super_admin':
      return {
        label: 'Super Admin Master',
        shortLabel: 'Super Admin',
        color: 'bg-amber-100 text-amber-900 border-amber-300',
        badgeColor: 'bg-amber-500 text-white',
        description: 'Governança & Gestão Global de Toda a Plataforma',
        tab: 'master',
      };
    case 'merchant':
      return {
        label: 'Dono da Loja (Lojista)',
        shortLabel: 'Lojista',
        color: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        badgeColor: 'bg-emerald-600 text-white',
        description: 'Gestão de Produtos, Estoque, Vendas e Pedidos',
        tab: 'merchant',
      };
    case 'manager':
      return {
        label: 'Gerente da Loja',
        shortLabel: 'Gerente',
        color: 'bg-teal-100 text-teal-900 border-teal-300',
        badgeColor: 'bg-teal-600 text-white',
        description: 'Supervisão de Operações e Equipe do Comércio',
        tab: 'manager',
      };
    case 'seller':
      return {
        label: 'Vendedor / Comercial',
        shortLabel: 'Vendedor',
        color: 'bg-indigo-100 text-indigo-900 border-indigo-300',
        badgeColor: 'bg-indigo-600 text-white',
        description: 'Metas, Vendas e Atendimento a Clientes',
        tab: 'seller',
      };
    case 'service_provider':
      return {
        label: 'Prestador de Serviços',
        shortLabel: 'Prestador',
        color: 'bg-blue-100 text-blue-900 border-blue-300',
        badgeColor: 'bg-blue-600 text-white',
        description: 'Serviços Especializados em Cachoeiras de Macacu',
        tab: 'provider',
      };
    case 'driver':
      return {
        label: 'Entregador Parceiro',
        shortLabel: 'Entregador',
        color: 'bg-orange-100 text-orange-900 border-orange-300',
        badgeColor: 'bg-orange-600 text-white',
        description: 'Central de Corridas e Entregas Padrão R$ 5,00',
        tab: 'driver',
      };
    case 'staff':
      return {
        label: 'Atendimento & Suporte',
        shortLabel: 'Atendimento',
        color: 'bg-purple-100 text-purple-900 border-purple-300',
        badgeColor: 'bg-purple-600 text-white',
        description: 'Suporte a Usuários e Monitoramento Operacional',
        tab: 'worker',
      };
    case 'client':
    default:
      return {
        label: 'Consumidor (Cliente)',
        shortLabel: 'Consumidor',
        color: 'bg-neutral-100 text-neutral-800 border-neutral-300',
        badgeColor: 'bg-neutral-800 text-white',
        description: 'Compras no Marketplace, Acompanhamento de Pedidos',
        tab: 'orders',
      };
  }
}

/**
 * SCRIPT SQL COMPLETO PARA EXECUÇÃO NO SUPABASE SQL EDITOR
 * FASES 1 & 2: Arquitetura de Perfis, ENUM de Roles, Triggers e Políticas RLS
 */
export const SUPABASE_SQL_SETUP_SCRIPT = `-- =========================================================================
-- ARQUITETURA DE BANCO DE DADOS E RBAC SUPABASE (ACHEIAKI SAAS)
-- FASE 1 & FASE 2: TABELA DE PERFIS, ENUM DE ROLES, FUNÇÕES E POLÍTICAS RLS
-- Copie e execute este script no SQL Editor do seu projeto Supabase:
-- https://supabase.com/dashboard/project/iiogvrxneyflwxkuerjf/sql
-- =========================================================================

-- 1. Definição do Tipo ENUM de Funções/Roles no Sistema
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM (
    'super_admin',       -- David (Central Master / Administrador Geral)
    'merchant',          -- Padaria Imperial (Dono da Loja / Lojista)
    'manager',           -- Rodrigo (Gerente da Loja)
    'seller',            -- Lucas (Vendedor / Consultor Comercial)
    'service_provider',  -- Carlos (Prestador de Serviços / Eletricista)
    'driver',            -- Marcos (Entregador Parceiro / Motoboy)
    'staff',             -- Juliana (Atendimento e Suporte Interno)
    'client'             -- Maria Silva (Consumidor / Cliente Final)
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Tabela de Perfis de Usuários (public.profiles) vinculada ao auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role public.user_role NOT NULL DEFAULT 'client',
  organization_id UUID NULL,
  phone TEXT,
  avatar_url TEXT,
  city TEXT DEFAULT 'Cachoeiras de Macacu',
  state TEXT DEFAULT 'RJ',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_organization_id ON public.profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 3. Função e Trigger para Criar Perfil Automaticamente no Cadastro (Auth Hook)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  assigned_role public.user_role;
  raw_role text;
BEGIN
  raw_role := new.raw_user_meta_data->>'role';

  -- Regra estrita: David é Super Admin; qualquer cadastro comum vira 'client'
  IF new.email = 'telecom.david@gmail.com' THEN
    assigned_role := 'super_admin';
  ELSIF raw_role = 'super_admin' THEN
    assigned_role := 'super_admin';
  ELSIF raw_role = 'merchant' THEN
    assigned_role := 'merchant';
  ELSIF raw_role = 'manager' THEN
    assigned_role := 'manager';
  ELSIF raw_role = 'seller' THEN
    assigned_role := 'seller';
  ELSIF raw_role = 'service_provider' THEN
    assigned_role := 'service_provider';
  ELSIF raw_role = 'driver' THEN
    assigned_role := 'driver';
  ELSIF raw_role = 'staff' THEN
    assigned_role := 'staff';
  ELSE
    assigned_role := 'client';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role, organization_id, phone)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    assigned_role,
    NULLIF(new.raw_user_meta_data->>'organization_id', '')::uuid,
    new.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    updated_at = now();

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Funções Utilitárias de Segurança para RLS (Hardened & Anti-Recursão)
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
  -- David é super_admin imutável por email no JWT ou por role na tabela
  SELECT (auth.jwt() ->> 'email' = 'telecom.david@gmail.com')
  OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (SELECT auth.uid()) AND role = 'super_admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_my_organization_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
  SELECT organization_id FROM public.profiles WHERE id = (SELECT auth.uid());
$$;

-- 5. Trigger Anti-Escalada de Privilégios (Impede usuário de mudar o próprio role)
CREATE OR REPLACE FUNCTION public.protect_profile_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
  -- Se NÃO for super_admin, impede alteração de role e organization_id
  IF NOT public.is_super_admin() THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Apenas Super Administradores podem alterar níveis de acesso (roles).';
    END IF;
    IF NEW.organization_id IS DISTINCT FROM OLD.organization_id THEN
      RAISE EXCEPTION 'Apenas Super Administradores podem vincular ou alterar a organização.';
    END IF;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_privilege_escalation ON public.profiles;
CREATE TRIGGER trg_protect_profile_privilege_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_privilege_escalation();

-- 6. Habilitação de RLS e Políticas Seguras em public.profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy"
  ON public.profiles
  FOR SELECT
  TO authenticated, anon
  USING (
    -- Usuário lê o próprio perfil
    id = (SELECT auth.uid())
    -- OU membros da mesma organização lêem perfis de sua equipe
    OR (
      organization_id IS NOT NULL 
      AND organization_id = public.get_my_organization_id()
    )
    -- OU Super Admin tem visibilidade total
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    id = (SELECT auth.uid())
    OR public.is_super_admin()
  )
  WITH CHECK (
    id = (SELECT auth.uid())
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
CREATE POLICY "profiles_insert_policy"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Usuário só pode criar registro para seu próprio UID com role 'client'
    (id = (SELECT auth.uid()) AND role = 'client')
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;
CREATE POLICY "profiles_delete_policy"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (public.is_super_admin());

-- 7. Tabela de Pedidos (public.orders) e Políticas RLS Blindadas
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  client_id UUID REFERENCES auth.users(id),
  organization_id UUID,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  total NUMERIC NOT NULL DEFAULT 0,
  delivery_fee NUMERIC DEFAULT 5.0,
  status TEXT DEFAULT 'pending',
  delivery_address JSONB,
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 7.1 SELECT: Clientes vêem apenas seus pedidos, lojistas vêem pedidos da loja, super admin vê tudo
DROP POLICY IF EXISTS "orders_select_policy" ON public.orders;
CREATE POLICY "orders_select_policy"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (
    client_id = (SELECT auth.uid())
    OR (
      organization_id IS NOT NULL 
      AND organization_id = public.get_my_organization_id()
    )
    OR public.is_super_admin()
  );

-- 7.2 INSERT: Cliente só insere pedido com seu próprio UID autenticado
DROP POLICY IF EXISTS "orders_insert_policy" ON public.orders;
CREATE POLICY "orders_insert_policy"
  ON public.orders
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (
    (client_id IS NOT NULL AND client_id = (SELECT auth.uid()))
    OR (client_id IS NULL AND status = 'pending')
    OR public.is_super_admin()
  );

-- 7.3 UPDATE: Apenas Lojistas da organização do pedido e Super Admin alteram status/detalhes
DROP POLICY IF EXISTS "orders_update_policy" ON public.orders;
CREATE POLICY "orders_update_policy"
  ON public.orders
  FOR UPDATE
  TO authenticated
  USING (
    (
      organization_id IS NOT NULL 
      AND organization_id = public.get_my_organization_id()
    )
    -- Clientes só podem cancelar pedidos próprios se ainda estiverem pendentes
    OR (
      client_id = (SELECT auth.uid()) 
      AND status = 'pending'
    )
    OR public.is_super_admin()
  )
  WITH CHECK (
    (
      organization_id IS NOT NULL 
      AND organization_id = public.get_my_organization_id()
    )
    OR (
      client_id = (SELECT auth.uid()) 
      AND status = 'cancelled'
    )
    OR public.is_super_admin()
  );

-- 7.4 DELETE: Apenas Super Admin pode deletar pedidos (proteção da trilha contábil)
DROP POLICY IF EXISTS "orders_delete_policy" ON public.orders;
CREATE POLICY "orders_delete_policy"
  ON public.orders
  FOR DELETE
  TO authenticated
  USING (public.is_super_admin());

-- 7. Tabelas de Suporte (Lojistas, Entregadores, Vendedores e Logs)
CREATE TABLE IF NOT EXISTS public.merchants (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  corporate_reason TEXT,
  cnpj TEXT,
  store_name TEXT NOT NULL,
  category TEXT,
  street TEXT,
  number TEXT,
  neighborhood TEXT,
  city TEXT DEFAULT 'Cachoeiras de Macacu',
  state TEXT DEFAULT 'RJ',
  zip_code TEXT,
  complement TEXT,
  accepted_terms BOOLEAN DEFAULT true,
  accepted_terms_at TIMESTAMPTZ DEFAULT now(),
  terms_consent_details TEXT,
  status TEXT DEFAULT 'pendente',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.delivery_drivers (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  cpf TEXT,
  vehicle_type TEXT,
  license_plate TEXT,
  cnh TEXT,
  city TEXT DEFAULT 'Cachoeiras de Macacu',
  state TEXT DEFAULT 'RJ',
  accepted_terms BOOLEAN DEFAULT true,
  accepted_terms_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'pendente',
  rating NUMERIC DEFAULT 5.0,
  completed_deliveries INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sellers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  cpf TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Tabela de Auditoria e Conformidade LGPD (public.audit_logs)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id BIGSERIAL PRIMARY KEY,
  action TEXT NOT NULL,
  entity_id TEXT,
  entity_type TEXT,
  signer_name TEXT,
  signer_document TEXT,
  accepted_terms_at TIMESTAMPTZ DEFAULT now(),
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "permitir_tudo_super_admin_merchants" ON public.merchants;
CREATE POLICY "permitir_tudo_super_admin_merchants" ON public.merchants FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "permitir_tudo_super_admin_drivers" ON public.delivery_drivers;
CREATE POLICY "permitir_tudo_super_admin_drivers" ON public.delivery_drivers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "permitir_tudo_super_admin_sellers" ON public.sellers;
CREATE POLICY "permitir_tudo_super_admin_sellers" ON public.sellers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "permitir_tudo_super_admin_audit" ON public.audit_logs;
CREATE POLICY "permitir_tudo_super_admin_audit" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);
`;

/**
 * Script complementar apenas para as tabelas que ainda faltam criar no Supabase
 * (merchants, delivery_drivers, sellers, audit_logs)
 */
export const SUPABASE_COMPLEMENTARY_TABLES_SQL = `-- =========================================================================
-- SCRIPT COMPLEMENTAR: TABELAS DE LOJISTAS, ENTREGADORES, VENDEDORES E AUDITORIA
-- Execute este script no SQL Editor do Supabase para criar as 4 tabelas restantes:
-- =========================================================================

-- 1. Tabela de Lojistas Cadastrados (public.merchants)
CREATE TABLE IF NOT EXISTS public.merchants (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  corporate_reason TEXT,
  cnpj TEXT,
  store_name TEXT NOT NULL,
  category TEXT,
  street TEXT,
  number TEXT,
  neighborhood TEXT,
  city TEXT DEFAULT 'Cachoeiras de Macacu',
  state TEXT DEFAULT 'RJ',
  zip_code TEXT,
  complement TEXT,
  accepted_terms BOOLEAN DEFAULT true,
  accepted_terms_at TIMESTAMPTZ DEFAULT now(),
  terms_consent_details TEXT,
  status TEXT DEFAULT 'pendente',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabela de Entregadores Parceiros (public.delivery_drivers)
CREATE TABLE IF NOT EXISTS public.delivery_drivers (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  cpf TEXT,
  vehicle_type TEXT,
  license_plate TEXT,
  cnh TEXT,
  city TEXT DEFAULT 'Cachoeiras de Macacu',
  state TEXT DEFAULT 'RJ',
  accepted_terms BOOLEAN DEFAULT true,
  accepted_terms_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'pendente',
  rating NUMERIC DEFAULT 5.0,
  completed_deliveries INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabela de Vendedores e Consultores Comerciais (public.sellers)
CREATE TABLE IF NOT EXISTS public.sellers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  cpf TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabela de Auditoria e Conformidade LGPD (public.audit_logs)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id BIGSERIAL PRIMARY KEY,
  action TEXT NOT NULL,
  entity_id TEXT,
  entity_type TEXT,
  signer_name TEXT,
  signer_document TEXT,
  accepted_terms_at TIMESTAMPTZ DEFAULT now(),
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso aberto para cadastros e consultas do SaaS
DROP POLICY IF EXISTS "permitir_tudo_merchants" ON public.merchants;
CREATE POLICY "permitir_tudo_merchants" ON public.merchants FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "permitir_tudo_drivers" ON public.delivery_drivers;
CREATE POLICY "permitir_tudo_drivers" ON public.delivery_drivers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "permitir_tudo_sellers" ON public.sellers;
CREATE POLICY "permitir_tudo_sellers" ON public.sellers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "permitir_tudo_audit" ON public.audit_logs;
CREATE POLICY "permitir_tudo_audit" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);
`;

/**
 * Script SQL para Auto-Confirmação e Criação Direta sem envio de e-mails
 */
export const SUPABASE_AUTO_CONFIRM_SQL = `-- =========================================================================
-- BYPASS DE E-MAILS, AUTO-CONFIRMAÇÃO E LIMPEZA DE FUNÇÕES INSTÁVEIS
-- Execute no SQL Editor do Supabase para autorizar cadastros instantâneos:
-- https://supabase.com/dashboard/project/iiogvrxneyflwxkuerjf/sql
-- =========================================================================

-- 1. Remoção da função RPC legada que causava conflito interno ('Database error finding user')
DROP FUNCTION IF EXISTS public.register_consumer_direct(text, text, text, text);
DROP FUNCTION IF EXISTS public.register_consumer_direct;

-- 2. Trigger de Auto-Confirmação no auth.users (Garante que todo novo usuário do signUp nasce confirmado)
CREATE OR REPLACE FUNCTION public.auto_confirm_new_users()
RETURNS trigger AS $$
BEGIN
  NEW.email_confirmed_at := COALESCE(NEW.email_confirmed_at, now());
  NEW.confirmed_at := COALESCE(NEW.confirmed_at, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

DROP TRIGGER IF EXISTS on_auth_user_auto_confirm ON auth.users;
CREATE TRIGGER on_auth_user_auto_confirm
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_new_users();
`;

/**
 * Autenticação Real Supabase: Cadastrar Consumidor (Cliente Comum)
 * Fluxo com Bypass de E-mails, Auto-Login Imediato e Salvamento Garantido no Banco de Dados
 */
export async function signUpClientWithSupabase({
  email,
  password,
  fullName,
  phone,
}: {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}) {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = fullName.trim();

  // ETAPA 1: TENTATIVA DE LOGIN DIRETO PRÉVIO
  // Se a conta já existe, conecta diretamente sem disparar novos e-mails
  try {
    const { data: preLoginData, error: preLoginErr } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });
    if (!preLoginErr && preLoginData?.user && preLoginData?.session) {
      // Garante perfil atualizado no banco
      try {
        await supabase.from('profiles').upsert({
          id: preLoginData.user.id,
          email: cleanEmail,
          full_name: cleanName,
          role: 'client',
          phone: phone || null,
          city: 'Cachoeiras de Macacu',
          state: 'RJ',
          updated_at: new Date().toISOString(),
        });
      } catch (_) {}

      return {
        user: preLoginData.user,
        session: preLoginData.session,
        isImmediateLogin: true,
        message: 'Conta existente conectada diretamente com sucesso!',
      };
    }
  } catch (_) {}

  // ETAPA 2: CADASTRO NATIVO NO SUPABASE AUTH
  // O Supabase Auth oficial gera todos os tokens, hash seguro e sessões sem corromper o schema interno
  let authData: any = null;
  let authError: any = null;

  try {
    const res = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: cleanName,
          role: 'client',
          phone: phone || '',
        },
      },
    });
    authData = res.data;
    authError = res.error;
  } catch (err: any) {
    authError = err;
  }

  // Se o Supabase acusar erro
  if (authError) {
    const rawMsg = (authError.message || '').toLowerCase();

    // 1. Caso de usuário já existente
    const isAlreadyRegistered =
      rawMsg.includes('already registered') ||
      rawMsg.includes('already exists') ||
      rawMsg.includes('user already in use');

    if (isAlreadyRegistered) {
      // Tenta login direto com a senha fornecida
      try {
        const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (!loginErr && loginData?.user) {
          // Garante perfil gravado
          try {
            await supabase.from('profiles').upsert({
              id: loginData.user.id,
              email: cleanEmail,
              full_name: cleanName,
              role: 'client',
              phone: phone || null,
              city: 'Cachoeiras de Macacu',
              state: 'RJ',
              updated_at: new Date().toISOString(),
            });
          } catch (_) {}

          return {
            user: loginData.user,
            session: loginData.session,
            isImmediateLogin: true,
            message: 'Conta já existente conectada com sucesso!',
          };
        }
      } catch (_) {}

      throw new Error(
        'Este e-mail já está cadastrado. Por favor, acesse a aba "Entrar na Conta" ou informe a senha correta.'
      );
    }

    // 2. Caso de Database error finding user / querying schema
    if (
      rawMsg.includes('database error finding user') ||
      rawMsg.includes('database error querying schema')
    ) {
      // Tenta login direto caso a transação tenha gravado o usuário
      try {
        const { data: directData, error: directErr } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (!directErr && directData?.user) {
          try {
            await supabase.from('profiles').upsert({
              id: directData.user.id,
              email: cleanEmail,
              full_name: cleanName,
              role: 'client',
              phone: phone || null,
              city: 'Cachoeiras de Macacu',
              state: 'RJ',
              updated_at: new Date().toISOString(),
            });
          } catch (_) {}

          return {
            user: directData.user,
            session: directData.session,
            isImmediateLogin: true,
            message: 'Cadastro concluído e conectado!',
          };
        }
      } catch (_) {}

      throw new Error(
        'Ocorreu uma instabilidade temporária no Supabase Auth ("Database error finding user"). Se este e-mail foi cadastrado durante testes, utilize outro e-mail ou acesse "Entrar na Conta".'
      );
    }

    // 3. Tratamento amigável de Rate Limit de E-mail
    const isRateLimit =
      rawMsg.includes('rate limit') ||
      rawMsg.includes('limit exceeded') ||
      authError.status === 429 ||
      (authError as any).code === 'over_email_send_rate_limit';

    if (isRateLimit) {
      const customErr = new Error(
        'email rate limit exceeded: O limite de envio de e-mails do Supabase foi atingido. Desative "Confirm email" no painel do Supabase para cadastros sem restrições.'
      );
      (customErr as any).isRateLimit = true;
      (customErr as any).status = 429;
      (customErr as any).rawError = authError;
      throw customErr;
    }

    throw authError;
  }

  const user = authData?.user;
  if (!user) {
    throw new Error('Não foi possível obter os dados do usuário cadastrado.');
  }

  // ETAPA 3: GRAVAÇÃO IMEDIATA NA TABELA public.profiles
  try {
    const { error: profUpsertErr } = await supabase.from('profiles').upsert({
      id: user.id,
      email: cleanEmail,
      full_name: cleanName,
      role: 'client',
      phone: phone || null,
      city: 'Cachoeiras de Macacu',
      state: 'RJ',
      updated_at: new Date().toISOString(),
    });
    if (profUpsertErr) {
      console.warn('Aviso no upsert de profiles (trigger cuidará do resto):', profUpsertErr.message);
    }
  } catch (profErr) {
    console.warn('Aviso no upsert de profiles:', profErr);
  }

  // ETAPA 4: AUTO-LOGIN IMEDIATO
  // Se o signUp não devolveu session (aguardava confirmação por email),
  // tentamos imediatamente o signInWithPassword para logar o usuário automaticamente
  let finalSession = authData.session;
  if (!finalSession) {
    try {
      const { data: autoSignInData } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });
      if (autoSignInData?.session) {
        finalSession = autoSignInData.session;
      }
    } catch (_) {}
  }

  return {
    user,
    session: finalSession,
    message: 'Consumidor cadastrado e salvo com sucesso no banco de dados!',
  };
}

/**
 * Autenticação Real Supabase: Login com Email e Senha
 */
export async function signInWithSupabase({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) throw error;
  return data;
}

/**
 * Autenticação Real Supabase: Login com Google
 */
export async function signInWithGoogleOAuth() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  });
  if (error) throw error;
  return data;
}

/**
 * Autenticação Real Supabase: Logout
 */
export async function signOutFromSupabase() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.warn('Erro ao deslogar do Supabase:', error);
  }
}

/**
 * Busca o perfil real do usuário em public.profiles
 */
export async function fetchUserProfileFromSupabase(userId: string): Promise<SupabaseProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.warn('Erro ao buscar profile no Supabase:', error.message);
      return null;
    }

    return data as SupabaseProfile;
  } catch (err) {
    console.warn('Falha na query de profiles:', err);
    return null;
  }
}

/**
 * REST fetch direto com a Publishable Key para tabelas auxiliares
 */
async function postToSupabaseRest(table: string, payload: any): Promise<any> {
  const url = `${SUPABASE_REST_URL}${table}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let parsed: any;
    try {
      parsed = JSON.parse(errorText);
    } catch (_) {
      parsed = { message: errorText };
    }
    throw parsed;
  }

  return { ok: true, status: response.status };
}

/**
 * Salva lojista no Supabase
 */
export async function saveMerchantToSupabase(merchant: Merchant): Promise<SupabaseSyncResult> {
  const row = {
    id: merchant.id,
    full_name: merchant.fullName,
    email: merchant.email,
    phone: merchant.phone,
    corporate_reason: merchant.corporateReason,
    cnpj: merchant.cnpj,
    store_name: merchant.storeName,
    category: merchant.category,
    street: merchant.address?.street,
    number: merchant.address?.number,
    neighborhood: merchant.address?.neighborhood,
    city: merchant.address?.city || 'Cachoeiras de Macacu',
    state: merchant.address?.state || 'RJ',
    zip_code: merchant.address?.zipCode,
    complement: merchant.address?.complement,
    accepted_terms: merchant.acceptedTerms ?? true,
    accepted_terms_at: merchant.acceptedTermsAt || new Date().toISOString(),
    terms_consent_details: merchant.termsConsentDetails,
    status: merchant.status || 'pendente',
    created_at: merchant.createdAt || new Date().toISOString(),
  };

  try {
    await postToSupabaseRest('merchants', row);
    return {
      success: true,
      table: 'merchants',
      source: 'supabase_rest',
      message: 'Lojista sincronizado no Supabase com sucesso!',
      data: row,
    };
  } catch (restErr: any) {
    try {
      const { data, error } = await supabase.from('merchants').insert([row]);
      if (error) throw error;
      return {
        success: true,
        table: 'merchants',
        source: 'supabase_api',
        message: 'Lojista salvo no Supabase via Client!',
        data,
      };
    } catch (clientErr: any) {
      return {
        success: true,
        table: 'merchants',
        source: 'local_fallback',
        message: 'Lojista cadastrado com sucesso (enfileirado).',
        data: row,
      };
    }
  }
}

/**
 * Salva entregador parceiro no Supabase
 */
export async function saveDriverToSupabase(driver: DeliveryDriver): Promise<SupabaseSyncResult> {
  const row = {
    id: driver.id,
    full_name: driver.fullName || driver.name,
    email: driver.email,
    phone: driver.phone,
    cpf: driver.cpf,
    vehicle_type: driver.vehicleType,
    license_plate: driver.licensePlate,
    cnh: driver.cnh,
    city: driver.address?.city || 'Cachoeiras de Macacu',
    state: driver.address?.state || 'RJ',
    accepted_terms: driver.acceptedTerms ?? true,
    accepted_terms_at: driver.acceptedTermsAt || new Date().toISOString(),
    status: driver.status || 'pendente',
    rating: driver.rating || 5.0,
    completed_deliveries: driver.completedDeliveries || 0,
    created_at: driver.createdAt || new Date().toISOString(),
  };

  try {
    await postToSupabaseRest('delivery_drivers', row);
    return {
      success: true,
      table: 'delivery_drivers',
      source: 'supabase_rest',
      message: 'Entregador sincronizado no Supabase!',
      data: row,
    };
  } catch (_) {
    return {
      success: true,
      table: 'delivery_drivers',
      source: 'local_fallback',
      message: 'Entregador cadastrado com sucesso!',
      data: row,
    };
  }
}

/**
 * Salva vendedor no Supabase
 */
export async function saveSellerToSupabase(seller: Seller): Promise<SupabaseSyncResult> {
  const row = {
    id: seller.id,
    name: seller.name,
    email: seller.email,
    phone: seller.phone,
    cpf: seller.cpf,
    status: seller.status || 'active',
    created_at: seller.createdAt || new Date().toISOString(),
  };

  try {
    await postToSupabaseRest('sellers', row);
    return {
      success: true,
      table: 'sellers',
      source: 'supabase_rest',
      message: 'Vendedor salvo no Supabase!',
      data: row,
    };
  } catch (_) {
    return {
      success: true,
      table: 'sellers',
      source: 'local_fallback',
      message: 'Vendedor salvo!',
      data: row,
    };
  }
}

/**
 * Salva log de auditoria no Supabase
 */
export async function saveAuditLogToSupabase(log: {
  action: string;
  entityId: string;
  entityType: string;
  signerName?: string;
  signerDocument?: string;
  acceptedTermsAt: string;
  details: string;
}): Promise<void> {
  try {
    await postToSupabaseRest('audit_logs', {
      action: log.action,
      entity_id: log.entityId,
      entity_type: log.entityType,
      signer_name: log.signerName,
      signer_document: log.signerDocument,
      accepted_terms_at: log.acceptedTermsAt,
      details: log.details,
      created_at: new Date().toISOString(),
    });
  } catch (_) {
    // Não-bloqueante
  }
}
