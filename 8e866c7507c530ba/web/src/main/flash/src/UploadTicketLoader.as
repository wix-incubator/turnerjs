package
{
	import flash.events.Event;
	import flash.events.IOErrorEvent;
	import flash.net.URLLoader;
	import flash.net.URLRequest;

	public class UploadTicketLoader
	{
		private var m_ticketLdr:URLLoader;
		private var m_cb:Function;

		public function UploadTicketLoader(cb:Function)
		{
			m_cb = cb;
			m_ticketLdr = new URLLoader();
			m_ticketLdr.addEventListener(Event.COMPLETE, onTicketLoaded);
			m_ticketLdr.addEventListener(IOErrorEvent.IO_ERROR, onTicketError);
			var req:URLRequest = new URLRequest(UploaderConfig.uploadTicketURL);
			m_ticketLdr.load(req);

		}
		
		private function onTicketLoaded(ev:Event):void
		{
			var resXML:XML = new XML(m_ticketLdr.data);
			var errCode:String = resXML.@errorCode;
			UploaderConfig.uploadTicket = resXML.@responseValue;
			m_cb(errCode); // errCode=='0' when the call was successful
		}
		
		private function onTicketError(ev:IOErrorEvent):void
		{
			
		}
	}
}