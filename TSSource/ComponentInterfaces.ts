

interface iModelPageState {
  equitationParams: tEquitationDisplayParams;
  modalVisibleNum1:boolean;
  modalVisibleNum2:boolean;
}
interface iEquitationDisplayProps {
  equitationParams: tEquitationDisplayParams;
  openModal:(modalNo:number)=>void;
}
interface iNumberEditProps {
  previousNum:number;
  onChangeText:(num:string)=>void;
}

interface iNumberEditModalProps {
  previousNum:number;
  onChangeText:(num:string)=>void;
  closeCallback:()=>void;
  modalVisible:boolean;
}


interface iMenuPageProps{
  onMenuBtnClick:(menu:tPageName)=>void;
}

interface iSMMMenuNuttonProps{
  elementTitle: string;
  elementSymbol: string;
  onPress: (menu:tPageName)=>void;
}


type tPageName = "Addition"|"Subtraction"|"Multiplication"|"Division"|"Menu";