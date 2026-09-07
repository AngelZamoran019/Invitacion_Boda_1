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
let closeGuestSearch=()=>{};

const setMessage=(message)=>{if(success)success.innerHTML='<div class="success">'+String(message||'')+'</div>';};

const makeGuestSearch=(field)=>{
  if(!field)return null;
  const wrapper=document.createElement('div');
  wrapper.className='wedding-guest-search';
  wrapper.style.position='relative';
  wrapper.style.width='100%';
  const search=document.createElement('input');
  search.type='search';
  search.placeholder='Busca tu nombre...';
  search.autocomplete='off';
  search.setAttribute('aria-label','Buscar invitado por nombre');
  search.style.width='100%';
  search.style.boxSizing='border-box';
  const hidden=document.createElement('input');
  hidden.type='hidden';
  hidden.name=field.name;
  hidden.id=field.id;
  const list=document.createElement('div');
  list.className='wedding-guest-search-list';
  list.style.position='absolute';
  list.style.left='0';
  list.style.right='0';
  list.style.top='calc(100% + 6px)';
  list.style.zIndex='9999';
  list.style.maxHeight='240px';
  list.style.overflowY='auto';
  list.style.display='none';
  list.style.background='#ffffff';
  list.style.color='#111111';
  list.style.border='1px solid rgba(0,0,0,.12)';
  list.style.borderRadius='12px';
  list.style.boxShadow='0 12px 30px rgba(0,0,0,.22)';
  list.style.padding='4px';
  wrapper.append(search,hidden,list);
  field.replaceWith(wrapper);

  const renderList=(query='')=>{
    const normalized=String(query||'').trim().toLocaleLowerCase();
    list.innerHTML='';
    const matches=guestOptions.filter((guest)=>String(guest.name||'').toLocaleLowerCase().includes(normalized));
    if(!matches.length){
      const empty=document.createElement('div');
      empty.textContent=normalized?'No se encontraron invitados.':'No hay invitados disponibles.';
      empty.style.padding='12px';
      empty.style.color='#555';
      list.appendChild(empty);
    }else{
      matches.forEach((guest)=>{
        const option=document.createElement('button');
        option.type='button';
        option.textContent=guest.name;
        option.style.display='block';
        option.style.width='100%';
        option.style.textAlign='left';
        option.style.cursor='pointer';
        option.style.border='0';
        option.style.background='#ffffff';
        option.style.color='#111111';
        option.style.padding='12px';
        option.style.borderRadius='9px';
        option.style.font='inherit';
        option.style.fontWeight='500';
        option.addEventListener('mouseenter',()=>{option.style.background='#f1f1f1';});
        option.addEventListener('mouseleave',()=>{option.style.background='#ffffff';});
        option.addEventListener('click',()=>{
          hidden.value=guest.id;
          selectedGuestId=guest.id;
          search.value=guest.name;
          list.style.display='none';
          updateGuestOptions();
        });
        list.appendChild(option);
      });
    }
    list.style.display='block';
  };

  search.addEventListener('focus',()=>renderList(search.value));
  search.addEventListener('input',()=>{
    hidden.value='';
    selectedGuestId='';
    updateGuestOptions();
    renderList(search.value);
  });
  search.addEventListener('keydown',(event)=>{if(event.key==='Escape')list.style.display='none';});
  const outside=(event)=>{if(!wrapper.contains(event.target))list.style.display='none';};
  document.addEventListener('click',outside);
  closeGuestSearch=()=>document.removeEventListener('click',outside);
  return {search,hidden,list,renderList};
};

const makeGuestsSelect=(field,placeholder)=>{
  if(!field)return null;
  if(field.tagName==='SELECT')return field;
  const select=document.createElement('select');
  Array.from(field.attributes).forEach(attribute=>{if(attribute.name!=='type'&&attribute.name!=='value')select.setAttribute(attribute.name,attribute.value);});
  select.name=field.name;
  select.id=field.id;
  select.innerHTML='<option value="">'+placeholder+'</option>';
  field.replaceWith(select);
  return select;
};

const nameControl=makeGuestSearch(nameField);
const nameHidden=nameControl?.hidden;
const nameSearch=nameControl?.search;
const guestSelect=makeGuestsSelect(guestsField,'Selecciona cuántos asistirán');

const updateGuestOptions=()=>{
  if(!nameHidden||!guestSelect)return;
  const selected=guestOptions.find((guest)=>guest.id===nameHidden.value)||null;
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
  if(!nameHidden||!nameSearch)return;
  const previousId=keepName?String(nameHidden.value||''):'';
  const selected=guestOptions.find((guest)=>guest.id===previousId)||null;
  if(selected){
    nameHidden.value=selected.id;
    selectedGuestId=selected.id;
    nameSearch.value=selected.name;
  }else{
    nameHidden.value='';
    selectedGuestId='';
    if(!keepName)nameSearch.value='';
  }
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
    if(nameControl?.list)nameControl.list.style.display='none';
    if(!guestOptions.length){
      if(button)button.disabled=true;
      if(!silent)setMessage('La lista de invitados todavía no está configurada.');
    }else if(success&&success.textContent&&/lista de invitados/i.test(success.textContent))success.innerHTML='';
  }catch(error){
    if(button)button.disabled=true;
    if(!silent)setMessage(error?.message||'No se pudo cargar la lista de invitados.');
  }
};

void loadGuests(false);
refreshTimer=window.setInterval(()=>{if(document.visibilityState==='visible')void loadGuests(true)},5000);

form.addEventListener('submit',async(event)=>{
  event.preventDefault();
  event.stopImmediatePropagation();
  const selected=guestOptions.find((guest)=>guest.id===nameHidden?.value);
  if(!selected){setMessage('Selecciona un invitado de la lista.');return;}
  const requestedGuests=Number(guestSelect?.value||1);
  const maxGuests=Math.max(1,Number(selected.guests)||1);
  if(requestedGuests<1||requestedGuests>maxGuests){setMessage('La cantidad de invitados permitida para este nombre ya no está disponible.');void loadGuests(true);return;}
  if(button)button.disabled=true;
  if(success)success.innerHTML='';
  const data={guestId:String(selectedGuestId||selected.id),name:String(selected.name||'').trim(),attendance:String(form.elements.attendance?.value||''),guests:requestedGuests,message:String(form.elements.message?.value||'').trim()};
  try{
    const response=await fetch(api+'/guest/rsvp/'+encodeURIComponent(base),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
    let payload=null;
    try{payload=await response.json()}catch{}
    if(!response.ok)throw new Error(payload?.error||'No se pudo registrar la confirmación.');
    if(success)success.innerHTML='<div class="success">¡Gracias! Tu confirmación quedó registrada correctamente.</div>';
    form.reset();
    if(nameHidden)nameHidden.value='';
    if(nameSearch)nameSearch.value='';
    if(guestSelect)guestSelect.value='';
    selectedGuestId='';
    updateGuestOptions();
    void loadGuests(true);
  }catch(error){
    if(success)success.innerHTML='<div class="success">'+String(error?.message||'No se pudo registrar la confirmación.')+'</div>';
  }finally{updateGuestOptions();}
},true);

window.addEventListener('beforeunload',()=>{if(refreshTimer)window.clearInterval(refreshTimer);closeGuestSearch()});
})()</script>`

  const source = String(html || '')
    .replace(/<script id="wedding-guest-rsvp-config">[\s\S]*?<\/script>/i, '')
    .replace(/<script id="wedding-guest-rsvp-script">[\s\S]*?<\/script>/i, '')
    .replace(/<script id="wedding-guest-rsvp-legacy">[\s\S]*?<\/script>/i, '')

  return source.replace('</body>', `${config}${script}</body>`)
}

export default applyWeddingGuestRsvp
