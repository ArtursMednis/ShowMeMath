

import { graphicOutputThree, object3DInfoThree, graphicObjectThree } from "./graphicOutputSystemThree";
import ExpoThree, { THREE } from 'expo-three';
import { countingSystem3DModel } from "./countingSystem3DModel";

export function initForMoblieThree(gl, width, height,scale,pixelRatio){
  graphicOutputThree.ThreeLib = THREE;
  object3DInfoThree.ThreeLib = THREE;
  graphicObjectThree.ThreeLib = THREE;
  var newGraphicOutput =  new graphicOutputThree();

  var renderer = new ExpoThree.Renderer({gl,pixelRatio,width,height});

  newGraphicOutput.renderer = renderer;

  newGraphicOutput.sceneWidth = width;
  newGraphicOutput.sceneHeight = height;

  countingSystem3DModel.inputOutputManager.getInstance().graphicOutputSystem = newGraphicOutput;

  
  newGraphicOutput.available3DObjects = [

    // new object3DInfoThree({name:"apple",fileName:"appleblend5.json",color:"#FF002f"}),
    // new object3DInfoThree({name:"banana",fileName:"smallBanana.json",color:"#d9db0c"}),
    // new object3DInfoThree({name:"Apelsīns",fileName:"apelsins.json",color:"#f98018"}),
    // new object3DInfoThree({name:"bumbieris",fileName:"bumbieris.json",color:"#599a14"}),
    // new object3DInfoThree({name:"citrons",fileName:"citrons.json",color:"#e9f103"}),
    
    // new object3DInfoThree({name:"granade",fileName:"granade.json",color:"#556b2f"}),

    // new object3DInfoThree({name:"elefant",fileName:"elefant.json",color:"#9b7653"}),
    // new object3DInfoThree({name:"Lācis",fileName:"bear.json",color:"#442000"}),
    // new object3DInfoThree({name:"briedis",fileName:"briedis.json",color:"#8e490b"}),
    // new object3DInfoThree({name:"lusis",fileName:"lusis.json",color:"#d25757"}),
    // new object3DInfoThree({name:"cuka",fileName:"pig.json",color:"#e5a3a3"}),
    // new object3DInfoThree({name:"putns",fileName:"putns.json",color:"#e5a3a3"}),
    // new object3DInfoThree({name:"jenots",fileName:"racoon.json",color:"#963838"}),
    // new object3DInfoThree({name:"skorpions",fileName:"skorpions.json",color:"#101020"}),
    // new object3DInfoThree({name:"zaķis",fileName:"zakis.json",color:"#9a9267"}),
    // new object3DInfoThree({name:"bruņu rupucis",fileName:"rupucis.json",color:"#dcca64"}),
    // new object3DInfoThree({name:"jūras brņu rupucis",fileName:"seeTurtle.json",color:"#62f977"}),
    // new object3DInfoThree({name:"haizivs",fileName:"haizivs.json",color:"#3e707c"}),
    // new object3DInfoThree({name:"krokodils",fileName:"krokodils.json",color:"#089a68"}),

    // new object3DInfoThree({name:"lidojošsais dinozaurs",fileName:"lidDino.json",color:"#c61515"}),
    // new object3DInfoThree({name:"tireks",fileName:"tireks.json",color:"#bfb05f"}),    

//    new object3DInfoThree({name:"tank",fileName:"tank.json",color:"#c2b280"}),

    new object3DInfoThree({name:"ball",color:"#2685AA",geometry: new THREE.SphereGeometry(0.6,10,8)}),
    
    //new object3DInfoThree({name:"dinamits",fileName:"dinamits.json",color:"#f11010"}),


    // new object3DInfoThree({name:"reaktīva limašīna",fileName:"reaktiva lidmasina.json",color:"#6b5c5c"}),
    // new object3DInfoThree({name:"lidmašina",fileName:"lidmasina.json",color:"#196148"}),
    // new object3DInfoThree({name:"lielgabals",fileName:"lielgabals.json",color:"#768580"}),

    // new object3DInfoThree({name:"revolers",fileName:"revolvers.json",color:"#dcca64"}),
    // new object3DInfoThree({name:"zvaigznite",fileName:"zvaigznite.json",color:"#5a676a"}),
    
// new object3DInfoThree({name:"Dārts Vaiders",fileName:"vaderBody.json",color:"#101010"}),
// new object3DInfoThree({name:"Dārts Vaides (galva)",fileName:"vaderHedblend.json",color:"#101010"}),
//    new object3DInfoThree({name:"snaiperis",fileName:"sniper.json",color:"#c9bb71"}),

  ];

  // var container:HTMLElement|null = document.getElementById("container");
	// if(container)
  //   container.appendChild(renderer.domElement);
    
}




export function countingModelMobileInit(aritmeticModel:countingSystem3DModel.AritmeticModel){
  var newRenderingEngine = countingSystem3DModel.inputOutputManager.getInstance().graphicOutputSystem! as graphicOutputThree;
  newRenderingEngine.sceneWidth = window.innerWidth - 30;
  newRenderingEngine.sceneHeight = window.innerHeight*2/3 - 20;
  newRenderingEngine.FoV = 45;
  newRenderingEngine.getCamera().position.z = 20;

  var CustomModel = aritmeticModel;
  newRenderingEngine.loadLastUsedCountingObejct().then(
  ()=>{
  CustomModel.num1 = 2;
  CustomModel.num2 = 3;
  }
  )
  newRenderingEngine.getScene().add(CustomModel.object3D);
  }