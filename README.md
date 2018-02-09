# Bankex Open Charity


Чтобы  запустить

1. Скопировать репозиторий
1. `npm install`
1. Установить плагин Metamask https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn
1. Скачать, установить и запустить Ganache https://github.com/trufflesuite/ganache
1. В Metamask изменить сеть на Custom RPC и указать адрес http://127.0.0.1:7545
1. `npm run start`, чтобы запустить приложение

Чтобы задеплоить контракт организации, необходим [truffle](http://truffleframework.com/)
1. `npm install -g truffle`
1. Зайти в папку проекта, запустить `truffle migrate --network ganache`
1. Дождаться компиляции, в консоли будет строчка вида `Organization: 0x.....` где 0x.... это адрес контракта организации. 
1. Скопировать адрес организации из предыдущего шага в `constants.js` в переменную `exports.DEV_ENVIRONMENT.organizations`;



