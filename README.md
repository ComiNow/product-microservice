<p align="center">
  <a href="https://nestjs.com/" target="_blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="100" alt="NestJS Logo" />
  </a>
</p>

# 🛒 Product Microservice

Microservicio encargado de la gestión de productos de la cafetería **CoffeeNow**: creación, edición, eliminación lógica y consulta con filtros.  
Desarrollado con [NestJS](https://nestjs.com/), [Prisma](https://www.prisma.io/) y PostgreSQL, utilizando Docker para el entorno de desarrollo.

---

## 🚀 Entorno de desarrollo

### 1. Clonar el repositorio

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo `.env.template` y renómbralo a `.env`

### 4. Levantar la base de datos con Docker

```bash
docker-compose up -d
```

> Esto levantará un contenedor con PostgreSQL configurado para Prisma.

### 5. Ejecutar comandos de Prisma

```bash
npx prisma generate
npx prisma migrate dev
```

### 6. Iniciar el servidor en modo desarrollo

```bash
npm run start:dev
```

---

## 📂 Estructura básica

```
src/
 ├── products/
 │   ├── controllers/
 │   ├── dto/
 │   ├── services/
 │   └── ...
 ├── categories/
 │   ├── controllers/
 │   ├── dto/
 │   ├── services/
 │   └── ...
 ├── common/
 └── main.ts
```

---

## 📌 Notas

- Asegúrate de que Docker esté corriendo antes de iniciar el microservicio.
- Este servicio se comunica mediante NATS como parte de una arquitectura de microservicios.

---

## 🧪 Tecnologías

- NestJS
- Prisma ORM
- PostgreSQL
- Docker Compose
- NATS

## 📄 Licencia

Este proyecto es desarrollado por el equipo **CoffeeNow** ☕
