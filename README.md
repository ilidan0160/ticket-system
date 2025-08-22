# 🎫 Sistema de Tickets de Soporte Técnico

Sistema de gestión de tickets de soporte técnico con autenticación, seguimiento en tiempo real y notificaciones. Desarrollado con React, Node.js, Express y PostgreSQL.

## 🌟 Características Principales

- Gestión de tickets con seguimiento de estado
- Autenticación y autorización de usuarios
- Interfaz de usuario moderna con Material-UI
- Comunicación en tiempo real con Socket.IO
- Panel de administración completo
- Generación de reportes y estadísticas

## 🚀 Empezando

### Requisitos Previos

- Node.js 16+ y npm 8+
- PostgreSQL 12+
- Git

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/ilidan0160/ticket-system.git
   cd ticket-system
   ```

2. **Configurar la base de datos**
   ```bash
   # Crear base de datos
   sudo -u postgres createdb ticket_system
   
   # Crear usuario (opcional)
   sudo -u postgres createuser -P ticket_user
   ```

3. **Configurar el backend**
   ```bash
   cd backend
   cp .env.example .env
   # Editar .env con tus credenciales
   npm install
   ```

4. **Configurar el frontend**
   ```bash
   cd ../frontend
   cp .env.example .env.local
   # Editar .env.local si es necesario
   npm install
   ```

### Iniciar la aplicación

1. **Iniciar el backend** (en una terminal)
   ```bash
   cd backend
   npm run dev
   ```

2. **Iniciar el frontend** (en otra terminal)
   ```bash
   cd frontend
   npm start
   ```

3. **Acceder a la aplicación**
   Abre tu navegador en: http://localhost:3000

## 🔑 Credenciales por Defecto

**Usuario administrador:**
- Email: admin@example.com
- Contraseña: admin123

**Usuario estándar:**
- Email: user@example.com
- Contraseña: user123

## 🛠️ Tecnologías Utilizadas

### Backend
- Node.js y Express
- PostgreSQL con Sequelize ORM
- JWT para autenticación
- Socket.IO para comunicación en tiempo real
- Winston para logging
- Telegraf para notificaciones

### Frontend
- React 18 con TypeScript
- Redux Toolkit para gestión de estado
- Material-UI para componentes de interfaz
- React Router para navegación
- Formik y Yup para formularios
- Recharts para gráficos

## 📦 Dependencias Principales

### Backend
```json
{
  "express": "^4.18.2",
  "sequelize": "^6.31.0",
  "pg": "^8.9.0",
  "jsonwebtoken": "^9.0.0",
  "socket.io": "^4.6.1",
  "bcryptjs": "^2.4.3",
  "dotenv": "^16.0.3"
}
```

### Frontend
```json
{
  "react": "^18.2.0",
  "@reduxjs/toolkit": "^1.9.7",
  "@mui/material": "^5.15.10",
  "react-router-dom": "^6.15.0",
  "formik": "^2.4.6",
  "yup": "^1.7.0",
  "axios": "^1.4.0"
}
```

## 🔍 Solución de Problemas

### Error de conexión a la base de datos
- Verifica que PostgreSQL esté en ejecución
- Revisa las credenciales en `.env`
- Asegúrate de que el usuario tenga los permisos necesarios

### Problemas de dependencias
```bash
# En ambas carpetas (backend y frontend)
rm -rf node_modules package-lock.json
npm install
```

### Conflictos de puertos
- Backend: 5000
- Frontend: 3000

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor, lee nuestras pautas de contribución antes de enviar pull requests.

## 📧 Contacto

¿Preguntas o comentarios? Abre un issue en el repositorio.
