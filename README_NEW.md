# 🎫 Sistema de Tickets de Soporte Técnico

Bienvenido al Sistema de Tickets de Soporte Técnico. Este sistema permite gestionar tickets de soporte técnico con autenticación de usuarios, seguimiento de tickets en tiempo real y notificaciones.

## 📋 Tabla de Contenidos
1. [Requisitos del Sistema](#-requisitos-del-sistema)
2. [Instalación Rápida](#-instalación-rápida)
3. [Configuración Detallada](#-configuración-detallada)
4. [Instalación en Windows](#-instalación-en-windows)
5. [Instalación en Linux](#-instalación-en-linux)
6. [Variables de Entorno](#-variables-de-entorno)
7. [Iniciar la Aplicación](#-iniciar-la-aplicación)
8. [Solución de Problemas Comunes](#-solución-de-problemas-comunes)
9. [Preguntas Frecuentes](#-preguntas-frecuentes)

## 🖥️ Requisitos del Sistema

### Backend:
- Node.js v16 o superior
- PostgreSQL 12 o superior
- npm 8 o superior
- Git

### Frontend:
- Node.js v16 o superior
- npm 8 o yarn
- Navegador web moderno (Chrome, Firefox, Edge, Safari)

### Dependencias del Sistema:
- Git (para clonar el repositorio)
- Un editor de código (VS Code recomendado)
- Terminal o línea de comandos

## 🚀 Instalación Rápida

Sigue estos pasos para tener el sistema funcionando en pocos minutos:

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/ilidan0160/ticket-system.git
   cd ticket-system
   ```

2. **Configurar el Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Editar el archivo .env con tus credenciales
   ```

3. **Configurar la Base de Datos**
   - Instalar PostgreSQL
   - Crear una base de datos llamada `ticket_system`
   - Configurar las credenciales en el archivo `.env`

4. **Iniciar el Backend**
   ```bash
   npm run dev
   ```

5. **Configurar el Frontend**
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env.local
   ```

6. **Iniciar el Frontend**
   ```bash
   npm start
   ```

7. **Acceder a la aplicación**
   Abre tu navegador y ve a: http://localhost:3000

## 💻 Instalación en Windows

### 1. Instalar Node.js
1. Descarga el instalador de Node.js desde [nodejs.org](https://nodejs.org/)
2. Ejecuta el instalador y sigue las instrucciones
3. Verifica la instalación:
   ```cmd
   node --version
   npm --version
   ```

### 2. Instalar PostgreSQL
1. Descarga PostgreSQL desde [postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
2. Ejecuta el instalador
3. Durante la instalación, recuerda la contraseña del usuario postgres
4. Usa pgAdmin para crear la base de datos `ticket_system`

## 🐧 Instalación en Linux (Ubuntu/Debian)

### 1. Instalar Node.js y npm
```bash
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Instalar PostgreSQL
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo -u postgres psql -c "CREATE DATABASE ticket_system;"
sudo -u postgres psql -c "CREATE USER tu_usuario WITH PASSWORD 'tu_contraseña';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ticket_system TO tu_usuario;"
```

## ⚙️ Configuración Detallada

### Variables de Entorno del Backend (backend/.env)

```env
# Puerto del servidor
PORT=5000

# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ticket_system
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña

# JWT
JWT_SECRET=tu_clave_secreta
JWT_EXPIRES_IN=30d

# Configuración de correo (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_correo@gmail.com
SMTP_PASS=tu_contraseña

# URL del frontend
FRONTEND_URL=http://localhost:3000
```

### Variables de Entorno del Frontend (frontend/.env.local)

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

## 🚀 Iniciar la Aplicación

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend (en otra terminal)
```bash
cd frontend
npm install
npm start
```

## 🛠️ Solución de Problemas Comunes

### 1. Error de conexión a la base de datos
- Verifica que PostgreSQL esté en ejecución
- Comprueba las credenciales en `.env`
- Asegúrate de que el usuario tenga permisos en la base de datos

### 2. Error al instalar dependencias
- Limpia la caché de npm:
  ```bash
  npm cache clean --force
  rm -rf node_modules
  npm install
  ```

### 3. Problemas con las migraciones
- Asegúrate de que la base de datos existe
- Verifica los permisos del usuario
- Ejecuta las migraciones manualmente:
  ```bash
  npx sequelize-cli db:migrate
  ```

## ❓ Preguntas Frecuentes

### ¿Cómo restablezco la contraseña de un usuario?
1. Conéctate a PostgreSQL:
   ```bash
   psql -U postgres
   ```
2. Ejecuta:
   ```sql
   UPDATE usuarios SET password = 'nueva_contraseña_encriptada' WHERE email = 'usuario@ejemplo.com';
   ```

### ¿Cómo hago una copia de seguridad de la base de datos?
```bash
pg_dump -U tu_usuario -d ticket_system > backup_$(date +%Y%m%d).sql
```

### ¿Cómo actualizo a la última versión?
```bash
git pull origin main
cd backend && npm install
cd ../frontend && npm install
```

## 📞 Soporte

Si necesitas ayuda, por favor:
1. Revisa la sección de [Solución de Problemas](#-solución-de-problemas-comunes)
2. Crea un issue en [GitHub](https://github.com/ilidan0160/ticket-system/issues)
3. Contacta al soporte técnico

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo `LICENSE` para más detalles.
