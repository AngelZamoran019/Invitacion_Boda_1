export const createDefaultWeddingProject = () => ({
  id: '', name: 'Nueva invitación', version: 'wedding-v1', template: 'wedding-v1', created: new Date().toISOString(), updated: new Date().toISOString(), published: false, publishedDate: null, cover: '',
  appearance: { backgroundColor:'#0b1730', backgroundMode:'solid', backgroundGradient:'', accentColor:'#c9a86a', accentMode:'solid', accentGradient:'', textColor:'#ffffff', textMode:'solid', textGradient:'', fontFamily:"'Playfair Display',serif" },
  coverSection:{eyebrow:'Estás cordialmente invitado a la boda de',title:'Nombre & Nombre',subtitle:'',date:'',venue:'',backgroundImage:''},
  couple:{name1:'',name2:'',photo:'',quote:''}, music:{enabled:false,url:'',title:''}, story:{title:'Nuestra historia',text:'',images:[]},
  event:{date:'',time:'',ceremonyTitle:'Ceremonia',ceremonyVenue:'',ceremonyAddress:'',ceremonyMapsUrl:'',receptionTitle:'Recepción',receptionVenue:'',receptionAddress:'',receptionMapsUrl:''},
  countdown:{enabled:true,targetDate:''}, dressCode:{enabled:true,women:'',men:'',note:''}, gifts:{enabled:true,title:'Mesa de regalos',message:'',url:'',buttonLabel:'Ver mesa de regalos'}, recommendations:[],gallery:[],
  confirmation:{enabled:true,title:'Confirma tu asistencia',message:'Nos encantará saber si nos acompañas en este día tan especial.',url:'',buttonLabel:'Confirmar asistencia',successMessage:'¡Gracias! Hemos recibido tu confirmación.'}, closing:{image:'',message:''}
})
