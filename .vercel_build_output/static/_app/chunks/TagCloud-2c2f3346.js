import{S as m,i as p,s as x,e as _,t as y,c as f,a as u,g as b,d as o,b as c,f as d,F as q,J as i,K as A}from"./vendor-2ca5b27b.js";function g(r,a,n){const t=r.slice();return t[1]=a[n],t}function v(r){let a,n=r[1]+"",t,l;return{c(){a=_("a"),t=y(n),this.h()},l(s){a=f(s,"A",{href:!0,class:!0});var e=u(a);t=b(e,n),e.forEach(o),this.h()},h(){c(a,"href",l=`/tags/${r[1]}`),c(a,"class","svelte-1q1xgos")},m(s,e){d(s,a,e),q(a,t)},p:i,d(s){s&&o(a)}}}function C(r){let a,n=r[0],t=[];for(let l=0;l<n.length;l+=1)t[l]=v(g(r,n,l));return{c(){a=_("div");for(let l=0;l<t.length;l+=1)t[l].c();this.h()},l(l){a=f(l,"DIV",{class:!0});var s=u(a);for(let e=0;e<t.length;e+=1)t[e].l(s);s.forEach(o),this.h()},h(){c(a,"class","svelte-1q1xgos")},m(l,s){d(l,a,s);for(let e=0;e<t.length;e+=1)t[e].m(a,null)},p(l,[s]){if(s&1){n=l[0];let e;for(e=0;e<n.length;e+=1){const h=g(l,n,e);t[e]?t[e].p(h,s):(t[e]=v(h),t[e].c(),t[e].m(a,null))}for(;e<t.length;e+=1)t[e].d(1);t.length=n.length}},i,o:i,d(l){l&&o(a),A(t,l)}}}function S(r){return[["SvelteKit"]]}class $ extends m{constructor(a){super();p(this,a,S,C,x,{})}}export{$ as T};
