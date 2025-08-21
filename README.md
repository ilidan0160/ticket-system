# Sistema de Tickets de Soporte Técnico

Aplicación web para la gestión de tickets de soporte técnico con autenticación, chat en tiempo real y panel de administración.

## Características Principales

- Autenticación de usuarios (cliente y administrador)
- Creación y seguimiento de tickets
- Chat en tiempo real
- Filtrado y búsqueda de tickets
- Panel de administración
- Estadísticas y reportes

## Requisitos Previos

- Node.js (v14 o superior)
- npm o yarn
- Base de datos MySQL
- Cuenta de Telegram (para notificaciones)

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
