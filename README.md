# 🎫 Sistema de Tickets de Soporte Técnico

Bienvenido al Sistema de Tickets de Soporte Técnico. Este sistema permite gestionar tickets de soporte técnico con autenticación de usuarios, seguimiento de tickets en tiempo real y notificaciones. 
**NUEVO**: Ahora incluye capacidades de IA para la generación automática de reportes ejecutivos.

## 🌟 Características Principales

- Gestión de tickets con seguimiento de estado
- Autenticación y autorización de usuarios
- Interfaz de usuario moderna con Material-UI
- Comunicación en tiempo real con Socket.IO
- Panel de administración completo
- Generación de reportes y estadísticas apoyado en **Inteligencia Artificial (Gemini)**
- **Despliegue simplificado con Docker**

## 🐳 Inicio Rápido con Docker (Recomendado)

La forma más sencilla de ejecutar la aplicación es utilizando Docker Compose. Esto iniciará la base de datos, el backend y el frontend de forma automática.

### Requisitos
- Docker y Docker Compose instalados

### Pasos
1. Clona el repositorio:
   ```bash
   git clone https://github.com/ilidan0160/ticket-system.git
   cd ticket-system
   ```
2. Configura las variables de entorno en la raíz del proyecto (Docker usa este archivo):
   ```bash
   cp backend/.env.example .env
   # Edita el archivo .env en la raíz y agrega tu GEMINI_API_KEY
   ```
3. Ejecuta Docker Compose:
   ```bash
   docker-compose up --build
   ```
4. Accede a la aplicación:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 💻 Instalación Manual

Si prefieres no usar Docker, sigue estos pasos:

### 1. Configurar la Base de Datos
   - Instala PostgreSQL y crea una base de datos llamada `ticket_system`
   - Configura las credenciales en el archivo `backend/.env`

### 2. Configurar el Backend
   ```bash
   cd backend
   npm install
   # Recuerda agregar GEMINI_API_KEY en .env
   npm run dev
   ```

### 3. Configurar el Frontend
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env.local
   npm start
   ```

## ⚙️ Variables de Entorno Destacadas (backend/.env)

```env
# Puerto del servidor
PORT=5000

# Base de datos
DB_HOST=localhost # o 'db' si usas Docker
DB_PORT=5432
DB_NAME=ticket_system
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña

# Inteligencia Artificial (NUEVO)
GEMINI_API_KEY=tu_api_key_de_gemini
```

## 🤖 Uso de Reportes con Inteligencia Artificial

El sistema cuenta con un nuevo endpoint `GET /api/tickets/ai-report` (requiere permisos de admin/tecnico). Este endpoint utiliza `@google/genai` para resumir la carga de trabajo actual de los tickets abiertos y recomendar planes de acción.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.
