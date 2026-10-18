'use strict';
window.LedgerIP=(()=>{
const family=id=>id.replace(/^T\d+_/,'').replace(/@\d+$/,'');
function power(meta,quality,bonus=0,qualityBonus={1:0,2:20,3:40,4:60,5:100}){if(!meta||!Number.isInteger(quality)||quality<1||quality>meta[3]||!Number.isFinite(bonus)||bonus<0)throw Error('Проверь качество и бонус IP.');return meta[1]+qualityBonus[quality]+bonus*(1+meta[2])}
function compare(variants,quotes,options,{metadata,qualityBonus,now=Date.now()}){
 const {city,minimum,bonus=0,maxTier=8,maxEnchant=4,fresh=6,budget=0,upgrade=true}=options;
 if(!city||![minimum,bonus,maxTier,maxEnchant,fresh,budget].every(Number.isFinite)||minimum<0||bonus<0||fresh<=0||budget<0)throw Error('Проверь IP, город и числовые ограничения.');
 const map=new Map(quotes.filter(q=>q.city===city).map(q=>[[q.item_id,Number(q.quality)].join('|'),q])),byId=new Map(variants.map(v=>[v.id,v]));
 let issues=[];
 function quote(id,quality){const q=map.get([id,quality].join('|'));const raw=q?.sell_price_min_date,t=typeof raw==='string'&&!raw.startsWith('0001')?Date.parse(/[zZ]$|[+-]\d\d:\d\d$/.test(raw)?raw:raw+'Z'):NaN;const issue=!q||!Number.isFinite(q.sell_price_min)||q.sell_price_min<=0?'noPrice':!Number.isFinite(t)||t>now+300000?'invalid':now-t>fresh*3600000?'stale':null;if(issue){issues.push(issue);return null}return {id,quality,price:q.sell_price_min,date:raw,age:Math.max(0,(now-t)/3600000)}}
 const rows=[],stats={noIP:0,noPrice:0,stale:0,invalid:0,budget:0,shown:0,considered:0};let eligible=0,missing=0,minimumAvailableCost=null;
 for(const target of variants){if(target.tier>maxTier||target.enchant>maxEnchant)continue;const meta=metadata.get(target.id);if(!meta)continue;
  for(let quality=1;quality<=meta[3];quality++){
   stats.considered++;const ip=power(meta,quality,bonus,qualityBonus);if(ip+1e-8<minimum){stats.noIP++;continue}eligible++;issues=[];const failedPaths=[];
   const direct=quote(target.id,quality);let best=direct?{cost:direct.price,source:target.id,audit:[direct],materials:[],method:'ready'}:null;if(!direct)failedPaths.push(issues[0]);
   if(upgrade){let cursor=target,materials=new Map();while(cursor.enchant>0&&cursor.upgrades?.length){for(const [id,n]of cursor.upgrades)materials.set(id,(materials.get(id)||0)+n);const lowerId=cursor.id.replace(/@\d+$/,'')+(cursor.enchant>1?'@'+(cursor.enchant-1):''),lower=byId.get(lowerId);if(!lower||lower.tier!==target.tier||family(lower.id)!==family(target.id))break;issues=[];const base=quote(lowerId,quality),components=[...materials].map(([id,n])=>({quote:quote(id,1),n}));if(base&&components.every(x=>x.quote)){const cost=base.price+components.reduce((sum,x)=>sum+x.quote.price*x.n,0);if(!best||cost<best.cost)best={cost,source:lowerId,audit:[base,...components.map(x=>x.quote)],materials:components.map(x=>({id:x.quote.id,n:x.n,price:x.quote.price})),method:'enchant'}}else failedPaths.push(issues.includes('noPrice')?'noPrice':issues.includes('invalid')?'invalid':'stale');cursor=lower;}}
   if(!best){missing++;stats[failedPaths.includes('stale')?'stale':failedPaths.includes('invalid')?'invalid':'noPrice']++;continue}minimumAvailableCost=minimumAvailableCost===null?best.cost:Math.min(minimumAvailableCost,best.cost);if(budget&&best.cost>budget){stats.budget++;continue}stats.shown++;
   rows.push({id:target.id,tier:target.tier,enchant:target.enchant,quality,ip,baseIP:meta[1],qualityIP:qualityBonus[quality],personalIP:bonus*(1+meta[2]),modifier:meta[2],...best,direct:direct?.price??null,saving:direct?direct.price-best.cost:null,age:Math.max(...best.audit.map(a=>a.age))});
  }
 }
 rows.sort((a,b)=>a.cost-b.cost||b.ip-a.ip);return {rows,eligible,missing,stats,minimumAvailableCost};
}
return {family,power,compare};})();
