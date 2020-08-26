
declare var MouseMoveCatcher: any;


export namespace countingSystem3DModel {



export interface IMoveableSystem{
	isMoving:boolean,
	parentObjectsToMove:IMoveableSystem[],
	move():void
}

interface IMoveableUnit extends IMoveableSystem{
	position:array_of_3,
	positionTarget:array_of_3,
	framesPerDelay:number,
	framesToDelay:number,
	movingIncrement:number,
	displayUnit:IGraphicObject,
	initMoveToNewPosition:Function,
	[key: string]: any
}


export class inputOutputManager{
	graphicOutputSystem:IGraphicOutputSystem|null = null;
	equitationDisplay:IEquitationDisplay|null = null;
	optionsDisplay:IOptionsDisplay|null = null;

	render() {
		if(this.graphicOutputSystem)
			this.graphicOutputSystem.render();
	}

	lastUsedCountingObject():IGraphicObject{
		if(this.graphicOutputSystem)
			return this.graphicOutputSystem.lastUsedCountingObject();
		else{
			//@ts-ignore
			return null;
		}
	}

	getNew3DObject():IGraphicObject{
		if(this.graphicOutputSystem)
			return this.graphicOutputSystem.getNew3DObject();
		else{
			//@ts-ignore
			return null;
		}
	}

	box(x:number,y:number,z:number):IGraphicObject{
		if(this.graphicOutputSystem)
			return this.graphicOutputSystem.box(x,y,z);
		else{
			//@ts-ignore
			return null;
		}
	}

	man(coords:array_of_3):IGraphicObject{
		if(this.graphicOutputSystem)
			return this.graphicOutputSystem.man(coords);
		else{
			//@ts-ignore
			return null;
		}
	}

	logMemory():void{

	}
	get available3DObjects():IObject3DInfo[]{
		if(this.graphicOutputSystem != null){
			return this.graphicOutputSystem.available3DObjects;
		}
		else{
			return [];
		}
	}

	updateEquitationDisplay(params:tEquitationDisplayParams){
		if(this.equitationDisplay)
			this.equitationDisplay.updateEquitationDisplay(params);
	}


	// singleton behavior
	private static uniqueInstance:inputOutputManager|null = null;
	private constructor(){	}
	public static getInstance():inputOutputManager {
		if(this.uniqueInstance == null)
			this.uniqueInstance = new inputOutputManager();
		return this.uniqueInstance;
	}

}


export class AnimationManager{
	private static uniqueInstance:AnimationManager|null = null;
	private constructor(){

	}
	public static getInstance():AnimationManager {
		if(this.uniqueInstance == null)
			this.uniqueInstance = new AnimationManager();
		return this.uniqueInstance;
	}

	public objectsToMove:IMoveableSystem[] = [];
	public loopFunctions:(()=> void)[] = [];

	public animateLoop():void{
		var that = AnimationManager.getInstance();
		requestAnimationFrame(that.animateLoop);

		var actionCounter = that.objectsToMove.length;
		while(actionCounter--){
			that.objectsToMove[actionCounter].move();
			if(!that.objectsToMove[actionCounter].isMoving){
				that.objectsToMove.splice(actionCounter,1);
			}
		}
		
		for(var loopCounter = 0; loopCounter < that.loopFunctions.length; loopCounter++){
			that.loopFunctions[loopCounter]();
		}
		inputOutputManager.getInstance().render();
	}

	public nextFrame():void{
		var that = AnimationManager.getInstance();
		
		var actionCounter = that.objectsToMove.length;
		while(actionCounter--){
			that.objectsToMove[actionCounter].move();
			if(!that.objectsToMove[actionCounter].isMoving){
				that.objectsToMove.splice(actionCounter,1);
			}
		}
		
		for(var loopCounter = 0; loopCounter < that.loopFunctions.length; loopCounter++){
			that.loopFunctions[loopCounter]();
		}
		inputOutputManager.getInstance().render();
	}

}


export class moveableUnit implements IMoveableUnit {
	[key: string]: any;
	position: array_of_3 = [0,0,0];
	positionTarget: array_of_3 = [0,0,0];
	isMoving: boolean = true;
	framesPerDelay: number = 1;
	framesToDelay: number = 0;
	movingIncrement: number = 0.1;// 0.025;
	parentObjectsToMove: IMoveableSystem[];
	displayUnit: IGraphicObject;

	isNew:boolean = true;
	OnMove():boolean{ 
		return false;
	}

	constructor(){
	
		this.parentObjectsToMove = AnimationManager.getInstance().objectsToMove;
		//@ts-ignore
		this.displayUnit = null;
	}

	
	initMoveToNewPosition(newPositionTarget:array_of_3,delayNumber:number=0,oldPosition?:array_of_3):void{		
		this.positionTarget = newPositionTarget;
		this.isMoving = true;
		
		if(oldPosition)
			this.position = oldPosition;
		
		if(!this.parentObjectsToMove.includes(this))
			this.parentObjectsToMove.push(this);
		
		if(delayNumber > 0){
			this.framesToDelay = delayNumber*this.framesPerDelay;
		}
		else {
			this.framesToDelay = 0;
			if(delayNumber < 0){
				this.position = this.positionTarget;
			}
		}
	}
		
	move(){
		if (this.framesToDelay > 0){
			this.framesToDelay--;
			return;
		}
		this.updatePositionFunction();
		this.updateDispPosition();
	}
	
	updateDispPosition(){
		this.displayUnit.position.z = this.position[2];
		this.displayUnit.position.y = this.position[1];
		this.displayUnit.position.x = this.position[0];
	}
	
	
	updatePositionFunction() {
		var deltaMargin = 0.5;
		var movingIncrement = this.movingIncrement;
		var additionalActionCheck = this.OnMove();
		var isMovingByDim = [true,true,true];
		
		for(var dimension = 0; dimension < 3; dimension++){
			var delta = this.position[dimension] - this.positionTarget[dimension];
			if (Math.abs(delta) < deltaMargin) {
				this.position[dimension] = this.positionTarget[dimension];
				isMovingByDim[dimension] = false;
			}
			else
				this.position[dimension] = this.position[dimension] - movingIncrement * Math.sign(delta);
		}
		
		this.isMoving = isMovingByDim[0] || isMovingByDim[1] || isMovingByDim[2] || additionalActionCheck;
		this.isNew = false;
	}
		
	
};

export class CountingUnitParams {
	constructor(){
		
		this.position = [0,25,0];
		this.positionTarget = [0,0,0];
		this.framesPerDelay = 0.75;
		this.framesToDelay = 0;
		this.isMoving = false;
		
		this.parentObjectsToMove = AnimationManager.getInstance().objectsToMove;
		
		
		this.creationFunction = function(){
			return inputOutputManager.getInstance().lastUsedCountingObject(); //refactor asap
		}
		this.movingIncrement = 0.2;
	}

	
	creationFunction: () => IGraphicObject;
	isMoving: boolean;
	position: array_of_3;
	isNegative: boolean = false;
	defaultColor = 0xFF002f;

	positionTarget: array_of_3;
	framesPerDelay: number;
	framesToDelay: number;
	movingIncrement: number;
	parentObjectsToMove: IMoveableSystem[];
  creationFunctionLoaded:boolean = false;

};

export class CountingUnit extends moveableUnit{
	params:CountingUnitParams;
	previousGraphicParent:CountingSet|null = null;
	onFirstMoveFunction:((CU:CountingUnit)=>void) | null = null;
	pairedUnit:CountingUnit|null = null;
	object3D:IGraphicObject;

	constructor(params:CountingUnitParams = new CountingUnitParams()){
		super();
		this.params = params;
		
		this.position = JSON.parse(JSON.stringify(params.position));
		this.positionTarget = JSON.parse(JSON.stringify(params.positionTarget));
		
		this.creationFunction = params.creationFunction;
		if(params.framesPerDelay)
			this.framesPerDelay = params.framesPerDelay;
		if(params.parentObjectsToMove)
			this.parentObjectsToMove = params.parentObjectsToMove;
		if(params.isMoving)
			this.isMoving = params.isMoving;
		if(params.movingIncrement)
			this.movingIncrement = params.movingIncrement;
		if(params.framesToDelay)
			this.framesToDelay = params.framesToDelay;
		this.displayUnit = this.creationFunction();
		this.object3D = this.displayUnit;
		if(params.isNegative)
			this.isNegative = params.isNegative;
	}

	get isNegative(){
		return this._isNegative;
	}
	set isNegative(newVal){
		this._isNegative = newVal;
		if(newVal){
			this.changeDispUnitColor('0x000000');
			this.useShadows(false);
		}
		else
			this.changeDispUnitColor(this.defaultColor);//0xffffff 
			this.useShadows(false);
	}
	
	changeDispUnitColor(newColor:string){
		this.displayUnit.changeColor(newColor);
	}
	useShadows(shadowsOn:boolean){
		this.displayUnit.setShadows(shadowsOn);
	}
	updateDisplayUnit(newDisplayUnit:()=>IGraphicObject){
		this.creationFunction = newDisplayUnit;
		this.displayUnit = this.creationFunction();
		this.object3D = this.displayUnit;
	}

	OnMove():boolean{
		if(this.onFirstMoveFunction){
			this.onFirstMoveFunction(this);
			this.onFirstMoveFunction = null;
			this.previousGraphicParent = null;
		}

		return false;
	}
};


export class CountingSet extends Array implements IMoveableUnit{
	object3D:IGraphicObject;
	object3DExternal:IGraphicObject;
	subObjectsToMove:IMoveableUnit[];
	subObjectsToMoveAway:IMoveableUnit[];
	negativeSet:IMoveableUnit[];
	
	pairedNegatives:IMoveableUnit[];
	pairedPositives:IMoveableUnit[];
	gridUnits:IGraphicObject[];

	elementsForSubstructure:number = 0;
	substructureCount:number = 0;

	parentObjectsToMove:IMoveableSystem[];


	position:array_of_3;
	positionTarget:array_of_3;
	movingIncrement:number;
	displayUnit:IGraphicObject;

	isMoving:boolean;
	useDelay:boolean;
	speakNumAfterMove:boolean;
//	equitationDisplayDiv:HTMLElement|null;
	_useAnimation:boolean;
	_ballMovingIncrement:number;
	_framesPerDelay:number;
	framesToDelay:number;
	CountingUnitParams:CountingUnitParams = new CountingUnitParams();
	startingPoint:array_of_3|null;
	terminationPoint:array_of_3|null;
	displayDimensions:array_of_3|null;

	displayView:Function;
	internal3DMovableUnit:IMoveableUnit;
	external3DMovableUnit:IMoveableUnit;




	constructor(params?:any, ...items:any){
		super(...items);
		this.object3D = inputOutputManager.getInstance().getNew3DObject();
		this.object3DExternal = inputOutputManager.getInstance().getNew3DObject();
		this.object3DExternal.add(this.object3D);
		
		this.object3D.position.x = -5;
		this.object3D.position.y = -5;
		this.object3D.position.z = -5;
		
		
		this.subObjectsToMove = [];
		this.subObjectsToMoveAway = [];
		this.negativeSet = [];
		this.pairedNegatives = [];
		this.pairedPositives = [];
		this.gridUnits = [];
		this.parentObjectsToMove = AnimationManager.getInstance().objectsToMove;
		this.isMoving = false;

		this.position = [0,25,0];
		this.positionTarget = [0,0,0];
		
		this.useDelay = true;
		this.speakNumAfterMove = false;
	//	this.equitationDisplayDiv = null;
		
		this._useAnimation = true;
		this._ballMovingIncrement = 0.2;
		this._framesPerDelay = 0.75;
		this.framesToDelay = 0;
		this.startingPoint = null;
		this.terminationPoint = [8,25,15];
		this.displayDimensions = [10,10,10];
		//this.displayView = this.setBlockView;
		
		// this.displayView = CountingSetViewFunctions.setBlockViewByDecimalsFromUpside;
		this.displayView = CountingSetViewFunctions.setBlockViewByDecimals;
		
		this.internal3DMovableUnit = new countingSystem3DModel.moveableUnit();
		this.internal3DMovableUnit.parentObjectsToMove = this.subObjectsToMove;
		this.internal3DMovableUnit.displayUnit = this.object3D;
		
		this.external3DMovableUnit = new countingSystem3DModel.moveableUnit();
		this.external3DMovableUnit.parentObjectsToMove = this.subObjectsToMove;
		this.external3DMovableUnit.displayUnit = this.object3DExternal;
		this.external3DMovableUnit.movingIncrement = 0.5;
		this.movingIncrement = 0.5;
		this.displayUnit = this.object3DExternal;
	}
	
	
	get useAnimation(){
		return this._useAnimation;
	}
	set useAnimation(newVal){
		this._useAnimation = newVal;
		if(newVal){
			this.displayView = CountingSetViewFunctions.setBlockViewByDecimals;
		}
		else
			this.displayView = this.setBlockView;
	}
	
	get ballMovingIncrement(){
		return this._ballMovingIncrement;
	}
	set ballMovingIncrement(newVal){
		this._ballMovingIncrement = newVal;
		for(var unitCounter = 0; unitCounter < this.length; unitCounter++){
			this[unitCounter].movingIncrement = newVal;
		}
 		this.CountingUnitParams.movingIncrement = newVal;
	}
	get framesPerDelay(){
		return this._framesPerDelay;
	}
	set framesPerDelay(newVal){
		this._framesPerDelay = newVal;
		
		
		for(var unitCounter = 0; unitCounter < this.length; unitCounter++){
			this[unitCounter].framesPerDelay = newVal;
		}
		
		this.CountingUnitParams.framesPerDelay = newVal;
		
	}
	
	addUnit(CountingUnit:CountingUnit) {
		
		CountingUnit.parentObjectsToMove = this.subObjectsToMove;
		this.push(CountingUnit);
		this.object3D.add(CountingUnit.displayUnit);
	}
	addNegativeUnit(CountingUnit:CountingUnit) {
		
		CountingUnit.parentObjectsToMove = this.subObjectsToMove;
		this.negativeSet.push(CountingUnit);
		this.object3D.add(CountingUnit.displayUnit);
	}
	appendNewUnits(count:number){
		if(this.startingPoint != null){
			if(
			!isNaN(this.startingPoint[0]) && (this.startingPoint[0] != null)
			&& !isNaN(this.startingPoint[1])  && (this.startingPoint[1] != null)
			&& !isNaN(this.startingPoint[2]) && (this.startingPoint[2] != null)	){
				this.CountingUnitParams.position = this.startingPoint;
			}
		}
		
		for(var unitCounter = 0; unitCounter < count; unitCounter++){
			var CountingUnit = new countingSystem3DModel.CountingUnit(this.CountingUnitParams);
			//this.addUnit(CountingUnit);
			
			/*
			ir		-4
			spiežu	6 
			sagaidu	+1 	un tad vēl tie pārējie pienāk klāt - kopā 6
			
			
			//*/
			
			if(this.negativeSet.length == 0){
				this.addUnit(CountingUnit);
			}
			else{
				this.cancelNegativeUnit(CountingUnit);
			}
		}
	}
	removeUnits(count:number){
		for(var unitCounter = 0; unitCounter < count; unitCounter++){
			if(this.length > 0) {
			  var CountingUnit:CountingUnit = this.pop();
				CountingUnit.displayUnit.removeAndDispose();
			}
		}
	}
	removeAllNegativeUnits(){
		var negCount = this.negativeSet.length;
		for(var unitCounter = 0; unitCounter < negCount; unitCounter++){
			  var CountingUnit = this.negativeSet.pop();
				if(CountingUnit)
					CountingUnit.displayUnit.removeAndDispose();
		}
	}
	
	cancelNegativeUnit(CountingUnit:CountingUnit){
		if(this.negativeSet.length == 0)
			throw 'callec "cancelNegativeUnit" but no negative unit in set';
		var pairedNegative = (this.negativeSet.pop() as CountingUnit);
		
		pairedNegative.pairedUnit = CountingUnit;
		CountingUnit.pairedUnit = pairedNegative;
		this.pairedNegatives.push(pairedNegative);
		this.pairedPositives.push(CountingUnit);
		
		this.object3D.add(CountingUnit.displayUnit);
		
		CountingUnit.parentObjectsToMove = this.pairedPositives;
		CountingUnit.movingIncrement = 1.5*CountingUnit.movingIncrement;
		CountingUnit.initMoveToNewPosition(pairedNegative.position,0);
		pairedNegative.positionTarget = pairedNegative.position;
	}
	
	public setNumber(targetNum:number){
		var requiredUnitsCount = targetNum - this.length;
		if(requiredUnitsCount > 0) {
			this.removeAllNegativeUnits();
			this.appendNewUnits(requiredUnitsCount);
			this.displayView();
		}
		else{
			this.moveAway(-requiredUnitsCount);
		}
		this.adjustBlockCenter();
		this.updateEquitationDisplayDiv();
		
		inputOutputManager.getInstance().logMemory();
		
	}
	
	detachUnits(count:number):CountingUnit[]{
		var detachedUnits:any[] = [];
		
		//get rotation matrix BEGIN
		  var sinX = Math.sin(this.object3DExternal.rotation.x);
		  var cosX = Math.cos(this.object3DExternal.rotation.x)
		  var rotationMatrixX = [
			[1,0,0],
			[0,cosX,-sinX],
			[0,sinX,cosX]
		  ];
		  var sinY = Math.sin(this.object3DExternal.rotation.y);
		  var cosY = Math.cos(this.object3DExternal.rotation.y)	
		  var rotationMatrixY = [
			[cosY,0,sinY],
			[0,1,0],
			[-sinY,0,cosY]
		  ];
		  var sinZ = Math.sin(this.object3DExternal.rotation.z);
		  var cosZ = Math.cos(this.object3DExternal.rotation.z)	
		  var rotationMatrixZ = [
			[cosZ,-sinZ,0],
			[sinZ,cosZ,0],
			[0,0,1],
		  ];
		  var rotationMatrixXY = utils.matrixMultiply(rotationMatrixX,rotationMatrixY);
		  var rotationMatrixXYZ = utils.matrixMultiply(rotationMatrixXY,rotationMatrixZ);
		  
						//	https://www.euclideanspace.com/maths/algebra/matrix/orthogonal/rotation/index.htm
		  //get rotation matrix END
		var negativeElemCounter = 0;
		
		for(var unitCounter = 0; unitCounter < count; unitCounter++){
			//if(this.length > 0) 
			if(true)
			{
			  var CountingUnit = this.pop();
			  
			  
			  
			  if(CountingUnit == null){
				  var CountingUnitParams = (this.CountingUnitParams != null) ? (this.CountingUnitParams) : ( new countingSystem3DModel.CountingUnitParams());
				  CountingUnit = new countingSystem3DModel.CountingUnit(CountingUnitParams);
				  
				  
				  
				  negativeElemCounter++;
				  
				  var negPosition = CountingSetViewFunctions.getElementBlockCordinates(negativeElemCounter);
				  
				  CountingUnit.position[0] = negPosition[0];
				  CountingUnit.position[1] = negPosition[1];
				  CountingUnit.position[2] = negPosition[2];
				  
				  
				  
				  var CountingUnitNegativeParams = new countingSystem3DModel.CountingUnitParams();
				  CountingUnitNegativeParams.isNegative = true;
				  var CountingUnitNegative = new countingSystem3DModel.CountingUnit(CountingUnitNegativeParams);
				  CountingUnitNegative.position[0] = negPosition[0];
				  CountingUnitNegative.position[1] = negPosition[1];
				  CountingUnitNegative.position[2] = negPosition[2];
				  CountingUnitNegative.updateDispPosition();
				  this.addNegativeUnit(CountingUnitNegative);
				  
				  
			  }
			  else{
				  this.object3D.removeChild(CountingUnit.displayUnit);
			  }
			  
			  
			   var cordinatesInExternal3DSystemMatrix = [
				  [CountingUnit.position[0] + this.object3D.position.x],
				  [CountingUnit.position[1] + this.object3D.position.y],
				  [CountingUnit.position[2] + this.object3D.position.z]
			  ];
			  
			  var cordinatesInRotatedExternal3DSystemMatrix = utils.matrixMultiply(rotationMatrixXYZ,cordinatesInExternal3DSystemMatrix);
			  // = cordinatesInExternal3DSystem x rotationMatrice;
			  
			  CountingUnit.position[0] = this.object3DExternal.position.x + cordinatesInRotatedExternal3DSystemMatrix[0][0];
			  CountingUnit.position[1] = this.object3DExternal.position.y + cordinatesInRotatedExternal3DSystemMatrix[1][0];
			  CountingUnit.position[2] = this.object3DExternal.position.z + cordinatesInRotatedExternal3DSystemMatrix[2][0];
			  
			  
			  var positionInMoveObjects = utils.positionInArray(CountingUnit, this.subObjectsToMove);
			  if(positionInMoveObjects != -1){
				  this.subObjectsToMove.splice(positionInMoveObjects,1);
			  }
			  CountingUnit.updateDispPosition();
			  detachedUnits.push(CountingUnit);
			}
		}
		detachedUnits.reverse();
		return detachedUnits;
	}
	appendUnits(newUnits:CountingUnit[]){
		//get rotation matrix BEGIN
		  var sinX = Math.sin(this.object3DExternal.rotation.x);
		  var cosX = Math.cos(this.object3DExternal.rotation.x)
		  var rotationMatrixX = [
			[1,0,0],
			[0,cosX,-sinX],
			[0,sinX,cosX]
		  ];
		  var sinY = Math.sin(this.object3DExternal.rotation.y);
		  var cosY = Math.cos(this.object3DExternal.rotation.y)	
		  var rotationMatrixY = [
			[cosY,0,sinY],
			[0,1,0],
			[-sinY,0,cosY]
		  ];
		  var sinZ = Math.sin(this.object3DExternal.rotation.z);
		  var cosZ = Math.cos(this.object3DExternal.rotation.z)	
		  var rotationMatrixZ = [
			[cosZ,-sinZ,0],
			[sinZ,cosZ,0],
			[0,0,1],
		  ];
		   var rotationMatrixXY = utils.matrixMultiply(rotationMatrixX,rotationMatrixY);
		   var rotationMatrixXYZ = utils.matrixMultiply(rotationMatrixXY,rotationMatrixZ);
						//	https://www.euclideanspace.com/maths/algebra/matrix/orthogonal/rotation/index.htm
		  var invRotationMatrixXYZ = utils.matrix_invert(rotationMatrixXYZ);
		  //get rotation matrix END
		
		
		for(var unitCounter = 0; unitCounter < newUnits.length; unitCounter++){
			var CountingUnit = newUnits[unitCounter];
			
			var cordinatesInExternal3DSystemMatrix = [
				  [CountingUnit.position[0] - this.object3DExternal.position.x],
				  [CountingUnit.position[1] - this.object3DExternal.position.y],
				  [CountingUnit.position[2] - this.object3DExternal.position.z]
			  ];
			
			var cordinatesInRotatedExternal3DSystemMatrix = utils.matrixMultiply(invRotationMatrixXYZ,cordinatesInExternal3DSystemMatrix);
			
			CountingUnit.position[0] = -this.object3D.position.x + cordinatesInRotatedExternal3DSystemMatrix[0][0];
			CountingUnit.position[1] = -this.object3D.position.y + cordinatesInRotatedExternal3DSystemMatrix[1][0];
			CountingUnit.position[2] = -this.object3D.position.z + cordinatesInRotatedExternal3DSystemMatrix[2][0];
			
			CountingUnit.updateDispPosition();
			if(this.negativeSet.length == 0){
				this.addUnit(CountingUnit);
			}
			else{
				this.cancelNegativeUnit(CountingUnit);
			}
		}
	}
	
	getElementsRotationMatrix():number[][]{
		var sinX = Math.sin(this.object3DExternal.rotation.x);
		var cosX = Math.cos(this.object3DExternal.rotation.x)
		var rotationMatrixX = [
			[1,0,0],
			[0,cosX,-sinX],
			[0,sinX,cosX]
		];
		var sinY = Math.sin(this.object3DExternal.rotation.y);
		var cosY = Math.cos(this.object3DExternal.rotation.y)	
		var rotationMatrixY = [
			[cosY,0,sinY],
			[0,1,0],
			[-sinY,0,cosY]
		];
		var sinZ = Math.sin(this.object3DExternal.rotation.z);
		var cosZ = Math.cos(this.object3DExternal.rotation.z)	
		var rotationMatrixZ = [
			[cosZ,-sinZ,0],
			[sinZ,cosZ,0],
			[0,0,1],
		];
		var rotationMatrixXY = utils.matrixMultiply(rotationMatrixX,rotationMatrixY);
		var rotationMatrixXYZ = utils.matrixMultiply(rotationMatrixXY,rotationMatrixZ);
		return rotationMatrixXYZ;
		//	https://www.euclideanspace.com/maths/algebra/matrix/orthogonal/rotation/index.htm
	}

	getLocalCordinatesInOtherCountingSet(localCordinates:array_of_3,otherSet:CountingSet):array_of_3{
		var cordsInExternal3DSystemMatrix = [
			[localCordinates[0] + this.object3D.position.x],
			[localCordinates[1] + this.object3D.position.y],
			[localCordinates[2] + this.object3D.position.z]
		];
		
		var cordinatesInRotatedExternal3DSystemMatrix =utils.matrixMultiply(this.getElementsRotationMatrix(),cordsInExternal3DSystemMatrix);
		// = cordinatesInExternal3DSystem x rotationMatrice;
		
		var cordInGlobal:array_of_3 = [
			this.object3DExternal.position.x + cordinatesInRotatedExternal3DSystemMatrix[0][0],
			this.object3DExternal.position.y + cordinatesInRotatedExternal3DSystemMatrix[1][0],
			this.object3DExternal.position.z + cordinatesInRotatedExternal3DSystemMatrix[2][0]
		];

		//get rotation matrix BEGIN
		var otherCordsInExternal3DSystemMatrix = [
			[cordInGlobal[0] - otherSet.object3DExternal.position.x],
			[cordInGlobal[1] - otherSet.object3DExternal.position.y],
			[cordInGlobal[2] - otherSet.object3DExternal.position.z]
		];

		var otherRotMatrix = otherSet.getElementsRotationMatrix();
		var otherInvRotationMatrixXYZ = utils.matrix_invert(otherRotMatrix);
		var otherCordsInRotatedExternal3DSystem = utils.matrixMultiply(otherInvRotationMatrixXYZ,otherCordsInExternal3DSystemMatrix);

		var localCordsInOther:array_of_3 = [
			-otherSet.object3D.position.x + otherCordsInRotatedExternal3DSystem[0][0],
			-otherSet.object3D.position.y + otherCordsInRotatedExternal3DSystem[1][0],
			-otherSet.object3D.position.z + otherCordsInRotatedExternal3DSystem[2][0]
		];
		return localCordsInOther;


	}


	transferUnitsWithDelayTo(toCountingSet:CountingSet,transferableCount:number){
		var allTransferableUnits:CountingUnit[];
		if(this.length >= transferableCount){
			allTransferableUnits = utils.popMultiple(this,transferableCount);
		}
		else{
			var negativeElemCounter = 0;
			allTransferableUnits = utils.popMultiple(this,this.length);
			while(allTransferableUnits.length < transferableCount){
				negativeElemCounter++;
				var newCountingUnit = new countingSystem3DModel.CountingUnit(this.CountingUnitParams);
				newCountingUnit.position = CountingSetViewFunctions.getElementBlockCordinates(negativeElemCounter);
				newCountingUnit.pairedUnit = new countingSystem3DModel.CountingUnit();
				allTransferableUnits.push(newCountingUnit);
			}
		}
		allTransferableUnits.reverse();
		for(var unitCounter = 0; unitCounter < allTransferableUnits.length; unitCounter++){
			var transferableUnit = allTransferableUnits[unitCounter];
			var positionInMoveObjects = utils.positionInArray(transferableUnit, this.subObjectsToMove);
		  if(positionInMoveObjects != -1){
				this.subObjectsToMove.splice(positionInMoveObjects,1);
		  }



			transferableUnit.onFirstMoveFunction = (transferableUnitCU)=>{
				//matrix transform cordinates
				if(transferableUnitCU.pairedUnit == null){
					transferableUnitCU.position = this.getLocalCordinatesInOtherCountingSet(transferableUnitCU.position,toCountingSet);
					this.object3D.removeChild(transferableUnitCU.displayUnit);
					toCountingSet.object3D.add(transferableUnitCU.displayUnit);
				}
				else{
					alert('negative delay not implemented yet');
					throw 'negative delay not implemented yet';
				}

			}
			
			if(toCountingSet.negativeSet.length == 0){
				transferableUnit.parentObjectsToMove = toCountingSet.subObjectsToMove;
				toCountingSet.push(transferableUnit);
			}
			else{
				alert('negative delay not implemented yet');
				throw 'negative delay not implemented yet';
			}
		}
	}


	
	//		https://stackoverflow.com/questions/52318200/change-parent-of-component-and-keep-position
	initMoveToNewPosition(newPositionTarget:array_of_3,delayNumber:number = 0, oldPosition?:array_of_3){		
		
		this.isMoving = true;
		
		if(!this.parentObjectsToMove.includes(this))
			this.parentObjectsToMove.push(this);
		
		this.external3DMovableUnit.initMoveToNewPosition(newPositionTarget,delayNumber,oldPosition);
		
	}
	
	
	setRowView(){
		this.isMoving = true;
		if(!this.parentObjectsToMove.includes(this))
			this.parentObjectsToMove.push(this);
		this.subObjectsToMove.length = 0;
		for(var unitCounter = 0; unitCounter < this.length; unitCounter++){
			this[unitCounter].initMoveToNewPosition([unitCounter,0,0]);
			//this.subObjectsToMove.push(this[unitCounter]);
		}
	}
	
	setBlockView(){
		this.isMoving = true;
		if(!this.parentObjectsToMove.includes(this))
			this.parentObjectsToMove.push(this);
		this.subObjectsToMove.length = 0;
		
		var singles = 0;
		var tenths = 0;
		var hundreds = 0;
		var thousandOffset = 0;
		var tenthThousandOffset = 0;
		var hundredThousandOffset = 0;
		
		var delayNumber = 0;
		if (!this.useAnimation) {
			delayNumber = -1;
		};
		
		for(var unitCounter = 0; unitCounter < this.length; unitCounter++){
			
			var unitAlreadyInPlace = 			
				(this[unitCounter].position[0] == this[unitCounter].positionTarget[0])
				&& (this[unitCounter].position[1] == this[unitCounter].positionTarget[1])
				&& (this[unitCounter].position[2] == this[unitCounter].positionTarget[2])
				&& (this[unitCounter].onFirstMoveFunction == null);
			
			if (this.useDelay && this.useAnimation && !unitAlreadyInPlace) {
				delayNumber++;
			};

			if(!unitAlreadyInPlace)
				this[unitCounter].initMoveToNewPosition([
					singles + thousandOffset*11,
					tenths + tenthThousandOffset*11,
					hundreds + hundredThousandOffset*11
					],delayNumber);
				
			if( singles < 9 ) {
				singles++;
				continue;
			}

			singles = 0;
			if (tenths < 9) {
				tenths++;
				continue;
			}

			tenths = 0;
			if (hundreds < 9){
				hundreds++;
				continue;
			}

			hundreds = 0;
			if (thousandOffset < 9) {
				thousandOffset++;
				continue;
			}

			thousandOffset = 0;
			if (tenthThousandOffset < 9) {
				tenthThousandOffset++;
				continue;
			}

			tenthThousandOffset = 0;
			if (hundredThousandOffset < 9) {
				hundredThousandOffset++;
			}

		}
	}
	
	moveAway(count:number){
		this.isMoving = true;
		if(!this.parentObjectsToMove.includes(this))
			this.parentObjectsToMove.push(this);
		
		var delayNumber = 0;
		for(var unitCounter = 0; unitCounter < count; unitCounter++){
			//if(this.length > 0) 
			if(true)
			{//negative numbers will be as 'holes' (dark balls) and them must be processed in special way
				
				if (this.useDelay) {
					delayNumber++;
				};
				if (!this.useAnimation) {
					delayNumber = -1;
				};
				
				  var CountingUnit = this.pop();
				  if(CountingUnit == null){
					  var CountingUnitParams = (this.CountingUnitParams != null) ? (this.CountingUnitParams) : ( new countingSystem3DModel.CountingUnitParams());
					  CountingUnit = new countingSystem3DModel.CountingUnit(CountingUnitParams);
					  
					  var CountingUnitNegativeParams = new countingSystem3DModel.CountingUnitParams();
					  CountingUnitNegativeParams.isNegative = true;
					  var CountingUnitNegative = new countingSystem3DModel.CountingUnit(CountingUnitNegativeParams);
					  this.addNegativeUnit(CountingUnitNegative);
					  
					  
				  }
				  CountingUnit.parentObjectsToMove = this.subObjectsToMoveAway;

				  CountingUnit.initMoveToNewPosition(this.terminationPoint,delayNumber)
				  
			}
		}
	}
	
	move(){
		if (this.framesToDelay > 0){
			this.framesToDelay--;
			return;
		}
		
		var actionCounter = this.subObjectsToMove.length;
		while(actionCounter--){
			this.subObjectsToMove[actionCounter].move();
			if(!this.subObjectsToMove[actionCounter].isMoving){
				this.subObjectsToMove.splice(actionCounter,1);
			}
		}
		
		var moveAwayActionCounter = this.subObjectsToMoveAway.length;
		while(moveAwayActionCounter--){
			this.subObjectsToMoveAway[moveAwayActionCounter].move();
			if(!this.subObjectsToMoveAway[moveAwayActionCounter].isMoving){
				
				this.subObjectsToMoveAway[moveAwayActionCounter].displayUnit.removeAndDispose();
				
				this.subObjectsToMoveAway.splice(moveAwayActionCounter,1);
			}
		}

		var pairedNegativesCounter = this.pairedNegatives.length;
		while(pairedNegativesCounter--){
			let unitPair = this.pairedNegatives[pairedNegativesCounter];
			unitPair.move();
			if((!unitPair.isMoving)&&(!unitPair.pairedUnit.isMoving)){
				unitPair.displayUnit.removeAndDispose();
				unitPair.pairedUnit.displayUnit.removeAndDispose();
				this.pairedNegatives.splice(pairedNegativesCounter,1);
				this.pairedPositives.splice(utils.positionInArray(unitPair.pairedUnit,this.pairedPositives),1);
			}
		}
		
		var pairedPositiveCounter = this.pairedPositives.length;
		while(pairedPositiveCounter--){
			let unitPair = this.pairedPositives[pairedPositiveCounter];
			unitPair.move();
			if((!unitPair.isMoving)&&(!unitPair.pairedUnit.isMoving)){
				unitPair.displayUnit.removeAndDispose();
				unitPair.pairedUnit.displayUnit.removeAndDispose();
				this.pairedPositives.splice(pairedPositiveCounter,1);
				this.pairedNegatives.splice(utils.positionInArray(unitPair.pairedUnit,this.pairedNegatives),1);
			}
		}
		
		if((this.subObjectsToMove.length + this.subObjectsToMoveAway.length) == 0){
			this.isMoving = false;
		}
	}
	
	adjustBlockCenter(referenceCount?:number){
		var elementCount = referenceCount ? referenceCount : this.length;
		this.isMoving = true;
		if(!this.parentObjectsToMove.includes(this))
			this.parentObjectsToMove.push(this);
		
		var centerX = 0;
		var centerY = 0;
		var centerZ = 0;
		
		if (elementCount < 10) {
			centerX = -Math.round(100*elementCount/2)/100;
			centerY = 0;
			centerZ = 0;
			this.internal3DMovableUnit.initMoveToNewPosition([centerX,centerY,centerZ]);
			return;
		}

		if (elementCount < 100) {
			centerX = -5;
			centerY = -Math.round(100*elementCount/20)/100;
			centerZ = 0;
			this.internal3DMovableUnit.initMoveToNewPosition([centerX,centerY,centerZ]);
			return;
		}

		if (elementCount < 1001) {
			centerX = -5;
			centerY = -5;
			centerZ = -Math.round(100*elementCount/200)/100;
			this.internal3DMovableUnit.initMoveToNewPosition([centerX,centerY,centerZ]);
			return;
		}
		
		this.internal3DMovableUnit.initMoveToNewPosition([-5,-5,-5]);
	}
	
	adjustBlockCenterGridView(x:number,y:number){
		this.isMoving = true;
		if(!this.parentObjectsToMove.includes(this))
			this.parentObjectsToMove.push(this);
		
		var centerX = -Math.round(100*x/2)/100;
		var centerY = -Math.round(100*y*1.5/2)/100;
		var centerZ = 0;
		
		
		this.internal3DMovableUnit.initMoveToNewPosition([centerX,centerY,centerZ]);
	}
	
	createGridViewBars(x:number,y:number,columUnitHeigthInput?:number){
		
		while(this.gridUnits.length > 0){
			var gridUnit = this.gridUnits.pop();
			if(gridUnit)
				gridUnit.removeAndDispose();
		}
		
		var thickness = 0.08;
		var columUnitHeigth = 1.5;
		if(columUnitHeigthInput){
			columUnitHeigth = columUnitHeigthInput;
		}
		for(var unitCounter = 1; unitCounter < y; unitCounter++){
			var bar = inputOutputManager.getInstance().box(x,thickness,thickness);
			bar.position.x = x/2-0.5;
			bar.position.y = unitCounter*columUnitHeigth-columUnitHeigth/2;
			this.object3D.add(bar);
			this.gridUnits.push(bar);
		}
	}


	createGridViewBarsWithPerson(x:number,y:number,columUnitHeigthInput?:number){
		
		while(this.gridUnits.length > 0){
			var gridUnit = this.gridUnits.pop();
			if(gridUnit)
				gridUnit.removeAndDispose();
		}
		
		var thickness = 0.08;
		var columUnitHeigth = 1.5;
		if(columUnitHeigthInput){
			columUnitHeigth = columUnitHeigthInput;
		}
		for(var unitCounter = 1; unitCounter < y; unitCounter++){
			var bar = inputOutputManager.getInstance().box(x,thickness,thickness);
			bar.position.x = x/2-0.5;
			bar.position.y = unitCounter*columUnitHeigth-columUnitHeigth/2;
			this.object3D.add(bar);
			this.gridUnits.push(bar);
		}
		for(var unitCounter = 0; unitCounter < y; unitCounter++){
			var man = inputOutputManager.getInstance().man([0,0,0]);
			man.position.x = x;
			man.position.y = unitCounter*columUnitHeigth-columUnitHeigth/2;
			var scaleFactor = columUnitHeigth/2.7;

			man.scale.set( scaleFactor, scaleFactor, scaleFactor);
			this.object3D.add(man);
			this.gridUnits.push(man);
		}
	}


		updateEquitationDisplayDiv(){
			inputOutputManager.getInstance().updateEquitationDisplay({resault:this.length});
	}

}


export abstract class AritmeticModel {

	object3D:IGraphicObject = inputOutputManager.getInstance().getNew3DObject();
	subObjectsToMove:IMoveableUnit[] = [];
	parentObjectsToMove:IMoveableSystem[] = AnimationManager.getInstance().objectsToMove;

	SetForNum1: CountingSet = new CountingSet();
	SetForNum2: CountingSet|null;
	SetForResault: CountingSet = new CountingSet();
	allSets:CountingSet[];

	isMoving:boolean = false;
	speakEquationAfterSet:boolean = false;
	equationSpoken:boolean = false;

	loopFramesToDelay:number = 120;
	framesToDelay:number = 0;

	_num1:number = 0;
	_num2:number = 0;
	resault:number = 0;
	remainder:number = 0;
	
	operationDisplaySign:string = "";

	actualFramesToDelayAfter: number = 0;


	abstract updateModelNumbers():void;
	abstract moveSetsForward():void;
	abstract moveSetsBackward():void;
	moveStageFunctions: (()=> void)[] = [];

	_loopMovement: boolean = true;
	_rotateAllways: boolean = false;


	constructor(no2ndSet?:boolean){
		if(no2ndSet){
			this.SetForNum2 = null;
			this.allSets = [this.SetForNum1,this.SetForResault];
		}
		else{
			this.SetForNum2 = new CountingSet();
			this.SetForNum2.parentObjectsToMove = this.subObjectsToMove;
			this.object3D.add(this.SetForNum2.object3DExternal);
			this.SetForNum2.object3DExternal.position.x = 0;
			this.SetForNum2.displayView = this.SetForNum2.setBlockView;

			this.allSets = [this.SetForNum1,this.SetForNum2,this.SetForResault];
		}

		this.SetForNum1.parentObjectsToMove = this.subObjectsToMove;
		this.object3D.add(this.SetForNum1.object3DExternal);
		this.SetForNum1.object3DExternal.position.x = -12;
		this.SetForNum1.displayView = this.SetForNum1.setBlockView;

		this.SetForResault.parentObjectsToMove = this.subObjectsToMove;	
		this.object3D.add(this.SetForResault.object3DExternal)
		this.SetForResault.object3DExternal.position.x = 12;
		this.SetForResault.displayView = this.SetForResault.setBlockView;

	}
	get num1(){
		return this._num1;
	}
	set num1(newVal){
		this._num1 = newVal;
		this.isMoving = true;
		if(!this.parentObjectsToMove.includes(this))
			this.parentObjectsToMove.push(this);

		this.updateModelNumbers();

		this.updateEquitationDisplayDiv();
		if(this.speakEquationAfterSet)
			this.equationSpoken = false;
	}
	get num2(){
		return this._num2;
	}
	set num2(newVal){
		this._num2 = newVal;
		this.isMoving = true;
		if(!this.parentObjectsToMove.includes(this))
			this.parentObjectsToMove.push(this);

		this.updateModelNumbers();

		this.updateEquitationDisplayDiv();
		if(this.speakEquationAfterSet)
			this.equationSpoken = false;
	}
	setNum1(newVal:number){
		this.num1 = newVal;
	}
	setNum2(newVal:number){
		this.num2 = newVal;
	}

	set loopMovement(newVal:boolean){
		this._loopMovement = newVal;
		if(this._loopMovement && !this.isMoving){
			this.isMoving = true;
			if(!this.parentObjectsToMove.includes(this))
				this.parentObjectsToMove.push(this);
			this.move();
		}
	}

	set rotateAllways(newVal:boolean){
		this._rotateAllways = newVal;
		if(this._rotateAllways && !this.isMoving){
			this.isMoving = true;
			if(!this.parentObjectsToMove.includes(this))
				this.parentObjectsToMove.push(this);
			this.move();
		}
	}

	move(){

		if(this._rotateAllways){
			this.SetForResault.object3DExternal.rotation.y -= 0.005;
			if(this.SetForResault.object3DExternal.rotation.y >= 2*Math.PI){
				this.SetForResault.object3DExternal.rotation.y = 0;
			}
			this.SetForNum1.object3DExternal.rotation.y -= 0.005;
			if(this.SetForNum1.object3DExternal.rotation.y >= 2*Math.PI){
				this.SetForNum1.object3DExternal.rotation.y = 0;
			}
			if(this.SetForNum2){
					this.SetForNum2.object3DExternal.rotation.y -= 0.005;
					if(this.SetForNum2.object3DExternal.rotation.y >= 2*Math.PI){
						this.SetForNum2.object3DExternal.rotation.y = 0;
					}
			}
		}


		if (this.framesToDelay > 0){
			this.framesToDelay--;
			return;
		}

		var actionCounter = this.subObjectsToMove.length;
		while(actionCounter--){
			this.subObjectsToMove[actionCounter].move();
			if(!this.subObjectsToMove[actionCounter].isMoving){
				this.subObjectsToMove.splice(actionCounter,1);
				this.actualFramesToDelayAfter = this.loopFramesToDelay;
			}
		}
		
		
		
		if(this.subObjectsToMove.length == 0) {

			
			if (this.actualFramesToDelayAfter > 0){
				this.actualFramesToDelayAfter--;
				return;
			}	
				
			if (typeof MouseMoveCatcher !== 'undefined'){
				if(MouseMoveCatcher.mouseDown){
					return;
				}
			}

			if(this.moveStageFunctions.length > 0){
				//@ts-ignore
				this.moveStageFunctions.pop()();
				return;
			}

		

			if(this._loopMovement) {
				if(this.SetForResault.length == 0){
					this.moveSetsForward();
				}
				else
					this.moveSetsBackward();

			}
			if(!this._rotateAllways && !this._loopMovement)
			 	this.isMoving = false;
		}
	}
	
	updateEquitationDisplayDiv(){
		var inactiveFields = (this.SetForResault.length == 0) ? ["resault"] : ["number1","number2","operationSign"];

		inputOutputManager.getInstance().equitationDisplay?.updateEquitationDisplay({
			number1:this._num1,
			number2:this._num2,
			resault:this.resault,
			remainder:this.remainder,
			operationSign:this.operationDisplaySign,
			inactiveFields:inactiveFields
		});

	}


	createOptionControls(){

		var that = this;
		var optionsButtonProperties:tOptionsDisplayParams[] = [
			{
				name:"loopMovement",
				innerHTML:"&#8644;",
				onclickFn:()=>{
					if(this._loopMovement)
						this.loopMovement = false
					else
						this.loopMovement = true;
				},
				context:that
			},
			{
				name:"rotate",
				innerHTML:"&#10227;",
				onclickFn:()=>{
					if(this._rotateAllways)
						this.rotateAllways = false
					else
						this.rotateAllways = true;
				},
				context:that
			},
			{
				name:"moveForward",
				innerHTML:"&#8649;",
				onclickFn:()=>{
					this.moveSetsForward();

					this.isMoving = true;
					if(!this.parentObjectsToMove.includes(this))
						this.parentObjectsToMove.push(this);
				},
				context:that
			},
			{
				name:"moveBackward",
				innerHTML:"&#8647;",
				onclickFn:()=>{
					this.moveSetsBackward();
					
					this.isMoving = true;
					if(!this.parentObjectsToMove.includes(this))
						this.parentObjectsToMove.push(this);
				},
				context:that
			}
		];

		inputOutputManager.getInstance().optionsDisplay?.initOptionsDisplay(optionsButtonProperties);
		inputOutputManager.getInstance().optionsDisplay?.addChangeModelSelect(that);
}


  changeObject3D(objectName:string){
		var objectInfoByName = inputOutputManager.getInstance().available3DObjects.filter(	(object3DInfo) => object3DInfo.name == objectName	)
		var selectedObjectInfo:IObject3DInfo = objectInfoByName[0];
		if(typeof selectedObjectInfo == 'undefined'){
			console.warn(objectName + " is not found in AllObjects3DInfo (from AritmeticModel)");
			return;
		}
		
		if (typeof(Storage) !== "undefined") {
			localStorage.setItem("ShowMeMath-objectName", objectName);
			
		}

		selectedObjectInfo.getCreateFunction().then(
			(createFunction:()=>IGraphicObject) => {
				this.allSets.forEach(
					(cSet)=>{
						cSet.CountingUnitParams.creationFunction = createFunction;
						inputOutputManager.getInstance().lastUsedCountingObject = createFunction;
						let unitsInSet = cSet.length;
						cSet.setNumber(0);
						cSet.setNumber(unitsInSet);

					}
				)
			}
		);
	}

	
}

export class AddingModel extends AritmeticModel{

	//@ts-ignore
	SetForNum2: CountingSet;
	constructor(){
		super(false);
		this.operationDisplaySign = "+";
		this.SetForResault.displayView = CountingSetViewFunctions.setBlockViewByDecimals;
	}


	updateModelNumbers(): void {
		this.resault = this._num1 + this._num2;
		

		if(this.SetForResault.length == 0){
			this.SetForNum1.setNumber(this.num1);
			this.SetForNum2.setNumber(this.num2);
		}
		else{
			this.SetForResault.setNumber(this.num1 + this.num2);
		}
		
		this.SetForNum1.adjustBlockCenter(this._num1);
		this.SetForNum2.adjustBlockCenter(this._num2);
		this.SetForResault.adjustBlockCenter(this._num1 + this._num2);
	}
	moveSetsForward(): void {
		this.SetForNum1.transferUnitsWithDelayTo(this.SetForResault,this.SetForNum1.length);
		this.SetForNum2.transferUnitsWithDelayTo(this.SetForResault,this.SetForNum2.length);

		this.SetForResault.displayView();

		this.isMoving = true;
		if(!this.parentObjectsToMove.includes(this))
			this.parentObjectsToMove.push(this);
	}
	moveSetsBackward(): void {

		this.SetForResault.transferUnitsWithDelayTo(this.SetForNum1,this._num1-this.SetForNum1.length);
		this.SetForResault.transferUnitsWithDelayTo(this.SetForNum2,this._num2-this.SetForNum2.length);
		this.SetForNum1.displayView();
		this.SetForNum2.displayView();

		this.isMoving = true;
		if(!this.parentObjectsToMove.includes(this))
			this.parentObjectsToMove.push(this);
	}
	
}

export class SubtractionModel extends AritmeticModel{
		//@ts-ignore
		SetForNum2: CountingSet;
		constructor(){
			super(false);
			this.operationDisplaySign = "-";
			this.SetForResault.displayView = CountingSetViewFunctions.setBlockViewByDecimals;
		}

	updateModelNumbers(): void {
		this.resault = this._num1 - this._num2;
		if(this.SetForNum2.length == 0){
			this.SetForNum1.setNumber(this._num1);
		}
		else{
			this.moveSetsBackward();
			this.SetForNum1.setNumber(this._num1);
			this.moveSetsForward();
		 }
				
		this.SetForNum1.adjustBlockCenter(this._num1+this._num2);
		this.SetForNum2.adjustBlockCenter(this._num2);
	}
	moveSetsForward(): void {
		var subtractedUnits = this.SetForNum1.detachUnits(this._num2);
		this.SetForNum2.appendUnits(subtractedUnits);
		this.SetForNum2.displayView();
		var tempNum:number = 1;
		this.SetForResault.push(tempNum);//temp workaround because if resault Set is empty we do not move backwards

		this.isMoving = true;
		if(!this.parentObjectsToMove.includes(this))
			this.parentObjectsToMove.push(this);
	}
	moveSetsBackward(): void {
		var subtractedUnits = this.SetForNum2.detachUnits(this.SetForNum2.length);
		this.SetForNum1.appendUnits(subtractedUnits);
		this.SetForNum1.displayView();
		var tempNum:number = 1;
		this.SetForResault.length=0;//temp workaround because if resault Set is empty we do not move backwards

		this.isMoving = true;
		if(!this.parentObjectsToMove.includes(this))
			this.parentObjectsToMove.push(this);
	}

}

export class MultiplyModel extends AritmeticModel {

	constructor(){
		super(true);
		this.operationDisplaySign = "*";
		this.SetForNum1.displayView = CountingSetViewFunctions.setGridViewByRows;
	}
	updateModelNumbers(): void {
		this.resault = this._num1*this._num2;
		this.SetForNum1.displayDimensions = [this._num2,this._num1,0];		// must get rid of this 
		this.SetForNum1.elementsForSubstructure = this._num2;
		this.SetForNum1.substructureCount = this._num1;
		if(this.SetForResault.length == 0){
			this.SetForNum1.setNumber(this.resault);
		}
		else{
			this.SetForResault.setNumber(this.resault);
		}
		
		this.SetForResault.adjustBlockCenter(this.resault);
		this.SetForNum1.adjustBlockCenterGridView(this._num2,this._num1);
		this.SetForNum1.createGridViewBars(this._num2,this._num1);
		
		
		var zDistance = 0;
		
		if((this._num2>10)||(this._num1>10)){
			zDistance = -Math.round(100*(this._num1*1.5+this._num2)/2)/100;
		}
		this.SetForNum1.initMoveToNewPosition([
			this.SetForNum1.object3DExternal.position.x,
			this.SetForNum1.object3DExternal.position.y,
			zDistance
		]);
	}
	moveSetsForward(): void {

		this.SetForNum1.transferUnitsWithDelayTo(this.SetForResault,this.SetForNum1.length);


		this.SetForResault.displayView();

		this.isMoving = true;
		if(!this.parentObjectsToMove.includes(this))
			this.parentObjectsToMove.push(this);
	}
	moveSetsBackward(): void {
		this.SetForResault.transferUnitsWithDelayTo(this.SetForNum1,this.SetForResault.length);

		this.SetForNum1.displayView(this._num1,this._num2);

		this.isMoving = true;
		if(!this.parentObjectsToMove.includes(this))
			this.parentObjectsToMove.push(this);
	}
}

export class DivisionModel extends AritmeticModel {
	
	constructor(){
		super(true);
		this.num2 = 1;
		this.operationDisplaySign = "/";
		this.SetForResault.displayView = CountingSetViewFunctions.setDivisionView;
	}

	updateModelNumbers(){
		if(this._num2 == 0){
			console.warn('atempt to divide by 0');
			return;
		}
		this.resault = Math.floor( this._num1/this._num2);
		this.remainder = this._num1 % this._num2;

		this.SetForResault.elementsForSubstructure = this.resault;
		this.SetForResault.substructureCount = this._num2;
		
		if(this.SetForResault.length == 0){
			this.SetForNum1.setNumber(this._num1);
		}
		else{
			this.SetForResault.setNumber(this._num1);
			var tmp = this.SetForResault.displayView();
		}


		
		this.SetForNum1.adjustBlockCenter(this._num1);
		this.SetForResault.adjustBlockCenter(this._num1);
		try{
			this.SetForResault.createGridViewBarsWithPerson(Math.min(this.resault,10),this.num2,
				1.5+ Math.min(10,Math.floor(this.resault/10)) );
		}
		catch(err){
			
		}

		this.SetForResault.adjustBlockCenterGridView(Math.min(this.resault,10),this._num2);

		var zDistance = 0;
		
		if(this._num2>2){
			zDistance = -Math.round(100*(1.5+Math.max( this._num1,this._num2))/3)/100;
		}
		this.SetForResault.initMoveToNewPosition([
			this.SetForResault.object3DExternal.position.x,
			this.SetForResault.object3DExternal.position.y,
			zDistance
		]);

	}
	
	moveSetsForward(): void {
		this.isMoving = true;
		if(!this.parentObjectsToMove.includes(this))
			this.parentObjectsToMove.push(this);


		this.SetForNum1.transferUnitsWithDelayTo(this.SetForResault,this.SetForNum1.length);

		this.SetForResault.displayView(this.SetForResault);
		
		this.updateEquitationDisplayDiv();
		this.isMoving = true;
		if(!this.parentObjectsToMove.includes(this))
			this.parentObjectsToMove.push(this);
	}
	moveSetsBackward(): void {
		this.isMoving = true;
		if(!this.parentObjectsToMove.includes(this))
			this.parentObjectsToMove.push(this);
		
		this.SetForResault.transferUnitsWithDelayTo(this.SetForNum1,this.SetForResault.length);
		this.SetForNum1.displayView(this);
		
		this.updateEquitationDisplayDiv();

		this.isMoving = true;
		if(!this.parentObjectsToMove.includes(this))
			this.parentObjectsToMove.push(this);
	}

}


var CountingSetViewFunctions:any = {};
CountingSetViewFunctions.setBlockViewByDecimalsFromUpside = function():void{
	this.isMoving = true;
	if(!this.parentObjectsToMove.includes(this))
		this.parentObjectsToMove.push(this);
	this.subObjectsToMove.length = 0;
	
	var delayAmount = 80;
	var singles = 0;
	var tenths = 0;
	var hundreds = 0;
	var thousandOffset = 0;
	var tenthThousandOffset = 0;
	var hundredThousandOffset = 0;
	
	var delayNumber = 0;
	
	for(var unitCounter = 0; unitCounter < this.length; unitCounter++){
		
		var unitAlreadyInPlace =
			(this[unitCounter].position[0] == this[unitCounter].positionTarget[0])
			&& (this[unitCounter].position[1] == this[unitCounter].positionTarget[1])
			&& (this[unitCounter].position[2] == this[unitCounter].positionTarget[2])
			&& (this[unitCounter].onFirstMoveFunction == null);
		

		if(!unitAlreadyInPlace) {
			this[unitCounter].initMoveToNewPosition([
					singles + thousandOffset,
					tenths + tenthThousandOffset,
					hundreds + hundredThousandOffset
				], delayNumber, [
					singles + thousandOffset,
					tenths + tenthThousandOffset + 15,
					hundreds + hundredThousandOffset
				]
			);
		}
		
		var unitsLeft = this.length - unitCounter;
		var singlesLeft = 10 - singles;
		
		if (
			!unitAlreadyInPlace && (
				(unitsLeft <= (9 - singles))
				||
				((unitsLeft <= (9 - tenths)*10) && ( singles == 9 )   )
				||
				((unitsLeft <= (9 - hundreds)*100) && ( singles == 9 )  && ( tenths == 9 )    )
				
				
			)
			
		) {
			delayNumber = delayNumber + delayAmount;
		};
		
		if( singles < 9 ) {
			singles++;
			continue;
		}

		singles = 0;
		
		if (tenths < 9) {
			tenths++;
			continue;
		}

		tenths = 0;
		if (hundreds < 9){
			hundreds++;
			continue;
		}

		hundreds = 0;
		if (thousandOffset < 9) {
			thousandOffset++;
			continue;
		}

		thousandOffset = 0;
		if (tenthThousandOffset < 9) {
			tenthThousandOffset++;
			continue;
		}

		tenthThousandOffset = 0;
		if (hundredThousandOffset < 9) {
			hundredThousandOffset++;
		}
	}
}


CountingSetViewFunctions.setBlockViewByDecimals = function(countingSetInput?:CountingSet):void{
	if(!countingSetInput)
		countingSetInput = this;
	var countingSet = <CountingSet> countingSetInput;
	
	countingSet.isMoving = true;
	if(!countingSet.parentObjectsToMove.includes(countingSet))
	countingSet.parentObjectsToMove.push(countingSet);
	countingSet.subObjectsToMove.length = 0;
	
	var initiaLDelayAmount = 100;
	var delayAmount = 100;
	var singles = 0;
	var tenths = 0;
	var hundreds = 0;
	var thousandOffset = 0;
	var tenthThousandOffset = 0;
	var hundredThousandOffset = 0;
		
	var delayNumber = 0;
	
	for(var unitCounter = 0; unitCounter < countingSet.length; unitCounter++){

		var unitTargetPoistion:array_of_3 = [
			singles + thousandOffset,
			tenths + tenthThousandOffset,
			hundreds + hundredThousandOffset
		];

		var currentUnit:CountingUnit = countingSet[unitCounter];

		var unitAlreadyInPlace =
			(currentUnit.position[0] == unitTargetPoistion[0])
			&& (currentUnit.position[1] == unitTargetPoistion[1])
			&& (currentUnit.position[2] == unitTargetPoistion[2])
			&& (this[unitCounter].onFirstMoveFunction == null);


		if(!unitAlreadyInPlace) {
			if(currentUnit.isNew){
				currentUnit.initMoveToNewPosition(unitTargetPoistion, delayNumber, [
					unitTargetPoistion[0],
					unitTargetPoistion[1] + 15,
					unitTargetPoistion[2]
					]
				);
			}
			else {
				currentUnit.initMoveToNewPosition(unitTargetPoistion, delayNumber);
			}
		}
		
		var unitsLeft = countingSet.length - unitCounter;
		var singlesLeft = 10 - singles;
				
		if (
			!unitAlreadyInPlace && (
				(unitsLeft <= (9 - singles))
				||
				((unitsLeft <= (9 - tenths)*10) && ( singles == 9 )   )
				||
				((unitsLeft <= (9 - hundreds)*100) && ( singles == 9 )  && ( tenths == 9 )    )
				
				
			)
			
		) {
			delayNumber = delayNumber + delayAmount;
			delayAmount = Math.max(20, Math.floor(delayAmount/1.05));
		};
		
		if( singles < 9 ) {
			singles++;
			continue;
		}

		singles = 0;
		
		if (tenths < 9) {
			tenths++;
			continue;
		}

		tenths = 0;
		if (hundreds < 9){
			hundreds++;
			continue;
		}

		hundreds = 0;
		if (thousandOffset < 9) {
			thousandOffset++;
			continue;
		}

		thousandOffset = 0;
		if (tenthThousandOffset < 9) {
			tenthThousandOffset++;
			continue;
		}

		tenthThousandOffset = 0;
		if (hundredThousandOffset < 9) {
			hundredThousandOffset++;
		}
	}
}



CountingSetViewFunctions.getElementBlockCordinates = function(elementNo:number):array_of_3{
	
	var elementPosition:array_of_3 = [0,0,0];
	
	var singles = 0;
	var tenths = 0;
	var hundreds = 0;
	var thousandOffset = 0;
	var tenthThousandOffset = 0;
	var hundredThousandOffset = 0;
	
	for(var unitCounter = 0; unitCounter < elementNo; unitCounter++){
		
		
		elementPosition = [
				singles + thousandOffset,
				tenths + tenthThousandOffset,
				hundreds + hundredThousandOffset
			]

		
		
		var unitsLeft = this.length - unitCounter;
		var singlesLeft = 10 - singles;
		
		
		if( singles < 9 ) {
			singles++;
			continue;
		}

		singles = 0;
		
		if (tenths < 9) {
			tenths++;
			continue;
		}

		tenths = 0;
		if (hundreds < 9){
			hundreds++;
			continue;
		}

		hundreds = 0;
		if (thousandOffset < 9) {
			thousandOffset++;
			continue;
		}

		thousandOffset = 0;
		if (tenthThousandOffset < 9) {
			tenthThousandOffset++;
			continue;
		}

		tenthThousandOffset = 0;
		if (hundredThousandOffset < 9) {
			hundredThousandOffset++;
		}
	}
	return elementPosition;
}

CountingSetViewFunctions.setGridViewByRows = function(rowCount:number,elementsInRow:number,fromStartingPoint:boolean){
	
	if(typeof elementsInRow == 'undefined'){
		elementsInRow = this.displayDimensions[0];
		console.warn("setGridViewByRows() called without parameter elementsInRow");
	}
		if(typeof fromStartingPoint == 'undefined'){
		fromStartingPoint = false;
	}
	
	this.isMoving = true;
	if(!this.parentObjectsToMove.includes(this))
		this.parentObjectsToMove.push(this);
	this.subObjectsToMove.length = 0;
	
	var delayAmount = 30;
	var rowWidth = 1;
	var columUnitHeigth = 1.5;
	
	var rowNo = 0;
	var colNo = 0;
		
	var delayNumber = 0;
	
	for(var unitCounter = 0; unitCounter < this.length; unitCounter++){
		
		var unitAlreadyInPlace =
			(this[unitCounter].position[0] == colNo*rowWidth)
			&& (this[unitCounter].position[1] == rowNo*columUnitHeigth)
			&& (this[unitCounter].position[2] == 0)
			&& (this[unitCounter].onFirstMoveFunction == null);
		
		if(!unitAlreadyInPlace) {
			if(fromStartingPoint){
			
				this[unitCounter].initMoveToNewPosition([
						colNo*rowWidth,
						rowNo*columUnitHeigth,
						0
					], delayNumber, [
						colNo*rowWidth,
						rowNo*columUnitHeigth + 15,
						0
					]
				);
			}
			else{
				this[unitCounter].initMoveToNewPosition([
						colNo*rowWidth,
						rowNo*columUnitHeigth,
						0
					], delayNumber
				);
			}
		}
		
		
		if(colNo < elementsInRow-1){
			colNo++;
			continue;
		}
		
		colNo = 0;
		rowNo++;
		
		delayNumber = delayNumber + delayAmount;
		
	}
}


CountingSetViewFunctions.setDivisionView = function(countingSetInput?:CountingSet):void {
	if(!countingSetInput)
		countingSetInput = this;
	var countingSet = <CountingSet> countingSetInput;

	var fromStartingPoint:boolean = false;

	countingSet.isMoving = true;
	if(!countingSet.parentObjectsToMove.includes(countingSet))
	countingSet.parentObjectsToMove.push(countingSet);
	countingSet.subObjectsToMove.length = 0;
	var initiaLDelayAmount = Math.floor(1900/(10+countingSet.elementsForSubstructure)	);// 90;
	var delayAmount = initiaLDelayAmount;
	var distanceBetweenSubSets:number = 1.5+ Math.min(10,Math.floor(countingSet.elementsForSubstructure/10)); 
	var rowUnitWidth = 1;
	var columUnitHeigth = 1;
	var zIndexWidth = 1.5;
	
	var rowNo = 0;
	var colNo = 0;
	var zIndex = 0;
	var subSetNo = 0;

	var delayNumber = 0;
	countingSet.reverse();

	if(countingSet.elementsForSubstructure==0){
		subSetNo = -2;
		colNo = -1;
	}

	for(var unitCounter = 0; unitCounter < countingSet.length; unitCounter++){
		

		var unitTargetPoistion:array_of_3 = [Math.min(10,countingSet.elementsForSubstructure)-1-colNo*rowUnitWidth,
			rowNo * columUnitHeigth + (subSetNo * distanceBetweenSubSets) - distanceBetweenSubSets/2+0.75,
			zIndex*zIndexWidth
		];

		var unitAlreadyInPlace =
			(countingSet[unitCounter].position[0] == unitTargetPoistion[0])
			&& (countingSet[unitCounter].position[1] == unitTargetPoistion[1])
			&& (countingSet[unitCounter].position[2] == unitTargetPoistion[2])
			&& (this[unitCounter].onFirstMoveFunction == null);
	
		if(!unitAlreadyInPlace) {
			if(fromStartingPoint){
			
				countingSet[unitCounter].initMoveToNewPosition(
					unitTargetPoistion
					, delayNumber, [
						unitTargetPoistion[0],
						unitTargetPoistion[1] + 15,
						unitTargetPoistion[2]
					]
				);
			}
			else{
				countingSet[unitCounter].initMoveToNewPosition(
					unitTargetPoistion
					, delayNumber
				);
			}
		}

		if((subSetNo < countingSet.substructureCount-1)&&(subSetNo>=0)){
			subSetNo++;
			continue;
		}
		if(subSetNo>=0){
			subSetNo = 0;
			delayNumber = delayNumber + delayAmount;
			delayAmount = Math.max(20, Math.floor(delayAmount/1.2));
		}
		if((countingSet.substructureCount >= countingSet.length-unitCounter)&&(subSetNo>=0)){
			subSetNo = -2;
			colNo = -1;
			rowNo = 0;
			zIndex = 0;
			delayAmount = initiaLDelayAmount;
		}

		if(colNo < 9){
			colNo++;
			continue;
		}
		colNo = 0;
		if(rowNo < 9){
			rowNo++;
			continue;
		}
		rowNo = 0;
		zIndex++;	
	}
	countingSet.reverse();	
}

class utils {
	static positionInArray<T>(obj:T, list:T[]):number {
		var i;
		for (i = 0; i < list.length; i++) {
			if (list[i] === obj) {
				return i;
			}
		}
		return -1;
	}
	
	static matrixMultiply(a:number[][], b:number[][]) {
	  var aNumRows = a.length, aNumCols = a[0].length,
		  bNumRows = b.length, bNumCols = b[0].length,
		  m = new Array(aNumRows);  // initialize array of rows
	  for (var r = 0; r < aNumRows; ++r) {
		m[r] = new Array(bNumCols); // initialize the current row
		for (var c = 0; c < bNumCols; ++c) {
		  m[r][c] = 0;             // initialize the current cell
		  for (var i = 0; i < aNumCols; ++i) {
			m[r][c] += a[r][i] * b[i][c];
		  }
		}
	  }
	  return m;
	}

	static popMultiple<T>(originalArr:T[],popCount:number):T[]{
		var returnArray:T[] = [];

		for(var counter=0; counter<popCount; counter++){
			var popedEl = originalArr.pop();
			if(popedEl)
				returnArray.unshift(popedEl)
			else
				console.warn("popMultiple count greater than array length");
		}
		return returnArray;


	}




  static matrix_invert(M:number[][]):number[][]{
  // http://blog.acipo.com/matrix-inversion-in-javascript/
    
    //if the matrix isn't square: exit (error)
    if(M.length !== M[0].length){throw "the matrix isn't square"}
    
    //create the identity matrix (I), and a copy (C) of the original
    var i=0, ii=0, j=0, dim=M.length, e=0, t=0;
    var I:any = [], C:any = [];
    for(i=0; i<dim; i+=1){
        // Create the row
        I[I.length]=[];
        C[C.length]=[];
        for(j=0; j<dim; j+=1){
            
            //if we're on the diagonal, put a 1 (for identity)
            if(i==j){ I[i][j] = 1; }
            else{ I[i][j] = 0; }
            
            // Also, make the copy of the original
            C[i][j] = M[i][j];
        }
    }
    
    // Perform elementary row operations
    for(i=0; i<dim; i+=1){
        // get the element e on the diagonal
        e = C[i][i];
        
        // if we have a 0 on the diagonal (we'll need to swap with a lower row)
        if(e==0){
            //look through every row below the i'th row
            for(ii=i+1; ii<dim; ii+=1){
                //if the ii'th row has a non-0 in the i'th col
                if(C[ii][i] != 0){
                    //it would make the diagonal have a non-0 so swap it
                    for(j=0; j<dim; j++){
                        e = C[i][j];       //temp store i'th row
                        C[i][j] = C[ii][j];//replace i'th row by ii'th
                        C[ii][j] = e;      //repace ii'th by temp
                        e = I[i][j];       //temp store i'th row
                        I[i][j] = I[ii][j];//replace i'th row by ii'th
                        I[ii][j] = e;      //repace ii'th by temp
                    }
                    //don't bother checking other rows since we've swapped
                    break;
                }
            }
            //get the new diagonal
            e = C[i][i];
            //if it's still 0, not invertable (error)
            if(e==0){throw "not invertable"}
        }
        
        // Scale this row down by e (so we have a 1 on the diagonal)
        for(j=0; j<dim; j++){
            C[i][j] = C[i][j]/e; //apply to original matrix
            I[i][j] = I[i][j]/e; //apply to identity
        }
        
        // Subtract this row (scaled appropriately for each row) from ALL of
        // the other rows so that there will be 0's in this column in the
        // rows above and below this one
        for(ii=0; ii<dim; ii++){
            // Only apply to other rows (we want a 1 on the diagonal)
            if(ii==i){continue;}
            
            // We want to change this element to 0
            e = C[ii][i];
            
            // Subtract (the row above(or below) scaled by e) from (the
            // current row) but start at the i'th column and assume all the
            // stuff left of diagonal is 0 (which it should be if we made this
            // algorithm correctly)
            for(j=0; j<dim; j++){
                C[ii][j] -= e*C[i][j]; //apply to original matrix
                I[ii][j] -= e*I[i][j]; //apply to identity
            }
        }
    }
    
    //we've done all operations, C should be the identity
    //matrix I should be the inverse:
    return I;
}








  
	static addCssClass(domElement:Element,className:string){
		if ( !domElement.className.includes(className) )
			domElement.className += " " + className;
	}

	static removeCssClass(domElement:Element,className:string){
		if (domElement.className.includes(className) )
			domElement.className = domElement.className.split(className).join(' ');
	}

}


}
