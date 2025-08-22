# 🎫 Sistema de Tickets de Soporte Técnico

Bienvenido al Sistema de Tickets de Soporte Técnico. Esta guía te ayudará a instalar y configurar la aplicación paso a paso, incluso si no tienes experiencia previa en programación.

## 📋 Tabla de Contenidos
1. [Requisitos del Sistema](#-requisitos-del-sistema)
2. [Dependencias del Backend](#-dependencias-del-backend)
3. [Optimizaciones Recientes](#-optimizaciones-recientes)
4. [Instalación en Windows](#-instalación-en-windows)
5. [Instalación en Linux](#-instalación-en-linux)
6. [Configuración del Sistema](#-configuración-del-sistema)
7. [Uso de la Aplicación](#-cómo-usar-la-aplicación)
8. [Solución de Problemas](#-solución-de-problemas)
9. [Obtener Ayuda](#-obtener-ayuda)

## 🖥️ Requisitos del Sistema

### Backend:
- Node.js v16 o superior
- PostgreSQL 12 o superior
- npm 8 o superior

### Frontend:
- Node.js v16 o superior
- npm 8 o yarn
- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- Conexión a internet para cargar recursos CDN

### Dependencias del Frontend:
```bash
# Dependencias principales
@emotion/react: ^11.11.1
@emotion/styled: ^11.11.0
@mui/icons-material: ^5.11.16
@mui/material: ^5.13.5
@mui/x-data-grid: ^6.11.2
@reduxjs/toolkit: ^1.9.5
@types/react: ^18.2.6
@types/react-dom: ^18.2.4
react: ^18.2.0
react-dom: ^18.2.0
react-redux: ^8.0.5
react-router-dom: ^6.10.0
react-scripts: 5.0.1
typescript: ^4.9.5

# Dependencias de desarrollo
@types/node: ^16.18.31
@types/react-router-dom: ^5.3.3
@typescript-eslint/eslint-plugin: ^5.59.0
@typescript-eslint/parser: ^5.59.0
eslint: ^8.38.0
eslint-plugin-react: ^7.32.2
eslint-plugin-react-hooks: ^4.6.0
```

### Instalación de dependencias del frontend:
```bash
cd frontend
npm install
# o si usas yarn
yarn install

## ✨ Características Principales

- **Gestión de Tickets**
  - Creación, seguimiento y cierre de tickets
  - Asignación a técnicos
  - Sistema de prioridades y categorías
  - Historial completo de cambios

- **Estadísticas en Tiempo Real**
  - Panel de control con métricas clave
  - Gráficos de tendencias
  - Tiempos de resolución promedio
  - Distribución por departamento y estado

- **Notificaciones**
  - Integración con Telegram
  - Notificaciones en tiempo real
  - Historial de actividades

- **Seguridad**
  - Autenticación JWT
  - Control de acceso basado en roles
  - Validación de datos en frontend y backend
  - Protección contra ataques comunes

## 📦 Dependencias del Backend

### Dependencias Principales (Producción):
```bash
npm install express sequelize pg pg-hstore jsonwebtoken bcryptjs cors dotenv helmet morgan express-validator axios
```

### Dependencias de Desarrollo:
```bash
npm install --save-dev nodemon sequelize-cli jest supertest cross-env
```

### Variables de Entorno Requeridas:
```env
# Configuración de la Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ticket_system
DB_USER=ticket_user
DB_PASS=ticket123

# Configuración del Servidor
PORT=5000
NODE_ENV=production

# JWT
JWT_SECRET=tu_clave_secreta_aqui
JWT_EXPIRE=30d

# Configuración de Email (opcional para notificaciones)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=tu_email@example.com
SMTP_PASS=tu_contraseña

# Telegram (opcional para notificaciones)
TELEGRAM_BOT_TOKEN=tu_token_aqui
TELEGRAM_CHAT_ID=tu_chat_id
```

## 🚀 Optimizaciones Recientes

### Backend
- **Optimización de Consultas de Estadísticas**
  - Implementación de índices en campos clave para acelerar las consultas
  - Reducción del número de consultas a la base de datos mediante agregaciones
  - Sistema de caché con TTL de 5 minutos para estadísticas frecuentes
  - Manejo de transacciones para garantizar la consistencia de datos
  - Mejora en el manejo de errores con respaldo de caché

### Frontend
- **Mejoras en la Interfaz de Usuario**
  - Tipado TypeScript estricto en componentes críticos
  - Mejora en el manejo de estados y actualizaciones en tiempo real
  - Optimización del rendimiento de componentes con React.memo
  - Mejor manejo de errores y estados de carga

### Seguridad
- Validación mejorada de entradas en el backend
- Protección contra inyección SQL
- Manejo seguro de tokens JWT
- Configuración de CORS adecuada
- Uso de Helmet para cabeceras de seguridad HTTP

## 🖥️ Instalación del Backend

### Para Windows 10/11:
1. **Windows 10 (64-bit) o superior**
2. **Node.js** (v16 o superior) - [Descargar Node.js](https://nodejs.org/es/download/)
   - Haz doble clic en el archivo descargado
   - Sigue el asistente de instalación
   - Marca la casilla "Automatically install the necessary tools"
   - Haz clic en "Siguiente" hasta completar la instalación

3. **Git** - [Descargar Git para Windows](https://git-scm.com/download/win)
   - Ejecuta el instalador
   - Haz clic en "Siguiente" en todas las ventanas
   - Usa las opciones por defecto
   - Haz clic en "Instalar"

4. **PostgreSQL** - [Descargar PostgreSQL](https://www.postgresql.org/download/windows/)
   - Descarga el instalador de PostgreSQL para Windows
   - Ejecuta el instalador
   - Sigue el asistente de instalación
   - Configura el puerto por defecto (5432)
   - Establece una contraseña para el usuario 'postgres'
   - Mantén las opciones por defecto para los demás pasos
   - Completa la instalación

5. **Configurar la base de datos**
   - Abre "SQL Shell (psql)" desde el menú de inicio
   - Presiona Enter para los valores por defecto hasta que te pida la contraseña
   - Ingresa la contraseña que configuraste durante la instalación
   - Ejecuta los siguientes comandos:
   ```sql
   CREATE USER ticket_user WITH PASSWORD 'ticket123';
   CREATE DATABASE ticket_system OWNER ticket_user;
   GRANT ALL PRIVILEGES ON DATABASE ticket_system TO ticket_user;
   \q
   ```

5. **Editor de Código** (Recomendado)
   - [Visual Studio Code](https://code.visualstudio.com/download)
   - Descarga la versión para Windows
   - Ejecuta el instalador
   - Acepta los términos y haz clic en "Siguiente"
   - Marca "Crear icono en el escritorio"
   - Haz clic en "Instalar"

### Para Linux (Ubuntu/Debian 20.04/22.04):

1. **Abrir la Terminal**
   - Presiona `Ctrl + Alt + T` en tu teclado

2. **Instalar PostgreSQL**
   ```bash
   sudo apt update
   sudo apt install -y postgresql postgresql-contrib
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   ```

3. **Configurar PostgreSQL**
   ```bash
   # Crear usuario para la aplicación
   sudo -u postgres createuser --createdb --login -P ticket_user
   # Cuando te lo pida, ingresa la contraseña: ticket123
   
   # Crear base de datos
   sudo -u postgres createdb -O ticket_user ticket_system
   
   # Otorgar permisos
   sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ticket_system TO ticket_user;"
   ```

2. **Instalar Node.js y npm**
   ```bash
   # Actualizar lista de paquetes
   sudo apt update
   
   # Instalar Node.js y npm
   curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Verificar instalación (debe mostrar la versión)
   node --version
   npm --version
   ```

3. **Instalar Git**
   ```bash
   sudo apt install -y git
   git --version
   ```

4. **Configuración Adicional de PostgreSQL**
   ```bash
   # Instalar herramientas adicionales de PostgreSQL
   sudo apt install -y postgresql-client-common postgresql-client
   
   # Configurar acceso remoto (opcional)
   sudo nano /etc/postgresql/*/main/pg_hba.conf
   ```
   - Agrega esta línea para permitir conexiones locales sin contraseña:
     ```
     local   all             all                                     trust
     ```
   - Recarga la configuración: `sudo systemctl restart postgresql`

5. **Instalar Editor de Código (Opcional)**
   ```bash
   # Instalar VS Code
   sudo apt install -y wget
   wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
   sudo install -o root -g root -m 644 packages.microsoft.gpg /usr/share/keyrings/
   sudo sh -c 'echo "deb [arch=amd64,arm64,armhf signed-by=/usr/share/keyrings/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list'
   rm -f packages.microsoft.gpg
   sudo apt update
   sudo apt install -y code
   ```

## 🚀 Instalación del Sistema de Tickets

### 1. Descargar el Código Fuente

**Windows:**
1. Abre el Explorador de archivos
2. Ve a la carpeta donde quieras guardar el proyecto (por ejemplo, Documentos)
3. Haz clic derecho y selecciona "Abrir en terminal" o "Abrir en Git Bash"
4. Copia y pega estos comandos:
   ```bash
   git clone https://github.com/ilidan0160/ticket-system.git
   cd ticket-system
   ```

**Linux:**
```bash
# Navegar a la carpeta de inicio
cd ~

# Descargar el código fuente
git clone https://github.com/ilidan0160/ticket-system.git

# Entrar a la carpeta del proyecto
cd ticket-system
```

### 2. Configurar el Backend

**Windows:**
1. Abre el menú Inicio
2. Escribe "cmd" y haz clic derecho en "Símbolo del sistema"
3. Selecciona "Ejecutar como administrador"
4. Navega a la carpeta del backend:
   ```
   cd C:\Users\TuUsuario\Documents\ticket-system\backend
   ```
   (Reemplaza "TuUsuario" con tu nombre de usuario de Windows)

**Linux:**
```bash
cd ~/ticket-system/backend
```

**En ambos sistemas, continúa con:**

5. Instalar dependencias y verificar seguridad:
   ```bash
   # Instalar dependencias
   npm install
   
   # Verificar vulnerabilidades
   npm audit
   
   # Si hay vulnerabilidades, actualizar paquetes afectados
   npm update --save-dev
   
   # Para vulnerabilidades críticas, actualizar paquetes específicos
   # Ejemplo: npm install nombre-paquete@latest --save-dev
   
   # Verificar nuevamente
   npm audit
   ```
   
   > **Nota de Seguridad**: Es importante mantener las dependencias actualizadas para corregir vulnerabilidades conocidas. Se recomienda ejecutar `npm audit` regularmente.

6. Copiar archivo de configuración:
   ```bash
   # Windows
   copy .env.example .env
   
   # Linux
   cp .env.example .env
   ```

7. Editar configuración:
   - Abre el archivo `.env` con el Bloc de notas (Windows) o nano (Linux)
   - Busca y actualiza estas líneas con tus datos (para PostgreSQL):
     ```
     # Configuración de PostgreSQL
     DB_HOST=localhost
     DB_PORT=5432
     DB_NAME=ticket_system
     DB_USER=ticket_user
     DB_PASSWORD=ticket123
     DB_DRIVER=postgres
     ```
   - Guarda los cambios

### 3. Verificar la Conexión a PostgreSQL

**Windows:**
1. Abre "pgAdmin" desde el menú Inicio
2. En el navegador de objetos, haz clic derecho en "Servers" > "Create" > "Server..."
3. En la pestaña "General", ingresa un nombre (ej: "Ticket System")
4. En la pestaña "Connection":
   - Host name/address: localhost
   - Port: 5432
   - Maintenance database: postgres
   - Username: postgres
   - Password: [la contraseña que configuraste durante la instalación]
5. Haz clic en "Save"
6. Haz clic derecho en el servidor y selecciona "Query Tool"
7. Ejecuta `SELECT 'Conexión exitosa' AS mensaje;` para verificar la conexión

**Linux:**
```bash
# Verificar que el servicio esté activo
sudo systemctl status postgresql

# Conectarse a PostgreSQL
psql -h localhost -U ticket_user -d ticket_system
# Ingresa la contraseña: ticket123

# Dentro de psql, ejecuta:
SELECT 'Conexión exitosa' AS mensaje;
\q
```
```

### 4. Configurar el Frontend

1. Abre una nueva terminal o ventana de comandos
2. Navega a la carpeta del frontend:
   ```bash
   # Windows
   cd C:\Users\TuUsuario\Documents\ticket-system\frontend
   
   # Linux
   cd ~/ticket-system/frontend
   ```

3. Instalar dependencias:
   ```bash
   npm install
   ```

4. Copiar archivo de configuración:
   ```bash
   # Windows
   copy .env.example .env.local
   
   # Linux
   cp .env.example .env.local
   ```

5. Verifica que el archivo `.env.local` tenga esta línea:
   ```
   REACT_APP_API_URL=http://localhost:5000
   ```

## 🚀 Iniciar la Aplicación

### 1. Iniciar el Servidor Backend

**Terminal 1 - Backend**
```bash
# Windows
cd C:\Users\TuUsuario\Documents\ticket-system\backend
npm run dev

# Linux
cd ~/ticket-system/backend
npm run dev
```

Deberías ver un mensaje como: "Servidor corriendo en el puerto 5000"

### 2. Iniciar el Frontend

**Terminal 2 - Frontend**
```bash
# Windows
cd C:\Users\TuUsuario\Documents\ticket-system\frontend
npm start

# Linux
cd ~/ticket-system/frontend
npm start
```

Esto abrirá automáticamente tu navegador en:
```
http://localhost:3000
```

## 📱 Primeros Pasos

1. **Registrar un Nuevo Usuario**
   - Haz clic en "Registrarse"
   - Completa el formulario con tus datos
   - Haz clic en "Crear Cuenta"

2. **Iniciar Sesión**
   - Ve a `http://localhost:3000/login`
   - Ingresa tu correo y contraseña
   - Haz clic en "Iniciar Sesión"

3. **Crear un Nuevo Ticket**
   - Haz clic en "Nuevo Ticket"
   - Completa el formulario con los detalles del problema
   - Adjunta archivos si es necesario
   - Haz clic en "Enviar"

## 🔍 Solución de Problemas Comunes

### No se puede conectar a la base de datos
- Verifica que MySQL esté en ejecución
- Comprueba las credenciales en `.env`
- Asegúrate de que el usuario tenga permisos

### Error de puertos
- El backend usa el puerto 5000
- El frontend usa el puerto 3000
- Verifica que no haya otros programas usando estos puertos

### Errores de dependencias
- Ejecuta `npm install` en ambas carpetas (backend y frontend)
- Si persiste, intenta borrar `node_modules` y `package-lock.json` y vuelve a instalar

## 📞 Obtener Ayuda

Si necesitas ayuda:
1. Revisa la sección de problemas en GitHub
2. Si no encuentras una solución, crea un nuevo issue
3. Proporciona la mayor cantidad de detalles posible, incluyendo:
   - Sistema operativo
   - Pasos para reproducir el error
   - Mensajes de error completos

## 📝 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🚀 Instalación Paso a Paso

### 1. Clonar el Repositorio

**Windows:**
1. Abre el Explorador de Archivos
2. Ve a la carpeta donde quieras guardar el proyecto
3. Haz clic derecho y selecciona "Git Bash Here"
4. Ejecuta:
   ```bash
   git clone https://github.com/ilidan0160/ticket-system.git
   cd ticket-system
   ```

**Linux:**
```bash
git clone https://github.com/ilidan0160/ticket-system.git
cd ticket-system
```

### 2. Configurar el Backend

**Windows:**
1. Abre el Símbolo del sistema (CMD) como administrador
2. Navega a la carpeta del backend:
   ```
   cd C:\ruta\al\proyecto\ticket-system\backend
   ```
3. Instala dependencias:
   ```
   npm install
   ```
4. Copia el archivo de configuración:
   ```
   copy .env.example .env
   ```
5. Edita el archivo `.env` con tus credenciales de MySQL

**Linux:**
```bash
cd backend
npm install
cp .env.example .env
nano .env  # Edita el archivo con tus credenciales
```

### 3. Configurar la Base de Datos

**Windows:**
1. Abre MySQL Workbench
2. Conéctate al servidor local
3. Crea una nueva base de datos:
   ```sql
   CREATE DATABASE ticket_system;
   ```

**Linux:**
```bash
sudo mysql -u root -p
```
```sql
CREATE DATABASE ticket_system;
EXIT;
```

### 4. Configurar el Frontend

**Windows/Linux:**
1. Abre una nueva terminal
2. Navega a la carpeta frontend:
   ```
   cd frontend
   ```
3. Instala dependencias:
   ```
   npm install
   ```
4. Copia el archivo de configuración:
   ```
   copy .env.example .env.local
   ```
   (En Linux: `cp .env.example .env.local`)

## 🏃 Ejecutar la Aplicación

### 1. Iniciar el Backend

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

### 2. Iniciar el Frontend

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### 3. Acceder a la Aplicación

Abre tu navegador web y visita:
```
http://localhost:3000
```

## 🔍 Solución de Problemas Comunes

### No se puede conectar a la base de datos
- Verifica que MySQL esté en ejecución
- Comprueba las credenciales en `.env`
- Asegúrate de que el usuario tenga permisos

### Error de puertos
- El backend usa el puerto 5000
- El frontend usa el puerto 3000
- Verifica que no haya otros programas usando estos puertos

### Errores de dependencias
- Ejecuta `npm install` en ambas carpetas (backend y frontend)
- Si persiste, intenta borrar `node_modules` y `package-lock.json` y vuelve a instalar

## 📞 Soporte

Si necesitas ayuda, por favor:
1. Revisa la sección de problemas en GitHub
2. Si no encuentras una solución, crea un nuevo issue
3. Proporciona la mayor cantidad de detalles posible, incluyendo:
   - Sistema operativo
   - Pasos para reproducir el error
   - Mensajes de error completos

## 📝 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Configuración Inicial

### Backend

1. Instalar dependencias:
   ```bash
   cd backend
   npm install
   ```

2. Configurar variables de entorno:
   ```bash
   cp .env.example .env
   # Editar el archivo .env con tus credenciales
   ```

3. Ejecutar migraciones:
   ```bash
   npx sequelize-cli db:migrate
   ```

4. Iniciar el servidor:
   ```bash
   npm run dev
   ```

### Frontend

1. Instalar dependencias:
   ```bash
   cd frontend
   npm install
   ```

2. Configurar variables de entorno:
   ```bash
   cp .env.example .env.local
   # Asegúrate de que la URL de la API sea correcta
   ```

3. Iniciar la aplicación:
   ```bash
   npm start
   ```

## Estado Actual del Proyecto

### Completado
- [x] Configuración inicial del proyecto
- [x] Autenticación de usuarios
- [x] CRUD de tickets
- [x] Chat en tiempo real
- [x] Filtrado y búsqueda
- [x] Panel de administración básico

### Pendiente
- [ ] Pruebas unitarias
- [ ] Documentación de la API
- [ ] Panel de estadísticas avanzado
- [ ] Integración con Telegram
- [ ] Documentación del código

## Estructura del Proyecto

```
ticket-system/
├── backend/           # API del servidor
│   ├── config/        # Configuraciones
│   ├── controllers/   # Controladores
│   ├── models/        # Modelos de la base de datos
│   ├── routes/        # Rutas de la API
│   └── services/      # Lógica de negocio
│
└── frontend/          # Aplicación React
    ├── public/        # Archivos estáticos
    └── src/
        ├── components/# Componentes reutilizables
        ├── features/  # Características (tickets, auth, etc.)
        ├── services/  # Servicios de API
        └── store/     # Gestión de estado (Redux)
```

## Próximos Pasos

1. Revisar la configuración del backend y frontend
2. Verificar que la base de datos esté correctamente configurada
3. Iniciar tanto el backend como el frontend
4. Probar el flujo completo:
   - Registro de usuario
   - Inicio de sesión
   - Creación de ticket
   - Comunicación en tiempo real
   - Gestión de tickets

## Solución de Problemas

- Si hay problemas con la base de datos, verifica las credenciales en `.env`
- Para problemas de CORS, asegúrate de que las URLs estén correctamente configuradas
- Revisa los logs del servidor para errores específicos

## Configuración de la Base de Datos

El proyecto utiliza PostgreSQL como sistema de gestión de bases de datos. Asegúrate de tenerlo instalado y configurado correctamente.

### Credenciales por defecto
- **Usuario:** postgres
- **Contraseña:** postgres
- **Base de datos:** ticket_system
- **Host:** localhost
- **Puerto:** 5432

### Configuración de la base de datos
El sistema creará automáticamente las tablas necesarias al iniciar el servidor. Asegúrate de que el usuario tenga los permisos necesarios para crear tablas en la base de datos.

### Solución de problemas comunes

#### Error de autenticación
Si recibes un error de autenticación al iniciar el servidor:

1. Verifica que el servicio de PostgreSQL esté en ejecución:
   ```bash
   sudo systemctl status postgresql
   ```

2. Asegúrate de que el usuario y la contraseña en `.env` coincidan con los de PostgreSQL

3. Si es necesario, restablece la contraseña del usuario postgres:
   ```bash
   sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'nueva_contraseña';"
   ```

#### Problemas de permisos
Si hay problemas de permisos, otorga los privilegios necesarios:
```bash
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ticket_system TO postgres;"
```

#### Reiniciar la base de datos
Si necesitas reiniciar completamente la base de datos:
```bash
sudo -u postgres psql -c "DROP DATABASE IF EXISTS ticket_system;"
sudo -u postgres psql -c "CREATE DATABASE ticket_system;"
```

#### Verificar conexión
Para verificar la conexión manualmente:
```bash
PGPASSWORD=postgres psql -h localhost -U postgres -d ticket_system -c "SELECT version();"
```

## Contribución

1. Haz un fork del proyecto
2. Crea una rama para tu característica (`git checkout -b feature/AmazingFeature`)
3. Haz commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Haz push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request
