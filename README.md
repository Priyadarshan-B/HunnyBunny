# 🍞 Bakery Billing & Inventory Management System

A full-stack web and desktop application to streamline bakery operations, built with **React.js**, **Node.js**, **Express.js**, **MongoDB**, and **Electron.js**.

---

## 🚀 Features

- ✅ **QR Code-Based Billing**: Scan product QR codes to generate instant bills.
- 🧾 **Bill History & Printing**: View, filter, and print past bills with detailed information.
- 📦 **Inventory Management**: Auto-decrease stock count upon billing, with alerts for low stock.
- 📅 **Expiry Monitoring**: Alerts for expired or near-expiry products to reduce waste.
- 🏷️ **QR Sticker Generator**: Generate product stickers with expiry/manufacture info and unique QR codes.
- 📊 **Dashboard**: Monitor total stock, sold items, low stock alerts, and per-branch analytics.
- 👨‍🍳 **Multi-Branch Support**: Manage and monitor inventory across 4 bakery branches.
- 👥 **Employee Attendance Tracking**: Mark and view daily attendance of staff.
- 🖥️ **Desktop App**: Electron-based app for local billing and scanning at counter systems.

---

## 📁 Tech Stack

### 🌐 Web Application
- **Frontend**: React.js, Tailwind CSS, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)

### 💻 Desktop Application
- **Framework**: Electron.js
- **Integration**: Electron <--> Express API

---

## 📷 Sample Screenshots

> *(Add screenshots here of: dashboard, QR sticker, bill generation, and attendance)*

---

## 🛠️ Setup Instructions

### 🔧 Backend

```bash
cd mongo_backend
npm install
nodemon app.js / node app.js
```

### 📱Frontend

```bash
cd frontend
npm install
npm run dev
```
---
### 📂 Folder Structure

```bash
root/
│
├── backend/         # Express.js API
├── frontend/        # React.js client
├── main.js/    # Electron-based desktop app
└── README.md
```
---
### ⚙️ Developed By
- Jothshana S M
- Priyadarshan B
