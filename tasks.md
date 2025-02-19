# Implementación de Sistema de Llamadas con FreePBX y AWS

## Descripción

Configurar una centralita en FreePBX con IVR e integrarla con AWS Lambda y S3 para automatizar el encolamiento de llamadas.

## Paso 1: Configuración de FreePBX y la Centralita

### Tareas:

- Montar una instancia EC2 para FreePBX.
- Configurar Apache y los puertos necesarios.
- Configurar la troncal SIP para hacer llamadas externas.
- Configurar extensiones internas.
- Configurar las rutas de entrada y salida (Inbound y Outbound Routes).
- Probar llamadas internas (extensión a extensión)
- Probar llamadas externas (extensión a celular).

## Paso 2: Configuración de ARI, AMI y PJSIP en Asterisk con FreePBX

### Tareas:

- Configurar ARI en el servidor EC2.
- Configurar la API ARI en Asterisk y definir permisos de acceso.
- Configurar PJSIP para gestionar las extensiones y troncales.
- Configurar la AMI para recibir eventos de llamadas.
- Validar conexión entre AMI/ARI y los servicios externos.
- Realizar pruebas de eventos de llamadas con AMI/ARI.

## Paso 3: Configuración del IVR en FreePBX

### Tareas:

- Definir la estructura y opciones del IVR.
- Configurar grabaciones y mensajes de voz del sistema.
- Asignar opciones del IVR a extensiones, colas o desvíos.
- Implementar horarios de atención y reglas de disponibilidad.
- Realizar pruebas de flujo de llamadas en el IVR.

## Paso 4: Integración con AWS Lambda y S3

### Tareas:

- Configurar bucket para recibir eventos.
- Crear una función Lambda en AWS para procesar los eventos del bucket.
- Implementar lógica en Lambda para disparar llamadas en Asterisk.
- Conectar Lambda con Asterisk utilizando AMI o ARI.
- Realizar pruebas con Lambda y Asterisk.

## Paso 5: Registro Automático de Llamadas en HubSpot

### Tareas:

- Validar eventos de llamadas en Asterisk (AMI o ARI).
- Implementar lógica en el backend para capturar eventos de llamadas.
- Enviar datos de llamadas a la API de HubSpot.
- Asociar llamadas con contactos de HubSpot usando el número telefónico.
- Probar y validar la sincronización de llamadas.

## Paso 6: Monitoreo y Seguridad

### Tareas:

- Configurar logs en Asterisk y FreePBX.
- Implementar monitoreo en AWS Lambda y S3.
- Configurar reglas de firewall en EC2 para limitar acceso.
- Implementar alertas para fallos en llamadas o integración.

---

# Posibles historias

### Paso 1: Configuración de FreePBX y la Centralita

- Como administrador del sistema, se requiere configurar FreePBX en un servidor EC2 ara manejar llamadas entrantes y salientes, asegurando un flujo eficiente.

### Paso 2: Configuración de ARI, AMI y PJSIP en Asterisk con FreePBX

- Como administrador del sistema, se requiere configurar ARI y AMI en Asterisk con FreePBX para interactuar con llamadas y eventos.

### Paso 3: Configuración del IVR en FreePBX

- Como administrador del sistema, se requiere configurar un IVR en FreePBX para enrutar llamadas según la entrada del usuario.

### Paso 4: Integración con AWS Lambda y S3

- Como desarrollador, se requiere que el sistema encole llamadas en Asterisk a partir de eventos en un bucket de S3 utilizando AWS Lambda.

### Paso 5: Registro Automático de Llamadas en HubSpot

- Como usuario, se requiere que las llamadas queden registradas en HubSpot para hacer seguimiento a clientes.

### Paso 6: Monitoreo y Seguridad

- Como administrador, se requiere monitorear y asegurar la infraestructura para garantizar estabilidad y seguridad en las llamadas.
