function t(){}function e(t,e){for(const n in e)t[n]=e[n];return t}function n(t){return t()}function r(){return Object.create(null)}function a(t){t.forEach(n)}function i(t){return"function"==typeof t}function o(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}function u(t,e,n,r){if(t){const a=s(t,e,n,r);return t[0](a)}}function s(t,n,r,a){return t[1]&&a?e(r.ctx.slice(),t[1](a(n))):r.ctx}function c(t,e,n,r){if(t[2]&&r){const a=t[2](r(n));if(void 0===e.dirty)return a;if("object"==typeof a){const t=[],n=Math.max(e.dirty.length,a.length);for(let r=0;r<n;r+=1)t[r]=e.dirty[r]|a[r];return t}return e.dirty|a}return e.dirty}function l(t,e,n,r,a,i){if(a){const o=s(e,n,r,i);t.p(o,a)}}function d(t){if(t.ctx.length>32){const e=[],n=t.ctx.length/32;for(let t=0;t<n;t++)e[t]=-1;return e}return-1}let f,h=!1;function m(t,e,n,r){for(;t<e;){const a=t+(e-t>>1);n(a)<=r?t=a+1:e=a}return t}function g(t,e){if(h){for(!function(t){if(t.hydrate_init)return;t.hydrate_init=!0;let e=t.childNodes;if("HEAD"===t.nodeName){const t=[];for(let n=0;n<e.length;n++){const r=e[n];void 0!==r.claim_order&&t.push(r)}e=t}const n=new Int32Array(e.length+1),r=new Int32Array(e.length);n[0]=-1;let a=0;for(let s=0;s<e.length;s++){const t=e[s].claim_order,i=(a>0&&e[n[a]].claim_order<=t?a+1:m(1,a,(t=>e[n[t]].claim_order),t))-1;r[s]=n[i]+1;const o=i+1;n[o]=s,a=Math.max(o,a)}const i=[],o=[];let u=e.length-1;for(let s=n[a]+1;0!=s;s=r[s-1]){for(i.push(e[s-1]);u>=s;u--)o.push(e[u]);u--}for(;u>=0;u--)o.push(e[u]);i.reverse(),o.sort(((t,e)=>t.claim_order-e.claim_order));for(let s=0,c=0;s<o.length;s++){for(;c<i.length&&o[s].claim_order>=i[c].claim_order;)c++;const e=c<i.length?i[c]:null;t.insertBefore(o[s],e)}}(t),(void 0===t.actual_end_child||null!==t.actual_end_child&&t.actual_end_child.parentElement!==t)&&(t.actual_end_child=t.firstChild);null!==t.actual_end_child&&void 0===t.actual_end_child.claim_order;)t.actual_end_child=t.actual_end_child.nextSibling;e!==t.actual_end_child?void 0===e.claim_order&&e.parentNode===t||t.insertBefore(e,t.actual_end_child):t.actual_end_child=e.nextSibling}else e.parentNode===t&&null===e.nextSibling||t.appendChild(e)}function w(t,e,n){t.insertBefore(e,n||null)}function b(t,e,n){h&&!n?g(t,e):e.parentNode===t&&e.nextSibling==n||t.insertBefore(e,n||null)}function v(t){t.parentNode.removeChild(t)}function p(t){return document.createElement(t)}function y(t){return document.createTextNode(t)}function T(){return y(" ")}function x(){return y("")}function M(t,e,n,r){return t.addEventListener(e,n,r),()=>t.removeEventListener(e,n,r)}function C(t,e,n){null==n?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function _(t){return Array.from(t.childNodes)}function D(t){void 0===t.claim_info&&(t.claim_info={last_index:0,total_claimed:0})}function k(t,e,n,r,a=!1){D(t);const i=(()=>{for(let r=t.claim_info.last_index;r<t.length;r++){const i=t[r];if(e(i)){const e=n(i);return void 0===e?t.splice(r,1):t[r]=e,a||(t.claim_info.last_index=r),i}}for(let r=t.claim_info.last_index-1;r>=0;r--){const i=t[r];if(e(i)){const e=n(i);return void 0===e?t.splice(r,1):t[r]=e,a?void 0===e&&t.claim_info.last_index--:t.claim_info.last_index=r,i}}return r()})();return i.claim_order=t.claim_info.total_claimed,t.claim_info.total_claimed+=1,i}function P(t,e,n,r){return k(t,(t=>t.nodeName===e),(t=>{const e=[];for(let r=0;r<t.attributes.length;r++){const a=t.attributes[r];n[a.name]||e.push(a.name)}e.forEach((e=>t.removeAttribute(e)))}),(()=>r?function(t){return document.createElementNS("http://www.w3.org/2000/svg",t)}(e):p(e)))}function S(t,e){return k(t,(t=>3===t.nodeType),(t=>{const n=""+e;if(t.data.startsWith(n)){if(t.data.length!==n.length)return t.splitText(n.length)}else t.data=n}),(()=>y(e)),!0)}function U(t){return S(t," ")}function E(t,e,n){for(let r=n;r<t.length;r+=1){const n=t[r];if(8===n.nodeType&&n.textContent.trim()===e)return r}return t.length}function $(t){const e=E(t,"HTML_TAG_START",0),n=E(t,"HTML_TAG_END",e);if(e===n)return new Y;D(t);const r=t.splice(e,n+1);v(r[0]),v(r[r.length-1]);const a=r.slice(1,r.length-1);for(const i of a)i.claim_order=t.claim_info.total_claimed,t.claim_info.total_claimed+=1;return new Y(a)}function N(t,e){e=""+e,t.wholeText!==e&&(t.data=e)}function W(t,e,n){t.classList[n?"add":"remove"](e)}class Y extends class{constructor(){this.e=this.n=null}c(t){this.h(t)}m(t,e,n=null){this.e||(this.e=p(e.nodeName),this.t=e,this.c(t)),this.i(n)}h(t){this.e.innerHTML=t,this.n=Array.from(this.e.childNodes)}i(t){for(let e=0;e<this.n.length;e+=1)w(this.t,this.n[e],t)}p(t){this.d(),this.h(t),this.i(this.a)}d(){this.n.forEach(v)}}{constructor(t){super(),this.e=this.n=null,this.l=t}c(t){this.l?this.n=this.l:super.c(t)}i(t){for(let e=0;e<this.n.length;e+=1)b(this.t,this.n[e],t)}}function O(t){f=t}function q(){if(!f)throw new Error("Function called outside component initialization");return f}function H(t){q().$$.on_mount.push(t)}function L(t){q().$$.after_update.push(t)}function j(t,e){q().$$.context.set(t,e)}function A(t,e){const n=t.$$.callbacks[e.type];n&&n.slice().forEach((t=>t.call(this,e)))}const z=[],F=[],B=[],X=[],G=Promise.resolve();let Q=!1;function R(t){B.push(t)}let J=!1;const I=new Set;function K(){if(!J){J=!0;do{for(let t=0;t<z.length;t+=1){const e=z[t];O(e),V(e.$$)}for(O(null),z.length=0;F.length;)F.pop()();for(let t=0;t<B.length;t+=1){const e=B[t];I.has(e)||(I.add(e),e())}B.length=0}while(z.length);for(;X.length;)X.pop()();Q=!1,J=!1,I.clear()}}function V(t){if(null!==t.fragment){t.update(),a(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(R)}}const Z=new Set;let tt;function et(){tt={r:0,c:[],p:tt}}function nt(){tt.r||a(tt.c),tt=tt.p}function rt(t,e){t&&t.i&&(Z.delete(t),t.i(e))}function at(t,e,n,r){if(t&&t.o){if(Z.has(t))return;Z.add(t),tt.c.push((()=>{Z.delete(t),r&&(n&&t.d(1),r())})),t.o(e)}}function it(t,e){const n={},r={},a={$$scope:1};let i=t.length;for(;i--;){const o=t[i],u=e[i];if(u){for(const t in o)t in u||(r[t]=1);for(const t in u)a[t]||(n[t]=u[t],a[t]=1);t[i]=u}else for(const t in o)a[t]=1}for(const o in r)o in n||(n[o]=void 0);return n}function ot(t){return"object"==typeof t&&null!==t?t:{}}function ut(t){t&&t.c()}function st(t,e){t&&t.l(e)}function ct(t,e,r,o){const{fragment:u,on_mount:s,on_destroy:c,after_update:l}=t.$$;u&&u.m(e,r),o||R((()=>{const e=s.map(n).filter(i);c?c.push(...e):a(e),t.$$.on_mount=[]})),l.forEach(R)}function lt(t,e){const n=t.$$;null!==n.fragment&&(a(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}function dt(t,e){-1===t.$$.dirty[0]&&(z.push(t),Q||(Q=!0,G.then(K)),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function ft(e,n,i,o,u,s,c,l=[-1]){const d=f;O(e);const m=e.$$={fragment:null,ctx:null,props:s,update:t,not_equal:u,bound:r(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(d?d.$$.context:n.context||[]),callbacks:r(),dirty:l,skip_bound:!1,root:n.target||d.$$.root};c&&c(m.root);let g=!1;if(m.ctx=i?i(e,n.props||{},((t,n,...r)=>{const a=r.length?r[0]:n;return m.ctx&&u(m.ctx[t],m.ctx[t]=a)&&(!m.skip_bound&&m.bound[t]&&m.bound[t](a),g&&dt(e,t)),n})):[],m.update(),g=!0,a(m.before_update),m.fragment=!!o&&o(m.ctx),n.target){if(n.hydrate){h=!0;const t=_(n.target);m.fragment&&m.fragment.l(t),t.forEach(v)}else m.fragment&&m.fragment.c();n.intro&&rt(e.$$.fragment),ct(e,n.target,n.anchor,n.customElement),h=!1,K()}O(d)}class ht{$destroy(){lt(this,1),this.$destroy=t}$on(t,e){const n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),()=>{const t=n.indexOf(e);-1!==t&&n.splice(t,1)}}$set(t){var e;this.$$set&&(e=t,0!==Object.keys(e).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}const mt=[];function gt(e,n=t){let r;const a=new Set;function i(t){if(o(e,t)&&(e=t,r)){const t=!mt.length;for(const n of a)n[1](),mt.push(n,e);if(t){for(let t=0;t<mt.length;t+=2)mt[t][0](mt[t+1]);mt.length=0}}}return{set:i,update:function(t){i(t(e))},subscribe:function(o,u=t){const s=[o,u];return a.add(s),1===a.size&&(r=n(i)||t),o(e),()=>{a.delete(s),0===a.size&&(r(),r=null)}}}}function wt(t){if(null===t||!0===t||!1===t)return NaN;var e=Number(t);return isNaN(e)?e:e<0?Math.ceil(e):Math.floor(e)}function bt(t,e){if(e.length<t)throw new TypeError(t+" argument"+(t>1?"s":"")+" required, but only "+e.length+" present")}function vt(t){bt(1,arguments);var e=Object.prototype.toString.call(t);return t instanceof Date||"object"==typeof t&&"[object Date]"===e?new Date(t.getTime()):"number"==typeof t||"[object Number]"===e?new Date(t):("string"!=typeof t&&"[object String]"!==e||"undefined"==typeof console||(console.warn("Starting with v2.0.0-beta.1 date-fns doesn't accept strings as date arguments. Please use `parseISO` to parse strings. See: https://git.io/fjule"),console.warn((new Error).stack)),new Date(NaN))}function pt(t,e){bt(2,arguments);var n=vt(t).getTime(),r=wt(e);return new Date(n+r)}function yt(t){var e=new Date(Date.UTC(t.getFullYear(),t.getMonth(),t.getDate(),t.getHours(),t.getMinutes(),t.getSeconds(),t.getMilliseconds()));return e.setUTCFullYear(t.getFullYear()),t.getTime()-e.getTime()}function Tt(t){return bt(1,arguments),t instanceof Date||"object"==typeof t&&"[object Date]"===Object.prototype.toString.call(t)}function xt(t){if(bt(1,arguments),!Tt(t)&&"number"!=typeof t)return!1;var e=vt(t);return!isNaN(Number(e))}var Mt={lessThanXSeconds:{one:"less than a second",other:"less than {{count}} seconds"},xSeconds:{one:"1 second",other:"{{count}} seconds"},halfAMinute:"half a minute",lessThanXMinutes:{one:"less than a minute",other:"less than {{count}} minutes"},xMinutes:{one:"1 minute",other:"{{count}} minutes"},aboutXHours:{one:"about 1 hour",other:"about {{count}} hours"},xHours:{one:"1 hour",other:"{{count}} hours"},xDays:{one:"1 day",other:"{{count}} days"},aboutXWeeks:{one:"about 1 week",other:"about {{count}} weeks"},xWeeks:{one:"1 week",other:"{{count}} weeks"},aboutXMonths:{one:"about 1 month",other:"about {{count}} months"},xMonths:{one:"1 month",other:"{{count}} months"},aboutXYears:{one:"about 1 year",other:"about {{count}} years"},xYears:{one:"1 year",other:"{{count}} years"},overXYears:{one:"over 1 year",other:"over {{count}} years"},almostXYears:{one:"almost 1 year",other:"almost {{count}} years"}},Ct=function(t,e,n){var r,a=Mt[t];return r="string"==typeof a?a:1===e?a.one:a.other.replace("{{count}}",e.toString()),null!=n&&n.addSuffix?n.comparison&&n.comparison>0?"in "+r:r+" ago":r};function _t(t){return function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},n=e.width?String(e.width):t.defaultWidth,r=t.formats[n]||t.formats[t.defaultWidth];return r}}var Dt={date:_t({formats:{full:"EEEE, MMMM do, y",long:"MMMM do, y",medium:"MMM d, y",short:"MM/dd/yyyy"},defaultWidth:"full"}),time:_t({formats:{full:"h:mm:ss a zzzz",long:"h:mm:ss a z",medium:"h:mm:ss a",short:"h:mm a"},defaultWidth:"full"}),dateTime:_t({formats:{full:"{{date}} 'at' {{time}}",long:"{{date}} 'at' {{time}}",medium:"{{date}}, {{time}}",short:"{{date}}, {{time}}"},defaultWidth:"full"})},kt={lastWeek:"'last' eeee 'at' p",yesterday:"'yesterday at' p",today:"'today at' p",tomorrow:"'tomorrow at' p",nextWeek:"eeee 'at' p",other:"P"};function Pt(t){return function(e,n){var r,a=n||{};if("formatting"===(a.context?String(a.context):"standalone")&&t.formattingValues){var i=t.defaultFormattingWidth||t.defaultWidth,o=a.width?String(a.width):i;r=t.formattingValues[o]||t.formattingValues[i]}else{var u=t.defaultWidth,s=a.width?String(a.width):t.defaultWidth;r=t.values[s]||t.values[u]}return r[t.argumentCallback?t.argumentCallback(e):e]}}function St(t){return function(e){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},r=n.width,a=r&&t.matchPatterns[r]||t.matchPatterns[t.defaultMatchWidth],i=e.match(a);if(!i)return null;var o,u=i[0],s=r&&t.parsePatterns[r]||t.parsePatterns[t.defaultParseWidth],c=Array.isArray(s)?Et(s,(function(t){return t.test(u)})):Ut(s,(function(t){return t.test(u)}));o=t.valueCallback?t.valueCallback(c):c,o=n.valueCallback?n.valueCallback(o):o;var l=e.slice(u.length);return{value:o,rest:l}}}function Ut(t,e){for(var n in t)if(t.hasOwnProperty(n)&&e(t[n]))return n}function Et(t,e){for(var n=0;n<t.length;n++)if(e(t[n]))return n}var $t,Nt={code:"en-US",formatDistance:Ct,formatLong:Dt,formatRelative:function(t,e,n,r){return kt[t]},localize:{ordinalNumber:function(t,e){var n=Number(t),r=n%100;if(r>20||r<10)switch(r%10){case 1:return n+"st";case 2:return n+"nd";case 3:return n+"rd"}return n+"th"},era:Pt({values:{narrow:["B","A"],abbreviated:["BC","AD"],wide:["Before Christ","Anno Domini"]},defaultWidth:"wide"}),quarter:Pt({values:{narrow:["1","2","3","4"],abbreviated:["Q1","Q2","Q3","Q4"],wide:["1st quarter","2nd quarter","3rd quarter","4th quarter"]},defaultWidth:"wide",argumentCallback:function(t){return t-1}}),month:Pt({values:{narrow:["J","F","M","A","M","J","J","A","S","O","N","D"],abbreviated:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],wide:["January","February","March","April","May","June","July","August","September","October","November","December"]},defaultWidth:"wide"}),day:Pt({values:{narrow:["S","M","T","W","T","F","S"],short:["Su","Mo","Tu","We","Th","Fr","Sa"],abbreviated:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],wide:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]},defaultWidth:"wide"}),dayPeriod:Pt({values:{narrow:{am:"a",pm:"p",midnight:"mi",noon:"n",morning:"morning",afternoon:"afternoon",evening:"evening",night:"night"},abbreviated:{am:"AM",pm:"PM",midnight:"midnight",noon:"noon",morning:"morning",afternoon:"afternoon",evening:"evening",night:"night"},wide:{am:"a.m.",pm:"p.m.",midnight:"midnight",noon:"noon",morning:"morning",afternoon:"afternoon",evening:"evening",night:"night"}},defaultWidth:"wide",formattingValues:{narrow:{am:"a",pm:"p",midnight:"mi",noon:"n",morning:"in the morning",afternoon:"in the afternoon",evening:"in the evening",night:"at night"},abbreviated:{am:"AM",pm:"PM",midnight:"midnight",noon:"noon",morning:"in the morning",afternoon:"in the afternoon",evening:"in the evening",night:"at night"},wide:{am:"a.m.",pm:"p.m.",midnight:"midnight",noon:"noon",morning:"in the morning",afternoon:"in the afternoon",evening:"in the evening",night:"at night"}},defaultFormattingWidth:"wide"})},match:{ordinalNumber:($t={matchPattern:/^(\d+)(th|st|nd|rd)?/i,parsePattern:/\d+/i,valueCallback:function(t){return parseInt(t,10)}},function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n=t.match($t.matchPattern);if(!n)return null;var r=n[0],a=t.match($t.parsePattern);if(!a)return null;var i=$t.valueCallback?$t.valueCallback(a[0]):a[0];i=e.valueCallback?e.valueCallback(i):i;var o=t.slice(r.length);return{value:i,rest:o}}),era:St({matchPatterns:{narrow:/^(b|a)/i,abbreviated:/^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,wide:/^(before christ|before common era|anno domini|common era)/i},defaultMatchWidth:"wide",parsePatterns:{any:[/^b/i,/^(a|c)/i]},defaultParseWidth:"any"}),quarter:St({matchPatterns:{narrow:/^[1234]/i,abbreviated:/^q[1234]/i,wide:/^[1234](th|st|nd|rd)? quarter/i},defaultMatchWidth:"wide",parsePatterns:{any:[/1/i,/2/i,/3/i,/4/i]},defaultParseWidth:"any",valueCallback:function(t){return t+1}}),month:St({matchPatterns:{narrow:/^[jfmasond]/i,abbreviated:/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,wide:/^(january|february|march|april|may|june|july|august|september|october|november|december)/i},defaultMatchWidth:"wide",parsePatterns:{narrow:[/^j/i,/^f/i,/^m/i,/^a/i,/^m/i,/^j/i,/^j/i,/^a/i,/^s/i,/^o/i,/^n/i,/^d/i],any:[/^ja/i,/^f/i,/^mar/i,/^ap/i,/^may/i,/^jun/i,/^jul/i,/^au/i,/^s/i,/^o/i,/^n/i,/^d/i]},defaultParseWidth:"any"}),day:St({matchPatterns:{narrow:/^[smtwf]/i,short:/^(su|mo|tu|we|th|fr|sa)/i,abbreviated:/^(sun|mon|tue|wed|thu|fri|sat)/i,wide:/^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i},defaultMatchWidth:"wide",parsePatterns:{narrow:[/^s/i,/^m/i,/^t/i,/^w/i,/^t/i,/^f/i,/^s/i],any:[/^su/i,/^m/i,/^tu/i,/^w/i,/^th/i,/^f/i,/^sa/i]},defaultParseWidth:"any"}),dayPeriod:St({matchPatterns:{narrow:/^(a|p|mi|n|(in the|at) (morning|afternoon|evening|night))/i,any:/^([ap]\.?\s?m\.?|midnight|noon|(in the|at) (morning|afternoon|evening|night))/i},defaultMatchWidth:"any",parsePatterns:{any:{am:/^a/i,pm:/^p/i,midnight:/^mi/i,noon:/^no/i,morning:/morning/i,afternoon:/afternoon/i,evening:/evening/i,night:/night/i}},defaultParseWidth:"any"})},options:{weekStartsOn:0,firstWeekContainsDate:1}};function Wt(t,e){bt(2,arguments);var n=wt(e);return pt(t,-n)}function Yt(t,e){for(var n=t<0?"-":"",r=Math.abs(t).toString();r.length<e;)r="0"+r;return n+r}var Ot={y:function(t,e){var n=t.getUTCFullYear(),r=n>0?n:1-n;return Yt("yy"===e?r%100:r,e.length)},M:function(t,e){var n=t.getUTCMonth();return"M"===e?String(n+1):Yt(n+1,2)},d:function(t,e){return Yt(t.getUTCDate(),e.length)},a:function(t,e){var n=t.getUTCHours()/12>=1?"pm":"am";switch(e){case"a":case"aa":return n.toUpperCase();case"aaa":return n;case"aaaaa":return n[0];case"aaaa":default:return"am"===n?"a.m.":"p.m."}},h:function(t,e){return Yt(t.getUTCHours()%12||12,e.length)},H:function(t,e){return Yt(t.getUTCHours(),e.length)},m:function(t,e){return Yt(t.getUTCMinutes(),e.length)},s:function(t,e){return Yt(t.getUTCSeconds(),e.length)},S:function(t,e){var n=e.length,r=t.getUTCMilliseconds();return Yt(Math.floor(r*Math.pow(10,n-3)),e.length)}};function qt(t){bt(1,arguments);var e=1,n=vt(t),r=n.getUTCDay(),a=(r<e?7:0)+r-e;return n.setUTCDate(n.getUTCDate()-a),n.setUTCHours(0,0,0,0),n}function Ht(t){bt(1,arguments);var e=vt(t),n=e.getUTCFullYear(),r=new Date(0);r.setUTCFullYear(n+1,0,4),r.setUTCHours(0,0,0,0);var a=qt(r),i=new Date(0);i.setUTCFullYear(n,0,4),i.setUTCHours(0,0,0,0);var o=qt(i);return e.getTime()>=a.getTime()?n+1:e.getTime()>=o.getTime()?n:n-1}function Lt(t){bt(1,arguments);var e=Ht(t),n=new Date(0);n.setUTCFullYear(e,0,4),n.setUTCHours(0,0,0,0);var r=qt(n);return r}function jt(t,e){bt(1,arguments);var n=e||{},r=n.locale,a=r&&r.options&&r.options.weekStartsOn,i=null==a?0:wt(a),o=null==n.weekStartsOn?i:wt(n.weekStartsOn);if(!(o>=0&&o<=6))throw new RangeError("weekStartsOn must be between 0 and 6 inclusively");var u=vt(t),s=u.getUTCDay(),c=(s<o?7:0)+s-o;return u.setUTCDate(u.getUTCDate()-c),u.setUTCHours(0,0,0,0),u}function At(t,e){bt(1,arguments);var n=vt(t,e),r=n.getUTCFullYear(),a=e||{},i=a.locale,o=i&&i.options&&i.options.firstWeekContainsDate,u=null==o?1:wt(o),s=null==a.firstWeekContainsDate?u:wt(a.firstWeekContainsDate);if(!(s>=1&&s<=7))throw new RangeError("firstWeekContainsDate must be between 1 and 7 inclusively");var c=new Date(0);c.setUTCFullYear(r+1,0,s),c.setUTCHours(0,0,0,0);var l=jt(c,e),d=new Date(0);d.setUTCFullYear(r,0,s),d.setUTCHours(0,0,0,0);var f=jt(d,e);return n.getTime()>=l.getTime()?r+1:n.getTime()>=f.getTime()?r:r-1}function zt(t,e){bt(1,arguments);var n=e||{},r=n.locale,a=r&&r.options&&r.options.firstWeekContainsDate,i=null==a?1:wt(a),o=null==n.firstWeekContainsDate?i:wt(n.firstWeekContainsDate),u=At(t,e),s=new Date(0);s.setUTCFullYear(u,0,o),s.setUTCHours(0,0,0,0);var c=jt(s,e);return c}var Ft="midnight",Bt="noon",Xt="morning",Gt="afternoon",Qt="evening",Rt="night";function Jt(t,e){var n=t>0?"-":"+",r=Math.abs(t),a=Math.floor(r/60),i=r%60;if(0===i)return n+String(a);var o=e||"";return n+String(a)+o+Yt(i,2)}function It(t,e){return t%60==0?(t>0?"-":"+")+Yt(Math.abs(t)/60,2):Kt(t,e)}function Kt(t,e){var n=e||"",r=t>0?"-":"+",a=Math.abs(t);return r+Yt(Math.floor(a/60),2)+n+Yt(a%60,2)}var Vt={G:function(t,e,n){var r=t.getUTCFullYear()>0?1:0;switch(e){case"G":case"GG":case"GGG":return n.era(r,{width:"abbreviated"});case"GGGGG":return n.era(r,{width:"narrow"});case"GGGG":default:return n.era(r,{width:"wide"})}},y:function(t,e,n){if("yo"===e){var r=t.getUTCFullYear(),a=r>0?r:1-r;return n.ordinalNumber(a,{unit:"year"})}return Ot.y(t,e)},Y:function(t,e,n,r){var a=At(t,r),i=a>0?a:1-a;return"YY"===e?Yt(i%100,2):"Yo"===e?n.ordinalNumber(i,{unit:"year"}):Yt(i,e.length)},R:function(t,e){return Yt(Ht(t),e.length)},u:function(t,e){return Yt(t.getUTCFullYear(),e.length)},Q:function(t,e,n){var r=Math.ceil((t.getUTCMonth()+1)/3);switch(e){case"Q":return String(r);case"QQ":return Yt(r,2);case"Qo":return n.ordinalNumber(r,{unit:"quarter"});case"QQQ":return n.quarter(r,{width:"abbreviated",context:"formatting"});case"QQQQQ":return n.quarter(r,{width:"narrow",context:"formatting"});case"QQQQ":default:return n.quarter(r,{width:"wide",context:"formatting"})}},q:function(t,e,n){var r=Math.ceil((t.getUTCMonth()+1)/3);switch(e){case"q":return String(r);case"qq":return Yt(r,2);case"qo":return n.ordinalNumber(r,{unit:"quarter"});case"qqq":return n.quarter(r,{width:"abbreviated",context:"standalone"});case"qqqqq":return n.quarter(r,{width:"narrow",context:"standalone"});case"qqqq":default:return n.quarter(r,{width:"wide",context:"standalone"})}},M:function(t,e,n){var r=t.getUTCMonth();switch(e){case"M":case"MM":return Ot.M(t,e);case"Mo":return n.ordinalNumber(r+1,{unit:"month"});case"MMM":return n.month(r,{width:"abbreviated",context:"formatting"});case"MMMMM":return n.month(r,{width:"narrow",context:"formatting"});case"MMMM":default:return n.month(r,{width:"wide",context:"formatting"})}},L:function(t,e,n){var r=t.getUTCMonth();switch(e){case"L":return String(r+1);case"LL":return Yt(r+1,2);case"Lo":return n.ordinalNumber(r+1,{unit:"month"});case"LLL":return n.month(r,{width:"abbreviated",context:"standalone"});case"LLLLL":return n.month(r,{width:"narrow",context:"standalone"});case"LLLL":default:return n.month(r,{width:"wide",context:"standalone"})}},w:function(t,e,n,r){var a=function(t,e){bt(1,arguments);var n=vt(t),r=jt(n,e).getTime()-zt(n,e).getTime();return Math.round(r/6048e5)+1}(t,r);return"wo"===e?n.ordinalNumber(a,{unit:"week"}):Yt(a,e.length)},I:function(t,e,n){var r=function(t){bt(1,arguments);var e=vt(t),n=qt(e).getTime()-Lt(e).getTime();return Math.round(n/6048e5)+1}(t);return"Io"===e?n.ordinalNumber(r,{unit:"week"}):Yt(r,e.length)},d:function(t,e,n){return"do"===e?n.ordinalNumber(t.getUTCDate(),{unit:"date"}):Ot.d(t,e)},D:function(t,e,n){var r=function(t){bt(1,arguments);var e=vt(t),n=e.getTime();e.setUTCMonth(0,1),e.setUTCHours(0,0,0,0);var r=e.getTime(),a=n-r;return Math.floor(a/864e5)+1}(t);return"Do"===e?n.ordinalNumber(r,{unit:"dayOfYear"}):Yt(r,e.length)},E:function(t,e,n){var r=t.getUTCDay();switch(e){case"E":case"EE":case"EEE":return n.day(r,{width:"abbreviated",context:"formatting"});case"EEEEE":return n.day(r,{width:"narrow",context:"formatting"});case"EEEEEE":return n.day(r,{width:"short",context:"formatting"});case"EEEE":default:return n.day(r,{width:"wide",context:"formatting"})}},e:function(t,e,n,r){var a=t.getUTCDay(),i=(a-r.weekStartsOn+8)%7||7;switch(e){case"e":return String(i);case"ee":return Yt(i,2);case"eo":return n.ordinalNumber(i,{unit:"day"});case"eee":return n.day(a,{width:"abbreviated",context:"formatting"});case"eeeee":return n.day(a,{width:"narrow",context:"formatting"});case"eeeeee":return n.day(a,{width:"short",context:"formatting"});case"eeee":default:return n.day(a,{width:"wide",context:"formatting"})}},c:function(t,e,n,r){var a=t.getUTCDay(),i=(a-r.weekStartsOn+8)%7||7;switch(e){case"c":return String(i);case"cc":return Yt(i,e.length);case"co":return n.ordinalNumber(i,{unit:"day"});case"ccc":return n.day(a,{width:"abbreviated",context:"standalone"});case"ccccc":return n.day(a,{width:"narrow",context:"standalone"});case"cccccc":return n.day(a,{width:"short",context:"standalone"});case"cccc":default:return n.day(a,{width:"wide",context:"standalone"})}},i:function(t,e,n){var r=t.getUTCDay(),a=0===r?7:r;switch(e){case"i":return String(a);case"ii":return Yt(a,e.length);case"io":return n.ordinalNumber(a,{unit:"day"});case"iii":return n.day(r,{width:"abbreviated",context:"formatting"});case"iiiii":return n.day(r,{width:"narrow",context:"formatting"});case"iiiiii":return n.day(r,{width:"short",context:"formatting"});case"iiii":default:return n.day(r,{width:"wide",context:"formatting"})}},a:function(t,e,n){var r=t.getUTCHours()/12>=1?"pm":"am";switch(e){case"a":case"aa":return n.dayPeriod(r,{width:"abbreviated",context:"formatting"});case"aaa":return n.dayPeriod(r,{width:"abbreviated",context:"formatting"}).toLowerCase();case"aaaaa":return n.dayPeriod(r,{width:"narrow",context:"formatting"});case"aaaa":default:return n.dayPeriod(r,{width:"wide",context:"formatting"})}},b:function(t,e,n){var r,a=t.getUTCHours();switch(r=12===a?Bt:0===a?Ft:a/12>=1?"pm":"am",e){case"b":case"bb":return n.dayPeriod(r,{width:"abbreviated",context:"formatting"});case"bbb":return n.dayPeriod(r,{width:"abbreviated",context:"formatting"}).toLowerCase();case"bbbbb":return n.dayPeriod(r,{width:"narrow",context:"formatting"});case"bbbb":default:return n.dayPeriod(r,{width:"wide",context:"formatting"})}},B:function(t,e,n){var r,a=t.getUTCHours();switch(r=a>=17?Qt:a>=12?Gt:a>=4?Xt:Rt,e){case"B":case"BB":case"BBB":return n.dayPeriod(r,{width:"abbreviated",context:"formatting"});case"BBBBB":return n.dayPeriod(r,{width:"narrow",context:"formatting"});case"BBBB":default:return n.dayPeriod(r,{width:"wide",context:"formatting"})}},h:function(t,e,n){if("ho"===e){var r=t.getUTCHours()%12;return 0===r&&(r=12),n.ordinalNumber(r,{unit:"hour"})}return Ot.h(t,e)},H:function(t,e,n){return"Ho"===e?n.ordinalNumber(t.getUTCHours(),{unit:"hour"}):Ot.H(t,e)},K:function(t,e,n){var r=t.getUTCHours()%12;return"Ko"===e?n.ordinalNumber(r,{unit:"hour"}):Yt(r,e.length)},k:function(t,e,n){var r=t.getUTCHours();return 0===r&&(r=24),"ko"===e?n.ordinalNumber(r,{unit:"hour"}):Yt(r,e.length)},m:function(t,e,n){return"mo"===e?n.ordinalNumber(t.getUTCMinutes(),{unit:"minute"}):Ot.m(t,e)},s:function(t,e,n){return"so"===e?n.ordinalNumber(t.getUTCSeconds(),{unit:"second"}):Ot.s(t,e)},S:function(t,e){return Ot.S(t,e)},X:function(t,e,n,r){var a=(r._originalDate||t).getTimezoneOffset();if(0===a)return"Z";switch(e){case"X":return It(a);case"XXXX":case"XX":return Kt(a);case"XXXXX":case"XXX":default:return Kt(a,":")}},x:function(t,e,n,r){var a=(r._originalDate||t).getTimezoneOffset();switch(e){case"x":return It(a);case"xxxx":case"xx":return Kt(a);case"xxxxx":case"xxx":default:return Kt(a,":")}},O:function(t,e,n,r){var a=(r._originalDate||t).getTimezoneOffset();switch(e){case"O":case"OO":case"OOO":return"GMT"+Jt(a,":");case"OOOO":default:return"GMT"+Kt(a,":")}},z:function(t,e,n,r){var a=(r._originalDate||t).getTimezoneOffset();switch(e){case"z":case"zz":case"zzz":return"GMT"+Jt(a,":");case"zzzz":default:return"GMT"+Kt(a,":")}},t:function(t,e,n,r){var a=r._originalDate||t;return Yt(Math.floor(a.getTime()/1e3),e.length)},T:function(t,e,n,r){return Yt((r._originalDate||t).getTime(),e.length)}};function Zt(t,e){switch(t){case"P":return e.date({width:"short"});case"PP":return e.date({width:"medium"});case"PPP":return e.date({width:"long"});case"PPPP":default:return e.date({width:"full"})}}function te(t,e){switch(t){case"p":return e.time({width:"short"});case"pp":return e.time({width:"medium"});case"ppp":return e.time({width:"long"});case"pppp":default:return e.time({width:"full"})}}var ee={p:te,P:function(t,e){var n,r=t.match(/(P+)(p+)?/),a=r[1],i=r[2];if(!i)return Zt(t,e);switch(a){case"P":n=e.dateTime({width:"short"});break;case"PP":n=e.dateTime({width:"medium"});break;case"PPP":n=e.dateTime({width:"long"});break;case"PPPP":default:n=e.dateTime({width:"full"})}return n.replace("{{date}}",Zt(a,e)).replace("{{time}}",te(i,e))}},ne=["D","DD"],re=["YY","YYYY"];function ae(t){return-1!==ne.indexOf(t)}function ie(t){return-1!==re.indexOf(t)}function oe(t,e,n){if("YYYY"===t)throw new RangeError("Use `yyyy` instead of `YYYY` (in `".concat(e,"`) for formatting years to the input `").concat(n,"`; see: https://git.io/fxCyr"));if("YY"===t)throw new RangeError("Use `yy` instead of `YY` (in `".concat(e,"`) for formatting years to the input `").concat(n,"`; see: https://git.io/fxCyr"));if("D"===t)throw new RangeError("Use `d` instead of `D` (in `".concat(e,"`) for formatting days of the month to the input `").concat(n,"`; see: https://git.io/fxCyr"));if("DD"===t)throw new RangeError("Use `dd` instead of `DD` (in `".concat(e,"`) for formatting days of the month to the input `").concat(n,"`; see: https://git.io/fxCyr"))}var ue=/[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g,se=/P+p+|P+|p+|''|'(''|[^'])+('|$)|./g,ce=/^'([^]*?)'?$/,le=/''/g,de=/[a-zA-Z]/;function fe(t,e,n){bt(2,arguments);var r=String(e),a=n||{},i=a.locale||Nt,o=i.options&&i.options.firstWeekContainsDate,u=null==o?1:wt(o),s=null==a.firstWeekContainsDate?u:wt(a.firstWeekContainsDate);if(!(s>=1&&s<=7))throw new RangeError("firstWeekContainsDate must be between 1 and 7 inclusively");var c=i.options&&i.options.weekStartsOn,l=null==c?0:wt(c),d=null==a.weekStartsOn?l:wt(a.weekStartsOn);if(!(d>=0&&d<=6))throw new RangeError("weekStartsOn must be between 0 and 6 inclusively");if(!i.localize)throw new RangeError("locale must contain localize property");if(!i.formatLong)throw new RangeError("locale must contain formatLong property");var f=vt(t);if(!xt(f))throw new RangeError("Invalid time value");var h=yt(f),m=Wt(f,h),g={firstWeekContainsDate:s,weekStartsOn:d,locale:i,_originalDate:f},w=r.match(se).map((function(t){var e=t[0];return"p"===e||"P"===e?(0,ee[e])(t,i.formatLong,g):t})).join("").match(ue).map((function(n){if("''"===n)return"'";var r=n[0];if("'"===r)return he(n);var o=Vt[r];if(o)return!a.useAdditionalWeekYearTokens&&ie(n)&&oe(n,e,t),!a.useAdditionalDayOfYearTokens&&ae(n)&&oe(n,e,t),o(m,n,i.localize,g);if(r.match(de))throw new RangeError("Format string contains an unescaped latin alphabet character `"+r+"`");return n})).join("");return w}function he(t){return t.match(ce)[1].replace(le,"'")}export{H as A,e as B,gt as C,u as D,l as E,d as F,c as G,g as H,t as I,W as J,M as K,A as L,Y as M,$ as N,fe as O,ht as S,_ as a,C as b,P as c,v as d,p as e,b as f,S as g,N as h,ft as i,ut as j,T as k,x as l,st as m,U as n,ct as o,it as p,ot as q,et as r,o as s,y as t,at as u,lt as v,nt as w,rt as x,j as y,L as z};