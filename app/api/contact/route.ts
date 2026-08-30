import nodemailer from "nodemailer";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(40).optional(),
  message: z.string().trim().min(10).max(4000),
  website: z.string().max(0).optional(),
});

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "La solicitud no es válida." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Revisá los datos ingresados e intentá nuevamente." },
      { status: 400 },
    );
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_TO_EMAIL } =
    process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !CONTACT_TO_EMAIL) {
    console.error("Faltan variables de entorno para el correo de contacto.");
    return Response.json(
      { error: "No se pudo enviar la consulta. Intentá más tarde." },
      { status: 500 },
    );
  }

  const port = Number(SMTP_PORT);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    console.error("SMTP_PORT no tiene un valor válido.");
    return Response.json(
      { error: "No se pudo enviar la consulta. Intentá más tarde." },
      { status: 500 },
    );
  }

  const { name, email, phone, message } = parsed.data;
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `Foja Cero <${SMTP_USER}>`,
      to: CONTACT_TO_EMAIL,
      replyTo: email,
      subject: "Nueva consulta desde Foja Cero",
      text: [
        "Nueva consulta recibida desde el sitio web.",
        "",
        `Nombre: ${name}`,
        `Correo: ${email}`,
        `Teléfono: ${phone || "No informado"}`,
        "",
        "Mensaje:",
        message,
      ].join("\n"),
      html: `<!doctype html>
        <html lang="es">
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>Nueva consulta — Foja Cero</title>
            <style>
              @media only screen and (max-width: 620px) {
                .email-page-padding { padding: 12px !important; }
                .email-header-padding { padding: 22px 24px 20px !important; }
                .email-content-padding { padding-left: 24px !important; padding-right: 24px !important; }
                .email-title { font-size: 32px !important; letter-spacing: -1px !important; line-height: 1.08 !important; }
                .email-brand { font-size: 20px !important; }
                .email-status { font-size: 9px !important; letter-spacing: 1px !important; }
                .email-value { font-size: 15px !important; word-break: break-word !important; }
                .email-message { padding: 20px !important; font-size: 17px !important; }
                .email-footer { padding: 18px 24px !important; }
              }
            </style>
          </head>
          <body style="margin:0;padding:0;background-color:#f3f0e9;color:#132735;font-family:Arial,sans-serif;">
            <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
              Nueva consulta de ${escapeHtml(name)} desde el sitio web de Foja Cero.
            </div>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;background-color:#f3f0e9;">
              <tr>
                <td align="center" class="email-page-padding" style="padding:32px 16px;">
                  <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;border-collapse:collapse;background-color:#132735;">
                    <tr>
                      <td class="email-header-padding" style="padding:30px 38px 27px;border-bottom:1px solid #405461;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                          <tr>
                            <td style="vertical-align:middle;">
                              <span style="display:inline-block;width:29px;height:31px;line-height:31px;text-align:center;background-color:#f3f0e9;color:#132735;font-family:Georgia,serif;font-size:18px;vertical-align:middle;">F</span>
                              <span class="email-brand" style="margin-left:10px;color:#f3f0e9;font-family:Georgia,serif;font-size:22px;letter-spacing:-0.4px;vertical-align:middle;">Foja Cero</span>
                            </td>
                            <td align="right" class="email-status" style="color:#d6a17d;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;vertical-align:middle;">Nueva consulta</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td class="email-content-padding" style="padding:46px 38px 39px;">
                        <p style="margin:0 0 20px;color:#d6a17d;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;">Abramos la conversación</p>
                        <h1 class="email-title" style="margin:0;color:#f3f0e9;font-family:Georgia,serif;font-size:42px;font-weight:400;letter-spacing:-1.8px;line-height:1.03;">Nueva consulta,<br /><em style="color:#b77852;font-style:italic;">una persona por escuchar.</em></h1>
                      </td>
                    </tr>
                    <tr>
                      <td class="email-content-padding" style="padding:0 38px 42px;">
                        <p style="margin:0 0 14px;color:#d6a17d;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;">Datos de contacto</p>
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;border-top:1px solid #405461;">
                          <tr>
                            <td style="padding:15px 0 14px;border-bottom:1px solid #405461;color:#aebbc0;font-size:11px;letter-spacing:0.8px;text-transform:uppercase;">Nombre</td>
                            <td align="right" class="email-value" style="padding:15px 0 14px;border-bottom:1px solid #405461;color:#f3f0e9;font-family:Georgia,serif;font-size:18px;">${escapeHtml(name)}</td>
                          </tr>
                          <tr>
                            <td style="padding:15px 0 14px;border-bottom:1px solid #405461;color:#aebbc0;font-size:11px;letter-spacing:0.8px;text-transform:uppercase;">Correo</td>
                            <td align="right" class="email-value" style="padding:15px 0 14px;border-bottom:1px solid #405461;color:#f3f0e9;font-size:14px;word-break:break-word;"><a href="mailto:${escapeHtml(email)}" style="color:#f3f0e9;text-decoration:none;">${escapeHtml(email)}</a></td>
                          </tr>
                          <tr>
                            <td style="padding:15px 0 14px;border-bottom:1px solid #405461;color:#aebbc0;font-size:11px;letter-spacing:0.8px;text-transform:uppercase;">Teléfono</td>
                            <td align="right" class="email-value" style="padding:15px 0 14px;border-bottom:1px solid #405461;color:#f3f0e9;font-size:14px;">${escapeHtml(phone || "No informado")}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td class="email-content-padding" style="padding:0 38px 46px;">
                        <p style="margin:0 0 14px;color:#d6a17d;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;">Su mensaje</p>
                        <div class="email-message" style="padding:24px 26px;background-color:#e8e3d9;border-left:2px solid #b77852;color:#132735;font-family:Georgia,serif;font-size:19px;line-height:1.5;">${escapeHtml(message).replaceAll("\n", "<br />")}</div>
                      </td>
                    </tr>
                    <tr>
                      <td class="email-footer" style="padding:23px 38px;background-color:#1c3544;color:#aebbc0;font-size:12px;line-height:1.5;">
                        Podés responder directamente a este correo para contactar a ${escapeHtml(name)}.
                      </td>
                    </tr>
                  </table>
                  <p style="margin:16px 0 0;color:#657177;font-size:10px;letter-spacing:0.8px;text-transform:uppercase;">Foja Cero · Estudio jurídico</p>
                </td>
              </tr>
            </table>
          </body>
        </html>`,
    });
  } catch (error) {
    console.error("No se pudo enviar el correo de contacto.", error);
    return Response.json(
      { error: "No se pudo enviar la consulta. Intentá más tarde." },
      { status: 500 },
    );
  }

  return Response.json({ success: true });
}
