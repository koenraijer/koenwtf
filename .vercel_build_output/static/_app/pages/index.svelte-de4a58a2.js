import{_ as Se}from"../chunks/preload-helper-ec9aa979.js";import{S as rt,i as ot,s as it,e as o,t as p,k as I,c as i,a as c,g as _,d as t,n as j,b as s,f as V,H as e,h as Ve,W as Xe,j as ct,m as nt,F as Ye,o as ht,x as ft,u as dt,v as vt}from"../chunks/vendor-43e105ad.js";import{S as ut}from"../chunks/Seo-6b6c9f65.js";function Ze(u,r,n){const h=u.slice();return h[2]=r[n].path,h[3]=r[n].metadata.title,h[4]=r[n].metadata.tags,h[5]=r[n].metadata.date,h}function et(u,r,n){const h=u.slice();return h[8]=r[n],h}function tt(u){let r,n,h,g=u[8]+"",x,E,P;return{c(){r=o("span"),n=o("a"),h=p("#"),x=p(g),P=p("\xA0"),this.h()},l(k){r=i(k,"SPAN",{class:!0});var f=c(r);n=i(f,"A",{href:!0,class:!0});var y=c(n);h=_(y,"#"),x=_(y,g),y.forEach(t),P=_(f,"\xA0"),f.forEach(t),this.h()},h(){s(n,"href",E=`/tags/${u[8]}`),s(n,"class","svelte-kgi98x"),s(r,"class","tag svelte-kgi98x")},m(k,f){V(k,r,f),e(r,n),e(n,h),e(n,x),e(r,P)},p(k,f){f&1&&g!==(g=k[8]+"")&&Ve(x,g),f&1&&E!==(E=`/tags/${k[8]}`)&&s(n,"href",E)},d(k){k&&t(r)}}}function st(u){let r,n,h=u[3]+"",g,x,E,P,k=new Date(u[5]).toLocaleDateString()+"",f,y,H,M,w=u[4],m=[];for(let a=0;a<w.length;a+=1)m[a]=tt(et(u,w,a));return{c(){r=o("h3"),n=o("a"),g=p(h),E=I(),P=o("span"),f=p(k),y=I();for(let a=0;a<m.length;a+=1)m[a].c();H=I(),M=o("hr"),this.h()},l(a){r=i(a,"H3",{class:!0});var d=c(r);n=i(d,"A",{href:!0,class:!0});var v=c(n);g=_(v,h),v.forEach(t),d.forEach(t),E=j(a),P=i(a,"SPAN",{class:!0});var A=c(P);f=_(A,k),A.forEach(t),y=j(a);for(let T=0;T<m.length;T+=1)m[T].l(a);H=j(a),M=i(a,"HR",{}),this.h()},h(){s(n,"href",x=`${u[2].replace(".md","")}`),s(n,"class","svelte-kgi98x"),s(r,"class","svelte-kgi98x"),s(P,"class","date svelte-kgi98x")},m(a,d){V(a,r,d),e(r,n),e(n,g),V(a,E,d),V(a,P,d),e(P,f),V(a,y,d);for(let v=0;v<m.length;v+=1)m[v].m(a,d);V(a,H,d),V(a,M,d)},p(a,d){if(d&1&&h!==(h=a[3]+"")&&Ve(g,h),d&1&&x!==(x=`${a[2].replace(".md","")}`)&&s(n,"href",x),d&1&&k!==(k=new Date(a[5]).toLocaleDateString()+"")&&Ve(f,k),d&1){w=a[4];let v;for(v=0;v<w.length;v+=1){const A=et(a,w,v);m[v]?m[v].p(A,d):(m[v]=tt(A),m[v].c(),m[v].m(H.parentNode,H))}for(;v<m.length;v+=1)m[v].d(1);m.length=w.length}},d(a){a&&t(r),a&&t(E),a&&t(P),a&&t(y),Xe(m,a),a&&t(H),a&&t(M)}}}function pt(u){let r,n,h,g,x,E,P,k,f,y,H,M,w,m,a,d,v,A,T,fe,G,de,ve,ue,L,z,Q,pe,_e,q,me,ge,R,B,U,J,ke,be,X,Ee,ye,C,Y,Z,K,xe,we,ee,De,ae,$,F,Ie,je,re,O,W,Pe,oe;r=new ut({props:{pageTitle:_t,metaDescription:mt}});let te=u[0].slice(0,4),D=[];for(let l=0;l<te.length;l+=1)D[l]=st(Ze(u,te,l));return{c(){ct(r.$$.fragment),n=I(),h=o("h2"),g=p("hi! I might blog here about about beginner web development (I'm a noob). I also study medicine. Welcome to my online hub."),x=I(),E=o("h2"),P=p("Projects"),k=I(),f=o("div"),y=o("div"),H=o("div"),M=o("h3"),w=o("a"),m=p("my charity website"),a=I(),d=o("p"),v=p("Climbing a mountain for charity. Made a "),A=o("a"),T=p("website"),fe=p(" for it using Jekyll and Netlify. Consider "),G=o("a"),de=p("donating"),ve=p("!"),ue=I(),L=o("div"),z=o("div"),Q=o("h3"),pe=p("this blog"),_e=I(),q=o("p"),me=p("Maxed out Jekyll, and felt overwhelmed by React. In comes SvelteKit!"),ge=I(),R=o("div"),B=o("div"),U=o("h3"),J=o("a"),ke=p("an investing calculator"),be=I(),X=o("p"),Ee=p("Making this in SvelteKit was a breeze. My Python version stranded due the price of Flask hosting."),ye=I(),C=o("div"),Y=o("div"),Z=o("h3"),K=o("a"),xe=p("interactive diagnostic flowchart"),we=I(),ee=o("p"),De=p("Quick and dirty way to diagnose thyroid problems. Adapted from a flowchart by the NHG (Dutch GP association)."),ae=I(),$=o("div"),F=o("h2"),Ie=p("Latest posts"),je=I();for(let l=0;l<D.length;l+=1)D[l].c();re=I(),O=o("span"),W=o("a"),Pe=p("all posts \u2794"),this.h()},l(l){nt(r.$$.fragment,l),n=j(l),h=i(l,"H2",{style:!0});var S=c(h);g=_(S,"hi! I might blog here about about beginner web development (I'm a noob). I also study medicine. Welcome to my online hub."),S.forEach(t),x=j(l),E=i(l,"H2",{id:!0,class:!0});var b=c(E);P=_(b,"Projects"),b.forEach(t),k=j(l),f=i(l,"DIV",{class:!0});var N=c(f);y=i(N,"DIV",{class:!0});var ie=c(y);H=i(ie,"DIV",{class:!0});var He=c(H);M=i(He,"H3",{class:!0});var $e=c(M);w=i($e,"A",{target:!0,rel:!0,href:!0,class:!0});var Me=c(w);m=_(Me,"my charity website"),Me.forEach(t),$e.forEach(t),He.forEach(t),a=j(ie),d=i(ie,"P",{class:!0});var se=c(d);v=_(se,"Climbing a mountain for charity. Made a "),A=i(se,"A",{target:!0,rel:!0,href:!0,class:!0});var Ne=c(A);T=_(Ne,"website"),Ne.forEach(t),fe=_(se," for it using Jekyll and Netlify. Consider "),G=i(se,"A",{href:!0,class:!0});var Le=c(G);de=_(Le,"donating"),Le.forEach(t),ve=_(se,"!"),se.forEach(t),ie.forEach(t),ue=j(N),L=i(N,"DIV",{class:!0});var ce=c(L);z=i(ce,"DIV",{class:!0});var Re=c(z);Q=i(Re,"H3",{class:!0});var Ce=c(Q);pe=_(Ce,"this blog"),Ce.forEach(t),Re.forEach(t),_e=j(ce),q=i(ce,"P",{class:!0});var Te=c(q);me=_(Te,"Maxed out Jekyll, and felt overwhelmed by React. In comes SvelteKit!"),Te.forEach(t),ce.forEach(t),ge=j(N),R=i(N,"DIV",{class:!0});var ne=c(R);B=i(ne,"DIV",{class:!0});var Ge=c(B);U=i(Ge,"H3",{class:!0});var Je=c(U);J=i(Je,"A",{href:!0,class:!0});var Ke=c(J);ke=_(Ke,"an investing calculator"),Ke.forEach(t),Je.forEach(t),Ge.forEach(t),be=j(ne),X=i(ne,"P",{class:!0});var Fe=c(X);Ee=_(Fe,"Making this in SvelteKit was a breeze. My Python version stranded due the price of Flask hosting."),Fe.forEach(t),ne.forEach(t),ye=j(N),C=i(N,"DIV",{class:!0});var he=c(C);Y=i(he,"DIV",{class:!0});var Oe=c(Y);Z=i(Oe,"H3",{class:!0});var We=c(Z);K=i(We,"A",{href:!0,class:!0});var ze=c(K);xe=_(ze,"interactive diagnostic flowchart"),ze.forEach(t),We.forEach(t),Oe.forEach(t),we=j(he),ee=i(he,"P",{class:!0});var Qe=c(ee);De=_(Qe,"Quick and dirty way to diagnose thyroid problems. Adapted from a flowchart by the NHG (Dutch GP association)."),Qe.forEach(t),he.forEach(t),N.forEach(t),ae=j(l),$=i(l,"DIV",{class:!0});var le=c($);F=i(le,"H2",{id:!0,class:!0});var qe=c(F);Ie=_(qe,"Latest posts"),qe.forEach(t),je=j(le);for(let Ae=0;Ae<D.length;Ae+=1)D[Ae].l(le);re=j(le),O=i(le,"SPAN",{style:!0,class:!0});var Be=c(O);W=i(Be,"A",{href:!0,class:!0});var Ue=c(W);Pe=_(Ue,"all posts \u2794"),Ue.forEach(t),Be.forEach(t),le.forEach(t),this.h()},h(){Ye(h,"font-weight","normal"),s(E,"id","projects"),s(E,"class","svelte-kgi98x"),s(w,"target","_blank"),s(w,"rel","noopener"),s(w,"href","https://www.vriendenvoorkika.nl/"),s(w,"class","svelte-kgi98x"),s(M,"class","svelte-kgi98x"),s(H,"class","svelte-kgi98x"),s(A,"target","_blank"),s(A,"rel","noopener"),s(A,"href","https://www.vriendenvoorkika.nl/"),s(A,"class","svelte-kgi98x"),s(G,"href","https://www.actievoorkika.nl/sanne-koen-thomas-en-romy"),s(G,"class","svelte-kgi98x"),s(d,"class","svelte-kgi98x"),s(y,"class","project svelte-kgi98x"),s(Q,"class","svelte-kgi98x"),s(z,"class","svelte-kgi98x"),s(q,"class","svelte-kgi98x"),s(L,"class","project svelte-kgi98x"),s(J,"href","/calculator"),s(J,"class","svelte-kgi98x"),s(U,"class","svelte-kgi98x"),s(B,"class","svelte-kgi98x"),s(X,"class","svelte-kgi98x"),s(R,"class","project svelte-kgi98x"),s(K,"href","/flowcharts/schildklier"),s(K,"class","svelte-kgi98x"),s(Z,"class","svelte-kgi98x"),s(Y,"class","svelte-kgi98x"),s(ee,"class","svelte-kgi98x"),s(C,"class","project svelte-kgi98x"),s(f,"class","project-parent svelte-kgi98x"),s(F,"id","blogposts"),s(F,"class","svelte-kgi98x"),s(W,"href","/blog"),s(W,"class","svelte-kgi98x"),Ye(O,"float","right"),s(O,"class","svelte-kgi98x"),s($,"class","blog svelte-kgi98x")},m(l,S){ht(r,l,S),V(l,n,S),V(l,h,S),e(h,g),V(l,x,S),V(l,E,S),e(E,P),V(l,k,S),V(l,f,S),e(f,y),e(y,H),e(H,M),e(M,w),e(w,m),e(y,a),e(y,d),e(d,v),e(d,A),e(A,T),e(d,fe),e(d,G),e(G,de),e(d,ve),e(f,ue),e(f,L),e(L,z),e(z,Q),e(Q,pe),e(L,_e),e(L,q),e(q,me),e(f,ge),e(f,R),e(R,B),e(B,U),e(U,J),e(J,ke),e(R,be),e(R,X),e(X,Ee),e(f,ye),e(f,C),e(C,Y),e(Y,Z),e(Z,K),e(K,xe),e(C,we),e(C,ee),e(ee,De),V(l,ae,S),V(l,$,S),e($,F),e(F,Ie),e($,je);for(let b=0;b<D.length;b+=1)D[b].m($,null);e($,re),e($,O),e(O,W),e(W,Pe),oe=!0},p(l,[S]){if(S&1){te=l[0].slice(0,4);let b;for(b=0;b<te.length;b+=1){const N=Ze(l,te,b);D[b]?D[b].p(N,S):(D[b]=st(N),D[b].c(),D[b].m($,re))}for(;b<D.length;b+=1)D[b].d(1);D.length=te.length}},i(l){oe||(ft(r.$$.fragment,l),oe=!0)},o(l){dt(r.$$.fragment,l),oe=!1},d(l){vt(r,l),l&&t(n),l&&t(h),l&&t(x),l&&t(E),l&&t(k),l&&t(f),l&&t(ae),l&&t($),Xe(D,l)}}}const lt={"./blog/firstpost.md":()=>Se(()=>import("./blog/firstpost.md-ef3c96fd.js"),["pages/blog/firstpost.md-ef3c96fd.js","chunks/vendor-43e105ad.js","chunks/Seo-6b6c9f65.js"]),"./blog/secondpost.md":()=>Se(()=>import("./blog/secondpost.md-1196b3f0.js"),["pages/blog/secondpost.md-1196b3f0.js","chunks/vendor-43e105ad.js","chunks/Seo-6b6c9f65.js"]),"./blog/thirdpost.md":()=>Se(()=>import("./blog/thirdpost.md-ee3755a6.js"),["pages/blog/thirdpost.md-ee3755a6.js","chunks/vendor-43e105ad.js","chunks/Seo-6b6c9f65.js"])};let at=[];for(let u in lt)at.push(lt[u]().then(({metadata:r})=>({path:u,metadata:r})));const yt=async()=>({props:{posts:await Promise.all(at)}});let _t="home",mt="The homepage: a collection of projects and blog posts.";function gt(u,r,n){let{posts:h}=r;return h.slice().sort((g,x)=>new Date(x.metadata.date)-new Date(g.metadata.date)),u.$$set=g=>{"posts"in g&&n(0,h=g.posts)},[h]}class xt extends rt{constructor(r){super();ot(this,r,gt,pt,it,{posts:0})}}export{xt as default,yt as load};
