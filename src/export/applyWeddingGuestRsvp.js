const getGuestApiBase = () => {
  const configured = String(import.meta.env.VITE_PUBLICATION_API_URL || '').trim().replace(/\/$/, '')
  if (configured) return configured.replace(/\/publish\/?$/, '')
  return ''
}

export const applyWeddingGuestRsvp = (html, project) => {
  const token = String(project?.guestControl?.baseToken || '').trim()
  if (!token) return String(html || '')

  const apiBase = getGuestApiBase()
  const config = `<script id="wedding-guest-rsvp-config">window.__WEDDING_GUEST_BASE__=${JSON.stringify(token)};window.__WEDDING_GUEST_API__=${JSON.stringify(apiBase)};</script>`
  const script = `<script id="wedding-guest-rsvp-script">(()=>{const form=document.getElementById('rsvp');if(!form)return;const base=window.__WEDDING_GUEST_BASE__;const configured=window.__WEDDING_GUEST_API__||'';const api=(configured||window.location.origin)+'/api';form.addEventListener('submit',async(event)=>{event.preventDefault();const button=form.querySelector('button[type="submit"]');const success=document.getElementById('rsvp-success');if(button)button.disabled=true;if(success)success.innerHTML='';const data={name:String(form.elements.name?.value||'').trim(),attendance:String(form.elements.attendance?.value||''),guests:Number(form.elements.guests?.value||1),message:String(form.elements.message?.value||'').trim()};try{const response=await fetch(api+'/guest/rsvp/'+encodeURIComponent(base),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});let payload=null;try{payload=await response.json()}catch{}if(!response.ok)throw new Error(payload?.error||'No se pudo registrar la confirmación.');if(success)success.innerHTML='<div class="success">¡Gracias! Tu confirmación quedó registrada correctamente.</div>';form.reset();if(form.elements.guests)form.elements.guests.value='1'}catch(error){if(success)success.innerHTML='<div class="success">'+String(error?.message||'No se pudo registrar la confirmación.')+'</div>'}finally{if(button)button.disabled=false}})})()</script>`
  const source = String(html || '')
    .replace(/<script id="wedding-guest-rsvp-config">[\s\S]*?<\/script>/i, '')
    .replace(/<script id="wedding-guest-rsvp-script">[\s\S]*?<\/script>/i, '')
    .replace(/<script id="wedding-guest-rsvp-legacy">[\s\S]*?<\/script>/i, '')

  return source.replace('</body>', `${config}${script}</body>`)
}

export default applyWeddingGuestRsvp
