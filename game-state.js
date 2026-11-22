/* Single authoritative state machine for Don't Trip Grandma.
 * State transitions are synchronous; no gameplay subsystem may assign its own state.
 */
(()=>{'use strict';
const GameState=Object.freeze({
 MENU:'menu',RUN_RESET:'run_reset',RUNNING:'running',RECOVERY:'recovery',GRAB:'grab',SPECIAL_MODE:'special_mode',
 FALLING:'falling',RESCUE:'rescue',GAME_OVER:'game_over',PAUSED:'paused'
});
const allowed={
 [GameState.MENU]:[GameState.RUN_RESET,GameState.RUNNING],
 [GameState.RUN_RESET]:[GameState.RUNNING],
 [GameState.RUNNING]:[GameState.RECOVERY,GameState.GRAB,GameState.SPECIAL_MODE,GameState.PAUSED,GameState.FALLING,GameState.MENU],
 [GameState.RECOVERY]:[GameState.RUNNING,GameState.GRAB,GameState.FALLING],
 [GameState.GRAB]:[GameState.RUNNING,GameState.FALLING],
 [GameState.SPECIAL_MODE]:[GameState.RUNNING,GameState.FALLING,GameState.PAUSED],
 [GameState.FALLING]:[GameState.RESCUE],
 [GameState.RESCUE]:[GameState.GAME_OVER,GameState.RUNNING,GameState.MENU],
 [GameState.GAME_OVER]:[GameState.RESCUE,GameState.RUN_RESET,GameState.MENU],
 [GameState.PAUSED]:[GameState.RUNNING,GameState.SPECIAL_MODE,GameState.MENU]
};
class GameStateController{
 constructor(initial=GameState.MENU){
  if(!Object.values(GameState).includes(initial))throw Error('Unknown initial state');
  this.current=initial;this.previous=null;this.listeners=new Set();
  this.pausedFrom=null;
 }
 canTransition(next){
  return this.current!==next&&(allowed[this.current]||[]).includes(next);
 }
 transition(next,detail={}){
  if(!this.canTransition(next))return false;
  const previous=this.current;
  this.previous=previous;this.current=next;
  if(next===GameState.PAUSED)this.pausedFrom=previous;
  const event=Object.freeze({current:next,previous,detail});
  for(const listener of [...this.listeners])listener(event);
  return true;
 }
 onStateChanged(listener){
  if(typeof listener!=='function')throw TypeError('Listener must be a function');
  this.listeners.add(listener);return ()=>this.listeners.delete(listener);
 }
 get legacy(){
  switch(this.current){
   case GameState.MENU:return 'ready';
   case GameState.RECOVERY:return 'recovery';
   case GameState.GRAB:return 'grab';
   case GameState.GAME_OVER:return 'over';
   case GameState.PAUSED:return 'paused';
   case GameState.RUNNING:case GameState.SPECIAL_MODE:return 'playing';
   default:return 'over';
  }
 }
 get canAdvanceWorld(){return this.current===GameState.RUNNING||this.current===GameState.SPECIAL_MODE;}
 get canSpawn(){return this.current===GameState.RUNNING;}
 get inputMode(){
  if(this.current===GameState.RUNNING)return 'jump';
  if(this.current===GameState.RECOVERY)return 'recovery';
  if(this.current===GameState.GRAB)return 'grab';
  if(this.current===GameState.SPECIAL_MODE)return 'vehicle';
  return 'none';
 }
}
window.GrannyGameState={GameState,GameStateController};
})();