import ExpoThree, { THREE } from 'expo-three';

export class graphicOutputThree implements IGraphicOutputSystem{
  static ThreeLib: (typeof THREE)|null;
  
  

  sceneHeight:number = 200;
  sceneWidth:number = 200;
  FoV:number = 75;

  private camera:IGraphicObject|null = null;
  getCamera(): IGraphicObject {
    if(this.camera){
      return this.camera;
    }
    if(graphicOutputThree.ThreeLib != null){
      this.camera = 
      new graphicObjectThree(new (graphicOutputThree.ThreeLib as typeof THREE).PerspectiveCamera( this.FoV, this.sceneWidth/this.sceneHeight, 0.1, 1000));
      this.camera.position.z = 12;
      return this.camera;
    }
    return new graphicObjectThree();
  }

  private scene:IGraphicObject|null = null;
  getScene(): IGraphicObject {
    if(this.scene){
      return this.scene;
    }
    if(graphicOutputThree.ThreeLib != null){
      this.scene = new graphicObjectThree(new graphicOutputThree.ThreeLib.Scene());
    }
    else{
      this.scene = new graphicObjectThree();
    }
    return this.scene;
  }

  private _renderer:THREE.Renderer|null = null;
  

  // this must be given explicitly because web has webGL, while android has some AR renderer
  set renderer(newRenderer:THREE.Renderer){
    this._renderer = newRenderer;
  }
  get renderer(){
    if(this._renderer)
      return this._renderer
    else
      throw "no renderer initialized";
  }

  private sceneInitialized:boolean = false;

  private initScene():void{
    if(this._renderer == null){
      return;
    }
    //@ts-ignore
    this._renderer!.setClearColor(0xa9f1fe, 1);
    this._renderer!.setSize(this.sceneWidth,this.sceneHeight);
    this.AddLights();
    this.sceneInitialized = true;
  }

  render(): void {
    this.getCamera();
    if(this._renderer != null || this.camera != null){
      if(!this.sceneInitialized)
        this.initScene();
      var cameraFromLib = this.camera!.objectFromLib;
      var sceneFromLib = this.getScene().objectFromLib;
      this._renderer!.render(sceneFromLib,cameraFromLib);
    }
  }



  private AddLights(){
    try{

    var scene = this.getScene().objectFromLib;

    var pointLight =
    new graphicOutputThree.ThreeLib!.PointLight(0xFFFFFF,0.5);
    pointLight.position.x = 0;
    pointLight.position.y = -13;
    pointLight.position.z = 0;
 
    scene.add(pointLight);
  
    var pointLight2 =
    new graphicOutputThree.ThreeLib!.PointLight(0xFFFFFF,0.5);
    pointLight2.position.x = 0;
    pointLight2.position.y = 13;
    pointLight2.position.z = 0;
    scene.add(pointLight2);
    
    var pointLight3 =
    new graphicOutputThree.ThreeLib!.PointLight(0xFFFFFF,0.5);
    pointLight3.position.x = -13;
    pointLight3.position.y = 0;
    pointLight3.position.z = 0;
    scene.add(pointLight3);
    
    //
      var pointLight4 =
    new graphicOutputThree.ThreeLib!.PointLight(0xFFFFFF,0.5);
    pointLight4.position.x = 13;
    pointLight4.position.y = 0;
    pointLight4.position.z = 0;
    scene.add(pointLight4);
    
      var pointLight5 =
    new graphicOutputThree.ThreeLib!.PointLight(0xFFFFFF,0.5);
    pointLight5.position.x = 0;
    pointLight5.position.y = 0;
    pointLight5.position.z = 13;
    scene.add(pointLight5);
    
      var pointLight6 =
    new graphicOutputThree.ThreeLib!.PointLight(0xFFFFFF,0.5);
    pointLight6.position.x = 0;
    pointLight6.position.y = 0;
    pointLight6.position.z = -13;
    scene.add(pointLight6);
    }
    catch(exc){}
  //		https://discourse.threejs.org/t/solved-fix-light-position-regardless-of-user-controls/1663/2
  }
  
  
  

  sceneResize(){
    //window.addEventListener( 'resize', onWindowResize, false );
    //    https://stackoverflow.com/questions/20290402/three-js-resizing-canvas
    this.getCamera();
      if(this.camera != null){
        this.camera!.objectFromLib.aspect = this.sceneWidth/this.sceneHeight;
        this.camera!.objectFromLib.updateProjectionMatrix();
      }
      if(this._renderer != null){
        this._renderer!.setSize(this.sceneWidth,this.sceneHeight);
      }
  }


  
  getNew3DObject(): IGraphicObject {
    return new graphicObjectThree();
  }
  box(x: number, y: number, z: number): IGraphicObject {
    if(graphicOutputThree.ThreeLib){
      var cubeGeometry = new graphicOutputThree.ThreeLib.BoxGeometry( x, y, z );
      var material = new graphicOutputThree.ThreeLib.MeshLambertMaterial( { color: 0x0000ff } );

      var cube = new THREE.Mesh( cubeGeometry, material );
      return new graphicObjectThree(cube);
    }
    else
      return new graphicObjectThree();
  }
  async loadMan(jsonGeometry:string=""){
    var objectInfo:object3DInfoThree = new object3DInfoThree({name:"man",fileName:"man fni1.json",color:"#000000"});

    if(jsonGeometry != ""){
      objectInfo.parseGeometry(jsonGeometry)
    }
    else if(typeof document != 'undefined'){
      var createFunction = await objectInfo.getCreateFunction();
    }

    this.man = (coords:array_of_3) => {
      var newMan = objectInfo.createNewObject();
      newMan.position.set(coords[0],coords[1],coords[2]);
      return newMan;
    }
  }



  async loadLastUsedCountingObejct(existingObject?:object3DInfoThree){
    var selectedObjectInfo:object3DInfoThree;
    if(existingObject){
      selectedObjectInfo = existingObject;
    }
    else{
      var objectName:string = "";
      if (typeof(Storage) !== "undefined") {
        var objectNameFromStorage = localStorage.getItem("ShowMeMath-objectName");
        if(objectNameFromStorage)
          objectName = objectNameFromStorage;
      }
      if(objectName=="")
        objectName = this.available3DObjects[0].name;

      var objectInfoByName = this.available3DObjects.filter(	(object3DInfo) => object3DInfo.name == objectName	)
      selectedObjectInfo = objectInfoByName[0];
      if(typeof document != 'undefined'){
        var createFunction = await selectedObjectInfo.getCreateFunction();
      }
    }

    this.lastUsedCountingObject = ()=>{return selectedObjectInfo.createNewObject()};
  }

  man(coords: array_of_3): IGraphicObject {
    throw "object not loaded yet";
  }
  
  lastUsedCountingObject(): IGraphicObject {
    throw "object not loaded yet";
  }
  available3DObjects: object3DInfoThree[] = [];
}




export class object3DInfoThree implements IObject3DInfo{
  static ThreeLib: (typeof THREE)|null;

  name: string = '';
  isLoaded: boolean = false;

  color:string =  "#505050";

  geometry: THREE.Geometry|null = null;
  material:THREE.Material|null = null;
  fileName:string = "";
  folderPath:string = "./models3D/";
  jsonGeometry:string = "";

  public constructor(init?:Partial<object3DInfoThree>) {
		Object.assign(this, init);
  }
  private getMaterial(){
		if(this.material != null)
			return this.material;
		
		this.material = new THREE.MeshLambertMaterial(
			{
				color: this.color
			});
		return this.material;
  }
  private async requestHTTPData(urlString:string):Promise<string>{
    return new Promise((resolve, reject) => {
      var xmlhttp = new XMLHttpRequest();
      xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
          if(this.status == 200)
            resolve(this.responseText)
          else
            reject(xmlhttp.status.toString() + " - " + xmlhttp.statusText);
        }
      }
      xmlhttp.open("GET", urlString, true);
      xmlhttp.send();
    });
  }
  private async getGeometry():Promise<THREE.Geometry>{
		if(this.geometry != null)
      return this.geometry;
      
    try{
      if ((typeof document != 'undefined') && this.jsonGeometry == ""){
        this.jsonGeometry = await this.requestHTTPData(this.folderPath + this.fileName);
      }
      this.parseGeometry(this.jsonGeometry);
    }
    catch(exc){
      console.warn("file do not contain geometry: " + this.fileName + "; exception: " + exc);
      this.geometry = new object3DInfoThree.ThreeLib!.BoxGeometry( 0.5, 0.5, 0.5 );
    }
    return this.geometry!;
	}

  createNewObject: ()=>IGraphicObject = ()=> {
    var geometry = (this.geometry) ? this.geometry : new THREE.SphereGeometry(0.6,5,3);
		var material = this.getMaterial();
    var newMesh = new THREE.Mesh(geometry,material);
    return new graphicObjectThree(newMesh);
  }

  async getCreateFunction(): Promise<() => IGraphicObject> {
    this.geometry = await this.getGeometry();
		var material = this.getMaterial();
    return () => new graphicObjectThree(new THREE.Mesh(this.geometry!,material));
  }
  parseGeometry( jsonStr:string ) {
    var json = JSON.parse(jsonStr);
    var 
    
    geometry = new object3DInfoThree.ThreeLib!.Geometry(),
    scale = 1.0;
    parseModel( scale );
    geometry.computeFaceNormals();
    geometry.computeBoundingSphere();

    function parseModel( scale:number ) {

      function isBitSet( value:number, position:number ) {
        return value & ( 1 << position );
      }

      var i, j, fi,
      offset, zLength,
      colorIndex, normalIndex, uvIndex, materialIndex,

      type,
      isQuad,
      hasMaterial,
      hasFaceVertexUv,
      hasFaceNormal, hasFaceVertexNormal,
      hasFaceColor, hasFaceVertexColor,

      vertex, face, faceA, faceB, hex, normal,

      uvLayer, uv, u, v,

      faces = json.faces,
      vertices = json.vertices,
      normals = json.normals,
      colors = json.colors,

      nUvLayers = 0;

      if ( json.uvs !== undefined ) {
        // disregard empty arrays
        for ( i = 0; i < json.uvs.length; i ++ ) {
          if ( json.uvs[ i ].length ) nUvLayers ++;
        }
        for ( i = 0; i < nUvLayers; i ++ ) {
          geometry.faceVertexUvs[ i ] = [];
        }
      }

      offset = 0;
      zLength = vertices.length;

      while ( offset < zLength ) {
        vertex = new object3DInfoThree.ThreeLib!.Vector3();
        vertex.x = vertices[ offset ++ ] * scale;
        vertex.y = vertices[ offset ++ ] * scale;
        vertex.z = vertices[ offset ++ ] * scale;
        geometry.vertices.push( vertex );

      }

      offset = 0;
      zLength = faces.length;

      while ( offset < zLength ) {

        type = faces[ offset ++ ];

        isQuad              = isBitSet( type, 0 );
        hasMaterial         = isBitSet( type, 1 );
        hasFaceVertexUv     = isBitSet( type, 3 );
        hasFaceNormal       = isBitSet( type, 4 );
        hasFaceVertexNormal = isBitSet( type, 5 );
        hasFaceColor	     = isBitSet( type, 6 );
        hasFaceVertexColor  = isBitSet( type, 7 );

        if ( isQuad ) {
          
          faceA = new object3DInfoThree.ThreeLib!.Face3(faces[ offset ],faces[ offset + 1 ],faces[ offset + 3 ]);

          faceB = new object3DInfoThree.ThreeLib!.Face3(faces[ offset + 1 ],faces[ offset + 2 ],faces[ offset + 3 ] );

          offset += 4;
          if ( hasMaterial ) {
            materialIndex = faces[ offset ++ ];
            faceA.materialIndex = materialIndex;
            faceB.materialIndex = materialIndex;
          }

          // to get face <=> uv index correspondence
          fi = geometry.faces.length;
          if ( hasFaceVertexUv ) {
            for ( i = 0; i < nUvLayers; i ++ ) {
              uvLayer = json.uvs[ i ];
              geometry.faceVertexUvs[ i ][ fi ] = [];
              geometry.faceVertexUvs[ i ][ fi + 1 ] = [];
              for ( j = 0; j < 4; j ++ ) {
                uvIndex = faces[ offset ++ ];
                u = uvLayer[ uvIndex * 2 ];
                v = uvLayer[ uvIndex * 2 + 1 ];
                uv = new object3DInfoThree.ThreeLib!.Vector2( u, v );
                if ( j !== 2 ) geometry.faceVertexUvs[ i ][ fi ].push( uv );
                if ( j !== 0 ) geometry.faceVertexUvs[ i ][ fi + 1 ].push( uv );
              }
            }
          }

          if ( hasFaceNormal ) {
            normalIndex = faces[ offset ++ ] * 3;
            faceA.normal.set(
              normals[ normalIndex ++ ],
              normals[ normalIndex ++ ],
              normals[ normalIndex ]
            );
            faceB.normal.copy( faceA.normal );
          }

          if ( hasFaceVertexNormal ) {
            for ( i = 0; i < 4; i ++ ) {
              normalIndex = faces[ offset ++ ] * 3;
              normal = new object3DInfoThree.ThreeLib!.Vector3(
                normals[ normalIndex ++ ],
                normals[ normalIndex ++ ],
                normals[ normalIndex ]
              );
              if ( i !== 2 ) faceA.vertexNormals.push( normal );
              if ( i !== 0 ) faceB.vertexNormals.push( normal );
            }
          }

          if ( hasFaceColor ) {
            colorIndex = faces[ offset ++ ];
            hex = colors[ colorIndex ];
            faceA.color.setHex( hex );
            faceB.color.setHex( hex );
          }

          if ( hasFaceVertexColor ) {
            for ( i = 0; i < 4; i ++ ) {
              colorIndex = faces[ offset ++ ];
              hex = colors[ colorIndex ];
              if ( i !== 2 ) faceA.vertexColors.push( new object3DInfoThree.ThreeLib!.Color( hex ) );
              if ( i !== 0 ) faceB.vertexColors.push( new object3DInfoThree.ThreeLib!.Color( hex ) );
            }
          }

          geometry.faces.push( faceA );
          geometry.faces.push( faceB );

        } else {
          face = new object3DInfoThree.ThreeLib!.Face3(faces[ offset ++ ], faces[ offset ++ ],faces[ offset ++ ]);

          if ( hasMaterial ) {
            materialIndex = faces[ offset ++ ];
            face.materialIndex = materialIndex;
          }

          // to get face <=> uv index correspondence
          fi = geometry.faces.length;
          if ( hasFaceVertexUv ) {
            for ( i = 0; i < nUvLayers; i ++ ) {
              uvLayer = json.uvs[ i ];
              geometry.faceVertexUvs[ i ][ fi ] = [];
              for ( j = 0; j < 3; j ++ ) {
                uvIndex = faces[ offset ++ ];
                u = uvLayer[ uvIndex * 2 ];
                v = uvLayer[ uvIndex * 2 + 1 ];
                uv = new object3DInfoThree.ThreeLib!.Vector2( u, v );
                geometry.faceVertexUvs[ i ][ fi ].push( uv );
              }
            }
          }

          if ( hasFaceNormal ) {
            normalIndex = faces[ offset ++ ] * 3;
            face.normal.set(
              normals[ normalIndex ++ ],
              normals[ normalIndex ++ ],
              normals[ normalIndex ]
            );
          }

          if ( hasFaceVertexNormal ) {
            for ( i = 0; i < 3; i ++ ) {
              normalIndex = faces[ offset ++ ] * 3;
              normal = new object3DInfoThree.ThreeLib!.Vector3(
                normals[ normalIndex ++ ],
                normals[ normalIndex ++ ],
                normals[ normalIndex ]
              );
              face.vertexNormals.push( normal );
            }
          }


          if ( hasFaceColor ) {
            colorIndex = faces[ offset ++ ];
            face.color.setHex( colors[ colorIndex ] );
          }

          if ( hasFaceVertexColor ) {
            for ( i = 0; i < 3; i ++ ) {
              colorIndex = faces[ offset ++ ];
              face.vertexColors.push( new object3DInfoThree.ThreeLib!.Color( colors[ colorIndex ] ) );
            }
          }

          geometry.faces.push( face );
        }
      }
    }
    this.geometry = geometry;
  }
}



export class graphicObjectThree implements IGraphicObject{
  static ThreeLib: (typeof THREE)|null;
  objectFromLib: THREE.Mesh|null = null;

  childObjects:IGraphicObject[] = [];
  parentObject:IGraphicObject|null = null;

  position: xyzStructure = ( ()=>{
      var newXYZStructure = new xyzStructure();
      newXYZStructure.onChange = ()=>{
        try{
          if(this.objectFromLib){
            
            this.objectFromLib.position.x = newXYZStructure.x;
            this.objectFromLib.position.y = newXYZStructure.y;
            this.objectFromLib.position.z = newXYZStructure.z;
          }
        }
        catch(exc){ }
      }
      return newXYZStructure;
  } )();
  
  
  rotation: xyzStructure = ( ()=>{
      var newXYZStructure = new xyzStructure();
      newXYZStructure.onChange = ()=>{
        try{
          if(this.objectFromLib){
            this.objectFromLib.rotation.x = newXYZStructure.x;
            this.objectFromLib.rotation.y = newXYZStructure.y;
            this.objectFromLib.rotation.z = newXYZStructure.z;
          }
        }
        catch(exc){ }
      }
      return newXYZStructure;
  } )();
  

  scale: xyzStructure = ( ()=>{
      var newXYZStructure = new xyzStructure();
      newXYZStructure.onChange = ()=>{
        try{
          if(this.objectFromLib){
            this.objectFromLib.scale.set(newXYZStructure.x,newXYZStructure.y,newXYZStructure.z);
          }
        }
        catch(exc){
          console.warn("setScale exc: " + exc);
        }
      }
      return newXYZStructure;
  } )();

  
  

  constructor(newObjectFromLib?:THREE.Object3D){
    if(newObjectFromLib){
      this.objectFromLib = newObjectFromLib as THREE.Mesh;
    }
    else if(graphicObjectThree.ThreeLib){
      this.objectFromLib = new graphicObjectThree.ThreeLib.Object3D() as THREE.Mesh;
    }


  }

  add(object3D: IGraphicObject): void {
    this.childObjects.push(object3D);
    object3D.parentObject = this;
    try{
      if(this.objectFromLib)
        this.objectFromLib.add(object3D.objectFromLib)
    }
    catch(exc){
      console.warn("add: " + exc);
    }
  }

  removeChild(object3D: IGraphicObject): void {
    object3D.parentObject = null;
    var elemIndex = this.childObjects.indexOf(object3D);
    if(elemIndex > -1){
      this.childObjects.splice(elemIndex,1);
      try{
        if(this.objectFromLib)
          this.objectFromLib.remove(object3D.objectFromLib);
      }
      catch(exc){
        console.warn("remove: " + exc);
      }

    }
  }

  changeColor(newColor: string | number): void {
    try{
      if(this.objectFromLib){
        //@ts-ignore
        this.objectFromLib.material.color.setHex( newColor );
      }
    }
    catch(exc){
      console.warn("changeColor: " + exc);
    }
  }
  setShadows(shadowsOn: boolean): void {
    try{
      if(this.objectFromLib){
        this.objectFromLib.castShadow=shadowsOn;
        this.objectFromLib.receiveShadow=shadowsOn;
      }
    }
    catch(exc){
      console.warn("setShadows: " + exc);
    }
  }

  removeAndDispose(): void {
    if(this.parentObject != null){
      this.parentObject.removeChild(this);
    }

    try{
      if(this.objectFromLib){
        this.objectFromLib.geometry.dispose();
        //@ts-ignore
        this.objectFromLib.material.dispose();
      }
    }
    catch(exc){
      console.warn("setShadows: " + exc);
    }
  }
}

export class xyzStructure{
	_x:number=0;
	_y:number=0;
	_z:number=0;
	set(x:number,y:number,z:number):void{
		this._x=x;
		this._y=y;
		this._z=z;
		this.onChange();
	}
	get x(){
		return this._x;
	}
	get y(){
		return this._y;
	}
	get z(){
		return this._z;
	}

	set x(x:number){
		this._x = x;
		this.onChange();
	}
	set y(y:number){
		this._y = y;
		this.onChange();
	}
	set z(z:number){
		this._z = z;
		this.onChange();
	}

	onChange:()=>void = ()=>{};
}