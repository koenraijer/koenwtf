import{S as u,i as b,s as m,e as y,c as C,a as _,d as h,b as c,f as g,I as d,z as x,V as w,W as S}from"./vendor-f44d96e0.js";function V(s){let t;return{c(){t=y("canvas"),this.h()},l(a){t=C(a,"CANVAS",{id:!0,width:!0,height:!0}),_(t).forEach(h),this.h()},h(){c(t,"id","myChart"),c(t,"width","500px"),c(t,"height","500px")},m(a,n){g(a,t,n),s[4](t)},p:d,i:d,o:d,d(a){a&&h(t),s[4](null)}}}function k(s,t,a){let{data:n}=t,{colors:l}=t,{labels:o}=t,r,i;x(()=>{r&&r.destroy(),r=new w(i,{type:"pie",data:{labels:o,datasets:[{label:"# of Votes",data:n,backgroundColor:l,borderColor:l,borderWidth:1}]},options:{scales:{x:{display:!1},y:{display:!1}}}})});function f(e){S[e?"unshift":"push"](()=>{i=e,a(0,i)})}return s.$$set=e=>{"data"in e&&a(1,n=e.data),"colors"in e&&a(2,l=e.colors),"labels"in e&&a(3,o=e.labels)},[i,n,l,o,f]}class W extends u{constructor(t){super();b(this,t,k,V,m,{data:1,colors:2,labels:3})}}export{W as C};
