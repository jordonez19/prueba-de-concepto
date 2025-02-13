import AsteriskCaller from "../services/asteriskCaller.js";

// Inicializa una instancia de AsteriskCaller
const caller = new AsteriskCaller({
    host: '54.227.121.232',
    port: 5038,
    username: 'xavi_ami',
    password: 'password',
});

// Conectar a Asterisk AMI
export const connectToAsterisk = async (req, res) => {
    try {
        await caller.connect();
        caller.listenToEvents(); // Habilitar la escucha de eventos
        res.status(200).json({ message: "Conectado a Asterisk AMI" });
    } catch (err) {
        res.status(500).json({ error: "Error al conectar con Asterisk", details: err.message });
    }
};

// Realizar una llamada
/* export const makeCall = async (req, res) => {
    const { numberToCall, extensionToConnect, callerId, hubClientId } = req.body;

    if (!numberToCall || !extensionToConnect) {
        return res.status(400).json({ error: "numberToCall y extensionToConnect son requeridos" });
    }

    try {
        const result = await caller.makeCall(numberToCall, extensionToConnect, callerId, hubClientId);
        res.status(200).json({ message: "Llamada iniciada", result });
    } catch (err) {
        res.status(500).json({ error: "Error al iniciar la llamada", details: err.message });
    }
};
 */

export const makeCall = async (req, res) => {
    const { numberToCall, extensionToConnect, callerId, hubClientId } = req.body;

    if (!numberToCall || !extensionToConnect) {
        return res.status(400).json({ error: "numberToCall y extensionToConnect son requeridos" });
    }

    try {
        console.log("📞 Iniciando llamada...");
        const callResult = await caller.makeCall(numberToCall, extensionToConnect, callerId, hubClientId);

        console.log("⏳ Esperando finalización de la llamada...");
        const callData = await callResult; // Espera que la llamada termine (se maneja en `makeCall`)

        console.log("📡 Registrando llamada en HubSpot...");
        await caller.registerCallInHubSpot(callData.hubClientId, callData.callDuration, "COMPLETED", "CONNECTED");

        res.status(200).json({ message: "Llamada completada y registrada en HubSpot", callData });
    } catch (err) {
        res.status(500).json({ error: "Error en la llamada", details: err.message });
    }
};


// Desconectar de Asterisk AMI
export const disconnectFromAsterisk = (req, res) => {
    try {
        caller.disconnect();
        res.status(200).json({ message: "Desconectado de Asterisk AMI" });
    } catch (err) {
        res.status(500).json({ error: "Error al desconectar de Asterisk", details: err.message });
    }
};

