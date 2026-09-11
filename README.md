# SS Multi-Brand Commerce + Service Platform

A scalable, unified multi-brand digital commerce & technician service platform built for **SS Aquarium**, **Kirubai Cloud Kitchen**, and **SS Vision 360** in Coimbatore, Tamil Nadu.

---

## 🌟 Core Architecture & Principles
- **1 Codebase + 1 Shared Platform**: Zero duplicated components or parallel codebases.
- **3 Distinct Brand Experiences**:
  - 🐠 **SS Aquarium** (`/aquarium`): Deep oceanic palette, live ornamental fishes, planted aquarium accessories, custom setup & monthly tank cleaning services.
  - 🍲 **Kirubai Cloud Kitchen** (`/kirubai`): Warm appetizing culinary branding, authentic biryani meals, starters, and fast WhatsApp dispatch.
  - 🛡️ **SS Vision 360** (`/vision-360`): High-precision obsidian-slate technical design, CCTV equipment, technician wiring & repair services.
- **Product + Service Dual Model**: Seamlessly handles purchasable goods (with cart & offer pricing) and professional technician services (with direct WhatsApp inquiry forms).
- **Brand-Isolated Cart System**: Cart items never mix across businesses.
- **Dynamic WhatsApp Checkout**: Generates structured, itemized WhatsApp order messages directed to the exact phone number of the active brand.
- **Unified Admin Suite (`/admin`)**: Centralized administrative panel to manage brand configurations, categories, products/services with multi-image gallery support, and promotional hero banners.

---

## 🛠️ Tech Stack
- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Custom Brand CSS Tokens
- **Icons**: Lucide React
- **State Management**: Zustand (with LocalStorage multi-cart persistence)
- **Database / Backend**: PostgreSQL / Supabase Schema with Row Level Security (RLS) + In-Memory Fallback Engine for zero-cost operation
- **Hosting**: Vercel Managed Edge (Free Tier Compatible)

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Locally in Development Mode
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the Central Platform Portal Hub.

### 3. Build for Production
```bash
npm run build
npm run start
```

---

## 🛡️ Admin Access
Navigate to [http://localhost:3000/admin](http://localhost:3000/admin) and enter:
- **Default Master Key**: `admin123` or `SS2026` or `9791719662`

---

## 📂 Adding a 4th Brand in the Future
To add a 4th brand (e.g. `ss-auto-care`):
1. Open `src/config/brands.ts` and add your new brand object to `BRANDS`.
2. Add initial categories to `INITIAL_CATEGORIES`.
3. Add initial products/services to `INITIAL_CATALOG_ITEMS`.
4. The platform will automatically generate all routes (`/ss-auto-care`, `/ss-auto-care/catalog`, `/ss-auto-care/cart`, `/ss-auto-care/contact`, `/ss-auto-care/products/[slug]`), navigation, sitemaps, and admin panel controls!
