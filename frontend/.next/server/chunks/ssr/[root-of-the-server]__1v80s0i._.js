module.exports=[71306,(a,b,c)=>{b.exports=a.r(18622)},79847,a=>{a.n(a.i(3343))},9185,a=>{a.n(a.i(29432))},72842,a=>{a.n(a.i(75164))},54897,a=>{a.n(a.i(30106))},56157,a=>{a.n(a.i(18970))},94331,a=>{a.n(a.i(60644))},15988,a=>{a.n(a.i(56952))},25766,a=>{a.n(a.i(77341))},29725,a=>{a.n(a.i(94290))},90833,a=>{a.n(a.i(46994))},5785,a=>{a.n(a.i(90588))},74793,a=>{a.n(a.i(33169))},85826,a=>{a.n(a.i(37111))},21565,a=>{a.n(a.i(41763))},65911,a=>{a.n(a.i(8950))},25128,a=>{a.n(a.i(91562))},40781,a=>{a.n(a.i(49670))},69411,a=>{a.n(a.i(75700))},63081,a=>{a.n(a.i(276))},75230,a=>{a.n(a.i(40795))},34607,a=>{a.n(a.i(11614))},96338,a=>{a.n(a.i(21751))},50642,a=>{a.n(a.i(12213))},32242,a=>{a.n(a.i(22693))},88530,a=>{a.n(a.i(10531))},93695,(a,b,c)=>{b.exports=a.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},8583,a=>{a.n(a.i(1082))},38534,a=>{a.n(a.i(98175))},70408,a=>{a.n(a.i(9095))},22922,a=>{a.n(a.i(96772))},78294,a=>{a.n(a.i(71717))},16625,a=>{a.n(a.i(85034))},88648,a=>{a.n(a.i(68113))},51914,a=>{a.n(a.i(66482))},25466,a=>{a.n(a.i(91505))},44431,a=>{"use strict";a.s(["CodeBlock",()=>b]);let b=(0,a.i(11857).registerClientReference)(function(){throw Error("Attempted to call CodeBlock() from the server but CodeBlock is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/src/components/CodeBlock.tsx <module evaluation>","CodeBlock")},69399,a=>{"use strict";a.s(["CodeBlock",()=>b]);let b=(0,a.i(11857).registerClientReference)(function(){throw Error("Attempted to call CodeBlock() from the server but CodeBlock is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/src/components/CodeBlock.tsx","CodeBlock")},10914,a=>{"use strict";a.i(44431);var b=a.i(69399);a.n(b)},19992,a=>{"use strict";var b=a.i(7997);let c={GET:"bg-green-500/10 text-green-500 border-green-500/20",POST:"bg-blue-500/10 text-blue-500 border-blue-500/20",PUT:"bg-orange-500/10 text-orange-500 border-orange-500/20",PATCH:"bg-yellow-500/10 text-yellow-500 border-yellow-500/20",DELETE:"bg-red-500/10 text-red-500 border-red-500/20"};a.s(["EndpointCard",0,function({method:a,path:d,description:e}){return(0,b.jsxs)("div",{className:"flex items-start gap-3 p-4 rounded-lg border border-border bg-card",children:[(0,b.jsx)("span",{className:`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold border ${c[a]||c.GET}`,children:a}),(0,b.jsxs)("div",{className:"flex-1 min-w-0",children:[(0,b.jsx)("code",{className:"text-sm font-mono text-foreground break-all",children:d}),(0,b.jsx)("p",{className:"text-sm text-muted-foreground mt-1",children:e})]})]})}])},38379,a=>{"use strict";var b=a.i(7997),c=a.i(10914),d=a.i(19992);a.s(["default",0,function(){return(0,b.jsxs)("div",{className:"max-w-4xl mx-auto px-8 py-12",children:[(0,b.jsx)("h1",{className:"text-4xl font-bold mb-4",children:"Webhooks"}),(0,b.jsx)("p",{className:"text-lg text-muted-foreground mb-8",children:"Receive real-time notifications for events like successful payments, refunds, and disputes."}),(0,b.jsxs)("section",{className:"mb-12",children:[(0,b.jsx)("h2",{className:"text-2xl font-bold mb-4",children:"Endpoints"}),(0,b.jsxs)("div",{className:"space-y-3 mb-8",children:[(0,b.jsx)(d.EndpointCard,{method:"POST",path:"/webhooks",description:"Register a webhook endpoint"}),(0,b.jsx)(d.EndpointCard,{method:"GET",path:"/webhooks",description:"List all webhook endpoints"}),(0,b.jsx)(d.EndpointCard,{method:"PUT",path:"/webhooks/{id}",description:"Update webhook endpoint"}),(0,b.jsx)(d.EndpointCard,{method:"DELETE",path:"/webhooks/{id}",description:"Delete webhook endpoint"}),(0,b.jsx)(d.EndpointCard,{method:"GET",path:"/webhooks/{id}/events",description:"List delivery events"}),(0,b.jsx)(d.EndpointCard,{method:"POST",path:"/webhooks/{id}/events/{eventId}/retry",description:"Retry a failed delivery"})]})]}),(0,b.jsxs)("section",{className:"mb-12",children:[(0,b.jsx)("h2",{className:"text-2xl font-bold mb-4",children:"Register a Webhook"}),(0,b.jsx)(c.CodeBlock,{code:`curl -X POST http://localhost:8080/api/v1/webhooks \\
  -H "Authorization: Bearer sk_test_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://yourapp.com/webhooks",
    "events": ["charge.success", "charge.failed", "refund.success"],
    "description": "Production webhook"
  }'`,language:"bash",title:"POST /webhooks"})]}),(0,b.jsxs)("section",{className:"mb-12",children:[(0,b.jsx)("h2",{className:"text-2xl font-bold mb-4",children:"Webhook Payload"}),(0,b.jsx)(c.CodeBlock,{code:`{
  "event": "charge.success",
  "data": {
    "reference": "REF-001",
    "amount": 5000.00,
    "currency": "NGN",
    "status": "success",
    "paidAt": "2024-01-01T00:00:00.000Z",
    "customer": {
      "email": "customer@example.com"
    }
  },
  "sentAt": "2024-01-01T00:00:00.000Z"
}`,language:"json",title:"Example Webhook Payload"})]}),(0,b.jsxs)("section",{children:[(0,b.jsx)("h2",{className:"text-2xl font-bold mb-4",children:"Signature Verification"}),(0,b.jsx)("p",{className:"text-muted-foreground mb-4",children:"Verify webhook signatures using HMAC-SHA256:"}),(0,b.jsx)(c.CodeBlock,{code:`// Node.js
const crypto = require('crypto');
const secret = 'whsec_your_webhook_secret';
const signature = req.headers['x-webhook-signature'];
const payload = JSON.stringify(req.body);
const expected = crypto
  .createHmac('sha256', secret)
  .update(payload)
  .digest('hex');
const isValid = crypto.timingSafeEqual(
  Buffer.from(signature),
  Buffer.from(expected)
);`,language:"javascript",title:"Signature Verification (Node.js)"})]})]})}])},7398,a=>{a.n(a.i(38379))}];

//# sourceMappingURL=%5Broot-of-the-server%5D__1v80s0i._.js.map