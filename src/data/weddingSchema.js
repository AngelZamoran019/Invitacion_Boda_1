export const createDefaultWeddingProject = () => ({
  id: '', name: 'Nueva invitación', version: 'wedding-v1', template: 'wedding-v1', created: new Date().toISOString(), updated: new Date().toISOString(), published: false, publishedDate: null, cover: '',
  appearance: {
    backgroundColor:'#0b1730', backgroundMode:'solid', backgroundGradient:'', backgroundTextureType:'image', backgroundTextureImage:'', backgroundTexture:'none', backgroundTextureOpacity:0.45, backgroundTextureColor:'#ffffff', backgroundTextureBlend:'normal', backgroundTextureSize:'cover', backgroundTextureColorOverlay:true,
    accentColor:'#c9a86a', accentMode:'solid', accentGradient:'', textColor:'#ffffff', textMode:'solid', textGradient:'', fontFamily:"'Playfair Display',serif",
    typography: {
      title:{fontFamily:"'Playfair Display',serif",fontSize:42,color:'#ffffff',mode:'solid',gradient:'',fontWeight:500,lineHeight:1.08,letterSpacing:0},
      subtitle:{fontFamily:"'Playfair Display',serif",fontSize:16,color:'#ffffff',mode:'solid',gradient:'',fontWeight:400,lineHeight:1.5,letterSpacing:0},
      paragraph:{fontFamily:"'Playfair Display',serif",fontSize:16,color:'#ffffff',mode:'solid',gradient:'',fontWeight:400,lineHeight:1.7,letterSpacing:0},
      sectionTitle:{fontFamily:"'Playfair Display',serif",fontSize:32,color:'#ffffff',mode:'solid',gradient:'',fontWeight:500,lineHeight:1.15,letterSpacing:0},
      label:{fontFamily:"Arial,sans-serif",fontSize:11,color:'#c9a86a',mode:'solid',gradient:'',fontWeight:700,lineHeight:1.4,letterSpacing:2},
      small:{fontFamily:"Arial,sans-serif",fontSize:12,color:'#ffffff',mode:'solid',gradient:'',fontWeight:400,lineHeight:1.5,letterSpacing:0},
      button:{fontFamily:"Arial,sans-serif",fontSize:13,color:'#ffffff',mode:'solid',gradient:'',fontWeight:600,lineHeight:1.2,letterSpacing:.5}
    }
  },
  coverSection:{
    eyebrow:'Estás cordialmente invitado a la boda de',eyebrowColor:'#ffffff',eyebrowMode:'solid',eyebrowGradient:'',eyebrowSize:11,eyebrowFont:'Arial',
    title:'Nombre & Nombre',titleColor:'#ffffff',titleMode:'solid',titleGradient:'',titleSize:42,titleFont:'Arial',
    subtitle:'',date:'',dateColor:'#ffffff',dateMode:'solid',dateGradient:'',dateSize:12,dateFont:'Arial',
    venue:'',backgroundImage:'',ornamentColor:'#ffffff',ornamentMode:'solid',ornamentGradient:'',ornamentSize:30,
    lineColor:'',lineMode:'solid',lineGradient:'',lineSize:70,
    buttonLabel:'Abrir invitación',buttonColor:'#ffffff',buttonMode:'solid',buttonGradient:'',buttonSize:13,buttonFont:'Arial'
  },
  couple:{name1:'',name2:'',photo:'',photoOverlayOpacity:0.55,quote:''}, music:{enabled:false,url:'',title:''}, story:{sectionTitle:'Nuestra historia',title:'Nuestra historia',text:'',images:[]},
  event:{sectionTitle:'El gran día',date:'',time:'',ceremonyTitle:'Ceremonia',ceremonyVenue:'',ceremonyAddress:'',ceremonyMapsUrl:'',receptionTitle:'Recepción',receptionVenue:'',receptionAddress:'',receptionMapsUrl:''},
  countdown:{enabled:true,targetDate:'',sectionTitle:'La cuenta regresiva comienza'},
  dressCode:{enabled:true,sectionTitle:'Código de vestimenta',subtitle:'Elegancia para celebrar',menLabel:'Ellas',womenLabel:'Ellos',menAttire:'Formal',womenAttire:'Formal',note:''},
  gifts:{enabled:true,sectionTitle:'Un detalle especial',subtitle:'subtitulo',url:'',buttonLabel:'Ver mesa de regalos'}, recommendations:[],gallery:[],
  confirmation:{enabled:true,sectionTitle:'Por favor',subtitle:'Confirma tu asistencia',title:'Confirma tu asistencia',message:'Nos encantará saber si nos acompañas en este día tan especial.',url:'',buttonLabel:'Confirmar asistencia',successMessage:'¡Gracias! Hemos recibido tu confirmación.'}, closing:{image:'',message:''}
})
