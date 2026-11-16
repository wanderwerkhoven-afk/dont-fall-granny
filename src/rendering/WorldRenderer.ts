import Phaser from 'phaser';
import { TIERS, getTierIndex, type TierDefinition, type VisualLayer } from '../content';

const W = 1080, H = 1920, PLUM = 0x352b49;
interface WorldSet { container: Phaser.GameObjects.Container; theme: TierDefinition; }
export class WorldRenderer {
  private current: WorldSet;
  private incoming?: WorldSet;
  private index=0;
  private elapsed=0;
  private announced=-1;
  private readonly transitionSeconds=2.6;
  constructor(private scene: Phaser.Scene, private reducedMotion: boolean) {
    this.current=this.makeWorld(TIERS[0]);
    this.scene.events.once('shutdown',()=>this.destroy());
  }
  update(distance: number, speed: number, dt: number): void {
    // Initiate the visual change in the last ~12m of the 80m approach corridor.
    const next=TIERS[this.index+1];
    const remaining=next ? next.startMeters-distance : Infinity;
    if(next && !this.incoming && remaining<=80 && remaining<=Math.max(12,speed*0.0095*this.transitionSeconds)) {
      this.incoming=this.makeWorld(next);
      this.incoming.container.setAlpha(0);
      this.elapsed=0;
    }
    if(this.incoming){
      this.elapsed=Math.min(this.transitionSeconds,this.elapsed+dt);
      const a=this.elapsed/this.transitionSeconds;
      this.incoming.container.setAlpha(a);
      this.current.container.setAlpha(1-a);
      if(a>=1 && distance>=next.startMeters){
        this.current.container.destroy(true);
        this.current=this.incoming;
        this.incoming=undefined;
        this.index=getTierIndex(distance);
        if(this.announced!==this.index){
          this.announced=this.index;
          this.showTierName(TIERS[this.index].name);
        }
      }
    }
    this.scroll(this.current,speed,dt);
    if(this.incoming)this.scroll(this.incoming,speed,dt);
  }
  private scroll(world:WorldSet,speed:number,dt:number):void{
    for(const child of world.container.list){
      const layer=child as Phaser.GameObjects.Container;
      const factor=Number(layer.getData('factor')??0);
      if(!factor)continue;
      const offset=Number(layer.getData('offset')??0)+speed*factor*dt;
      layer.setData('offset',offset);
      layer.x=-(offset%W);
    }
  }
  private makeWorld(tier:TierDefinition):WorldSet{
    const t=tier.visualTheme;
    const root=this.scene.add.container(0,0).setDepth(-10);
    root.add(this.scene.add.rectangle(540,960,W,H,t.sky));
    root.add(this.scene.add.rectangle(540,1370,W,520,t.ground));
    (['far','mid','near','foreground'] as const).forEach((key,i)=>{
      const spec=t[key];
      const group=this.scene.add.container(0,0);
      group.setData('factor',spec.factor);
      for(let copy=0;copy<3;copy++){
        const g=this.scene.add.graphics();
        this.drawPattern(g,spec,i,tier.id);
        g.x=copy*W;
        group.add(g);
      }
      root.add(group);
    });
    // Static particle composition stays visible when Reduced Motion is enabled.
    const particle=this.scene.add.graphics();
    if(t.particles!=='none'){
      for(let i=0;i<22;i++){
        const x=(i*197+91)%W,y=450+(i*131)%930;
        particle.fillStyle(t.particles==='fireflies'?0xffd76e:0xffefcd,.75);
        particle.fillCircle(x,y,2+(i%3)*2);
      }
    }
    root.add(particle);
    if(!this.reducedMotion && t.particles!=='none')this.scene.tweens.add({
      targets:particle,alpha:{from:.3,to:1},duration:1600,yoyo:true,repeat:-1
    });
    return {container:root,theme:tier};
  }
  private drawPattern(g:Phaser.GameObjects.Graphics,s:VisualLayer,depth:number,world:string):void{
    const baseline=[1080,1170,1310,1410][depth];
    const outlined=(x:number,y:number,w:number,h:number,r=12)=>{
      g.fillStyle(s.color);g.fillRoundedRect(x,y,w,h,r);
      g.lineStyle(5,PLUM,.86);g.strokeRoundedRect(x,y,w,h,r);
    };
    for(let i=0;i<9;i++){
      const x=i*145-65, v=(i*7+depth*3)%4;
      switch(s.kind){
        case 'skyline':case 'buildings':
          outlined(x,baseline-110-v*34,115,170+v*34,8);
          for(let j=0;j<3;j++){g.fillStyle(0xffeac3,.75);g.fillRoundedRect(x+18+j*27,baseline-66,14,24,3);}break;
        case 'houses':case 'shops':case 'windows':
          outlined(x,baseline-160,135,180,14);
          g.fillStyle(s.kind==='windows'?0xffdb87:0xa9dcdf);
          g.fillRoundedRect(x+25,baseline-108,34,44,7);g.fillRoundedRect(x+77,baseline-108,34,44,7);
          g.lineStyle(5,PLUM);g.strokeRoundedRect(x+25,baseline-108,34,44,7);
          if(s.kind==='shops'){g.fillStyle(0xffd980);g.fillRoundedRect(x+10,baseline-153,115,26,8);}break;
        case 'trees':case 'cacti':
          g.lineStyle(14,PLUM);g.lineBetween(x+65,baseline,x+65,baseline-115);
          g.fillStyle(s.color);g.fillCircle(x+65,baseline-145,53);
          g.lineStyle(5,PLUM);g.strokeCircle(x+65,baseline-145,53);break;
        case 'fence':
          for(let j=0;j<3;j++)outlined(x+j*48,baseline-95,28,110,8);
          g.fillStyle(s.color);g.fillRoundedRect(x,baseline-65,155,24,8);break;
        case 'traffic':
          outlined(x,baseline-75,126,58,19);
          g.fillStyle(PLUM);g.fillCircle(x+29,baseline-17,16);g.fillCircle(x+100,baseline-17,16);break;
        case 'pond':case 'dunes':case 'dust':
          g.fillStyle(s.color,.8);g.fillEllipse(x+60,baseline-10,190,58+v*14);break;
        case 'leaves':
          g.fillStyle(s.color);g.fillEllipse(x+60,baseline-90-v*25,25,13);break;
        case 'stars':
          g.fillStyle(s.color);g.fillCircle(x+70,baseline-240-v*69,3+v);break;
        case 'planets':
          if(i%3===0){g.fillStyle(s.color);g.fillCircle(x+65,baseline-290,105);g.lineStyle(8,PLUM);g.strokeCircle(x+65,baseline-290,105);}break;
        case 'debris':
          g.fillStyle(s.color);g.fillTriangle(x,baseline-130,x+65,baseline-167,x+125,baseline-106);break;
        case 'candy':case 'sweets':
          g.fillStyle(s.color);g.fillCircle(x+68,baseline-140-v*14,46);
          g.lineStyle(6,PLUM);g.strokeCircle(x+68,baseline-140-v*14,46);break;
      }
    }
    if(world==='park'&&s.kind==='pond'){
      for(let i=0;i<4;i++){const x=120+i*260;g.fillStyle(0xffd97b);g.fillEllipse(x,baseline-35,55,32);g.fillCircle(x+20,baseline-57,18);}
    }
    if(world==='neighborhood'&&s.kind==='fence'){
      for(let i=0;i<3;i++){const x=160+i*340;g.fillStyle(0xedb49f);g.fillCircle(x,baseline-140,24);g.lineStyle(15,PLUM);g.lineBetween(x,baseline-116,x,baseline-70);}
    }
  }
  private showTierName(name:string):void{
    const title=this.scene.add.text(540,400,name,{
      fontFamily:'Arial Black, Arial',fontSize:'46px',color:'#fff8ec',
      stroke:'#352b49',strokeThickness:9
    }).setOrigin(.5).setDepth(45).setAlpha(1);
    this.scene.tweens.add({targets:title,alpha:0,y:370,duration:this.reducedMotion?300:1400,delay:900,onComplete:()=>title.destroy()});
  }
  destroy():void{this.current?.container.destroy(true);this.incoming?.container.destroy(true);}
}
