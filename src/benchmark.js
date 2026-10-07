(function(root){
'use strict';
function compare(input){const {game,beforeFps,beforeLow,afterFps,afterLow}=input;const values=[beforeFps,beforeLow,afterFps,afterLow];if(typeof game!=='string'||!game.trim()||game.length>120)throw new Error('Enter a game or benchmark scene (up to 120 characters).');if(values.some(n=>!Number.isFinite(n)||n<=0||n>5000))throw new Error('Enter measured FPS values between 0 and 5000.');if(beforeLow>beforeFps||afterLow>afterFps)throw new Error('1% low FPS should not exceed average FPS.');return {game:game.trim(),beforeFps,beforeLow,afterFps,afterLow,averageChange:Math.round((afterFps/beforeFps-1)*1000)/10,lowChange:Math.round((afterLow/beforeLow-1)*1000)/10,time:new Date().toISOString()};}
if(typeof module!=='undefined')module.exports={compare};else root.AgentBenchmark={compare};
})(typeof window==='undefined'?globalThis:window);
