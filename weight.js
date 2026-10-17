'use strict';
let weightSignature=2166136261;for(const r of catalog)for(const c of r.id+'\n')weightSignature=Math.imul(weightSignature^c.charCodeAt(0),16777619)>>>0;
const weightData=window.ALBION_WEIGHT_DATA,weightsValid=weightData?.count===catalog.length&&weightData?.signature===weightSignature,itemWeights=new Map(catalog.map((r,i)=>[r.id,weightsValid?weightData.values[i]:null]));
const storedCargo=readStore('ledger.analysis',{});$('cargoLimit').value=storedCargo.cargoLimit??'';$('cargoOccupied').value=storedCargo.cargoOccupied??0;$('cargoMode').value=storedCargo.cargoMode??'full';
const kg=n=>Number(n).toLocaleString('ru-RU',{maximumFractionDigits:3})+' кг';
function cargoLimit(){const s=$('cargoLimit').value.trim();return s===''?null:F.number(s)}
function cargoSnapshot(items){return F.cargo(items,holdings,itemWeights)}
function cargoState(items){return F.cargoCheck(cargoSnapshot(items),cargoLimit(),F.number($('cargoOccupied').value),$('cargoMode').value)}
function cargoFits(items){return cargoState(items).fits}
function cargoText(items){const c=cargoSnapshot(items),s=cargoState(items),input=c.unknownInput.length?'неизвестен':kg(c.input),output=c.unknownOutput.length?'неизвестен':kg(c.output),purchase=c.unknownPurchase.length?'неизвестен':kg(c.purchase);return `До улучшения: ${input} · после: ${output} · новая закупка: ${purchase}. ${s.available===null?'Лимит веса не задан.':s.unknown?'В расчёте есть неизвестный вес: план не проходит лимит.':s.fits?'Остаток под план: '+kg(Math.max(0,s.remaining))+' из '+kg(s.available)+'.':'Превышение лимита: '+kg(Math.max(0,-s.remaining))+'; доступно '+kg(s.available)+'.'}`}

