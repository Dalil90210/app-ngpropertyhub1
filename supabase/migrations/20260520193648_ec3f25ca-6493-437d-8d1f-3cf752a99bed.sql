
-- Role enum
CREATE TYPE public.app_role AS ENUM ('buyer', 'seller', 'agent', 'investor', 'admin');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- has_role security definer
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- Properties
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(14,2) NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT,
  bedrooms INT DEFAULT 0,
  bathrooms NUMERIC(3,1) DEFAULT 0,
  sqft INT DEFAULT 0,
  property_type TEXT DEFAULT 'house',
  status TEXT DEFAULT 'active',
  verified BOOLEAN DEFAULT false,
  trust_score INT DEFAULT 0,
  agent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  images TEXT[] DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(14,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  financing_type TEXT,
  closing_date DATE,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.showings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.showings ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_phone TEXT,
  message TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.escrow_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  seller_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  amount NUMERIC(14,2) NOT NULL,
  stage TEXT DEFAULT 'initiated',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.fractional_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  price_per_token NUMERIC(10,2) NOT NULL,
  total_tokens INT NOT NULL,
  available_tokens INT NOT NULL,
  yield_percent NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.fractional_tokens ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.property_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, property_id)
);
ALTER TABLE public.property_follows ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES

-- profiles: self read/update; public read of basic
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- user_roles: user reads own; admin manages
CREATE POLICY "user_roles_select_own" ON public.user_roles FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "user_roles_insert_own_nonadmin" ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_id AND role <> 'admin');
CREATE POLICY "user_roles_admin_all" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- properties
CREATE POLICY "properties_public_read" ON public.properties FOR SELECT USING (true);
CREATE POLICY "properties_insert_own" ON public.properties FOR INSERT WITH CHECK (auth.uid() = agent_id);
CREATE POLICY "properties_update_own" ON public.properties FOR UPDATE USING (auth.uid() = agent_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "properties_delete_own" ON public.properties FOR DELETE USING (auth.uid() = agent_id OR public.has_role(auth.uid(), 'admin'));

-- offers
CREATE POLICY "offers_buyer_read" ON public.offers FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() IN (SELECT agent_id FROM public.properties WHERE id = property_id) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "offers_buyer_insert" ON public.offers FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "offers_update_involved" ON public.offers FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() IN (SELECT agent_id FROM public.properties WHERE id = property_id));

-- showings
CREATE POLICY "showings_involved_read" ON public.showings FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = agent_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "showings_buyer_insert" ON public.showings FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "showings_involved_update" ON public.showings FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = agent_id);

-- inquiries: anyone can submit; agents/admins read those for their listings
CREATE POLICY "inquiries_public_insert" ON public.inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "inquiries_agent_read" ON public.inquiries FOR SELECT USING (auth.uid() IN (SELECT agent_id FROM public.properties WHERE id = property_id) OR public.has_role(auth.uid(), 'admin'));

-- escrow
CREATE POLICY "escrow_involved_read" ON public.escrow_transactions FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "escrow_buyer_insert" ON public.escrow_transactions FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "escrow_update_involved" ON public.escrow_transactions FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id OR public.has_role(auth.uid(), 'admin'));

-- fractional tokens public read
CREATE POLICY "fractional_public_read" ON public.fractional_tokens FOR SELECT USING (true);
CREATE POLICY "fractional_admin_manage" ON public.fractional_tokens FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- property_follows: user manages own
CREATE POLICY "follows_own_all" ON public.property_follows FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- notifications: user reads own
CREATE POLICY "notif_own_read" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notif_own_update" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Profile auto-create trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email), NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER properties_updated BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER escrow_updated BEFORE UPDATE ON public.escrow_transactions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
