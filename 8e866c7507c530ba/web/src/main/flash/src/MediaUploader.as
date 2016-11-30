package
{
	import flash.display.DisplayObject;
	import flash.display.MovieClip;
	import flash.display.Sprite;
	import flash.display.StageScaleMode;
	import flash.events.ErrorEvent;
	import flash.events.Event;
	import flash.events.IOErrorEvent;
	import flash.events.MouseEvent;
	import flash.external.ExternalInterface;
	import flash.net.FileFilter;
	import flash.net.FileReference;
	import flash.net.FileReferenceList;
	import flash.net.URLLoader;
	import flash.net.URLLoaderDataFormat;
	import flash.net.URLRequest;
	import flash.net.URLRequestMethod;
	import flash.net.URLVariables;
	import flash.system.Capabilities;
	import flash.system.Security;
	import flash.text.TextField;
	import flash.text.TextFieldAutoSize;
	import flash.text.TextFormat;
	
	import org.osmf.display.ScaleMode;
	
	[SWF(width="141", height="30")]
	public class MediaUploader extends Sprite
	{
		static public const MAX_PARALLEL_UPLOADS:int = 2;
		
		[Embed(source="MediaUploader_assets.swf", symbol="BG")]
		private var m_bgC:Class;

		private var m_fileRefList:FileReferenceList;
		private var m_fileFilter:FileFilter = new FileFilter("Images", "*.jpg;*.gif;*.png");
		
		private var m_uploading:Boolean = false

		private var m_labelTxt:TextField;
		private var m_itemUploaders:Array = [];
		private var m_itemsWaiting:Array = [];
		private var m_itemsActive:Array = [];

		private var m_finalizer:UploadFinalizer;
		
		/***
		 * process urls
		 * 
		 **/		

		private var m_bg:MovieClip;
		public static var CHUNK_SIZE:Number = 50;
		
		/****
		 * js integration strings
		 * 
		 * 
		 * */
				
		
		public function MediaUploader()
		{
			Security.allowDomain('*');
			JSutil.trace2JS('ver = 1.97');
			stage.scaleMode = StageScaleMode.NO_SCALE;
			
			m_bg = new m_bgC as MovieClip;
			addChild(m_bg);
			m_bg.gotoAndStop(1);
			addEventListener(MouseEvent.MOUSE_OVER, 
				function(ev:MouseEvent):void{
					m_bg.gotoAndStop(5);
				}
			);
			addEventListener(MouseEvent.MOUSE_OUT,
				function(ev:MouseEvent):void{
					if (uploading==false)
					{
						m_bg.gotoAndStop(1);
					}
				}
			);
			UploaderConfig.init(loaderInfo.parameters.serverRoot || 'wix.com');

			//fix the urls by adding the server root:
			m_labelTxt = new TextField();
			
			m_labelTxt.mouseEnabled = false;
			m_labelTxt.textColor = 0x0099ee;
			m_bg.TextPosition.addChild(m_labelTxt);
			
			
			this.useHandCursor = true;
			this.buttonMode = true;
			
			//create the button
			createButton();	
			//open messageFromJS for JS
			ExternalInterface.addCallback('sendToFlash', messageFromJS);
		}
		
		public function set uploading(value:Boolean):void
		{
			m_uploading = value;
			if (m_uploading)
			{
				m_bg.gotoAndStop(5);
			}
			else
			{
				m_bg.gotoAndStop(1);
			}
				
		}
		
		public function get uploading():Boolean
		{
			return m_uploading;
		}
		
		private function openBrowse(ev:Event=null):void
		{
			if(uploading) 
			{
				JSutil.trace2JS("Browser Clicked, Already Uploading, Abort.");
				return;
			}
			uploading = true;
			m_fileRefList = new FileReferenceList();
			m_fileRefList.addEventListener(Event.SELECT,onMediaSelected);
			m_fileRefList.addEventListener(Event.CANCEL,onMediaSelectionCanceled);
			var isOpened:Boolean = m_fileRefList.browse([m_fileFilter]);		
			JSutil.trace2JS("Browse clicked, opened? " + isOpened);
		}
		
		private function onMediaSelected(ev:Event):void
		{
			while(m_itemUploaders.length>0)
				m_itemUploaders.pop();
			var errorArr:Array = [];
			for(var i:int=0;i<m_fileRefList.fileList.length;i++)
			{
				var fileRef:FileReference = m_fileRefList.fileList[i];
				if(isFileNameValid(fileRef.name)==false)
				{
					addError(errorArr, fileRef.name, "InvalidFileName");
				}
				else
				if(fileRef.size>11500000)
				{
					addError(errorArr, fileRef.name, "InvalidFileSize");
				}
				else // File is OK
				{
					m_itemUploaders.push(new ItemUploader(m_fileRefList.fileList[i], onItemUploadSucceeded, progressUpdate, onItemUploadError));
				}
			}
			if(errorArr.length>0)
			{
				JSutil.sendToJS('validationError',errorArr);
			}
			if(m_itemUploaders.length>0)
			{	
				progressUpdate();
				getUploadTicket();
			}
			else
			{
				uploading = false;
			}
		}

		private function addError(errorArr:Array, fName:String, err:String):void
		{
			var o:Object = {};
			o.fileName = fName;
			o.error = err;
			errorArr.push(o);
		}
		
		private function isFileNameValid(fileName:String):Boolean
		{
			if(	fileName.indexOf('&') > -1 || 
				fileName.indexOf("'") > -1 ||
				fileName.indexOf('"') > -1 ||
				fileName.indexOf(';') > -1 ||
				fileName.indexOf('<') > -1 ||
				fileName.indexOf('>') > -1 )
			{
				return false;
			}
			return true;
		}
		
		private function onMediaSelectionCanceled(ev:Event):void
		{
			uploading = false;
		}
		
		private function createButton():void
		{
			var btn:Sprite = new Sprite();
			btn.graphics.beginFill(0x000000,0);
			btn.graphics.drawRect(0,0,100,40);
			btn.graphics.endFill();
			addChild(btn);
			btn.addEventListener(MouseEvent.CLICK,openBrowse)
			btn.useHandCursor = true;
			
			
		}
		
		/****
		 * start upload process
		 */
		private function getUploadTicket():void
		{
			var ticketLdr:UploadTicketLoader = new UploadTicketLoader(onTicketLoadedFirst);		
		}
		
		private function onTicketLoadedFirst(errCode:String):void
		{
			if(errCode!='0')
			{
				uploading = false;
				JSutil.sendToJS('Error',"Error getting upload ticket, server returned "+errCode);
				return;
			}
			startItemsUpload();
		}
		
		private function startItemsUpload():void
		{
			while(m_itemsWaiting.length>0)
				m_itemsWaiting.pop();
			while(m_itemsActive.length>0)
				m_itemsActive.pop();
			for(var i:int=0; i<m_itemUploaders.length; i++)
				m_itemsWaiting.push(m_itemUploaders[i]);
			uploadNextFiles();			
		}
		
		private function onItemUploadSucceeded(item:ItemUploader):void
		{
			if(uploading==false)
				return;
			removeFromAr(m_itemsActive, item);
			if(m_itemsActive.length==0 && m_itemsWaiting.length==0)
			{
				finalizeUpload();
				return;
			}
			uploadNextFiles();
		}

		private function onItemUploadError(item:ItemUploader, ev:Event):void
		{
			if(uploading==false)
				return;
			uploading = false;
			removeFromAr(m_itemsActive, item);
			while(m_itemsActive.length>0)
				m_itemsActive.pop().stop();
			JSutil.sendToJS("Error", ev);
		}

		private function removeFromAr(ar:Array, item:ItemUploader):void
		{
			var i:int = ar.indexOf(item); 
			if(i<0)
				return;
			ar.splice(i, 1);
		}
		
		private function uploadNextFiles():void
		{
			while(m_itemsWaiting.length>0 && m_itemsActive.length<MAX_PARALLEL_UPLOADS)
			{
				var item:ItemUploader = m_itemsWaiting.pop();
				m_itemsActive.push(item);
				('uploading '+UploaderConfig.mediaS)
				item.upload();
				progressUpdate();
			}
		}
		
		/**
		 * Upload files to Media Server
		 */
		private function finalizeUpload():void
		{
			m_finalizer = new UploadFinalizer(m_itemUploaders, onFinalized);			
		}
		
		private function onFinalized(success:Boolean, msg:String=""):void
		{
			m_uploading = false;
			if(success)
			{
				trace("MediaUploader.finalizedUpload - SUCCESS");
				JSutil.sendToJS("uploadComplete", msg);
				return;
			}
			trace("MediaUploader.finalizedUpload - ERROR - "+msg);
			JSutil.sendToJS("Error", msg);
		}
		
		/**
		 * start js integration
		 * */		
		private function messageFromJS(message:String,content:Object):void
		{
			switch(message)
			{
				case 'setFileType' :
					_setFileType(content);
					break;
			}
		}
		
		private function _setFileType(fileType:Object):void
		{
			m_labelTxt.htmlText = '<font face="arial" size="15">'+fileType.label+'</font>';
			JSutil.trace2JS("description : " + fileType.description)
			JSutil.trace2JS("Win Ext. : " + fileType.extensions)
			JSutil.trace2JS("Mac Ext. : " + fileType.macExtensions)
			JSutil.trace2JS("MediaS   : " + fileType.mediaS)

			//m_labelTxt.x = (stage.stageWidth  - m_labelTxt.textWidth) / 2;
			//m_labelTxt.y = (stage.stageHeight - m_labelTxt.textHeight) / 2;
			
			UploaderConfig.setFileType( fileType.mediaS || 'media' ,
										fileType.wixType || 'media' ,
										fileType.compType || 'photo' );
			
			var extensions:String = (Capabilities.os.toLowerCase().indexOf("mac") == -1 ? fileType.extensions : fileType.macExtensions);
			var fullDescription:String = fileType.description + " (" + extensions +")";
			
			m_fileFilter = new FileFilter( fullDescription ,fileType.extensions,fileType.macExtensions);
		}
		
		
		private function progressUpdate(item:ItemUploader=null):void
		{		
//			JSutil.sendToJS('progressUpdate', m_itemUploaders.toString());
			JSutil.sendToJS('progressUpdate', m_itemsActive.toString());
		}
	}
}