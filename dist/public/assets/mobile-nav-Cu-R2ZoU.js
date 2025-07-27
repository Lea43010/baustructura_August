import{c as s,e as o,j as a,x as n,B as c,U as i}from"./index-CyhjQ_VK.js";/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const h=s("FolderOpen",[["path",{d:"m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2",key:"usdka0"}]]);/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=s("House",[["path",{d:"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8",key:"5wwlr5"}],["path",{d:"M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"1d0kgt"}]]);/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const d=s("Map",[["path",{d:"M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z",key:"169xi5"}],["path",{d:"M15 5.764v15",key:"1pn4in"}],["path",{d:"M9 3.236v15",key:"1uimfh"}]]);/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const x=s("MessageCircle",[["path",{d:"M7.9 20A9 9 0 1 0 4 16.1L2 22Z",key:"vv11sd"}]]);function u(){const[t]=o(),r=[{href:"/",icon:a.jsx(p,{className:"h-5 w-5"}),label:"Start"},{href:"/projects",icon:a.jsx(h,{className:"h-5 w-5"}),label:"Projekte"},{href:"/maps",icon:a.jsx(d,{className:"h-5 w-5"}),label:"Karte"},{href:"/support",icon:a.jsx(x,{className:"h-5 w-5"}),label:"Support"},{href:"/profile",icon:a.jsx(i,{className:"h-5 w-5"}),label:"Profil"}],l=e=>!!(e==="/"&&t==="/"||e!=="/"&&t.startsWith(e));return a.jsx("nav",{className:"lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50 pb-safe",children:a.jsx("div",{className:"flex justify-around",children:r.map(e=>a.jsx(n,{href:e.href,children:a.jsxs(c,{variant:"ghost",size:"sm",className:`flex flex-col items-center py-2 px-3 text-xs h-auto ${l(e.href)?"text-green-500":"text-gray-500 hover:text-gray-700"}`,children:[a.jsx("div",{className:"mb-1",children:e.icon}),a.jsx("span",{children:e.label})]})},e.href))})})}export{h as F,p as H,u as M,d as a,x as b};
