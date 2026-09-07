# Worker de publicaciones R2

Este Worker publica el HTML congelado de cada invitación en el bucket `invitacionboda1` y entrega un token aleatorio independiente para cada publicación.

## Despliegue

Desde la carpeta `worker`:

```bash
npx wrangler login
npx wrangler deploy
```

El `wrangler.jsonc` ya contiene el binding R2 para `invitacionboda1`.

Después del despliegue, configura en el Worker la variable `PUBLIC_BASE_URL` con el dominio público que quieras usar para los enlaces. Si no se configura, el Worker utiliza su propio dominio `workers.dev`.

Para limitar quién puede llamar a `/api/publish`, configura `ALLOWED_ORIGINS` con los orígenes permitidos separados por comas. Por ejemplo:

```text
https://tu-editor.example.com
```

## Rutas

- `POST /api/publish` — recibe el HTML y crea una publicación nueva.
- `GET /i/<token>` — entrega una publicación ya guardada.

Cada publicación recibe un token nuevo. El Worker no acepta un parámetro `mode` al consultar `/i/<token>`, por lo que cambiar una parte de la URL no convierte una publicación limitada en libre.

La publicación limitada recibe el watermark `Dangels Print Studio` antes de almacenarse en R2. La publicación libre se almacena sin ese watermark.
