const getGuestApiBase = () => {
  const configured = String(import.meta.env.VITE_PUBLICATION_API_URL || '').trim().replace(/\/$/, '')
  if (configured) return configured.replace(/\/publish\/?$/, '')
  return 'https://netflixmemoriesshare.azamorano017.workers.dev'
}

export const applyWeddingGuestRsvp = (html, project) => {
  const token = String(project?.guestControl?.baseToken || '').trim()
  if (!token) return String(html || '')

  const apiBase = getGuestApiBase()
  const config = `<script id="wedding-guest-rsvp-config">window.__WEDDING_GUEST_BASE__=${JSON.stringify(token)};window.__WEDDING_GUEST_API__=${JSON.stringify(apiBase)};</script>`
  const script = `<script id="wedding-guest-rsvp-script">(()=>{
const form=document.getElementById('rsvp');
if(!form)return;
const base=window.__WEDDING_GUEST_BASE__;
const configured=window.__WEDDING_GUEST_API__||'https://netflixmemoriesshare.azamorano017.workers.dev';
const api=configured.replace(/\\/$/,'')+'/api';
const button=form.querySelector('button[type="submit"]');
const success=document.getElementById('rsvp-success');
const nameField=form.elements.name;
const guestsField=form.elements.guests;
let guestOptions=[];
let selectedGuestId='';
let refreshTimer=null;

const setMessage=(message)=>{
  if(success)success.innerHTML='<div class="success">'+String(message||'')+'</div>';
};

const makeSelect=(field,placeholder)=>{
  if(!field)return null;
  if(field.tagName==='SELECT')return field;
  const select=document.createElement('select');
  Array.from(field.attributes).forEach(attribute=>{
    if(attribute.name!=='type'&&attribute.name!=='value')select.setAttribute(attribute.name,attribute.value);
  });
  select.name=field.name;
  select.id=field.id;
  select.innerHTML='<option value="">'+placeholder+'</option>';
  field.replaceWith(select);
  return select;
};

const nameSelect=makeSelect(nameField,'Selecciona tu nombre');
const guestSelect=makeSelect(guestsField,'Selecciona cuántos asistirán');

const updateGuestOptions=()=>{
  if(!nameSelect||!guestSelect)return;
  const selected=guestOptions.find((guest)=>guest.id===nameSelect.value)||null;
  selectedGuestId=selected?.id||'';
  const currentValue=Number(guestSelect.value||1);
  guestSelect.innerHTML='';
  if(!selected){
    guestSelect.innerHTML='<option value="">Selecciona primero tu nombre</option>';
    guestSelect.disabled=true;
    if(button)button.disabled=true;
    return;
  }
  const max=Math.max(1,Number(selected.guests)||1);
  for(let index=1;index<=max;index+=1){
    const option=document.createElement('option');
    option.value=String(index);
    option.textContent=String(index)+(index===1?' invitado':' invitados');
    guestSelect.appendChild(option);
  }
  guestSelect.value=String(Math.min(Math.max(currentValue||1,1),max));
  guestSelect.disabled=false;
  if(button)button.disabled=false;
};

const renderGuestOptions=(keepName=true)=>{
  if(!nameSelect||!guestSelect)return;
  const previousName=keepName?String(nameSelect.value||''):'';
  nameSelect.innerHTML='<option value="">Selecciona tu nombre</option>';
  guestOptions.forEach((guest)=>{
    const option=document.createElement('option');
    option.value=guest.id;
    option.textContent=guest.name;
    nameSelect.appendChild(option);
  });
  nameSelect.value=guestOptions.some((guest)=>guest.id===previousName)?previousName:'';
  updateGuestOptions();
};

const loadGuests=async(silent=false)=>{
  try{
    const response=await fetch(api+'/guest/rsvp/'+encodeURIComponent(base)+'/guests',{cache:'no-store'});
    let payload=null;
    try{payload=await response.json()}catch{}
    if(!response.ok)throw new Error(payload?.error||'No se pudo cargar la lista de invitados.');
    guestOptions=Array.isArray(payload?.guests)?payload.guests:[];
    renderGuestOptions(true);
    if(!guestOptions.length){
      if(button)button.disabled=true;
      if(!silent)setMessage('La lista de invitados todavía no está configurada.');
    }else if(success&&success.textContent&&/lista de invitados/i.test(success.textContent)){
      success.innerHTML='';
    }
  }catch(error){
    if(button)button.disabled=true;
    if(!silent)setMessage(error?.message||'No se pudo cargar la lista de invitados.');
  }
};

nameSelect?.addEventListener('change',updateGuestOptions);
void loadGuests(false);
refreshTimer=window.setInterval(()=>{if(document.visibilityState==='visible')void loadGuests(true)},5000);

form.addEventListener('submit',async(event)=>{
  event.preventDefault();
  event.stopImmediatePropagation();
  const selected=guestOptions.find((guest)=>guest.id===nameSelect?.value);
  if(!selected){setMessage('Selecciona un invitado de la lista.');return;}
  const requestedGuests=Number(guestSelect?.value||1);
  const maxGuests=Math.max(1,Number(selected.guests)||1);
  if(requestedGuests<1||requestedGuests>maxGuests){setMessage('La cantidad de invitados permitida para este nombre ya no está disponible.');void loadGuests(true);return;}
  if(button)button.disabled=true;
  if(success)success.innerHTML='';
  const data={
    guestId:String(selectedGuestId||selected.id),
    name:String(selected.name||'').trim(),
    attendance:String(form.elements.attendance?.value||''),
    guests:requestedGuests,
    message:String(form.elements.message?.value||'').trim()
  };
  try{
    const response=await fetch(api+'/guest/rsvp/'+encodeURIComponent(base),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
    let payload=null;
    try{payload=await response.json()}catch{}
    if(!response.ok)throw new Error(payload?.error||'No se pudo registrar la confirmación.');
    if(success)success.innerHTML='<div class="success">¡Gracias! Tu confirmación quedó registrada correctamente.</div>';
    form.reset();
    if(guestSelect)guestSelect.value='';
    selectedGuestId='';
    updateGuestOptions();
    void loadGuests(true);
  }catch(error){
    if(success)success.innerHTML='<div class="success">'+String(error?.message||'No se pudo registrar la confirmación.')+'</div>';
  }finally{
    updateGuestOptions();
  }
},true);

window.addEventListener('beforeunload',()=>{if(refreshTimer)window.clearInterval(refreshTimer)});
})()</script>`

  const source = String(html || '')
    .replace(/<script id="wedding-guest-rsvp-config">[\s\S]*?<\/script>/i, '')
    .replace(/<script id="wedding-guest-rsvp-script">[\s\S]*?<\/script>/i, '')
    .replace(/<script id="wedding-guest-rsvp-legacy">[\s\S]*?<\/script>/i, '')

  return source.replace('</body>', `${config}${script}</body>`)
}

export default applyWeddingGuestRsvp
