function h(){}function O(t,e){for(const n in e)t[n]=e[n];return t}function L(t){return t()}function T(){return Object.create(null)}function m(t){t.forEach(L)}function P(t){return typeof t=="function"}function q(t,e){return t!=t?e==e:t!==e||t&&typeof t=="object"||typeof t=="function"}function F(t){return Object.keys(t).length===0}function mt(t,e,n,i){if(t){const r=z(t,e,n,i);return t[0](r)}}function z(t,e,n,i){return t[1]&&i?O(n.ctx.slice(),t[1](i(e))):n.ctx}function gt(t,e,n,i){if(t[2]&&i){const r=t[2](i(n));if(e.dirty===void 0)return r;if(typeof r=="object"){const u=[],s=Math.max(e.dirty.length,r.length);for(let l=0;l<s;l+=1)u[l]=e.dirty[l]|r[l];return u}return e.dirty|r}return e.dirty}function pt(t,e,n,i,r,u){if(r){const s=z(e,n,i,u);t.p(s,r)}}function yt(t){if(t.ctx.length>32){const e=[],n=t.ctx.length/32;for(let i=0;i<n;i++)e[i]=-1;return e}return-1}let y=!1;function W(){y=!0}function G(){y=!1}function J(t,e,n,i){for(;t<e;){const r=t+(e-t>>1);n(r)<=i?t=r+1:e=r}return t}function K(t){if(t.hydrate_init)return;t.hydrate_init=!0;let e=t.childNodes;if(t.nodeName==="HEAD"){const o=[];for(let c=0;c<e.length;c++){const a=e[c];a.claim_order!==void 0&&o.push(a)}e=o}const n=new Int32Array(e.length+1),i=new Int32Array(e.length);n[0]=-1;let r=0;for(let o=0;o<e.length;o++){const c=e[o].claim_order,a=(r>0&&e[n[r]].claim_order<=c?r+1:J(1,r,p=>e[n[p]].claim_order,c))-1;i[o]=n[a]+1;const f=a+1;n[f]=o,r=Math.max(f,r)}const u=[],s=[];let l=e.length-1;for(let o=n[r]+1;o!=0;o=i[o-1]){for(u.push(e[o-1]);l>=o;l--)s.push(e[l]);l--}for(;l>=0;l--)s.push(e[l]);u.reverse(),s.sort((o,c)=>o.claim_order-c.claim_order);for(let o=0,c=0;o<s.length;o++){for(;c<u.length&&s[o].claim_order>=u[c].claim_order;)c++;const a=c<u.length?u[c]:null;t.insertBefore(s[o],a)}}function Q(t,e){if(y){for(K(t),(t.actual_end_child===void 0||t.actual_end_child!==null&&t.actual_end_child.parentElement!==t)&&(t.actual_end_child=t.firstChild);t.actual_end_child!==null&&t.actual_end_child.claim_order===void 0;)t.actual_end_child=t.actual_end_child.nextSibling;e!==t.actual_end_child?(e.claim_order!==void 0||e.parentNode!==t)&&t.insertBefore(e,t.actual_end_child):t.actual_end_child=e.nextSibling}else(e.parentNode!==t||e.nextSibling!==null)&&t.appendChild(e)}function bt(t,e,n){y&&!n?Q(t,e):(e.parentNode!==t||e.nextSibling!=n)&&t.insertBefore(e,n||null)}function R(t){t.parentNode.removeChild(t)}function xt(t,e){for(let n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}function U(t){return document.createElement(t)}function V(t){return document.createElementNS("http://www.w3.org/2000/svg",t)}function S(t){return document.createTextNode(t)}function kt(){return S(" ")}function Et(){return S("")}function wt(t,e,n,i){return t.addEventListener(e,n,i),()=>t.removeEventListener(e,n,i)}function St(t,e,n){n==null?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function vt(t){return t===""?null:+t}function X(t){return Array.from(t.childNodes)}function Y(t){t.claim_info===void 0&&(t.claim_info={last_index:0,total_claimed:0})}function B(t,e,n,i,r=!1){Y(t);const u=(()=>{for(let s=t.claim_info.last_index;s<t.length;s++){const l=t[s];if(e(l)){const o=n(l);return o===void 0?t.splice(s,1):t[s]=o,r||(t.claim_info.last_index=s),l}}for(let s=t.claim_info.last_index-1;s>=0;s--){const l=t[s];if(e(l)){const o=n(l);return o===void 0?t.splice(s,1):t[s]=o,r?o===void 0&&t.claim_info.last_index--:t.claim_info.last_index=s,l}}return i()})();return u.claim_order=t.claim_info.total_claimed,t.claim_info.total_claimed+=1,u}function D(t,e,n,i){return B(t,r=>r.nodeName===e,r=>{const u=[];for(let s=0;s<r.attributes.length;s++){const l=r.attributes[s];n[l.name]||u.push(l.name)}u.forEach(s=>r.removeAttribute(s))},()=>i(e))}function $t(t,e,n){return D(t,e,n,U)}function At(t,e,n){return D(t,e,n,V)}function Z(t,e){return B(t,n=>n.nodeType===3,n=>{const i=""+e;if(n.data.startsWith(i)){if(n.data.length!==i.length)return n.splitText(i.length)}else n.data=i},()=>S(e),!0)}function Ct(t){return Z(t," ")}function Mt(t,e){e=""+e,t.wholeText!==e&&(t.data=e)}function Nt(t,e){t.value=e==null?"":e}function jt(t,e,n,i){t.style.setProperty(e,n,i?"important":"")}function Lt(t,e,n){t.classList[n?"add":"remove"](e)}function tt(t,e,n=!1){const i=document.createEvent("CustomEvent");return i.initCustomEvent(t,n,!1,e),i}function Tt(t,e=document.body){return Array.from(e.querySelectorAll(t))}let b;function x(t){b=t}function k(){if(!b)throw new Error("Function called outside component initialization");return b}function et(t){k().$$.on_mount.push(t)}function nt(t){k().$$.after_update.push(t)}function it(){const t=k();return(e,n)=>{const i=t.$$.callbacks[e];if(i){const r=tt(e,n);i.slice().forEach(u=>{u.call(t,r)})}}}function qt(t,e){k().$$.context.set(t,e)}const g=[],H=[],E=[],v=[],rt=Promise.resolve();let $=!1;function ct(){$||($=!0,rt.then(I))}function A(t){E.push(t)}function zt(t){v.push(t)}let C=!1;const M=new Set;function I(){if(!C){C=!0;do{for(let t=0;t<g.length;t+=1){const e=g[t];x(e),ot(e.$$)}for(x(null),g.length=0;H.length;)H.pop()();for(let t=0;t<E.length;t+=1){const e=E[t];M.has(e)||(M.add(e),e())}E.length=0}while(g.length);for(;v.length;)v.pop()();$=!1,C=!1,M.clear()}}function ot(t){if(t.fragment!==null){t.update(),m(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(A)}}const w=new Set;let d;function Bt(){d={r:0,c:[],p:d}}function Dt(){d.r||m(d.c),d=d.p}function st(t,e){t&&t.i&&(w.delete(t),t.i(e))}function Ht(t,e,n,i){if(t&&t.o){if(w.has(t))return;w.add(t),d.c.push(()=>{w.delete(t),i&&(n&&t.d(1),i())}),t.o(e)}}function It(t,e){const n={},i={},r={$$scope:1};let u=t.length;for(;u--;){const s=t[u],l=e[u];if(l){for(const o in s)o in l||(i[o]=1);for(const o in l)r[o]||(n[o]=l[o],r[o]=1);t[u]=l}else for(const o in s)r[o]=1}for(const s in i)s in n||(n[s]=void 0);return n}function Ot(t){return typeof t=="object"&&t!==null?t:{}}function Pt(t,e,n){const i=t.$$.props[e];i!==void 0&&(t.$$.bound[i]=n,n(t.$$.ctx[i]))}function Ft(t){t&&t.c()}function Wt(t,e){t&&t.l(e)}function lt(t,e,n,i){const{fragment:r,on_mount:u,on_destroy:s,after_update:l}=t.$$;r&&r.m(e,n),i||A(()=>{const o=u.map(L).filter(P);s?s.push(...o):m(o),t.$$.on_mount=[]}),l.forEach(A)}function ut(t,e){const n=t.$$;n.fragment!==null&&(m(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}function at(t,e){t.$$.dirty[0]===-1&&(g.push(t),ct(),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function ft(t,e,n,i,r,u,s,l=[-1]){const o=b;x(t);const c=t.$$={fragment:null,ctx:null,props:u,update:h,not_equal:r,bound:T(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(e.context||(o?o.$$.context:[])),callbacks:T(),dirty:l,skip_bound:!1,root:e.target||o.$$.root};s&&s(c.root);let a=!1;if(c.ctx=n?n(t,e.props||{},(f,p,...N)=>{const j=N.length?N[0]:p;return c.ctx&&r(c.ctx[f],c.ctx[f]=j)&&(!c.skip_bound&&c.bound[f]&&c.bound[f](j),a&&at(t,f)),p}):[],c.update(),a=!0,m(c.before_update),c.fragment=i?i(c.ctx):!1,e.target){if(e.hydrate){W();const f=X(e.target);c.fragment&&c.fragment.l(f),f.forEach(R)}else c.fragment&&c.fragment.c();e.intro&&st(t.$$.fragment),lt(t,e.target,e.anchor,e.customElement),G(),I()}x(o)}class dt{$destroy(){ut(this,1),this.$destroy=h}$on(e,n){const i=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return i.push(n),()=>{const r=i.indexOf(n);r!==-1&&i.splice(r,1)}}$set(e){this.$$set&&!F(e)&&(this.$$.skip_bound=!0,this.$$set(e),this.$$.skip_bound=!1)}}const _=[];function Gt(t,e=h){let n;const i=new Set;function r(l){if(q(t,l)&&(t=l,n)){const o=!_.length;for(const c of i)c[1](),_.push(c,t);if(o){for(let c=0;c<_.length;c+=2)_[c][0](_[c+1]);_.length=0}}}function u(l){r(l(t))}function s(l,o=h){const c=[l,o];return i.add(c),i.size===1&&(n=e(r)||h),l(t),()=>{i.delete(c),i.size===0&&(n(),n=null)}}return{set:r,update:u,subscribe:s}}const _t="(prefers-color-scheme: dark)";function ht(t,e,n){let{theme:i="dark"}=e,{key:r="theme"}=e;const u={dark:"dark",light:"light"},s=it(),l=c=>c in u,o=c=>n(0,i=c.matches?u.dark:u.light);return et(()=>{const c=matchMedia(_t),a=localStorage.getItem(r);return l(a)?n(0,i=a):n(0,i=c.matches?u.dark:u.light),c.addEventListener("change",o),()=>{c.removeEventListener("change",o)}}),nt(()=>{l(i)&&(s("change",i),localStorage.setItem(r,i))}),t.$$set=c=>{"theme"in c&&n(0,i=c.theme),"key"in c&&n(1,r=c.key)},[i,r]}class Jt extends dt{constructor(e){super();ft(this,e,ht,null,q,{theme:0,key:1})}}export{et as A,O as B,Gt as C,V as D,At as E,jt as F,Lt as G,Q as H,wt as I,h as J,mt as K,pt as L,yt as M,gt as N,H as O,Pt as P,zt as Q,Jt as R,dt as S,m as T,P as U,Tt as V,xt as W,Nt as X,vt as Y,X as a,St as b,$t as c,R as d,U as e,bt as f,Z as g,Mt as h,ft as i,Ft as j,kt as k,Et as l,Wt as m,Ct as n,lt as o,It as p,Ot as q,Bt as r,q as s,S as t,Ht as u,ut as v,Dt as w,st as x,qt as y,nt as z};