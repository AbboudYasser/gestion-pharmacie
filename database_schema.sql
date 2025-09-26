-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.bon_cmde_four (
  num_bon_cmde_four text NOT NULL,
  dat_cmde_four date DEFAULT CURRENT_DATE,
  cod_four text,
  CONSTRAINT bon_cmde_four_pkey PRIMARY KEY (num_bon_cmde_four),
  CONSTRAINT bon_cmde_four_cod_four_fkey FOREIGN KEY (cod_four) REFERENCES
public.fournisseur(cod_four)
);
CREATE TABLE public.bon_cmde_serv (
  num_bon_cmde_serv text NOT NULL,
  dat_cmde_serv date DEFAULT CURRENT_DATE,
  num_serv text,
  CONSTRAINT bon_cmde_serv_pkey PRIMARY KEY (num_bon_cmde_serv),
  CONSTRAINT bon_cmde_serv_num_serv_fkey FOREIGN KEY (num_serv) REFERENCES
public.service(num_serv)
);
CREATE TABLE public.bon_liv_four (
  num_bon_liv_four text NOT NULL,
  dat_liv_four date DEFAULT CURRENT_DATE,
  num_bon_cmde_four text,
  CONSTRAINT bon_liv_four_pkey PRIMARY KEY (num_bon_liv_four),
  CONSTRAINT bon_liv_four_num_bon_cmde_four_fkey FOREIGN KEY
(num_bon_cmde_four) REFERENCES public.bon_cmde_four(num_bon_cmde_four)
);
CREATE TABLE public.bon_liv_serv (
  num_bon_liv_serv text NOT NULL,
  dat_liv_serv date DEFAULT CURRENT_DATE,
  num_bon_cmde_serv text,
  CONSTRAINT bon_liv_serv_pkey PRIMARY KEY (num_bon_liv_serv),
  CONSTRAINT bon_liv_serv_num_bon_cmde_serv_fkey FOREIGN KEY
(num_bon_cmde_serv) REFERENCES public.bon_cmde_serv(num_bon_cmde_serv)
);
CREATE TABLE public.bon_recp (
  num_bon_recp text NOT NULL,
  dat_recp date DEFAULT CURRENT_DATE,
  num_fact text,
  CONSTRAINT bon_recp_pkey PRIMARY KEY (num_bon_recp),
  CONSTRAINT bon_recp_num_fact_fkey FOREIGN KEY (num_fact) REFERENCES
public.facture(num_fact)
);
CREATE TABLE public.decharge (
  num_dech text NOT NULL,
  typ_dech text,
  dat_dech date DEFAULT CURRENT_DATE,
  nom_demn text,
  adres_demn text,
  CONSTRAINT decharge_pkey PRIMARY KEY (num_dech)
);
CREATE TABLE public.detail_cmde_four (
  num_bon_cmde_four text NOT NULL,
  ref_prod text NOT NULL,
  qte_dm_four integer NOT NULL,
  CONSTRAINT detail_cmde_four_pkey PRIMARY KEY (num_bon_cmde_four,
ref_prod),
  CONSTRAINT detail_cmde_four_num_bon_cmde_four_fkey FOREIGN KEY
(num_bon_cmde_four) REFERENCES public.bon_cmde_four(num_bon_cmde_four),
  CONSTRAINT detail_cmde_four_ref_prod_fkey FOREIGN KEY (ref_prod)
REFERENCES public.produit(ref_prod)
);
CREATE TABLE public.detail_cmde_serv (
  num_bon_cmde_serv text NOT NULL,
  ref_prod text NOT NULL,
  qte_dat_serv integer NOT NULL,
  CONSTRAINT detail_cmde_serv_pkey PRIMARY KEY (ref_prod,
num_bon_cmde_serv),
  CONSTRAINT detail_cmde_serv_num_bon_cmde_serv_fkey FOREIGN KEY
(num_bon_cmde_serv) REFERENCES public.bon_cmde_serv(num_bon_cmde_serv),
  CONSTRAINT detail_cmde_serv_ref_prod_fkey FOREIGN KEY (ref_prod)
REFERENCES public.produit(ref_prod)
);
CREATE TABLE public.detail_decharge (
  num_dech text NOT NULL,
  ref_prod text NOT NULL,
  qte_dech integer NOT NULL,
  CONSTRAINT detail_decharge_pkey PRIMARY KEY (ref_prod, num_dech),
  CONSTRAINT detail_decharge_num_dech_fkey FOREIGN KEY (num_dech)
REFERENCES public.decharge(num_dech),
  CONSTRAINT detail_decharge_ref_prod_fkey FOREIGN KEY (ref_prod)
REFERENCES public.produit(ref_prod)
);
CREATE TABLE public.detail_liv_four (
  num_bon_liv_four text NOT NULL,
  ref_prod text NOT NULL,
  qte_liv_four integer NOT NULL,
  CONSTRAINT detail_liv_four_pkey PRIMARY KEY (ref_prod, num_bon_liv_four),
  CONSTRAINT detail_liv_four_num_bon_liv_four_fkey FOREIGN KEY
(num_bon_liv_four) REFERENCES public.bon_liv_four(num_bon_liv_four),
  CONSTRAINT detail_liv_four_ref_prod_fkey FOREIGN KEY (ref_prod)
REFERENCES public.produit(ref_prod)
);
CREATE TABLE public.detail_liv_serv (
  num_bon_liv_serv text NOT NULL,
  ref_prod text NOT NULL,
  qte_liv_serv integer NOT NULL,
  CONSTRAINT detail_liv_serv_pkey PRIMARY KEY (ref_prod, num_bon_liv_serv),
  CONSTRAINT detail_liv_serv_num_bon_liv_serv_fkey FOREIGN KEY
(num_bon_liv_serv) REFERENCES public.bon_liv_serv(num_bon_liv_serv),
  CONSTRAINT detail_liv_serv_ref_prod_fkey FOREIGN KEY (ref_prod)
REFERENCES public.produit(ref_prod)
);
CREATE TABLE public.facture (
  num_fact text NOT NULL,
  dat_fact date DEFAULT CURRENT_DATE,
  montant numeric NOT NULL,
  cod_four text,
  CONSTRAINT facture_pkey PRIMARY KEY (num_fact),
  CONSTRAINT facture_cod_four_fkey FOREIGN KEY (cod_four) REFERENCES
public.fournisseur(cod_four)
);
CREATE TABLE public.fournisseur (
  cod_four text NOT NULL,
  nom_four text NOT NULL,
  adres_four text,
  num_tel_four text,
  num_comp_four text,
  CONSTRAINT fournisseur_pkey PRIMARY KEY (cod_four)
);
CREATE TABLE public.magasin (
  num_mag text NOT NULL,
  stok_ini numeric,
  stok_fin numeric,
  CONSTRAINT magasin_pkey PRIMARY KEY (num_mag)
);
CREATE TABLE public.patients (
  id text NOT NULL,
  full_name text NOT NULL,
  date_of_birth date,
  address text,
  CONSTRAINT patients_pkey PRIMARY KEY (id)
);
CREATE TABLE public.produit (
  ref_prod text NOT NULL,
  desig_prod text NOT NULL,
  p_u numeric NOT NULL,
  typ_prod text,
  qte_stc integer NOT NULL,
  num_mag text,
  CONSTRAINT produit_pkey PRIMARY KEY (ref_prod),
  CONSTRAINT produit_num_mag_fkey FOREIGN KEY (num_mag) REFERENCES
public.magasin(num_mag)
);
CREATE TABLE public.service (
  num_serv text NOT NULL,
  desig_serv text NOT NULL,
  CONSTRAINT service_pkey PRIMARY KEY (num_serv)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  prenom text NOT NULL,
  nom text NOT NULL,
  email text NOT NULL UNIQUE,
  telephone text,
  type_piece public.piece_type NOT NULL,
  num_piece text NOT NULL UNIQUE,
  role public.user_role NOT NULL,
  num_serv character varying,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  password text,
  cod_four character varying,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_num_serv_fkey FOREIGN KEY (num_serv) REFERENCES
public.service(num_serv),
  CONSTRAINT users_cod_four_fkey FOREIGN KEY (cod_four) REFERENCES
public.fournisseur(cod_four)
);
