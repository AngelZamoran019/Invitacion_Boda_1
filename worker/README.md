# Worker de publicaciones y control de invitados

Este Worker usa el bucket R2 `invitacionboda1` para publicar el HTML congelado de cada invitación y para guardar la información remota de los paneles y bases de invitados. Cada proyecto mantiene su propio espacio de invitados mediante tokens aleatorios independientes.

## Despliegue

Desde la carpeta `worker`:

```bash
npx wrangler login
npx wrangler deploy
```

El `wrangler.jsonc` ya contiene el binding R2 para `invitacionboda1`.

Después del despliegue, configura `PUBLIC_BASE_URL` con el dominio público que quieras usar para las publicaciones. Si no se configura, el Worker utiliza su propio dominio `workers.dev`.

Para limitar quién puede llamar a las APIs administrativas, configura `ALLOWED_ORIGINS` con los orígenes permitidos separados por comas. Por ejemplo:

```text
https://tu-editor.example.com
```

## Publicaciones

- `POST /api/publish` — recibe el HTML y crea una publicación nueva.
- `GET /i/<token>` — entrega una publicación ya guardada.

Cada publicación recibe un token nuevo. El Worker no acepta un parámetro `mode` al consultar `/i/<token>`, por lo que cambiar una parte de la URL no convierte una publicación limitada en libre.

La publicación limitada recibe el watermark `Dangels Print Studio` antes de almacenarse en R2. La publicación libre se almacena sin ese watermark.

## Control de invitados

- `POST /api/guest/panel` — crea o renueva el acceso privado al Panel de administración.
- `POST /api/guest/base` — crea o renueva el acceso privado a la Base, vinculada al mismo Panel.
- `POST /api/guest/panel/<token>/login` — autentica el Panel.
- `GET /api/guest/panel/<token>/entries` — obtiene la lista administrada.
- `POST /api/guest/panel/<token>/entries` — agrega una familia o invitado.
- `PUT /api/guest/panel/<token>/entries/<id>` — edita nombre o cantidad.
- `DELETE /api/guest/panel/<token>/entries/<id>` — elimina un registro.
- `POST /api/guest/base/<token>/login` — autentica la Base.
- `GET /api/guest/base/<token>/entries` — obtiene la lista y sus estados.
- `POST /api/guest/rsvp/<token>` — recibe una confirmación enviada desde la invitación pública.

Las contraseñas no se almacenan en texto plano: se derivan con PBKDF2/SHA-256 y una sal aleatoria. Las sesiones administrativas son temporales. Los datos de invitados se guardan como objetos JSON separados dentro de R2, por lo que cada proyecto queda aislado por su `spaceId`.

La interfaz del proyecto genera los enlaces `/control/panel/<token>` y `/control/base/<token>` sobre el dominio donde está publicada la aplicación React. La invitación publicada incluye el token de su Base para que sus confirmaciones actualicen exactamente ese proyecto.
