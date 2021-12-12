import{S as Mt,i as Nt,s as Lt,j as qt,k as g,e as c,t as f,M as Ne,m as Bt,n as k,c as u,a as h,g as p,d as o,N as Le,b as e,O as St,o as Tt,f as N,F as l,P as ne,Q as qe,R as ce,h as ue,x as Vt,u as Dt,v as zt,T as Ct,l as Be,J as he}from"../chunks/vendor-2ca5b27b.js";import{S as Rt}from"../chunks/Seo-db1af496.js";function Ut(s){let a=Math.round(s[4])+"",t,r;return{c(){t=f(a),r=f("%")},l(n){t=p(n,a),r=p(n,"%")},m(n,d){N(n,t,d),N(n,r,d)},p(n,d){d&16&&a!==(a=Math.round(n[4])+"")&&ue(t,a)},d(n){n&&o(t),n&&o(r)}}}function $t(s){let a,t=s[0]&&At();return{c(){t&&t.c(),a=Be()},l(r){t&&t.l(r),a=Be()},m(r,n){t&&t.m(r,n),N(r,a,n)},p(r,n){r[0]?t||(t=At(),t.c(),t.m(a.parentNode,a)):t&&(t.d(1),t=null)},d(r){t&&t.d(r),r&&o(a)}}}function jt(s){let a;function t(d,E){if(d[1])return Ot;if(!d[1])return Ht}let r=t(s),n=r&&r(s);return{c(){n&&n.c(),a=Be()},l(d){n&&n.l(d),a=Be()},m(d,E){n&&n.m(d,E),N(d,a,E)},p(d,E){r!==(r=t(d))&&(n&&n.d(1),n=r&&r(d),n&&(n.c(),n.m(a.parentNode,a)))},d(d){n&&n.d(d),d&&o(a)}}}function At(s){let a;return{c(){a=f("100%")},l(t){a=p(t,"100%")},m(t,r){N(t,a,r)},d(t){t&&o(a)}}}function Ht(s){let a;return{c(){a=f("0%")},l(t){a=p(t,"0%")},m(t,r){N(t,a,r)},d(t){t&&o(a)}}}function Ot(s){let a;return{c(){a=f("0%")},l(t){a=p(t,"0%")},m(t,r){N(t,a,r)},d(t){t&&o(a)}}}function Ft(s){let a;return{c(){a=f("buy")},l(t){a=p(t,"buy")},m(t,r){N(t,a,r)},d(t){t&&o(a)}}}function Yt(s){let a;return{c(){a=f("sell")},l(t){a=p(t,"sell")},m(t,r){N(t,a,r)},d(t){t&&o(a)}}}function Jt(s){let a=Math.round(s[4])+"",t;return{c(){t=f(a)},l(r){t=p(r,a)},m(r,n){N(r,t,n)},p(r,n){n&16&&a!==(a=Math.round(r[4])+"")&&ue(t,a)},d(r){r&&o(t)}}}function Qt(s){return{c:he,l:he,m:he,p:he,d:he}}function Gt(s){let a,t,r,n,d,E,w,L,q,z,oe,V,$,J,Se,Te,_,Ve,j,Q,De,ze,m,Ce,D,G,Re,Ue,y,$e,K,fe,je,He,H,x,b,Oe,W,Fe,X,Ye,pe,Je,de,Qe,ve,Z,Ge,ie=Math.abs(Math.round(s[5]))+"",_e,Ke,We,ee,B,C,P,me,A,Xe,I,be,Ze,O,xe,R,et,tt,lt,te,at,rt,le,st,F,nt,ut;a=new Rt({props:{pageTitle:Kt,metaDescription:Wt}});function ht(i,v){return i[0]?i[1]?Ut:$t:jt}let ye=ht(s),S=ye(s);function ft(i,v){return i[5]>0?Yt:Ft}let ge=ft(s),U=ge(s);function pt(i,v){return i[4]?Jt:Qt}let ke=pt(s),T=ke(s);return{c(){qt(a.$$.fragment),t=g(),r=c("main"),n=c("h1"),d=f("Portfolio rebalancing calculator"),E=g(),w=c("div"),L=c("div"),q=c("form"),z=c("input"),oe=g(),V=c("ol"),$=c("li"),J=c("label"),Se=f("Current money in volatile assets?"),Te=g(),_=c("input"),Ve=g(),j=c("li"),Q=c("label"),De=f("Current money in stable assets?"),ze=g(),m=c("input"),Ce=g(),D=c("li"),G=c("label"),Re=f("Preferred percentage of volatile assets?"),Ue=g(),y=c("input"),$e=g(),K=c("label"),fe=f(s[2]),je=f("%"),He=g(),H=c("div"),x=c("div"),b=c("h3"),Oe=f("You currently have "),W=c("span"),S.c(),Fe=f(" of your total portfolio value of "),X=c("span"),Ye=f("\u20AC"),pe=f(s[3]),Je=f(" in volatile assets."),de=c("br"),Qe=f(` To rebalance, 
                `),U.c(),ve=g(),Z=c("span"),Ge=f("\u20AC"),_e=f(ie),Ke=f(" of volatile assets."),We=g(),ee=c("div"),B=Ne("svg"),C=Ne("circle"),P=Ne("circle"),A=Ne("text"),T.c(),Xe=g(),I=c("div"),be=c("hr"),Ze=g(),O=c("p"),xe=f("This calculator is intended for people who follow a long-term investment strategy such as the "),R=c("a"),et=f("Boglehead method"),tt=f(", where there's a volatile part and a stable part: stocks and bonds."),lt=g(),te=c("p"),at=f("In recent years, low interest rates have made bonds unattractive. People now opt for deposit savings or cash buffers. Stocks are still in high demand, but crypto currencies are gaining ground."),rt=g(),le=c("p"),st=f("None of this is relevant for this calculator, as long as there is a volatile and a stable asset that you're trying to balance!"),this.h()},l(i){Bt(a.$$.fragment,i),t=k(i),r=u(i,"MAIN",{class:!0});var v=h(r);n=u(v,"H1",{class:!0});var dt=h(n);d=p(dt,"Portfolio rebalancing calculator"),dt.forEach(o),E=k(v),w=u(v,"DIV",{class:!0});var ae=h(w);L=u(ae,"DIV",{class:!0});var vt=h(L);q=u(vt,"FORM",{name:!0,class:!0});var Ee=h(q);z=u(Ee,"INPUT",{type:!0,name:!0,class:!0}),oe=k(Ee),V=u(Ee,"OL",{class:!0});var re=h(V);$=u(re,"LI",{class:!0});var we=h($);J=u(we,"LABEL",{for:!0,class:!0});var _t=h(J);Se=p(_t,"Current money in volatile assets?"),_t.forEach(o),Te=k(we),_=u(we,"INPUT",{type:!0,min:!0,name:!0,id:!0,"aria-required":!0,placeholder:!0,autocomplete:!0,autocorrect:!0,autocapitalize:!0,oninput:!0,class:!0}),we.forEach(o),Ve=k(re),j=u(re,"LI",{class:!0});var Pe=h(j);Q=u(Pe,"LABEL",{for:!0,class:!0});var mt=h(Q);De=p(mt,"Current money in stable assets?"),mt.forEach(o),ze=k(Pe),m=u(Pe,"INPUT",{type:!0,min:!0,name:!0,id:!0,"aria-required":!0,placeholder:!0,autocomplete:!0,oninput:!0,class:!0}),Pe.forEach(o),Ce=k(re),D=u(re,"LI",{class:!0});var se=h(D);G=u(se,"LABEL",{for:!0,class:!0});var bt=h(G);Re=p(bt,"Preferred percentage of volatile assets?"),bt.forEach(o),Ue=k(se),y=u(se,"INPUT",{type:!0,min:!0,max:!0,name:!0,id:!0,"aria-required":!0,autocapitalize:!0,class:!0}),$e=k(se),K=u(se,"LABEL",{class:!0});var ot=h(K);fe=p(ot,s[2]),je=p(ot,"%"),ot.forEach(o),se.forEach(o),re.forEach(o),Ee.forEach(o),vt.forEach(o),He=k(ae),H=u(ae,"DIV",{class:!0});var Ie=h(H);x=u(Ie,"DIV",{class:!0});var yt=h(x);b=u(yt,"H3",{class:!0});var M=h(b);Oe=p(M,"You currently have "),W=u(M,"SPAN",{class:!0});var gt=h(W);S.l(gt),gt.forEach(o),Fe=p(M," of your total portfolio value of "),X=u(M,"SPAN",{class:!0});var it=h(X);Ye=p(it,"\u20AC"),pe=p(it,s[3]),it.forEach(o),Je=p(M," in volatile assets."),de=u(M,"BR",{class:!0}),Qe=p(M,` To rebalance, 
                `),U.l(M),ve=k(M),Z=u(M,"SPAN",{class:!0});var ct=h(Z);Ge=p(ct,"\u20AC"),_e=p(ct,ie),ct.forEach(o),Ke=p(M," of volatile assets."),M.forEach(o),yt.forEach(o),We=k(Ie),ee=u(Ie,"DIV",{class:!0});var kt=h(ee);B=Le(kt,"svg",{height:!0,width:!0,viewBox:!0,class:!0});var Ae=h(B);C=Le(Ae,"circle",{class:!0,r:!0,cx:!0,cy:!0,fill:!0}),h(C).forEach(o),P=Le(Ae,"circle",{r:!0,cx:!0,cy:!0,fill:!0,stroke:!0,"stroke-width":!0,"stroke-dasharray":!0,transform:!0,class:!0}),h(P).forEach(o),A=Le(Ae,"text",{x:!0,y:!0,"dominant-baseline":!0,"text-anchor":!0,"font-size":!0,class:!0});var Et=h(A);T.l(Et),Et.forEach(o),Ae.forEach(o),kt.forEach(o),Ie.forEach(o),Xe=k(ae),I=u(ae,"DIV",{style:!0,class:!0});var Y=h(I);be=u(Y,"HR",{class:!0}),Ze=k(Y),O=u(Y,"P",{class:!0});var Me=h(O);xe=p(Me,"This calculator is intended for people who follow a long-term investment strategy such as the "),R=u(Me,"A",{target:!0,rel:!0,href:!0,class:!0});var wt=h(R);et=p(wt,"Boglehead method"),wt.forEach(o),tt=p(Me,", where there's a volatile part and a stable part: stocks and bonds."),Me.forEach(o),lt=k(Y),te=u(Y,"P",{class:!0});var Pt=h(te);at=p(Pt,"In recent years, low interest rates have made bonds unattractive. People now opt for deposit savings or cash buffers. Stocks are still in high demand, but crypto currencies are gaining ground."),Pt.forEach(o),rt=k(Y),le=u(Y,"P",{class:!0});var It=h(le);st=p(It,"None of this is relevant for this calculator, as long as there is a volatile and a stable asset that you're trying to balance!"),It.forEach(o),Y.forEach(o),ae.forEach(o),v.forEach(o),this.h()},h(){e(n,"class","svelte-pnht7h"),e(z,"type","hidden"),e(z,"name","form-name"),z.value="contact",e(z,"class","svelte-pnht7h"),e(J,"for","field-volatile"),e(J,"class","svelte-pnht7h"),e(_,"type","number"),e(_,"min","0"),e(_,"name","volatile"),e(_,"id","field-volatile"),_.required="",e(_,"aria-required","true"),e(_,"placeholder","Enter value of volatile assets"),e(_,"autocomplete","volatile"),e(_,"autocorrect","off"),e(_,"autocapitalize","off"),e(_,"oninput","this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\\..*)\\./g, '$1');"),e(_,"class","svelte-pnht7h"),e($,"class","svelte-pnht7h"),e(Q,"for","field-stable"),e(Q,"class","svelte-pnht7h"),e(m,"type","number"),e(m,"min","0"),e(m,"name","stable"),e(m,"id","field-stable"),m.required="",e(m,"aria-required","true"),e(m,"placeholder","Enter value of stable assets"),e(m,"autocomplete","stable"),e(m,"oninput","this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\\..*)\\./g, '$1');"),e(m,"class","svelte-pnht7h"),e(j,"class","svelte-pnht7h"),e(G,"for","field-percentage"),e(G,"class","svelte-pnht7h"),e(y,"type","range"),e(y,"min","0"),e(y,"max","100"),e(y,"name","percentage"),e(y,"id","field-percentage"),y.required="",e(y,"aria-required","true"),e(y,"autocapitalize","off"),e(y,"class"," svelte-pnht7h"),e(K,"class","svelte-pnht7h"),e(D,"class","svelte-pnht7h"),e(V,"class","svelte-pnht7h"),e(q,"name","calculator"),e(q,"class","svelte-pnht7h"),e(L,"class","wrapper svelte-pnht7h"),e(W,"class","svelte-pnht7h"),e(X,"class","svelte-pnht7h"),e(de,"class","svelte-pnht7h"),e(Z,"class","svelte-pnht7h"),e(b,"class","svelte-pnht7h"),e(x,"class","explanation-text svelte-pnht7h"),e(C,"class","circle svelte-pnht7h"),e(C,"r","10"),e(C,"cx","10"),e(C,"cy","10"),e(C,"fill","var(--primary-300)"),e(P,"r","5"),e(P,"cx","10"),e(P,"cy","10"),e(P,"fill","transparent"),e(P,"stroke","var(--secondary-300)"),e(P,"stroke-width","10"),e(P,"stroke-dasharray",me="calc("+Math.round(s[4])+" * 30.65 / 100) 31.4159"),e(P,"transform","rotate(-90) translate(-20)"),e(P,"class","svelte-pnht7h"),e(A,"x","50%"),e(A,"y","50%"),e(A,"dominant-baseline","middle"),e(A,"text-anchor","middle"),e(A,"font-size","3"),e(A,"class","svelte-pnht7h"),e(B,"height","20"),e(B,"width","20"),e(B,"viewBox","0 0 20 20"),e(B,"class","svelte-pnht7h"),e(ee,"class","explanation-pie svelte-pnht7h"),e(H,"class","wrapper svelte-pnht7h"),e(be,"class","svelte-pnht7h"),e(R,"target","_blank"),e(R,"rel","noopener"),e(R,"href","https://www.bogleheads.org/wiki/Bogleheads\xAE_investment_philosophy"),e(R,"class","svelte-pnht7h"),e(O,"class","svelte-pnht7h"),e(te,"class","svelte-pnht7h"),e(le,"class","svelte-pnht7h"),St(I,"margin-top","var(--spacing-unit)"),e(I,"class","disclaimer svelte-pnht7h"),e(w,"class","grid svelte-pnht7h"),e(r,"class","container svelte-pnht7h")},m(i,v){Tt(a,i,v),N(i,t,v),N(i,r,v),l(r,n),l(n,d),l(r,E),l(r,w),l(w,L),l(L,q),l(q,z),l(q,oe),l(q,V),l(V,$),l($,J),l(J,Se),l($,Te),l($,_),ne(_,s[0]),l(V,Ve),l(V,j),l(j,Q),l(Q,De),l(j,ze),l(j,m),ne(m,s[1]),l(V,Ce),l(V,D),l(D,G),l(G,Re),l(D,Ue),l(D,y),ne(y,s[2]),l(D,$e),l(D,K),l(K,fe),l(K,je),l(w,He),l(w,H),l(H,x),l(x,b),l(b,Oe),l(b,W),S.m(W,null),l(b,Fe),l(b,X),l(X,Ye),l(X,pe),l(b,Je),l(b,de),l(b,Qe),U.m(b,null),l(b,ve),l(b,Z),l(Z,Ge),l(Z,_e),l(b,Ke),l(H,We),l(H,ee),l(ee,B),l(B,C),l(B,P),l(B,A),T.m(A,null),l(w,Xe),l(w,I),l(I,be),l(I,Ze),l(I,O),l(O,xe),l(O,R),l(R,et),l(O,tt),l(I,lt),l(I,te),l(te,at),l(I,rt),l(I,le),l(le,st),F=!0,nt||(ut=[qe(_,"input",s[6]),qe(m,"input",s[7]),qe(y,"change",s[8]),qe(y,"input",s[8])],nt=!0)},p(i,[v]){v&1&&ce(_.value)!==i[0]&&ne(_,i[0]),v&2&&ce(m.value)!==i[1]&&ne(m,i[1]),v&4&&ne(y,i[2]),(!F||v&4)&&ue(fe,i[2]),ye===(ye=ht(i))&&S?S.p(i,v):(S.d(1),S=ye(i),S&&(S.c(),S.m(W,null))),(!F||v&8)&&ue(pe,i[3]),ge!==(ge=ft(i))&&(U.d(1),U=ge(i),U&&(U.c(),U.m(b,ve))),(!F||v&32)&&ie!==(ie=Math.abs(Math.round(i[5]))+"")&&ue(_e,ie),(!F||v&16&&me!==(me="calc("+Math.round(i[4])+" * 30.65 / 100) 31.4159"))&&e(P,"stroke-dasharray",me),ke===(ke=pt(i))&&T?T.p(i,v):(T.d(1),T=ke(i),T&&(T.c(),T.m(A,null)))},i(i){F||(Vt(a.$$.fragment,i),F=!0)},o(i){Dt(a.$$.fragment,i),F=!1},d(i){zt(a,i),i&&o(t),i&&o(r),S.d(),U.d(),T.d(),nt=!1,Ct(ut)}}}let Kt="portfolio rebalancing calculator",Wt="An interactive calculator meant to rebalance an investing portfolio consisting of volatile assets such as stocks, and stable assets such as bonds.";function Xt(s,a,t){let r,n,d,E=null,w=null,L=0;function q(){E=ce(this.value),t(0,E)}function z(){w=ce(this.value),t(1,w)}function oe(){L=ce(this.value),t(2,L)}return s.$$.update=()=>{s.$$.dirty&3&&t(3,r=E+w),s.$$.dirty&9&&t(4,n=E/r*100),s.$$.dirty&16,s.$$.dirty&13&&t(5,d=E-L/100*r),s.$$.dirty&1,s.$$.dirty&2},[E,w,L,r,n,d,q,z,oe]}class el extends Mt{constructor(a){super();Nt(this,a,Xt,Gt,Lt,{})}}export{el as default};
