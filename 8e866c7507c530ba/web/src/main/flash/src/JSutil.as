package
{
	import flash.external.ExternalInterface;

	public class JSutil
	{
		static private var m_jsCbName:String = "W.UserMedia.flashUpdate";
		
		static public function sendToJS(message:String, content:Object):void
		{
			ExternalInterface.call(m_jsCbName, message, content);
			trace(m_jsCbName+' '+message+' '+content)
		}
		
		static public function trace2JS(msg:String):void
		{
			sendToJS("buttonTrace", msg);
		}
		

	}
}