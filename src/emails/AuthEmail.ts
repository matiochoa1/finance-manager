import { Resend } from "resend";

const { RESEND_API_KEY } = process.env;
const resend = new Resend(RESEND_API_KEY);

interface IEmail {
	email: string;
	name: string;
	token: string;
}

export class AuthEmail {
	static sendConfirmationEmail = async (user: IEmail) => {
		const { data, error } = await resend.emails.send({
			from: "Matias - myFinn <matiasmochoa@gmail.com>",
			to: user.email,
			subject: "myFinn - Confirma tu cuenta",
			html: `<p>Hola ${user.name}, has creado tu cuenta en UpTask, ya casi esta todo listo. Solo falta confirmar tu cuenta</p>
                <pVisita el siguiente enlace:</p>
                <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirmar cuenta</a>
                <p>E ingresa el codigo: <b>${user.token}</b></p>
                <p>Este token expira en 10 minutos.</p>
            `,
		});

		if (error) {
			return console.error({ error });
		}

		console.log({ data });
	};

	static sendPasswordResetToken = async (user: IEmail) => {
		const { data, error } = await resend.emails.send({
			from: "Matias - myFinn <matiasmochoa@gmail.com>",
			to: user.email,
			subject: "myFinn - Reestablece tu contraseña",
			text: "myFinn - Reestablece tu contraseña",
			html: `<p>Hola ${user.name}, has solicitado reestablecer tu contraseña</p>
				<p>Visita el siguiente enlace:</p>
				<a href="${process.env.FRONTEND_URL}/auth/reset-password">Reestablecer contraseña</a>
				<p>E ingresa el siguiente token: <b>${user.token}</b></p>
				<p>Este token expira en 10 minutos</p>
				`,
		});

		if (error) {
			return console.error({ error });
		}

		console.log({ data });
	};
}
