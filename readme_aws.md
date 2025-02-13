# 📡 Integración de AWS Lambda con Asterisk para Manejo de Eventos y Llamadas

## 🚀 ¿Qué se Puede Hacer con AWS Lambda en Asterisk?

AWS Lambda permite manejar eventos de Asterisk en tiempo real y automatizar acciones sin necesidad de servidores dedicados. Algunas implementaciones incluyen:

- 📞 **Manejo de eventos AMI/ARI**: Captura eventos de Asterisk y procesa la información en la nube.
- 🎯 **Cola de eventos**: Enviar eventos a SQS o SNS para procesamiento en otros sistemas.
- 🔄 **Redireccionar llamadas dinámicamente**: Usar AGI para decidir a qué extensión debe ir una llamada.
- 🤖 **IVR dinámico con procesamiento en la nube**: Personalizar respuestas y rutas de llamadas con datos en tiempo real.
- 📊 **Generación de reportes y logs**: Enviar datos de llamadas a DynamoDB o S3 para análisis.

---

## 📡 1. Capturar Eventos de Asterisk y Enviarlos a AWS

### 🔗 Conexión a AMI para Escuchar Eventos

#### 📌 Ejemplo en Node.js con AMI:

```javascript
const AsteriskAMI = require('asterisk-ami-client')
const axios = require('axios')

const client = new AsteriskAMI({
  host: '127.0.0.1',
  port: 5038,
  username: 'admin',
  password: 'password'
})

client
  .connect()
  .then(() => console.log('Conectado a AMI'))
  .catch(err => console.error('Error en conexión AMI:', err))

client.on('event', event => {
  console.log('Evento recibido:', event)

  // Enviar evento a AWS Lambda
  axios
    .post('https://lambda-url.amazonaws.com', event)
    .then(response => console.log('Evento enviado a Lambda'))
    .catch(error => console.error('Error enviando evento:', error))
})
```

---

# 📡 Manejo de una Cola de Eventos con SQS

Para evitar perder eventos y procesarlos de forma asíncrona, puedes usar **Amazon SQS**.

## 🔗 Configurar Lambda para Leer desde SQS:

1. Crear una cola en SQS.
2. Modificar el script AMI para enviar eventos a SQS.
3. Configurar una Lambda para consumir los mensajes.

### 📌 Enviar eventos a SQS desde AMI:

```javascript
const AWS = require('aws-sdk')
const sqs = new AWS.SQS({ region: 'us-east-1' })

const sendMessageToSQS = async event => {
  const params = {
    QueueUrl: 'https://sqs.us-east-1.amazonaws.com/123456789012/AsteriskQueue',
    MessageBody: JSON.stringify(event)
  }

  await sqs.sendMessage(params).promise()
}

client.on('event', async event => {
  await sendMessageToSQS(event)
  console.log('Evento enviado a SQS:', event)
})
```

### Usar AGI para Transferir Llamadas a Extensiones

#### Asterisk AGI permite tomar decisiones dinámicas sobre las llamadas.

🔗 Configurar AGI en extensions.conf

[ivr-custom]
exten => 100,1,AGI(agi://localhost/transferCall)
exten => 100,n,Hangup()

## 🔗 Crear un AGI en Python para Conectar con Lambda

#!/usr/bin/env python3
import sys
import requests

def get_extension_from_lambda(caller_id):
response = requests.post("https://your-lambda-url.amazonaws.com", json={"caller_id": caller_id})
return response.json().get("extension", "1001") # Default extension

def main():
caller_id = None

    # Leer variables del canal Asterisk
    while True:
        line = sys.stdin.readline().strip()
        if line == "":
            break
        if "callerid" in line.lower():
            caller_id = line.split(":")[1].strip()

    extension = get_extension_from_lambda(caller_id)

    print(f"SET EXTENSION {extension}")
    sys.stdout.flush()

if **name** == "**main**":
main()

### Explicación:

- Se obtiene el caller ID de la llamada.
- Se consulta una Lambda en AWS para decidir la extensión de destino.
- Se devuelve la extensión a Asterisk para transferir la llamada.

## 🖥 Crear la Función Lambda para Decidir el Destino de la Llamada

import json

def lambda_handler(event, context):
caller_id = event.get("caller_id", "")

    # Lógica para asignar una extensión basada en el número
    extension_map = {
        "123456789": "2001",
        "987654321": "3001"
    }

    extension = extension_map.get(caller_id, "1001")  # Default a 1001

    return {
        "statusCode": 200,
        "body": json.dumps({"extension": extension})
    }

## Explicación:

- Se recibe el caller ID.
- Se consulta un mapa de extensiones para decidir el destino.
- Si no encuentra coincidencias, asigna una extensión por defecto (1001).

## 🎯 Beneficios de Usar AWS Lambda con Asterisk

✅ Escalabilidad: Se pueden manejar cientos de llamadas sin necesidad de servidores dedicados.
✅ Automatización: Decidir el destino de las llamadas en base a bases de datos en la nube.
✅ Monitoreo y Logging: Guardar eventos en CloudWatch, S3 o DynamoDB.
✅ Integración con otras herramientas: Se puede conectar con CRMs, chatbots o IA.

## 🔥 Conclusión

Con AWS Lambda y Asterisk puedes:

Escuchar eventos de AMI y enviarlos a la nube.
Usar una cola SQS para manejar eventos asíncronos.
Redirigir llamadas dinámicamente usando AGI y Lambda.
