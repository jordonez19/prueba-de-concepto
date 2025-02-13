const AmiClient = require('asterisk-manager');

class AsteriskCaller {
    constructor(config = {}) {
        this.config = {
            host: '54.227.121.232',
            port: 5038,
            username: 'xavi_ami',
            password: 'password'
        };

        this.ami = new AmiClient(
            this.config.port,
            this.config.host,
            this.config.username,
            this.config.password,
            true
        );

        // Configurar manejadores de eventos
        this.ami.on('connect', () => console.log('Conectado a Asterisk AMI'));
        this.ami.on('error', (err) => console.error('Error AMI:', err));
        this.setupEventHandlers();
    }

    setupEventHandlers() {
        this.ami.on('managerevent', (event) => {
            switch (event.event) {
                case 'DialBegin':
                    console.log('Iniciando llamada...');
                    break;
                case 'DialEnd':
                    console.log('Llamada contestada');
                    break;
                case 'Hangup':
                    console.log('Llamada terminada:', event.cause);
                    break;
            }
        });
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.ami.on('connect', () => resolve(true));
            this.ami.on('error', (err) => reject(err));
            this.ami.connect();
        });
    }

    makeCallToIVR(numberToCall, ivrExtension = 's', ivrContext = 'ivr-menu') {
        return new Promise((resolve, reject) => {
            const originateParams = {
                Action: 'Originate',
                Channel: `PJSIP/+57${numberToCall}@netelip_trunk`,
                // Contexto donde está el IVR
                Context: ivrContext,
                // Extensión del IVR
                //Exten: ivrExtension,       
                Priority: 1,
                Callerid: '123456789',
                Async: 'yes',
                Variable: [
                    'CHANNEL_DIRECTION=Outbound',
                    'AUTO_ANSWER=true',
                    'ORIGINAL_NUMBER=' + numberToCall
                    // Por si necesitas el número original en el IVR
                ].join(',')
            };

            this.ami.action(originateParams, (err, res) => {
                if (err) {
                    console.error('Error al originar llamada:', err);
                    reject(err);
                } else {
                    console.log('Llamada iniciada:', res);
                    resolve(res);
                }
            });
        });
    }

    disconnect() {
        if (this.ami) {
            this.ami.disconnect();
        }
    }
}

// Ejemplo de uso
async function main() {
    const caller = new AsteriskCaller({
        host: '54.227.121.232',
        port: 5038,
        username: 'xavi_ami',
        password: 'password'
    });

    try {
        await caller.connect();

        // Llamar y conectar al IVR
        const result = await caller.makeCallToIVR('3007845300', '1004', 'ivr1');
        console.log('Llamada iniciada:', result);

        // Mantener el script corriendo para recibir eventos
        setTimeout(() => {
            caller.disconnect();
            process.exit(0);
        }, 60000); // Esperar 1 minuto antes de terminar

    } catch (error) {
        console.error('Error:', error);
        caller.disconnect();
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = AsteriskCaller;