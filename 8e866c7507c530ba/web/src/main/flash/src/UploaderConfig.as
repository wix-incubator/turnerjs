package 
{
	public class UploaderConfig
	{
		//serverRoot - taken from flash vars so we can work on staging enviorments
		static private var m_serverRoot:String = 'not set';

		static private var m_uploadTicketURL:String = '/media/tickets/get';
		static private var m_uploadFileURL:String = '/api/add_file';
		static private var m_uploadFinalizeURL:String = '/media/private/add'
		
		static private var m_uploadTicket:String = null;

		static private var m_mediaType:String = 'media';
		static private var m_mediaS:String = 'media';
		static private var m_componentType:String = 'photo';


		static public function init(serverRoot:String):void
		{
			m_serverRoot = serverRoot;
			m_uploadFinalizeURL  = 'http://editor.'+m_serverRoot+m_uploadFinalizeURL;
			m_uploadTicketURL = 'http://editor.'+m_serverRoot+m_uploadTicketURL;
			m_uploadFileURL = 'http://0.static.'+m_serverRoot+m_uploadFileURL;
		}
		
		static public function setFileType(mediaS:String, mediaType:String, componentType:String):void
		{
			m_mediaS = mediaS;
			m_mediaType = mediaType;
			m_componentType = componentType;
		}
		
		static public function get mediaS():String
		{
			return m_mediaS;
		}
		
		static public function get mediaType():String
		{
			return m_mediaType;
		}
		
		static public function get componentType():String
		{
			return m_componentType;
		}
		
		static public function get uploadTicketURL():String
		{
			return m_uploadTicketURL;
		}
		
		static public function get uploadFileURL():String
		{
			return m_uploadFileURL;
		}
		
		static public function get uploadFinalizeURL():String
		{
			return m_uploadFinalizeURL;
		}
		
		static public function set uploadTicket(ticket:String):void
		{
			m_uploadTicket = ticket;
		}
		
		static public function get uploadTicket():String
		{
			return m_uploadTicket;
		}
		
		static public function getGeneralCacheKiller():String
		{
			var dt:Date = new Date();
			var dtOld:Date = new Date(2011, 03, 01);
			return Math.floor((Math.random()*100000)).toString()+(dt.time-dtOld.time).toString()
		}
	}
}