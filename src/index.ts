import * as functions from 'firebase-functions';
import * as admin from "firebase-admin";

// INICIAR FIREBASE
admin.initializeApp(functions.config().firebase);

// FUNCIÓN PARA ENVIAR NOTIFICACIÓN COMO MULTICAST
const sendNotification = async (data: { title: string, message: string, url: string }) => {
	// TOKENS
	const tokens: string[] = [];

	// OBTENER LISTA DE TOKENS REGISTRADOS
	const tokensFB: admin.firestore.QuerySnapshot = await admin.firestore().collection("tokens").get();
	tokensFB.forEach((doc: admin.firestore.QueryDocumentSnapshot) => tokens.push(doc.data().token))

	// COMPONER MENSAJE
	const messageS: admin.messaging.MulticastMessage = {
		data,
		tokens: tokens,
		webpush: {
			fcmOptions: {
				link: "https://blog.wearelua.com"
			}
		}
	}

	// ENVIAR A LOS DISPOSITIVOS
	return admin.messaging().sendMulticast(messageS);
}

// ENVIAR NOTIFICACIÓN NORMAL
exports.sendPush = functions.https.onRequest(async (req: functions.Request, res: functions.Response) => {
	// OBTENER TITULO Y MENSAJE DE PARAMS
	const title: string | undefined = req.body.title;
	const message: string | undefined = req.body.message;

	// ENVIAR NOTIFICACIÓN COMO MULTICAST
	sendNotification({
		title: title || 'Actualización de posts',
		message: message || 'Error al cargar el mensaje',
		url: "noProduct"
	}).then(() => res.send("Push notification send successfully"))
})
