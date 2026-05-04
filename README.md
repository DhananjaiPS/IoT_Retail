# Smart Dukan: Autonomous Edge-to-Cloud Retail Infrastructure

> 🚀 **“A real-time IoT-powered smart shopping cart that eliminates checkout lines and brings Amazon-like intelligence to physical retail.”**

[![Next.js 15+](https://img.shields.io/badge/Next.js-15+-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![IoT](https://img.shields.io/badge/IoT-ESP8266-E33332?style=for-the-badge&logo=espressif&logoColor=white)](https://www.espressif.com/)
[![AI](https://img.shields.io/badge/AI-Gemini_Flash-4285F4?style=for-the-badge&logo=google-gemini&logoColor=white)](https://deepmind.google/technologies/gemini/)

---

## 📺 Project Demo
**[Watch the Live Demo on YouTube](https://youtu.be/ExY-FNohTgM?si=aE8DaqCZEBmcMX2W)** 🎬

---

## 🏆 Awards & Recognition
*   **🥈 2nd Prize Winner** - *TechXthone Hackathon*, MIT Moradabad.
*   **📄 Best Paper Award** - *International IIR 5.0 Conference*, for innovative contributions to AI-driven retail automation and IoT-edge synchronization.

---

## 📄 Research & Publications
This project is backed by a comprehensive technical research paper detailing the sub-100ms synchronization protocols and AI recommendation heuristics.
*   **[Download Technical Research Paper (PDF)](https://drive.google.com/file/d/1I5Y4ffGPG9Y2ffkuPXrIbr_Ac_e6Q8zG/view?usp=drive_link)** 🔗

---

## 🧠 What Smart Dukan Demonstrates
This repository isn't just a web app; it's a demonstration of production-level engineering:
*   **Full-Stack System Design:** Complex state orchestration between hardware and web.
*   **Computer Vision at the Edge:** Real-time product detection using MobileNet SSD.
*   **Real-time Edge Computing:** Sub-100ms sync using raw WebSockets.
*   **AI Orchestration:** Hybrid RAG pattern for personalized recommendations.
*   **Production Standards:** Financial integrity through price snapshotting and atomic DB operations.

---

## 🏗 System Architecture

```mermaid
graph TD
    subgraph "Edge Layer (IoT Hardware)"
        RFID[RFID Readers/Tags] -->|SPI| MCU[ESP8266/ESP32]
        LOAD[Load Cells] --> MCU
        DHT[DHT11 Sensors] --> MCU
        CAM[ESP32-CAM] -->|Vision| CV[MobileNet SSD Pipeline]
        CV --> MCU
    end

    subgraph "Communication"
        MCU <-->|WebSocket Port 81| WS_SYNC[Real-time Sync Hook]
    end

    subgraph "Cloud Layer (Next.js)"
        WS_SYNC -->|State Update| CART[useCartState]
        CART -->|Bounded Retrieval| GEMINI[Gemini Reranking Engine]
        UI[React 19 Dashboard] -->|Prisma| DB[(PostgreSQL)]
        UI -->|Stripe| PAY[Payment Gateway]
    end
```

---

## 🚀 Key Technical Features

### 1. Computer Vision Inference Pipeline
We engineered a lightweight CV pipeline using **MobileNet SSD** achieving **81.4% accuracy** for real-time product detection.
*   **Optimization:** Optimized for low-latency inference on edge devices (ESP32-CAM).
*   **Impact:** Eliminates product misplacement and provides a second layer of verification for RFID scans.

### 2. Sub-100ms Hardware-Software Sync
Using **Raw WebSockets**, we achieve near-instantaneous synchronization between the physical cart and the Next.js dashboard.
*   **Automation:** Automated billing workflows with instant invoice generation the moment a customer scans their final item.

### 3. Smart Inventory Intelligence
*   **Load Cells & Sensors:** Integrated weight-sensing and environmental monitoring (DHT11) to ensure item integrity and detect anomalies.
*   **AI Pairings:** Leveraging Gemini 1.5 Flash to provide "Smart Pairings" based on real-time cart heuristics.

---

## ⚙️ Tech Stack

| Category | Technology |
| :--- | :--- |
| **Frontend** | React 19, Next.js 15+, Tailwind 4, Framer Motion |
| **Backend** | Next.js API Routes (Stateless), Prisma ORM |
| **IoT** | ESP8266, ESP32, ESP32-CAM, RFID, Load Cells, DHT11 |
| **Computer Vision** | MobileNet SSD (81.4% Accuracy) |
| **Database** | PostgreSQL (Neon Serverless) |
| **AI** | Google Gemini 1.5 Flash (RAG Implementation) |

---

## 👥 Core Team

| Member | Role | Socials |
| :--- | :--- | :--- |
| **Dhananjai Pratap Singh** | **Project Leader** | [GitHub](https://github.com/dhananjai) \| [LinkedIn](https://www.linkedin.com/in/dhananjaips/) |
| **Rachi Singh** | **Frontend Lead** | [GitHub](https://github.com/rachi-04) \| [LinkedIn](https://www.linkedin.com/in/rachi-singh-74886a1b8/) |
| **Simra Sarfraz** | **AI & ML Lead** | [GitHub](#) \| [LinkedIn](#) |
| **Shivi Yadav** | **Backend Lead** | [GitHub](#) \| [LinkedIn](#) |

---

## 🛠 Setup & Installation

```bash
# 1. Clone & Install
git clone https://github.com/dhananjai/iot_retail.git
npm install

# 2. Configure Environment
cp .env.example .env # Set CLERK, STRIPE, & GEMINI keys

# 3. Database Migration
npx prisma generate
npx prisma db push

# 4. Launch Edge Sync
npm run dev
```

---
*Authored with 💻 for FAANG-level Engineering Standards.*
