import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const smClient = new SecretsManagerClient({});

export async function run() {
	try {
		const secretArn = process.env.DB_SECRET_ARN;
		if (!secretArn) {
			console.error("DB_SECRET_ARN is not set in environment variables");
			throw new Error("DB_SECRET_ARN is missing");
		}

		// 1) Récupérer le secret AVANT d'importer main
		const res = await smClient.send(
			new GetSecretValueCommand({ SecretId: secretArn })
		);

		const { username, password } = JSON.parse(res.SecretString);

		console.log(`DB user from secret: ${username}`);
		// ⚠️ ne pas logguer le password en prod, c’est juste pour debug, à retirer ensuite
		console.log(`password: ${password}`);

		// 2) Mettre à jour les variables d'env pour pg
		process.env.PGUSER = username;
		process.env.PGPASSWORD = password;

		// 3) Maintenant seulement on importe main (qui va lire process.env)
		const { main } = await import('../main.js');

		await main();
		return { ok: true };
	} catch (err) {
		console.error("Lambda run() error:", err);
		throw err;
	}
}
