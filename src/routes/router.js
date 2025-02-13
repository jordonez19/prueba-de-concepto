
import AsteriskRoutes from "./Asterisk.js";

export default function (app) {
    app.use("/ari", AsteriskRoutes);
}
