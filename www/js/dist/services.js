!function(){"use strict";function t(){this.SubtrairData=function(t){var e=new Date;return e.setDate(e.getDate()-t),this.formatarData(e)},this.SubtrairDataSemFormato=function(t){var e=new Date;return e.setDate(e.getDate()-t),e},this.formatarData=function(t){return t.getDate()+"/"+this.RetornarMes(t)+"/"+t.getFullYear()},this.formatarDataAPI=function(t){return t.getDate()+"-"+this.RetornarMes(t)+"-"+t.getFullYear()},this.formatarDataHora=function(t){return t.getDate()+"-"+this.RetornarMes(t)+"-"+t.getFullYear()+" "+t.getHours()+":"+t.getMinutes()+":"+t.getSeconds()},this.RetornarDataHora=function(){var t=new Date;return t.getDate()+"/"+this.RetornarMes(t)+"/"+t.getFullYear()+" "+t.getHours()+":"+t.getMinutes()},this.RetornarMes=function(t){var e=t.getMonth()+1;return e<10&&(e="0"+e),e}}angular.module("sied.services").service("TratarDataService",t)}(),function(){"use strict";function t(){this.ConverterParaFloat=function(t){return""===t?0:(t=t.replace(".",""),t=t.replace(",","."),parseFloat(t))},this.ConverterParaString=function(t){var e=null,r=null,a=null,n=null,s=new Array;for((a=(t=""+t).indexOf(".",0))>0?(e=t.substring(0,a),r=t.substring(a+1,t.length)):e=t,n=e.length,a=0;n>0;n-=3,a++)s[a]=e.substring(n-3,n);for(e="",a=s.length-1;a>=0;a--)e+=s[a]+".";return e=e.substring(0,e.length-1),r=parseInt(r),isNaN(r)?r="00":1===(r=""+r).length&&(r+="0"),e+","+r}}angular.module("sied.services").service("TratarFloatService",t)}(),function(){"use strict";function t(){this.ContarObjetos=function(t){var e=0;for(var r in t)t.hasOwnProperty(r)&&e++;return e}}angular.module("sied.services").service("TratarObjetosService",t)}();