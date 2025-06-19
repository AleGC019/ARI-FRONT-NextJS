# 🚀 RiskConverter - Sistema de Conversión Segura de Archivos

<div align="center">

**Una aplicación moderna de conversión de archivos con cifrado empresarial**

[![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-GPL%203.0-green?style=for-the-badge)](LICENSE)

</div>

---

## 📖 Descripción General

**RiskConverter** es una aplicación web moderna desarrollada con Next.js 15 que permite la conversión segura entre formatos de archivo TXT, JSON y XML con capacidades de cifrado empresarial. La aplicación cuenta con una interfaz de usuario elegante con efectos glassmorphism y un sistema de diseño completo en tema oscuro.

### 🎯 **Características Principales**

- 🔄 **Conversión de archivos**: TXT ↔ JSON ↔ XML
- 🔐 **Cifrado seguro**: Algoritmos de cifrado empresarial
- 📁 **Gestión de archivos**: Selección de carpetas de destino con File System Access API
- 🎨 **UI moderna**: Tema oscuro con efectos glassmorphism
- 🌐 **Interfaz bilingüe**: Soporte completo en español
- 📱 **Diseño responsivo**: Optimizado para todos los dispositivos
- ⚡ **Rendimiento**: Optimización avanzada con Next.js 15

---

## 🛠️ Stack Tecnológico

### **Frontend**
- **[Next.js 15](https://nextjs.org/)** - Framework React con App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Tipado estático y seguridad
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Estilos utility-first
- **[Framer Motion](https://www.framer.com/motion/)** - Animaciones fluidas
- **[Radix UI](https://www.radix-ui.com/)** - Componentes headless
- **[Zustand](https://zustand-demo.pmnd.rs/)** - Gestión de estado ligero

### **APIs y Herramientas**
- **File System Access API** - Gestión avanzada de archivos
- **Web Crypto API** - Cifrado del lado del cliente
- **Lucide React** - Sistema de iconos consistente
- **Sonner** - Notificaciones toast elegantes

---

## 🚀 Instalación y Configuración

### **Prerrequisitos**

Asegúrate de tener instalado:
- **Node.js** >= 18.0.0
- **npm**, **yarn**, **pnpm** o **bun**
- Navegador moderno con soporte para File System Access API

### **1. Clonar el Repositorio**

```bash
git clone https://github.com/tu-usuario/ARI-FRONT-NextJS.git
cd ARI-FRONT-NextJS/ari-client-nextjs

# Con npm
npm install

# Con yarn
yarn install

# Con pnpm
pnpm install

# Con bun
bun install

# URL del backend API
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001

# Entorno de desarrollo
NODE_ENV=development

# Configuración de depuración (solo desarrollo)
NEXT_PUBLIC_DEBUG_MODE=true

# Con npm
npm run dev

# Con yarn
yarn dev

# Con pnpm
pnpm dev

# Con bun
bun dev
