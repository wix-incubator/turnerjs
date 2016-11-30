package
{
	import flash.events.Event;
	import flash.events.IOErrorEvent;
	import flash.net.URLLoader;
	import flash.net.URLRequest;
	import flash.net.URLRequestMethod;

	public class UploadFinalizer
	{
		private var m_itemUploaders:Array;
		private var m_cb:Function;
		private var m_finalizeLdr:URLLoader;
		
		public function UploadFinalizer(uploaders:Array, cb:Function):void
		{
			m_itemUploaders = uploaders;
			m_cb = cb;
			uploadToMediaServerInChunk();
		}
		
		/**
		 * adds a chunk of MediaUploader.CHUNK_SIZE media items to media server
		 */ 
		private function uploadToMediaServerInChunk():void {
			
			var itemLength:int = m_itemUploaders.length;
			if (itemLength <= 0)
			{
				m_cb(true);
				//sendToJS('uploadComplete','');
				return;
			}
			
			var chunkSize:int = Math.min(MediaUploader.CHUNK_SIZE, itemLength);
			var itemsChunk:Array = m_itemUploaders.splice(0, chunkSize);			
			
			var reqXML:XML = <mediaItemList/>;
			for(var i:int=0;i<itemsChunk.length;i++)
			{
				if(itemsChunk[i].finished())
				{
					var mediaNode:XML = itemsChunk[i].toXML();
					if(UploaderConfig.mediaType!='media')
					{
						mediaNode.@mediaType = UploaderConfig.mediaType;
						mediaNode.@componentType = UploaderConfig.componentType;
					}					
					reqXML.appendChild(mediaNode);
				}
			}
			var req:URLRequest = new URLRequest(UploaderConfig.uploadFinalizeURL);
			req.method = URLRequestMethod.POST;
			req.contentType = "text/xml";
			req.data = reqXML.toXMLString();
			m_finalizeLdr = new URLLoader();
			m_finalizeLdr.addEventListener(Event.COMPLETE, onUploadFinalized);
			m_finalizeLdr.addEventListener(IOErrorEvent.IO_ERROR, onFinalizeError);
			m_finalizeLdr.load(req); 
			
			JSutil.trace2JS("sending chunk of: " + chunkSize + " Media items");
		}
		
		private function onUploadFinalized(ev:Event):void
		{
			var isAllItemsUploaded:Boolean = (m_itemUploaders.length == 0)			
			XML.ignoreWhitespace = true;
			var result:XML = new XML(ev.target.data);
			if (result.@success != "true")
			{
				if (result.@errorCode == "-7705")
				{
					m_cb(false, "Max. batch size is 50");
//					sendToJS('Error', "Max. batch size is 50");
				}
				else 
				{
					m_cb(false, "Error finalizing upload");
//					sendToJS('Error',"Error finalizing upload");
				}
			}
			else 
			{
				if(isAllItemsUploaded) 
				{
					m_cb(true, UploaderConfig.mediaType);
//					sendToJS('uploadComplete', UploaderConfig.mediaType ); //return the "wixType" back
				}
				else 
				{
					uploadToMediaServerInChunk(); 
				}
			}
		}
		
		/**
		 * End Upload proccess
		 * start of upload process errors 
		 * */	
		private function onFinalizeError(ev:Event):void
		{
			m_cb(false, "Error finalizing upload");
		}
	}
}