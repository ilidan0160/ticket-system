# Sistema de Tickets de Soporte Técnico

Aplicación web para la gestión de tickets de soporte técnico con autenticación, chat en tiempo real y panel de administración.

## 🖥️ Requisitos Previos

### Para Windows:
1. **Node.js** (v16 o superior)
   - Descargar e instalar desde: https://nodejs.org/
   - Durante la instalación, marcar la opción "Automatically install the necessary tools"

2. **Git**
   - Descargar e instalar desde: https://git-scm.com/download/win
   - Usar configuración por defecto durante la instalación

3. **MySQL**
   - Descargar MySQL Installer: https://dev.mysql.com/downloads/installer/
   - Seleccionar "Developer Default" durante la instalación
   - Configurar contraseña de root cuando se solicite

4. **Editor de Código** (opcional pero recomendado)
   - Visual Studio Code: https://code.visualstudio.com/

### Para Linux (Ubuntu/Debian):
```bash
# 1. Actualizar paquetes
sudo apt update && sudo apt upgrade -y

# 2. Instalar Node.js y npm
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Instalar Git
sudo apt install -y git

# 4. Instalar MySQL
sudo apt install -y mysql-server

# 5. Configurar MySQL (establecer contraseña de root)
sudo mysql_secure_installation

# 6. Instalar editor de texto (opcional)
sudo apt install -y code  # Si usas VS Code
```

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

## Contribución

1. Haz un fork del proyecto
2. Crea una rama para tu característica (`git checkout -b feature/AmazingFeature`)
3. Haz commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Haz push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request
