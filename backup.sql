--
-- PostgreSQL database dump
--

\restrict BvCCGF0SY3QfuylNN2tv3QLe1UbQDjNfvxx9PhybLi6emphoINCMkVkdL082crN

-- Dumped from database version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: enum_Orders_status; Type: TYPE; Schema: public; Owner: ecom_user
--

CREATE TYPE public."enum_Orders_status" AS ENUM (
    'pending',
    'processing',
    'shipped',
    'delivered',
    'cancelled'
);


ALTER TYPE public."enum_Orders_status" OWNER TO ecom_user;

--
-- Name: enum_Reviews_status; Type: TYPE; Schema: public; Owner: ecom_user
--

CREATE TYPE public."enum_Reviews_status" AS ENUM (
    'pending',
    'approved',
    'rejected'
);


ALTER TYPE public."enum_Reviews_status" OWNER TO ecom_user;

--
-- Name: enum_Users_role; Type: TYPE; Schema: public; Owner: ecom_user
--

CREATE TYPE public."enum_Users_role" AS ENUM (
    'user',
    'admin',
    'super-admin'
);


ALTER TYPE public."enum_Users_role" OWNER TO ecom_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Carts; Type: TABLE; Schema: public; Owner: ecom_user
--

CREATE TABLE public."Carts" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    items jsonb DEFAULT '[]'::jsonb,
    "totalPrice" double precision DEFAULT '0'::double precision,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Carts" OWNER TO ecom_user;

--
-- Name: Carts_id_seq; Type: SEQUENCE; Schema: public; Owner: ecom_user
--

CREATE SEQUENCE public."Carts_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Carts_id_seq" OWNER TO ecom_user;

--
-- Name: Carts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ecom_user
--

ALTER SEQUENCE public."Carts_id_seq" OWNED BY public."Carts".id;


--
-- Name: Categories; Type: TABLE; Schema: public; Owner: ecom_user
--

CREATE TABLE public."Categories" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    image character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Categories" OWNER TO ecom_user;

--
-- Name: Categories_id_seq; Type: SEQUENCE; Schema: public; Owner: ecom_user
--

CREATE SEQUENCE public."Categories_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Categories_id_seq" OWNER TO ecom_user;

--
-- Name: Categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ecom_user
--

ALTER SEQUENCE public."Categories_id_seq" OWNED BY public."Categories".id;


--
-- Name: Orders; Type: TABLE; Schema: public; Owner: ecom_user
--

CREATE TABLE public."Orders" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    items jsonb DEFAULT '[]'::jsonb,
    "totalAmount" double precision DEFAULT '0'::double precision,
    status character varying(255) DEFAULT 'pending'::character varying,
    "paymentMethod" character varying(255),
    "paymentStatus" character varying(255) DEFAULT 'pending'::character varying,
    "shippingAddress" text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "transactionId" character varying(255),
    "hiddenByCustomer" boolean DEFAULT false
);


ALTER TABLE public."Orders" OWNER TO ecom_user;

--
-- Name: Orders_id_seq; Type: SEQUENCE; Schema: public; Owner: ecom_user
--

CREATE SEQUENCE public."Orders_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Orders_id_seq" OWNER TO ecom_user;

--
-- Name: Orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ecom_user
--

ALTER SEQUENCE public."Orders_id_seq" OWNED BY public."Orders".id;


--
-- Name: Products; Type: TABLE; Schema: public; Owner: ecom_user
--

CREATE TABLE public."Products" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    price double precision DEFAULT '0'::double precision NOT NULL,
    stock integer DEFAULT 0,
    images character varying(255)[] DEFAULT (ARRAY[]::character varying[])::character varying(255)[],
    ratings integer[] DEFAULT ARRAY[]::integer[],
    "averageRating" double precision DEFAULT '0'::double precision,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    category character varying(255) DEFAULT 'Uncategorized'::character varying,
    "isActive" boolean DEFAULT true,
    "deletedAt" timestamp with time zone
);


ALTER TABLE public."Products" OWNER TO ecom_user;

--
-- Name: Products_id_seq; Type: SEQUENCE; Schema: public; Owner: ecom_user
--

CREATE SEQUENCE public."Products_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Products_id_seq" OWNER TO ecom_user;

--
-- Name: Products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ecom_user
--

ALTER SEQUENCE public."Products_id_seq" OWNED BY public."Products".id;


--
-- Name: Reviews; Type: TABLE; Schema: public; Owner: ecom_user
--

CREATE TABLE public."Reviews" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "productId" integer NOT NULL,
    rating integer NOT NULL,
    comment text NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    title character varying(255),
    images character varying(255)[] DEFAULT (ARRAY[]::character varying[])::character varying(255)[],
    "helpfulCount" integer DEFAULT 0,
    "helpfulUsers" integer[] DEFAULT ARRAY[]::integer[],
    status public."enum_Reviews_status" DEFAULT 'approved'::public."enum_Reviews_status",
    verified boolean DEFAULT false,
    replies jsonb DEFAULT '[]'::jsonb NOT NULL
);


ALTER TABLE public."Reviews" OWNER TO ecom_user;

--
-- Name: Reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: ecom_user
--

CREATE SEQUENCE public."Reviews_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Reviews_id_seq" OWNER TO ecom_user;

--
-- Name: Reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ecom_user
--

ALTER SEQUENCE public."Reviews_id_seq" OWNED BY public."Reviews".id;


--
-- Name: StoreSettings; Type: TABLE; Schema: public; Owner: ecom_user
--

CREATE TABLE public."StoreSettings" (
    id integer NOT NULL,
    "storeName" character varying(255) DEFAULT 'E-Store'::character varying,
    "storeEmail" character varying(255) DEFAULT 'contact@estore.com'::character varying,
    "storePhone" character varying(255) DEFAULT '+1 (555) 123-4567'::character varying,
    "storeAddress" character varying(255) DEFAULT '123 Commerce St, New York, NY 10001'::character varying,
    currency character varying(255) DEFAULT 'USD'::character varying,
    timezone character varying(255) DEFAULT 'America/New_York'::character varying,
    language character varying(255) DEFAULT 'en'::character varying,
    "paymentMethods" json DEFAULT '[{"id":"stripe","name":"Stripe","enabled":true,"testMode":true},{"id":"paypal","name":"PayPal","enabled":true,"testMode":true},{"id":"cod","name":"Cash on Delivery","enabled":false,"testMode":false}]'::json,
    "shippingMethods" json DEFAULT '[{"id":"standard","name":"Standard Shipping","price":5.99,"days":"5-7","enabled":true},{"id":"express","name":"Express Shipping","price":14.99,"days":"2-3","enabled":true},{"id":"overnight","name":"Overnight Shipping","price":24.99,"days":"1","enabled":false}]'::json,
    "emailSettings" json DEFAULT '{"orderConfirmation":true,"shippingConfirmation":true,"passwordReset":true,"welcomeEmail":true,"newsletterEnabled":true,"adminNotifications":true,"lowStockAlerts":true,"emailSignature":"The E-Store Team","welcomeMessageTitle":"Welcome to {storeName}, {userName}! 🎉","welcomeMessageBody":"Thank you for joining {storeName}! We''re excited to have you on board.","passwordResetMessageTitle":"🔐 Password Reset Request","passwordResetMessageBody":"We received a request to reset your password. Click the button below to create a new password. This link will expire in 1 hour for security reasons.","orderDeliveredMessageTitle":"Your Order #{orderId} Has Been Delivered","orderDeliveredMessageBody":"Good news! Your order has been marked as delivered. Here are the items included in your shipment."}'::json,
    "securitySettings" json DEFAULT '{"twoFactorAuth":false,"sessionTimeout":30,"maxLoginAttempts":5,"passwordMinLength":8,"requireEmailVerification":true,"ipWhitelist":[]}'::json,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."StoreSettings" OWNER TO ecom_user;

--
-- Name: StoreSettings_id_seq; Type: SEQUENCE; Schema: public; Owner: ecom_user
--

CREATE SEQUENCE public."StoreSettings_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."StoreSettings_id_seq" OWNER TO ecom_user;

--
-- Name: StoreSettings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ecom_user
--

ALTER SEQUENCE public."StoreSettings_id_seq" OWNED BY public."StoreSettings".id;


--
-- Name: Users; Type: TABLE; Schema: public; Owner: ecom_user
--

CREATE TABLE public."Users" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    role public."enum_Users_role" DEFAULT 'user'::public."enum_Users_role",
    address character varying(255),
    "isVerified" boolean DEFAULT false,
    "resetPasswordToken" character varying(255),
    "resetPasswordExpires" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    phone character varying(255),
    otp character varying(255),
    "otpExpires" timestamp with time zone,
    city character varying(255),
    state character varying(255),
    "zipCode" character varying(255),
    country character varying(255)
);


ALTER TABLE public."Users" OWNER TO ecom_user;

--
-- Name: Users_id_seq; Type: SEQUENCE; Schema: public; Owner: ecom_user
--

CREATE SEQUENCE public."Users_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Users_id_seq" OWNER TO ecom_user;

--
-- Name: Users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ecom_user
--

ALTER SEQUENCE public."Users_id_seq" OWNED BY public."Users".id;


--
-- Name: Carts id; Type: DEFAULT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Carts" ALTER COLUMN id SET DEFAULT nextval('public."Carts_id_seq"'::regclass);


--
-- Name: Categories id; Type: DEFAULT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Categories" ALTER COLUMN id SET DEFAULT nextval('public."Categories_id_seq"'::regclass);


--
-- Name: Orders id; Type: DEFAULT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Orders" ALTER COLUMN id SET DEFAULT nextval('public."Orders_id_seq"'::regclass);


--
-- Name: Products id; Type: DEFAULT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Products" ALTER COLUMN id SET DEFAULT nextval('public."Products_id_seq"'::regclass);


--
-- Name: Reviews id; Type: DEFAULT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Reviews" ALTER COLUMN id SET DEFAULT nextval('public."Reviews_id_seq"'::regclass);


--
-- Name: StoreSettings id; Type: DEFAULT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."StoreSettings" ALTER COLUMN id SET DEFAULT nextval('public."StoreSettings_id_seq"'::regclass);


--
-- Name: Users id; Type: DEFAULT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users" ALTER COLUMN id SET DEFAULT nextval('public."Users_id_seq"'::regclass);


--
-- Data for Name: Carts; Type: TABLE DATA; Schema: public; Owner: ecom_user
--

COPY public."Carts" (id, "userId", items, "totalPrice", "createdAt", "updatedAt") FROM stdin;
18	16	[]	0	2026-05-14 12:48:39.304359+03	2026-05-14 12:48:39.304359+03
12	8	[]	0	2026-03-13 12:25:37.147198+03	2026-03-13 12:27:02.351835+03
7	6	[]	0	2026-03-09 21:34:36.498897+03	2026-03-13 15:34:57.391589+03
13	9	[]	0	2026-03-13 15:21:43.306143+03	2026-03-13 16:33:19.263385+03
14	10	[]	0	2026-05-05 09:28:34.602268+03	2026-05-05 09:28:34.602268+03
15	11	[]	0	2026-05-11 10:25:30.484478+03	2026-05-15 15:43:02.945904+03
19	18	[]	0	2026-05-15 15:57:43.377641+03	2026-05-15 15:57:43.377641+03
17	13	[]	0	2026-05-11 11:18:26.753133+03	2026-05-12 20:06:49.912244+03
16	12	[]	0	2026-05-11 11:14:13.35117+03	2026-05-15 14:36:30.149358+03
10	5	[]	0	2026-03-09 21:45:30.971194+03	2026-03-12 11:36:22.932661+03
20	19	[]	0	2026-05-15 17:02:50.725669+03	2026-05-15 17:14:53.971539+03
9	7	[]	0	2026-03-09 21:35:06.314409+03	2026-03-12 11:55:07.263432+03
11	3	[]	0	2026-03-09 21:57:55.332757+03	2026-03-14 04:59:24.988641+03
\.


--
-- Data for Name: Categories; Type: TABLE DATA; Schema: public; Owner: ecom_user
--

COPY public."Categories" (id, name, description, image, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Orders; Type: TABLE DATA; Schema: public; Owner: ecom_user
--

COPY public."Orders" (id, "userId", items, "totalAmount", status, "paymentMethod", "paymentStatus", "shippingAddress", "createdAt", "updatedAt", "transactionId", "hiddenByCustomer") FROM stdin;
1	5	[{"price": 2499.99, "quantity": 1, "productId": 28}]	2499.99	pending	\N	pending	\N	2026-03-11 19:25:43.819+03	2026-03-11 19:25:43.819+03	\N	f
5	5	[{"price": 179.99, "quantity": 1, "productId": 9}]	179.99	pending	\N	pending	\N	2026-03-12 10:45:57.931+03	2026-03-12 10:45:57.931+03	\N	f
6	5	[{"price": 19.99, "quantity": 1, "productId": 33}]	19.99	pending	\N	pending	\N	2026-03-12 10:47:55.291+03	2026-03-12 10:47:55.291+03	\N	f
7	5	[{"price": 2499.99, "quantity": 1, "productId": 28}, {"price": 19.99, "quantity": 2, "productId": 33}]	2539.97	pending	card	pending	123str, new york, NY 10001, United States	2026-03-12 11:05:02.32+03	2026-03-12 11:05:02.32+03	\N	f
8	5	[{"price": 1299.99, "quantity": 1, "productId": 30}]	1299.99	pending	card	pending	njdkdjnd, dd, dd 11111, United States	2026-03-12 11:06:59.428+03	2026-03-12 11:06:59.428+03	\N	f
9	5	[{"price": 1299.99, "quantity": 1, "productId": 30}]	1299.99	pending	card	pending	Ferensay, Addis, NY 10001, United States	2026-03-12 11:12:48.805+03	2026-03-12 11:12:48.805+03	\N	f
10	7	[{"price": 2499.99, "quantity": 1, "productId": 28}]	2499.99	pending	card	pending	ff, new york, NY 10001, United States	2026-03-12 11:20:27.935+03	2026-03-12 11:20:27.935+03	\N	f
11	7	[{"price": 2499.99, "quantity": 1, "productId": 28}]	2499.99	pending	card	pending	qwer, newYork, NY 100001, United States	2026-03-12 11:28:35.631+03	2026-03-12 11:28:35.631+03	\N	f
12	5	[{"price": 19.99, "quantity": 1, "productId": 33}]	19.99	pending	card	pending	123, New York, NY 10001, United States	2026-03-12 11:36:22.734+03	2026-03-12 11:36:22.734+03	\N	f
13	7	[{"price": 2499.99, "quantity": 1, "productId": 28}]	2499.99	pending	card	pending	addis, New York, NY 10001, United States	2026-03-12 11:42:11.243+03	2026-03-12 11:42:11.243+03	\N	f
14	7	[{"price": 2499.99, "quantity": 1, "productId": 28}]	2499.99	pending	card	pending	Et, New York, NY 10001, United States	2026-03-12 11:55:07.108+03	2026-03-12 11:55:07.108+03	\N	f
2	7	[{"price": 179.99, "quantity": 1, "productId": 9}]	179.99	cancelled	\N	pending	\N	2026-03-11 19:29:59.408+03	2026-03-13 10:32:23.157+03	\N	f
15	6	[{"price": 19.99, "quantity": 1, "productId": 33}]	19.99	cancelled	card	pending	Fernesay, Addis Abeba, Yeka 1000, United States	2026-03-13 10:35:25.489+03	2026-03-13 10:35:48.719+03	\N	f
17	8	[{"price": 79.99, "quantity": 1, "productId": 8}]	79.99	pending	card	pending	ArogeArada, Sodo, Wolyta 2000, United States	2026-03-13 12:27:02.23+03	2026-03-13 12:27:02.23+03	\N	f
16	6	[{"price": 29.99, "quantity": 1, "productId": 34}]	29.99	cancelled	card	pending	123Admin, Addis Abeba, Bole 1000, United States	2026-03-13 11:55:14.097+03	2026-03-14 03:16:07.281+03	\N	f
23	13	[{"price": 2499.99, "quantity": 1, "productId": 28}, {"price": 349.99, "quantity": 1, "productId": 3}]	2849.9799999999996	delivered	card	pending	MERKATO, Addis Abeba, ARADA 10000, Ethiopia	2026-05-12 15:57:35.394+03	2026-05-12 16:04:07.637+03	\N	f
24	11	[{"price": 119.99, "quantity": 1, "productId": 31}]	119.99	pending	telebirr	pending	yeka, Addis Abeba, Addis Abeba 1000, Ethiopia	2026-05-12 19:41:44.708+03	2026-05-12 19:41:44.708+03	\N	f
20	12	[{"price": 28.55, "quantity": 2, "productId": 37}]	57.1	delivered	chapa	pending	ferensay, Addis Abeba, yeka 1000, United States	2026-05-12 08:41:52.097+03	2026-05-12 09:04:16.57+03	\N	f
25	11	[{"price": 119.99, "quantity": 1, "productId": 31}]	119.99	pending	cbe	pending	yeka, Addis Abeba, Addis Abeba 1000, Ethiopia	2026-05-12 19:42:51.366+03	2026-05-12 19:42:51.366+03	\N	f
21	12	[{"price": 119.99, "quantity": 3, "productId": 31}]	359.96999999999997	delivered	telebirr	pending	yeka, Addis Abeba, ny 1000, Ethiopia	2026-05-12 09:09:30.763+03	2026-05-12 09:13:04.257+03	\N	f
22	12	[{"price": 79.99, "quantity": 1, "productId": 32}, {"price": 349.99, "quantity": 1, "productId": 3}]	429.98	cancelled	telebirr	pending	yeka, Addis Abeba, ny 1000, Ethiopia	2026-05-12 09:14:56.719+03	2026-05-12 09:16:11.617+03	\N	f
29	13	[{"price": 129.99, "quantity": 1, "productId": 7}]	129.99	delivered	cbe	pending	MERKATO, Addis Abeba, ARADA 10000, Ethiopia	2026-05-12 19:58:54.376+03	2026-05-12 19:59:17.752+03	CBE-1778605134570	f
27	12	[{"price": 3.99, "quantity": 1, "productId": 36}]	3.99	delivered	card	pending	yeka, Addis Abeba, ny 1000, Ethiopia	2026-05-12 19:44:34.344+03	2026-05-12 19:45:29.045+03	\N	f
30	13	[{"price": 14.99, "quantity": 1, "productId": 14}]	14.99	cancelled	chapa	pending	MERKATO, Addis Abeba, ARADA 10000, Ethiopia	2026-05-12 20:00:38.199+03	2026-05-12 20:01:03.147+03	ORD-000030-1778605238245	f
31	13	[{"price": 349.99, "quantity": 1, "productId": 3}]	349.99	pending	cbe	pending	MERKATO, Addis Abeba, ARADA 10000, Ethiopia	2026-05-12 20:02:18.072+03	2026-05-12 20:02:18.126+03	CBE-1778605338124	f
32	13	[{"price": 9.99, "quantity": 1, "productId": 1}]	9.99	pending	telebirr	pending	MERKATO, Addis Abeba, ARADA 10000, Ethiopia	2026-05-12 20:03:36.337+03	2026-05-12 20:03:36.405+03	TBR-1778605416401	f
33	13	[{"price": 49.99, "quantity": 1, "productId": 18}]	49.99	pending	chapa	pending	MERKATO, Addis Abeba, ARADA 10000, Ethiopia	2026-05-12 20:05:12+03	2026-05-12 20:05:12.096+03	ORD-000033-1778605512092	f
26	12	[{"price": 159.99, "quantity": 1, "productId": 11}]	159.99	cancelled	telebirr	pending	yeka, Addis Abeba, ny 1000, Ethiopia	2026-05-12 19:43:46.011+03	2026-05-13 18:30:46.45+03	\N	f
3	5	[{"price": 79.99, "quantity": 2, "productId": 8}, {"price": 129.99, "quantity": 1, "productId": 31}]	289.97	delivered	\N	pending	\N	2026-03-12 10:37:41.685+03	2026-05-14 17:06:16.017+03	\N	f
4	5	[{"price": 19.99, "quantity": 1, "productId": 33}]	19.99	delivered	\N	pending	\N	2026-03-12 10:40:08.758+03	2026-05-14 17:06:21.811+03	\N	f
18	6	[{"price": 159.99, "quantity": 1, "productId": 11}]	159.99	shipped	card	pending	123addis, Addis, Et 2002, United States	2026-03-13 15:34:57.156+03	2026-05-14 17:06:30.271+03	\N	f
19	9	[{"price": 159.99, "quantity": 2, "productId": 11}]	319.98	shipped	card	pending	Adama, Adama, Chitu 2002, United States	2026-03-13 16:33:19.003+03	2026-05-14 17:06:33.573+03	\N	f
28	12	[{"price": 3899.99, "quantity": 1, "productId": 6}]	3899.99	processing	telebirr	pending	yeka, Addis Abeba, ny 1000, Ethiopia	2026-05-12 19:48:05.823+03	2026-05-14 18:58:43.17+03	\N	f
34	13	[{"price": 79.99, "quantity": 1, "productId": 27}]	79.99	pending	telebirr	pending	MERKATO, Addis Abeba, ARADA 10000, Ethiopia	2026-05-12 20:06:49.654+03	2026-05-12 20:06:49.831+03	TBR-1778605609828	f
35	11	[{"price": 249.99, "quantity": 1, "productId": 10, "productName": "The North Face Jacket"}]	249.99	pending	chapa	pending	yeka, Addis Abeba, Addis Abeba 1000, Ethiopia	2026-05-12 21:04:17.421+03	2026-05-12 21:04:18.261+03	ORD-000035-1778609058215	f
36	11	[{"price": 19.99, "quantity": 1, "productId": 12, "productName": "Atomic Habits"}]	19.99	pending	cbe	pending	yeka, Addis Abeba, Addis Abeba 1000, Ethiopia	2026-05-12 21:05:01.564+03	2026-05-12 21:05:01.768+03	CBE-1778609101752	f
43	11	[{"price": 28.55, "quantity": 1, "productId": 37, "productName": "Premium Everyday Essential Hoodie"}]	28.55	delivered	chapa	pending	yeka, Addis Abeba, Addis Abeba 1000, Ethiopia	2026-05-14 17:32:41.872+03	2026-05-14 17:33:14.365+03	ORD-000043-1778769162157	f
37	12	[{"price": 3.99, "quantity": 1, "productId": 36, "productName": "The Great Gatsby"}]	3.99	delivered	telebirr	pending	yeka, Addis Abeba, ny 1000, Ethiopia	2026-05-13 18:19:27.134+03	2026-05-13 18:31:34.902+03	TBR-1778685567503	t
38	12	[{"price": 14.99, "quantity": 1, "productId": 14, "productName": "Dune"}]	14.99	delivered	cbe	pending	yeka, Addis Abeba, ny 1000, Ethiopia	2026-05-13 18:34:15.944+03	2026-05-13 18:34:59.892+03	CBE-1778686456139	f
48	12	[{"price": 19.99, "quantity": 1, "productId": 12, "productName": "Atomic Habits"}]	19.99	delivered	telebirr	pending	Bole, Addis Abeba, ny 1000, Ethiopia	2026-05-15 12:13:49.863+03	2026-05-15 12:15:25.176+03	TBR-1778836429981	f
39	12	[{"price": 199.99, "quantity": 1, "productId": 24, "productName": "Smart Watch"}]	199.99	delivered	chapa	pending	yeka, Addis Abeba, ny 1000, Ethiopia	2026-05-13 18:36:15.339+03	2026-05-13 18:41:33.372+03	ORD-000039-1778686575436	f
40	12	[{"price": 24.99, "quantity": 1, "productId": 13, "productName": "The Psychology of Money"}]	24.99	delivered	cbe	pending	yeka, Addis Abeba, ny 1000, Ethiopia	2026-05-14 00:07:16.878+03	2026-05-14 00:10:42.485+03	CBE-1778706437128	f
44	11	[{"price": 1299.99, "quantity": 1, "productId": 30, "productName": "iPad Pro 12.9\\""}]	1299.99	delivered	chapa	pending	yeka, Addis Abeba, Addis Abeba 1000, Ethiopia	2026-05-14 18:52:24.528+03	2026-05-14 18:58:36.286+03	ORD-000044-1778773944794	f
41	11	[{"price": 28.55, "quantity": 1, "productId": 37, "productName": "Premium Everyday Essential Hoodie"}]	28.55	delivered	cbe	pending	yeka, Addis Abeba, Addis Abeba 1000, Ethiopia	2026-05-14 00:14:10.929+03	2026-05-14 00:14:35.75+03	CBE-1778706851083	f
42	11	[{"price": 3899.99, "quantity": 1, "productId": 6, "productName": "Canon EOS R5"}]	3899.99	delivered	telebirr	pending	yeka, Addis Abeba, Addis Abeba 1000, Ethiopia	2026-05-14 17:02:19.51+03	2026-05-14 17:05:39.31+03	TBR-1778767340016	f
45	11	[{"price": 49.99, "quantity": 1, "productId": 26, "productName": "Power Bank"}]	49.99	delivered	cbe	pending	yeka, Addis Abeba, Addis Abeba 1000, Ethiopia	2026-05-14 19:37:22.248+03	2026-05-14 19:38:23.73+03	CBE-1778776642414	f
49	12	[{"price": 159.99, "quantity": 1, "productId": 11, "productName": "Ray-Ban Sunglasses"}]	159.99	delivered	cbe	pending	Bole, Addis Abeba, ny 1000, Ethiopia	2026-05-15 14:36:30.028+03	2026-05-15 14:37:40.307+03	CBE-1778844990093	f
46	11	[{"price": 49.99, "quantity": 1, "productId": 18, "productName": "Indoor Plant Set"}]	49.99	delivered	cbe	pending	yeka, Addis Abeba, Addis Abeba 1000, Ethiopia	2026-05-14 19:44:05.336+03	2026-05-15 12:05:22.181+03	CBE-1778777045483	t
47	11	[{"price": 19.99, "quantity": 1, "productId": 12, "productName": "Atomic Habits"}]	19.99	delivered	card	pending	yeka, Addis Abeba, Addis Abeba 1000, Ethiopia	2026-05-15 12:06:21.903+03	2026-05-15 12:09:48.398+03	\N	f
52	19	[{"price": 1299.99, "quantity": 1, "productId": 30, "productName": "iPad Pro 12.9\\""}]	1299.99	delivered	cbe	pending	123Main str, New York, NY 1000, Ethiopia	2026-05-15 17:14:53.614+03	2026-05-15 17:15:47.163+03	CBE-1778854493871	f
50	11	[{"price": 79.99, "quantity": 1, "productId": 27, "productName": "Laptop Backpack"}]	79.99	delivered	chapa	pending	yeka, Addis Abeba, Addis Abeba 1000, Ethiopia	2026-05-15 15:37:31.401+03	2026-05-15 15:40:52.535+03	ORD-000050-1778848651733	f
51	11	[{"price": 349.99, "quantity": 1, "productId": 3, "productName": "Sony WH-1000XM4"}]	349.99	delivered	chapa	pending	yeka, Addis Abeba, Addis Abeba 1000, Ethiopia	2026-05-15 15:43:02.788+03	2026-05-15 15:43:40.863+03	ORD-000051-1778848982851	f
\.


--
-- Data for Name: Products; Type: TABLE DATA; Schema: public; Owner: ecom_user
--

COPY public."Products" (id, name, description, price, stock, images, ratings, "averageRating", "createdAt", "updatedAt", category, "isActive", "deletedAt") FROM stdin;
11	Ray-Ban Sunglasses	Classic Aviator sunglasses	159.99	25	{https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500}	{}	5	2026-03-05 15:15:12.669539+03	2026-03-14 04:34:44.793+03	Clothing	t	\N
2	MacBook Pro 16"	Latest MacBook Pro with M3 chip, 16GB RAM, 512GB SSD	2499.99	15	{https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500}	{}	0	2026-03-05 15:15:12.669539+03	2026-03-05 15:15:12.669539+03	Electronics	t	\N
3	Sony WH-1000XM4	Industry-leading noise canceling wireless headphones	349.99	25	{https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500}	{5}	5	2026-03-05 15:15:12.669539+03	2026-05-12 20:01:45.333+03	Electronics	t	\N
4	iPad Pro 12.9"	M2 chip, Liquid Retina XDR display, 256GB	1299.99	10	{https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500}	{}	0	2026-03-05 15:15:12.669539+03	2026-03-05 15:15:12.669539+03	Electronics	t	\N
5	Samsung 4K TV	65" QLED Smart TV with HDR	899.99	8	{https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500}	{}	0	2026-03-05 15:15:12.669539+03	2026-03-05 15:15:12.669539+03	Electronics	t	\N
7	Nike Air Max 270	Men's lifestyle shoes with maximum comfort	129.99	30	{https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500}	{}	0	2026-03-05 15:15:12.669539+03	2026-03-05 15:15:12.669539+03	Clothing	t	\N
8	Levi's 501 Jeans	Classic straight fit jeans	79.99	40	{https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500}	{}	0	2026-03-05 15:15:12.669539+03	2026-03-05 15:15:12.669539+03	Clothing	t	\N
18	Indoor Plant Set	3 low-maintenance house plants with pots	49.99	20	{https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500}	{}	5	2026-03-05 15:15:12.669539+03	2026-03-15 16:36:26.547+03	Home & Garden	t	\N
17	Air Purifier	HEPA filter for clean air	399.98	8	{https://images.unsplash.com/photo-1585775249063-6e52790bf65a?w=500}	{}	0	2026-03-05 15:15:12.669539+03	2026-05-14 17:29:36.137+03	Home & Garden	t	\N
12	Atomic Habits	An Easy & Proven Way to Build Good Habits & Break Bad Ones	19.99	50	{https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500}	{}	0	2026-03-05 15:15:12.669539+03	2026-03-05 15:15:12.669539+03	Books	t	\N
13	The Psychology of Money	Timeless lessons on wealth, greed, and happiness	24.99	35	{https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=500}	{}	0	2026-03-05 15:15:12.669539+03	2026-03-05 15:15:12.669539+03	Books	t	\N
14	Dune	Frank Herbert's sci-fi masterpiece	14.99	40	{https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500}	{}	0	2026-03-05 15:15:12.669539+03	2026-03-05 15:15:12.669539+03	Books	t	\N
16	Smart Coffee Maker	Programmable coffee maker with smartphone control	199.99	12	{https://images.unsplash.com/photo-1570598912132-0ba1dc952b6b?w=500}	{}	0	2026-03-05 15:15:12.669539+03	2026-03-05 15:15:12.669539+03	Home & Garden	t	\N
15	The Hobbit	J.R.R. Tolkien's classic adventure	21.99	30	{https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=500}	{}	4	2026-03-05 15:15:12.669539+03	2026-05-15 12:04:26.486+03	Books	t	\N
19	Robot Vacuum	Smart mapping and self-charging	399.99	7	{https://images.unsplash.com/photo-1608315398428-b6d7685766e3?w=500}	{}	0	2026-03-05 15:15:12.669539+03	2026-03-05 15:15:12.669539+03	Home & Garden	t	\N
20	Yoga Mat	Non-slip exercise mat with carrying strap	29.99	100	{https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=500}	{}	0	2026-03-05 15:15:12.669539+03	2026-03-05 15:15:12.669539+03	Sports	t	\N
21	Dumbbell Set	Adjustable dumbbells 5-25kg pair	199.99	15	{https://images.unsplash.com/photo-1586401100295-7a8096fd002a?w=500}	{}	0	2026-03-05 15:15:12.669539+03	2026-03-05 15:15:12.669539+03	Sports	t	\N
22	Exercise Bike	Stationary bike with digital display	499.99	6	{https://images.unsplash.com/photo-1571732154690-f6d1c3e4658a?w=500}	{}	0	2026-03-05 15:15:12.669539+03	2026-03-05 15:15:12.669539+03	Sports	t	\N
23	Tennis Racket	Professional tennis racket	159.99	12	{https://images.unsplash.com/photo-1617083277718-9f4bfb4f0da3?w=500}	{}	0	2026-03-05 15:15:12.669539+03	2026-03-05 15:15:12.669539+03	Sports	t	\N
24	Smart Watch	Fitness tracker with heart rate monitor	199.99	25	{https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500}	{}	0	2026-03-05 15:15:12.669539+03	2026-03-05 15:15:12.669539+03	Accessories	t	\N
25	Wireless Earbuds	True wireless earbuds with charging case	89.99	40	{https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500}	{}	0	2026-03-05 15:15:12.669539+03	2026-03-05 15:15:12.669539+03	Accessories	t	\N
26	Power Bank	20000mAh fast charging portable charger	49.99	60	{https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500}	{}	0	2026-03-05 15:15:12.669539+03	2026-03-05 15:15:12.669539+03	Accessories	t	\N
27	Laptop Backpack	Water-resistant with USB charging port	79.99	35	{https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500}	{}	0	2026-03-05 15:15:12.669539+03	2026-03-05 15:15:12.669539+03	Accessories	t	\N
1	Test item	desc	9.99	10	{https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500}	{}	5	2026-03-02 15:07:54.172+03	2026-03-02 15:23:14.001+03	Electronics	t	\N
9	Adidas Ultraboost	Running shoes with Boost technology	179.99	20	{https://images.unsplash.com/photo-1556906781-9a412961c28c?w=500}	{}	2	2026-03-05 15:15:12.669539+03	2026-03-14 04:11:30.26+03	Clothing	t	\N
10	The North Face Jacket	Waterproof winter jacket	249.99	15	{https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500}	{}	5	2026-03-05 15:15:12.669539+03	2026-03-14 04:25:55.342+03	Clothing	t	\N
6	Canon EOS R5	Mirrorless Camera with 8K Video	3899.99	5	{https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500}	{}	0	2026-03-05 15:15:12.669539+03	2026-03-05 15:15:12.669539+03	Electronics	t	\N
32	Levi's 501 Jeans	Classic straight fit jeans	79.99	40	{https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500}	{}	0	2026-03-05 15:57:50.215547+03	2026-03-05 15:57:50.215547+03	Clothing	t	\N
30	iPad Pro 12.9"	M2 chip, Liquid Retina XDR display, 256GB	1299.99	10	{https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500}	{5,5,1,5}	4	2026-03-05 15:57:50.215547+03	2026-05-11 10:37:53.139+03	Electronics	t	\N
36	The Great Gatsby	Experience the glamour and heartache of the Roaring Twenties in this classic tale of Jay Gatsby’s obsessive pursuit of the American Dream. This hauntingly beautiful novel remains a must-read masterpiece of love, wealth, and social disillusionment.	3.99	35	{https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/The_Great_Gatsby_Cover_1925_Retouched.jpg/500px-The_Great_Gatsby_Cover_1925_Retouched.jpg}	{}	5	2026-05-11 09:09:52.325+03	2026-05-11 10:44:03.881+03	Books	t	\N
33	Atomic Habits	An Easy & Proven Way to Build Good Habits & Break Bad Ones	19.99	50	{https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500}	{}	0	2026-03-05 15:57:50.215547+03	2026-03-13 12:08:17.234+03	Books	f	2026-03-13 12:08:17.233+03
35	dd	dddddd	12	123	{}	{}	0	2026-03-13 12:08:49.716+03	2026-03-13 12:08:59.464+03	Clothing	f	2026-03-13 12:08:59.463+03
37	Premium Everyday Essential Hoodie	Elevate your wardrobe with this ultra-soft, premium fabric [item] designed for a modern, flattering fit and all-day comfort. Durable and versatile, it maintains its shape and vibrant color wash after wash, making it a perfect foundation for any outfit.	28.55	1000	{https://cdn-images.farfetch-contents.com/33/75/98/13/33759813_64599052_2048.jpg,https://cdn-images.farfetch-contents.com/33/75/63/45/33756345_64603186_1000.jpg,https://cdn-images.farfetch-contents.com/33/76/20/90/33762090_64594829_1000.jpg}	{}	5	2026-05-11 09:18:25.083+03	2026-05-11 11:15:33.627+03	Clothing	t	\N
31	Nike Air Max 270	Men's lifestyle shoes with maximum comfort	119.99	30	{https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500}	{}	5	2026-03-05 15:57:50.215547+03	2026-05-12 19:37:57.344+03	Clothing	t	\N
28	MacBook Pro 16"	Latest MacBook Pro with M3 chip, 16GB RAM, 512GB SSD	2495.98	15	{https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500}	{}	0	2026-03-05 15:57:50.215547+03	2026-05-14 17:31:46.353+03	Electronics	t	\N
\.


--
-- Data for Name: Reviews; Type: TABLE DATA; Schema: public; Owner: ecom_user
--

COPY public."Reviews" (id, "userId", "productId", rating, comment, "createdAt", "updatedAt", title, images, "helpfulCount", "helpfulUsers", status, verified, replies) FROM stdin;
2	2	1	5	great	2026-03-02 15:24:40.324+03	2026-03-02 15:24:40.324+03	\N	{}	0	{}	approved	f	[]
1	2	1	4	updated	2026-03-02 15:23:13.167+03	2026-03-02 15:32:07.706+03	\N	{}	0	{}	approved	f	[]
4	6	9	5	Oh this shoose is realy cool	2026-03-14 03:56:32.801+03	2026-03-14 04:05:58.936+03	Review for Addidas ultraboost	{}	2	{7,9}	approved	f	[]
5	9	9	2	bad product	2026-03-14 04:11:30.179+03	2026-03-14 04:11:30.179+03	\N	{}	0	{}	approved	f	[]
6	9	10	5	I really love this jacket!	2026-03-14 04:25:55.222+03	2026-03-14 04:26:59.589+03	Winter jacket	{}	1	{9}	approved	f	[]
10	5	30	5	Geta yibarkachu	2026-03-15 05:18:43.258+03	2026-05-05 09:30:30.641+03	\N	{}	0	{}	approved	f	[{"id": 1777962630640, "date": "2026-05-05T06:30:30.640Z", "text": "Amen🙏🙏", "edited": false, "userId": 10, "userName": "Abiy Ahmed"}]
8	5	11	5	whoo its really cool	2026-03-14 04:49:24.737+03	2026-05-12 19:43:25.357+03	\N	{}	2	{6,12}	approved	f	[]
12	10	30	1	Guys this is really bad product do not use it😠😠	2026-05-05 09:32:34.718+03	2026-05-11 10:36:15.522+03	\N	{}	0	{}	approved	f	[{"id": 1778484975522, "date": "2026-05-11T07:36:15.522Z", "text": "I appreciate your idea but i think you buy fake one 😂", "edited": false, "userId": 3, "userName": "kaleb"}]
13	11	30	5	Guys ipad 12.9 is the best for me❤️❤️  i buy for me and my wife.	2026-05-11 10:33:17.032+03	2026-05-11 10:38:06.718+03		{}	1	{3}	approved	f	[{"id": 1778484896788, "date": "2026-05-11T07:34:56.788Z", "text": "Thank you 🙏🙏", "edited": false, "userId": 3, "userName": "kaleb"}]
3	9	30	5	Guys this product is really cool i a recommend specially for those who want to chip but nice product\n	2026-03-13 16:47:49.055+03	2026-05-11 10:38:54.915+03		{}	6	{7,6,9,5,10,11}	approved	f	[{"id": 1773540007910, "date": "2026-03-15T02:00:07.910Z", "text": "WOW", "userId": 7, "userName": "Nahom Wondimu"}, {"id": 1773540948413, "date": "2026-03-15T02:15:48.413Z", "text": "Thankyou Mr", "edited": true, "userId": 5, "editedAt": "2026-03-15T02:36:47.581Z", "userName": "Wondimu Anjulo Telila"}]
7	9	11	5	NIce	2026-03-14 04:34:44.681+03	2026-05-12 19:43:31.563+03	\N	{}	3	{7,5,12}	approved	f	[]
14	11	36	5	This is a captivating masterpiece that perfectly captures the glamour and tragedy of the Jazz Age, and I highly recommend everyone read it at least once!	2026-05-11 10:44:03.677+03	2026-05-11 10:45:28.123+03	An Unforgettable Masterpiece	{}	1	{3}	approved	f	[{"id": 1778485528122, "date": "2026-05-11T07:45:28.122Z", "text": "Thanks caleb🙏🙏", "edited": false, "userId": 3, "userName": "kaleb"}]
16	13	3	5	guys  በጣም ያበደ ነው። እኔ ተመችችቶኛል ።ሙዚቃ ማዳመጥ ለምትወዱ በጣም ጸዴ ነው።	2026-05-12 15:55:30.695+03	2026-05-12 20:01:45.294+03		{}	1	{13}	approved	f	[{"id": 1778590924939, "date": "2026-05-12T13:02:04.939Z", "text": "አረ ጀለስ  አትሰክስ አይነፋም።በዝ እራሱ በስትክክል አይሰማም።", "edited": false, "userId": 12, "userName": "Test User 2"}]
18	11	15	4	This book is really nice book i suggest you all to read specially for adults.	2026-05-15 12:04:26.354+03	2026-05-15 12:04:26.354+03	The two Tower book	{}	0	{}	approved	f	[]
15	12	37	5	Top Quality & Super Comfy	2026-05-11 11:15:33.388+03	2026-05-12 08:26:46.22+03	\N	{}	2	{11,12}	approved	f	[{"id": 1778487467388, "date": "2026-05-11T08:17:47.388Z", "text": "absolutly  🤝", "edited": false, "userId": 11, "userName": "caleb"}, {"id": 1778487642089, "date": "2026-05-11T08:20:42.089Z", "text": "እውነት ነው እኔ ምስክር ነኝ👍", "edited": false, "userId": 13, "userName": "Test User 3"}]
17	11	31	5	ጸዴ ጫማ ነው አቦ ተመችቶኛል ።ግን ገንዘብ የለኝም😔 ቤተሰብ ግዙልኝ 🫶 📞 0987654321	2026-05-12 19:37:57.129+03	2026-05-12 19:40:27.079+03	\N	{}	1	{12}	approved	f	[{"id": 1778603976217, "date": "2026-05-12T16:39:36.217Z", "text": "ወንድሜ እኔ እገዛልሃለው ምንም አታስብ አካውንትህን አሁን ላክልኝ።", "edited": true, "userId": 12, "editedAt": "2026-05-12T16:40:27.079Z", "userName": "Test User 2"}]
\.


--
-- Data for Name: StoreSettings; Type: TABLE DATA; Schema: public; Owner: ecom_user
--

COPY public."StoreSettings" (id, "storeName", "storeEmail", "storePhone", "storeAddress", currency, timezone, language, "paymentMethods", "shippingMethods", "emailSettings", "securitySettings", "createdAt", "updatedAt") FROM stdin;
1	K-Store	contact@kstore.com	+1 (555) 123-4567	123 Commerce St, New York, NY 10001	USD	America/New_York	en	[{"id":"stripe","name":"Stripe","enabled":true,"testMode":true},{"id":"paypal","name":"PayPal","enabled":true,"testMode":true},{"id":"cod","name":"Cash on Delivery","enabled":false,"testMode":false}]	[{"id":"standard","name":"Standard Shipping","price":5.99,"days":"5-7","enabled":true},{"id":"express","name":"Express Shipping","price":14.99,"days":"2-3","enabled":true},{"id":"overnight","name":"Overnight Shipping","price":24.99,"days":"1","enabled":false}]	{"orderConfirmation":true,"shippingConfirmation":true,"passwordReset":true,"welcomeEmail":true,"newsletterEnabled":true,"adminNotifications":true,"lowStockAlerts":true,"emailSignature":"The K-Store Team","welcomeMessageTitle":"Welcome to {storeName}, {userName}! 🎉","welcomeMessageBody":"Thank you for joining {storeName}! We're excited to have you on board.","passwordResetMessageTitle":"🔐 Password Reset Request","passwordResetMessageBody":"We received a request to reset your password for {storeName}. If you didn't request this, please ignore this email.","orderDeliveredMessageTitle":"Your Order #{orderId} Has Been Delivered","orderDeliveredMessageBody":"Good news! Your order has been marked as delivered. Thank you for shopping with us."}	{"twoFactorAuth":false,"sessionTimeout":30,"maxLoginAttempts":5,"passwordMinLength":8,"requireEmailVerification":true,"ipWhitelist":[]}	2026-05-13 19:47:30.542+03	2026-05-16 08:39:48.307+03
\.


--
-- Data for Name: Users; Type: TABLE DATA; Schema: public; Owner: ecom_user
--

COPY public."Users" (id, name, email, password, role, address, "isVerified", "resetPasswordToken", "resetPasswordExpires", "createdAt", "updatedAt", phone, otp, "otpExpires", city, state, "zipCode", country) FROM stdin;
19	Caleb Proton	calebwondim@proton.me	$2a$10$qLwmypYhSIKTPEJ/GG8k.OrrVmwAu9jw881DRL/8g8xRT0FsdU5cS	user	123Main str	t	\N	\N	2026-05-15 17:02:18.936+03	2026-05-15 17:14:48.252+03	0987654321	\N	\N	New York	NY	1000	Ethiopia
4	Alemu Wondimu	alemu@gmail.com	$2a$10$SmHHaXMOQFHpK9jieYXBhekDBVaMIPNRrwmtiGPPWlbiz55GAyClu	user	\N	t	\N	\N	2026-03-03 03:39:09.578+03	2026-03-03 03:49:17.481+03	\N	\N	\N	\N	\N	\N	\N
6	urim wondimu	urim@gmail.com	$2a$10$AksiQ3vZCj7Z0b8vh/Mi0OVTmWxzn4KErxOqUvcYG.LvKbCydeEFC	user	\N	f	\N	\N	2026-03-04 02:57:22.33+03	2026-03-04 02:57:22.33+03	\N	\N	\N	\N	\N	\N	\N
5	Wondimu Anjulo Telila	wondimu@gmail.com	$2a$10$CWLeOHybljWH2f58E6uZvuI4KBgKT5kdDTuoOVT1KOeLFjqzrwRsi	user	\N	f	\N	\N	2026-03-04 02:29:42.392+03	2026-03-04 11:35:14.147+03	\N	\N	\N	\N	\N	\N	\N
14	Swagger Test User	swagger-test@example.com	$2a$10$IhqLbYj82Rn1QemK4VgiyeoxabP36S7nCqPq3O4ZR0t2ZGo45E.5m	user	\N	t	\N	\N	2026-05-11 11:05:20.874+03	2026-05-11 11:06:07.547+03	\N	\N	\N	\N	\N	\N	\N
7	Nahom Wondimu	Nahom@gmail.com	$2a$10$EZB7ZQv9TDqCMEhcGDiKieiZOFon/92Z6KhEsIKb5evVle6IKm9sW	user	\N	f	\N	\N	2026-03-05 11:13:02.424+03	2026-03-05 11:13:02.424+03	\N	\N	\N	\N	\N	\N	\N
15	Resend Test User	resend-test@example.com	$2a$10$K2CTavV0GGDecqGOLsh/v.VTJSFdvkuZqfKFOIbgV55qSQgakQxZq	user	\N	f	\N	\N	2026-05-11 11:06:45.699+03	2026-05-11 11:06:56.179+03	\N	475869	2026-05-11 11:16:56.179+03	\N	\N	\N	\N
8	Anjulo telila	anjo@gmail.com	$2a$10$SmO.7.nZwCYpY2SSN6tG7u1OQDrzMYxcSEfiNKVGJNSFW3.QUGszG	user	\N	f	\N	\N	2026-03-13 12:25:36.667+03	2026-03-13 12:25:36.667+03	\N	\N	\N	\N	\N	\N	\N
1	Test User	test@example.com	$2a$10$LtZN8rrZCLJih4vrN1z5Q.qx4.osZdQ8LBfDA.WIp3njZrug9Qf82	user	\N	f	\N	\N	2026-02-28 16:30:51.125+03	2026-02-28 16:30:51.125+03	555-0101	\N	\N	\N	\N	\N	\N
2	Alice	alice@example.com	$2a$10$kCd2VXyAz9poYlk/BfNMTuHvGVjZuf6yneHXqjLa/n3U6/AoUAxam	user	\N	f	\N	\N	2026-02-28 16:42:38.736+03	2026-03-02 15:23:14.675+03	555-0102	\N	\N	\N	\N	\N	\N
9	Maru benti	maru@gmail.com	$2a$10$t68S4t7d8WtG72cWg6p4euT1KB82lJu4WWS.rPCyuoVYOOW3mld5a	user	\N	f	\N	\N	2026-03-13 15:21:42.795+03	2026-03-13 15:21:42.795+03	0962323771	\N	\N	\N	\N	\N	\N
13	Test User 3	test3@example.com	$2a$10$ERcbLoHecGDR8dl2tl.VYOjFu/utNNfOEVjXrvPToeOX0Q7e6OiGK	user	MERKATO	t	\N	\N	2026-05-11 10:56:59.157+03	2026-05-12 15:56:44.451+03	0987654321	\N	\N	Addis Abeba	ARADA	10000	Ethiopia
3	kaleb	kalebwondimu95@gmail.com	$2a$10$pK6jPNzNaQFgYq962jy6MewHXitblUrtCdexq9BjdLS2WaZo619QS	super-admin	\N	t	\N	\N	2026-03-02 14:25:19.266+03	2026-05-13 19:56:45.567+03	\N	\N	\N	\N	\N	\N	\N
10	Abiy Ahmed	abiy@gmail.com	$2a$10$GdMcEa75jwgQKr5SswZPm.0MvB8YMbEsGwVsuDTkl9kSQFow/nkLm	user	\N	f	\N	\N	2026-05-05 09:28:34.152+03	2026-05-05 09:28:34.152+03	0940181631	\N	\N	\N	\N	\N	\N
12	Test User 2	test2@example.com	$2a$10$5fDT0FNl9TNrTS4ZgSC/7OOaevIsb9UCMAItpE.ysZf0SJPPvf/WS	user	Bole	t	\N	\N	2026-05-11 10:55:32.464+03	2026-05-15 12:13:30.563+03	0987654321	\N	\N	Addis Abeba	ny	1000	Ethiopia
11	caleb	calebwondim@gmail.com	$2a$10$sSp4k9Vy2Y1ZVTooLESthuYPflEwR4OCc0vZqn8iIxmoxQZfvvNpq	user	yeka	f	\N	\N	2026-05-11 10:17:20.391+03	2026-05-15 15:37:00.889+03	0912345678	325468	2026-05-11 10:30:36.841+03	Addis Abeba	Addis Abeba	1000	Ethiopia
16	Test Admin	testadmin@gmail.com	$2a$10$2aSrc5gOFYmffgB.bfieVO9zDgA/K9DZBmDR5LcdqTzQSA0EOZKSK	admin	\N	t	\N	\N	2026-05-14 12:46:20.131+03	2026-05-15 15:38:52.173+03	+251940181631	\N	\N	\N	\N	\N	\N
17	Melat Altaye	melu24@gmail.com	$2a$10$.fYrLLHvehkkMB3Y2ErYxuNtosI/3TVOe7RYAMv2C/jD954.o6nWu	user	\N	f	\N	\N	2026-05-15 15:50:25.443+03	2026-05-15 15:50:25.443+03	0987654321	189728	2026-05-15 16:00:25.442+03	\N	\N	\N	\N
18	KalDeveloper	wendimkaleb@proton.me	$2a$10$pakTOzf8SQpSlF1DgZueXuU11alV9lXEabkn0SHm0W/SLs/PjZcyO	user	\N	t	\N	\N	2026-05-15 15:57:09.834+03	2026-05-15 15:57:43.083+03	0987654321	\N	\N	\N	\N	\N	\N
\.


--
-- Name: Carts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ecom_user
--

SELECT pg_catalog.setval('public."Carts_id_seq"', 20, true);


--
-- Name: Categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ecom_user
--

SELECT pg_catalog.setval('public."Categories_id_seq"', 1, false);


--
-- Name: Orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ecom_user
--

SELECT pg_catalog.setval('public."Orders_id_seq"', 52, true);


--
-- Name: Products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ecom_user
--

SELECT pg_catalog.setval('public."Products_id_seq"', 37, true);


--
-- Name: Reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ecom_user
--

SELECT pg_catalog.setval('public."Reviews_id_seq"', 18, true);


--
-- Name: StoreSettings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ecom_user
--

SELECT pg_catalog.setval('public."StoreSettings_id_seq"', 1, true);


--
-- Name: Users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ecom_user
--

SELECT pg_catalog.setval('public."Users_id_seq"', 19, true);


--
-- Name: Carts Carts_pkey; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Carts"
    ADD CONSTRAINT "Carts_pkey" PRIMARY KEY (id);


--
-- Name: Carts Carts_userId_key; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Carts"
    ADD CONSTRAINT "Carts_userId_key" UNIQUE ("userId");


--
-- Name: Categories Categories_name_key; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Categories"
    ADD CONSTRAINT "Categories_name_key" UNIQUE (name);


--
-- Name: Categories Categories_pkey; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Categories"
    ADD CONSTRAINT "Categories_pkey" PRIMARY KEY (id);


--
-- Name: Orders Orders_pkey; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Orders"
    ADD CONSTRAINT "Orders_pkey" PRIMARY KEY (id);


--
-- Name: Products Products_pkey; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Products"
    ADD CONSTRAINT "Products_pkey" PRIMARY KEY (id);


--
-- Name: Reviews Reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Reviews"
    ADD CONSTRAINT "Reviews_pkey" PRIMARY KEY (id);


--
-- Name: StoreSettings StoreSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."StoreSettings"
    ADD CONSTRAINT "StoreSettings_pkey" PRIMARY KEY (id);


--
-- Name: Users Users_email_key; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key" UNIQUE (email);


--
-- Name: Users Users_email_key1; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key1" UNIQUE (email);


--
-- Name: Users Users_email_key10; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key10" UNIQUE (email);


--
-- Name: Users Users_email_key11; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key11" UNIQUE (email);


--
-- Name: Users Users_email_key12; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key12" UNIQUE (email);


--
-- Name: Users Users_email_key13; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key13" UNIQUE (email);


--
-- Name: Users Users_email_key14; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key14" UNIQUE (email);


--
-- Name: Users Users_email_key15; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key15" UNIQUE (email);


--
-- Name: Users Users_email_key16; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key16" UNIQUE (email);


--
-- Name: Users Users_email_key17; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key17" UNIQUE (email);


--
-- Name: Users Users_email_key18; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key18" UNIQUE (email);


--
-- Name: Users Users_email_key19; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key19" UNIQUE (email);


--
-- Name: Users Users_email_key2; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key2" UNIQUE (email);


--
-- Name: Users Users_email_key20; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key20" UNIQUE (email);


--
-- Name: Users Users_email_key21; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key21" UNIQUE (email);


--
-- Name: Users Users_email_key22; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key22" UNIQUE (email);


--
-- Name: Users Users_email_key23; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key23" UNIQUE (email);


--
-- Name: Users Users_email_key24; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key24" UNIQUE (email);


--
-- Name: Users Users_email_key25; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key25" UNIQUE (email);


--
-- Name: Users Users_email_key26; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key26" UNIQUE (email);


--
-- Name: Users Users_email_key27; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key27" UNIQUE (email);


--
-- Name: Users Users_email_key28; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key28" UNIQUE (email);


--
-- Name: Users Users_email_key29; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key29" UNIQUE (email);


--
-- Name: Users Users_email_key3; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key3" UNIQUE (email);


--
-- Name: Users Users_email_key30; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key30" UNIQUE (email);


--
-- Name: Users Users_email_key31; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key31" UNIQUE (email);


--
-- Name: Users Users_email_key32; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key32" UNIQUE (email);


--
-- Name: Users Users_email_key33; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key33" UNIQUE (email);


--
-- Name: Users Users_email_key34; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key34" UNIQUE (email);


--
-- Name: Users Users_email_key35; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key35" UNIQUE (email);


--
-- Name: Users Users_email_key36; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key36" UNIQUE (email);


--
-- Name: Users Users_email_key37; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key37" UNIQUE (email);


--
-- Name: Users Users_email_key38; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key38" UNIQUE (email);


--
-- Name: Users Users_email_key39; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key39" UNIQUE (email);


--
-- Name: Users Users_email_key4; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key4" UNIQUE (email);


--
-- Name: Users Users_email_key40; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key40" UNIQUE (email);


--
-- Name: Users Users_email_key41; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key41" UNIQUE (email);


--
-- Name: Users Users_email_key42; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key42" UNIQUE (email);


--
-- Name: Users Users_email_key43; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key43" UNIQUE (email);


--
-- Name: Users Users_email_key44; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key44" UNIQUE (email);


--
-- Name: Users Users_email_key45; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key45" UNIQUE (email);


--
-- Name: Users Users_email_key46; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key46" UNIQUE (email);


--
-- Name: Users Users_email_key47; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key47" UNIQUE (email);


--
-- Name: Users Users_email_key48; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key48" UNIQUE (email);


--
-- Name: Users Users_email_key49; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key49" UNIQUE (email);


--
-- Name: Users Users_email_key5; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key5" UNIQUE (email);


--
-- Name: Users Users_email_key50; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key50" UNIQUE (email);


--
-- Name: Users Users_email_key51; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key51" UNIQUE (email);


--
-- Name: Users Users_email_key52; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key52" UNIQUE (email);


--
-- Name: Users Users_email_key53; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key53" UNIQUE (email);


--
-- Name: Users Users_email_key54; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key54" UNIQUE (email);


--
-- Name: Users Users_email_key55; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key55" UNIQUE (email);


--
-- Name: Users Users_email_key56; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key56" UNIQUE (email);


--
-- Name: Users Users_email_key57; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key57" UNIQUE (email);


--
-- Name: Users Users_email_key58; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key58" UNIQUE (email);


--
-- Name: Users Users_email_key6; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key6" UNIQUE (email);


--
-- Name: Users Users_email_key7; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key7" UNIQUE (email);


--
-- Name: Users Users_email_key8; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key8" UNIQUE (email);


--
-- Name: Users Users_email_key9; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key9" UNIQUE (email);


--
-- Name: Users Users_pkey; Type: CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_pkey" PRIMARY KEY (id);


--
-- Name: Carts Carts_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Carts"
    ADD CONSTRAINT "Carts_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Orders Orders_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Orders"
    ADD CONSTRAINT "Orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Reviews Reviews_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Reviews"
    ADD CONSTRAINT "Reviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Products"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Reviews Reviews_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecom_user
--

ALTER TABLE ONLY public."Reviews"
    ADD CONSTRAINT "Reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict BvCCGF0SY3QfuylNN2tv3QLe1UbQDjNfvxx9PhybLi6emphoINCMkVkdL082crN

