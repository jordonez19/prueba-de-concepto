# Guía de Instalación y Configuración de FreePBX 17

## Instalación de Dependencias y Herramientas

### Instalar herramientas necesarias

```bash
sudo apt install net-tools htop screen tshark vim sngrep
```

### Verificar la dirección IP

```bash
ifconfig
ip addr
```

## Instalación de FreePBX 17

### Descargar e instalar el script de instalación

```bash
cd /tmp
wget https://github.com/FreePBX/sng_freepbx_debian_install/raw/master/sng_freepbx_debian_install.sh -O /tmp/sng_freepbx_debian_install.sh
bash /tmp/sng_freepbx_debian_install.sh
```

### Habilitar acceso como root

```bash
echo "PermitRootLogin yes" >> /etc/ssh/sshd_config
systemctl restart ssh
```

### Verificar dirección IP de la instancia

```bash
ip addr
```

Ejemplo de salida:

```text
inet 172.31.16.194/20 metric 100 brd 172.31.31.255 scope global dynamic enX0
```

## Solución de Errores

### Error: ionCube Loader no instalado

#### Descargar e instalar ionCube Loader

```bash
wget https://downloads.ioncube.com/loader_downloads/ioncube_loaders_lin_x86-64.tar.gz
tar -xvzf ioncube_loaders_lin_x86-64.tar.gz
```

#### Copiar el archivo de ionCube Loader a la carpeta correspondiente

1. Verificar la versión de PHP:
   ```bash
   php --ini
   ```
2. Navegar a la carpeta de extensiones:
   ```bash
   cd /usr/lib/php
   ls
   ```
3. Copiar el archivo correspondiente:
   ```bash
   cp ioncube/ioncube_loader_lin_8.2.so /usr/lib/php/<version>/
   ```

#### Editar el archivo php.ini

```bash
nano /etc/php/8.2/apache2/php.ini
```

Agregar la siguiente línea:

```text
zend_extension = /usr/lib/php/<version>/ioncube_loader_lin_8.2.so
```

#### Reiniciar Apache

```bash
systemctl restart apache2
```

#### Verificar la instalación de ionCube

1. Crear un archivo de prueba:
   ```bash
   sudo nano /var/www/html/info.php
   ```
   Contenido del archivo:
   ```php
   <?php
   phpinfo();
   ?>
   ```
2. Acceder al archivo desde el navegador:
   ```text
   http://<tu-ip>/info.php
   ```
3. Eliminar el archivo después de verificar:
   ```bash
   sudo rm /var/www/html/info.php
   ```

## Configuración de Apache para FreePBX

### Habilitar archivos .htaccess

1. Editar la configuración de Apache:

   ```bash
   sudo nano /etc/apache2/apache2.conf
   ```

   Cambiar la directiva:

   ```apache
   <Directory /var/www/>
       Options Indexes FollowSymLinks
       AllowOverride All
       Require all granted
   </Directory>
   ```

2. Habilitar el módulo `mod_rewrite`:

   ```bash
   sudo a2enmod rewrite
   ```

3. Reiniciar Apache:
   ```bash
   sudo systemctl restart apache2
   ```

## Reparar Archivos Alterados en FreePBX

### Verificar archivos alterados

Desde el panel de administración de FreePBX, revisar el "Integrity Check" o la sección de "Module Admin" para identificar archivos modificados.

### Reparar archivos

```bash
fwconsole ma refreshsignatures
fwconsole reload
```

## Comandos de Administración Básica

### Reiniciar servicios

```bash
sudo systemctl restart apache2
sudo fwconsole restart
```

### Verificar el estado de los servicios

```bash
sudo systemctl status apache2
sudo systemctl status mysql
sudo systemctl status asterisk
```

### Habilitar servicios al inicio

```bash
sudo systemctl enable apache2
sudo systemctl enable mysql
sudo systemctl enable asterisk
```

----

# Configuración de FreePBX

## 1. Configuración del Trunk SIP

### Pasos para configurar un trunk SIP en FreePBX:

### Acceder a la Interfaz de FreePBX:

- Ingresa a la interfaz web de FreePBX utilizando las credenciales de administrador.

### Agregar un Trunk SIP:

1. Ve a **Connectivity > Trunks** y selecciona **Add Trunk**.
2. Selecciona el tipo de trunk: **SIP (chan_sip)** o **PJSIP** (se recomienda usar PJSIP si usas una versión de Asterisk 13 o superior).

### Configuración General del Trunk:

Completa los campos obligatorios según tu proveedor SIP:

- **Trunk Name:** Nombre descriptivo para el trunk (ejemplo: `netelip_trunk`).
- **Outbound CallerID:** Número que será visible cuando realices llamadas salientes.
- **Maximum Channels:** Establece el número máximo de llamadas concurrentes permitidas en este trunk.
- **Dialed Number Manipulation Rules:** Si necesitas agregar o eliminar un prefijo al número de destino, puedes configurarlo aquí.

### Configuración de la Autenticación:

- **Username:** El nombre de usuario proporcionado por tu proveedor SIP.
- **Password:** La contraseña asociada a tu cuenta de SIP.
- **SIP Server:** El host o IP del servidor SIP de tu proveedor (ejemplo: `sip.provider.com`).

> **Nota:** Al contratar un trunk SIP, asegúrate de que el proveedor te brinde una bolsa de minutos para realizar llamadas. No es necesario que el proveedor te asigne un número telefónico para realizar llamadas salientes (**outbound calls**), pero sí para recibir llamadas entrantes (**inbound calls**).

### Configuración de Rutas de Llamadas Salientes:

1. En la sección de **Outbound Routes**, selecciona el trunk que acabas de configurar.

### Guardar los Cambios:

- Haz clic en **Submit** para guardar la configuración y luego en **Apply Config** para aplicar los cambios.

---

## 2. Configuración de Extensiones

### Crear una Nueva Extensión:

1. Ve a **Applications > Extensions** y selecciona **Add Extension**.
2. Elige el tipo de extensión que deseas crear (ejemplo: **SIP Extension** o **PJSIP Extension**).

### Configurar los Detalles de la Extensión:

- **Extension:** Número de extensión (ejemplo: `1001`).
- **Display Name:** Nombre de la extensión (ejemplo: `Juan Pérez`).
- **Secret:** Contraseña para la extensión.
- **Voicemail:** Si quieres habilitar el buzón de voz, activa esta opción y configura el correo de voz.

> **Nota:** Puedes crear tantas extensiones como sea necesario, dependiendo de la cantidad de usuarios que necesiten acceso al sistema.

### Guardar los Cambios:

- Haz clic en **Submit** y luego en **Apply Config**.

---

## 3. Configuración de Inbound Routes (Rutas Entrantes)

### Crear una Ruta Entrante:

1. Ve a **Connectivity > Inbound Routes** y selecciona **Add Incoming Route**.
2. Configura los siguientes campos:
   - **DID Number:** El número que se asigna para recibir llamadas (esto debe ser contratado con tu proveedor SIP).
   - **Description:** Un nombre descriptivo para esta ruta (ejemplo: `Llamadas a Oficina`).
   - **Destination:** El destino de la llamada entrante, por ejemplo, una extensión específica o un IVR.

> **Nota:** Para recibir llamadas entrantes, necesitas contratar un número **DID (Direct Inward Dialing)** con tu proveedor SIP. Este número se configura en la opción **DID Number**.

### Configurar el Destino de las Llamadas Entrantes:

Puedes elegir que las llamadas entrantes vayan a:

- Una extensión.
- Un grupo de llamadas.
- Un IVR (más adelante te explico cómo configurarlo).

### Guardar los Cambios:

- Haz clic en **Submit** y luego en **Apply Config**.

---

## 4. Creación de un IVR (Interactive Voice Response)

### Crear un IVR:

1. Ve a **Applications > IVR** y selecciona **Add IVR**.
2. Configura los siguientes campos:
   - **IVR Name:** Nombre del IVR (ejemplo: `Menu Principal`).
   - **Announcement:** Selecciona un anuncio que se reproducirá cuando el IVR sea activado (ejemplo: `"Bienvenido a la empresa, presione 1 para ventas, 2 para soporte..."`).

> **Nota:** Si no tienes grabaciones predefinidas, puedes grabar tus propios mensajes desde **System Recordings**.

### Configurar las Opciones del IVR:

- **IVR Options:** Establece las opciones del IVR (por ejemplo, presionar `1` para una extensión o presionar `2` para otra).
- **Timeout:** Define cuánto tiempo se espera antes de enviar la llamada a un destino predeterminado (ejemplo: una extensión o grupo).

### Asignar el IVR a una Ruta Entrante:

1. Después de crear el IVR, ve a **Connectivity > Inbound Routes**.
2. Selecciona la ruta entrante y cambia su destino a este IVR.

### Guardar los Cambios:

- Haz clic en **Submit** y luego en **Apply Config**.

---

## 5. Grabaciones del Sistema

### Grabar un Mensaje:

1. Ve a **Admin > System Recordings**.
2. Haz clic en **Add Recording** y selecciona **Record New**.
3. Sigue las instrucciones para grabar el mensaje que deseas utilizar (por ejemplo, el mensaje de bienvenida del IVR).
4. Una vez grabado, guarda el archivo de grabación.

### Asignar la Grabación al IVR:

- Cuando configures el IVR, podrás seleccionar la grabación desde la opción **Announcement** y asignarla como el mensaje inicial del IVR.

---

## 6. Resumen de Campos Obligatorios y Opcionales

### Trunk SIP:

- **Obligatorios:** `Trunk Name`, `Username`, `Password`, `SIP Server`.
- **Opcionales:** `Maximum Channels`, `Outbound CallerID`.

### Extensiones:

- **Obligatorios:** `Extension`, `Secret`.
- **Opcionales:** `Display Name`, `Voicemail`.

### Inbound Routes:

- **Obligatorios:** `DID Number`, `Destination`.
- **Opcionales:** `Description`.

### IVR:

- **Obligatorios:** `IVR Name`, `Announcement`.
- **Opcionales:** `IVR Options`.

----

# Eventos de Asterisk

Asterisk emite eventos en AMI y ARI para notificar cambios en llamadas, canales y otros elementos. Aquí tienes una lista de eventos clave:

## 📞 Eventos Relacionados con Llamadas

- **NewChannel**: Se ha creado un nuevo canal.
- **NewCallerid**: Se ha actualizado la información del identificador de llamada.
- **Dial**: Se ha iniciado una llamada saliente desde un canal hacia otro.
- **Hangup**: Un canal ha colgado la llamada.
- **BridgeEnter**: Un canal ha ingresado a un puente de comunicación.
- **BridgeLeave**: Un canal ha salido de un puente de comunicación.
- **BridgeCreate**: Se ha creado un nuevo puente de comunicación.
- **BridgeDestroy**: Se ha eliminado un puente de comunicación.

## 🔄 Eventos de Estado del Canal

- **Status**: Estado actual de un canal.
- **ChannelUpdate**: Actualización de información de un canal.
- **Hold**: Un canal ha sido puesto en espera.
- **Unhold**: Un canal ha sido retirado de la espera.

## 🎤 Eventos Relacionados con Audio

- **DTMF**: Un canal ha recibido una señal DTMF (tono de teclado).
- **AGIExec**: Se ha ejecutado un script AGI en un canal.
- **PlaybackStart**: Se ha iniciado la reproducción de un audio.
- **PlaybackStop**: Se ha detenido la reproducción de un audio.

## 📶 Eventos de Registro y Troncales

- **PeerStatus**: Cambio en el estado de un dispositivo SIP/PJSIP.
- **Registry**: Resultado de un intento de registro de un trunk.
- **SIPQualifyPeerDone**: Respuesta a un intento de verificar la disponibilidad de un peer SIP.

## 📌 Eventos de Colas

- **QueueCallerJoin**: Un llamante ha ingresado a una cola.
- **QueueCallerLeave**: Un llamante ha salido de una cola.
- **QueueMemberStatus**: Cambio de estado de un agente en la cola.
- **QueueMemberAdded**: Un agente ha sido agregado a una cola.
- **QueueMemberRemoved**: Un agente ha sido eliminado de una cola.

## 🛑 Eventos de Fallos y Errores

- **Failure**: Error en la ejecución de una acción o llamada.
- **HangupRequest**: Solicitud de colgado de una llamada.

## 📲 Eventos de Mensajes

- **MessageWaiting**: Notificación de mensajes en el buzón de voz.
- **VoicemailUserEntry**: Un usuario ha ingresado a su buzón de voz.

## 🔧 Otros Eventos Importantes

- **DeviceStateChange**: Cambio en el estado de un dispositivo.
- **ContactStatus**: Cambio en el estado de contacto de un dispositivo SIP/PJSIP.
- **ParkedCall**: Una llamada ha sido aparcada.
- **UnParkedCall**: Una llamada ha sido des-aparcada.

---- 
