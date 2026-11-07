# Technical Specification & Architecture: Taekwondo SaaS Platform

*Automated Multi-Cam Video Analytics, Freeze-Frame Motion & School Management Platform*

## 1. Product Vision & Target Audience

A multi-tenant SaaS platform built to unify advanced video analysis (multi-camera synchronization, slow-motion, freeze-frame, and Poomsae overlay) with an all-in-one management operating system for Taekwondo academies globally.

### Key Value Pillars:

* **For Masters & Instructors:** Automated student progress tracking, technical biometrics (kick angles, form rhythm), promotional material generation (Matrix-style social snippets), and digital belt examination tools.

* **For Students & Parents:** Access to a "Digital Dojang" containing their complete martial arts journey, multi-angle practice replays, and progress reporting.

---

## 2. MVP Scope (Minimum Viable Product)

```
+-----------------------------------------------------------------------+
|                              MVP SAAS                                 |
+------------------------------------+----------------------------------+
|      Pillar 1: Video & Multi-Cam    |   Pillar 2: Coaching & SaaS Core |
+------------------------------------+----------------------------------+
| • Multi-device sync (iOS / Camera) | • Student directory & profiles   |
| • Multi-angle player with freeze   | • Technical video markup (angles)|
| • Poomsae side-by-side view        | • Stripe billing & subscriptions |
+------------------------------------+----------------------------------+
```

### 2.1 Multi-Cam & Video Module
1. **Multi-Camera Capture System:** Connect mobile devices and dedicated hardware via local Wi-Fi/NTP pulse to trigger frame-accurate simultaneous recording.
2. **Interactive Multi-Angle Player:** Web viewer allowing real-time switching between camera angles during playback, featuring angle measurement tools for knee, hip, and ankle positioning.
3. **Poomsae Training Engine:** Dual-player UI displaying Master reference footage next to student uploads.

### 2.2 School Management & Tenant Module
1. **Multi-Tenant Master Dashboard:** Manage belt ranks (Gup/Dan), class rosters, attendance, and exam schedules.
2. **Student & Parent Vault:** Personal video repository storing sparring footage, testing events, and instructor notes.

---

## 3. Technology Stack

| Layer | Technology / Tool | Rationale |
| :--- | :--- | :--- |
| **Mobile Capture** | Swift / iOS SDK (AVFoundation) | Precise camera control, high frame rates (60/120/240 fps), and HEVC compression. |
| **Frontend Web/App** | Next.js (React) + Tailwind CSS | Fast server-side rendering, responsive video players, and cross-platform access. |
| **Backend API** | Node.js (TypeScript) / NestJS | Scalable multi-tenant microservices architecture. |
| **Video Engine** | FFmpeg Workers (AWS ECS) | HLS streaming generation, overlay rendering, and multi-track audio sync. |
| **Database** | PostgreSQL (Prisma ORM) | Relational integrity for multi-school tenancy, student hierarchies, and video metadata. |
| **Storage & CDN** | Cloudflare R2 + CDN | Egress-free storage ideal for high-bandwidth video playback. |
| **Payments** | Stripe Billing | Global multi-currency subscription and invoice automation. |

---

## 4. Execution Strategy & Timeline

* **Phase 1: Validation & Testing (Weeks 1–4):** Deploy initial camera capture test during Black Belt Testing event using Master Oh’s camera setup.
* **Phase 2: MVP Platform Development (Months 2–4):** Build multi-tenant management portal, Poomsae side-by-side viewer, and Stripe integration.
* **Phase 3: Beta Release & Global Outreach (Months 5–6):** Roll out beta software across pilot schools worldwide.