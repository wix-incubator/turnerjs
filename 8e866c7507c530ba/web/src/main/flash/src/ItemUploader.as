package
{
	import flash.events.DataEvent;
	import flash.events.Event;
	import flash.events.EventDispatcher;
	import flash.events.IOErrorEvent;
	import flash.events.ProgressEvent;
	import flash.net.FileReference;
	import flash.net.URLLoader;
	import flash.net.URLRequest;
	import flash.net.URLRequestHeader;
	import flash.net.URLVariables;
	import flash.system.Capabilities;

	public class ItemUploader extends EventDispatcher
	{
		private var m_file:FileReference;
		private var m_progress:int;
		private var m_size:int;
		private var m_fName:String = "";
		private var m_started:Boolean = false;
		private var m_finished:Boolean = false;
		private var m_staticServRes:XML;
		private var m_completeCB:Function;
		private var m_progressCB:Function;
		private var m_errorCB:Function;

		private var m_newFileName:String = '';
		
		public function ItemUploader(fileRef:FileReference,completeCB:Function,progressCB:Function,errorCB:Function)
		{
			m_completeCB = completeCB;
			m_progressCB = progressCB;
			m_errorCB = errorCB;
			
			m_file = fileRef;
			m_size = m_file.size;
			m_fName = m_file.name;
			m_file.addEventListener(DataEvent.UPLOAD_COMPLETE_DATA,onFileUploadComplete);
			m_file.addEventListener(IOErrorEvent.IO_ERROR ,onFileUploadError);
			m_file.addEventListener(ProgressEvent.PROGRESS,onFileUploadProgress);
		}

		public function started():Boolean
		{
			return m_started;			
		}
		
		public function finished():Boolean
		{
			return m_finished;
		}

		public function getProgress():int
		{
			return m_progress
		}
		
		public function getSize():int
		{
			return m_size;
		}
		
		public function getName():String
		{
			return m_fName;
		}
		
		public function upload():void
		{
			/*
			Should be fixed in Mac OS X 10.5.1
			
			if(Capabilities.os.toLowerCase().indexOf("mac")>-1)
			{
				var tmpUrl:String = "http://static."+m_srv+"/lalalala.foo";
				//LoadMgr.loadTxt(tmpUrl, dummyFunct, dummyFunct);
				var ldr:URLLoader = new URLLoader();
				ldr.addEventListener(IOErrorEvent.IO_ERROR,dummyFunct);
				ldr.load(new URLRequest(tmpUrl));
			}*/
			
			var u:String = UploaderConfig.uploadFileURL;
			if(m_fName.toLowerCase().indexOf(".mp3")>-1)
				u = u.replace("0.static.", "0.media.");
			var req:URLRequest = new URLRequest(u+"?ck="+UploaderConfig.getGeneralCacheKiller()+'&');
			var data:URLVariables = new URLVariables();
			data.s = UploaderConfig.mediaS;
			data.ut = UploaderConfig.uploadTicket;
			req.data = data;			
			m_started = true;
			m_file.upload(req);
		}

		public function stop():void
		{
			m_file.cancel();
		}
		
		override public function toString():String
		{
			return '{name:"'+m_file.name+'",size:'+m_size+',loaded:'+m_progress+'}';
		}	
		
		public function toXML():XML
		{
			var xml:XML = new XML('<mediaItem/>');
			xml.@fileName = m_staticServRes.properties.@file_name
			xml.@mediaType="picture";
			xml.@originalFileName = m_staticServRes.sys_meta.@original_file;
			xml.@fileSize = m_size;
			xml.@width = m_staticServRes.sys_meta.@width;
			xml.@height = m_staticServRes.sys_meta.@height;
			xml.@mimeType = m_staticServRes.sys_meta.@mime_type;
			xml.@componentType="photo";
			xml.@version = m_staticServRes.sys_meta.@ver;
			xml.@iconURL = m_staticServRes.sys_meta.@icon_url
			return xml;
		}
		
		private function onFileUploadComplete(ev:DataEvent):void
		{
			m_finished = true;
			var str:String = ev.text;
			var p:int = str.indexOf("<ext ");
			if(p>0)
			{
				var p1:int = str.indexOf('"/>', p+1);
				if(p1>0)
					str = str.substr(0, p) + str.substr(p1+3);
			}
			m_staticServRes = new XML(str);
			if(m_staticServRes.@errorCode!='0')
			{
				m_errorCB(this, ev);
				return;
			}
			
			m_progress = m_size;
			trace('ItemUploader.onFileUploadComplete');
			m_completeCB(this);
		}
		
		private function onFileUploadError(ev:Event):void
		{
			m_finished = true;
			m_errorCB(this, ev);
			trace('ItemUploader.onFileUploadError');
		}
		
		private function onFileUploadProgress(ev:ProgressEvent):void
		{
			m_progress = ev.bytesLoaded
			m_progressCB(this);
		}
		
		private function dummyFunct(ev:Event):void
		{
			
		}				
		
	}
}