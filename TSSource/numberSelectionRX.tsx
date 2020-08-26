
import React from "react";
import { StyleSheet, Text, View, Button, Alert, TextInput, Modal, TouchableHighlight, Dimensions } from 'react-native';

import ExpoThree, { THREE } from 'expo-three';
import { View as GraphicsView } from 'expo-graphics';
import { initForMoblieThree, countingModelMobileInit } from "./InitForMobileDevice";
import { countingSystem3DModel } from "./countingSystem3DModel";


class currentPageInfo {
  get allModels():tPageName[] { return ["Addition","Subtraction","Multiplication","Division"];}
  menuName:tPageName = "Menu";
  menuModel:()=>countingSystem3DModel.AritmeticModel = ()=> new countingSystem3DModel.AddingModel();
    
  set page(page:tPageName){
    this.menuName = page;
    switch (page) {
      case "Addition":
        this.menuModel = ()=> new countingSystem3DModel.AddingModel();
        break;
      case "Division":
        this.menuModel = ()=> new countingSystem3DModel.DivisionModel();
        break;
      case "Multiplication":
        this.menuModel = ()=> new countingSystem3DModel.MultiplyModel();
        break;
      case "Subtraction":
        this.menuModel = ()=> new countingSystem3DModel.SubtractionModel();
        break;
    } 
  }

  isPortretOrientation():boolean {
    const dim = Dimensions.get('screen');
    return dim.height >= dim.width;
  }

  get page(){
    return this.menuName;
  }

  operationSign(menuName = this.menuName):string {
    switch(menuName){
      case "Addition":
        return "+";
        break;
      case "Subtraction":
        return "-";
        break;
      case "Multiplication":
        return "*";
        break;
      case "Division":
        return "÷";
        break;
      case "Menu":
        return "←";
        break;
      default:
        return "";
    }
  }

  get numericOperation():(num1:number,num2:number)=>number {
    switch(this.menuName){
      case "Addition":
        return (num1:number,num2:number)=>{return num1 + num2;};
        break;
      case "Subtraction":
        return (num1:number,num2:number)=>{return num1 - num2;};
        break;
      case "Multiplication":
        return (num1:number,num2:number)=>{return num1 * num2;};
        break;
      case "Division":
        return (num1:number,num2:number)=>{return num1 / num2;};
        break;
      default:
        return (num1:number,num2:number)=>{return 0;};
    }
  }

  //singleton behavior
  private static uniqueInstance:currentPageInfo|null = null;
  private constructor(){}
  public static getInstance():currentPageInfo {
    if(this.uniqueInstance == null){
      this.uniqueInstance = new currentPageInfo();
    }
    return this.uniqueInstance;
  }

}


export class AppPage extends React.Component{
  constructor(props){
    super(props);
    Dimensions.addEventListener('change', () => {
      this.forceUpdate();
  });
  }


  selectMenu(menuPage:tPageName){
    currentPageInfo.getInstance().page = menuPage;
    this.forceUpdate();
  }
  render(){
    if(currentPageInfo.getInstance().page == "Menu" ){
      return(
        <MenuPage onMenuBtnClick={(menu:tPageName)=>{this.selectMenu(menu)}}></MenuPage>
        );
    }
    else{
      return(
        <ModelPage2 
          page={currentPageInfo.getInstance().page} 
          onMenuBtnClick={()=>{this.selectMenu("Menu")}}
          createCountingModel={()=>{return currentPageInfo.getInstance().menuModel()   }}
        ></ModelPage2>
        );
    }
  }

}


export class MenuPage extends React.Component<iMenuPageProps> {
  render() {
    return (
      <View style={[getOrientationChangeFlexStyle(), styles.appThemeColor,  {padding:2}]}>
        <View style={[styles.menuSelection, styles.appThemeColor]}>
          <ShowMeMathTitle></ShowMeMathTitle>
          {currentPageInfo.getInstance().allModels.map((modelName,keyIndex) => {
            return (
              <SMMMenuNutton 
                key={keyIndex} 
                elementTitle={modelName} 
                elementSymbol={currentPageInfo.getInstance().operationSign(modelName)} 
                onPress={()=>{this.props.onMenuBtnClick(modelName)}}
              ></SMMMenuNutton>
              // <Button key={keyIndex} onPress={()=>{this.props.onMenuBtnClick(modelName)}} title={modelName}/>
            );
          })}
        </View>
        <View style={styles.modelView}>
          <Text>ShowMeMath</Text>
          <TestThree></TestThree>
        </View>
    </View>
    )
  }
}

function ShowMeMathTitle():JSX.Element {
  return(
    
    <Text style={[{fontSize:30,fontWeight:"bold",marginTop:20,marginBottom:20},styles.appThemeColor]}>
      Show me Math
    </Text>
  )
}

function SMMMenuNutton(props:iSMMMenuNuttonProps):JSX.Element {
return(
  <TouchableHighlight 
    onPress={()=>{props.onPress(props.elementTitle as tPageName)} } 
    >
      <View style={{width:'100%', paddingBottom:5, paddingTop:5, flexDirection: 'row', backgroundColor:'white' }} >
        <Text style={{width:20,marginLeft:5,marginRight:5,backgroundColor:'cyan'}}> {props.elementSymbol} </Text>
        <Text> {props.elementTitle} </Text>
      </View>
  </TouchableHighlight>
);
}


export class EquitationDisplay extends React.Component<iEquitationDisplayProps>{
  render(){
    return (
      <View style = {styles.equitation}>

      <TouchableHighlight onPress = {() => { this.props.openModal(1)}}  >
        <Text style={[styles.equtationParts,{borderColor: 'red', borderStyle: 'dotted', borderWidth: 1, borderRadius: 20,}]}>{this.props.equitationParams.number1}</Text>
      </TouchableHighlight>

      <Text style={styles.equtationParts}>{this.props.equitationParams.operationSign}</Text>

      <Text style={[styles.equtationParts,{borderColor: 'red', borderStyle: 'dotted', borderWidth: 1, borderRadius: 20,}]}   onPress = {() => { this.props.openModal(2)}}   >{this.props.equitationParams.number2}</Text>

      <Text style={styles.equtationParts}>{
        (this.props.equitationParams.equalSign) ? this.props.equitationParams.equalSign : "="
      }</Text>

      <Text style={styles.equtationParts}>{this.props.equitationParams.resault}</Text>
    </View>
    )
  }
}






export class ModelPage2 extends React.Component<iModelPageProps,iModelPageState>{
  aritmeticModel: countingSystem3DModel.AritmeticModel | null = null;

  numericOperation:(num1:number,num2:number)=>number = (num1:number,num2:number)=>{
    return num1 + num2;
  }


  onChangeNum = (numAsString:string,didNum1Changed:boolean)=>{  
    var numAsNum = parseInt(numAsString);

    if(isNaN(numAsNum)){
      numAsNum = 0;
    }

    var modalVisibleNum1 = this.state.modalVisibleNum1;
    var modalVisibleNum2 = this.state.modalVisibleNum2;

    var number1 = modalVisibleNum1 ? numAsNum : this.state.equitationParams.number1!;
    var number2 = modalVisibleNum2 ? numAsNum : this.state.equitationParams.number2!;
    
    
    if(this.aritmeticModel){
      this.aritmeticModel.num1 = number1;
      this.aritmeticModel.num2 = number2;
    }
    var resault = (this.aritmeticModel) ? this.aritmeticModel.resault : this.numericOperation(number1,number2);
    var remainder = (this.aritmeticModel) ? this.aritmeticModel.remainder : 0;
    var operationSign = (this.aritmeticModel) ? this.aritmeticModel.operationDisplaySign : "+";

    this.setState({
      modalVisibleNum1:modalVisibleNum1,
      modalVisibleNum2:modalVisibleNum2,
      equitationParams: {
        number1:number1,
        number2:number2,
        resault:resault,
        remainder:remainder,
        operationSign:operationSign,
        inactiveFields:['resault']
      }
    })
  }

  closeModals(){
    let state = {...this.state};
    state.modalVisibleNum1 = false;
    state.modalVisibleNum2 = false;
    this.setState(state);
  }

  openModal(modalNo:number){
    let state = {...this.state};
    if(modalNo == 1) {
      state.modalVisibleNum1 = true;
    }
    else if(modalNo == 2){
      state.modalVisibleNum2 = true;
    }
    this.setState(state);
  }

  constructor(props){
    super(props);
    var pageInfo = currentPageInfo.getInstance();
    this.numericOperation = pageInfo.numericOperation;
    this.state = {
      modalVisibleNum1:false,
      modalVisibleNum2:false,
      equitationParams: {
        number1:3,
        number2:2,
        resault:5,
        remainder:0,
        operationSign:pageInfo.operationSign(),
        inactiveFields:['resault']
      }
    };
  }

  render(){
    return (
      <View style={[styles.container,styles.appThemeColor]}>

        <View style={{width:'100%',paddingTop:40,paddingLeft:30,paddingRight:'80%' }}>
          <SMMMenuNutton 
            elementTitle={"Back"} 
            elementSymbol={currentPageInfo.getInstance().operationSign("Menu")} 
            onPress={()=>{this.props.onMenuBtnClick()}}
          ></SMMMenuNutton>
        </View>

        <View style={[styles.modelView,{width:'95%'}]}>
          <Text>ShowMeMath</Text>
          <Container3D 
            createCountingModel={this.props.createCountingModel}
            setParentAritmeticModel={(AM)=>{  this.aritmeticModel = AM;}}
            ></Container3D>
        </View>

        <EquitationDisplay  
          equitationParams={this.state.equitationParams}   
          openModal = {(modalNo:number)=>{this.openModal(modalNo)} }
        />

        <NumberEditModal
          modalVisible={this.state.modalVisibleNum1 || this.state.modalVisibleNum2}
          previousNum={this.state.modalVisibleNum1 ? this.state.equitationParams.number1! : this.state.equitationParams.number2!}
          onChangeText={(num:string)=>{this.onChangeNum(num,this.state.modalVisibleNum1)}}
          closeCallback={() => { this.closeModals()}}
        ></NumberEditModal>
      </View>
    )
  }
}


class NumberEditModal extends React.Component<iNumberEditModalProps>{
  private textInput:TextInput|null = null;

  render(){
    return(

      <Modal
          visible={this.props.modalVisible}
          transparent = {true}
          animationType = {"fade"}
          onShow = {()=>{   if(this.textInput) {this.textInput.focus()}    }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>

              <TextInput
                ref={(input)=>{this.textInput = input;}}
                style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
                onChangeText={text => this.props.onChangeText(text)}
                keyboardType='numeric'
                value={this.props.previousNum.toString()}
              />

              <TouchableHighlight style={{marginLeft:50}} onPress = {() => { this.props.closeCallback()}}>
                  <Text>OK</Text>
              </TouchableHighlight>
            </View>
          </View>
        </Modal>
    )


  }
}





function getOrientationChangeFlexStyle(){
  var orientationStyle = StyleSheet.create({
    s: {
      flex: 1,
      flexDirection: (currentPageInfo.getInstance().isPortretOrientation()) ? 'column' : 'row',
    }
  })
  return orientationStyle.s;
}





export class TestThree extends React.Component{

  //@ts-ignore
  renderer: ExpoThree.Renderer;  scene:THREE.Scene;  camera: ExpoThree.THREE.PerspectiveCamera;  cube: ExpoThree.THREE.Mesh;


  render(){
    return(
      <View style={{flex:1,justifyContent:"center"}}>
      <GraphicsView
      
      onContextCreate = {this.onContextCreate}
      onRender = {this.onRender}
      />
    </View>
    )
  }
  onContextCreate = async ({gl, width, height,scale:pixelRatio})=> {
    this.renderer = new ExpoThree.Renderer({gl,pixelRatio,width,height});
    this.renderer.setClearColor(0xffffff);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75,width/height,0.1,1000);
    this.camera.position.z = 5;
    

    const geometry = new THREE.BoxGeometry(1,1,1);
    const material = new THREE.MeshPhongMaterial({color:0xff0000});

    this.cube = new THREE.Mesh(geometry,material);
    this.scene.add(this.cube);
    
    this.scene.add(new THREE.AmbientLight(0x404040));
    const ligth = new THREE.DirectionalLight(0xffffff,0.5);
    ligth.position.set(3,3,3);
    this.scene.add(ligth);
  }
  onRender = delta => {
    this.cube.rotation.x += 3.5*delta;
    this.cube.rotation.y += 2*delta;
    this.renderer.render(this.scene,this.camera);
  }
}






export class Container3D extends React.Component<iContainer3DProps>{

  //@ts-ignore
  renderer: ExpoThree.Renderer;  scene:THREE.Scene;  camera: ExpoThree.THREE.PerspectiveCamera;  cube: ExpoThree.THREE.Mesh;

  render(){
    return(
      <View style={{flex:1,justifyContent:"center"}}>
      <GraphicsView
      
      onContextCreate = {this.onContextCreate}
      onRender = {this.onRender}
      />
    </View>
    )
  }

  constructor(props){
    super(props);
  }

  onContextCreate = async ({gl, width, height,scale:pixelRatio})=> {
    //@ts-ignore
    THREE.suppressExpoWarnings();
    initForMoblieThree(gl, width, height,pixelRatio,pixelRatio);
    
    var AritmeticM=this.props.createCountingModel();
    this.props.setParentAritmeticModel(AritmeticM);
    
    countingModelMobileInit(AritmeticM);
  }
  onRender = delta => {
    countingSystem3DModel.AnimationManager.getInstance().nextFrame();
  }
}








const styles = StyleSheet.create({
  menuSelection: {
    flex: 4,
    flexDirection: 'column',
    marginTop:30,
    marginLeft:10,
    marginRight:10
  },
  appThemeColor:{
    backgroundColor:"#a9f1fe"
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  equitation:{
    flex: 2,
    flexDirection:"row",
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
  },
  equtationParts:{
    paddingRight:30,
    paddingLeft:30,
    fontSize:35,
  },
  modelView:{
    flex: 8,
    backgroundColor: '#0f0',
  },

  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },

});

const stylesTemp = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF"
  },
});

function padding(a, b, c, d) {
  return {
    paddingTop: a,
    paddingRight: b ? b : a,
    paddingBottom: c ? c : a,
    paddingLeft: d ? d : (b ? b : a)
  }
}


interface iModelPageProps {
  page: tPageName;
  onMenuBtnClick:()=>void;
  createCountingModel:()=>countingSystem3DModel.AritmeticModel;
}

interface iContainer3DProps{
  createCountingModel:()=>countingSystem3DModel.AritmeticModel;
  setParentAritmeticModel:(AM:countingSystem3DModel.AritmeticModel)=>void;  //refactor when posible  - pagaidām modeli nevar veidot uzreiz, jo vēl nav context, taču jāsataisa, lai modeli var veidot arī bez context un context piešķirt vēlāk
}