import { useState, useMemo, useCallback, useRef, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIG & CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════
const SCOPES = "https://www.googleapis.com/auth/drive";
const DISCOVERY_DOC = "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest";
const MIME_ACCEPT = ["application/pdf","image/jpeg","image/png","image/webp","image/gif"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const EXPENSE_CATEGORIES = [
  "Cost of Product - Food","Cost of Product - Drink","Payroll","Social Security",
  "Services - Accommodation","Services - Accounting","Services - Addicional Expenses",
  "Services - Communication","Services - Consulting","Services - Content Criation",
  "Services - Decor","Services - Design","Services - Digital Marketing EDM",
  "Services - Electricity, Gas and Water","Services - Expenses",
  "Services - Financial Fees","Services - Legal and administrative",
  "Services - Other","Services - Photograph","Services - Printing",
  "Services - Production","Services - Rent","Services - Restaurants",
  "Services - Security","Services - Software","Services - Sound and Light",
  "Services - Staff","Services - Transports","Services - Travel","services - Bank fees",
];
const PAYMENT_METHODS = ["Banco","Cash","Partner"];
const MISSING_STATUSES = ["No invoice","Requested","Registered","Steph","bolt"];

// ═══════════════════════════════════════════════════════════════════════════════
// SAMPLE DATA
// ═══════════════════════════════════════════════════════════════════════════════
const INVOICES_SEED = [
  { id:"I001",supplier:"Nos Empresas",invoiceNo:"FT 202593/391412",date:"2025-02-25",period:"202502",net:31.53,iva:7.25,total:38.78,nature:"Services - Communication",payment:"Banco",paid:true },
  { id:"I002",supplier:"Nos Empresas",invoiceNo:"FT 202593/914062",date:"2025-04-24",period:"202504",net:31.53,iva:7.25,total:38.78,nature:"Services - Communication",payment:"Banco",paid:true },
  { id:"I003",supplier:"Nos Empresas",invoiceNo:"FT 202593/1174886",date:"2025-05-26",period:"202505",net:31.53,iva:7.25,total:38.78,nature:"Services - Communication",payment:"Banco",paid:true },
  { id:"I004",supplier:"Nos Empresas",invoiceNo:"FT 202593/1437923",date:"2025-06-24",period:"202506",net:31.53,iva:7.25,total:38.78,nature:"Services - Communication",payment:"Banco",paid:true },
  { id:"I005",supplier:"Nos Empresas",invoiceNo:"FT 202593/1700208",date:"2025-07-24",period:"202507",net:31.53,iva:7.25,total:38.78,nature:"Services - Communication",payment:"Banco",paid:true },
  { id:"I006",supplier:"Nos Empresas",invoiceNo:"FT 202593/1964671",date:"2025-08-25",period:"202508",net:31.53,iva:7.25,total:38.78,nature:"Services - Communication",payment:"Banco",paid:true },
  { id:"I007",supplier:"Nos Empresas",invoiceNo:"FT 202593/2225773",date:"2025-09-24",period:"202509",net:31.53,iva:7.25,total:38.78,nature:"Services - Communication",payment:"Banco",paid:true },
  { id:"I008",supplier:"Nos Empresas",invoiceNo:"FT 202593/2489127",date:"2025-10-24",period:"202510",net:31.53,iva:7.25,total:38.78,nature:"Services - Communication",payment:"Banco",paid:true },
  { id:"I009",supplier:"Nos Empresas",invoiceNo:"FT 202593/2750581",date:"2025-11-24",period:"202511",net:31.53,iva:7.25,total:38.78,nature:"Services - Communication",payment:"Banco",paid:true },
  { id:"I010",supplier:"Bica do Sapato",invoiceNo:"FT BS2025/1042",date:"2025-03-15",period:"202503",net:850,iva:195.5,total:1045.5,nature:"Services - Restaurants",payment:"Banco",paid:true },
  { id:"I011",supplier:"Bica do Sapato",invoiceNo:"FT BS2025/2108",date:"2025-06-20",period:"202506",net:1200,iva:276,total:1476,nature:"Services - Restaurants",payment:"Banco",paid:true },
  { id:"I012",supplier:"Time Out Market",invoiceNo:"FT TOM/5522",date:"2025-07-10",period:"202507",net:450,iva:103.5,total:553.5,nature:"Services - Restaurants",payment:"Banco",paid:true },
  { id:"I013",supplier:"UBER",invoiceNo:"INV-PT-2025-0442",date:"2025-01-15",period:"202501",net:22.5,iva:5.18,total:27.68,nature:"Services - Transports",payment:"Banco",paid:true },
  { id:"I014",supplier:"UBER",invoiceNo:"INV-PT-2025-1128",date:"2025-03-22",period:"202503",net:35.8,iva:8.23,total:44.03,nature:"Services - Transports",payment:"Banco",paid:true },
  { id:"I015",supplier:"Bolt",invoiceNo:"BOLT-PT-2025-0891",date:"2025-04-05",period:"202504",net:18.9,iva:4.35,total:23.25,nature:"Services - Transports",payment:"Banco",paid:true },
  { id:"I016",supplier:"Google Ireland",invoiceNo:"GGL-2025-EU-88412",date:"2025-02-01",period:"202502",net:250,iva:57.5,total:307.5,nature:"Services - Software",payment:"Banco",paid:true },
  { id:"I017",supplier:"Adobe Systems",invoiceNo:"ADB-INV-2025-PT-4421",date:"2025-03-01",period:"202503",net:59.99,iva:13.8,total:73.79,nature:"Services - Software",payment:"Banco",paid:true },
  { id:"I018",supplier:"Mailchimp",invoiceNo:"MC-2025-9918827",date:"2025-04-15",period:"202504",net:45,iva:10.35,total:55.35,nature:"Services - Digital Marketing EDM",payment:"Banco",paid:true },
  { id:"I019",supplier:"Squarespace",invoiceNo:"SQ-2025-INV-7732",date:"2025-01-10",period:"202501",net:180,iva:41.4,total:221.4,nature:"Services - Software",payment:"Banco",paid:true },
  { id:"I020",supplier:"EDP Comercial",invoiceNo:"FT 2025/PT/882194",date:"2025-03-28",period:"202503",net:85.2,iva:19.6,total:104.8,nature:"Services - Electricity, Gas and Water",payment:"Banco",paid:true },
  { id:"I021",supplier:"EDP Comercial",invoiceNo:"FT 2025/PT/991027",date:"2025-06-28",period:"202506",net:78.4,iva:18.03,total:96.43,nature:"Services - Electricity, Gas and Water",payment:"Banco",paid:true },
  { id:"I022",supplier:"EPAL",invoiceNo:"EPAL-2025-441289",date:"2025-04-20",period:"202504",net:32.1,iva:1.93,total:34.03,nature:"Services - Electricity, Gas and Water",payment:"Banco",paid:true },
  { id:"I023",supplier:"Tipografia Santos",invoiceNo:"FT TS/2025/00382",date:"2025-02-18",period:"202502",net:645.52,iva:148.47,total:793.99,nature:"Services - Printing",payment:"Banco",paid:true },
  { id:"I024",supplier:"Tipografia Santos",invoiceNo:"FT TS/2025/00511",date:"2025-03-10",period:"202503",net:1483.1,iva:341.11,total:1824.21,nature:"Services - Printing",payment:"Banco",paid:true },
  { id:"I025",supplier:"Gráfica Nacional",invoiceNo:"GN-FT-2025/1127",date:"2025-05-14",period:"202505",net:310.64,iva:71.45,total:382.09,nature:"Services - Printing",payment:"Banco",paid:true },
  { id:"I026",supplier:"Contabilidade Lda",invoiceNo:"FT CL/2025/001",date:"2025-01-31",period:"202501",net:350,iva:80.5,total:430.5,nature:"Services - Accounting",payment:"Banco",paid:true },
  { id:"I027",supplier:"Contabilidade Lda",invoiceNo:"FT CL/2025/002",date:"2025-02-28",period:"202502",net:350,iva:80.5,total:430.5,nature:"Services - Accounting",payment:"Banco",paid:true },
  { id:"I028",supplier:"Contabilidade Lda",invoiceNo:"FT CL/2025/003",date:"2025-03-31",period:"202503",net:350,iva:80.5,total:430.5,nature:"Services - Accounting",payment:"Banco",paid:true },
  { id:"I029",supplier:"Contabilidade Lda",invoiceNo:"FT CL/2025/004",date:"2025-04-30",period:"202504",net:350,iva:80.5,total:430.5,nature:"Services - Accounting",payment:"Banco",paid:true },
  { id:"I030",supplier:"Contabilidade Lda",invoiceNo:"FT CL/2025/005",date:"2025-05-31",period:"202505",net:350,iva:80.5,total:430.5,nature:"Services - Accounting",payment:"Banco",paid:true },
  { id:"I031",supplier:"Contabilidade Lda",invoiceNo:"FT CL/2025/006",date:"2025-06-30",period:"202506",net:350,iva:80.5,total:430.5,nature:"Services - Accounting",payment:"Banco",paid:true },
  { id:"I032",supplier:"Contabilidade Lda",invoiceNo:"FT CL/2025/007",date:"2025-07-31",period:"202507",net:350,iva:80.5,total:430.5,nature:"Services - Accounting",payment:"Banco",paid:true },
  { id:"I033",supplier:"Contabilidade Lda",invoiceNo:"FT CL/2025/008",date:"2025-08-31",period:"202508",net:350,iva:80.5,total:430.5,nature:"Services - Accounting",payment:"Banco",paid:true },
  { id:"I034",supplier:"Contabilidade Lda",invoiceNo:"FT CL/2025/009",date:"2025-09-30",period:"202509",net:350,iva:80.5,total:430.5,nature:"Services - Accounting",payment:"Banco",paid:true },
  { id:"I035",supplier:"Contabilidade Lda",invoiceNo:"FT CL/2025/010",date:"2025-10-31",period:"202510",net:350,iva:80.5,total:430.5,nature:"Services - Accounting",payment:"Banco",paid:true },
  { id:"I036",supplier:"Contabilidade Lda",invoiceNo:"FT CL/2025/011",date:"2025-11-30",period:"202511",net:350,iva:80.5,total:430.5,nature:"Services - Accounting",payment:"Banco",paid:true },
  { id:"I037",supplier:"Ricardo Fotografia",invoiceNo:"RF-2025-INV-0088",date:"2025-03-05",period:"202503",net:400,iva:92,total:492,nature:"Services - Photograph",payment:"Banco",paid:true },
  { id:"I038",supplier:"Ricardo Fotografia",invoiceNo:"RF-2025-INV-0142",date:"2025-06-12",period:"202506",net:550,iva:126.5,total:676.5,nature:"Services - Photograph",payment:"Banco",paid:true },
  { id:"I039",supplier:"Studio Lisboa",invoiceNo:"SL-FT-2025/217",date:"2025-09-08",period:"202509",net:320,iva:73.6,total:393.6,nature:"Services - Photograph",payment:"Banco",paid:true },
  { id:"I040",supplier:"Leonor Machado",invoiceNo:"LM-REC-2025/001",date:"2025-01-03",period:"202501",net:395.85,iva:0,total:395.85,nature:"Services - Consulting",payment:"Banco",paid:true },
  { id:"I041",supplier:"Leonor Taborda",invoiceNo:"LT-REC-2025/001",date:"2025-01-03",period:"202501",net:1050,iva:0,total:1050,nature:"Services - Staff",payment:"Banco",paid:true },
  { id:"I042",supplier:"Leonor Machado",invoiceNo:"LM-REC-2025/002",date:"2025-02-05",period:"202502",net:600,iva:0,total:600,nature:"Services - Consulting",payment:"Banco",paid:true },
  { id:"I043",supplier:"Leonor Taborda",invoiceNo:"LT-REC-2025/002",date:"2025-02-05",period:"202502",net:1050,iva:0,total:1050,nature:"Services - Staff",payment:"Banco",paid:true },
  { id:"I044",supplier:"Leonor Taborda",invoiceNo:"LT-REC-2025/003",date:"2025-03-05",period:"202503",net:1050,iva:0,total:1050,nature:"Services - Staff",payment:"Banco",paid:true },
  { id:"I045",supplier:"Leonor Taborda",invoiceNo:"LT-REC-2025/004",date:"2025-04-05",period:"202504",net:1050,iva:0,total:1050,nature:"Services - Staff",payment:"Banco",paid:true },
  { id:"I046",supplier:"Leonor Taborda",invoiceNo:"LT-REC-2025/005",date:"2025-05-05",period:"202505",net:1050,iva:0,total:1050,nature:"Services - Staff",payment:"Banco",paid:true },
  { id:"I047",supplier:"Stripe",invoiceNo:"STRIPE-FEE-2025-01",date:"2025-01-31",period:"202501",net:42.3,iva:0,total:42.3,nature:"Services - Financial Fees",payment:"Banco",paid:true },
  { id:"I048",supplier:"Stripe",invoiceNo:"STRIPE-FEE-2025-02",date:"2025-02-28",period:"202502",net:58.9,iva:0,total:58.9,nature:"Services - Financial Fees",payment:"Banco",paid:true },
  { id:"I049",supplier:"Stripe",invoiceNo:"STRIPE-FEE-2025-03",date:"2025-03-31",period:"202503",net:95.1,iva:0,total:95.1,nature:"Services - Financial Fees",payment:"Banco",paid:true },
  { id:"I050",supplier:"Stripe",invoiceNo:"STRIPE-FEE-2025-04",date:"2025-04-30",period:"202504",net:72.45,iva:0,total:72.45,nature:"Services - Financial Fees",payment:"Banco",paid:true },
  { id:"I051",supplier:"Banco",invoiceNo:"BK-FEE-2025-Q1",date:"2025-03-31",period:"202503",net:15,iva:0,total:15,nature:"services - Bank fees",payment:"Banco",paid:true },
  { id:"I052",supplier:"Mercado da Ribeira",invoiceNo:"MR-FT-2025/4412",date:"2025-03-20",period:"202503",net:280,iva:36.4,total:316.4,nature:"Cost of Product - Food",payment:"Banco",paid:true },
  { id:"I053",supplier:"Mercado da Ribeira",invoiceNo:"MR-FT-2025/5518",date:"2025-05-22",period:"202505",net:320,iva:41.6,total:361.6,nature:"Cost of Product - Food",payment:"Banco",paid:true },
  { id:"I054",supplier:"Wine Connection",invoiceNo:"WC-2025-INV-0177",date:"2025-03-20",period:"202503",net:180,iva:23.4,total:203.4,nature:"Cost of Product - Drink",payment:"Banco",paid:true },
  { id:"I055",supplier:"Wine Connection",invoiceNo:"WC-2025-INV-0288",date:"2025-06-15",period:"202506",net:220,iva:28.6,total:248.6,nature:"Cost of Product - Drink",payment:"Banco",paid:true },
  { id:"I056",supplier:"Creative Studio",invoiceNo:"CS-2025-FT-0042",date:"2025-02-10",period:"202502",net:750,iva:172.5,total:922.5,nature:"Services - Design",payment:"Banco",paid:true },
  { id:"I057",supplier:"Creative Studio",invoiceNo:"CS-2025-FT-0088",date:"2025-05-20",period:"202505",net:500,iva:115,total:615,nature:"Services - Design",payment:"Banco",paid:true },
  { id:"I058",supplier:"Lisboa Decor",invoiceNo:"LD-FT-2025/311",date:"2025-03-08",period:"202503",net:420,iva:96.6,total:516.6,nature:"Services - Decor",payment:"Banco",paid:true },
  { id:"I059",supplier:"Sound & Light PT",invoiceNo:"SLPT-2025-INV-019",date:"2025-03-14",period:"202503",net:680,iva:156.4,total:836.4,nature:"Services - Sound and Light",payment:"Banco",paid:true },
  { id:"I060",supplier:"Security Plus",invoiceNo:"SP-FT-2025/0221",date:"2025-03-14",period:"202503",net:250,iva:57.5,total:307.5,nature:"Services - Security",payment:"Banco",paid:true },
  { id:"I061",supplier:"Hotel Avenida",invoiceNo:"HA-2025-RES-0441",date:"2025-03-13",period:"202503",net:180,iva:10.8,total:190.8,nature:"Services - Accommodation",payment:"Banco",paid:true },
  { id:"I062",supplier:"TAP Air Portugal",invoiceNo:"TAP-2025-PT-88210",date:"2025-03-12",period:"202503",net:220,iva:0,total:220,nature:"Services - Travel",payment:"Banco",paid:true },
  { id:"I063",supplier:"TAP Air Portugal",invoiceNo:"TAP-2025-PT-99104",date:"2025-07-18",period:"202507",net:185,iva:0,total:185,nature:"Services - Travel",payment:"Banco",paid:true },
  { id:"I064",supplier:"Advogados & Associados",invoiceNo:"AA-FT-2025/0017",date:"2025-01-20",period:"202501",net:500,iva:115,total:615,nature:"Services - Legal and administrative",payment:"Banco",paid:true },
  { id:"I065",supplier:"PT Office Supplies",invoiceNo:"PTOS-2025-INV-332",date:"2025-04-10",period:"202504",net:85,iva:19.55,total:104.55,nature:"Services - Other",payment:"Banco",paid:true },
  { id:"I066",supplier:"PT Office Supplies",invoiceNo:"PTOS-2025-INV-447",date:"2025-08-12",period:"202508",net:62,iva:14.26,total:76.26,nature:"Services - Other",payment:"Banco",paid:true },
  { id:"I067",supplier:"Segurança Social",invoiceNo:"SS-2025-Q1",date:"2025-03-31",period:"202503",net:420,iva:0,total:420,nature:"Social Security",payment:"Banco",paid:true },
  { id:"I068",supplier:"Segurança Social",invoiceNo:"SS-2025-Q2",date:"2025-06-30",period:"202506",net:420,iva:0,total:420,nature:"Social Security",payment:"Banco",paid:true },
  { id:"I069",supplier:"Segurança Social",invoiceNo:"SS-2025-Q3",date:"2025-09-30",period:"202509",net:420,iva:0,total:420,nature:"Social Security",payment:"Banco",paid:true },
  { id:"I070",supplier:"Lisboa Event Space",invoiceNo:"LES-2025-RNT-003",date:"2025-03-01",period:"202503",net:800,iva:184,total:984,nature:"Services - Rent",payment:"Banco",paid:true },
  { id:"I071",supplier:"Production House LX",invoiceNo:"PHLX-2025-INV-014",date:"2025-03-10",period:"202503",net:1200,iva:276,total:1476,nature:"Services - Production",payment:"Banco",paid:true },
  { id:"I072",supplier:"Production House LX",invoiceNo:"PHLX-2025-INV-028",date:"2025-06-08",period:"202506",net:950,iva:218.5,total:1168.5,nature:"Services - Production",payment:"Banco",paid:true },
  { id:"I073",supplier:"Mercado Oriental",invoiceNo:"MO-FT-2025/892",date:"2025-08-15",period:"202508",net:150,iva:19.5,total:169.5,nature:"Cost of Product - Food",payment:"Cash",paid:true },
  { id:"I074",supplier:"Garrafeira Nacional",invoiceNo:"GN-2025-VND-4418",date:"2025-09-10",period:"202509",net:340,iva:44.2,total:384.2,nature:"Cost of Product - Drink",payment:"Banco",paid:true },
  { id:"I075",supplier:"Mailchimp",invoiceNo:"MC-2025-1104527",date:"2025-07-15",period:"202507",net:45,iva:10.35,total:55.35,nature:"Services - Digital Marketing EDM",payment:"Banco",paid:true },
  { id:"I076",supplier:"Mailchimp",invoiceNo:"MC-2025-1208831",date:"2025-10-15",period:"202510",net:45,iva:10.35,total:55.35,nature:"Services - Digital Marketing EDM",payment:"Banco",paid:true },
  { id:"I077",supplier:"Cervejaria Ramiro",invoiceNo:"CR-FT-2025/1182",date:"2025-10-18",period:"202510",net:680,iva:88.4,total:768.4,nature:"Services - Restaurants",payment:"Banco",paid:false },
  { id:"I078",supplier:"Lisboa Wines",invoiceNo:"LW-2025-INV-0394",date:"2025-10-25",period:"202510",net:290,iva:37.7,total:327.7,nature:"Cost of Product - Drink",payment:"",paid:false },
  { id:"I079",supplier:"Studio Criativo",invoiceNo:"SC-FT-2025/0218",date:"2025-11-02",period:"202511",net:850,iva:195.5,total:1045.5,nature:"Services - Design",payment:"",paid:false },
  { id:"I080",supplier:"Sound & Light PT",invoiceNo:"SLPT-2025-INV-041",date:"2025-11-08",period:"202511",net:520,iva:119.6,total:639.6,nature:"Services - Sound and Light",payment:"",paid:false },
  { id:"I081",supplier:"Contabilidade Lda",invoiceNo:"FT CL/2025/012",date:"2025-12-31",period:"202512",net:350,iva:80.5,total:430.5,nature:"Services - Accounting",payment:"",paid:false },
];

const MISSING_SEED = [
  { nif:"517557584",supplier:"Arnaud Juanola Unipessoal Lda",invoiceNo:"FS A48307TWxU2025/00173",date:"2025-03-14",value:30,status:"No invoice",comment:"Never replied",month:3 },
  { nif:"506848558",supplier:"Bcm Bricolage S A",invoiceNo:"FT 20250056701/004009",date:"2025-04-19",value:47.54,status:"No invoice",comment:"Don't send invoices after 3 months",month:4 },
  { nif:"516030108",supplier:"Divine Swallow Restaurante",invoiceNo:"FS TRBB/7761",date:"2025-01-07",value:12,status:"No invoice",comment:"Fraud - refund",month:1 },
  { nif:"516030108",supplier:"Divine Swallow Restaurante",invoiceNo:"FS TRBB/9847",date:"2025-08-28",value:12,status:"No invoice",comment:"Fraud - refund",month:8 },
  { nif:"516780800",supplier:"EASYJET AIRLINE CO.",invoiceNo:"INV-GBR-eJ-2025-0001037558",date:"2025-02-17",value:63.31,status:"Requested",comment:"",month:2 },
  { nif:"516780800",supplier:"EASYJET AIRLINE CO.",invoiceNo:"INV-GBR-eJ-2025-0002162654",date:"2025-07-01",value:134.31,status:"Requested",comment:"",month:7 },
  { nif:"513348498",supplier:"Farmácia Estácio",invoiceNo:"FS EST31/12637",date:"2025-03-06",value:10.37,status:"No invoice",comment:"Never replied",month:3 },
  { nif:"515693813",supplier:"Grupo NBRAND",invoiceNo:"FS UBS/5025",date:"2025-10-18",value:26.5,status:"No invoice",comment:"",month:10 },
  { nif:"514661490",supplier:"Hotel Corpo Santo",invoiceNo:"ND 6CS 2025/3",date:"2025-09-20",value:28.49,status:"Registered",comment:"",month:9 },
  { nif:"980768498",supplier:"LeroyMerlin",invoiceNo:"FR FR/195",date:"2025-04-26",value:27.14,status:"No invoice",comment:"",month:4 },
  { nif:"506399227",supplier:"OlaBrisa",invoiceNo:"FS INV/11259",date:"2025-09-15",value:15.95,status:"No invoice",comment:"",month:9 },
  { nif:"515025498",supplier:"ON THE WAGON PARK",invoiceNo:"FS OTW/32652",date:"2025-02-21",value:23.9,status:"No invoice",comment:"Never replied",month:2 },
  { nif:"518225850",supplier:"Padaria Bairro Alto",invoiceNo:"FS PBA/4411",date:"2025-06-10",value:8.5,status:"No invoice",comment:"Small value",month:6 },
  { nif:"509123456",supplier:"Restaurante Solar",invoiceNo:"FS RS/2025-881",date:"2025-07-25",value:45,status:"Requested",comment:"Requested via email 2x",month:7 },
  { nif:"517889234",supplier:"Casa das Flores",invoiceNo:"FS CF/2025-112",date:"2025-08-05",value:35,status:"No invoice",comment:"",month:8 },
  { nif:"510445678",supplier:"Taxi Lisboa",invoiceNo:"TL-REC-2025/442",date:"2025-05-18",value:22,status:"Steph",comment:"Steph handling follow-up",month:5 },
];

const PL = {
  revenue:[
    {name:"Magazine Issue 2",m:[0,645.52,0,0,0,0,0,0,0,0,0,0]},
    {name:"Magazine Issue 03",m:[91.8,0,1483.1,0,310.64,0,0,0,0,0,0,0]},
    {name:"Dinner Challenge Ticket",m:[0,538.68,0,0,0,0,0,0,0,0,0,0]},
    {name:"Instagram Reel",m:[0,0,0,0,0,250,0,0,0,0,0,0]},
    {name:"Consultancy services",m:[0,0,500,0,0,0,0,0,0,0,0,0]},
    {name:"EDM Top Feature",m:[0,0,0,1500,0,0,0,500,0,0,0,0]},
    {name:"Stripe Payments 2024",m:[1842.3,0,0,0,0,0,0,0,0,0,0,0]},
    {name:"Awards Ceremony Sponsors",m:[0,0,8500,0,0,0,0,0,0,0,0,0]},
    {name:"Newsletter Subscriptions",m:[178.5,238,297.5,356,297.5,238,178.5,297.5,356,297.5,238,178.5]},
    {name:"Map Sales",m:[89.55,119.4,149.25,179.1,149.25,119.4,89.55,149.25,179.1,149.25,119.4,89.55]},
    {name:"Restaurant Week",m:[0,0,0,0,0,0,0,0,0,12500,0,0]},
  ],
  costOfProduct:[
    {name:"Cost of Product - Food",m:[0,0,280,0,320,0,0,150,0,0,0,0]},
    {name:"Cost of Product - Drink",m:[0,0,180,0,0,220,0,0,340,0,0,0]},
  ],
  services:[
    {name:"Rent",m:[0,0,800,0,0,0,0,0,0,0,0,0]},
    {name:"Production",m:[0,0,1200,0,0,950,0,0,0,0,0,0]},
    {name:"Sound and Light",m:[0,0,680,0,0,0,0,0,0,0,520,0]},
    {name:"Legal",m:[500,0,0,0,0,0,0,0,0,0,0,0]},
    {name:"Digital Marketing",m:[0,0,0,45,0,0,45,0,0,45,0,0]},
    {name:"Software",m:[180,250,59.99,0,0,0,0,0,0,0,0,0]},
    {name:"Accounting",m:[350,350,350,350,350,350,350,350,350,350,350,350]},
    {name:"Consulting",m:[395.85,600,0,0,0,0,0,0,0,0,0,0]},
    {name:"Restaurants",m:[0,0,850,0,0,1200,450,0,0,680,0,0]},
    {name:"Other",m:[0,0,0,85,0,0,0,62,0,0,0,0]},
    {name:"Travel",m:[0,0,220,0,0,0,185,0,0,0,0,0]},
    {name:"Transports",m:[22.5,0,35.8,18.9,0,0,28.5,0,0,0,0,0]},
    {name:"Electricity/Gas/Water",m:[0,0,85.2,32.1,0,78.4,0,0,0,0,0,0]},
    {name:"Printing",m:[0,645.52,1483.1,0,310.64,0,0,0,0,0,0,0]},
    {name:"Photograph",m:[0,0,400,0,0,550,0,0,320,0,0,0]},
    {name:"Security",m:[0,0,250,0,0,0,0,0,0,0,0,0]},
    {name:"Decor",m:[0,0,420,0,0,0,0,0,0,0,0,0]},
    {name:"Communication",m:[0,31.53,0,31.53,31.53,31.53,31.53,31.53,31.53,31.53,31.53,0]},
    {name:"Design",m:[0,750,0,0,500,0,0,0,0,0,850,0]},
    {name:"Financial Fees",m:[42.3,58.9,110.1,72.45,0,0,0,0,0,0,0,0]},
    {name:"Accommodation",m:[0,0,180,0,0,0,0,0,0,0,0,0]},
  ],
  employee:[
    {name:"Staff",m:[1050,1050,1050,1050,1050,0,0,0,0,0,0,0]},
    {name:"Social Security",m:[0,0,420,0,0,420,0,0,420,0,0,0]},
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════
const fmt = n => new Intl.NumberFormat("pt-PT",{minimumFractionDigits:2,maximumFractionDigits:2}).format(n);
const fmtK = n => Math.abs(n)>=1000?`${(n/1000).toFixed(1)}k`:fmt(n);
const sumArr = a => a.reduce((s,v)=>s+v,0);
const todayStr = () => {const d=new Date();return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`;};

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════
const Ico = ({d,size=16,color="currentColor"}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>;

const ICONS = {
  grid:"M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  file:"M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8",
  alert:"M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01",
  chart:"M18 20V10M12 20V4M6 20v-6",
  cloud:"M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12",
  check:"M20 6L9 17l-5-5",
  search:"M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z",
  refresh:"M23 4v6h-6M20.49 15a9 9 0 11-2.12-9.36L23 10",
  folder:"M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z",
  scan:"M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2M7 12h10",
  key:"M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 010-7.778zM15.5 7.5l3 3L22 7l-3-3m-3.5 3.5L19 4",
  zap:"M13 2L3 14h9l-1 8 10-12h-9l1-8",
  list:"M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  edit:"M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  inbox:"M22 12l-6 0-2 3h-4l-2-3H2M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89",
  euro:"M4 10h12M4 14h9M17 4a8 8 0 010 16",
  img:"M3 3h18v18H3zM8.5 8.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM21 15l-5-5L5 21",
};

const NavIcon = ({name,size=16}) => {
  const d = ICONS[name];
  return d ? <Ico d={d} size={size}/> : null;
};

const Badge = ({label,color="blue"}) => {
  const C={blue:["#0c1929","#60a5fa","#172554"],green:["#052e16","#4ade80","#14532d"],amber:["#1e1b0f","#fbbf24","#422006"],red:["#2a1215","#f87171","#450a0a"],purple:["#1a0f29","#c084fc","#3b0764"],gray:["#1a1f2e","#9ca3af","#2d3548"],teal:["#0f1f1e","#2dd4bf","#134e4a"]};
  const c=C[color]||C.gray;
  return <span style={{display:"inline-block",padding:"2px 9px",borderRadius:20,fontSize:10,fontWeight:600,background:c[0],color:c[1],border:`1px solid ${c[2]}`,letterSpacing:"0.03em",whiteSpace:"nowrap"}}>{label}</span>;
};

const StatusBadge = ({status,onClick}) => {
  const map={"paid":"green","unpaid":"red","No invoice":"red","Requested":"amber","Registered":"blue","Steph":"purple","bolt":"teal"};
  return <span onClick={onClick} style={{cursor:onClick?"pointer":"default"}}><Badge label={status} color={map[status]||"gray"}/></span>;
};

const Btn = ({children,onClick,variant="primary",disabled,small,icon}) => {
  const base={display:"inline-flex",alignItems:"center",gap:6,border:"none",borderRadius:7,cursor:disabled?"not-allowed":"pointer",fontFamily:"var(--f)",fontWeight:600,transition:"all 0.15s",opacity:disabled?0.4:1};
  const sz=small?{padding:"4px 11px",fontSize:11}:{padding:"8px 16px",fontSize:12};
  const V={primary:{background:"linear-gradient(135deg,#2563eb,#4f46e5)",color:"#fff"},secondary:{background:"#141824",color:"#d1d5db",border:"1px solid #2d3548"},success:{background:"linear-gradient(135deg,#059669,#10b981)",color:"#fff"},danger:{background:"#2a1215",color:"#f87171",border:"1px solid #450a0a"},ghost:{background:"transparent",color:"#9ca3af"}};
  return <button onClick={disabled?undefined:onClick} style={{...base,...sz,...V[variant]||V.secondary}}>{icon&&<NavIcon name={icon} size={small?12:14}/>}{children}</button>;
};

const Field = ({label,value,onChange,type="text",placeholder,options,small,readOnly}) => (
  <div style={{display:"flex",flexDirection:"column",gap:3}}>
    {label&&<label style={{fontSize:9,fontWeight:600,color:"#6b7280",textTransform:"uppercase",letterSpacing:"0.06em"}}>{label}</label>}
    {options?<select value={value} onChange={e=>onChange(e.target.value)} style={{padding:small?"4px 7px":"7px 11px",background:"var(--bg2)",border:"1px solid var(--bd)",borderRadius:5,color:"#e5e7eb",fontSize:small?10:11,fontFamily:"var(--f)"}}>
      {options.map(o=><option key={o} value={o}>{o}</option>)}
    </select>
    :<input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} readOnly={readOnly} style={{padding:small?"4px 7px":"7px 11px",background:"var(--bg2)",border:"1px solid var(--bd)",borderRadius:5,color:readOnly?"#6b7280":"#e5e7eb",fontSize:small?10:11,fontFamily:type==="number"?"var(--fm)":"var(--f)",outline:"none",width:"100%"}}/>}
  </div>
);

const KpiCard = ({label,value,accent,sub}) => (
  <div style={{background:"var(--bg1)",border:"1px solid var(--bd)",borderRadius:10,padding:"16px 20px",flex:1,minWidth:170}}>
    <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:"0.07em",color:"#6b7280",marginBottom:6,fontFamily:"var(--f)"}}>{label}</div>
    <div style={{fontSize:24,fontWeight:700,color:accent||"#e5e7eb",fontFamily:"var(--fm)",letterSpacing:"-0.02em"}}>€{fmtK(value)}</div>
    {sub&&<div style={{fontSize:11,color:"#6b7280",marginTop:3}}>{sub}</div>}
  </div>
);

const MiniBar = ({data,color="#3B82F6",h=60}) => {
  const mx=Math.max(...data,1);
  return <div style={{display:"flex",alignItems:"flex-end",gap:2,height:h,width:"100%"}}>
    {data.map((v,i)=><div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
      <div style={{width:"100%",maxWidth:26,borderRadius:"3px 3px 0 0",height:`${Math.max((v/mx)*h*0.85,2)}px`,background:v>0?color:"#1a1f2e",transition:"height 0.4s ease"}}/>
      <span style={{fontSize:8,color:"#6b7280"}}>{MONTHS[i]}</span>
    </div>)}
  </div>;
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [invoices, setInvoices] = useState(INVOICES_SEED);
  const [missing, setMissing] = useState(MISSING_SEED);
  const [search, setSearch] = useState("");
  const [fCat, setFCat] = useState("All");
  const [fPaid, setFPaid] = useState("All");
  const [fMissingSt, setFMissingSt] = useState("All");
  const [fMonth, setFMonth] = useState("All");

  // Drive state
  const [clientId,setClientId]=useState("");
  const [apiKey,setApiKey]=useState("");
  const [isAuthed,setIsAuthed]=useState(false);
  const [authError,setAuthError]=useState("");
  const [accessToken,setAccessToken]=useState("");
  const tokenRef=useRef(null);
  const [folderId,setFolderId]=useState("");
  const [folderName,setFolderName]=useState("");
  const [driveFiles,setDriveFiles]=useState([]);
  const [loadingFiles,setLoadingFiles]=useState(false);
  const [processing,setProcessing]=useState(false);
  const [processingId,setProcessingId]=useState(null);
  const [extracted,setExtracted]=useState({});
  const [logs,setLogs]=useState([]);
  const [bookedDrive,setBookedDrive]=useState([]);
  const [renaming,setRenaming]=useState(false);
  const [renamed,setRenamed]=useState({});

  const addLog = useCallback((t,m)=>{setLogs(p=>[{t,m,time:new Date().toLocaleTimeString()},...p].slice(0,30))},[]);

  // ── Computed P&L
  const mRev = useMemo(()=>{const a=Array(12).fill(0);PL.revenue.forEach(r=>r.m.forEach((v,i)=>a[i]+=v));return a;},[]);
  const mExp = useMemo(()=>{const a=Array(12).fill(0);[...PL.costOfProduct,...PL.services,...PL.employee].forEach(r=>r.m.forEach((v,i)=>a[i]+=v));return a;},[]);
  const totRev=sumArr(mRev), totExp=sumArr(mExp), ebitda=totRev-totExp;
  const unpaidN=invoices.filter(i=>!i.paid).length;
  const unpaidT=invoices.filter(i=>!i.paid).reduce((s,i)=>s+i.total,0);
  const missingT=missing.reduce((s,m)=>s+m.value,0);
  const expByCat = useMemo(()=>{const m={};invoices.forEach(i=>{m[i.nature]=(m[i.nature]||0)+i.net});return Object.entries(m).sort((a,b)=>b[1]-a[1]);},[invoices]);

  // ── Filters
  const fInv = useMemo(()=>invoices.filter(i=>{
    if(search&&!i.supplier.toLowerCase().includes(search.toLowerCase())&&!i.invoiceNo.toLowerCase().includes(search.toLowerCase()))return false;
    if(fCat!=="All"&&i.nature!==fCat)return false;
    if(fPaid==="Paid"&&!i.paid)return false;
    if(fPaid==="Unpaid"&&i.paid)return false;
    if(fMonth!=="All"&&parseInt(i.period.slice(4))!==parseInt(fMonth))return false;
    return true;
  }),[invoices,search,fCat,fPaid,fMonth]);

  const fMiss = useMemo(()=>missing.filter(m=>{
    if(search&&!m.supplier.toLowerCase().includes(search.toLowerCase()))return false;
    if(fMissingSt!=="All"&&m.status!==fMissingSt)return false;
    if(fMonth!=="All"&&m.month!==parseInt(fMonth))return false;
    return true;
  }),[missing,search,fMissingSt,fMonth]);

  const togglePaid=id=>setInvoices(p=>p.map(i=>i.id===id?{...i,paid:!i.paid}:i));
  const updateMissStatus=(idx,st)=>setMissing(p=>p.map((m,i)=>i===idx?{...m,status:st}:m));
  const resetFilters=()=>{setSearch("");setFCat("All");setFPaid("All");setFMissingSt("All");setFMonth("All");};

  // ── Google Drive functions
  const loadGAPIs=useCallback(()=>new Promise((res,rej)=>{
    if(window.gapi&&window.google){res();return;}
    const s1=document.createElement("script");s1.src="https://apis.google.com/js/api.js";
    s1.onload=()=>{const s2=document.createElement("script");s2.src="https://accounts.google.com/gsi/client";s2.onload=res;s2.onerror=rej;document.head.appendChild(s2);};
    s1.onerror=rej;document.head.appendChild(s1);
  }),[]);

  const doAuth=useCallback(async()=>{
    if(!clientId||!apiKey){setAuthError("Enter Client ID and API Key");return;}
    setAuthError("");
    try{
      await loadGAPIs();
      await new Promise((r,j)=>window.gapi.load("client",{callback:r,onerror:j}));
      await window.gapi.client.init({apiKey,discoveryDocs:[DISCOVERY_DOC]});
      tokenRef.current=window.google.accounts.oauth2.initTokenClient({client_id:clientId,scope:SCOPES,callback:r=>{
        if(r.error){setAuthError(r.error);return;}
        setAccessToken(r.access_token);setIsAuthed(true);addLog("success","Google Drive connected");
      }});
      tokenRef.current.requestAccessToken({prompt:"consent"});
    }catch(e){setAuthError(`Auth failed: ${e.message||e}`);}
  },[clientId,apiKey,loadGAPIs,addLog]);

  const listDriveFiles=useCallback(async()=>{
    if(!folderId||!isAuthed)return;
    setLoadingFiles(true);
    try{
      const mq=MIME_ACCEPT.map(m=>`mimeType='${m}'`).join(" or ");
      const r=await window.gapi.client.drive.files.list({q:`'${folderId}' in parents and (${mq}) and trashed=false`,fields:"files(id,name,mimeType,size,createdTime,thumbnailLink,webViewLink)",orderBy:"createdTime desc",pageSize:50});
      setDriveFiles(r.result.files||[]);
      try{const fr=await window.gapi.client.drive.files.get({fileId:folderId,fields:"name"});setFolderName(fr.result.name);}catch{setFolderName("");}
      addLog("info",`Found ${(r.result.files||[]).length} files`);
    }catch(e){addLog("error",`List failed: ${e.message}`);}
    setLoadingFiles(false);
  },[folderId,isAuthed,addLog]);

  useEffect(()=>{if(isAuthed&&folderId)listDriveFiles();},[isAuthed,folderId,listDriveFiles]);

  const dlBase64=useCallback(async(fid)=>{
    const r=await fetch(`https://www.googleapis.com/drive/v3/files/${fid}?alt=media`,{headers:{Authorization:`Bearer ${accessToken}`}});
    const b=await r.blob();
    return new Promise(res=>{const rd=new FileReader();rd.onloadend=()=>res(rd.result.split(",")[1]);rd.readAsDataURL(b);});
  },[accessToken]);

  const processFile=useCallback(async(file)=>{
    setProcessingId(file.id);setProcessing(true);addLog("info",`Scanning: ${file.name}`);
    try{
      const b64=await dlBase64(file.id);
      const isPdf=file.mimeType==="application/pdf";
      const cb=isPdf?{type:"document",source:{type:"base64",media_type:"application/pdf",data:b64}}:{type:"image",source:{type:"base64",media_type:file.mimeType,data:b64}};
      const resp=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:[cb,{type:"text",text:`You are an expert bookkeeper for Lisbon Insiders (Portuguese company). Extract invoice data.\nReturn ONLY JSON:\n{"supplier":"","nif":"","invoice_number":"","invoice_date":"YYYY-MM-DD","value_without_iva":0,"iva":0,"with_iva":0,"nature":"one of: ${EXPENSE_CATEGORIES.join(", ")}","description":"","confidence":"high|medium|low"}\nAll amounts as numbers. Date as YYYY-MM-DD. Nature MUST match list exactly.`}]}]})});
      const data=await resp.json();
      const txt=(data.content||[]).map(i=>i.text||"").join("\n");
      const clean=txt.replace(/```json|```/g,"").trim();
      try{
        const p=JSON.parse(clean);
        setExtracted(prev=>({...prev,[file.id]:{...p,fileId:file.id,fileName:file.name,status:"extracted"}}));
        addLog("success",`${file.name}: ${p.supplier} €${p.with_iva}`);
      }catch{addLog("error",`Parse failed: ${file.name}`);setExtracted(prev=>({...prev,[file.id]:{error:"Parse fail",fileId:file.id,fileName:file.name,status:"error"}}));}
    }catch(e){addLog("error",`Failed: ${file.name}: ${e.message}`);setExtracted(prev=>({...prev,[file.id]:{error:e.message,fileId:file.id,fileName:file.name,status:"error"}}));}
    setProcessingId(null);setProcessing(false);
  },[dlBase64,addLog]);

  const processAll=useCallback(async()=>{
    for(const f of driveFiles.filter(f=>!extracted[f.id]))await processFile(f);
  },[driveFiles,extracted,processFile]);

  const renameFile=useCallback(async(fid,nm)=>{
    try{await window.gapi.client.drive.files.update({fileId:fid,resource:{name:nm}});setRenamed(p=>({...p,[fid]:nm}));addLog("success",`Renamed → ${nm}`);return true;}
    catch(e){addLog("error",`Rename fail: ${e.message}`);return false;}
  },[addLog]);

  const bookInvoice=useCallback(async fid=>{
    const d=extracted[fid];if(!d||d.status!=="extracted")return;
    setRenaming(true);
    const dp=todayStr();
    const seq=String(bookedDrive.filter(b=>b.renamedTo?.startsWith(dp)).length+1).padStart(3,"0");
    const ext=driveFiles.find(f=>f.id===fid)?.name.split(".").pop()||"pdf";
    const nn=`${dp}_${seq}.${ext}`;
    const ok=await renameFile(fid,nn);
    const inv={id:`DRV-${Date.now()}`,supplier:d.supplier||"",invoiceNo:d.invoice_number||"",date:d.invoice_date||"",period:d.invoice_date?d.invoice_date.slice(0,7).replace("-",""):"",net:d.value_without_iva||0,iva:d.iva||0,total:d.with_iva||0,nature:d.nature||"Services - Other",payment:d.payment_method||"Banco",paid:false};
    setInvoices(p=>[inv,...p]);
    setBookedDrive(p=>[...p,{...d,renamedTo:ok?nn:null}]);
    setExtracted(p=>({...p,[fid]:{...p[fid],status:"booked"}}));
    addLog("success",`Booked: ${d.supplier} → ${nn}`);
    setRenaming(false);
  },[extracted,bookedDrive,driveFiles,renameFile,addLog]);

  const bookAll=useCallback(async()=>{for(const[fid,d] of Object.entries(extracted)){if(d.status==="extracted")await bookInvoice(fid)}},[extracted,bookInvoice]);

  const updateExtField=(fid,field,val)=>setExtracted(p=>({...p,[fid]:{...p[fid],[field]:["value_without_iva","iva","with_iva"].includes(field)?parseFloat(val)||0:val}}));

  const pendingFiles=driveFiles.filter(f=>!extracted[f.id]);
  const extractedList=Object.entries(extracted).filter(([_,d])=>d.status==="extracted");
  const errorList=Object.entries(extracted).filter(([_,d])=>d.status==="error");

  // ── Nav
  const NAV=[
    {id:"dashboard",icon:"grid",label:"Overview"},
    {id:"invoices",icon:"file",label:"Invoices",badge:unpaidN||null,badgeColor:"#ef4444"},
    {id:"missing",icon:"alert",label:"Missing",badge:missing.filter(m=>m.status==="No invoice").length||null,badgeColor:"#f59e0b"},
    {id:"pnl",icon:"chart",label:"P&L"},
    {id:"divider"},
    {id:"drive",icon:"cloud",label:"Drive Scan",badge:extractedList.length||null,badgeColor:"#3b82f6"},
    {id:"review",icon:"scan",label:"Review",badge:extractedList.length||null,badgeColor:"#8b5cf6"},
    {id:"booked",icon:"list",label:"Booked",badge:bookedDrive.length||null,badgeColor:"#10b981"},
  ];

  return (
    <div style={{"--f":"'Outfit',sans-serif","--fm":"'JetBrains Mono',monospace","--bg0":"#06080e","--bg1":"#0c1019","--bg2":"#080c14","--bd":"#1a2030","--accent":"#3b82f6",fontFamily:"var(--f)",background:"var(--bg0)",color:"#e5e7eb",minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet"/>

      {/* HEADER */}
      <header style={{background:"#080c14",borderBottom:"1px solid var(--bd)",padding:"0 22px",height:50,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:50}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:28,height:28,borderRadius:6,background:"linear-gradient(135deg,#2563eb,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--fm)",fontWeight:700,fontSize:11,color:"#fff"}}>LI</div>
          <span style={{fontWeight:700,fontSize:15,letterSpacing:"-0.01em"}}>Lisbon Insiders</span>
          <span style={{fontSize:10,color:"#4b5563",padding:"1px 7px",background:"#141824",borderRadius:4,fontWeight:500}}>Financial Hub</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {isAuthed&&<Badge label="Drive Connected" color="green"/>}
          {unpaidN>0&&<span onClick={()=>{setPage("invoices");setFPaid("Unpaid");}} style={{cursor:"pointer",display:"flex",alignItems:"center",gap:5,padding:"3px 10px",background:"#2a1215",border:"1px solid #450a0a",borderRadius:16,fontSize:11,color:"#f87171"}}>
            <span style={{width:5,height:5,borderRadius:"50%",background:"#f87171",animation:"pulse 2s infinite"}}/>{unpaidN} unpaid
          </span>}
        </div>
      </header>

      <div style={{display:"flex",flex:1}}>
        {/* SIDEBAR */}
        <nav style={{width:180,background:"#080c14",borderRight:"1px solid var(--bd)",padding:"14px 8px",position:"sticky",top:50,height:"calc(100vh - 50px)",display:"flex",flexDirection:"column",gap:2,overflow:"auto"}}>
          {NAV.map((n,i)=>n.id==="divider"?<div key={i} style={{height:1,background:"var(--bd)",margin:"8px 6px"}}/>:
            <button key={n.id} onClick={()=>{setPage(n.id);resetFilters();}} style={{
              display:"flex",alignItems:"center",gap:8,padding:"8px 11px",borderRadius:6,border:"none",cursor:"pointer",width:"100%",textAlign:"left",
              background:page===n.id?"#1a2030":"transparent",color:page===n.id?"#fff":"#6b7280",
              fontSize:12,fontWeight:page===n.id?600:400,fontFamily:"var(--f)",transition:"all 0.12s",
            }}>
              <NavIcon name={n.icon} size={14}/>{n.label}
              {n.badge&&<span style={{marginLeft:"auto",fontSize:9,fontWeight:700,padding:"1px 5px",borderRadius:8,background:n.badgeColor,color:"#fff",minWidth:16,textAlign:"center"}}>{n.badge}</span>}
            </button>
          )}

          {/* Activity Log */}
          {logs.length>0&&<div style={{marginTop:"auto",borderTop:"1px solid var(--bd)",paddingTop:10}}>
            <div style={{fontSize:8,textTransform:"uppercase",letterSpacing:"0.08em",color:"#374151",marginBottom:4,padding:"0 4px"}}>Activity</div>
            <div style={{maxHeight:160,overflow:"auto",display:"flex",flexDirection:"column",gap:2}}>
              {logs.slice(0,6).map((l,i)=><div key={i} style={{fontSize:8,padding:"2px 5px",borderRadius:3,background:"var(--bg1)",color:l.t==="error"?"#f87171":l.t==="success"?"#4ade80":"#9ca3af",lineHeight:1.3,wordBreak:"break-word"}}>
                <span style={{color:"#374151"}}>{l.time}</span> {l.m}
              </div>)}
            </div>
          </div>}
        </nav>

        {/* CONTENT */}
        <main style={{flex:1,padding:24,overflow:"auto",maxWidth:1080}}>

{/* ═══ DASHBOARD ═══════════════════════════════════════════════════════════ */}
{page==="dashboard"&&<div>
  <h1 style={{fontSize:20,fontWeight:700,marginBottom:3}}>Financial Overview</h1>
  <p style={{fontSize:12,color:"#6b7280",marginBottom:22}}>Year-to-date — 2025</p>
  <div style={{display:"flex",gap:14,marginBottom:24,flexWrap:"wrap"}}>
    <KpiCard label="Revenue" value={totRev} accent="#4ade80"/>
    <KpiCard label="Expenses" value={totExp} accent="#f87171"/>
    <KpiCard label="EBITDA" value={ebitda} accent={ebitda>=0?"#4ade80":"#f87171"} sub={`${((ebitda/totRev)*100).toFixed(1)}% margin`}/>
    <KpiCard label="Unpaid" value={unpaidT} accent="#fbbf24" sub={`${unpaidN} pending`}/>
  </div>
  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:24}}>
    <div style={{background:"var(--bg1)",border:"1px solid var(--bd)",borderRadius:10,padding:18}}>
      <div style={{fontSize:10,color:"#6b7280",marginBottom:10,textTransform:"uppercase",letterSpacing:"0.06em"}}>Monthly Revenue</div>
      <MiniBar data={mRev} color="#4ade80" h={70}/>
    </div>
    <div style={{background:"var(--bg1)",border:"1px solid var(--bd)",borderRadius:10,padding:18}}>
      <div style={{fontSize:10,color:"#6b7280",marginBottom:10,textTransform:"uppercase",letterSpacing:"0.06em"}}>Monthly Expenses</div>
      <MiniBar data={mExp} color="#f87171" h={70}/>
    </div>
  </div>
  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
    <div style={{background:"var(--bg1)",border:"1px solid var(--bd)",borderRadius:10,padding:18}}>
      <div style={{fontSize:10,color:"#6b7280",marginBottom:14,textTransform:"uppercase",letterSpacing:"0.06em"}}>Top Expense Categories</div>
      {expByCat.slice(0,8).map(([c,v])=><div key={c} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #141824"}}>
        <span style={{fontSize:11,color:"#9ca3af"}}>{c.replace("Services - ","").replace("Cost of Product - ","")}</span>
        <span style={{fontSize:11,fontFamily:"var(--fm)",color:"#e5e7eb"}}>€{fmt(v)}</span>
      </div>)}
    </div>
    <div style={{background:"var(--bg1)",border:"1px solid var(--bd)",borderRadius:10,padding:18}}>
      <div style={{fontSize:10,color:"#6b7280",marginBottom:14,textTransform:"uppercase",letterSpacing:"0.06em"}}>Missing Invoices</div>
      <div style={{display:"flex",gap:10,marginBottom:12,flexWrap:"wrap"}}>
        {["No invoice","Requested","Registered","Steph"].map(st=>{const c=missing.filter(m=>m.status===st).length;return c?<div key={st} style={{display:"flex",alignItems:"center",gap:5}}><StatusBadge status={st}/><span style={{fontSize:12,fontFamily:"var(--fm)"}}>{c}</span></div>:null;})}
      </div>
      <div style={{fontSize:11,color:"#6b7280",marginBottom:6}}>Total: <span style={{color:"#fbbf24",fontFamily:"var(--fm)"}}>€{fmt(missingT)}</span></div>
      {missing.filter(m=>m.status==="No invoice").slice(0,5).map((m,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:"1px solid #141824",fontSize:11}}>
        <span style={{color:"#9ca3af"}}>{m.supplier.length>28?m.supplier.slice(0,28)+"…":m.supplier}</span>
        <span style={{fontFamily:"var(--fm)"}}>€{fmt(m.value)}</span>
      </div>)}
    </div>
  </div>
</div>}

{/* ═══ INVOICES ════════════════════════════════════════════════════════════ */}
{page==="invoices"&&<div>
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
    <div><h1 style={{fontSize:20,fontWeight:700}}>Invoices</h1><p style={{fontSize:12,color:"#6b7280"}}>{fInv.length} of {invoices.length} — Total: <span style={{fontFamily:"var(--fm)",color:"#e5e7eb"}}>€{fmt(fInv.reduce((s,i)=>s+i.total,0))}</span></p></div>
  </div>
  <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
    <div style={{position:"relative",flex:"1 1 200px"}}><span style={{position:"absolute",left:8,top:"50%",transform:"translateY(-50%)",color:"#6b7280"}}><NavIcon name="search" size={13}/></span>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search supplier or invoice…" style={{width:"100%",padding:"7px 7px 7px 28px",background:"var(--bg1)",border:"1px solid var(--bd)",borderRadius:6,color:"#e5e7eb",fontSize:12,fontFamily:"var(--f)",outline:"none"}}/>
    </div>
    <select value={fCat} onChange={e=>setFCat(e.target.value)} style={{padding:"7px 10px",background:"var(--bg1)",border:"1px solid var(--bd)",borderRadius:6,color:"#e5e7eb",fontSize:11,fontFamily:"var(--f)"}}><option value="All">All Categories</option>{EXPENSE_CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}</select>
    <select value={fPaid} onChange={e=>setFPaid(e.target.value)} style={{padding:"7px 10px",background:"var(--bg1)",border:"1px solid var(--bd)",borderRadius:6,color:"#e5e7eb",fontSize:11,fontFamily:"var(--f)"}}><option value="All">All Status</option><option value="Paid">Paid</option><option value="Unpaid">Unpaid</option></select>
    <select value={fMonth} onChange={e=>setFMonth(e.target.value)} style={{padding:"7px 10px",background:"var(--bg1)",border:"1px solid var(--bd)",borderRadius:6,color:"#e5e7eb",fontSize:11,fontFamily:"var(--f)"}}><option value="All">All Months</option>{MONTHS.map((m,i)=><option key={i} value={i+1}>{m}</option>)}</select>
  </div>
  <div style={{background:"var(--bg1)",border:"1px solid var(--bd)",borderRadius:10,overflow:"hidden"}}>
    <div style={{overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
        <thead><tr style={{borderBottom:"1px solid var(--bd)"}}>
          {["","Supplier","Invoice #","Date","Net €","IVA","Total €","Category","Pay"].map(h=><th key={h} style={{padding:"8px 10px",textAlign:h.includes("€")?"right":"left",color:"#6b7280",fontWeight:600,fontSize:9,textTransform:"uppercase",letterSpacing:"0.05em",whiteSpace:"nowrap"}}>{h}</th>)}
        </tr></thead>
        <tbody>{fInv.map(inv=><tr key={inv.id} style={{borderBottom:"1px solid #0f1420",transition:"background 0.1s"}}
          onMouseEnter={e=>e.currentTarget.style.background="#111827"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          <td style={{padding:"6px 10px"}}><StatusBadge status={inv.paid?"paid":"unpaid"} onClick={()=>togglePaid(inv.id)}/></td>
          <td style={{padding:"6px 10px",fontWeight:500,whiteSpace:"nowrap"}}>{inv.supplier}</td>
          <td style={{padding:"6px 10px",fontFamily:"var(--fm)",color:"#6b7280",fontSize:10}}>{inv.invoiceNo}</td>
          <td style={{padding:"6px 10px",color:"#9ca3af",whiteSpace:"nowrap"}}>{inv.date}</td>
          <td style={{padding:"6px 10px",fontFamily:"var(--fm)",textAlign:"right"}}>€{fmt(inv.net)}</td>
          <td style={{padding:"6px 10px",fontFamily:"var(--fm)",textAlign:"right",color:"#6b7280"}}>€{fmt(inv.iva)}</td>
          <td style={{padding:"6px 10px",fontFamily:"var(--fm)",textAlign:"right",fontWeight:600}}>€{fmt(inv.total)}</td>
          <td style={{padding:"6px 10px",color:"#9ca3af",fontSize:10}}>{inv.nature.replace("Services - ","")}</td>
          <td style={{padding:"6px 10px",color:"#6b7280",fontSize:10}}>{inv.payment||"—"}</td>
        </tr>)}</tbody>
      </table>
    </div>
  </div>
</div>}

{/* ═══ MISSING ═════════════════════════════════════════════════════════════ */}
{page==="missing"&&<div>
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
    <div><h1 style={{fontSize:20,fontWeight:700}}>Missing Invoices</h1><p style={{fontSize:12,color:"#6b7280"}}>{fMiss.length} items — €{fmt(fMiss.reduce((s,m)=>s+m.value,0))}</p></div>
  </div>
  <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
    <div style={{position:"relative",flex:"1 1 200px"}}><span style={{position:"absolute",left:8,top:"50%",transform:"translateY(-50%)",color:"#6b7280"}}><NavIcon name="search" size={13}/></span>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search supplier…" style={{width:"100%",padding:"7px 7px 7px 28px",background:"var(--bg1)",border:"1px solid var(--bd)",borderRadius:6,color:"#e5e7eb",fontSize:12,fontFamily:"var(--f)",outline:"none"}}/>
    </div>
    <select value={fMissingSt} onChange={e=>setFMissingSt(e.target.value)} style={{padding:"7px 10px",background:"var(--bg1)",border:"1px solid var(--bd)",borderRadius:6,color:"#e5e7eb",fontSize:11,fontFamily:"var(--f)"}}><option value="All">All Statuses</option>{MISSING_STATUSES.map(s=><option key={s} value={s}>{s}</option>)}</select>
    <select value={fMonth} onChange={e=>setFMonth(e.target.value)} style={{padding:"7px 10px",background:"var(--bg1)",border:"1px solid var(--bd)",borderRadius:6,color:"#e5e7eb",fontSize:11,fontFamily:"var(--f)"}}><option value="All">All Months</option>{MONTHS.map((m,i)=><option key={i} value={i+1}>{m}</option>)}</select>
  </div>
  <div style={{display:"flex",flexDirection:"column",gap:6}}>
    {fMiss.map((m,idx)=><div key={idx} style={{background:"var(--bg1)",border:"1px solid var(--bd)",borderRadius:8,padding:"12px 16px",display:"flex",gap:14,alignItems:"center",transition:"border-color 0.15s"}}
      onMouseEnter={e=>e.currentTarget.style.borderColor="#2d3548"} onMouseLeave={e=>e.currentTarget.style.borderColor="var(--bd)"}>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3}}>
          <span style={{fontWeight:600,fontSize:12}}>{m.supplier}</span><StatusBadge status={m.status}/>
        </div>
        <div style={{fontSize:10,color:"#6b7280",display:"flex",gap:14,flexWrap:"wrap"}}>
          <span>NIF: {m.nif}</span><span>{m.invoiceNo}</span><span>{m.date}</span><span>{MONTHS[m.month-1]} 2025</span>
        </div>
        {m.comment&&<div style={{fontSize:10,color:"#9ca3af",marginTop:3,fontStyle:"italic"}}>💬 {m.comment}</div>}
      </div>
      <div style={{fontFamily:"var(--fm)",fontSize:13,fontWeight:700,minWidth:70,textAlign:"right"}}>€{fmt(m.value)}</div>
      <div style={{display:"flex",gap:3}}>
        {["No invoice","Requested","Registered"].filter(s=>s!==m.status).map(s=><button key={s} onClick={()=>updateMissStatus(missing.indexOf(m),s)} style={{padding:"3px 7px",fontSize:9,borderRadius:5,background:"#141824",border:"1px solid #2d3548",color:"#9ca3af",cursor:"pointer",fontFamily:"var(--f)",whiteSpace:"nowrap",transition:"all 0.12s"}}
          onMouseEnter={e=>{e.currentTarget.style.background="#2d3548";e.currentTarget.style.color="#fff";}} onMouseLeave={e=>{e.currentTarget.style.background="#141824";e.currentTarget.style.color="#9ca3af";}}>→ {s}</button>)}
      </div>
    </div>)}
  </div>
</div>}

{/* ═══ P&L ═════════════════════════════════════════════════════════════════ */}
{page==="pnl"&&<div>
  <h1 style={{fontSize:20,fontWeight:700,marginBottom:3}}>Profit & Loss</h1>
  <p style={{fontSize:12,color:"#6b7280",marginBottom:22}}>Monthly breakdown — 2025</p>
  <div style={{background:"var(--bg1)",border:"1px solid var(--bd)",borderRadius:10,overflow:"hidden"}}>
    <div style={{overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:10}}>
        <thead><tr style={{borderBottom:"2px solid var(--bd)"}}>
          <th style={{padding:"8px 12px",textAlign:"left",color:"#6b7280",fontWeight:600,position:"sticky",left:0,background:"var(--bg1)",minWidth:160,fontSize:9,textTransform:"uppercase",letterSpacing:"0.06em"}}>Description</th>
          {MONTHS.map(m=><th key={m} style={{padding:"8px 6px",textAlign:"right",color:"#6b7280",fontWeight:600,minWidth:62,fontSize:9,textTransform:"uppercase"}}>{m}</th>)}
          <th style={{padding:"8px 12px",textAlign:"right",color:"#fbbf24",fontWeight:700,minWidth:75,fontSize:9,textTransform:"uppercase"}}>TOTAL</th>
        </tr></thead>
        <tbody>
          <tr><td colSpan={14} style={{padding:"8px 12px",fontWeight:700,fontSize:11,color:"#4ade80",background:"#080c14",borderTop:"1px solid var(--bd)"}}>REVENUE</td></tr>
          {PL.revenue.map((r,i)=><tr key={i} style={{borderBottom:"1px solid #0f1420"}}>
            <td style={{padding:"5px 12px",color:"#9ca3af",position:"sticky",left:0,background:"var(--bg1)",fontSize:10}}>{r.name}</td>
            {r.m.map((v,j)=><td key={j} style={{padding:"5px 6px",textAlign:"right",fontFamily:"var(--fm)",fontSize:9,color:v>0?"#e5e7eb":"#1a2030"}}>{v>0?fmt(v):"—"}</td>)}
            <td style={{padding:"5px 12px",textAlign:"right",fontFamily:"var(--fm)",fontWeight:600,color:"#4ade80",fontSize:10}}>{fmt(sumArr(r.m))}</td>
          </tr>)}
          <tr style={{borderBottom:"2px solid var(--bd)",background:"#0a0e16"}}>
            <td style={{padding:"7px 12px",fontWeight:700,color:"#4ade80",position:"sticky",left:0,background:"#0a0e16"}}>Total Revenue</td>
            {mRev.map((v,i)=><td key={i} style={{padding:"7px 6px",textAlign:"right",fontFamily:"var(--fm)",fontWeight:700,color:"#4ade80",fontSize:10}}>{v>0?fmt(v):"—"}</td>)}
            <td style={{padding:"7px 12px",textAlign:"right",fontFamily:"var(--fm)",fontWeight:700,color:"#4ade80",fontSize:11}}>{fmt(totRev)}</td>
          </tr>

          <tr><td colSpan={14} style={{padding:"8px 12px",fontWeight:700,fontSize:11,color:"#f87171",background:"#080c14",borderTop:"1px solid var(--bd)"}}>COST OF PRODUCT</td></tr>
          {PL.costOfProduct.map((r,i)=><tr key={i} style={{borderBottom:"1px solid #0f1420"}}>
            <td style={{padding:"5px 12px",color:"#9ca3af",position:"sticky",left:0,background:"var(--bg1)",fontSize:10}}>{r.name}</td>
            {r.m.map((v,j)=><td key={j} style={{padding:"5px 6px",textAlign:"right",fontFamily:"var(--fm)",fontSize:9,color:v>0?"#e5e7eb":"#1a2030"}}>{v>0?fmt(v):"—"}</td>)}
            <td style={{padding:"5px 12px",textAlign:"right",fontFamily:"var(--fm)",fontWeight:600,color:"#f87171",fontSize:10}}>{fmt(sumArr(r.m))}</td>
          </tr>)}

          <tr><td colSpan={14} style={{padding:"8px 12px",fontWeight:700,fontSize:11,color:"#f87171",background:"#080c14",borderTop:"1px solid var(--bd)"}}>SERVICES</td></tr>
          {PL.services.map((r,i)=><tr key={i} style={{borderBottom:"1px solid #0f1420"}}>
            <td style={{padding:"5px 12px",color:"#9ca3af",position:"sticky",left:0,background:"var(--bg1)",fontSize:10}}>{r.name}</td>
            {r.m.map((v,j)=><td key={j} style={{padding:"5px 6px",textAlign:"right",fontFamily:"var(--fm)",fontSize:9,color:v>0?"#e5e7eb":"#1a2030"}}>{v>0?fmt(v):"—"}</td>)}
            <td style={{padding:"5px 12px",textAlign:"right",fontFamily:"var(--fm)",fontWeight:600,color:"#f87171",fontSize:10}}>{fmt(sumArr(r.m))}</td>
          </tr>)}

          <tr><td colSpan={14} style={{padding:"8px 12px",fontWeight:700,fontSize:11,color:"#f87171",background:"#080c14",borderTop:"1px solid var(--bd)"}}>EMPLOYEE COSTS</td></tr>
          {PL.employee.map((r,i)=><tr key={i} style={{borderBottom:"1px solid #0f1420"}}>
            <td style={{padding:"5px 12px",color:"#9ca3af",position:"sticky",left:0,background:"var(--bg1)",fontSize:10}}>{r.name}</td>
            {r.m.map((v,j)=><td key={j} style={{padding:"5px 6px",textAlign:"right",fontFamily:"var(--fm)",fontSize:9,color:v>0?"#e5e7eb":"#1a2030"}}>{v>0?fmt(v):"—"}</td>)}
            <td style={{padding:"5px 12px",textAlign:"right",fontFamily:"var(--fm)",fontWeight:600,color:"#f87171",fontSize:10}}>{fmt(sumArr(r.m))}</td>
          </tr>)}

          <tr style={{borderBottom:"2px solid var(--bd)",background:"#0a0e16"}}>
            <td style={{padding:"7px 12px",fontWeight:700,color:"#f87171",position:"sticky",left:0,background:"#0a0e16"}}>Total Expenses</td>
            {mExp.map((v,i)=><td key={i} style={{padding:"7px 6px",textAlign:"right",fontFamily:"var(--fm)",fontWeight:700,color:"#f87171",fontSize:10}}>{v>0?fmt(v):"—"}</td>)}
            <td style={{padding:"7px 12px",textAlign:"right",fontFamily:"var(--fm)",fontWeight:700,color:"#f87171",fontSize:11}}>{fmt(totExp)}</td>
          </tr>

          <tr style={{background:"#101624"}}>
            <td style={{padding:"10px 12px",fontWeight:700,fontSize:12,color:ebitda>=0?"#4ade80":"#f87171",position:"sticky",left:0,background:"#101624"}}>EBITDA</td>
            {mRev.map((r,i)=>{const n=r-mExp[i];return <td key={i} style={{padding:"10px 6px",textAlign:"right",fontFamily:"var(--fm)",fontWeight:700,fontSize:10,color:n>=0?"#4ade80":"#f87171"}}>{n!==0?(n<0?`(${fmt(Math.abs(n))})`:fmt(n)):"—"}</td>;})}
            <td style={{padding:"10px 12px",textAlign:"right",fontFamily:"var(--fm)",fontWeight:700,fontSize:12,color:ebitda>=0?"#4ade80":"#f87171"}}>{ebitda<0?`(${fmt(Math.abs(ebitda))})`:fmt(ebitda)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>}

{/* ═══ DRIVE SCAN / SETUP ═════════════════════════════════════════════════ */}
{page==="drive"&&<div>
  <h1 style={{fontSize:20,fontWeight:700,marginBottom:3}}>Drive Invoice Scanner</h1>
  <p style={{fontSize:12,color:"#6b7280",marginBottom:22}}>Connect Google Drive → Scan PDFs/images → Auto-extract invoice data</p>

  {!isAuthed?<div style={{background:"var(--bg1)",border:"1px solid var(--bd)",borderRadius:10,padding:22,maxWidth:500}}>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:18}}><NavIcon name="key" size={18}/><span style={{fontWeight:600,fontSize:13}}>Google API Credentials</span></div>
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <Field label="Google Cloud Client ID" value={clientId} onChange={setClientId} placeholder="xxxx.apps.googleusercontent.com"/>
      <Field label="API Key" value={apiKey} onChange={setApiKey} placeholder="AIza..."/>
      <Field label="Drive Folder ID" value={folderId} onChange={setFolderId} placeholder="Folder ID from URL"/>
      <div style={{background:"var(--bg2)",borderRadius:7,padding:12,border:"1px solid var(--bd)",marginTop:2}}>
        <div style={{fontSize:10,fontWeight:600,color:"#6b7280",marginBottom:6}}>Setup Guide</div>
        <div style={{fontSize:10,color:"#6b7280",lineHeight:1.6}}>
          <strong style={{color:"#9ca3af"}}>Credentials:</strong> console.cloud.google.com → Project → Enable Drive API → OAuth Client ID + API Key<br/>
          <strong style={{color:"#9ca3af"}}>Folder:</strong> drive.google.com/drive/folders/<span style={{color:"#fbbf24"}}>FOLDER_ID</span>
        </div>
      </div>
      {authError&&<div style={{padding:"7px 10px",background:"#2a1215",borderRadius:5,fontSize:11,color:"#f87171",border:"1px solid #450a0a"}}>{authError}</div>}
      <Btn onClick={doAuth} icon="zap" disabled={!clientId||!apiKey}>Connect to Google Drive</Btn>
    </div>
  </div>

  :<div>
    <div style={{display:"flex",gap:8,marginBottom:16,alignItems:"center"}}>
      <Field label="Folder ID" value={folderId} onChange={v=>{setFolderId(v);}} placeholder="Folder ID" small/>
      <div style={{marginTop:16,display:"flex",gap:6}}>
        <Btn onClick={listDriveFiles} variant="secondary" small icon="refresh" disabled={loadingFiles}>Refresh</Btn>
        <Btn onClick={processAll} small icon="scan" disabled={processing||pendingFiles.length===0}>{processing?"Scanning…":`Scan All (${pendingFiles.length})`}</Btn>
      </div>
    </div>
    {folderName&&<p style={{fontSize:11,color:"#6b7280",marginBottom:12}}>📁 {folderName} — {driveFiles.length} files</p>}

    {loadingFiles?<div style={{textAlign:"center",padding:50,color:"#6b7280"}}><div style={{animation:"spin 1s linear infinite",display:"inline-block",marginBottom:8}}><NavIcon name="refresh" size={22}/></div><div>Loading…</div></div>
    :driveFiles.length===0?<div style={{textAlign:"center",padding:50,color:"#4b5563"}}><NavIcon name="inbox" size={36}/><div style={{marginTop:10,fontSize:13}}>No files found</div><div style={{fontSize:11,marginTop:3}}>Upload PDFs/images to your Drive folder</div></div>
    :<div style={{display:"flex",flexDirection:"column",gap:5}}>
      {driveFiles.map(f=>{const st=extracted[f.id]?.status;const ip=processingId===f.id;const isPdf=f.mimeType==="application/pdf";
        return <div key={f.id} style={{background:"var(--bg1)",border:`1px solid ${ip?"#3b82f6":"var(--bd)"}`,borderRadius:8,padding:"10px 14px",display:"flex",alignItems:"center",gap:12,transition:"border-color 0.2s"}}>
          <div style={{width:34,height:34,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",background:isPdf?"#1e1b0f":"#0c1929",border:`1px solid ${isPdf?"#422006":"#172554"}`}}>
            <NavIcon name={isPdf?"file":"img"} size={15}/>
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:12,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{renamed[f.id]||f.name}</div>
            <div style={{fontSize:9,color:"#6b7280",display:"flex",gap:10,marginTop:1}}><span>{isPdf?"PDF":f.mimeType.split("/")[1].toUpperCase()}</span><span>{(f.size/1024).toFixed(0)}KB</span><span>{new Date(f.createdTime).toLocaleDateString("pt-PT")}</span></div>
          </div>
          {renamed[f.id]&&<Badge label={`→ ${renamed[f.id]}`} color="green"/>}
          {st==="booked"&&<Badge label="Booked" color="green"/>}
          {st==="extracted"&&<Badge label="Ready" color="amber"/>}
          {st==="error"&&<Badge label="Error" color="red"/>}
          {ip&&<Badge label="Scanning…" color="purple"/>}
          {!st&&!ip&&<Btn onClick={()=>processFile(f)} variant="secondary" small icon="scan" disabled={processing}>Extract</Btn>}
          {st==="extracted"&&<Btn onClick={()=>setPage("review")} variant="secondary" small icon="edit">Review</Btn>}
        </div>;})}
    </div>}
  </div>}
</div>}

{/* ═══ REVIEW ══════════════════════════════════════════════════════════════ */}
{page==="review"&&<div>
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
    <div><h1 style={{fontSize:20,fontWeight:700}}>Review & Confirm</h1><p style={{fontSize:12,color:"#6b7280"}}>{extractedList.length} ready to book</p></div>
    {extractedList.length>0&&<Btn onClick={bookAll} variant="success" icon="check" disabled={renaming}>{renaming?"Booking…":`Book All (${extractedList.length})`}</Btn>}
  </div>
  {extractedList.length===0&&errorList.length===0?<div style={{textAlign:"center",padding:50,color:"#4b5563"}}><NavIcon name="scan" size={36}/><div style={{marginTop:10,fontSize:13}}>Nothing to review</div><div style={{fontSize:11,marginTop:3}}>Scan files from Drive Scan tab first</div></div>
  :<div style={{display:"flex",flexDirection:"column",gap:10}}>
    {[...extractedList,...errorList].map(([fid,d])=>d.status==="error"
      ?<div key={fid} style={{background:"var(--bg1)",border:"1px solid #450a0a",borderRadius:8,padding:14}}>
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}><Badge label="Error" color="red"/><span style={{fontSize:11,color:"#9ca3af"}}>{d.fileName}</span></div>
        <div style={{fontSize:10,color:"#f87171"}}>{d.error}</div>
        <Btn onClick={()=>{const f=driveFiles.find(x=>x.id===fid);if(f)processFile(f);}} variant="danger" small icon="refresh" style={{marginTop:6}}>Retry</Btn>
      </div>
      :<div key={fid} style={{background:"var(--bg1)",border:"1px solid var(--bd)",borderRadius:8,padding:18}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <span style={{fontSize:13,fontWeight:600}}>{d.supplier||"Unknown"}</span>
            <Badge label={d.confidence||"medium"} color={d.confidence==="high"?"green":d.confidence==="low"?"red":"amber"}/>
          </div>
          <Btn onClick={()=>bookInvoice(fid)} variant="success" small icon="check" disabled={renaming}>Book & Rename</Btn>
        </div>
        <div style={{fontSize:9,color:"#374151",marginBottom:10}}>Source: {d.fileName}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8}}>
          <Field label="Supplier" value={d.supplier||""} onChange={v=>updateExtField(fid,"supplier",v)} small/>
          <Field label="NIF" value={d.nif||""} onChange={v=>updateExtField(fid,"nif",v)} small/>
          <Field label="Invoice #" value={d.invoice_number||""} onChange={v=>updateExtField(fid,"invoice_number",v)} small/>
          <Field label="Date" value={d.invoice_date||""} onChange={v=>updateExtField(fid,"invoice_date",v)} type="date" small/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginTop:8}}>
          <Field label="Net €" value={d.value_without_iva||0} onChange={v=>updateExtField(fid,"value_without_iva",v)} type="number" small/>
          <Field label="IVA" value={d.iva||0} onChange={v=>updateExtField(fid,"iva",v)} type="number" small/>
          <Field label="Total €" value={d.with_iva||0} onChange={v=>updateExtField(fid,"with_iva",v)} type="number" small/>
          <Field label="Payment" value={d.payment_method||"Banco"} onChange={v=>updateExtField(fid,"payment_method",v)} options={PAYMENT_METHODS} small/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:8}}>
          <Field label="Category" value={d.nature||""} onChange={v=>updateExtField(fid,"nature",v)} options={EXPENSE_CATEGORIES} small/>
          <Field label="Description" value={d.description||""} onChange={v=>updateExtField(fid,"description",v)} small/>
        </div>
      </div>
    )}
  </div>}
</div>}

{/* ═══ BOOKED ══════════════════════════════════════════════════════════════ */}
{page==="booked"&&<div>
  <h1 style={{fontSize:20,fontWeight:700,marginBottom:3}}>Booked from Drive</h1>
  <p style={{fontSize:12,color:"#6b7280",marginBottom:18}}>{bookedDrive.length} invoices — Total: <span style={{fontFamily:"var(--fm)",color:"#4ade80"}}>€{fmt(bookedDrive.reduce((s,b)=>s+(b.with_iva||0),0))}</span></p>
  {bookedDrive.length===0?<div style={{textAlign:"center",padding:50,color:"#4b5563"}}><NavIcon name="list" size={36}/><div style={{marginTop:10,fontSize:13}}>No invoices booked yet</div></div>
  :<div style={{background:"var(--bg1)",border:"1px solid var(--bd)",borderRadius:10,overflow:"hidden"}}>
    <table style={{width:"100%",borderCollapse:"collapse",fontSize:10}}>
      <thead><tr style={{borderBottom:"1px solid var(--bd)"}}>
        {["File","Supplier","Invoice #","Date","Net €","IVA","Total €","Category"].map(h=><th key={h} style={{padding:"8px 8px",textAlign:h.includes("€")?"right":"left",color:"#6b7280",fontWeight:600,fontSize:9,textTransform:"uppercase"}}>{h}</th>)}
      </tr></thead>
      <tbody>{bookedDrive.map((b,i)=><tr key={i} style={{borderBottom:"1px solid #0f1420"}}>
        <td style={{padding:"6px 8px"}}>{b.renamedTo?<Badge label={b.renamedTo} color="green"/>:<Badge label="no rename" color="red"/>}</td>
        <td style={{padding:"6px 8px",fontWeight:500}}>{b.supplier}</td>
        <td style={{padding:"6px 8px",fontFamily:"var(--fm)",color:"#6b7280",fontSize:9}}>{b.invoice_number}</td>
        <td style={{padding:"6px 8px",color:"#9ca3af"}}>{b.invoice_date}</td>
        <td style={{padding:"6px 8px",fontFamily:"var(--fm)",textAlign:"right"}}>€{fmt(b.value_without_iva||0)}</td>
        <td style={{padding:"6px 8px",fontFamily:"var(--fm)",textAlign:"right",color:"#6b7280"}}>€{fmt(b.iva||0)}</td>
        <td style={{padding:"6px 8px",fontFamily:"var(--fm)",textAlign:"right",fontWeight:600}}>€{fmt(b.with_iva||0)}</td>
        <td style={{padding:"6px 8px",color:"#9ca3af",fontSize:9}}>{(b.nature||"").replace("Services - ","")}</td>
      </tr>)}</tbody>
      <tfoot><tr style={{borderTop:"2px solid var(--bd)",background:"#080c14"}}>
        <td colSpan={4} style={{padding:"8px 8px",fontWeight:700,fontSize:11}}>TOTAL</td>
        <td style={{padding:"8px 8px",fontFamily:"var(--fm)",textAlign:"right",fontWeight:700,color:"#4ade80"}}>€{fmt(bookedDrive.reduce((s,b)=>s+(b.value_without_iva||0),0))}</td>
        <td style={{padding:"8px 8px",fontFamily:"var(--fm)",textAlign:"right",fontWeight:700,color:"#6b7280"}}>€{fmt(bookedDrive.reduce((s,b)=>s+(b.iva||0),0))}</td>
        <td style={{padding:"8px 8px",fontFamily:"var(--fm)",textAlign:"right",fontWeight:700,color:"#4ade80"}}>€{fmt(bookedDrive.reduce((s,b)=>s+(b.with_iva||0),0))}</td>
        <td/>
      </tr></tfoot>
    </table>
  </div>}
</div>}

        </main>
      </div>
      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes spin{to{transform:rotate(360deg)}}
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:#080c14}
        ::-webkit-scrollbar-thumb{background:#2d3548;border-radius:3px}
        select{appearance:auto}
        input::placeholder{color:#4b5563}
        input[type="date"]::-webkit-calendar-picker-indicator{filter:invert(.6)}
      `}</style>
    </div>
  );
}
