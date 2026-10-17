'use strict';
const {Store}=require('./store.cjs');const {mkdirSync}=require('node:fs');const {resolve}=require('node:path');
const dir=resolve(process.env.DATA_DIR||'data');mkdirSync(dir,{recursive:true});const store=new Store(resolve(dir,'ledger.db'));
try{const [action,order,days]=process.argv.slice(2);if(action==='issue'){console.log(store.issue(Number(days),order))}else if(action==='revoke-unused'){store.revokeUnused(order);console.log('Неактивированный ключ отозван.')}else throw Error('Использование: node server/admin.cjs issue НОМЕР_ЗАКАЗА ДНИ | revoke-unused НОМЕР_ЗАКАЗА')}catch(e){console.error(e.message);process.exitCode=1}finally{store.close()}
