import AmiClient from "asterisk-manager";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const HUBSPOT_API_URL = "https://api.hubapi.com/crm/v3/objects/calls";
const HUBSPOT_HEADERS = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
};

class AsteriskCaller {
    constructor(config = {}) {
        this.config = {
            host: process.env.HOST || "54.227.121.232",
            port: process.env.PORT_AMI || 5038,
            username: process.env.USERNAME || "xavi_ami",
            password: process.env.PASSWORD || "password",
            ...config,
        };

        this.ami = new AmiClient(
            this.config.port,
            this.config.host,
            this.config.username,
            this.config.password,
            true
        );

        this.calls = {}; // Almacena info de llamadas activas

        this.ami.on("connect", () => console.log("✅ Conectado a Asterisk AMI"));
        this.ami.on("error", (err) => console.error("❌ Error AMI:", err));

        this.setupEventHandlers();
    }

    setupEventHandlers() {
        this.ami.on("managerevent", (event) => {
            switch (event.event) {
                case "OriginateResponse":
                    console.log(`📞 Respuesta de Originate: ${event.response}, ActionID: ${event.actionid}, UniqueID: ${event.uniqueid}`);

                    if (event.response === "Success" && event.actionid) {
                        // Si recibimos UniqueID, actualizar el registro
                        if (event.uniqueid && this.calls[event.actionid]) {
                            this.calls[event.uniqueid] = { ...this.calls[event.actionid], uniqueid: event.uniqueid };
                            delete this.calls[event.actionid]; // Eliminamos el actionid temporal
                        }
                    }
                    break;

                case "Ringing":
                    console.log(`🔔 La llamada está sonando en: ${event.channel}`);
                    if (event.uniqueid && this.calls[event.uniqueid]) {
                        this.calls[event.uniqueid].startTime = Date.now();
                    }
                    break;

                case "Bridge":
                    console.log(`✅ Llamada conectada. Canal: ${event.channel}, UniqueID: ${event.uniqueid}`);
                    if (this.calls[event.uniqueid]) {
                        this.calls[event.uniqueid].answerTime = Date.now();
                        console.log(`⏳ Tiempo de timbre: ${(this.calls[event.uniqueid].answerTime - this.calls[event.uniqueid].startTime) / 1000} segundos`);
                    } else {
                        console.log(`⚠️ No se encontró la llamada con UniqueID: ${event.uniqueid}`);
                    }
                    break;

                case "Hangup":
                    console.log(`📴 Llamada terminada - Motivo: ${event.cause}, ID: ${event.uniqueid}`);
                    if (this.calls[event.uniqueid]) {
                        const callInfo = this.calls[event.uniqueid];
                        callInfo.duration = Math.round(
                            (Date.now() - (callInfo.answerTime || callInfo.startTime)) / 1000
                        );
                        callInfo.ended = true;

                        console.log(`📊 Duración total de la llamada: ${callInfo.duration} segundos`);

                        // Registrar en HubSpot
                        this.registerCallInHubSpot(
                            callInfo.hubClientId,
                            callInfo.duration,
                            "COMPLETED",
                            "NO_ANSWER"
                        );

                        delete this.calls[event.uniqueid];
                    }
                    break;
            }
        });
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.ami.on("connect", () => resolve(true));
            this.ami.on("error", (err) => reject(err));
            this.ami.connect();
        });
    }

    async makeCall(numberToCall, extensionToConnect, callerId = "plurall", hubClientId) {
        console.log("📞 Llamando a:", numberToCall);

        return new Promise((resolve, reject) => {
            const originateParams = {
                Action: "Originate",
                Channel: `PJSIP/+57${numberToCall}@netelip_trunk`,
                Context: "from-internal",
                Exten: extensionToConnect,
                Priority: 1,
                Callerid: callerId,
                Async: "yes",
                Variable: `CHANNEL_DIRECTION=Outbound,AUTO_ANSWER=true`,
            };

            console.log("📡 Parámetros de la llamada:", originateParams);

            this.ami.action(originateParams, (err, res) => {
                if (err) {
                    console.error("❌ Error al originar llamada:", err);
                    return reject(err);
                }

                console.log("✅ Llamada iniciada:", res);

                if (res.response === 'Success' && res.actionid) {
                    // Guardamos la llamada temporalmente con actionid hasta que recibamos UniqueID
                    this.calls[res.actionid] = { startTime: Date.now(), hubClientId };
                }

                resolve(res);
            });
        });
    }




    async registerCallInHubSpot(hubClientId, callDuration, callStatus, callDisposition) {
        try {
            if (!hubClientId) {
                console.log("⚠️ Error: No se proporcionó un Hub Client ID válido");
                return;
            }

            const timestamp = new Date().toISOString();

            const response = await axios.post(
                HUBSPOT_API_URL,
                {
                    associations: [
                        {
                            to: { id: hubClientId },
                            types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 194 }],
                        },
                    ],
                    objectWriteTraceId: "2123123123",
                    properties: {
                        hs_timestamp: timestamp,
                        hs_call_status: callStatus,
                        hs_call_direction: "OUTBOUND",
                        hs_call_disposition: callDisposition,
                        hs_call_title: "Llamada desde Asterisk",
                        hs_call_body: `Estado: ${callStatus}, Disposición: ${callDisposition}`,
                        hs_call_duration: String(callDuration),
                    },
                },
                { headers: HUBSPOT_HEADERS }
            );

            console.log("✅ Llamada registrada en HubSpot:", response.data);
        } catch (error) {
            console.error("❌ Error registrando la llamada en HubSpot:", error.response?.data || error.message);
        }
    }

    disconnect() {
        if (this.ami) {
            this.ami.disconnect();
            console.log("🔌 Desconectado de Asterisk AMI");
        }
    }
}

export default AsteriskCaller;
