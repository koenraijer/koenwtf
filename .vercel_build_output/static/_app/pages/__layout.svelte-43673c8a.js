import{S as U,i as V,s as L,e as T,D as X,c as B,a as y,E as Y,d as c,b as _,F as w,G as ne,f as E,H as D,I as j,J as le,K as oe,L as se,M as ie,N as ae,x as S,u as A,B as re,O as W,P as Z,j as z,k as q,m as F,n as M,o as G,p as ue,q as fe,Q as x,v as J,z as de,R as me,t as K,g as Q,T as _e,U as ce}from"../chunks/vendor-43e105ad.js";function he(n){let e,t,i,s,a,o;return{c(){e=T("button"),t=X("svg"),i=X("line"),s=X("line"),this.h()},l(l){e=B(l,"BUTTON",{name:!0,"aria-label":!0,id:!0,style:!0,class:!0});var u=y(e);t=Y(u,"svg",{class:!0,width:!0,height:!0});var b=y(t);i=Y(b,"line",{id:!0,x1:!0,y1:!0,x2:!0,y2:!0,style:!0,class:!0}),y(i).forEach(c),s=Y(b,"line",{id:!0,x1:!0,y1:!0,x2:!0,y2:!0,style:!0,class:!0}),y(s).forEach(c),b.forEach(c),u.forEach(c),this.h()},h(){_(i,"id","top"),_(i,"x1","0"),_(i,"y1","9"),_(i,"x2","32"),_(i,"y2","9"),w(i,"transition","transform "+n[1]+"s ease-in-out, opacity "+n[1]+"s ease-in-out"),_(i,"class","svelte-1ompq2"),_(s,"id","bot"),_(s,"x1","0"),_(s,"y1","28"),_(s,"x2","32"),_(s,"y2","28"),w(s,"transition","transform "+n[1]+"s ease-in-out, opacity "+n[1]+"s ease-in-out"),_(s,"class","svelte-1ompq2"),_(t,"class","hamburger svelte-1ompq2"),_(t,"width","32"),_(t,"height","32"),_(e,"name","Menu"),_(e,"aria-label","Menu"),_(e,"id","burger-button"),w(e,"transition","color "+n[1]+"s ease-in-out"),w(e,"color",n[0]?n[3]:n[2]),_(e,"class","svelte-1ompq2"),ne(e,"open",n[0])},m(l,u){E(l,e,u),D(e,t),D(t,i),D(t,s),a||(o=j(e,"click",n[4]),a=!0)},p(l,[u]){u&2&&w(i,"transition","transform "+l[1]+"s ease-in-out, opacity "+l[1]+"s ease-in-out"),u&2&&w(s,"transition","transform "+l[1]+"s ease-in-out, opacity "+l[1]+"s ease-in-out"),u&2&&w(e,"transition","color "+l[1]+"s ease-in-out"),u&13&&w(e,"color",l[0]?l[3]:l[2]),u&1&&ne(e,"open",l[0])},i:le,o:le,d(l){l&&c(e),a=!1,o()}}}function ge(n,e,t){let{open:i}=e,{duration:s}=e,{burgerColor:a}=e,{menuColor:o}=e;const l=()=>t(0,i=!i);return n.$$set=u=>{"open"in u&&t(0,i=u.open),"duration"in u&&t(1,s=u.duration),"burgerColor"in u&&t(2,a=u.burgerColor),"menuColor"in u&&t(3,o=u.menuColor)},[i,s,a,o,l]}class be extends U{constructor(e){super();V(this,e,ge,he,L,{open:0,duration:1,burgerColor:2,menuColor:3})}}function ve(n){let e,t,i;const s=n[8].default,a=oe(s,n,n[7],null);return{c(){e=T("div"),t=T("div"),a&&a.c(),this.h()},l(o){e=B(o,"DIV",{class:!0,style:!0});var l=y(e);t=B(l,"DIV",{id:!0,style:!0,class:!0});var u=y(t);a&&a.l(u),u.forEach(c),l.forEach(c),this.h()},h(){_(t,"id","menu"),w(t,"padding",n[3]),w(t,"padding-top",n[4]),w(t,"display",n[0]?"block":"none"),_(t,"class","svelte-1pavh4v"),_(e,"class","sidemenu svelte-1pavh4v"),w(e,"width",n[2]),w(e,"left",n[0]?"0px":"-"+n[2]),w(e,"transition","left "+n[1]+"s ease-in-out")},m(o,l){E(o,e,l),D(e,t),a&&a.m(t,null),i=!0},p(o,[l]){a&&a.p&&(!i||l&128)&&se(a,s,o,o[7],i?ae(s,o[7],l,null):ie(o[7]),null),(!i||l&8)&&w(t,"padding",o[3]),(!i||l&16)&&w(t,"padding-top",o[4]),(!i||l&1)&&w(t,"display",o[0]?"block":"none"),(!i||l&4)&&w(e,"width",o[2]),(!i||l&5)&&w(e,"left",o[0]?"0px":"-"+o[2]),(!i||l&2)&&w(e,"transition","left "+o[1]+"s ease-in-out")},i(o){i||(S(a,o),i=!0)},o(o){A(a,o),i=!1},d(o){o&&c(e),a&&a.d(o)}}}function we(n,e,t){let{$$slots:i={},$$scope:s}=e,{open:a=!1}=e,{duration:o}=e,{width:l}=e,{padding:u}=e,{paddingTop:b}=e,{backgroundColor:v}=e,{menuColor:p}=e;return n.$$set=d=>{"open"in d&&t(0,a=d.open),"duration"in d&&t(1,o=d.duration),"width"in d&&t(2,l=d.width),"padding"in d&&t(3,u=d.padding),"paddingTop"in d&&t(4,b=d.paddingTop),"backgroundColor"in d&&t(5,v=d.backgroundColor),"menuColor"in d&&t(6,p=d.menuColor),"$$scope"in d&&t(7,s=d.$$scope)},[a,o,l,u,b,v,p,s,i]}class pe extends U{constructor(e){super();V(this,e,we,ve,L,{open:0,duration:1,width:2,padding:3,paddingTop:4,backgroundColor:5,menuColor:6})}}function ke(n){let e,t,i,s,a,o,l,u,b,v,p,d,f,r,g,k,H,I,O;function R(m){n[15](m)}let P={};return n[1]!==void 0&&(P.theme=n[1]),f=new me({props:P}),W.push(()=>Z(f,"theme",R)),{c(){e=T("h2"),t=T("a"),i=K("Home"),s=q(),a=T("h2"),o=T("a"),l=K("Blog"),u=q(),b=T("h2"),v=T("a"),p=K("Email me"),d=q(),z(f.$$.fragment),g=q(),k=T("input"),this.h()},l(m){e=B(m,"H2",{});var C=y(e);t=B(C,"A",{class:!0,href:!0});var N=y(t);i=Q(N,"Home"),N.forEach(c),C.forEach(c),s=M(m),a=B(m,"H2",{});var h=y(a);o=B(h,"A",{class:!0,href:!0});var $=y(o);l=Q($,"Blog"),$.forEach(c),h.forEach(c),u=M(m),b=B(m,"H2",{});var ee=y(b);v=B(ee,"A",{class:!0,href:!0});var te=y(v);p=Q(te,"Email me"),te.forEach(c),ee.forEach(c),d=M(m),F(f.$$.fragment,m),g=M(m),k=B(m,"INPUT",{"aria-label":!0,name:!0,class:!0,type:!0}),this.h()},h(){_(t,"class","menuitem svelte-pa3h4w"),_(t,"href","/"),_(o,"class","menuitem svelte-pa3h4w"),_(o,"href","/blog"),_(v,"class","menuitem svelte-pa3h4w"),_(v,"href","mailto:koenraijer@protonmail.com"),_(k,"aria-label","Darkmode"),_(k,"name","Darkmode"),_(k,"class","toggle svelte-pa3h4w"),_(k,"type","checkbox")},m(m,C){E(m,e,C),D(e,t),D(t,i),E(m,s,C),E(m,a,C),D(a,o),D(o,l),E(m,u,C),E(m,b,C),D(b,v),D(v,p),E(m,d,C),G(f,m,C),E(m,g,C),E(m,k,C),H=!0,I||(O=[j(t,"click",n[13]),j(o,"click",n[14]),j(k,"click",n[16])],I=!0)},p(m,C){const N={};!r&&C&2&&(r=!0,N.theme=m[1],x(()=>r=!1)),f.$set(N)},i(m){H||(S(f.$$.fragment,m),H=!0)},o(m){A(f.$$.fragment,m),H=!1},d(m){m&&c(e),m&&c(s),m&&c(a),m&&c(u),m&&c(b),m&&c(d),J(f,m),m&&c(g),m&&c(k),I=!1,_e(O)}}}function Ce(n){let e,t,i,s,a,o,l;const u=[n[3]];function b(r){n[12](r)}let v={};for(let r=0;r<u.length;r+=1)v=re(v,u[r]);n[0]!==void 0&&(v.open=n[0]),t=new be({props:v}),W.push(()=>Z(t,"open",b));const p=[n[4]];function d(r){n[17](r)}let f={$$slots:{default:[ke]},$$scope:{ctx:n}};for(let r=0;r<p.length;r+=1)f=re(f,p[r]);return n[0]!==void 0&&(f.open=n[0]),a=new pe({props:f}),W.push(()=>Z(a,"open",d)),{c(){e=T("nav"),z(t.$$.fragment),s=q(),z(a.$$.fragment)},l(r){e=B(r,"NAV",{});var g=y(e);F(t.$$.fragment,g),s=M(g),F(a.$$.fragment,g),g.forEach(c)},m(r,g){E(r,e,g),G(t,e,null),D(e,s),G(a,e,null),l=!0},p(r,[g]){const k=g&8?ue(u,[fe(r[3])]):{};!i&&g&1&&(i=!0,k.open=r[0],x(()=>i=!1)),t.$set(k);const H=g&16?ue(p,[fe(r[4])]):{};g&4194311&&(H.$$scope={dirty:g,ctx:r}),!o&&g&1&&(o=!0,H.open=r[0],x(()=>o=!1)),a.$set(H)},i(r){l||(S(t.$$.fragment,r),S(a.$$.fragment,r),l=!0)},o(r){A(t.$$.fragment,r),A(a.$$.fragment,r),l=!1},d(r){r&&c(e),J(t),J(a)}}}function ye(n,e,t){let i,{open:s=!1}=e,{duration:a=.25}=e,{width:o="100vw"}=e,{padding:l="2rem"}=e,{paddingTop:u="4rem"}=e,{backgroundColor:b="#111344"}=e,{burgerColor:v="rgb(18.4, 18.4, 18.4)"}=e,{menuColor:p="white"}=e,d={duration:a,burgerColor:v,menuColor:p},f={duration:a,width:o,padding:l,paddingTop:u,backgroundColor:b,menuColor:p},r;de(()=>{document.body.className=r});let g=null,k=null;function H(){g=window.pageYOffset||window.document.documentElement.scrollTop,k=window.pageXOffset||window.document.documentElement.scrollLeft,window.onscroll=function(){window.scrollTo(k,g)}}function I(){window.onscroll=function(){}}function O(h){s=h,t(0,s)}const R=()=>t(0,s=!s),P=()=>t(0,s=!s);function m(h){r=h,t(1,r)}const C=()=>t(1,r=i);function N(h){s=h,t(0,s)}return n.$$set=h=>{"open"in h&&t(0,s=h.open),"duration"in h&&t(5,a=h.duration),"width"in h&&t(6,o=h.width),"padding"in h&&t(7,l=h.padding),"paddingTop"in h&&t(8,u=h.paddingTop),"backgroundColor"in h&&t(9,b=h.backgroundColor),"burgerColor"in h&&t(10,v=h.burgerColor),"menuColor"in h&&t(11,p=h.menuColor)},n.$$.update=()=>{n.$$.dirty&2&&t(2,i=r==="dark"?"light":"dark"),n.$$.dirty&1&&(s?H():I())},[s,r,i,d,f,a,o,l,u,b,v,p,O,R,P,m,C,N]}class Ee extends U{constructor(e){super();V(this,e,ye,Ce,L,{open:0,duration:5,width:6,padding:7,paddingTop:8,backgroundColor:9,burgerColor:10,menuColor:11})}}function Te(n){let e,t,i,s,a,o,l,u,b,v;e=new Ee({});const p=n[3].default,d=oe(p,n,n[2],null);return{c(){z(e.$$.fragment),t=q(),i=T("h1"),s=T("a"),a=K("koen.wtf"),o=q(),l=T("div"),d&&d.c(),this.h()},l(f){F(e.$$.fragment,f),t=M(f),i=B(f,"H1",{class:!0});var r=y(i);s=B(r,"A",{href:!0,class:!0});var g=y(s);a=Q(g,"koen.wtf"),g.forEach(c),r.forEach(c),o=M(f),l=B(f,"DIV",{class:!0});var k=y(l);d&&d.l(k),k.forEach(c),this.h()},h(){_(s,"href","/"),_(s,"class","svelte-67lmra"),_(i,"class","sitetitle svelte-67lmra"),_(l,"class","container svelte-67lmra")},m(f,r){G(e,f,r),E(f,t,r),E(f,i,r),D(i,s),D(s,a),E(f,o,r),E(f,l,r),d&&d.m(l,null),u=!0,b||(v=j(s,"click",function(){ce(n[0]=!1)&&(n[0]=!1).apply(this,arguments)}),b=!0)},p(f,[r]){n=f,d&&d.p&&(!u||r&4)&&se(d,p,n,n[2],u?ae(p,n[2],r,null):ie(n[2]),null)},i(f){u||(S(e.$$.fragment,f),S(d,f),u=!0)},o(f){A(e.$$.fragment,f),A(d,f),u=!1},d(f){J(e,f),f&&c(t),f&&c(i),f&&c(o),f&&c(l),d&&d.d(f),b=!1,v()}}}function Be(n,e,t){let{$$slots:i={},$$scope:s}=e,{location:a}=e,{open:o=!1}=e;return n.$$set=l=>{"location"in l&&t(1,a=l.location),"open"in l&&t(0,o=l.open),"$$scope"in l&&t(2,s=l.$$scope)},[o,a,s,i]}class He extends U{constructor(e){super();V(this,e,Be,Te,L,{location:1,open:0})}}export{He as default};
