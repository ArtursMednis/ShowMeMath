
type array_of_3 = [number, number, number];

class xyzStructure{
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

interface IGraphicObject{
  parentObject: IGraphicObject|null;
  objectFromLib: any;
	add(object3D: IGraphicObject):void;
	removeChild(object3D: IGraphicObject):void;
	changeColor(newColor:number|string):void;
	setShadows(shadowsOn:boolean):void;
	position:xyzStructure;
	rotation:xyzStructure;
	scale:xyzStructure;
	removeAndDispose():void;
}

interface IGraphicObject{
  parentObject: IGraphicObject|null;
  objectFromLib: any;
	add(object3D: IGraphicObject):void;
	removeChild(object3D: IGraphicObject):void;
	changeColor(newColor:number|string):void;
	setShadows(shadowsOn:boolean):void;
	position:xyzStructure;
	rotation:xyzStructure;
	scale:xyzStructure;
	removeAndDispose():void;
}

interface IGraphicOutputSystem {
	render(): void;
	sceneWidth:number;
	sceneHeight:number;
	FoV:number;
	
	lastUsedCountingObject():IGraphicObject;	//remove-refactor when posible	-	buisnes rules don't care about particular model

	loadLastUsedCountingObejct():Promise<void>;
	loadMan():Promise<void>;

	getNew3DObject(): IGraphicObject;
	box(x:number,y:number,z:number):IGraphicObject;
	man(coords:array_of_3):IGraphicObject;

	available3DObjects:IObject3DInfo[];
	getCamera():IGraphicObject;
	getScene():IGraphicObject;
}

interface IObject3DInfo{
	name:string;
	isLoaded:boolean;
	createNewObject():IGraphicObject;
	getCreateFunction():Promise<()=>IGraphicObject>;
}

type tEquitationDisplayParams = {
	number1?:number;
	number2?:number;
	resault?:number;
	remainder?:number;
	operationSign?:string;
	equalSign?:string;
	customText?:string;
	inactiveFields?:string[];
}

interface IEquitationDisplay{
	updateEquitationDisplay(params:tEquitationDisplayParams):void;
}

type tOptionsDisplayParams ={
	name:string;
	innerHTML:string;
	onclickFn:()=>void;
	context:any;


}

interface IOptionsDisplay{
	initOptionsDisplay(params:tOptionsDisplayParams[]):void;
	addChangeModelSelect(context:any):void;
}