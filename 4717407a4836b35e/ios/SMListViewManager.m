//
//  SMListViewManager.m
//  demo
//
//  Created by alexk wix on 4/28/16.
//  Copyright © 2016 Facebook. All rights reserved.
//

#import "RCTBridge.h"
#import "UIView+React.h"
#import "RCTConvert.h"
#import "SMListViewManager.h"
#import "SMListView.h"
#import "RCTUIManager.h"


@implementation SMListViewManager


RCT_EXPORT_MODULE()
- (UIView *)view
{
  return [[SMListView alloc] initWithEventDispatcher:self.bridge.eventDispatcher];
}


RCT_EXPORT_METHOD(resetState:(nonnull NSNumber *)reactTag)
{
  [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, SMListView *> *viewRegistry) {
    SMListView *view = viewRegistry[reactTag];
    if (![view isKindOfClass:[SMListView class]]) {
      RCTLogError(@"Invalid view returned from registry, expecting SMListView, got: %@", view);
    } else {
      [view resetState];
    }
  }];
}


RCT_EXPORT_VIEW_PROPERTY(editing, BOOL);
RCT_EXPORT_VIEW_PROPERTY(sections, NSArray);
RCT_EXPORT_VIEW_PROPERTY(viewMode, NSString);
RCT_EXPORT_VIEW_PROPERTY(json, NSString);
RCT_EXPORT_VIEW_PROPERTY(showNewSign, BOOL);
RCT_EXPORT_VIEW_PROPERTY(showSearch, BOOL);
RCT_EXPORT_VIEW_PROPERTY(mediaUrl, NSString);
RCT_EXPORT_VIEW_PROPERTY(mediaPostFix, NSString);
RCT_EXPORT_VIEW_PROPERTY(searchField, NSString);


- (NSArray *) customDirectEventTypes {
  return @[
           @"onMultipleSelect",
           @"onSelect",
           ];
}

@end
