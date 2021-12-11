import{_ as at}from"../chunks/preload-helper-ec9aa979.js";import{S as $e,i as Me,s as Se,e as c,k as j,c as i,a as f,d as n,n as V,b as l,E as Te,f as x,F as t,L as re,t as $,g as M,h as Le,j as _e,m as me,o as ge,x as ee,u as ne,v as pe,w as rt,M as Xe,r as nt}from"../chunks/vendor-4f02d0e1.js";import{S as ot}from"../chunks/Seo-1255c03d.js";import{T as ct}from"../chunks/TagCloud-26f7f495.js";function it(d){let e,r,s,h,v,p,u,I,E,w,m;return{c(){e=c("a"),r=c("div"),s=c("div"),h=c("div"),v=c("img"),u=j(),I=c("div"),E=c("h3"),w=j(),m=c("p"),this.h()},l(b){e=i(b,"A",{class:!0,target:!0,rel:!0,href:!0});var k=f(e);r=i(k,"DIV",{class:!0});var P=f(r);s=i(P,"DIV",{class:!0});var D=f(s);h=i(D,"DIV",{class:!0});var H=f(h);v=i(H,"IMG",{alt:!0,src:!0,class:!0}),H.forEach(n),D.forEach(n),u=V(P),I=i(P,"DIV",{class:!0});var y=f(I);E=i(y,"H3",{class:!0});var R=f(E);R.forEach(n),w=V(y),m=i(y,"P",{class:!0});var B=f(m);B.forEach(n),y.forEach(n),P.forEach(n),k.forEach(n),this.h()},h(){l(v,"alt","simple brushed line decoration"),Te(v.src,p=d[3])||l(v,"src",p),l(v,"class","svelte-1e98161"),l(h,"class","svelte-1e98161"),l(s,"class","svelte-1e98161"),l(E,"class","svelte-1e98161"),l(m,"class","svelte-1e98161"),l(I,"class","svelte-1e98161"),l(r,"class","project svelte-1e98161"),l(e,"class","divlink svelte-1e98161"),l(e,"target","_blank"),l(e,"rel","noopener"),l(e,"href",d[1])},m(b,k){x(b,e,k),t(e,r),t(r,s),t(s,h),t(h,v),t(r,u),t(r,I),t(I,E),E.innerHTML=d[0],t(I,w),t(I,m),m.innerHTML=d[2]},p(b,[k]){k&8&&!Te(v.src,p=b[3])&&l(v,"src",p),k&1&&(E.innerHTML=b[0]),k&4&&(m.innerHTML=b[2]),k&2&&l(e,"href",b[1])},i:re,o:re,d(b){b&&n(e)}}}function ft(d,e,r){let{title:s="a project"}=e,{src:h="/"}=e,{description:v="a project about something."}=e,{img:p="&#128161"}=e;return d.$$set=u=>{"title"in u&&r(0,s=u.title),"src"in u&&r(1,h=u.src),"description"in u&&r(2,v=u.description),"img"in u&&r(3,p=u.img)},[s,h,v,p]}class dt extends $e{constructor(e){super();Me(this,e,ft,it,Se,{title:0,src:1,description:2,img:3})}}function vt(d){let e,r;return{c(){e=c("img"),this.h()},l(s){e=i(s,"IMG",{alt:!0,src:!0,class:!0}),this.h()},h(){l(e,"alt","man with map on top of 404-error statue trying to figure out what to do"),Te(e.src,r="artError-3.svg")||l(e,"src",r),l(e,"class","svelte-16mom80")},m(s,h){x(s,e,h)},p:re,i:re,o:re,d(s){s&&n(e)}}}class ht extends $e{constructor(e){super();Me(this,e,null,vt,Se,{})}}function Ye(d,e,r){const s=d.slice();return s[3]=e[r].title,s[4]=e[r].src,s[5]=e[r].description,s[6]=e[r].img,s}function Ze(d,e,r){const s=d.slice();return s[9]=e[r].path,s[3]=e[r].metadata.title,s[10]=e[r].metadata.snippet,s[11]=e[r].metadata.date,s}function xe(d){let e,r,s,h=d[3]+"",v,p,u,I=new Date(d[11]).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})+"",E,w,m,b=d[10]+"",k,P;return{c(){e=c("a"),r=c("div"),s=c("h3"),v=$(h),p=j(),u=c("span"),E=$(I),w=j(),m=c("p"),k=$(b),this.h()},l(D){e=i(D,"A",{class:!0,href:!0});var H=f(e);r=i(H,"DIV",{class:!0});var y=f(r);s=i(y,"H3",{class:!0});var R=f(s);v=M(R,h),R.forEach(n),p=V(y),u=i(y,"SPAN",{class:!0});var B=f(u);E=M(B,I),B.forEach(n),w=V(y),m=i(y,"P",{class:!0});var S=f(m);k=M(S,b),S.forEach(n),y.forEach(n),H.forEach(n),this.h()},h(){l(s,"class","svelte-19flcwn"),l(u,"class","date svelte-19flcwn"),l(m,"class","svelte-19flcwn"),l(r,"class","blogPost svelte-19flcwn"),l(e,"class","divlink svelte-19flcwn"),l(e,"href",P=`${d[9].replace(".md","")}`)},m(D,H){x(D,e,H),t(e,r),t(r,s),t(s,v),t(r,p),t(r,u),t(u,E),t(r,w),t(r,m),t(m,k)},p(D,H){H&1&&h!==(h=D[3]+"")&&Le(v,h),H&1&&I!==(I=new Date(D[11]).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})+"")&&Le(E,I),H&1&&b!==(b=D[10]+"")&&Le(k,b),H&1&&P!==(P=`${D[9].replace(".md","")}`)&&l(e,"href",P)},d(D){D&&n(e)}}}function et(d){let e,r;return e=new dt({props:{title:d[3],src:d[4],description:d[5],img:d[6]}}),{c(){_e(e.$$.fragment)},l(s){me(e.$$.fragment,s)},m(s,h){ge(e,s,h),r=!0},p:re,i(s){r||(ee(e.$$.fragment,s),r=!0)},o(s){ne(e.$$.fragment,s),r=!1},d(s){pe(e,s)}}}function ut(d){let e,r,s,h,v,p,u,I,E,w,m,b,k,P,D,H,y,R,B,S,G,we,be,J,Ee,oe,T,K,N,U,Ie,ke,C,ce,z,te,se,ye,De,q,O,je,Ve,Q,Pe,W,He,Ae,X,ie;e=new ot({props:{pageTitle:_t,metaDescription:mt}}),u=new ht({});let le=d[0].slice(0,4),A=[];for(let a=0;a<le.length;a+=1)A[a]=xe(Ze(d,le,a));Q=new ct({});let Y=d[1],_=[];for(let a=0;a<Y.length;a+=1)_[a]=et(Ye(d,Y,a));const lt=a=>ne(_[a],1,1,()=>{_[a]=null});return{c(){_e(e.$$.fragment),r=j(),s=c("div"),h=c("div"),v=c("div"),p=c("div"),_e(u.$$.fragment),I=j(),E=c("div"),w=c("div"),m=c("h2"),b=$("Hi, I'm Koen!"),k=j(),P=c("h1"),D=$("I do some programming in my off-time."),H=j(),y=c("h3"),R=$("I write about web development as if you knew nothing, because neither do I!"),B=j(),S=c("nav"),G=c("a"),we=$("Blog"),be=j(),J=c("a"),Ee=$("Projects"),oe=j(),T=c("div"),K=c("div"),N=c("div"),U=c("h1"),Ie=$("Recently published"),ke=j(),C=c("div");for(let a=0;a<A.length;a+=1)A[a].c();ce=j(),z=c("a"),te=c("div"),se=c("h4"),ye=$("All posts \u2794"),De=j(),q=c("div"),O=c("h2"),je=$("Explore topics"),Ve=j(),_e(Q.$$.fragment),Pe=j(),W=c("h1"),He=$("Projects"),Ae=j(),X=c("div");for(let a=0;a<_.length;a+=1)_[a].c();this.h()},l(a){me(e.$$.fragment,a),r=V(a),s=i(a,"DIV",{class:!0});var g=f(s);h=i(g,"DIV",{class:!0});var o=f(h);v=i(o,"DIV",{class:!0});var L=f(v);p=i(L,"DIV",{class:!0});var Ce=f(p);me(u.$$.fragment,Ce),Ce.forEach(n),I=V(L),E=i(L,"DIV",{class:!0});var Re=f(E);w=i(Re,"DIV",{class:!0});var F=f(w);m=i(F,"H2",{class:!0});var Be=f(m);b=M(Be,"Hi, I'm Koen!"),Be.forEach(n),k=V(F),P=i(F,"H1",{class:!0});var Ke=f(P);D=M(Ke,"I do some programming in my off-time."),Ke.forEach(n),H=V(F),y=i(F,"H3",{class:!0});var Ne=f(y);R=M(Ne,"I write about web development as if you knew nothing, because neither do I!"),Ne.forEach(n),B=V(F),S=i(F,"NAV",{class:!0});var fe=f(S);G=i(fe,"A",{class:!0,href:!0});var qe=f(G);we=M(qe,"Blog"),qe.forEach(n),be=V(fe),J=i(fe,"A",{class:!0,href:!0});var Fe=f(J);Ee=M(Fe,"Projects"),Fe.forEach(n),fe.forEach(n),F.forEach(n),Re.forEach(n),L.forEach(n),o.forEach(n),g.forEach(n),oe=V(a),T=i(a,"DIV",{class:!0});var ae=f(T);K=i(ae,"DIV",{class:!0});var de=f(K);N=i(de,"DIV",{class:!0});var ve=f(N);U=i(ve,"H1",{id:!0,class:!0});var Ge=f(U);Ie=M(Ge,"Recently published"),Ge.forEach(n),ke=V(ve),C=i(ve,"DIV",{class:!0});var he=f(C);for(let Z=0;Z<A.length;Z+=1)A[Z].l(he);ce=V(he),z=i(he,"A",{href:!0,class:!0});var Je=f(z);te=i(Je,"DIV",{class:!0});var Ue=f(te);se=i(Ue,"H4",{class:!0});var ze=f(se);ye=M(ze,"All posts \u2794"),ze.forEach(n),Ue.forEach(n),Je.forEach(n),he.forEach(n),ve.forEach(n),De=V(de),q=i(de,"DIV",{class:!0});var ue=f(q);O=i(ue,"H2",{id:!0,class:!0});var Oe=f(O);je=M(Oe,"Explore topics"),Oe.forEach(n),Ve=V(ue),me(Q.$$.fragment,ue),ue.forEach(n),de.forEach(n),Pe=V(ae),W=i(ae,"H1",{id:!0,class:!0});var Qe=f(W);He=M(Qe,"Projects"),Qe.forEach(n),Ae=V(ae),X=i(ae,"DIV",{class:!0});var We=f(X);for(let Z=0;Z<_.length;Z+=1)_[Z].l(We);We.forEach(n),ae.forEach(n),this.h()},h(){l(p,"class","grid1-art svelte-19flcwn"),l(m,"class","svelte-19flcwn"),l(P,"class","svelte-19flcwn"),l(y,"class","svelte-19flcwn"),l(G,"class","button blogbutton svelte-19flcwn"),l(G,"href","#blogposts"),l(J,"class","button projectsbutton svelte-19flcwn"),l(J,"href","#projects"),l(S,"class","svelte-19flcwn"),l(w,"class","svelte-19flcwn"),l(E,"class","grid1-hero svelte-19flcwn"),l(v,"class","grid1 svelte-19flcwn"),l(h,"class","container svelte-19flcwn"),l(s,"class","hero-background svelte-19flcwn"),l(U,"id","blogposts"),l(U,"class","header svelte-19flcwn"),l(se,"class","svelte-19flcwn"),l(te,"class","blogPost allPostButton svelte-19flcwn"),l(z,"href","/blog"),l(z,"class","divlink svelte-19flcwn"),l(C,"class","blog-parent svelte-19flcwn"),l(N,"class","grid2-blog svelte-19flcwn"),l(O,"id","tags"),l(O,"class","header svelte-19flcwn"),l(q,"class","grid2-tags svelte-19flcwn"),l(K,"class","grid2 svelte-19flcwn"),l(W,"id","projects"),l(W,"class","header svelte-19flcwn"),l(X,"class","grid3 svelte-19flcwn"),l(T,"class","container svelte-19flcwn")},m(a,g){ge(e,a,g),x(a,r,g),x(a,s,g),t(s,h),t(h,v),t(v,p),ge(u,p,null),t(v,I),t(v,E),t(E,w),t(w,m),t(m,b),t(w,k),t(w,P),t(P,D),t(w,H),t(w,y),t(y,R),t(w,B),t(w,S),t(S,G),t(G,we),t(S,be),t(S,J),t(J,Ee),x(a,oe,g),x(a,T,g),t(T,K),t(K,N),t(N,U),t(U,Ie),t(N,ke),t(N,C);for(let o=0;o<A.length;o+=1)A[o].m(C,null);t(C,ce),t(C,z),t(z,te),t(te,se),t(se,ye),t(K,De),t(K,q),t(q,O),t(O,je),t(q,Ve),ge(Q,q,null),t(T,Pe),t(T,W),t(W,He),t(T,Ae),t(T,X);for(let o=0;o<_.length;o+=1)_[o].m(X,null);ie=!0},p(a,[g]){if(g&1){le=a[0].slice(0,4);let o;for(o=0;o<le.length;o+=1){const L=Ze(a,le,o);A[o]?A[o].p(L,g):(A[o]=xe(L),A[o].c(),A[o].m(C,ce))}for(;o<A.length;o+=1)A[o].d(1);A.length=le.length}if(g&2){Y=a[1];let o;for(o=0;o<Y.length;o+=1){const L=Ye(a,Y,o);_[o]?(_[o].p(L,g),ee(_[o],1)):(_[o]=et(L),_[o].c(),ee(_[o],1),_[o].m(X,null))}for(nt(),o=Y.length;o<_.length;o+=1)lt(o);rt()}},i(a){if(!ie){ee(e.$$.fragment,a),ee(u.$$.fragment,a),ee(Q.$$.fragment,a);for(let g=0;g<Y.length;g+=1)ee(_[g]);ie=!0}},o(a){ne(e.$$.fragment,a),ne(u.$$.fragment,a),ne(Q.$$.fragment,a),_=_.filter(Boolean);for(let g=0;g<_.length;g+=1)ne(_[g]);ie=!1},d(a){pe(e,a),a&&n(r),a&&n(s),pe(u),a&&n(oe),a&&n(T),Xe(A,a),pe(Q),Xe(_,a)}}}const tt={"./blog/globalstyles.md":()=>at(()=>import("./blog/globalstyles.md-793953de.js"),["pages/blog/globalstyles.md-793953de.js","assets/pages/blog/globalstyles.md-f14b30b6.css","chunks/vendor-4f02d0e1.js","chunks/Seo-1255c03d.js","chunks/Date-5bcd979e.js"])};let st=[];for(let d in tt)st.push(tt[d]().then(({metadata:e})=>({path:d,metadata:e})));const It=async()=>({props:{posts:await Promise.all(st)}});let _t="home",mt="The homepage: a collection of projects and blog posts.";function gt(d,e,r){let{posts:s}=e;s.slice().sort((v,p)=>new Date(p.metadata.date)-new Date(v.metadata.date));let h=[{title:'My charity website <span><img class="svg-icon" src="link.svg"></span>',src:"https://www.vriendenvoorkika.nl/",description:'Climbing a mountain for charity. Made a website for it using Jekyll and Netlify. Consider <a target="_blank" rel="noopener" href="https://www.actievoorkika.nl/sanne-koen-thomas-en-romy">donating</a>!',img:"illustration-crosses.svg"},{title:"This blog",src:"/",description:"Maxed out Jekyll, and felt overwhelmed by React. In comes SvelteKit!",img:"illustration-3scribbles.svg"},{title:"An investing calculator",src:"/calculator",description:"Making this in SvelteKit was a breeze. My Python version stranded due the price of Flask hosting.",img:"illustration-shapes.svg"}];return d.$$set=v=>{"posts"in v&&r(0,s=v.posts)},[s,h]}class kt extends $e{constructor(e){super();Me(this,e,gt,ut,Se,{posts:0})}}export{kt as default,It as load};
