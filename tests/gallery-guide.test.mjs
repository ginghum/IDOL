import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8'),code=html.match(/<script>([\s\S]*?)<\/script>/)[1],nodes=new Map(),listeners={},document={querySelector(k){if(!nodes.has(k))nodes.set(k,{innerHTML:'',querySelector:()=>null});return nodes.get(k);},addEventListener(k,f){listeners[k]=f;}};
assert(!html.includes('data-action="catalog">カード一覧'));
new Function('document','localStorage','setTimeout','clearTimeout','assert','listeners','exists',code+String.raw`
const before=JSON.stringify({team,leader,chosenEvents,state}),click=(action,id)=>listeners.click({target:{closest:()=>({dataset:{action,id},disabled:false})}}),change=(id,value)=>listeners.change({target:{id,value,dataset:{}}}),content=()=>$('#modal').innerHTML;
click('rules');for(const section of ['basic','characters','events','fans']){click('rules-section',section);assert.equal(modal.section,section);assert.match(content(),/aria-label="遊び方"/);}
for(const id of Object.keys(FAN))assert(content().includes('data-art="fan-'+id+'"'));
click('rules-section','events');for(const id of Object.keys(COMMON))assert(content().includes(EVENTS[id].effect));
click('setup-detail','kokone');assert.equal(modal.kind,'rules');assert.equal(modal.character,'kokone');assert(content().includes(CHAR.kokone.skill));
click('catalog');assert.equal(modal.kind,'rules');click('common-catalog');assert.equal(modal.section,'events');click('fan-catalog');assert.equal(modal.section,'fans');
click('gallery');assert.equal(galleryKeys().length,Object.keys(ARTWORK).length);assert.match(content(),/197枚/);
for(const [key,path] of Object.entries(ARTWORK)){assert(exists(path));assert(!artworkLabel(key).includes('undefined'));}
for(const id of IDS){change('gallery-character',id);assert.equal(galleryKeys().length,5);assert(galleryKeys().every(key=>key.split('-')[1]===id));change('gallery-category','song');assert.equal(galleryKeys().length,3);const keys=galleryKeys();click('gallery-open',keys[0]);assert.match(content(),/gallery-enlarged/);assert(content().includes(ARTWORK[keys[0]]));assert(content().includes('data-action="gallery-prev" disabled'));click('gallery-prev');assert.equal(modal.art,keys[0]);listeners.keydown({key:'ArrowRight',preventDefault(){}});assert.equal(modal.art,keys[1]);click('gallery-next');assert.equal(modal.art,keys[2]);click('gallery-next');assert.equal(modal.art,keys[2]);listeners.keydown({key:'Escape'});assert.equal(modal.kind,'gallery');assert.equal(modal.art,null);assert.match(content(),/gallery-grid/);change('gallery-category','all');}
change('gallery-character','shared');assert(galleryKeys().every(key=>!Object.hasOwn(CHAR,key.split('-')[1])));
change('gallery-character','kayo');change('gallery-category','fan');assert.equal(galleryKeys().length,0);assert.match(content(),/該当するイラストがありません/);
const old=modal;change('gallery-category','invalid');change('gallery-character','invalid');assert.equal(modal,old);
assert.equal(JSON.stringify({team,leader,chosenEvents,state}),before);
`)(document,{getItem:()=>null,setItem(){}},()=>0,()=>{},assert,listeners,p=>existsSync(new URL('../'+p,import.meta.url)));
console.log('Unified guide and gallery: all cards, 197 art assets, 31 character filters, categories, enlargement, keyboard/bounded paging, empty/invalid filters and untouched game state passed');
