"use strict";(()=>{var Q={en:{title:"Ask us",welcome:"Hi! Ask me anything about us.",placeholder:"Type your question\u2026",send:"Send",open:"Open chat",close:"Close chat",sources:"Sources",untitled:"Untitled",helpful:"Helpful",notHelpful:"Not helpful",error:"Sorry, something went wrong. Please try again.",busy:"Too many requests right now. Please try again in a moment."},am:{title:"\u1320\u12ED\u1241\u1295",welcome:"\u1230\u120B\u121D! \u1235\u1208 \u12A5\u129B \u121B\u1295\u129B\u12CD\u1295\u121D \u1290\u1308\u122D \u12ED\u1320\u12ED\u1241\u1362",placeholder:"\u1325\u12EB\u1244\u12CE\u1295 \u12ED\u133B\u1349\u2026",send:"\u120B\u12AD",open:"\u12CD\u12ED\u12ED\u1275 \u12AD\u1348\u1275",close:"\u12DD\u130B",sources:"\u121D\u1295\u132E\u127D",untitled:"\u122D\u12D5\u1235 \u12E8\u120C\u1208\u12CD",helpful:"\u1320\u1243\u121A",notHelpful:"\u1320\u1243\u121A \u12A0\u12ED\u12F0\u1208\u121D",error:"\u12ED\u1245\u122D\u1273\u1363 \u127D\u130D\u122D \u1270\u1348\u1325\u122F\u120D\u1362 \u12A5\u1263\u12AD\u12CE \u12A5\u1295\u12F0\u1308\u1293 \u12ED\u121E\u12AD\u1229\u1362",busy:"\u12A0\u1201\u1295 \u1265\u12D9 \u1325\u12EB\u1244\u12CE\u127D \u12A0\u1209\u1362 \u12A5\u1263\u12AD\u12CE \u1275\u1295\u123D \u1246\u12ED\u1270\u12CD \u12ED\u121E\u12AD\u1229\u1362"}},W="#0f766e",X=3e4;function o(n,r,d){let m=document.createElement(n);return r&&(m.className=r),d!==void 0&&(m.textContent=d),m}function Y(n){try{let r=new URL(n);return r.protocol==="http:"||r.protocol==="https:"}catch{return!1}}function Z(){return typeof crypto!="undefined"&&"randomUUID"in crypto?crypto.randomUUID():`v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,12)}`}function ee(){let n="askly_visitor_id";try{let d=localStorage.getItem(n);if(d&&d.length>=8)return d}catch{}let r=Z();try{localStorage.setItem(n,r)}catch{}return r}function te(n){var d;let r=(d=n.dataset.api)==null?void 0:d.trim();if(r)return r.replace(/\/+$/,"");try{return new URL(n.src).origin}catch{return""}}function ne(n,r){return`
:host { all: initial; }
.root {
  --accent: ${n};
  position: fixed; bottom: 20px; ${r}: 20px; z-index: 2147483000;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans Ethiopic", sans-serif;
  font-size: 14px; color: #1a1a1a;
}
.launcher {
  width: 56px; height: 56px; border-radius: 50%; border: 0; cursor: pointer;
  background: var(--accent); color: #fff; box-shadow: 0 4px 14px rgba(0,0,0,.25);
  display: flex; align-items: center; justify-content: center;
}
.launcher svg { width: 26px; height: 26px; }
.panel {
  position: absolute; bottom: 68px; ${r}: 0;
  width: min(380px, calc(100vw - 32px)); height: min(540px, calc(100vh - 110px));
  background: #fff; border-radius: 14px; box-shadow: 0 10px 40px rgba(0,0,0,.25);
  display: none; flex-direction: column; overflow: hidden;
}
.panel.open { display: flex; }
.header {
  background: var(--accent); color: #fff; padding: 14px 16px; font-weight: 600; font-size: 15px;
  display: flex; align-items: center; justify-content: space-between;
}
.close { background: none; border: 0; color: inherit; font-size: 22px; line-height: 1; cursor: pointer; padding: 0 4px; }
.messages {
  flex: 1; overflow-y: auto; padding: 14px; background: #f6f7f8;
  display: flex; flex-direction: column; gap: 10px;
}
.msg { max-width: 85%; padding: 9px 12px; border-radius: 12px; line-height: 1.45; overflow-wrap: anywhere; }
.text { white-space: pre-wrap; }
.user { align-self: flex-end; background: var(--accent); color: #fff; border-bottom-right-radius: 4px; }
.bot { align-self: flex-start; background: #fff; border: 1px solid #e3e5e8; border-bottom-left-radius: 4px; }
.bot sup { color: var(--accent); font-weight: 600; padding: 0 1px; }
.sources { margin-top: 8px; padding-top: 6px; border-top: 1px solid #eee; font-size: 12px; color: #555; }
.sources a { color: var(--accent); }
.rate { margin-top: 6px; display: flex; gap: 6px; }
.rate button { border: 1px solid #d5d8dc; background: #fff; border-radius: 8px; padding: 2px 8px; cursor: pointer; font-size: 13px; }
.rate button[disabled] { cursor: default; opacity: .45; }
.rate button.picked { opacity: 1; border-color: var(--accent); }
.typing { align-self: flex-start; color: #777; padding: 4px 8px; }
.form { display: flex; gap: 8px; padding: 10px; border-top: 1px solid #e3e5e8; background: #fff; }
.input { flex: 1; min-width: 0; border: 1px solid #d5d8dc; border-radius: 8px; padding: 9px 10px; font: inherit; }
.send { border: 0; border-radius: 8px; background: var(--accent); color: #fff; padding: 0 14px; font: inherit; cursor: pointer; }
.send[disabled], .input[disabled] { opacity: .6; cursor: default; }
`}function oe(){var O,z,R;let n=document.currentScript instanceof HTMLScriptElement?document.currentScript:document.querySelector("script[data-key]"),r=(O=n==null?void 0:n.dataset.key)==null?void 0:O.trim();if(!n||!r){console.error("[Askly] Missing data-key on the script tag.");return}let d=te(n);if(!d){console.error("[Askly] Could not work out the API address. Add data-api to the script tag.");return}let m=n.dataset.lang==="am"?"am":"en",a=Q[m],A=(z=n.dataset.color)!=null?z:"",K=/^#[0-9a-fA-F]{3,8}$/.test(A)?A:W,j=n.dataset.position==="left"?"left":"right",H=((R=n.dataset.title)==null?void 0:R.trim().slice(0,60))||a.title,I=ee(),M,g=!1,C=!1;async function U(e,i){let t=new AbortController,s=setTimeout(()=>t.abort(),X);try{let l=await fetch(`${d}${e}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(i),signal:t.signal}),c=null;try{c=await l.json()}catch{}return{ok:l.ok,status:l.status,data:c==null?void 0:c.data}}finally{clearTimeout(s)}}let v=document.createElement("div");v.id="askly-widget";let q=v.attachShadow({mode:"open"}),$=document.createElement("style");$.textContent=ne(K,j);let B=o("div","root"),b=o("div","panel");b.setAttribute("role","dialog"),b.setAttribute("aria-label",H);let w=o("div","header");w.append(o("span",void 0,H));let x=o("button","close","\xD7");x.type="button",x.setAttribute("aria-label",a.close),w.append(x);let f=o("div","messages");f.setAttribute("role","log"),f.setAttribute("aria-live","polite");let k=o("form","form"),p=o("input","input");p.type="text",p.maxLength=1e3,p.autocomplete="off",p.placeholder=a.placeholder,p.setAttribute("aria-label",a.placeholder);let T=o("button","send",a.send);T.type="submit",k.append(p,T),b.append(w,f,k);let u=o("button","launcher");u.type="button",u.setAttribute("aria-expanded","false"),u.setAttribute("aria-label",a.open),u.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/></svg>',B.append(b,u),q.append($,B);let E=()=>{f.scrollTop=f.scrollHeight};function F(e,i){for(let t of i.split(/(\[\d+\])/)){let s=/^\[(\d+)\]$/.exec(t);s?e.append(o("sup",void 0,s[1])):t&&e.append(document.createTextNode(t))}}function V(e){f.append(o("div","msg user",e)),E()}function G(e){let i=o("div","rate"),t=o("button",void 0,"\u{1F44D}"),s=o("button",void 0,"\u{1F44E}");t.type=s.type="button",t.title=a.helpful,t.setAttribute("aria-label",a.helpful),s.title=a.notHelpful,s.setAttribute("aria-label",a.notHelpful);let l=(c,S)=>{t.disabled=s.disabled=!0,S.classList.add("picked"),U("/api/feedback",{publicKey:r,visitorId:I,messageId:e,rating:c}).catch(()=>{})};return t.addEventListener("click",()=>l(1,t)),s.addEventListener("click",()=>l(-1,s)),i.append(t,s),i}function h(e,i){let t=o("div","msg bot"),s=o("div","text");if(F(s,e),t.append(s),i&&i.answered&&i.sources.length>0){let l=o("div","sources");l.append(document.createTextNode(`${a.sources}: `)),i.sources.forEach((c,S)=>{var P;S>0&&l.append(document.createTextNode(" \xB7 "));let _=`[${c.index}] ${(P=c.title)!=null?P:a.untitled}`;if(c.url&&Y(c.url)){let y=o("a",void 0,_);y.href=c.url,y.target="_blank",y.rel="noopener noreferrer",l.append(y)}else l.append(document.createTextNode(_))}),t.append(l)}i!=null&&i.messageId&&t.append(G(i.messageId)),f.append(t),E()}function D(e){C=e,T.disabled=e,p.disabled=e}async function J(){let e=p.value.trim();if(!e||C)return;p.value="",V(e),D(!0);let i=o("div","typing","\u2026");f.append(i),E();try{let t=await U("/api/chat",{publicKey:r,visitorId:I,message:e,conversationId:M});t.ok&&t.data?(M=t.data.conversationId,h(t.data.answer,t.data)):h(t.status===429?a.busy:a.error)}catch{h(a.error)}finally{i.remove(),D(!1),p.focus()}}function L(e){g=e!=null?e:!g,b.classList.toggle("open",g),u.setAttribute("aria-expanded",String(g)),u.setAttribute("aria-label",g?a.close:a.open),g&&p.focus()}k.addEventListener("submit",e=>{e.preventDefault(),J()}),u.addEventListener("click",()=>L()),x.addEventListener("click",()=>{L(!1),u.focus()}),b.addEventListener("keydown",e=>{e.key==="Escape"&&(L(!1),u.focus())}),h(a.welcome);let N=()=>{document.getElementById("askly-widget")||document.body.append(v)};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",N):N()}oe();})();
